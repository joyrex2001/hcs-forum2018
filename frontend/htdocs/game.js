var game;
var player;

var gameOptions = {
    timeLimit: 60,
    gravity: 2000,
    crateSpeed: 500,
    crateHorizontalRange: 540,
    fallingHeight: 700,
    gameWidth: 640,
    gameHeight: 960
}

var GROUNDHEIGHT;
var CRATEHEIGHT;

window.onload = function() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var ratio = windowHeight / windowWidth;
    if(ratio >= 1){
        if(ratio < 1.5){
            gameOptions.gameWidth = gameOptions.gameHeight / ratio;
        }
        else{
            gameOptions.gameHeight = gameOptions.gameWidth * ratio;
        }
    }
    player = new Player();
    player.Update();
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight, Phaser.CANVAS);
    game.state.add("PlayGame", playGame);
    game.state.start("PlayGame");
    try {
      wsc.connect();
      wsc.startGame(player);
    } catch(e) { console.log(e); }
}

var playGame = function(){};

playGame.prototype = {
    preload:function(){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        game.load.image("ground", "assets/sprites/ground.png");
        game.load.image("sky", "images/background.png");
        game.load.image("crate", "assets/sprites/crate.png");
        game.load.image("title", "assets/sprites/title.png");
        game.load.image("tap", "assets/sprites/tap.png");
        game.load.audio("hit01", ["assets/sounds/hit01.mp3", "assets/sounds/hit01.ogg"]);
        game.load.audio("hit02", ["assets/sounds/hit02.mp3", "assets/sounds/hit02.ogg"]);
        game.load.audio("hit03", ["assets/sounds/hit03.mp3", "assets/sounds/hit03.ogg"]);
        game.load.audio("remove", ["assets/sounds/remove.mp3", "assets/sounds/remove.ogg"]);
        game.load.audio("gameover", ["assets/sounds/gameover.mp3", "assets/sounds/gameover.ogg"]);
        game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");
        game.load.bitmapFont("smallfont", "assets/fonts/smallfont.png", "assets/fonts/smallfont.fnt");
    },
  	create: function(){
        if(!Phaser.Device.desktop){
            game.scale.forceOrientation(false, true);
            game.scale.enterIncorrectOrientation.add(function(){
                game.paused = true;
                document.querySelector("canvas").style.display = "none";
                document.getElementById("wrongorientation").style.display = "block";
            })
            game.scale.leaveIncorrectOrientation.add(function(){
                game.paused = false;
                document.querySelector("canvas").style.display = "block";
                document.getElementById("wrongorientation").style.display = "none";
            })
        }
        this.lastSoundPlayed = Date.now() ;
        this.hitSound = [game.add.audio("hit01"), game.add.audio("hit02"), game.add.audio("hit03")];
        this.gameOverSound = game.add.audio("gameover");
        this.removeSound = game.add.audio("remove");
        this.score = 0;
        GROUNDHEIGHT = game.cache.getImage("ground").height;
        CRATEHEIGHT = game.cache.getImage("crate").height;
        this.firstCrate = true;
        var sky = game.add.image(0, 0, "sky");
        sky.width = game.width;
        sky.height = game.height;
        this.cameraGroup = game.add.group();
        this.crateGroup = game.add.group();
        this.cameraGroup.add(this.crateGroup);
        game.physics.startSystem(Phaser.Physics.BOX2D);
        game.physics.box2d.gravity.y = gameOptions.gravity;
        this.canDrop = true;
        var ground = game.add.sprite(game.width / 2, game.height, "ground");
        ground.y = game.height - ground.height / 2;
        this.movingCrate = game.add.sprite((game.width - gameOptions.crateHorizontalRange) / 2 ,  game.height - GROUNDHEIGHT - gameOptions.fallingHeight, "crate");
        this.movingCrate.anchor.set(0.5);
        this.cameraGroup.add(this.movingCrate);
        var crateTween = game.add.tween(this.movingCrate).to({
            x: (game.width + gameOptions.crateHorizontalRange) / 2
        }, gameOptions.crateSpeed, Phaser.Easing.Linear.None, true, 0, -1, true);
        game.physics.box2d.enable(ground);
        ground.body.friction = 1;
        ground.body.static = true;
        ground.body.setCollisionCategory(1);
        this.cameraGroup.add(ground);

        // set game input
        game.input.onDown.add(this.dropCrate, this);

        // create menu "menuGroup" and display it
        this.attractView = 0;
        this.menuGroup = game.add.group();
        this.attractMode()
  	},
    dropCrate: function(){
        if(this.firstCrate){
            this.clearAttract();
            this.firstCrate = false;
            this.timer = 0;
            this.timerEvent = game.time.events.loop(Phaser.Timer.SECOND, this.tick, this);
            this.timeText = game.add.bitmapText(10, 10, "font", gameOptions.timeLimit.toString(), 72);
        }
        if(this.canDrop && this.timer <= gameOptions.timeLimit){
            this.canDrop = false;
            this.movingCrate.alpha = 0;
            var fallingCrate = game.add.sprite(this.movingCrate.x, this.movingCrate.y, "crate");
            fallingCrate.hit = false;
            game.physics.box2d.enable(fallingCrate);
            fallingCrate.body.friction = 1;
            fallingCrate.body.bullet = true;
            this.crateGroup.add(fallingCrate);
            fallingCrate.body.setCollisionCategory(1);
            fallingCrate.body.setCategoryContactCallback(1, function(b, b2, fixture1, fixture2, contact, impulseInfo){
                var delay = Date.now() - this.lastSoundPlayed;
                if(delay > 200 && this.timer <= gameOptions.timeLimit){
                    this.lastSoundPlayed = Date.now();
                    Phaser.ArrayUtils.getRandomItem(this.hitSound).play();
                }
                if(!b.sprite.hit){
                    b.sprite.hit = true;
                    b.bullet = false;
                    this.getMaxHeight();
                }
            }, this);
        }
    },
    update: function(){
        this.crateGroup.forEach(function(i){
            if(i.y > game.height + i.height){
                if(!i.hit){
                    this.getMaxHeight();
                }
                i.destroy();
            }
        }, this);
    },
    scaleCamera: function(cameraScale){
        var moveTween = game.add.tween(this.cameraGroup).to({
            x: (game.width - game.width * cameraScale) / 2,
            y: game.height - game.height * cameraScale,
        }, 200, Phaser.Easing.Quadratic.IN, true);
        var scaleTween = game.add.tween(this.cameraGroup.scale).to({
            x: cameraScale,
            y: cameraScale,
        }, 200, Phaser.Easing.Quadratic.IN, true);
        scaleTween.onComplete.add(function(){
            this.canDrop = true;
            this.movingCrate.alpha = 1;
        }, this)
    },
    getMaxHeight: function(){
        var maxHeight = 0
        this.crateGroup.forEach(function(i){
            if(i.hit){
                var height = Math.round((game.height - GROUNDHEIGHT - i.y - CRATEHEIGHT / 2) / CRATEHEIGHT) + 1;
                maxHeight = Math.max(height, maxHeight);
            }
        }, this);
        this.movingCrate.y = game.height - GROUNDHEIGHT - maxHeight * CRATEHEIGHT - gameOptions.fallingHeight;
        var newHeight = game.height + CRATEHEIGHT * maxHeight;
        var ratio = game.height / newHeight;
        this.scaleCamera(ratio);
    },
    tick: function(){
        this.timer++;
        this.timeText.text = (gameOptions.timeLimit - this.timer).toString()
        if(this.timer > gameOptions.timeLimit){
            game.time.events.remove(this.timerEvent);
            this.movingCrate.destroy();
            this.timeText.destroy();
            game.time.events.add(Phaser.Timer.SECOND * 2, function(){
                this.crateGroup.forEach(function(i){
                    i.body.static = true;
                }, true)
                this.removeEvent = game.time.events.loop(Phaser.Timer.SECOND / 10, this.removeCrate, this);
            }, this);
        }
    },
    removeCrate: function(){
        if(this.crateGroup.children.length > 0){
            var tempCrate = this.crateGroup.getChildAt(0);
            var height = Math.round((game.height - GROUNDHEIGHT - tempCrate.y - CRATEHEIGHT / 2) / CRATEHEIGHT) + 1;
            this.score += height;
            this.removeSound.play();
            var crateScoreText = game.add.bitmapText(tempCrate.x, tempCrate.y, "smallfont", height.toString(), 36);
            crateScoreText.anchor.set(0.5);
            this.cameraGroup.add(crateScoreText);
            tempCrate.destroy();
        }
        else{
            game.time.events.remove(this.removeEvent);
            this.gameOverSound.play();
            var scoreText = game.add.bitmapText(game.width / 2, game.height / 5, "font", "YOUR SCORE", 72);
            scoreText.anchor.set(0.5);
            var scoreDisplayText = game.add.bitmapText(game.width / 2, game.height / 5 + 140, "font", this.score.toString(), 144);
            scoreDisplayText.anchor.set(0.5);
            this.handleHighscore()
            game.time.events.add(Phaser.Timer.SECOND * 5, function(){
                game.state.start("PlayGame");
            }, this);
        }
    },
    showTitle: function(){
      this.menuGroup.destroy();
      this.menuGroup = game.add.group();
      var tap = game.add.sprite(game.width / 2, game.height / 2, "tap");
      tap.anchor.set(0.5);
      this.menuGroup.add(tap);
      var title = game.add.image(game.width / 2, tap.y - 470, "title");
      title.anchor.set(0.5, 0);
      this.menuGroup.add(title);
      var hiScoreText = game.add.bitmapText(game.width / 2, game.height - 74, "smallfont", "YOUR BEST SCORE", 24);
      hiScoreText.anchor.set(0.5);
      this.menuGroup.add(hiScoreText);
      var hiScore = game.add.bitmapText(game.width / 2, game.height - 20, "font", player.highscore.toString(), 72);
      hiScore.anchor.set(0.5);
      this.menuGroup.add(hiScore);
      var tapTween = game.add.tween(tap).to({
          alpha: 0
      }, 150, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
    },
    showInfo: function(){
      this.menuGroup.destroy();
      this.menuGroup = game.add.group();
      var infoTxt =
      "Stack The Containers\n\n"+
      "Dit spel is gemaakt door HCS Company.\n"+
      "Wij geloven in de kunst van de eenvoud.\n"+
      "Het is onze visie dat eenvoud het middel\n"+
      "is te transformeren naar een digitale\n"+
      "organisatie. Of het nu gaat om de inrichting\n"+
      "van IT of de manier waarop we samenwerken,\n"+
      "we hebben het met elkaar de afgelopen decennia\n"+
      "nodeloos complex gemaakt. Door de gecreëerde\n"+
      "samenhang, generalisatie en over-organisatie\n"+
      "missen we de benodigde snelheid en wendbaarheid\n"+
      "om ons continu optimaal af te stemmen op de\n"+
      "veranderingen om ons heen. HCS Company brengt\n"+
      "eenvoud in automatisering..\n";
      var text = this.game.add.bitmapText(game.width / 2, 100, "font", infoTxt, 24);
      text.anchor.set(0.5, 0);
      this.menuGroup.add(text);
    },
    showTopscores: function(){
      this.menuGroup.destroy();
      this.menuGroup = game.add.group();
      var scoreTxt = "Topscores\n\n";
      var highscores = wsc.getHighscores();
      highscores.forEach(function(s) {
        scoreTxt = scoreTxt + s.name + " :: " + s.score + "\n";
      });
      var text = this.game.add.bitmapText(game.width / 2, 100, "font", scoreTxt, 50);
      text.align = 'center'
      text.anchor.set(0.5, 0);
      this.menuGroup.add(text);
    },
    attractMode: function() {
        switch(this.attractView) {
          case 0: this.showTitle(); break;
          case 1: this.showTopscores(); break;
          case 2: this.showInfo(); break;
        }
        this.attractView = (this.attractView+1)%2; // skip info
        this.attractEvent = game.time.events.add(Phaser.Timer.SECOND * 5, this.attractMode, this);
    },
    clearAttract: function() {
      game.time.events.remove(this.attractEvent)
      this.menuGroup.destroy();
    },
    handleHighscore: function() {
        var highscores = wsc.getHighscores();
        var curScore = this.score;
        var isFamous = highscores.find(function(s) {
          return curScore > s.score;
        });
        if (isFamous) this.askName();
        try { wsc.sendScore(player, this.score); } catch(e) { console.log(e); }
        player.highscore = Math.max(this.score, player.highscore)
        player.Update()
    },
    askName: function() {
        var name = prompt("Nickname", player.name);
        if(name) {
            player.name = name;
            player.Update();
        }
    }
}
