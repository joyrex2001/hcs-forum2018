var express  = require('express'),
    morgan   = require('morgan'),
    socketio = require('socket.io'),
    http     = require('http'),
    kafka    = require('kafka-node'),
    config   = require('./config')

require('console-stamp')(console,{ pattern: "yyyy-mm-dd'T'HH:MM:ss.l'Z'" })

// highscores is a global variable that contains the latest highscores. This
// variable is updated by the kafka consumer whenever a new highscores message
// is received.
var highscores = [
  { name: "Geordi",   playerId: "undef", score: 10},
  { name: "Tuvok",    playerId: "undef", score: 9 },
  { name: "Jadzia",   playerId: "undef", score: 8 },
  { name: "Leonard",  playerId: "undef", score: 7 },
  { name: "Tasha",    playerId: "undef", score: 6 },
  { name: "Sarek",    playerId: "undef", score: 5 },
  { name: "Benjamin", playerId: "undef", score: 4 },
  { name: "Guinan",   playerId: "undef", score: 3 },
  { name: "Wesley",   playerId: "undef", score: 2 },
  { name: "Pavel",    playerId: "undef", score: 1 }
]

// healthz will return an ok for monitoring purposes
function healthz(req, res) {
  res.json({ status: 'OK', timestamp: new Date() })
  return
}

// sendKafka will send a message with given id and data to given topic using
// given producer.
function sendKafka(producer, topic, id, data) {
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
        newHighscores.push({ score: score, playerId: player.id, name: player.name })
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
    sendKafka(producer, "newgame", player.id, player)
  })
  socket.on('gameover',function(player, score) {
    console.log(`add score ${score} for ${player.name} (${player.id})`)
    updateLocalHighscore(player,score)
    sendKafka(producer, "score", player.id, score)
    if (!config.enable_kafka) io.emit('highscore',highscores)
  })
}

// main will open the door to the bat-mobile and shouts "let's go!".
function main() {
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
      sendKafka(producer, "connect", player.id, player)
      socket.emit('highscore',highscores)
      eventHandler(io,socket,producer,player)
      socket.on('disconnect',function(){
        console.log(`disconnected player ${player.id}`)
        sendKafka(producer, "disconnect", player.id, player)
      })
    })
  })
  setInterval(() => { io.emit("ping") }, 10000)

  // init kafka
  var client, producer, consumer
  if (config.enable_kafka) {
    client = new kafka.Client(config.kafka_servers)
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
      highscores = JSON.parse(buf.toString())
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
