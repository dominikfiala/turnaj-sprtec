var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('bundle-js', function() {
  return gulp.src([
    './node_modules/vue/dist/vue.min.js',
    './node_modules/jquery/dist/jquery.slim.min.js',
    './node_modules/popper.js/dist/umd/popper.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './app.js'
  ])
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('./'));
});

gulp.task('bundle-css', function() {
  return gulp.src([
    './node_modules/bootstrap/dist/css/bootstrap.min.css'
  ])
  .pipe(concat('bundle.css'))
  .pipe(gulp.dest('./'));
});

gulp.task('bundle', ['bundle-js', 'bundle-css']);
