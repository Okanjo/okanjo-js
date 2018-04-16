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

"use strict";

const Gulp = require('gulp');
const Path = require('path');
const FS = require('fs');
const Del = require('del');
const AWSPublish = require('gulp-awspublish');
// const Bower = require('gulp-bower');
const Babel = require('gulp-babel');
const Bump = require('gulp-bump');
const Concat = require('gulp-concat');
const FileInclude = require('gulp-file-include');
const Filter = require('gulp-filter');
const Git = require('gulp-git');
const Insert = require('gulp-insert');
const ESLint = require('gulp-eslint');
const Less = require('gulp-less');
const MinifyCSS = require('gulp-minify-css');
const MinifyHTML = require('gulp-minify-html');
const Notify = require('gulp-notify');
const Rename = require('gulp-rename');
const Replace = require('gulp-replace');
const Size = require('gulp-size');
const SourceMaps = require('gulp-sourcemaps');
const TagVersion = require('gulp-tag-version');
const Uglify = require('gulp-uglify');
const UMD = require('gulp-umd');
const Wrap = require('gulp-wrap');
const JSEscapeString = require('js-string-escape');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');

// Auto add vendor prefixes in CSS
const autoprefix = new LessPluginAutoPrefix({ browsers: ["> 5%"] });

// Module info
const getPackageJson = function() {
    return JSON.parse(FS.readFileSync(Path.join(__dirname, 'package.json'), 'utf8'));
};

// Header
const getHeader = function(name) {
    const metadata = getPackageJson();
    return '/*! ' + (name || metadata.name) + ' v' + metadata.version + ' | (c) 2013 Okanjo Partners Inc | ' + metadata.homepage + ' */\n';
};

// Version bump + dist update message
const getVersionCommitMessage = function() {
    const metadata = getPackageJson();
    return 'Tagged as v' + metadata.version;
};

// Global Okanjo sources, dependencies and polyfills
const sources = [

    'lib/polyfill/*.js',

    'src/Okanjo.js',
    'src/Request.js',
    'src/Cookie.js',

    'src/TemplateEngine.js',
    'src/Modal.js',

    'src/Metrics.js',
    'src/AutoPageView.js',

    'src/EventEmitter.js',
    'src/Widget.js',
    'src/Placement.js',
    'src/Product.js',
    'src/Ad.js',

    // External  dependencies & polyfills
    'build/vendor.js',
];

const metricsOnlyBuildFiles = [

    'lib/polyfill/*.js',

    'src/Okanjo.js',
    'src/Request.js',
    'src/Cookie.js',

    'src/Metrics.js',

    // External  dependencies & polyfills
    'build/vendor-metrics.js',
];

// Things that normally expose themselves to the root context, but shouldn't because we need them to not conflict
const vendorSources = [
    // 'node_modules/qwery/qwery.js',
    // 'lib/polyfill/*.js',
    'node_modules/mustache/mustache.js' //,
    //'build/modal.js'
];

const metricsOnlyVendorFiles = [
    // 'node_modules/qwery/qwery.js',
    // 'lib/polyfill/domready.js'
];


const bundleSources = [
    'dist/okanjo.js',
    'dist/okanjo-templates.js'
];

const versionFiles = [
    'package.json',
    // 'bower.json'
];

const deployFiles = [
    'dist/okanjo.js',
    'dist/okanjo.min.js',
    'dist/okanjo.min.js.map',

    'dist/okanjo-bundle.js',
    'dist/okanjo-bundle.min.js',
    'dist/okanjo-bundle.min.js.map',

    'dist/okanjo-templates.js',
    'dist/okanjo-templates.min.js',
    'dist/okanjo-templates.min.js.map',

    'dist/okanjo-metrics.js',
    'dist/okanjo-metrics.min.js',
    'dist/okanjo-metrics.min.js.map'

];

//
// OKANJO-METRICS.JS ===========================================================================================================
//


Gulp.task('vendor-metrics', [/*'deps'*/], function() {
    return Gulp.src(metricsOnlyVendorFiles)
        .pipe(Concat('vendor-metrics.js'))
        .pipe(Wrap({ src: 'lib/vendor.js.tpl' }))
        .pipe(Gulp.dest('build'))
});

