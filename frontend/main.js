var express  = require('express'),
    socketio = require('socket.io'),
    http     = require('http'),
    kafka    = require('kafka-node'),
    config   = require('./config')

// highscores is a global variable that contains the latest highscores. This
// variable is updated by the kafka consumer whenever a new highscores message
// is received.
var highscores = [
  { name: "joyrex2001", id: "undef", score: 10},
  { name: "joyrex2001", id: "undef", score: 9 },
  { name: "joyrex2001", id: "undef", score: 8 },
  { name: "joyrex2001", id: "undef", score: 7 },
  { name: "joyrex2001", id: "undef", score: 6 },
  { name: "joyrex2001", id: "undef", score: 5 },
  { name: "joyrex2001", id: "undef", score: 4 },
  { name: "joyrex2001", id: "undef", score: 3 },
  { name: "joyrex2001", id: "undef", score: 2 },
  { name: "joyrex2001", id: "undef", score: 1 }
]
// healthz will return an ok for monitoring purposes
function healthz(req, res) {
  res.json({ status: 'OK', timestamp: new Date() })
  return
}

// addScore will add a score to the global highscore list
function addScore(producer, player, score) {
  console.log(`add score ${score} for ${player.name} (${player.id})`)
  // send current score to score topic
  let payloads = [ { topic: "score", messages: '*', partition: 0 } ]
  payloads[0].messages = new kafka.KeyedMessage(player.id, JSON.stringify(score))
  producer.send(payloads, function (err, data) {
    if (err) { console.error(err) }
    console.log("published " + data)
  })
}

// eventHandler will handle the events for registered player on given socket.
function eventHandler(socket,producer) {
  socket.emit('scores',highscores)
  socket.on('gameover',function(player, score) {
    if (config.enable_kafka) addScore(producer, player, score)
      //socket.broadcast.emit('scores',highscores)
  })
}

// main will open the door to the bat-mobile and shouts "let's go!".
function main() {
  // init kafka
  var client, producer, consumer
  if (config.enable_kafka) {
    client = new kafka.Client(config.kafka_host+":"+config.zookeeper_port)
    producer = new kafka.Producer(client)
    consumer = new kafka.HighLevelConsumer( client,
                                            [{ topic: "higscore" }],
                                            { autoCommit: true,
                                              fetchMaxWaitMs: 1000,
                                              fetchMaxBytes: 1024 * 1024,
                                              encoding: "buffer"
                                            } )
  }

  // init http
  var app = express()
  app.use(express.json())
  app.use('/', express.static('htdocs'))
  app.get('/healthz', healthz)

  // init websockets
  var server = http.Server(app)
  var io = socketio.listen(server)

  // websocket handler
  io.on('connection',function(socket) {
      socket.on('start',function(player){
        console.log(`connected player ${player.id}`)
          socket.broadcast.emit('newplayer',player)
          eventHandler(socket,producer,player)
          socket.on('disconnect',function(){
            console.log(`disconnected player ${player.id}`)
              io.emit('remove',player)
          })
      })
  })

  // kafka handler
  if (config.enable_kafka) {
    consumer.on("message", function(message) {
      var buf = new Buffer(message.value, "binary")
      highscores = JSON.parse(buf.toString())
      io.emit('scores',highscores)
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
