// Websocket client

var wsc = {
  socket: null,
  highscore: [],
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
    } );
    this.socket.on( 'disconnect', function () {
      console.log( 'disconnected from server' );
      window.setTimeout( 'app.connect()', 5000 );
    } );
    this.socket.on( 'highscore', function (data) {
      self.highscore = data;
    } );
  },
  // events
  startGame: function(player) {
    this.socket.emit('start', player);
  },
  getHighscores: function() {
    return this.highscore;
  },
  sendScore: function(player, score) {
    this.socket.emit('gameover',player, score);
  }
};