Gulp.task('min-metrics', ['vendor-metrics'], function() {
    let s1 = Size(), s2 = Size();
    const packageJson = getPackageJson();

    //noinspection JSUnusedGlobalSymbols
    return Gulp.src(metricsOnlyBuildFiles)
        .pipe(SourceMaps.init())
        .pipe(Replace(/%%OKANJO_VERSION/, packageJson.version))
        .pipe(Concat('okanjo-metrics.js'))
        .pipe(Babel())
        .pipe(UMD({
            exports: function() {
                return 'okanjo';
            },
            namespace: function() {
                return 'okanjo';
            }
        }))
        .pipe(s1)
        .pipe(Insert.prepend(getHeader('okanjo-metrics.js')))
        .pipe(Gulp.dest('dist'))
        .pipe(Uglify({
            preserveComments: 'some'
        }))
        .pipe(Rename('okanjo-metrics.min.js'))
        .pipe(s2)
        .pipe(SourceMaps.write('../dist', { sourceRoot: './' }))
        .pipe(Gulp.dest('dist'))
        .pipe(Notify({
            onLast: true,
            message: function () {
                //noinspection JSUnresolvedVariable
                return 'Okanjo-Metrics.js – size: ' + s1.prettySize + ', minified: ' + s2.prettySize;
            }
        }));
});

