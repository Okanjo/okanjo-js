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
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    fileinclude = require('gulp-file-include'),
    insert = require('gulp-insert'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    size = require('gulp-size'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    umd = require('gulp-umd'),
    wrap = require('gulp-wrap'),
    jsStringEscape = require('js-string-escape'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),

    // Auto add vendor prefixes in CSS
    autoprefix= new LessPluginAutoPrefix({ browsers: ["> 5%"] }),


    // Output script header
    metadata = require('./package'),
    header = '/*! ' + metadata.name + ' v' + metadata.version + ' | (c) 2013 Okanjo Partners Inc | ' + metadata.homepage + ' */\n',


    // Global Okanjo sources, dependencies and polyfills
    sources = [
        // Core
        'src/core.js',
        'src/config.js',
        'src/template.js',

        // Internal dependencies & polyfills
        'lib/polyfill/console.js',
        'src/cache.js',
        'src/cookie.js',
        'lib/polyfill/json2.js',
        'lib/polyfill/array.every.js',

        // External  dependencies & polyfills
        'build/vendor.js',

        // Apps & Widgets
        'src/metrics.js',
        'src/product.js'
    ],

    // Things that normally expose themselves to the root context, but shouldn't because we need them to not conflict
    vendorSources = [
        'lib/qwery/qwery.js',
        'lib/polyfill/domready.js',
        'lib/browser-jsonp/lib/jsonp.js',
        'lib/mustache.js/mustache.js'
    ],

    bundleSources = [
        'dist/okanjo.js',
        'dist/okanjo-templates.js'
    ];

//
// OKANJO.JS ===========================================================================================================
//

gulp.task('deps', function() {
    return gulp.src([])
        .pipe(bower())
});


gulp.task('vendor', ['deps'], function() {
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
        .pipe(gulp.dest('dist'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(insert.prepend(header))
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
        .pipe(insert.prepend(header))
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
            plugins: [autoprefix]
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
        .pipe(gulp.dest('dist'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(insert.prepend(header))
        .pipe(rename('okanjo-templates.min.js'))
        .pipe(sourcemaps.write('../dist', { sourceRoot: './' }))
        .pipe(gulp.dest('dist'))
});


// TODO - add separate builds for each individual widget instead of the bundle okanjo.js


gulp.task('watch', function() {
    gulp.watch(['src/*.js', 'lib/*.js', 'lib/polyfill/*.js', 'lib/vendor.js.tpl'], ['lint', 'min', 'bundle']);
});

gulp.task('watch-templates', function() {
    gulp.watch(['templates/*.js', 'templates/*.mustache', 'templates/*.less'], ['templatesjs']);
});

gulp.task('default', ['lint', 'min', 'templatesjs', 'bundle', 'watch', 'watch-templates']);
