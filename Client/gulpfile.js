var gulp = require("gulp"),
    src = gulp.src,
    dest = gulp.dest,
    clean = require("gulp-clean"),
    less = require("gulp-less"),
    autoprefixer = require("gulp-autoprefixer"),
    concat = require("gulp-concat"),
    minifyCss = require("gulp-minify-css"),
    html2js = require("gulp-ng-html2js");

var paths = {
    src: {
        base: 'src',
        less: {
            files: 'src/less/**/*.less'
        },
        templates: {
            files: 'src/app/**/*.tpl.html'
        }
    },
    build: {
        base: 'app',
        css: {
            dest: 'app/css',
            files: 'app/css/**/*.css'
        },
        js: {
            dest: 'app',
            files: 'app/**/*.js'
        },
        templates: {
            file: 'templates.js',
            dest: 'app'
        }
    },
    dist: {
        base: 'dist',
        css: {
            dest: 'dist/css',
            file: 'app.min.css'
        },
        js: {
            dest: 'dist',
            file: 'app.min.js'
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
        .pipe(dest(paths.build.css.dest))
});

gulp.task("build:templates", function() {
    return src(paths.src.templates.files)
        .pipe(html2js({
            moduleName: 'templates'
        }))
        .pipe(concat(paths.build.templates.file))
        .pipe(dest(paths.build.templates.dest))
});

gulp.task("build:js", ["build:templates"]);

gulp.task("build", ["build:css", "build:js"]);

gulp.task("dist:css", ["build:css"], function () {
    return src([].concat(paths.vendor.css).concat(paths.build.css.files))
        .pipe(concat(paths.dist.css.file))
        .pipe(minifyCss())
        .pipe(dest(paths.dist.css.dest))
});

gulp.task("dist:js", ["build:js"]);

gulp.task("dist", ["dist:css", "dist:js"]);