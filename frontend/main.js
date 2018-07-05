var express  = require('express'),
    morgan   = require('morgan'),
    socketio = require('socket.io'),
    http     = require('http'),
    axios    = require('axios'),
    kafka    = require('kafka-node'),
    config   = require('./config')

require('console-stamp')(console,{ pattern: "yyyy-mm-dd'T'HH:MM:ss.l'Z'" })

// highscores is a global variable that contains the latest highscores. This
// variable is updated by the kafka consumer whenever a new highscores message
// is received.
var highscores = [
  { name: "Geordi",   score: 10},
  { name: "Tuvok",    score: 9 },
  { name: "Jadzia",   score: 8 },
  { name: "Leonard",  score: 7 },
  { name: "Tasha",    score: 6 },
  { name: "Sarek",    score: 5 },
  { name: "Benjamin", score: 4 },
  { name: "Guinan",   score: 3 },
  { name: "Wesley",   score: 2 },
  { name: "Pavel",    score: 1 }
]

// healthz will return an ok for monitoring purposes
function healthz(req, res) {
  res.json({ status: 'OK', timestamp: new Date() })
  return
}

// getHighscores will retreive the current highscores from the configured
// highscore service.
function getHighscores() {
  if (!config.highscore_service) {
    console.log("not loading highscores, highscore_service not configured...")
    return
  }
  axios.get(config.highscore_service+'/highscore')
    .then(response => {
      console.log("loaded highscores...")
      highscores = response.data
    })
    .catch(error => {
      console.log(error)
    })
}

// sendScore will push the current score to the highscore service.
function sendScore(score) {
  if (!config.highscore_service) {
    console.log("not sending score, highscore_service not configured...")
    return
  }
  axios.put( config.highscore_service+'/score',
      score, { headers: {"Content-Type": "application/json"} } )
    .then(() => {
      console.log(`send score ${score.score} for ${score.playerId} as ${score.name}`)
    })
    .catch(error => {
      console.log(error)
    })
}

// sendKafka will send a message with given id and data to given topic using
// given producer.
function sendKafka(producer, topic, data) {
  if (!config.enable_kafka) {
    console.log(`ignoring sendKafka(${topic},${id},${data})`)
    return
  }
  let payloads = [ { topic: topic, messages: '*', partition: 0 } ]
  payloads[0].messages = JSON.stringify(data)
  producer.send(payloads, function (err) {
    if (err) { console.error(err) }
  })
}

// updateLocalHighscore will update the local highscore table.
function updateLocalHighscore(player,score) {
    var newHighscores = []
    var added = false
    highscores.forEach(function(d) {
      if (d.score < score && !added) {
        newHighscores.push({ score: score, name: player.name })
        added = true
      }
      newHighscores.push(d)
    })
    highscores = newHighscores.slice(0,10)
}

// eventHandler will handle the events for registered player on given socket.
function eventHandler(io,socket,producer) {
  socket.on('start',function(player, score) {
    console.log(`new game player ${player.id}`)
    sendKafka(producer, "newgame", player)
  })
  socket.on('gameover',function(player, score) {
    console.log(`add score ${score} for ${player.name} (${player.id})`)
    updateLocalHighscore(player, score)
    sendKafka(producer, "score", score)
    sendScore({score: score, playerId: player.id, name: player.name})
    if (!config.enable_kafka) io.emit('highscore',highscores)
  })
}

// main will open the door to the bat-mobile and shouts "let's go!".
function main() {
  // load current highscores
  getHighscores()

  // init http
  var app = express()
  app.use(express.json())
  app.use(morgan('[:date[iso]] [REQ]   :method :url :status :res[content-length] - :remote-addr - :response-time ms'));
  app.use('/', express.static('htdocs'))
  app.get('/healthz', healthz)

  // init websockets
  var server = http.Server(app)
  var io = socketio.listen(server)

  // websocket handler
  io.on('connection',function(socket) {
    socket.on('init',function(player){
      console.log(`connected player ${player.id}`)
      sendKafka(producer, "connect", player)
      socket.emit('highscore',highscores)
      eventHandler(io,socket,producer,player)
      socket.on('disconnect',function(){
        console.log(`disconnected player ${player.id}`)
        sendKafka(producer, "disconnect", player)
      })
    })
  })
  setInterval(() => { io.emit("ping") }, 10000)

  // init kafka
  var client, producer, consumer
  if (config.enable_kafka) {
    client = new kafka.KafkaClient({kafkaHost: config.kafka_servers})
    producer = new kafka.Producer(client)
    consumer = new kafka.Consumer(client,
                                      [{ topic: "highscore" }],
                                      { autoCommit: true,
                                        fetchMaxWaitMs: 1000,
                                        fetchMaxBytes: 1024 * 1024,
                                        encoding: "buffer"
                                      } )

    consumer.on("message", function(message) {
      var buf = new Buffer(message.value, "binary")
      var jsn = buf.toString()
      console.log(`received ${jsn}`)
      highscores = JSON.parse(jsn)
      io.emit('highscore',highscores)
    })
    consumer.on('error', function(err) {
      console.log('error', err)
    })
    process.on('SIGINT', function() {
      consumer.close(true, function() { process.exit() })
    })
  }

  // go for it...
  console.log(`Starting webserver on port ${config.server_port}`)
  server.listen(config.server_port)
}

main()
