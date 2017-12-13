'use strict';

var gulp = require('gulp')
var electron = require('electron-connect').server.create()
var browserSync = require("browser-sync").create();

gulp.task("serve-browser", function() {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    ui: false,
    open: false,
    files: ["./src/app.js", "./src/styles.css"],
    startPath: "src/index.html"
  })

  gulp.watch("./src/index.html").on("change", browserSync.reload);
})

gulp.task('serve', function () {
  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['src/app.js', 'src/index.html'], electron.reload);
})
