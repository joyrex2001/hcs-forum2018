function Manager(host, port)  {
  this.host  = host
  this.port  = port
  this.games = new Map()
}

// NewGame will store a new game session for given player
Manager.prototype.NewGame = function(player) {
  this.set(player.id,Date.now())
}

// IsValidSession will check if the received game details belongs to a valid
// game.
Manager.prototype.IsValidSession = function(player) {
  if (!player) {
    console.log(`gameover event without player, abuse?`)
    return false
  }
  if (!this.has(player.id)) {
    console.log(`gameover event without active game, abuse?`)
    return false
  }
  return true
}

// IsValidGameOver will check if the a game session exist and if it's playtime
// is within a valid range.
Manager.prototype.IsValidGameOver = function(player,score) {
  if (!this.IsValidSession(player)) {
    console.log(`gameover event received without player object, abuse?`)
    return false
  }
  console.log(`gameover event received ${score} for ${player.id} as ${player.name}`)
  var elapsed = (Date.now()-this.get(player.id))/1000
  if (elapsed<60) {
    console.log(`gameover event received ${elapsed}s, abuse?`)
    this.delete(player.id)
    return false
  }
  this.set(player.id,score)
  return true
}

// IsValidScore will check if the score received is valid for this game.
Manager.prototype.IsValidScore = function(player,score) {
  if (!this.IsValidSession(player)) return false
  var gscore = this.get(player.id)
  this.delete(player.id)
  if (gscore!=score) {
    console.log(`score event received different score as gameover, abuse?`)
    return false
  }
  return true
}

// set will store a key value pair.
Manager.prototype.set = function(k,v) {
  this.games.set(k,v)
}

// get will retrieve the value for given key.
Manager.prototype.get = function(k) {
  return this.games.get(k)
}

// has will check if the key exists.
Manager.prototype.has = function(k) {
  return this.games.has(k)
}

// delete will delete the key value pair for given key.
Manager.prototype.delete = function(k) {
  this.games.delete(k)
}

module.exports = { Manager: Manager }
