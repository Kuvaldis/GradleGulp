var gulp = require("gulp"),
    clean = require("gulp-clean");

var jsAll = {
    normal: 'all.js',
    min: 'all.min.js'
};
var paths = {
    src: {
        base: 'src'
    },
    build: {
        base: 'build',
        lib: 'dist/vendor'
    },
    dist: {
        base: 'dist'
    }
};

gulp.task("clean:build", function () {
    return gulp.src([paths.build.base])
        .pipe(clean())
});

gulp.task("clean:dist", function () {
    return gulp.src([paths.dist.base])
        .pipe(clean())
});

gulp.task("clean", ["clean:dist", "clean:build"]);

gulp.task("build", ["clean"]);