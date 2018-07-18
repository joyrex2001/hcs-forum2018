// Player is the object that represents the player.
function Player() {
  // generate a new player
  this.name = randomName()
  this.id = uuid()
  this.highscore = 0

  // try loading from localstorage
  var player = localStorage.getItem("stcplayer")
  if (player != null) {
    try {
      player = JSON.parse(localStorage.getItem("stcplayer"))
      this.name = player.name
      this.id = player.id
      this.highscore = player.highscore || 0
    } catch(e) {
      console.log("failed loading player "+e)
    }
  }

  // Update wil store the player in the local storage
  this.Update = function() {
    localStorage.setItem("stcplayer",
      JSON.stringify({ name: this.name, id: this.id, highscore: this.highscore }))
  }
}
