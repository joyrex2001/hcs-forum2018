"use strict";

const gulp   = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");

const dest = "./htdocs";

function build() {
  gulp.src([
      "./frontend/js/lib/phaser.min.js",
      "./frontend/js/lib/box2d-plugin-full.js",
      "./frontend/js/*.js",
    ])
    .pipe(concat("game.js"))
    .pipe(uglify({ compress: { hoist_funs: true } }))
    .pipe(gulp.dest(dest));

  gulp.src("./frontend/index.html")
    .pipe(gulp.dest(dest));

  gulp.src("./frontend/images/**/*")
    .pipe(gulp.dest(dest + "/images"));

  gulp.src("./frontend/assets/**/*")
    .pipe(gulp.dest(dest + "/assets"));
}

gulp.task('default', build);

module.exports = build;