Gulp.task('fix-maps-metrics', ['min-metrics'], function() {
    return Gulp.src('dist/okanjo-metrics.min.js')
        .pipe(Replace(/sourceMappingURL=\.\.\/dist\//, 'sourceMappingURL='))
        .pipe(Gulp.dest('dist'));
});

//
// OKANJO.JS ===========================================================================================================
//

// Gulp.task('deps', function() {
//     return Gulp.src([])
//         .pipe(Bower())
// });


//gulp.task('modal', function() {
//    return gulp.src(modalFiles)
//        .pipe(concat('modal.js'))
//        .pipe(wrap('(function(okanjo) {<%= contents %> okanjo.modal = okanjoModal; })(this);'))
//        .pipe(gulp.dest('build'))
//});


Gulp.task('vendor', [/*'deps'*/], function() {
    return Gulp.src(vendorSources)
        .pipe(Concat('vendor.js'))
        .pipe(Wrap({ src: 'lib/vendor.js.tpl' }))
        .pipe(Gulp.dest('build'))
});


Gulp.task('lint', function() {
    return Gulp.src(sources)
        .pipe(ESLint())
        .pipe(ESLint.result((result) => {
            if ((result.errorCount + result.warningCount) > 0) {

                // console.log(Util.inspect(result, {colors: true, depth: 10}));

                console.error();
                console.error(result.filePath);
                result.messages.forEach((message) => {
                    let severity = 'error';
                    if (message.severity === 1) severity = 'warning';
                    else if (message.severity === 0) severity = 'notice';

                    console.error(`  ${message.line}:${message.column}  ${severity}  ${message.message}  ${message.ruleId}`);
                });
                console.error();

            }
        }))
    ;
});


Gulp.task('min', ['vendor'], function() {
    let s1 = Size(), s2 = Size();
    const packageJson = getPackageJson();

    //noinspection JSUnusedGlobalSymbols
    return Gulp.src(sources)
        .pipe(SourceMaps.init())
        .pipe(Replace(/%%OKANJO_VERSION/, packageJson.version))
        .pipe(Concat('okanjo.js'))
        .pipe(Babel())
        .pipe(UMD({
            exports: function() {
                return 'okanjo';
            },
            namespace: function() {
                return 'okanjo';
            }
        }))
        .pipe(s1)
        .pipe(Insert.prepend(getHeader()))
        .pipe(Gulp.dest('dist'))
        .pipe(Uglify({
            preserveComments: 'some'
        }))
        .pipe(Rename('okanjo.min.js'))
        .pipe(s2)
        .pipe(SourceMaps.write('../dist', { sourceRoot: './' }))
        .pipe(Gulp.dest('dist'))
        .pipe(Notify({
            onLast: true,
            message: function () {
                //noinspection JSUnresolvedVariable
                return 'Okanjo.js – size: ' + s1.prettySize + ', minified: ' + s2.prettySize;
            }
        }));
});

Gulp.task('bundle', ['min', 'templatesjs'], function() {
    let s1 = Size(), s2 = Size();
    return Gulp.src(bundleSources)
        .pipe(Concat('okanjo-bundle.js'))
        .pipe(s1)
        .pipe(Gulp.dest('dist'))
        .pipe(Uglify({
            preserveComments: 'some'
        }))
        .pipe(Insert.prepend(getHeader()))
        .pipe(SourceMaps.init())
        .pipe(Rename('okanjo-bundle.min.js'))
        .pipe(s2)
        .pipe(SourceMaps.write('../dist', { sourceRoot: './' }))
        .pipe(Gulp.dest('dist'))
        .pipe(Notify({
            onLast: true,
            message: function () {
                //noinspection JSUnresolvedVariable
                return 'Okanjo-Bundle.js – size: ' + s1.prettySize + ', minified: ' + s2.prettySize;
            }
        }));
});

Gulp.task('fix-maps', ['bundle'], function() {
    return Gulp.src('dist/*.min.js')
        .pipe(Replace(/sourceMappingURL=\.\.\/dist\//, 'sourceMappingURL='))
        .pipe(Gulp.dest('dist'));
});

//
// TEMPLATES ===========================================================================================================
//


Gulp.task('min-mustache-templates', function() {
    return Gulp.src('templates/*.mustache')
        .pipe(MinifyHTML({
            conditionals: true,
            spare:true,
            cdata:true,
            empty:true,
            loose:false
        }))
        .pipe(Gulp.dest('./build/templates/'))
});


Gulp.task('min-css-templates', function() {
    return Gulp.src('templates/*.less')
        .pipe(Less({
            plugins: [autoprefix],
            paths: [ Path.join(__dirname, 'templates' ) ]
        }))
        .pipe(Gulp.dest('./build/templates/unminified'))
        .pipe(MinifyCSS({ compatibility: 'ie8,-units.pt' }))
        .pipe(Gulp.dest('./build/templates/'))
});


Gulp.task('join-templates', ['min-mustache-templates', 'min-css-templates'], function() {
    return Gulp.src("templates/*.js")
        .pipe(FileInclude({
            filters: {
                jsStringEscape: JSEscapeString
            },
            basepath: 'build/templates/'
        }))
        .pipe(Gulp.dest('build/templates'))
});


Gulp.task('templatesjs', ['join-templates'], function() {
    return Gulp.src("build/templates/*.js")
        .pipe(SourceMaps.init())
        .pipe(Concat('okanjo-templates.js'))
        .pipe(Babel())
        .pipe(Wrap('(function(okanjo) {<%= contents %>})(okanjo);'))
        .pipe(Insert.prepend(getHeader()))
        .pipe(Gulp.dest('dist'))
        .pipe(Uglify({
            preserveComments: 'some'
        }))
        .pipe(Insert.prepend(getHeader()))
        .pipe(Rename('okanjo-templates.min.js'))
        .pipe(SourceMaps.write('../dist', { sourceRoot: './' }))
        .pipe(Gulp.dest('dist'))
});

// TODO - add separate builds for each individual widget instead of the complete okanjo.js package

//
// DEPLOY
//

Gulp.task('pre-deploy-bump', function() {
    return Gulp.src(versionFiles)

        // Bump build version
        .pipe(Bump({ type: 'patch', key: 'version' }))
        .pipe(Gulp.dest('./'))

});

Gulp.task('pre-deploy-release', ['pre-deploy-bump', 'full-build'], function() {

    const Stream = require('stream');
    //function cb(obj) {
    //    var stream = new Stream.Transform({objectMode: true});
    //    stream._transform = function(file, unused, callback) {
    //        obj();
    //        callback(null, file);
    //    };
    //    return stream;
    //}

    function wait(obj) {
        const stream = new Stream.Transform({objectMode: true});
        stream._transform = function(file, unused, callback) {
            obj(function() {
                callback(null, file);
            });
        };
        return stream;
    }

    return Gulp.src(versionFiles.slice().concat(deployFiles))

        // Tag git repo "release"
        .pipe(Git.commit(getVersionCommitMessage()))
        .pipe(Filter('package.json'))
        .pipe(TagVersion({ push: true }))
        .pipe(wait(function(cb) {
            Git.push('origin','master', {args: " --tags"}, function (err) {
                if (err) throw err;
                cb();
            });
        }));
});

Gulp.task('deploy-s3-latest', function() {

    const publisher = AWSPublish.create(require('./aws-credentials.json'));

    return Gulp.src(deployFiles)

        // Deploy to Amazon S3 LATEST
        .pipe(Rename(function(path) {
            path.dirname += '/js/latest';
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public',
            'Content-Type': 'application/javascript; charset=utf-8'
        }, { force: true }))
        .pipe(AWSPublish.reporter());

});

Gulp.task('deploy-s3-latest-gz', function() {

    const publisher = AWSPublish.create(require('./aws-credentials.json'));

    return Gulp.src(deployFiles)

        // Deploy to Amazon S3 LATEST
        .pipe(Rename(function(path) {
            path.dirname += '/js/latest';
        }))
        .pipe(AWSPublish.gzip({ ext: '.gz' }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public',
            'Content-Type': 'application/javascript; charset=utf-8'
        }, { force: true }))
        .pipe(AWSPublish.reporter())

});

Gulp.task('deploy-s3-version', function() {

    const publisher = AWSPublish.create(require('./aws-credentials.json'));

    return Gulp.src(deployFiles)

        // Deploy to Amazon S3 versioned directory
        .pipe(Rename(function(path) {
            path.dirname += '/js/v' + require('./package.json').version;
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public',
            'Content-Type': 'application/javascript; charset=utf-8'
        }, { force: true }))
        .pipe(AWSPublish.reporter());

});

Gulp.task('deploy-s3-version-gz', function() {

    const publisher = AWSPublish.create(require('./aws-credentials.json'));

    return Gulp.src(deployFiles)

        // Deploy to Amazon S3 versioned directory
        .pipe(Rename(function(path) {
            path.dirname += '/js/v' + require('./package.json').version;
        }))
        .pipe(AWSPublish.gzip({ ext: '.gz' }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public',
            'Content-Type': 'application/javascript; charset=utf-8'
        }, { force: true }))
        .pipe(AWSPublish.reporter());

});

Gulp.task('deploy-s3-preview', function() {

    const publisher = AWSPublish.create(require('./aws-credentials.json'));

    return Gulp.src(deployFiles)

        // Deploy to Amazon S3 LATEST
        .pipe(Rename(function(path) {
            path.dirname += '/js/preview';
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public',
            'Content-Type': 'application/javascript; charset=utf-8'
        }, { force: true }))
        .pipe(AWSPublish.reporter());

});

Gulp.task('deploy-s3-preview-gz', function() {

    const publisher = AWSPublish.create(require('./aws-credentials.json'));

    return Gulp.src(deployFiles)

        // Deploy to Amazon S3 LATEST
        .pipe(Rename(function(path) {
            path.dirname += '/js/preview';
        }))
        .pipe(AWSPublish.gzip({ ext: '.gz' }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=60, no-transform, public',
            'Content-Type': 'application/javascript; charset=utf-8'
        }, { force: true }))
        .pipe(AWSPublish.reporter())

});

Gulp.task('clean', () => {
    return Del([
        'build/**/*',
        'dist/**/*'
    ]);
});


Gulp.task('watch', function() {
    Gulp.watch(['src/**/*.js', 'lib/*.js', 'lib/polyfill/*.js', 'lib/vendor.js.tpl'], ['lint', 'min', 'bundle', 'fix-maps']);
});

Gulp.task('watch-templates', function() {
    Gulp.watch(['templates/*.js', 'templates/*.mustache', 'templates/*.less'], ['templatesjs', 'fix-maps']);
});

Gulp.task('watch-metrics', function() {
    Gulp.watch(metricsOnlyBuildFiles, ['metrics']);
});

Gulp.task('full-build', ['lint', 'min', 'templatesjs', 'bundle', 'fix-maps','metrics']);

Gulp.task('deploy-s3', ['deploy-s3-latest', 'deploy-s3-version', 'deploy-s3-latest-gz', 'deploy-s3-version-gz', 'deploy-s3-preview', 'deploy-s3-preview-gz']);

Gulp.task('deploy-preview', ['deploy-s3-preview', 'deploy-s3-preview-gz']);

Gulp.task('deploy', ['pre-deploy-bump', 'deploy-s3']);

Gulp.task('metrics', ['lint', 'min-metrics']);

Gulp.task('default', ['full-build', 'watch', 'watch-templates','watch-metrics']);
