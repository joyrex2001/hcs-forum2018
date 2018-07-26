var express    = require('express'),
    epimetheus = require('epimetheus'),
    prometheus = require('prom-client'),
    morgan     = require('morgan'),
    socketio   = require('socket.io'),
    http       = require('http'),
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

// games is a global variable that contains the active players and is used to
// verify if the score that has been send belongs to a game.
var games = new Map()

// healthz will return an ok for monitoring purposes
function healthz(req, res) {
  res.json({ status: 'OK', timestamp: new Date() })
  return
}

// sendKafka will send a message with given id and data to given topic using
// given kafka client.
function sendKafka(bus, topic, data) {
  if (!config.enable_kafka) {
    var message = JSON.stringify(data)
    console.log(`ignoring sendKafka(${topic},${message})`)
    return
  }
  bus.Send(topic, data)
}

// isValidSession will check if the received game details belongs to a valid
// game.
function isValidSession(player) {
  if (!player) {
    console.log(`gameover event without player, abuse?`)
    return false
  }
  if (!games.has(player.id)) {
    console.log(`gameover event without active game, abuse?`)
    return false
  }
  return true
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
    games.set(player.id,Date.now())
  })
  socket.on('gameover',function(player, score) {
    if (!isValidSession(player)) {
      console.log(`gameover event received without player object, abuse?`)
      return
    }
    console.log(`gameover event received ${score} for ${player.id} as ${player.name}`)
    var elapsed = (Date.now()-games.get(player.id))/1000
    if (elapsed<60) {
      console.log(`gameover event received ${elapsed}s, abuse?`)
      socket.emit('score',Math.floor(Math.random()*85))
      games.delete(player.id)
      return
    }
    games.set(player.id,score)
    socket.emit('score',score)
  })
  socket.on('score',function(player, score) {
    console.log(`score event received ${score} for ${player.id} as ${player.name}`)
    if (!isValidSession(player)) return
    var gscore = games.get(player.id)
    games.delete(player.id)
    if (gscore!=score) {
      console.log(`score event received different score as gameover, abuse?`)
      return
    }
    console.log(`add score ${score} for ${player.id} as ${player.name}`)
    updateLocalHighscore(player, score)
    sendKafka(bus, "score", {score: score, playerId: player.id, name: player.name})
    if (!config.enable_kafka) io.emit('highscore',highscores)
    prEndGame.inc(1)
  })
}

// main will open the door to the bat-mobile and shouts "let's go!".
function main() {
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
    process.on('SIGINT', () => {
        bus.Close()
        process.exit()
    })
  }

  // init http
  var app = express()
  app.use(express.json())
  app.use(morgan('[:date[iso]] [REQ]   :method :url :status :res[content-length] - :remote-addr - :response-time ms', {
    skip: function (req, res) {
        if (req.url == '/healthz') return true
        return false
    }
  }))
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