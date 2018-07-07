var kafka = require('kafka-node')

// Client will construct a new (kafka)Client object connexting to given
// comma seperated list of bootstrap-hosts.
function Client(host, options)  {
  this.host      = host
  this.options   = options || { Reconnect: 1000 }
  this.client    = null
  this.producer  = null
  this.reconnect = null
  this.connected = false
  this.consumers = new Map()
}

// Consume will add a consumer (function handler) for given topic.
Client.prototype.Consume = function(topic, handler) {
  var self = this

  var client = new kafka.KafkaClient({kafkaHost: this.host})
  var consumer = new kafka.Consumer(client,
                                    [{ topic: topic }],
                                    { autoCommit: true,
                                      fetchMaxWaitMs: 1000,
                                      fetchMaxBytes: 1024 * 1024,
                                      encoding: "buffer"
                                    } )
  console.log(`consuming ${topic} from kafka ${this.host}`)

  function reconnect() {
    if ( self.consumers.get("reconnect") == null) {
      console.log(`kafka reconnect`)
      self.consumers.set("reconnect", setTimeout( () => {
        self.Consume(topic, handler)
      }, self.options.Reconnect) )
    }
  }
  this.consumers.set("reconnect", null)

  client.on("error",err => {
    console.log(`kafka bus error ${err}`)
    client.close()
    reconnect(self)
  })

  client.on("close",() => { reconnect() })

  consumer.on("message", message => { handler(message) })
}

// Connect will connect to the kafka message bus to enable sending messages
// with the Send method.
Client.prototype.Connect = function (host) {
  var self = this

  console.log(`connecting to kafka ${this.host}`)
  this.client = new kafka.KafkaClient({kafkaHost: this.host})
  this.producer = new kafka.Producer(this.client)
  this.connected = true
  this.reconnect = null

  function reconnect() {
    if (self.reconnect == null) {
      console.log(`kafka reconnect`)
      self.reconnect =
        setTimeout( () => { self.Connect(host) }, self.options.Reconnect )
    }
  }

  this.client.on("error", err => {
    console.log(`kafka bus error ${err}`)
    self.producer.close()
    self.client.close()
    reconnect()
  })

  this.producer.on("error",err => {
    console.log(`kafka bus error ${err}`)
    self.producer.close()
    self.client.close()
    reconnect()
  })

  this.client.on("close",() => {
    self.producer.close()
    reconnect()
  })
}

// Send will send given message to the kafka topic.
Client.prototype.Send = function (topic, data) {
  if (!this.connected) this.Connect()
  let payloads = [ { topic: topic, messages: '*', partition: 0 } ]
  payloads[0].messages = JSON.stringify(data)
  console.log(`send ${payloads[0].messages} to topic ${topic}`)
  this.producer.send(payloads, err => {
    if (err) { console.error(err) }
  })
}

// TODO: maybe also send keyed messages? ;-)

module.exports = { Client: Client }
