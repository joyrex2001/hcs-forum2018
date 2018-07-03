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
  var names = [
      "HedgeH0g2", "ButterQuest", "Skittle Mine", "Bad Bunny", "Willow Dragon",
      "SmartieQuest", "Chip Queen", "Reed Lady", "DriftDetector", "White Snare",
      "Night Magnet", "RoarSweetie", "Poppy Coffee", "Polar Bee", "Racy Lion",
      "Light Lion", "Subzero", "Chasm Face", "Mint Ness", "DuckDuck",
      "Mum Mary", "LifeRobber", "Killah Goose", "Daffy Girl", "EerieMizz",
      "Acid Gosling", "Fennel Dove", "Jelly Camber", "Arsenic Coo", "Cool Iris",
      "Alley Frog", "Gullyway", "Snow Cream", "Trash Sling", "SunVolt",
      "NaturalGold", "SpellTansy", "Lava Nibbler", "TulipCake", "Devil Blade",
      "Fire Fish", "Twin Blaze", "Back Bett", "Bug Fire", "NoiseFire",
      "Koi Diva", "Widow Curio", "TrixiePhany", "Ember Rope", "Pink Hopper",
      "BlacKitten", "Congo Wire", "Club Nola", "Devil Chick", "Reno Monarch",
      "Fire Feline", "Flame OUT", "Nutmeg Riot", "RedMouth", "VenusLion",
      "NemesisX", "BloodEater", "Lunar Treat", "Feral Mayhem", "Terror Master",
      "Spunky Comet", "Green Ghost", "Metal Star", "Pearl Girl", "LunaStar",
      "Star Sword", "Cupid Dust", "Winter Bite", "Sass Burst", "MicroStar",
      "Fire Bite", "Mud Eye", "Starshine", "StormCake", "Twister Hero",
      "Star Scratch", "RetroMirage", "DakotaBliss", "Blackfire", "GeneCuffs",
      "CirrusFlash", "Paris Boost", "StarZen", "PepperBurst", "London Fox",
      "Demo Zero", "Tokyo Dream", "Lucky Aurora", "Twisty Dew", "Dallas Burn",
      "Bang Shift", "Nueva Nova", "Ginger Chaos", "Ship Whip", "CloudFrenzy",
      "FireBerry", "Pink Stream", "Roma Kabuki", "Light Despair", "SunnySnap",
      "Miss Nova", "Athens Fire", "Aqua Monsoon", "Virgo Moon", "Kawaii Red",
      "Sun Leo", "X-Dew", "Cali Yacht", "Moon Radar", "Icy Avenger",
      "Lilac Lizard", "Rosie Bird", "Dez North", "Jetta Talent", "Silver Rose",
      "Moon Laser", "Gold Bentley", "Daisy Stick", "Pixie Taze", "Pocket Mazda",
      "Domino Combat", "Wild Tesla", "Sky Dahlia", "FLAK Angel", "Gothic Gucci",
      "Venom Petunia", "SWAT Honey", "Pepper Prada", "Lady Petal", "Dove Dolce",
      "Dance Bloom", "Orange Teflon", "VersaceCat", "Lady Q", "Bambi Benz"
  ]

  function rnd(list) {
    var i = Math.floor(Math.random() * list.length);
    return list[i];
  }

  return rnd(names)
}
