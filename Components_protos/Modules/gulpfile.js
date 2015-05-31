var fs = require('fs');
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var babelify = require('gulp-babel');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function () {
  return gulp
    .src(['src/scripts/synth.js','src/scripts/**/*.js'])
	.pipe(sourcemaps.init())
    .pipe(browserify({
      transform: ['babelify']
    }))
    .pipe(concat('synth.js'))
	.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'));
});
gulp.task('watch', function () {
  gulp.watch('src/**/*.js', ['default']);
});