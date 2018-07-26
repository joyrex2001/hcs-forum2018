const redis = require('redis')
const {promisify} = require('util');

function Manager(host, port)  {
  this.host  = host
  this.port  = port
  this.games = new Map()
  this.redis = null
  if (host && host.length > 0) {
    this.redis = redis.createClient({
      retry_strategy: function (options) {
        return Math.min(options.attempt * 100, 3000);
      }
    })
    this.getAsync = promisify(this.redis.get).bind(this.redis)
    this.redis.on('connect', function() {
      console.log(`connected to redis ${host}:${port}`)
    })
    this.redis.on('error', function (err) {
      console.log(`redis error ${err}`);
    })
  }
}

// NewGame will store a new game session for given player
Manager.prototype.NewGame = function(player) {
  this.set(player.id,Date.now())
}

// IsValidSession will check if the received game details belongs to a valid
// game.
Manager.prototype.IsValidSession = async function(player) {
  if (!player) {
    console.log(`gameover event without player, abuse?`)
    return false
  }
  if (!(await this.has(player.id))) {
    console.log(`gameover event without active game, abuse?`)
    return false
  }
  return true
}

// IsValidGameOver will check if the a game session exist and if it's playtime
// is within a valid range.
Manager.prototype.IsValidGameOver = async function(player,score) {
  if (!await this.IsValidSession(player)) {
    console.log(`gameover event received without player object, abuse?`)
    return false
  }
  console.log(`gameover event received ${score} for ${player.id} as ${player.name}`)
  var elapsed = (Date.now()-(await this.get(player.id)))/1000
  if (elapsed<60) {
    console.log(`gameover event received ${elapsed}s, abuse?`)
    this.delete(player.id)
    return false
  }
  this.set(player.id,score)
  return true
}

// IsValidScore will check if the score received is valid for this game.
Manager.prototype.IsValidScore = async function(player,score) {
  if (!await this.IsValidSession(player)) return false
  var gscore = await this.get(player.id)
  this.delete(player.id)
  if (gscore!=score) {
    console.log(`score event received different score as gameover, abuse?`)
    return false
  }
  return true
}

// set will store a key value pair.
Manager.prototype.set = function(k,v) {
  if (this.redis) {
    this.redis.set(k,v)
  }
  this.games.set(k,v)
}

// get will retrieve the value for given key.
Manager.prototype.get = async function(k) {
  if (this.redis) {
    var val = await this.getAsync(k)
    return val
  }
  return this.games.get(k)
}

// has will check if the key exists.
Manager.prototype.has = async function(k) {
  if (this.redis) {
    var val = await this.get(k)
    if (val && val.length>0) return true
    return false
  }
  return this.games.has(k)
}

// delete will delete the key value pair for given key.
Manager.prototype.delete = function(k) {
  if (this.redis) {
    this.redis.set(k,"")
  }
  this.games.delete(k)
}

module.exports = { Manager: Manager }
