var gulp = require("gulp"),
    src = gulp.src,
    dest = gulp.dest,
    clean = require("gulp-clean"),
    less = require("gulp-less"),
    autoprefixer = require("gulp-autoprefixer"),
    concat = require("gulp-concat"),
    minifyCss = require('gulp-minify-css');

var jsAll = {
    normal: 'all.js',
    min: 'all.min.js'
};
var paths = {
    src: {
        base: 'src',
        less: {
            files: 'src/less/**/*.less'
        }
    },
    build: {
        base: 'build',
        css: {
            result: 'build/css',
            files: 'build/css/**/*.css'
        }
    },
    dist: {
        base: 'dist',
        css: {
            file: 'app.min.css',
            result: 'dist/css'
        }
    },
    vendor: {
        css: [
            'vendor/bootstrap/dist/css/bootstrap.css'
        ]
    }
};

gulp.task("clean:build", function () {
    return src([paths.build.base])
        .pipe(clean())
});

gulp.task("clean:dist", function () {
    return src([paths.dist.base])
        .pipe(clean())
});

gulp.task("clean", ["clean:dist", "clean:build"]);

gulp.task("build:css", function () {
    return src(paths.src.less.files)
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(dest(paths.build.css.result))
});

gulp.task("dist:css", ["build:css"], function () {
    return src([].concat(paths.vendor.css).concat(paths.build.css.files))
        .pipe(concat(paths.dist.css.file))
        .pipe(minifyCss())
        .pipe(dest(paths.dist.css.result))
});

gulp.task("build", ["build:css"]);

gulp.task("dist", ["dist:css"]);