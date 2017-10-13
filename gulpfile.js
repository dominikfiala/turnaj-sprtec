var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('bundle', function() {
  return gulp.src([
    './node_modules/vue/dist/vue.min.js',
    './node_modules/jquery/dist/jquery.slim.min.js',
    './node_modules/popper.js/dist/umd/popper.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './app.js',
  ])
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('./'));
});
