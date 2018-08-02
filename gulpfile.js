'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var cleanCSS = require('gulp-clean-css');
var exec = require('child_process').exec
var prettify = require('gulp-prettify');
var rmEmptyLines = require('gulp-remove-empty-lines');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

var paths = {
  build: '_site',
  css: 'css',
  sass: ['css'],
  scripts: ['js']
};

var sassFiles = [
  'css/**/*.{css,scss,sass}',
  '_sass/**/*'
]

var jsFiles = [
  'js/**/*.js'
];

var jekyllFiles = [
  '*.{html,yml,md}',
  '_posts/*.{markdown,md}',
  '_layouts/*.html',
  '_includes/*.html'
];

function errorHandler(error) {
  console.error(String(error));
  this.emit('end');
  browserSync.notify('Error');
}

gulp.task('jekyll-build', function(cb) {
  exec('bundle exec jekyll build', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('jekyll-rebuild', gulp.series('jekyll-build', function(done) {
  browserSync.reload(), done();
}));

gulp.task('js', function() {
  return gulp.src(paths.scripts + '/**/*.js')
    .pipe(gulp.dest(paths.build + '/' + paths.scripts))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('prettify', gulp.series('jekyll-build', function() {
  return gulp.src([paths.build + '/**/*.html'])
    .pipe(prettify({
      indent_inner_html: true,
      indent_with_tabs: false,
      indent_size: 2
    }))
    .pipe(rmEmptyLines())
    .pipe(gulp.dest(paths.build));
}));

gulp.task('minify', function() {
  return gulp.src([paths.build + '/' + paths.css + '/*.css'])
    .pipe(
      cleanCSS({
        debug: true,
        keepBreaks: true,
        keepSpecialComments: false
      }, function(details) {
        console.log(details.name + ': ' + details.stats.originalSize + ' ==> ' + details.stats.minifiedSize);
      }))
    .pipe(gulp.dest(paths.build + '/' + paths.css))
});


gulp.task('serve', function(done) {

 browserSync.init({
   server: {
     baseDir: paths.build
   }
 });

 gulp.watch(sassFiles, gulp.parallel('jekyll-rebuild')).on('change', browserSync.reload);
 gulp.watch(jsFiles, gulp.parallel('js')).on('change', browserSync.reload);
 gulp.watch(jekyllFiles, gulp.parallel('jekyll-rebuild')).on('all', browserSync.reload);
 return console.log('Serve function ran'), done();
});

gulp.task('travis', gulp.series(gulp.parallel('jekyll-build', 'js', 'prettify', 'minify'), function(done) {
  return console.log('complete'), done();
}));

gulp.task('default', gulp.series('serve'));