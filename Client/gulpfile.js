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
    livereload = require("connect-livereload"),
    tinylr = require('tiny-lr'),
    fs = require("fs"),
    path = require('path');

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
            files: ['app/src/**/*.js', 'app/templates.js']
        },
        templates: {
            file: 'templates.js',
            dest: 'app'
        },
        index: {
            dest: 'app',
            file: 'app/index.html'
        },
        vendor: {
            dest: 'app/vendor',
            base: 'vendor',
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
            files: 'dist/css/**/*.css',
            file: 'app.min.css'
        },
        js: {
            dest: 'dist/js',
            files: 'dist/js/**/*.js',
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
            'vendor/angular/angular.js',
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

var toPathBuild = function (path, vendor) {
    if (vendor) {
        var pathParts = path.split('/');
        var filename = pathParts[pathParts.length - 1];
        return '/' + paths.build.vendor.base + '/' + filename
    }
    return path.substring(path.indexOf(paths.build.base) + paths.build.base.length)
};

var toPathBuildCss = function (path, vendor) {
    return '<link rel="stylesheet" href="' + toPathBuild(path, vendor) + '">';
};

var toPathBuildCssVendor = function(path) {
    return toPathBuildCss(path, true)
};

var toPathBuildCssApp = function(path) {
    return toPathBuildCss(path, false)
};

var toPathBuildJs = function (path, vendor) {
    return '<script src="' + toPathBuild(path, vendor) + '"></script>'
};

var toPathBuildJsVendor = function(path) {
    return toPathBuildJs(path, true)
};

var toPathBuildJsApp = function(path) {
    return toPathBuildJs(path, false)
};

gulp.task("build:vendor", function () {
    return src([].concat(paths.vendor.css).concat(paths.vendor.js))
        .pipe(dest(paths.build.vendor.dest))
});

gulp.task("build:app", ["build:css", "build:js", "build:templates"]);

var buildIndex = function() {
    return src(paths.src.index.file)
        .pipe(htmlInject(src(paths.vendor.css, {read: false}), {
            starttag: '<!-- inject:vendor:css -->',
            transform: toPathBuildCssVendor
        }))
        .pipe(htmlInject(src(paths.build.css.files, {read: false}), {
            starttag: '<!-- inject:app:css -->',
            transform: toPathBuildCssApp
        }))
        .pipe(htmlInject(src(paths.vendor.js, {read: false}), {
            starttag: '<!-- inject:vendor:js -->',
            transform: toPathBuildJsVendor
        }))
        .pipe(htmlInject(src(paths.build.js.files, {read: false}), {
            starttag: '<!-- inject:app:js -->',
            transform: toPathBuildJsApp
        }))
        .pipe(dest(paths.build.index.dest))
};

gulp.task("build:index", ["build:app", "build:vendor"], function () {
    return buildIndex();
});

gulp.task("build:index:dev", ["build:app"], function () {
    return buildIndex();
});

gulp.task("build", ["build:index"]);

gulp.task("build:dev", ["build:index:dev"]);

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

var startServer = function() {
    var port = 4000;
    var server = connect();
    server.use(livereload({port: 4002}))
        .use(connect.static(paths.build.base))
        .use(function(req, res) {
            if (!/.js|.css/.test(req.url)) {
                var stream = fs.createReadStream(paths.build.index.file);
                stream.pipe(res);
            }
        })
        .listen(port);
    util.log("Server up and running: http://localhost:" + port);
};

var lr;
var startLiveReload = function () {
    lr = tinylr();
    lr.listen(4002);
};

function notifyLiveReload(event) {
    var fileName = path.relative(paths.build.base, event.path);
    lr.changed({
        body: {
            files: [fileName]
        }
    });
}

gulp.task("dev", ["build"], function () {
    startServer();
    startLiveReload();
    gulp.watch(paths.build.files, notifyLiveReload);
    gulp.watch(paths.src.files, ["build:dev"]);
});