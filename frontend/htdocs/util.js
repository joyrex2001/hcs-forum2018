// wordwrap emulates PHP’s wordwrap. It takes four arguments; the string to be
// wrapped. The column width (a number, default: 75). The character(s) to be
// inserted at every break. (default: ‘\n’). The cut: a Boolean value (false
// by default). See PHP docs for more info.
// Source: https://j11y.io/snippets/wordwrap-for-javascript/
function wordwrap( str, width, brk, cut ) {
   brk = brk || '\n';
   width = width || 75;
   cut = cut || false;
   if (!str) { return str; }
   var regex = '.{1,' +width+ '}(\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\S+?(\s|$)');
   return str.match( RegExp(regex, 'g') ).join( brk );
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
function randomName() {
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
