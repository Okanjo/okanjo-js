"use strict";

const Async = require('async');
const FS = require('fs');
const Path = require('path');
const should = require('should');
const Http = require('http');
const Url = require('url');
const TestResponses = require('./_test_responses');
const JSDOM = require('jsdom')

const NOOP = () => {};

class TestUtil {
    constructor() {
        this._doneWithDOM = NOOP;
    }

    setupEnvironment(jsDomOptions = {}) {

        if (jsDomOptions.userAgent) {
            jsDomOptions.resources = new JSDOM.ResourceLoader({
                userAgent: jsDomOptions.userAgent
            });
        }

        this._doneWithDOM = require('jsdom-global')(undefined, {
            url: 'https://example.com/',
            referrer: 'https://example.com/last/page',
            contentType: 'text/html',

            ...jsDomOptions,
        });

        // Attach storage shim
        //noinspection JSUnusedGlobalSymbols
        // global.window.localStorage = window.sessionStorage = {
        //     getItem: function (key) {
        //         return this[key];
        //     },
        //     setItem: function (key, value) {
        //         this[key] = value;
        //     }
        // };
    }

    cleanEnvironment() {
        this._doneWithDOM();
    }

    //noinspection JSMethodCanBeStatic
    reloadOkanjo() {
        delete require.cache[require.resolve('../src/Okanjo')];
        require('../src/Okanjo');
        global.window.okanjo.should.be.ok();
    }

    //noinspection JSMethodCanBeStatic
    reloadCookie() {
        delete require.cache[require.resolve('../src/Cookie')];
        require('../src/Cookie');
        global.okanjo.util.cookie.should.be.ok();
        global.okanjo.util.cookie.set.should.be.a.Function();
        global.okanjo.util.cookie.get.should.be.a.Function();
    }

    //noinspection JSMethodCanBeStatic
    reloadRequest() {
        delete require.cache[require.resolve('../src/Request')];
        require('../src/Request');
        global.okanjo.net.request.should.be.a.Function();
        global.okanjo.net.request.get.should.be.a.Function();
        global.okanjo.net.request.put.should.be.a.Function();
        global.okanjo.net.request.post.should.be.a.Function();
        global.okanjo.net.request.delete.should.be.a.Function();
        global.okanjo.net.request.stringify.should.be.a.Function();
    }

    //noinspection JSMethodCanBeStatic
    reloadEventEmitter() {
        delete require.cache[require.resolve('../src/EventEmitter')];
        require('../src/EventEmitter');
        global.okanjo._EventEmitter.should.be.a.Function();
    }

    //noinspection JSMethodCanBeStatic
    reloadModal() {
        delete require.cache[require.resolve('../src/Modal')];
        require('../src/Modal');
        global.okanjo.ui.modal.should.be.ok();
        global.okanjo.ui.modal.show.should.be.a.Function();
        global.okanjo.ui.modal.hide.should.be.a.Function();
    }

    //noinspection JSMethodCanBeStatic
    reloadMetrics() {
        delete require.cache[require.resolve('../src/Metrics')];
        require('../src/Metrics');
        global.okanjo.metrics.should.be.ok();
        global.okanjo.metrics.trackEvent.should.be.a.Function();
        global.okanjo.metrics.trackPageView.should.be.a.Function();
    }

    //noinspection JSMethodCanBeStatic
    reloadWidget() {
        delete require.cache[require.resolve('../src/Widget')];
        require('../src/Widget');
        global.okanjo._Widget.should.be.ok();
    }

    //noinspection JSMethodCanBeStatic
    reloadPlacement() {
        delete require.cache[require.resolve('../src/Placement')];
        require('../src/Placement');
        global.okanjo.Placement.should.be.ok();
    }

    //noinspection JSMethodCanBeStatic
    reloadProduct() {
        delete require.cache[require.resolve('../src/Product')];
        require('../src/Product');
        global.okanjo.Product.should.be.ok();
    }

    //noinspection JSMethodCanBeStatic
    reloadAd() {
        delete require.cache[require.resolve('../src/Ad')];
        require('../src/Ad');
        global.okanjo.Ad.should.be.ok();
    }

