var gulp = require('gulp');
var sass = require('gulp-sass');

var dest = '../public/src/';

function styles() {
    return gulp.src('*.scss')
        .pipe(sass())
        .pipe(gulp.dest(dest));
}

function dist() {
    return gulp.src([
        'tin-slide.js', 
        '*.html', 
        '*.jpg'
    ]).pipe(gulp.dest(dest));
}

function watch() {
    return gulp.watch(['*.html', '*.scss', '*.js', '*.jpg'], gulp.series(styles, dist));
}

exports.styles = styles;
exports.dist = dist;
exports.watch = watch;
exports.default = dist;
