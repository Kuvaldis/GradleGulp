var gulp = require("gulp"),
    path = require("path"),
    gutil = require("gulp-util"),
    rename = require("gulp-rename"),
    less = require("gulp-less"),
    clean = require("gulp-clean"),
    replace = require('gulp-replace'),
    jshint = require("gulp-jshint"),
    concat = require("gulp-concat"),
    ngmin = require('gulp-ngmin'),
    imagemin = require("gulp-imagemin"),
    uglify = require("gulp-uglify");

var jsAll = {
    normal: 'all.js',
    min: 'all.min.js'
};
var paths = {
    src: {
        base: 'src',
        html: 'src/html/**/*.html',
        images: 'src/img/**/*',
        javascript: 'src/js/**/*.js'
    },
    dist: {
        base: 'dist',
        lib: 'dist/lib',
        html: 'dist',
        images: 'dist/img',
        javascript: 'dist/js'
    },
    build: '.build',
    bower: 'bower_components/**'
};

gulp.task("clean", function () {
    return gulp.src([paths.dist.base, paths.build], {read: false})
        .pipe(clean());
});

gulp.task("copy-bower", function () {
    return gulp.src(paths.bower)
        .pipe(gulp.dest(paths.dist.lib));
});

gulp.task("compile:html", function () {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.dist.html));
});

gulp.task("dist:html", function () {
    return gulp.src(paths.src.html)
        .pipe(replace(/\.js/g, ".min.js"))
        .pipe(replace(/\.css/g, ".min.css"))
        .pipe(gulp.dest(paths.dist.html));
});

gulp.task("compile:images", function () {
    return gulp.src(paths.src.images)
        .pipe(gulp.dest(paths.dist.images));
});

gulp.task("dist:images", function () {
    return gulp.src(paths.src.images)
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest(paths.dist.images));
});

gulp.task("compile:javascript", ["update"], function () {
    return gulp.src(paths.src.javascript)
        .pipe(concat(jsAll.normal))
        .pipe(gulp.dest(paths.dist.javascript));
});

gulp.task("dist:javascript", ["update"], function () {
    return gulp.src(paths.src.javascript)
        .pipe(concat(jsAll.min))
        .pipe(gulp.dest(paths.dist.javascript))
        .pipe(ngmin())
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.javascript));
});

gulp.task("compile", ["copy-bower", "compile:html", "compile:images", "compile:javascript"]);

gulp.task("dist", ["copy-bower", "dist:html", "dist:images", "dist:javascript"]);


function compileLess() {
    return gulp.src(SRC_LESS_ALL)
        .pipe(less({ paths: [ path.join(SRC_LESS_BASE, "includes") ] }))
        .pipe(gulp.dest(DIST_LESS));
}

gulp.task("compile:less", ["update"], function () {
    return compileLess();
});

// Minify the CSS
gulp.task("dist:less", ["update"], function () {
    return compileLess()
        .pipe(rename({ suffix: ".min" }))
        .pipe(require('gulp-minify-css')())
        .pipe(gulp.dest(DIST_LESS));
});


// Server that serves static content from DIST
gulp.task("server", ["compile"], function (next) {
    var port = process.env.PORT || 5000;
    var connect = require("connect");
    var server = connect();
    server.use(connect.static(DIST)).listen(port, next);
    gutil.log("Server up and running: http://localhost:" + port);
});


// Auto-Reloading Development Server
gulp.task("dev", ["server"], function () {

    gulp.watch(SRC_ALL, ["compile"]);
    gulp.watch("bower.json", ["copy-bower"]);

    var lrserver = require("gulp-livereload")();

    gulp.watch(DIST_ALL).on("change", function (file) {
        lrserver.changed(file.path);
    });

});

gulp.task("prod", ["server", "dist"]);