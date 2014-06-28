var gulp = require("gulp"),
    src = gulp.src,
    dest = gulp.dest,
    clean = require("gulp-clean"),
    less = require("gulp-less"),
    autoprefixer = require("gulp-autoprefixer"),
    concat = require("gulp-concat"),
    minifyCss = require("gulp-minify-css"),
    html2js = require("gulp-ng-html2js"),
    htmlInject = require("gulp-inject"),
    ngmin = require("gulp-ngmin"),
    uglify = require("gulp-uglify"),
    connect = require("connect"),
    util = require("gulp-util"),
    livereload = require("gulp-livereload");

var paths = {
    src: {
        base: 'src',
        files: 'src/**',
        less: {
            files: 'src/less/**/*.less'
        },
        templates: {
            files: 'src/app/**/*.tpl.html'
        },
        js: {
            files: 'src/app/**/*.js'
        },
        index: {
            file: 'src/index.html'
        }
    },
    build: {
        base: 'app',
        files: 'app/**',
        css: {
            dest: 'app/css',
            files: 'app/css/**/*.css'
        },
        js: {
            dest: 'app/src',
            files: 'app/**/*.js'
        },
        templates: {
            file: 'templates.js',
            dest: 'app'
        },
        index: {
            dest: 'app'
        },
        vendor: {
            dest: 'app/vendor',
            files: {
                css: 'app/vendor/**/*.css',
                js: 'app/vendor/**/*.js'
            }
        }
    },
    dist: {
        base: 'dist',
        css: {
            dest: 'dist/css',
            files: 'dist/**/*.css',
            file: 'app.min.css'
        },
        js: {
            dest: 'dist/js',
            files: 'dist/**/*.js',
            file: 'app.min.js'
        },
        index: {
            dest: 'dist'
        }
    },
    vendor: {
        css: [
            'vendor/bootstrap/dist/css/bootstrap.css'
        ],
        js: [
            'vendor/jquery/dist/jquery.min.js',
            'vendor/bootstrap/dist/js/bootstrap.min.js',
            'vendor/angular/angular.min.js',
            'vendor/angular-bootstrap/ui-bootstrap.min.js',
            'vendor/angular-ui-router/release/angular-ui-router.min.js'
        ]
    }
};

gulp.task("clean:build", function () {
    return src(paths.build.base, {read: false})
        .pipe(clean())
});

gulp.task("clean:dist", function () {
    return src(paths.dist.base, {read: false})
        .pipe(clean())
});

gulp.task("clean", ["clean:dist", "clean:build"]);

gulp.task("build:css", function () {
    return src(paths.src.less.files)
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(dest(paths.build.css.dest))
});

gulp.task("build:templates", function () {
    return src(paths.src.templates.files)
        .pipe(html2js({
            moduleName: 'templates'
        }))
        .pipe(concat(paths.build.templates.file))
        .pipe(dest(paths.build.templates.dest))
});

gulp.task("build:js", function () {
    return src(paths.src.js.files)
        .pipe(dest(paths.build.js.dest))
});

var toPathBuild = function (path) {
    return path.substring(path.indexOf(paths.build.base) + paths.build.base.length)
};

var toPathBuildCss = function (path) {
    return '<link rel="stylesheet" href="' + toPathBuild(path) + '">';
};

var toPathBuildJs = function (path) {
    return '<script src="' + toPathBuild(path) + '"></script>'
};

gulp.task("build:vendor", function () {
    return src([].concat(paths.vendor.css).concat(paths.vendor.js))
        .pipe(dest(paths.build.vendor.dest))
});

gulp.task("build:index", ["build:css", "build:js", "build:templates", "build:vendor"], function () {
    return src(paths.src.index.file)
        .pipe(htmlInject(src(paths.build.vendor.files.css, {read: false}), {
            starttag: '<!-- inject:vendor:css -->',
            transform: toPathBuildCss
        }))
        .pipe(htmlInject(src(paths.build.css.files, {read: false}), {
            starttag: '<!-- inject:app:css -->',
            transform: toPathBuildCss
        }))
        .pipe(htmlInject(src(paths.build.vendor.files.js, {read: false}), {
            starttag: '<!-- inject:vendor:js -->',
            transform: toPathBuildJs
        }))
        .pipe(htmlInject(src(paths.build.js.files, {read: false}), {
            starttag: '<!-- inject:app:js -->',
            transform: toPathBuildJs
        }))
        .pipe(dest(paths.build.index.dest))
});

gulp.task("build", ["build:index"]);

gulp.task("dist:css", ["build:css"], function () {
    return src([].concat(paths.vendor.css).concat(paths.build.css.files))
        .pipe(concat(paths.dist.css.file))
        .pipe(minifyCss())
        .pipe(dest(paths.dist.css.dest))
});

gulp.task("dist:js", ["build:js", "build:templates"], function () {
    return src([].concat(paths.vendor.js).concat(paths.build.js.files))
        .pipe(concat(paths.dist.js.file))
        .pipe(ngmin())
        .pipe(uglify())
        .pipe(dest(paths.dist.js.dest))
});

var toPathDist = function (path) {
    return path.substring(path.indexOf(paths.dist.base) + paths.dist.base.length)
};

var toPathDistCss = function (path) {
    return '<link rel="stylesheet" href="' + toPathDist(path) + '">';
};

var toPathDistJs = function (path) {
    return '<script src="' + toPathDist(path) + '"></script>'
};

gulp.task("dist:index", ["build:index", "dist:css", "dist:js"], function () {
    return src(paths.src.index.file)
        .pipe(htmlInject(src(paths.dist.js.files, {read: false}), {
            starttag: '<!-- inject:app:css -->',
            transform: toPathDistCss
        }))
        .pipe(htmlInject(src(paths.dist.css.files, {read: false}), {
            starttag: '<!-- inject:app:js -->',
            transform: toPathDistJs
        }))
        .pipe(dest(paths.dist.index.dest))
});

gulp.task("dist", ["dist:index"]);

gulp.task("server", ["build"], function (next) {
    var port = 9090;
    var server = connect();
    server.use(connect.static(paths.build.base))
        .use(function (req, res) {
            // todo do someting like nginx try files
            util.log(req.url);
            req.url = '/';
        })
        .listen(port, next);
    util.log("Server up and running: http://localhost:" + port);
});

gulp.task("dev", ["server"], function () {
    gulp.watch(paths.src.files, ["build"]);
    var lr = livereload();
    gulp.watch(paths.build.files).on("change", function (file) {
        lr.changed(file.path);
    });

});