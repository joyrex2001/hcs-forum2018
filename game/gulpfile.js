"use strict";

const gulp   = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");

const dest = "./htdocs";

var js = [
  "./frontend/js/lib/phaser.min.js",
  "./frontend/js/lib/box2d-plugin-full.js",
  "./frontend/js/websock.js",
  "./frontend/js/player.js",
  "./frontend/js/game.js",
  "./frontend/js/util.js"
]

function build() {
  gulp.src(js)
    .pipe(concat("game.js"))
    .pipe(uglify({ compress: { hoist_funs: true } }))
    .pipe(gulp.dest(dest));

  gulp.src("./frontend/*.html")
    .pipe(gulp.dest(dest));

  gulp.src("./frontend/images/**/*")
    .pipe(gulp.dest(dest + "/images"));

  gulp.src("./frontend/assets/**/*")
    .pipe(gulp.dest(dest + "/assets"));
}

function dev() {
  build();
  gulp.watch(js,['build']);
}

gulp.task('default', build);
gulp.task('build', build);
gulp.task('dev', dev);

module.exports = build;
