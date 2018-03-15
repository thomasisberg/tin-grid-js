const gulp = require('gulp');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel');
const webpack = require('webpack-stream');

function styles()
{
    return gulp.src('resources/sass/*.scss')
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('../../public/example/'))
        // .pipe(rename('main.min.css'))
        // .pipe(cssnano())
        // .pipe(gulp.dest('public/site/templates/assets/css/'));
}

function scripts() {
    return gulp.src([
            'resources/js/main.js'
        ])
        .pipe(sourcemaps.init())
        // .pipe(babel({
		// 	presets: ['@babel/env']
		// }))
        .pipe(webpack())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('../../public/example/'))
        // .pipe(rename('main.min.js'))
        // .pipe(uglify())
        // .pipe(gulp.dest('public/site/templates/assets/js/'));
}

var build = gulp.parallel(styles, scripts);

function watch() {
    gulp.watch('resources/sass/*.scss', styles).on('error', function(error) {
        err(error); 
    });
    gulp.watch('resources/js/*.js', scripts).on('error', function(error) {
        err(error);
    });
    gulp.watch('gulpfile.js', build).on('error', function(error) {
        err(error);
    });
}

function err(error) {
    console.log(error);
}

exports.styles = styles;
exports.scripts = scripts;
exports.build = build;
exports.watch = watch;
exports.default = build;