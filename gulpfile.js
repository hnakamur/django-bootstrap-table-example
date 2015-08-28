var gulp = require('gulp');

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