    //noinspection JSMethodCanBeStatic
    reloadTemplateEngine() {
        // make sure it requires
        delete require.cache[require.resolve('../src/TemplateEngine')];
        require('../src/TemplateEngine');
        global.okanjo.ui.engine.should.be.ok();

        // get Mustache loaded on too
        const Mustache = require('mustache');
        global.okanjo.lib.Mustache = Mustache;
        Mustache.render.should.be.ok();
    }

    reloadAppTemplates(callback) {
        Async.waterfall([

            // Load template files
            (next) => {
                // load app templates
                FS.readdir(Path.join(__dirname, '..','templates'), (err, files) => {
                    should(err).not.be.ok();

                    files.should.be.ok();
                    files.should.not.be.empty();

                    const registerPattern = /^.*\.js$/;

                    const registrars = files.filter((file) => registerPattern.test(file));

                    // Run each registrar
                    registrars.forEach((file) => {
                        const p = Path.join('..', 'templates', file);
                        delete require.cache[require.resolve(p)];
                        require(p);
                    });

                    next();
                });
            },

            // Replace templates with original markup
            (next) => {
                const includePattern = /@@include\(jsStringEscape\('(.+)'\)\)/;

                // Replace markup on templates with their mustache file
                Async.eachSeries(
                    Object.keys(okanjo.ui.engine._templates),
                    (name, nextTemplate) => {

                        let template = okanjo.ui.engine._templates[name];

                        let match = includePattern.exec(template.markup);
                        if (match) {
                            // Replace it with the real thing
                            FS.readFile(Path.join(__dirname, '..', 'templates', match[1]), {encoding: 'utf8'}, (err, data) => {
                                should(err).not.be.ok();
                                template.markup = data;

                                nextTemplate();
                            });
                        } else {
                            nextTemplate();
                        }
                    },
                    next
                );
            },

            // Load compiled css, if able
            (next) => {
                const includePattern = /@@include\(jsStringEscape\('(.+)'\)\)/;

                // Replace css on templates with their compiled css
                Async.eachSeries(
                    Object.keys(okanjo.ui.engine._css),
                    (name, nextCSS) => {

                        let css = okanjo.ui.engine._css[name];
                        let match = includePattern.exec(css.markup);

                        if (match) {
                            // Replace it with the real thing
                            FS.readFile(Path.join(__dirname, '..', 'build', 'templates', 'unminified', match[1]), {encoding: 'utf8'}, (err, data) => {
                                should(err).not.be.ok();
                                css.markup = data;

                                nextCSS();
                            });
                        } else {
                            nextCSS();
                        }
                    },
                    next
                );
            }

        ], callback);
    }

    mockServer(callback) {

        const server = {
            port: 8912,
            routes: []
        };

        server.listener = Http.createServer((req, res) => {

            let data = "";

            req.on('data', (chunk) => {
                data += (chunk + "");
            });

            let reply = (statusCode, headers, payload) => {
                // console.log('>> REPLY', { req_url: req.url, statusCode, headers, payload });
                res.writeHead(statusCode, headers);
                payload && res.write(payload);
                res.end();
            };


            req.on('end', () => {
                const uri = Url.parse(req.url);
                const route = server.routes.find((route) => {
                    return route.method === req.method &&
                        (typeof route.path === 'object' ? route.path.test(uri.pathname) : route.path === uri.pathname);
                });

                if (req.method === 'OPTIONS') {
                    reply(200, {
                        'Content-Type': req.contentType || 'application/json; charset=utf-8',
                        'Content-Length': '0',
                        'access-control-allow-origin': '*',
                        'access-control-allow-methods': 'GET,PUT,POST,DELETE',
                        'access-control-allow-headers': 'Accept,Authorization,Content-Type,If-None-Match',
                        'access-control-max-age': '86400',
                        'access-control-allow-credentials': 'true',
                        'access-control-expose-headers': 'WWW-Authenticate,Server-Authorization,X-Okanjo-SID'
                    });
                } else {
                    if (route) {
                        route.handler({ req, uri, payload: data }, (response) => {
                            if (typeof response.payload === 'object') {
                                delete response.contentType;
                                response.payload = JSON.stringify(response.payload);
                            }
                            reply(response.statusCode || 200, {
                                'Content-Type': response.contentType || 'application/json; charset=utf-8',
                                'Content-Length': Buffer.byteLength(response.payload),
                                'access-control-allow-origin': '*',
                                'access-control-allow-methods': 'GET,PUT,POST,DELETE',
                                'access-control-allow-headers': 'Accept,Authorization,Content-Type,If-None-Match',
                                'access-control-max-age': '86400',
                                'access-control-allow-credentials': 'true',
                                'access-control-expose-headers': 'WWW-Authenticate,Server-Authorization,X-Okanjo-SID'
                            }, response.payload);
                        });
                    } else {
                        const payload = JSON.stringify({
                            statusCode: 404,
                            error: 'Not found'
                        });
                        reply(404, {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Content-Length': Buffer.byteLength(payload)
                        }, payload);
                    }
                }
            });
        });

        // Register helper routes
        server.routes.push({
            method: 'GET',
            path: '/500',
            handler: (req, reply) => {
                reply({
                    statusCode: 500,
                    payload: {
                        statusCode: 500,
                        error: 'Internal Server Explosion'
                    }
                });
            }
        });

        server.listener.listen(server.port, () => {
            // Send the server info and cleanup callback to the requester
            callback(
                server,
                (done) => {
                    server.listener.close(); //() => {
                        // console.log('server finally closed');
                    // });
                    done(); // for some reason, waiting for client connections to close can take ages
                    // I suspect jsdom has something to do with keep alives
                }
            );
        });
    }

