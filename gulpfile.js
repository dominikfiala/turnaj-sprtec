'use strict';

var gulp = require('gulp');
var electron = require('electron-connect').server.create();
var gulpCopy = require('gulp-copy');
var browserSync = require("browser-sync").create();
var jeditor = require("gulp-json-editor");

gulp.task("serve-browser", function() {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    ui: false,
    open: false,
    files: ["./src/app.js", "./src/styles.css"],
    startPath: "src/index.html"
  });

  gulp.watch("./src/index.html").on("change", browserSync.reload);
});

gulp.task('serve', function () {
  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['src/app.js', 'src/index.html'], electron.reload);
});

gulp.task('build-manifest', function () {
  return gulp
    .src("build/package.json")
    .pipe(jeditor(function(json) {
      delete json.dependencies;
      return json;
    }))
    .pipe(gulp.dest("build"));
});

gulp.task('build-copy', function () {
  return gulp
    .src([
      "node_modules/bootstrap/dist/css/bootstrap.css",
      "node_modules/jquery/dist/jquery.slim.js",
      "node_modules/popper.js/dist/umd/popper.js",
      "node_modules/bootstrap/dist/js/bootstrap.js",
      "node_modules/vue/dist/vue.js",
      "node_modules/file-saver/FileSaver.js",
      "node_modules/munkres-js/munkres.js",
      "src/app.js",
      "src/main.js",
      "src/index.html",
      "src/icon.ico",
      "package.json"
    ])
    .pipe(gulpCopy('build'));
});

gulp.task('build', gulp.series('build-copy', 'build-manifest'))
