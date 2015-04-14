//noinspection JSUnresolvedVariable
/**
 * Date: 3/8/15 11:56 AM
 *
 * ----
 *
 * (c) Okanjo Partners Inc
 * https://okanjo.com
 * support@okanjo.com
 *
 * https://github.com/okanjo/okanjo-js
 *
 * ----
 *
 * TL;DR? see: http://www.tldrlegal.com/license/mit-license
 *
 * The MIT License (MIT)
 * Copyright (c) 2013 Okanjo Partners Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var gulp = require('gulp'),
    path = require('path'),
    fs = require('fs'),
    awspublish = require('gulp-awspublish'),
    bower = require('gulp-bower'),
    bump = require('gulp-bump'),
    concat = require('gulp-concat'),
    fileinclude = require('gulp-file-include'),
    filter = require('gulp-filter'),
    git = require('gulp-git'),
    insert = require('gulp-insert'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    size = require('gulp-size'),
    sourcemaps = require('gulp-sourcemaps'),
    tagVersion = require('gulp-tag-version'),
    uglify = require('gulp-uglify'),
    umd = require('gulp-umd'),
    wrap = require('gulp-wrap'),
    jsStringEscape = require('js-string-escape'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),

    // Auto add vendor prefixes in CSS
    autoprefix= new LessPluginAutoPrefix({ browsers: ["> 5%"] }),

    // Header
    getHeader = function() {
        var metadata = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
        return '/*! ' + metadata.name + ' v' + metadata.version + ' | (c) 2013 Okanjo Partners Inc | ' + metadata.homepage + ' */\n';
    },

    // Version bump + dist update message
    getVersionCommitMessage = function() {
        var metadata = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
        return 'Tagged as v' + metadata.version;
    },

    // Global Okanjo sources, dependencies and polyfills
    sources = [

        // Core
        'src/core.js',
        'src/config.js',
        'src/template.js',
        'src/jsonp.js',

        // Internal dependencies & polyfills
        'lib/polyfill/ie.js',
        'lib/polyfill/console.js',
        'src/cache.js',
        'src/cookie.js',
        'lib/polyfill/json2.js',
        'lib/polyfill/array.every.js',

        // External  dependencies & polyfills
        'build/vendor.js',

        // Apps & Widgets
        'src/metrics.js',
        'src/moat.js',
        'src/widget.js',
        'src/product.js',
        'src/ad.js'
    ],

    // Things that normally expose themselves to the root context, but shouldn't because we need them to not conflict
    vendorSources = [
        'lib/qwery/qwery.js',
        'lib/polyfill/domready.js',
        'lib/mustache.js/mustache.js',
        'build/modal.js'
    ],

    bundleSources = [
        'dist/okanjo.js',
        'dist/okanjo-templates.js'
    ],

    versionFiles = [
        'package.json',
        'bower.json'
    ],

    deployFiles = [
        'dist/okanjo.js',
        'dist/okanjo.min.js',
        'dist/okanjo.min.js.map',

        'dist/okanjo-bundle.js',
        'dist/okanjo-bundle.min.js',
        'dist/okanjo-bundle.min.js.map',

        'dist/okanjo-templates.js',
        'dist/okanjo-templates.min.js',
        'dist/okanjo-templates.min.js.map'

    ],

    modalFiles = [
        'lib/modal/*.js'
    ];

//
// OKANJO.JS ===========================================================================================================
//

gulp.task('deps', function() {
    return gulp.src([])
        .pipe(bower())
});


gulp.task('modal', function() {
    return gulp.src(modalFiles)
        .pipe(concat('modal.js'))
        .pipe(wrap('(function(okanjo) {<%= contents %> okanjo.modal = okanjoModal; })(this);'))
        .pipe(gulp.dest('build'))
});


gulp.task('vendor', ['deps', 'modal'], function() {
    return gulp.src(vendorSources)
        .pipe(concat('vendor.js'))
        .pipe(wrap({ src: 'lib/vendor.js.tpl' }))
        .pipe(gulp.dest('build'))
});


gulp.task('lint', function() {
    return gulp.src(sources)
        .pipe(jshint())
        .pipe(jshint.reporter('default', { verbose: true }));
});


