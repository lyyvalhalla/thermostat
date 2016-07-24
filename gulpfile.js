var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade')
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    streamify = require('gulp-streamify'),
    sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    buffer = require('vinyl-buffer');

var env = process.env.NODE_ENV || 'development';
var outputDir = "builds/development";

gulp.task('jade', function() {
  return gulp.src('app/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});

gulp.task('js', function() {
  return browserify('app/main')
    .bundle()
    .pipe(source('bundle.js'))
    // .pipe(streamify(uglify()))
    .pipe(buffer())
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
})

gulp.task('sass', function(){
  var config = {};

  if (env === 'development') {
    config.sourceComments = 'map';
  }

  if (env === 'production') {
    config.outputStyle = 'compressed';
  }

  return gulp.src('app/scss/main.scss')
    .pipe(sass(config))
    .pipe(gulp.dest(outputDir + '/css'))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('app/**/*.jade', ['jade']);
  gulp.watch('app/**/*.js', ['js']);
  gulp.watch('app/scss/**/*.scss', ['sass']);

})

gulp.task('connect', function() {
  connect.server({
    root: [outputDir],
    port: 8000,
    livereload: true
  })
});


gulp.task('default',['jade', 'js', 'sass', 'watch', 'connect']);