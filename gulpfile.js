'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var licensify = require('licensify');
var fs = require('fs');

gulp.task('copy', ['copy_fonts', 'copy_css']);

gulp.task('copy_fonts', function() {
  gulp.src('node_modules/bootstrap/fonts/**').pipe(gulp.dest('project/bookmarks/static/fonts/'));
});

gulp.task('copy_css', function() {
  gulp.src([
    'node_modules/bootstrap/css/bootstrap.min.css',
    'node_modules/bootstrap/css/bootstrap-theme.min.css',
    'node_modules/bootstrap-table/dist/bootstrap-table.min.css'
  ]).pipe(gulp.dest('project/bookmarks/static/css/'));
});

gulp.task('js', function () {
  var b = browserify({
    debug: true,
  });

  return b
    .add('./project/bookmarks/static_source/js/app.js')
    .plugin(licensify)
    .bundle()
    .on('error', gutil.log)
    .pipe(fs.createWriteStream('./project/bookmarks/static/js/app.js'));
});
