// Websocket client

var wsc = {
  socket: null,
  highscore: [],
  ping: null,
  timeout: 10000,
  player: null,
  score: null,
  backoff: 250,
  // connection management
  connect: function() {
    var self = this;
    if( self.socket ) {
      self.socket.destroy();
      delete self.socket;
      self.socket = null;
    }
    this.socket = io.connect( undefined, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax : 5000,
      reconnectionAttempts: Infinity
    } );
    this.socket.on( 'connect', function () {
      console.log( 'connected to server' );
      self.socket.emit('init', self.player);
      self.backoff = 250;
    } );
    this.socket.on( 'disconnect', function () {
      console.log( 'disconnected from server' );
      window.setTimeout( 'wsc.connect()', self.backoff );
      self.backoff = self.backoff<self.timeout? self.backoff+250: self.timeout;
    } );
    this.socket.on( 'highscore', function (data) {
      self.highscore = data;
    } );
    this.socket.on( 'score', function (score) {
      return ((self.score&score)==self.score)? self.socket.emit('score',player, score) : 0;
    } );
    this.socket.on( 'ping', function (data) {
      self.ping = Date.now();
    } );
    // start watchdog
    this.ping = Date.now();
    this.watchDog();
  },
  watchDog: function() {
    var self = this;
    if (!this.isConnected()) {
      console.log( 'ping timeout' );
      this.connect();
    }
    window.setTimeout( function() { self.watchDog() }, this.timeout+1000);
  },
  isConnected: function() {
    return ( (Date.now()-this.ping) < this.timeout );
  },
  startGame: function(player) {
    this.socket.emit('start', player);
  },
  getHighscores: function() {
    return this.highscore;
  },
  sendScore: function(player, score) {
    this.score = score;
    this.socket.emit('gameover',player, score);
  }
};
