// Player is the object that represents the player.
function Player() {
  // generate a new player
  this.name = name()
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

// uuid wil generate an uuid
function uuid() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

// name will return a random name
function name() {
  var adjectives = ["adamant", "adroit", "amatory", "animistic", "antic",
   "arcadian", "baleful", "bellicose", "bilious", "boorish", "calamitous", "caustic",
   "cerulean", "comely", "concomitant", "contumacious", "corpulent", "crapulous",
   "defamatory", "didactic", "dilatory", "dowdy", "efficacious", "effulgent",
   "egregious", "endemic", "equanimous", "execrable", "fastidious", "feckless",
   "fecund", "friable", "fulsome", "garrulous", "guileless", "gustatory",
   "heuristic", "histrionic", "hubristic", "incendiary", "insidious", "insolent",
   "intransigent", "inveterate", "invidious", "irksome", "jejune", "jocular",
   "judicious", "lachrymose", "limpid", "loquacious", "luminous", "mannered",
   "mendacious", "meretricious", "minatory", "mordant", "munificent", "nefarious",
   "noxious", "obtuse", "parsimonious", "pendulous", "pernicious", "pervasive",
   "petulant", "platitudinous", "precipitate", "propitious", "puckish",
   "querulous", "quiescent", "rebarbative", "recalcitant", "redolent",
   "rhadamanthine", "risible", "ruminative", "sagacious", "salubrious",
   "sartorial", "sclerotic", "serpentine", "spasmodic", "strident", "taciturn",
   "tenacious", "tremulous", "trenchant", "turbulent", "turgid", "ubiquitous",
   "uxorious", "verdant", "voluble", "voracious", "wheedling", "withering",
   "zealous"];

  var nouns = ["ninja", "chair", "pancake", "statue", "unicorn", "rainbows",
   "laser", "senor", "bunny", "captain", "nibblets", "cupcake", "carrot", "gnomes",
   "glitter", "potato", "salad", "toejam", "curtains", "beets", "toilet",
   "exorcism", "stick figures", "mermaid eggs", "sea barnacles", "dragons",
   "jellybeans", "snakes", "dolls", "bushes", "cookies", "apples", "ice cream",
   "ukulele", "kazoo", "banjo", "opera singer", "circus", "trampoline", "carousel",
   "carnival", "locomotive", "hot air balloon", "praying mantis", "animator",
   "artisan", "artist", "colorist", "inker", "coppersmith", "director", "designer",
   "flatter", "stylist", "leadman", "limner", "make-up artist", "model", "musician",
   "penciller", "producer", "scenographer", "set decorator", "silversmith",
   "teacher", "auto mechanic", "beader", "bobbin boy", "clerk of the chapel",
   "filling station attendant", "foreman", "maintenance engineering", "mechanic",
   "miller", "moldmaker", "panel beater", "patternmaker", "plant operator",
   "plumber", "sawfiler", "shop foreman", "soaper", "stationary engineer",
   "wheelwright", "woodworkers"];

  function rnd(list) {
    var i = Math.floor(Math.random() * list.length);
    return list[i];
  }

  return rnd(adjectives)+' '+rnd(nouns)
}