gulp.task('min', ['vendor'], function() {
    var s1 = size(), s2 = size();
    //noinspection JSUnusedGlobalSymbols
    return gulp.src(sources)
        .pipe(sourcemaps.init())
        .pipe(concat('okanjo.js'))
        .pipe(umd({
            exports: function() {
                return 'okanjo';
            },
            namespace: function() {
                return 'okanjo';
            }
        }))
        .pipe(s1)
        .pipe(insert.prepend(getHeader()))
        .pipe(gulp.dest('dist'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(rename('okanjo.min.js'))
        .pipe(s2)
        .pipe(sourcemaps.write('../dist', { sourceRoot: './' }))
        .pipe(gulp.dest('dist'))
        .pipe(notify({
            onLast: true,
            message: function () {
                //noinspection JSUnresolvedVariable
                return 'Okanjo.js – size: ' + s1.prettySize + ', minified: ' + s2.prettySize;
            }
        }));
});

gulp.task('bundle', ['min', 'templatesjs'], function() {
    var s1 = size(), s2 = size();
    return gulp.src(bundleSources)
        .pipe(sourcemaps.init())
        .pipe(concat('okanjo-bundle.js'))
        .pipe(s1)
        .pipe(gulp.dest('dist'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(insert.prepend(getHeader()))
        .pipe(rename('okanjo-bundle.min.js'))
        .pipe(s2)
        .pipe(sourcemaps.write('../dist', { sourceRoot: './' }))
        .pipe(gulp.dest('dist'))
        .pipe(notify({
            onLast: true,
            message: function () {
                //noinspection JSUnresolvedVariable
                return 'Okanjo-Bundle.js – size: ' + s1.prettySize + ', minified: ' + s2.prettySize;
            }
        }));
});

gulp.task('fix-maps', ['bundle'], function() {
    return gulp.src('dist/*.min.js')
        .pipe(replace(/sourceMappingURL=\.\.\/dist\//, 'sourceMappingURL='))
        .pipe(gulp.dest('dist'));
});

//
// TEMPLATES ===========================================================================================================
//


gulp.task('min-mustache-templates', function() {
    return gulp.src('templates/*.mustache')
        .pipe(minifyHTML({
            conditionals: true,
            spare:true,
            cdata:true,
            empty:true,
            loose:false
        }))
        .pipe(gulp.dest('./build/templates/'))
});


gulp.task('min-css-templates', function() {
    return gulp.src('templates/*.less')
        .pipe(less({
            plugins: [autoprefix],
            paths: [ path.join(__dirname, 'templates' ) ]
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./build/templates/'))
});


gulp.task('join-templates', ['min-mustache-templates', 'min-css-templates'], function() {
    return gulp.src("templates/*.js")
        .pipe(fileinclude({
            filters: {
                jsStringEscape: jsStringEscape
            },
            basepath: 'build/templates/'
        }))
        .pipe(gulp.dest('build/templates'))
});


gulp.task('templatesjs', ['join-templates'], function() {
    return gulp.src("build/templates/*.js")
        .pipe(sourcemaps.init())
        .pipe(concat('okanjo-templates.js'))
        .pipe(wrap('(function(okanjo) {<%= contents %>})(okanjo);'))
        .pipe(insert.prepend(getHeader()))
        .pipe(gulp.dest('dist'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(insert.prepend(getHeader()))
        .pipe(rename('okanjo-templates.min.js'))
        .pipe(sourcemaps.write('../dist', { sourceRoot: './' }))
        .pipe(gulp.dest('dist'))
});

// TODO - add separate builds for each individual widget instead of the complete okanjo.js package

//
// DEPLOY
//

gulp.task('pre-deploy-bump', function() {
    return gulp.src(versionFiles)

        // Bump build version
        .pipe(bump({ type: 'patch', key: 'version' }))
        .pipe(gulp.dest('./'))

});

gulp.task('pre-deploy-release', ['pre-deploy-bump', 'full-build'], function() {

    var Stream = require('stream');
    //function cb(obj) {
    //    var stream = new Stream.Transform({objectMode: true});
    //    stream._transform = function(file, unused, callback) {
    //        obj();
    //        callback(null, file);
    //    };
    //    return stream;
    //}

    function wait(obj) {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function(file, unused, callback) {
            obj(function() {
                callback(null, file);
            });
        };
        return stream;
    }

    return gulp.src(versionFiles.slice().concat(deployFiles))

        // Tag git repo "release"
        .pipe(git.commit(getVersionCommitMessage()))
        .pipe(filter('package.json'))
        .pipe(tagVersion({ push: true }))
        .pipe(wait(function(cb) {
            git.push('origin','master', {args: " --tags"}, function (err) {
                if (err) throw err;
                cb();
            });
        }));
});

gulp.task('deploy-s3-latest', function() {

    var publisher = awspublish.create(require('./aws-credentials.json'));

    return gulp.src(deployFiles)

        // Deploy to Amazon S3 LATEST
        .pipe(rename(function(path) {
            path.dirname += '/js/latest';
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public'
        }, { force: true }))
        .pipe(awspublish.reporter());

});

gulp.task('deploy-s3-latest-gz', function() {

    var publisher = awspublish.create(require('./aws-credentials.json'));

    return gulp.src(deployFiles)

        // Deploy to Amazon S3 LATEST
        .pipe(rename(function(path) {
            path.dirname += '/js/latest';
        }))
        .pipe(awspublish.gzip({ ext: '.gz' }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public'
        }, { force: true }))
        .pipe(awspublish.reporter())

});

gulp.task('deploy-s3-version', function() {

    var publisher = awspublish.create(require('./aws-credentials.json'));

    return gulp.src(deployFiles)

        // Deploy to Amazon S3 versioned directory
        .pipe(rename(function(path) {
            path.dirname += '/js/v' + require('./package.json').version;
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public'
        }, { force: true }))
        .pipe(awspublish.reporter());

});

gulp.task('deploy-s3-version-gz', function() {

    var publisher = awspublish.create(require('./aws-credentials.json'));

    return gulp.src(deployFiles)

        // Deploy to Amazon S3 versioned directory
        .pipe(rename(function(path) {
            path.dirname += '/js/v' + require('./package.json').version;
        }))
        .pipe(awspublish.gzip({ ext: '.gz' }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public'
        }, { force: true }))
        .pipe(awspublish.reporter());

});

//gulp.task('deploy-packages', function() {
//    // NPM Publish
//    // Bower Publish
//    return null;
//});



gulp.task('watch', function() {
    gulp.watch(['src/*.js', 'lib/*.js', 'lib/polyfill/*.js', 'lib/vendor.js.tpl'], ['lint', 'min', 'bundle', 'fix-maps']);
});

gulp.task('watch-templates', function() {
    gulp.watch(['templates/*.js', 'templates/*.mustache', 'templates/*.less'], ['templatesjs', 'fix-maps']);
});

gulp.task('full-build', ['lint', 'min', 'templatesjs', 'bundle', 'fix-maps']);

gulp.task('deploy-s3', ['deploy-s3-latest', 'deploy-s3-version', 'deploy-s3-latest-gz', 'deploy-s3-version-gz']);
gulp.task('deploy', ['pre-deploy-bump', 'deploy-s3']);


gulp.task('default', ['full-build', 'watch', 'watch-templates']);