    //noinspection JSMethodCanBeStatic
    resetDocument() {
        document.documentElement.innerHTML = `<head><meta charset="utf-8"></head><body></body>`;
    }

    insertDropzone(config) {
        config = config || {};
        let element = document.createElement('div');
        element.className = 'okanjo-dropzone';
        Object
            .keys(config)
            .forEach((key) => {
                element.setAttribute('data-'+key.replace(/_/g, '-'), config[key])
            })
        ;
        document.body.appendChild(element);
        return element;
    }

    setMetricsHandler(callback) {
        this._metricsHandler = callback;
    }

    setMetricsBulkHandler(callback) {
        this._metricsBulkHandler = callback;
    }

    setAdsHandler(callback) {
        this._adsHandler = callback;
    }

    handleMetricsBulkRequest(req, reply) {
        req.payload = JSON.parse(req.payload);

        let res;
        if (this._metricsBulkHandler) res = this._metricsBulkHandler(req, reply);

        reply(res || {
                statusCode: 200,
                payload: {
                    statusCode: 200,
                    data: {
                        sid: 'MTunittesting1'
                    }
                }
            }
        );
    }

    handleMetricsRequest(req, reply) {
        req.payload = JSON.parse(req.payload);

        let res;
        try {
            if (this._metricsHandler) res = this._metricsHandler(req, reply);

            reply(res || {
                statusCode: 200,
                payload: {
                    statusCode: 200,
                    data: {
                        sid: 'MTunittesting1'
                    }
                }
            });
        } catch (err) {
            // assertion probably failed
            console.error(err);
            reply(res || {
                statusCode: 500,
                payload: {
                    statusCode: 500,
                    error: 'Internal Server Error'
                }
            });
        }
    }

    handleAdsRequest(req, reply) {
        req.payload = JSON.parse(req.payload);

        let res;
        try {
            if (this._adsHandler) res = this._adsHandler(req, reply);

            reply(res || {
                statusCode: 200,
                payload: TestResponses.getExampleProductResponse()
            });
        } catch (err) {
            // assertion probably failed
            console.error(err);
            reply(res || {
                statusCode: 500,
                payload: {
                    statusCode: 500,
                    error: 'Internal Server Error'
                }
            });
        }
    }

    registerMockRoutes(server) {
        server.routes.push({
            method: 'POST',
            path: okanjo.net.routes.metrics_batch,
            handler: this.handleMetricsBulkRequest.bind(this)
        });

        server.routes.push({
            method: 'GET',
            path: /\/metrics\/[a-z]+\/[a-z]+/,
            handler: this.handleMetricsRequest.bind(this)
        });

        server.routes.push({
            method: 'POST',
            path: okanjo.net.routes.ads,
            handler: this.handleAdsRequest.bind(this)
        });
    }
}

module.exports = new TestUtil();