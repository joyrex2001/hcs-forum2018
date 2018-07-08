var express    = require('express'),
    epimetheus = require('epimetheus'),
    prometheus = require('prom-client'),
    morgan     = require('morgan'),
    socketio   = require('socket.io'),
    http       = require('http'),
    axios      = require('axios'),
    kafka      = require('./kafka'),
    config     = require('./config')

require('console-stamp')(console,{ pattern: "yyyy-mm-dd'T'HH:MM:ss.l'Z'" })

// Prometheus custom metrics
const prNewGame    = new prometheus.Counter({name:'newgame_count', help:'Total start game'})
const prEndGame    = new prometheus.Counter({name:'endgame_count', help:'Total end game'})
const prConnect    = new prometheus.Counter({name:'connect_count', help:'Total connects'})
const prDisconnect = new prometheus.Counter({name:'disconnect_count', help:'Total disconnects'})

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
  if (!config.enable_highscore) {
    console.log("not loading highscores, highscore_service not configured...")
    return
  }
  axios.get(config.highscore_service+'/highscore', { timeout: 1000 })
    .then(response => {
      console.log(`retreived highscores from ${config.highscore_service}`)
      highscores = response.data
    })
    .catch(error => {
      console.log(error)
    })
}

// sendScore will push the current score to the highscore service.
function sendScore(score) {
  if (!config.enable_highscore) {
    console.log("not sending score, highscore_service not configured...")
    return
  }
  axios.put( config.highscore_service+'/score',
      score, {headers: {"Content-Type": "application/json"}, timeout: 1000 })
    .then(() => {
      console.log(`sent score ${score.score} for ${score.playerId} as ${score.name} to ${config.highscore_service}`)
    })
    .catch(error => {
      console.log(error)
    })
}

// sendKafka will send a message with given id and data to given topic using
// given kafka client.
function sendKafka(bus, topic, data) {
  if (!config.enable_kafka) {
    console.log(`ignoring sendKafka(${topic},${id},${data})`)
    return
  }
  bus.Send(topic, data)
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
function eventHandler(io,socket,bus) {
  socket.on('start',function(player, score) {
    console.log(`new game player ${player.id}`)
    sendKafka(bus, "newgame", player)
    prNewGame.inc(1)
  })
  socket.on('gameover',function(player, score) {
    console.log(`add score ${score} for ${player.id} as ${player.name}`)
    updateLocalHighscore(player, score)
    sendKafka(bus, "score", {score: score, playerId: player.id, name: player.name})
    sendScore({score: score, playerId: player.id, name: player.name})
    if (!config.enable_kafka) io.emit('highscore',highscores)
    prEndGame.inc(1)
  })
}

// main will open the door to the bat-mobile and shouts "let's go!".
function main() {
  // load current highscores
  getHighscores()

  // init kafka
  var bus
  if (config.enable_kafka) {
    bus = new kafka.Client(config.kafka_servers, { Reconnect: 2000 })
    bus.Consume("highscore", function(message) {
      var buf = new Buffer(message.value, "binary")
      var jsn = buf.toString()
      console.log(`received ${jsn}`)
      highscores = JSON.parse(jsn)
      io.emit('highscore',highscores)
    })
  }

  // init http
  var app = express()
  app.use(express.json())
  app.use(morgan('[:date[iso]] [REQ]   :method :url :status :res[content-length] - :remote-addr - :response-time ms'));
  app.use('/', express.static('htdocs'))
  app.get('/healthz', healthz)
  epimetheus.instrument(app)

  // init websockets
  var server = http.Server(app)
  var io = socketio.listen(server)

  // websocket handler
  io.on('connection',function(socket) {
    socket.on('init',function(player) {
      console.log(`connected player ${player.id}`)
      sendKafka(bus, "connect", player)
      prConnect.inc(1)
      socket.emit('highscore',highscores)
      eventHandler(io,socket,bus,player)
      socket.on('disconnect',function(){
        console.log(`disconnected player ${player.id}`)
        sendKafka(bus, "disconnect", player)
        prDisconnect.inc(1)
      })
    })
  })
  setInterval(() => { io.emit("ping") }, 10000)

  // go for it...
  console.log(`Starting webserver on port ${config.server_port}`)
  server.listen(config.server_port)
}

main()
