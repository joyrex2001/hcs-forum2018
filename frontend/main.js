var express  = require('express'),
    socketio = require('socket.io'),
    http     = require('http'),
    config   = require('./config')

// healthz will return an ok for monitoring purposes
function healthz(req, res) {
  res.json({ status: 'OK', timestamp: new Date() })
  return
}

// getScores will return the current global highscore list
function getScores() {
  console.log("get scrores")
}

// addScore will add a score to the global highscore list
function addScore(player, score) {
  console.log(`add score ${score} for ${player.name} (${player.id})`)
}

// eventHandler will handle the events for registered player on given socket.
function eventHandler(socket) {
  socket.emit('scores',getScores())

  socket.on('gameover',function(player, score) {
      addScore(player, score)
      socket.broadcast.emit('scores',getScores())
  })
}

// main will open the door to the bat-mobile and shouts "let's go!".
function main() {
  var app = express()
  app.use(express.json())
  app.use('/', express.static('htdocs'))
  app.get('/healthz', healthz)

  var server = http.Server(app);
  var io = socketio.listen(server);

  io.on('connection',function(socket) {
      socket.on('start',function(player){
        console.log(`connected player ${player.id}`)
          socket.broadcast.emit('newplayer',player)
          eventHandler(socket,player)
          socket.on('disconnect',function(){
            console.log(`disconnected player ${player.id}`)
              io.emit('remove',player)
          })
      })
  })

  console.log(`Starting webserver on port ${config.server_port}`);
  server.listen(config.server_port)
}

main()
