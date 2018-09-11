"use strict";

const TestUtil = require('./_test_util');
const TestResponses = require('./_test_responses');
const should = require('should');
const Url = require('url');
const Qs = require('qs');

describe('Placements', () => {

    let okanjo;
    let server, doneWithServer;

    const setup = (callback) => {
        // get okanjo on the dom
        TestUtil.reloadOkanjo();

        // update shortcut pointer
        okanjo = window.okanjo;
        global.okanjo = okanjo;

        // make sure it requires
        TestUtil.reloadRequest();
        okanjo.net.endpoint = `http://localhost:${server.port}`;

        TestUtil.reloadCookie();
        TestUtil.reloadMetrics();
        TestUtil.reloadModal();
        TestUtil.reloadTemplateEngine();
        TestUtil.reloadEventEmitter();
        TestUtil.reloadWidget();
        TestUtil.reloadPlacement();
        TestUtil.reloadAppTemplates(callback);
    };

    const resetDocument = TestUtil.resetDocument.bind(TestUtil);
    const insertDropzone = TestUtil.insertDropzone.bind(TestUtil);
    const setMetricsHandler = TestUtil.setMetricsHandler.bind(TestUtil);
    const setMetricsBulkHandler = TestUtil.setMetricsBulkHandler.bind(TestUtil);
    const setAdsHandler = TestUtil.setAdsHandler.bind(TestUtil);

    before((done) => {
        // make us a dom
        TestUtil.setupEnvironment();

        // mock the server to inspect request payloads
        TestUtil.mockServer((mocker, endServer) => {
            server = mocker;
            doneWithServer = endServer;

            // add our junk
            setup(() => {

                TestUtil.registerMockRoutes(server);

                done();
            });
        });
    });

    after((done) => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();

        doneWithServer(done);
    });

    //noinspection JSUnusedLocalSymbols
    const debug = () => {
        console.log(document.documentElement.innerHTML);
    };

    describe('Construction', () => {

        it('should bark if no placement key is given anywhere', () => {
            resetDocument();
            let target = insertDropzone();
            let placement = new okanjo.Placement(target);

            placement.should.be.ok();

            target.innerHTML.should.match(/missing placement key/i);
        });

        it('should not initialize if configured to do so', () => {
            resetDocument();
            let target = insertDropzone({ take: 4 });
            let placement = new okanjo.Placement(target, { no_init: true });

            target.innerHTML.should.be.empty();
            should(placement.config.take).be.exactly(undefined);
        });

        it('should maybe, just maybe, load something', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key' });
            let adsHits = 0;
            let metricsReceived = 0;
            let loadEventFired = false;
            let dataEventFired = false;

            setAdsHandler(() => {
                adsHits++;
                adsHits.should.be.exactly(1);
                metricsReceived.should.be.exactly(0);
            });

            setMetricsBulkHandler((req) => {
                metricsReceived += req.payload.events.length;
                adsHits.should.be.exactly(1);
                metricsReceived.should.be.exactly(3); // imps: wg, pr, pr

                // Check the markup
                target.querySelectorAll('.okanjo-product').should.have.length(2);
                loadEventFired.should.be.exactly(true);
                dataEventFired.should.be.exactly(true);

                req.payload.win.should.be.ok();

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();
                done();
            });

            let placement = new okanjo.Placement(target);

            placement.on('load', () => {
                loadEventFired.should.be.exactly(false);
                loadEventFired = true;
            });

            placement.on('data', () => {
                dataEventFired.should.be.exactly(false);
                dataEventFired = true;
            });
        });

    });

    describe('Methods', () => {

        describe('getConfig', () => {

            it('should take data backfill settings and apply them correctly', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key', 'backfill-take': 14 });

                // Wait for the metrics batch to fly in before the next test
                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();
                    done();
                });

                let placement = new okanjo.Placement(target, { q: null });
                let config = placement.getConfig();

                config.backfill.filters.take.should.be.exactly(14);
                should(config.filters.q).be.exactly('');

            });

            it('should take data shortfill settings and apply them correctly', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key', 'shortfill-url': 'http://asd.jkl' });

                // Wait for the metrics batch to fly in before the next test
                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();
                    done();
                });

                let placement = new okanjo.Placement(target, { q: null });
                let config = placement.getConfig();

                config.shortfill.url.should.be.exactly('http://asd.jkl');
                should(config.filters.q).be.exactly('');

            });

        });

        describe('_fetchContent', () => {

            it('should handle communication errors gracefully', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let gotErrorEvent = false;

                // Wait for the metrics batch to fly in before the next test
                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    // Verify that we have no markup and that the error event was emitted
                    gotErrorEvent.should.be.exactly(true);
                    target.innerHTML.should.be.empty();

                    done();
                });

                // Make the server return an error
                setAdsHandler((req) => {
                    req.payload.filters.url_referrer.should.be.exactly('about:blank');
                    return {
                        statusCode: 500,
                        payload: {
                            statusCode: 500,
                            error: 'Internal Server Explosion',
                            message: 'Something went horribly wrong'
                        }
                    };
                });

                // Make that placement
                let placement = new okanjo.Placement(target);

                // Make sure the error event is emitted for integrations
                placement.on('error', () => {
                    gotErrorEvent.should.be.exactly(false);
                    gotErrorEvent = true;
                });

            });

            it('should use url_referrer if given', (done) => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    url_referrer: 'http://unit.test/another/url'
                });

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    done();
                });

                setAdsHandler((req) => {
                    const payload = TestResponses.getExampleProductResponse();

                    req.payload.filters.url_referrer.should.be.exactly('http://unit.test/another/url');

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                new okanjo.Placement(target);
            });

        });

        describe('_mergeResponseSettings', () => {

            it('should merge response settings', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let loadEventFired = false;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    loadEventFired.should.be.exactly(true);

                    done();
                });

                // Make the server return an error
                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    // Insert composited settings
                    payload.data.settings.filters.skip = 42;
                    payload.data.settings.display.custom_setting = 'all_the_things';
                    payload.data.settings.placement_tests_only = true;

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                let placement = new okanjo.Placement(target);

                placement.on('load', () => {
                    loadEventFired.should.be.exactly(false);
                    loadEventFired = true;

                    placement.config.skip.should.be.exactly(42);
                    placement.config.custom_setting.should.be.exactly('all_the_things');
                    placement.config.placement_tests_only.should.be.exactly(true);
                });
            });

            it('should handle busted server responses where data is missing', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    done();
                });

                // Make the server return an error
                setAdsHandler(() => {

                    return {
                        statusCode: 200,
                        payload: {
                            statusCode: 200,
                            data: null // WHY GOD WHY?
                        }
                    };
                });

                // Make that placement
                new okanjo.Placement(target);
            });
        });

        describe('_updateBaseMetaFromResponse', () => {

            it('should populate meta metric props when placement test is active', () => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });

                placement._response = TestResponses.getExampleProductResponse();
                placement._response.data.test = {
                    enabled: true,
                    id: 'asdf1234',
                    seed: 'Snazzy Elephant'
                };

                // Do it
                //noinspection JSAccessibilityCheck
                placement._updateBaseMetaFromResponse();

                // Verify
                placement._metricBase.m.pten.should.be.exactly(1);
                placement._metricBase.m.ptid.should.be.exactly('asdf1234');
                placement._metricBase.m.ptseed.should.be.exactly('Snazzy Elephant');

            });

            it('should gracefully handle a missing response', () => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });

                placement._response = {
                    statusCode: 200,
                    data: null
                };

                //noinspection JSAccessibilityCheck
                placement._updateBaseMetaFromResponse();

                placement._response = null;

                //noinspection JSAccessibilityCheck
                placement._updateBaseMetaFromResponse();

            });

        });

        describe('_showContent', () => {

            it('can show articles', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    target.querySelectorAll('.okanjo-article').length.should.be.exactly(5);

                    done();
                });

                // Make the server return an error
                setAdsHandler(() => {
                    return {
                        statusCode: 200,
                        payload: TestResponses.getExampleArticlesResponse()
                    };
                });

                // Make that placement
                new okanjo.Placement(target);
            });

            it('can show articles in slab template', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key', template_name: 'slab' });

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    target.querySelectorAll('.okanjo-article').length.should.be.exactly(5);

                    done();
                });

                // Make the server return an error
                setAdsHandler(() => {
                    return {
                        statusCode: 200,
                        payload: TestResponses.getExampleArticlesResponse()
                    };
                });

                // Make that placement
                new okanjo.Placement(target);
            });

            it('can show google ads', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    should(target.querySelector('iframe')).be.ok();

                    done();
                });

                // Make the server return an error
                setAdsHandler(() => {
                    return {
                        statusCode: 200,
                        payload: TestResponses.getExampleAdxResponse()
                    };
                });

                // Make that placement
                new okanjo.Placement(target);
            });

            it('handles empty responses', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });

                placement._response = null;

                placement.on('error', () => {
                    done();
                });

                // Go
                //noinspection JSAccessibilityCheck
                placement._showContent();
            });

        });

        describe('_getTemplate', () => {

            it('should ignore your crappy template and use a real one', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let placement;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    placement.config.template_name.should.be.exactly('bogus');
                    let tpl = placement._getTemplate(okanjo.Placement.ContentTypes.products, okanjo.Placement.DefaultTemplates.products);
                    tpl.should.be.exactly(okanjo.Placement.ContentTypes.products+'.'+okanjo.Placement.DefaultTemplates.products);

                    done();
                });

                // Make the server return an error
                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    // Insert composited settings
                    payload.data.settings.display.template_name = 'bogus';

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                placement = new okanjo.Placement(target);


            });

            it('should use a custom template if registered', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let placement;

                okanjo.ui.engine.registerTemplate(okanjo.Placement.ContentTypes.products+'.custom', '{{ template_name }}', function(model) {
                    model.template_name = okanjo.Placement.ContentTypes.products+'.custom';
                    return model;
                });

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    placement.config.template_name.should.be.exactly('custom');
                    let tpl = placement._getTemplate(okanjo.Placement.ContentTypes.products, okanjo.Placement.DefaultTemplates.products);
                    tpl.should.be.exactly(okanjo.Placement.ContentTypes.products+'.custom');

                    target.innerHTML.should.be.exactly(okanjo.Placement.ContentTypes.products+'.custom');

                    done();
                });

                // Make the server return an error
                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    // Insert composited settings
                    payload.data.settings.display.template_name = 'custom';

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                placement = new okanjo.Placement(target);
            });

        });

        describe('_handleResourceMouseDown', () => {

            it('should convert a bait link into a real one', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    let productLink = target.querySelector('a');
                    should(productLink).be.ok();

                    let baitLink = target.href;

                    let e = new window.Event('mousedown', {bubbles: true});
                    e.pageX = 1;
                    e.pageY = 2;
                    productLink.dispatchEvent(e);

                    // Verify that our link changed
                    productLink.href.should.not.be.equal(baitLink);
                    productLink.href.should.not.match(/\[bot]/);

                    let parts = Url.parse(productLink.href);
                    let args = Qs.parse(parts.query);

                    args.should.containDeep({
                        ch: 'pw',
                        cx: 'auto',
                        key: 'unit_test_key',
                        m: {
                            // wgid: 'Lk0E6-Ap7',
                            aid: 'article_local_2gT3kBcwVQZ1kpEma',
                            pten: '0',
                            decl: '0',
                            // key: 'unit_test_key', // should be stripped now
                            pw: '0',
                            ph: '0',
                            x1: '0',
                            y1: '0',
                            x2: '0',
                            y2: '0',
                            vx1: '0',
                            vy1: '0',
                            vx2: '0',
                            vy2: '0',
                            bf: '0',
                            // cid: 'Lyra-Ram',
                            et: 'Event',
                            ex: '1',
                            ey: '2',
                            // pgid: 'L14p-CaX',
                            ok_ver: '%%OKANJO_VERSION'
                        },
                        id: 'product_test_2gT3kBcwVQZ1kpEma',
                        ea: 'click',
                        // u: 'http://www.shareasale.com/m-pr.cfm?merchantID=52555&userID=1241092&productID=575333915&ok_cid=Lyra-Ram&afftrack=MTunittesting1%3ALyra-Ram&ok_msid=MTunittesting1&ok_ch=pw&ok_cx=auto',
                        sid: 'MTunittesting1'
                    });

                    // check dynamic params to be present
                    args.m.wgid.should.be.ok();
                    args.m.cid.should.be.ok();
                    args.m.pgid.should.be.ok();
                    args.u.should.be.ok().and.startWith('http://www.shareasale.com');

                    done();
                });

                // Make that placement
                new okanjo.Placement(target);
            });

            it('should wrap target url with a proxy if given', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key', proxy_url: 'http://proxy.test?u=' });

                // hack our sid too, just for some edge case stuff
                okanjo.metrics.sid = null;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    let productLink = target.querySelector('a');
                    should(productLink).be.ok();

                    let baitLink = target.href;

                    let e = new window.Event('mousedown', {bubbles: true});
                    e.pageX = 1;
                    e.pageY = 2;
                    productLink.dispatchEvent(e);

                    // Verify that our link changed
                    productLink.href.should.not.be.equal(baitLink);
                    productLink.href.should.not.match(/\[bot]/);

                    let parts = Url.parse(productLink.href);
                    let args = Qs.parse(parts.query);

                    // check dynamic params to be present
                    args.m.wgid.should.be.ok();
                    args.m.cid.should.be.ok();
                    args.m.pgid.should.be.ok();
                    args.u.should.be.ok().and.startWith('http://proxy.test?u=');

                    let targetUrl = Qs.parse(Url.parse(args.u).query).u;
                    Qs.parse(Url.parse(targetUrl).query).afftrack.should.match(/unknown:.+/);

                    done();
                });

                // Make that placement
                new okanjo.Placement(target);
            });

            it('should handle non-product links too', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                // hack our sid too, just for some edge case stuff
                okanjo.metrics.sid = null;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    let productLink = target.querySelector('a');
                    should(productLink).be.ok();

                    let baitLink = target.href;

                    let e = new window.Event('mousedown', {bubbles: true});
                    e.pageX = 1;
                    e.pageY = 2;
                    productLink.dispatchEvent(e);

                    // Verify that our link changed
                    productLink.href.should.not.be.equal(baitLink);
                    productLink.href.should.not.match(/\[bot]/);

                    let parts = Url.parse(productLink.href);
                    let args = Qs.parse(parts.query);

                    args.should.containDeep({
                        ch: 'pw',
                        cx: 'auto',
                        key: 'unit_test_key',
                        m: {
                            // wgid: 'U1CzDVApX',
                            pten: '0',
                            decl: '0',
                            display_size: 'half_page',
                            display_template_layout: 'list',
                            display_template_cta_style: 'link',
                            // key: 'unit_test_key',
                            pw: '0',
                            ph: '0',
                            x1: '0',
                            y1: '0',
                            x2: '0',
                            y2: '0',
                            vx1: '0',
                            vy1: '0',
                            vx2: '0',
                            vy2: '0',
                            bf: '0',
                            // cid: '8kJxzPN0TQ',
                            et: 'Event',
                            ex: '1',
                            ey: '2',
                            // pgid: 'U1bvECpQ',
                            ok_ver: '%%OKANJO_VERSION'
                        },
                        id: 'article_test_2gWFnrrPHhoJPDQoF',
                        ea: 'click',
                        // u: 'http://unit.test/1?ok_cid=8kJxzPN0TQ&ok_msid=MTunittesting1&ok_ch=pw&ok_cx=auto',
                        // sid: 'unknown'
                    });

                    // check dynamic params to be present
                    args.m.wgid.should.be.ok();
                    args.m.cid.should.be.ok();
                    args.m.pgid.should.be.ok();
                    args.u.should.be.ok().and.startWith('http://unit.test/1?').and.containEql('=unknown');

                    done();
                });

                // Make the server return articles
                setAdsHandler(() => {
                    return {
                        statusCode: 200,
                        payload: TestResponses.getExampleArticlesResponse()
                    };
                });

                // Make that placement
                new okanjo.Placement(target);
            });

            it('should should set backfill flag if present', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                // hack our sid too, just for some edge case stuff
                okanjo.metrics.sid = null;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    // backfill check
                    (() => {
                        let productLink = target.querySelectorAll('a')[0];
                        should(productLink).be.ok();

                        let baitLink = target.href;

                        let e = new window.Event('mousedown', {bubbles: true});
                        e.pageX = 1;
                        e.pageY = 2;
                        productLink.dispatchEvent(e);

                        // Verify that our link changed
                        productLink.href.should.not.be.equal(baitLink);
                        productLink.href.should.not.match(/\[bot]/);

                        let parts = Url.parse(productLink.href);
                        let args = Qs.parse(parts.query);

                        // console.log(JSON.stringify(args, null, '  '));
                        args.should.containDeep({
                            "ch": "pw",
                            "cx": "auto",
                            "key": "unit_test_key",
                            "m": {
                                // "wgid": "UkexAd-WkS",
                                "aid": "article_local_2gT3kBcwVQZ1kpEma",
                                "pten": "0",
                                "decl": "0",
                                // "cid": "L1kFZWyH",
                                "bf": "1",
                                "sf": "0",
                                "et": "Event",
                                "ex": "1",
                                "ey": "2",
                                "pw": "0",
                                "ph": "0",
                                "x1": "0",
                                "y1": "0",
                                "x2": "0",
                                "y2": "0",
                                "vx1": "0",
                                "vy1": "0",
                                "vx2": "0",
                                "vy2": "0",
                                // "pgid": "LyTObbyS",
                                "ok_ver": "%%OKANJO_VERSION"
                            },
                            "id": "product_test_2gT3kBcwVQZ1kpEma",
                            "ea": "click",
                            // "u": "http://www.shareasale.com/m-pr.cfm?merchantID=52555&userID=1241092&productID=575333915&ok_cid=L1kFZWyH&afftrack=unknown%3AL1kFZWyH&ok_msid=unknown&ok_ch=pw&ok_cx=auto"
                        });

                        // check dynamic params to be present
                        args.m.wgid.should.be.ok();
                        args.m.cid.should.be.ok();
                        args.m.pgid.should.be.ok();
                        // args.u.should.be.ok().and.startWith('http://unit.test/1?').and.containEql('=unknown');

                    })();

                    // shortfill check
                    (() => {
                        let productLink = target.querySelectorAll('a')[1];
                        should(productLink).be.ok();

                        let baitLink = target.href;

                        let e = new window.Event('mousedown', {bubbles: true});
                        e.pageX = 1;
                        e.pageY = 2;
                        productLink.dispatchEvent(e);

                        // Verify that our link changed
                        productLink.href.should.not.be.equal(baitLink);
                        productLink.href.should.not.match(/\[bot]/);

                        let parts = Url.parse(productLink.href);
                        let args = Qs.parse(parts.query);

                        // console.log(JSON.stringify(args, null, '  '));
                        args.should.containDeep({
                            "ch": "pw",
                            "cx": "auto",
                            "key": "unit_test_key",
                            "m": {
                                // "wgid": "UkexAd-WkS",
                                "aid": "article_local_2gT3kBcwVQZ1kpEma",
                                "pten": "0",
                                "decl": "0",
                                // "cid": "L1kFZWyH",
                                "bf": "0",
                                "sf": "1",
                                "et": "Event",
                                "ex": "1",
                                "ey": "2",
                                "pw": "0",
                                "ph": "0",
                                "x1": "0",
                                "y1": "0",
                                "x2": "0",
                                "y2": "0",
                                "vx1": "0",
                                "vy1": "0",
                                "vx2": "0",
                                "vy2": "0",
                                // "pgid": "LyTObbyS",
                                "ok_ver": "%%OKANJO_VERSION"
                            },
                            "id": "product_test_2gT3kBcwVQZ1kpEmb",
                            "ea": "click",
                            // "u": "http://www.shareasale.com/m-pr.cfm?merchantID=52555&userID=1241092&productID=575333915&ok_cid=L1kFZWyH&afftrack=unknown%3AL1kFZWyH&ok_msid=unknown&ok_ch=pw&ok_cx=auto"
                        });

                        // check dynamic params to be present
                        args.m.wgid.should.be.ok();
                        args.m.cid.should.be.ok();
                        args.m.pgid.should.be.ok();
                        // args.u.should.be.ok().and.startWith('http://unit.test/1?').and.containEql('=unknown');

                    })();

                    done();
                });

                // Make the server return articles
                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    payload.data.results[0].backfill = true;
                    payload.data.results[1].shortfill = true;

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                new okanjo.Placement(target);
            });
        });

        describe('_showProducts', () => {

            it('handles a busted response', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });

                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();
                    done();
                });

                placement._metricBase.m = {};
                placement._response = null;

                // Go
                //noinspection JSAccessibilityCheck
                placement._showProducts();

                placement.on('error', () => {
                    done();
                });

                // Go again
                placement._response = {};
                //noinspection JSAccessibilityCheck
                placement._showProducts();

            });

            it('handles an empty response', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let placement;
                let emptyFired = false;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    emptyFired.should.be.exactly(true);

                    done();
                });

                // Make the server return an error
                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    // Empty the results
                    payload.data.results = [];
                    payload.data.total = 0;

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                placement = new okanjo.Placement(target);

                placement.on('empty', () => {
                    emptyFired.should.be.exactly(false);
                    emptyFired = true;
                });
            });

            it('wipes out inline_buy if disabled', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key', disable_inline_buy: true });
                let placement;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    placement.config.disable_inline_buy.should.be.exactly(true);
                    should(placement._response.data.results[0]._escaped_inline_buy_url).be.exactly(undefined);

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    // Empty the results
                    payload.data.results[0].inline_buy_url = 'http://unit.test/rock';

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                placement = new okanjo.Placement(target);

            });

            it('can deal with various product data states (inline_buy, no image, backfill)', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let placement;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    should(placement._response.data.results[0]._escaped_inline_buy_url).be.ok();
                    placement._response.data.results[1].backfill.should.be.exactly(true);
                    placement._response.data.results[1]._image_url.should.be.exactly('');

                    placement._response.data.results[2].backfill.should.be.exactly(false);
                    placement._response.data.results[2].shortfill.should.be.exactly(true);

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    // Empty the results
                    payload.data.results.push(JSON.parse(JSON.stringify(payload.data.results[0])));
                    payload.data.results[2].id = 'product_test_2gT3kBcwVQZ1kpEmc';
                    payload.data.results[2].backfill = false;
                    payload.data.results[2].shortfill = true;

                    payload.data.results[0].inline_buy_url = 'http://unit.test/rock';
                    payload.data.results[1].backfill = true;
                    payload.data.results[1].image_urls = null; // lolwut

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                placement = new okanjo.Placement(target);
            });

            it('can deal with shortfill', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let placement;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    placement._response.data.backfilled.should.be.exactly(false);
                    placement._response.data.shortfilled.should.be.exactly(true);
                    placement._response.data.results[1].backfill.should.be.exactly(false);
                    placement._response.data.results[1].shortfill.should.be.exactly(true);

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    // Emulate a shortfall scenario
                    payload.data.backfilled = false;
                    payload.data.shortfilled = true;
                    payload.data.results[1].shortfill = true;

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                placement = new okanjo.Placement(target);
            });
        });

        describe('_showArticles', () => {

            it('should handle empty responses', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let firedEmpty = false;

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });

                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();

                    firedEmpty.should.be.exactly(true);

                    done();
                });

                placement._metricBase.m = {};
                placement._response = null;

                // Go
                //noinspection JSAccessibilityCheck
                placement._showArticles();

                // Go again
                placement._response = {};
                placement.on('empty', () => {
                    firedEmpty.should.be.exactly(false);
                    firedEmpty = true;
                });
                //noinspection JSAccessibilityCheck
                placement._showArticles();
            });

            it('should handle empty responses in slab template', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let firedEmpty = false;

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true, template_name: 'slab' });

                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();

                    firedEmpty.should.be.exactly(true);

                    done();
                });

                placement._metricBase.m = {};
                placement._response = null;

                // Go
                //noinspection JSAccessibilityCheck
                placement._showArticles();

                // Go again
                placement._response = {};
                placement.on('empty', () => {
                    firedEmpty.should.be.exactly(false);
                    firedEmpty = true;
                });
                //noinspection JSAccessibilityCheck
                placement._showArticles();
            });

            it('should handle article edge cases (backfill)', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let placement;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    placement._response.data.results[0].backfill.should.be.exactly(true);

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleArticlesResponse();

                    // Empty the results
                    payload.data.results[0].backfill = true;

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                placement = new okanjo.Placement(target);
            });

        });

        describe('_showADX', () => {

            it('should handle empty responses', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });

                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();

                    should(target.querySelector('iframe')).be.ok();

                    done();
                });

                placement._metricBase.m = {};
                placement._response = null;

                // Go
                //noinspection JSAccessibilityCheck
                placement._showADX();

                // Go again
                placement._response = {};
                //noinspection JSAccessibilityCheck
                placement._showADX();
            });

            it('should use a custom size name if given', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();
                    setAdsHandler();

                    let iframe = target.querySelector('iframe');
                    should(iframe).be.ok();
                    iframe.width.should.be.exactly('300');
                    iframe.height.should.be.exactly('600');

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleAdxResponse();

                    // Response sets the size
                    payload.data.settings.display.size = 'half_page';

                    return {
                        statusCode: 200,
                        payload
                    };

                });

                // We don't need to fully load to test this
                new okanjo.Placement(target);

            });

            it('should use a custom size dimensions if given', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();
                    setAdsHandler();

                    let iframe = target.querySelector('iframe');
                    should(iframe).be.ok();
                    iframe.width.should.be.exactly('728');
                    iframe.height.should.be.exactly('90');

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleAdxResponse();

                    // Response sets the size
                    payload.data.settings.display.size = '728x90';

                    return {
                        statusCode: 200,
                        payload
                    };

                });

                // We don't need to fully load to test this
                new okanjo.Placement(target);

            });

            it('should throw away a bogus custom size', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();
                    setAdsHandler();

                    let iframe = target.querySelector('iframe');
                    should(iframe).be.ok();
                    iframe.width.should.be.exactly('300');
                    iframe.height.should.be.exactly('250');

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleAdxResponse();

                    // Response sets the size
                    payload.data.settings.display.size = 'lol_wut';

                    return {
                        statusCode: 200,
                        payload
                    };

                });

                // We don't need to fully load to test this
                new okanjo.Placement(target);

            });

            it('should use custom publisher ad slot', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let placement;

                setMetricsBulkHandler(() => {
                    setMetricsBulkHandler();
                    setAdsHandler();

                    let iframe = target.querySelector('iframe');
                    should(iframe).be.ok();

                    placement.config.adx_unit_path.should.be.exactly('/my_id/my_slot:something_else');

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleAdxResponse();

                    // Response sets the size
                    payload.data.settings.display.adx_unit_path = '/my_id/my_slot:something_else';

                    return {
                        statusCode: 200,
                        payload
                    };

                });

                // We don't need to fully load to test this
                placement = new okanjo.Placement(target);
            });

            it('should track an impression', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {

                    let iframe = target.querySelector('iframe');
                    should(iframe).be.ok();

                    setAdsHandler();
                    setMetricsBulkHandler((req) => {
                        req.payload.events.length.should.be.exactly(1);
                        req.payload.events[0].event_type.should.be.exactly(okanjo.metrics.constructor.Event.impression);
                        req.payload.events[0].object_type.should.be.exactly(okanjo.metrics.constructor.Object.thirdparty_ad);
                        done();
                    });

                    // jsDom isn't going to actually load the google ad, so fake it
                    iframe.contentWindow.trackImpression();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleAdxResponse();

                    return {
                        statusCode: 200,
                        payload
                    };

                });

                // We don't need to fully load to test this
                new okanjo.Placement(target);
            });

        });

        describe('_handleProductClick', () => {

            let target, placement, b4 = (done) => {
                resetDocument();
                target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {
                    target.querySelectorAll('.okanjo-product').length.should.be.exactly(2);

                    setMetricsBulkHandler();
                    setAdsHandler();
                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleProductResponse();

                    payload.data.results[1].inline_buy_url = 'http://unit.test/cool/beans';

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                placement = new okanjo.Placement(target);
            };

            // Load the dom up with a set of products that cover our ranges
            before((done) => {
                b4(done);
            });

            after(() => {
                resetDocument();
                setAdsHandler();
                setMetricsBulkHandler();
            });

            it('should handle a standard click w/o anything fancy', () => {
                let anchor = target.querySelector('a');
                let beforeLink = anchor.href;
                let event = new window.Event('click', {bubbles: true});
                event.pageX = 42;
                event.pageY = 43;

                setMetricsHandler(() => {
                    console.log('omg jsdom followed it?');

                });

                anchor.dispatchEvent(event);

                // the click should have triggered the "mousedown" event to go, cuz of the explicit call
                anchor.href.should.not.be.equal(beforeLink);

                let parts = Url.parse(anchor.href);
                let args = Qs.parse(parts.query);

                args.should.containDeep({
                    ch: 'pw',
                    cx: 'auto',
                    key: 'unit_test_key',
                    m: {
                        wgid: placement.instanceId,
                        aid: 'article_local_2gT3kBcwVQZ1kpEma',
                        pten: '0',
                        decl: '0',
                        // key: 'unit_test_key',
                        pw: '0',
                        ph: '0',
                        x1: '0',
                        y1: '0',
                        x2: '0',
                        y2: '0',
                        vx1: '0',
                        vy1: '0',
                        vx2: '0',
                        vy2: '0',
                        bf: '0',
                        // cid: '8yXgXzRm',
                        et: 'Event',
                        ex: '42',
                        ey: '43',
                        pgid: okanjo.metrics.pageId,
                        ok_ver: '%%OKANJO_VERSION'
                    },
                    id: 'product_test_2gT3kBcwVQZ1kpEma',
                    ea: 'click',
                    // u: 'http://www.shareasale.com/m-pr.cfm?merchantID=52555&userID=1241092&productID=575333915&ok_cid=8yXgXzRm&afftrack=MTunittesting1%3A8yXgXzRm&ok_msid=MTunittesting1&ok_ch=pw&ok_cx=auto',
                    sid: 'MTunittesting1'
                });

                args.u.should.be.ok();
                args.m.cid.should.be.ok();
                args.win.should.be.ok();

                setMetricsHandler();
            });

            it('should should be ok with mousedown already occurring', () => {
                let anchor = target.querySelector('a');
                let beforeLink = anchor.href;

                let clickEvent = new window.Event('click', {bubbles: true});
                clickEvent.pageX = 42;
                clickEvent.pageY = 43;

                let downEvent = new window.Event('mousedown', {bubbles: true});
                clickEvent.pageX = 42;
                clickEvent.pageY = 43;

                anchor.dispatchEvent(downEvent);

                // the click should have triggered the "mousedown" event to go, cuz of the explicit call
                anchor.href.should.not.be.equal(beforeLink);

                anchor.dispatchEvent(clickEvent);
            });

            it('should show the modal for inline buy', (done) => {
                let anchor = target.querySelectorAll('a')[1];

                let clickEvent = new window.Event('click', {bubbles: true});
                clickEvent.pageX = 42;
                clickEvent.pageY = 43;

                anchor.dispatchEvent(clickEvent);

                // we should be seeing a modal now
                let modal = document.querySelector('.okanjo-modal-container');
                should(modal).be.ok();

                let iframe = modal.querySelector('iframe');
                should(iframe).be.ok();

                let parts = Url.parse(iframe.src);
                let args = Qs.parse(parts.query);

                args.should.containDeep({
                    ch: 'pw',
                    cx: 'auto',
                    key: 'unit_test_key',
                    m: {
                        wgid: placement.instanceId,
                        aid: 'article_local_2gT3kBcwVQZ1kpEma',
                        pten: '0',
                        decl: '0',
                        // key: 'unit_test_key',
                        pw: '0',
                        ph: '0',
                        x1: '0',
                        y1: '0',
                        x2: '0',
                        y2: '0',
                        vx1: '0',
                        vy1: '0',
                        vx2: '0',
                        vy2: '0',
                        bf: '0',
                        // cid: 'LyOVRjMAQ',
                        et: 'Event',
                        ex: '42',
                        ey: '43',
                        expandable: 'true',
                        pgid: okanjo.metrics.pageId,
                        ok_ver: '%%OKANJO_VERSION'
                    },
                    id: 'product_test_2gT3kBcwVQZ1kpEmb',
                    ea: 'inline_click',
                    // u: 'http://unit.test/cool/beans?ok_cid=LyOVRjMAQ&afftrack=MTunittesting1%3ALyOVRjMAQ&ok_msid=MTunittesting1&ok_ch=pw&ok_cx=auto&expandable=1',
                    sid: 'MTunittesting1'
                });

                args.u.should.be.ok();
                args.win.should.be.ok();
                args.m.cid.should.be.ok();

                parts = Url.parse(args.u);
                args = Qs.parse(parts.query);

                args.should.containDeep({
                    // ok_cid: 'L1qgmnMA7',
                    // afftrack: 'MTunittesting1:L1qgmnMA7',
                    ok_msid: 'MTunittesting1',
                    ok_ch: 'pw',
                    ok_cx: 'auto',
                    expandable: '1'
                });

                args.ok_cid.should.be.ok();
                args.afftrack.should.be.ok();

                // close the modal
                modal.dispatchEvent(clickEvent);
                setTimeout(() => {
                    // it should be hidden now
                    document.querySelector('.okanjo-modal-container.okanjo-modal-hidden').should.be.ok();
                    done();
                }, 225);
            });

            it('should handle non-expandable inline buy ux', () => {
                let anchor = target.querySelectorAll('a')[1];

                let clickEvent = new window.Event('click', {bubbles: true});
                clickEvent.pageX = 42;
                clickEvent.pageY = 43;

                // hack it
                placement.config.expandable = false;

                anchor.dispatchEvent(clickEvent);

                // we should be seeing a modal now

                let iframe = target.querySelector('iframe');
                should(iframe).be.ok();

                let parts = Url.parse(iframe.src);
                let args = Qs.parse(parts.query);

                args.should.containDeep({
                    ch: 'pw',
                    cx: 'auto',
                    key: 'unit_test_key',
                    m: {
                        wgid: placement.instanceId,
                        aid: 'article_local_2gT3kBcwVQZ1kpEma',
                        pten: '0',
                        decl: '0',
                        // key: 'unit_test_key',
                        pw: '0',
                        ph: '0',
                        x1: '0',
                        y1: '0',
                        x2: '0',
                        y2: '0',
                        vx1: '0',
                        vy1: '0',
                        vx2: '0',
                        vy2: '0',
                        bf: '0',
                        // cid: 'Ly90ziGRQ',
                        et: 'Event',
                        ex: '42',
                        ey: '43',
                        expandable: 'false',
                        pgid: okanjo.metrics.pageId,
                        ok_ver: '%%OKANJO_VERSION'
                    },
                    id: 'product_test_2gT3kBcwVQZ1kpEmb',
                    ea: 'inline_click',
                    // u: 'http://unit.test/cool/beans?ok_cid=Ly90ziGRQ&afftrack=MTunittesting1%3ALy90ziGRQ&ok_msid=MTunittesting1&ok_ch=pw&ok_cx=auto&expandable=0&frame_height=0&frame_width=0',
                    sid: 'MTunittesting1'
                });

                args.u.should.be.ok();
                args.m.cid.should.be.ok();

                parts = Url.parse(args.u);
                args = Qs.parse(parts.query);

                args.should.containDeep({
                    // ok_cid: 'Uyq15iGRQ',
                    // afftrack: 'MTunittesting1:Uyq15iGRQ',
                    ok_msid: 'MTunittesting1',
                    ok_ch: 'pw',
                    ok_cx: 'auto',
                    expandable: '0',
                    frame_height: '0',
                    frame_width: '0'
                });

                args.ok_cid.should.be.ok();
                args.afftrack.should.be.ok();

                // Pull this thing off the dom, cuz we have no close button lol
                iframe.parentNode.removeChild(iframe);
                placement.config.expandable = true;
            });

            it('should pop a window if on mobile', (done) => {

                // Fudge the UA
                TestUtil.cleanEnvironment();
                TestUtil.setupEnvironment({
                    userAgent: 'iPhone/8,1'
                });

                // Reload okanjo with the new UA
                setup(() => {
                    b4(() => {
                        // Make sure our reload worked before executing tests
                        window.okanjo.util.isMobile().should.be.exactly(true);

                        let anchor = target.querySelectorAll('a')[1];

                        let clickEvent = new window.Event('click', {bubbles: true});
                        clickEvent.pageX = 42;
                        clickEvent.pageY = 43;

                        anchor.dispatchEvent(clickEvent);

                        // jsdom window.open and window.location.href (Set) is not implemented so this will get noisy

                        // Revert
                        // Revert
                        TestUtil.cleanEnvironment();
                        TestUtil.setupEnvironment();
                        setup(() => {
                            b4(done);
                        });
                    })
                });
            });
        });

        describe('_handleArticleClick', () => {

            it('should handle a standard click', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });
                let placement;

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    // Click it or ticket™
                    let anchor = target.querySelector('a');
                    let beforeLink = anchor.href;
                    let event = new window.Event('click', {bubbles: true});
                    event.pageX = 42;
                    event.pageY = 43;

                    anchor.dispatchEvent(event);

                    // the click should have triggered the "mousedown" event to go, cuz of the explicit call
                    anchor.href.should.not.be.equal(beforeLink);

                    let parts = Url.parse(anchor.href);
                    let args = Qs.parse(parts.query);

                    args.should.containDeep({
                        ch: 'pw',
                        cx: 'auto',
                        key: 'unit_test_key',
                        m: {
                            wgid: placement.instanceId,
                            pten: '0',
                            decl: '0',
                            display_size: 'half_page',
                            display_template_layout: 'list',
                            display_template_cta_style: 'link',
                            // key: 'unit_test_key',
                            pw: '0',
                            ph: '0',
                            x1: '0',
                            y1: '0',
                            x2: '0',
                            y2: '0',
                            vx1: '0',
                            vy1: '0',
                            vx2: '0',
                            vy2: '0',
                            bf: '0',
                            // cid: 'UJfMhbX0X',
                            et: 'Event',
                            ex: '42',
                            ey: '43',
                            pgid: okanjo.metrics.pageId,
                            ok_ver: '%%OKANJO_VERSION'
                        },
                        id: 'article_test_2gWFnrrPHhoJPDQoF',
                        ea: 'click',
                        // u: 'http://unit.test/1?ok_cid=UJfMhbX0X&ok_msid=MTunittesting1&ok_ch=pw&ok_cx=auto',
                        sid: 'MTunittesting1'
                    });

                    args.u.should.be.ok();
                    args.m.cid.should.be.ok();

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleArticlesResponse();

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                placement = new okanjo.Placement(target);
            });

            it('should be ok with the standard down-before-click thing', (done) => {
                resetDocument();
                let target = insertDropzone({ key: 'unit_test_key' });

                setMetricsBulkHandler(() => {

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    // Click it or ticket™
                    let anchor = target.querySelector('a');
                    let beforeLink = anchor.href;

                    let clickEvent = new window.Event('click', {bubbles: true});
                    clickEvent.pageX = 42;
                    clickEvent.pageY = 43;

                    let downEvent = new window.Event('mousedown', {bubbles: true});
                    clickEvent.pageX = 42;
                    clickEvent.pageY = 43;

                    anchor.dispatchEvent(downEvent);

                    // the click should have triggered the "mousedown" event to go, cuz of the explicit call
                    anchor.href.should.not.be.equal(beforeLink);

                    anchor.dispatchEvent(clickEvent);

                    done();
                });

                setAdsHandler(() => {
                    const payload = TestResponses.getExampleArticlesResponse();

                    return {
                        statusCode: 200,
                        payload
                    };
                });

                // Make that placement
                new okanjo.Placement(target);
            });

        });

        describe('_enforceLayoutOptions', () => {

            it('leaderboard/large_mobile_banner should force layout and cta to list/link', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'leaderboard',
                    template_layout: 'grid',
                    template_cta_style: 'button'
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceLayoutOptions();
                placement.config.template_layout.should.be.exactly('list');
                placement.config.template_cta_style.should.be.exactly('link');

                resetDocument();
                target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'large_mobile_banner',
                    template_layout: 'grid',
                    template_cta_style: 'button'
                });

                // We don't need to fully load to test this
                placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceLayoutOptions();
                placement.config.template_layout.should.be.exactly('list');
                placement.config.template_cta_style.should.be.exactly('link');
            });

            it('half_page/auto should force layout to list', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'half_page',
                    template_layout: 'grid'
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceLayoutOptions();
                placement.config.template_layout.should.be.exactly('list');

                resetDocument();
                target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'auto',
                    template_layout: 'grid'
                });

                // We don't need to fully load to test this
                placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceLayoutOptions();
                placement.config.template_layout.should.be.exactly('list');
            });
        });

        describe('_enforceSlabLayoutOptions', () => {

            it('medium_rectangle / billboard is grid with no buttons', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'billboard',
                    type: 'articles',
                    template_name: 'slab',
                    template_layout: 'list',        // forces to grid
                    template_cta_style: 'button'    // forces to link
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('grid');
                placement.config.template_cta_style.should.be.exactly('link');

                resetDocument();
                target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'medium_rectangle',
                    type: 'articles',
                    template_name: 'slab',
                    template_layout: 'list',        // forces to grid
                    template_cta_style: 'none'
                });

                // We don't need to fully load to test this
                placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('grid');
                placement.config.template_cta_style.should.be.exactly('none');
            });

            it('half_page is always grid', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'half_page',
                    type: 'articles',
                    template_name: 'slab',
                    template_layout: 'list',        // forces to grid
                    template_cta_style: 'button'
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('grid');
                placement.config.template_cta_style.should.be.exactly('button');

            });

            it('leaderboard / large_mobile_banner is always list with no button', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'leaderboard',
                    type: 'articles',
                    template_name: 'slab',
                    template_layout: 'grid',        // forces to list
                    template_cta_style: 'button'    // forces to link
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('list');
                placement.config.template_cta_style.should.be.exactly('link');

                resetDocument();
                target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'large_mobile_banner',
                    type: 'articles',
                    template_name: 'slab',
                    template_layout: 'grid',        // forces to list
                    template_cta_style: 'none'
                });

                // We don't need to fully load to test this
                placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('list');
                placement.config.template_cta_style.should.be.exactly('none');

            });

            it('auto is always list', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    size: 'auto',
                    type: 'articles',
                    template_name: 'slab',
                    template_layout: 'grid',        // forces to list
                    template_cta_style: 'button'
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('list');
                placement.config.template_cta_style.should.be.exactly('button');

            });

            it('default is unchanged', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    type: 'articles',
                    template_name: 'slab',
                    template_layout: 'grid',
                    template_cta_style: 'button'
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('grid');
                placement.config.template_cta_style.should.be.exactly('button');

            });

            it('no responsive buttons', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    type: 'articles',
                    size: 'responsive',
                    template_name: 'slab',
                    template_layout: 'grid',
                    template_cta_style: 'button'
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('grid');
                placement.config.template_cta_style.should.be.exactly('link');

                resetDocument();
                target = insertDropzone({
                    key: 'unit_test_key',
                    type: 'articles',
                    size: 'responsive',
                    template_name: 'slab',
                    template_layout: 'grid',
                    template_cta_style: 'none'
                });

                // We don't need to fully load to test this
                placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._enforceSlabLayoutOptions();
                placement.config.template_layout.should.be.exactly('grid');
                placement.config.template_cta_style.should.be.exactly('none');

            });

        });

        describe('_registerCustomBranding', () => {

            it('should register a custom stylesheet when color is set', () => {
                resetDocument();
                let target = insertDropzone({
                    key: 'unit_test_key',
                    template_cta_color: '#ff0000'
                });

                // We don't need to fully load to test this
                let placement = new okanjo.Placement(target, { no_init: true });
                placement._applyConfiguration();

                //noinspection JSAccessibilityCheck
                placement._registerCustomBranding('.okanjo-product', 'buy-button');
                document.documentElement.innerHTML.should.containEql('.okanjo-product-buy-button { color: #ff0000;');
            });

        });

    });

    describe('Viewability', () => {

        it('can track basic viewability on products ', (done) => {

            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key' });
            let placement;

            setMetricsBulkHandler((req) => {

                // widget + 3 product impressions
                req.payload.events.length.should.be.exactly(4);

                setMetricsBulkHandler((req) => {

                    let bf = 0;
                    let sf = 0;
                    let fl = 0;

                    // widget + 2 product impressions
                    req.payload.events.length.should.be.exactly(4);
                    req.payload.events.forEach((e) => {
                        e.event_type.should.be.exactly('vw');

                        if (e.m.bf === 1) {
                            bf++;
                        } else if (e.m.sf === 1) {
                            sf++;
                        } else if (e.object_type === 'pr') {
                            fl++;
                        }

                    });

                    bf.should.be.exactly(1);
                    sf.should.be.exactly(1);
                    fl.should.be.exactly(1);

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    // should(placement._response.data.results[0]._escaped_inline_buy_url).be.ok();
                    // placement._response.data.results[1].backfill.should.be.exactly(true);
                    // placement._response.data.results[1]._image_url.should.be.exactly('');

                    done();

                });

                // Fake some scrolling into view action
                setTimeout(() => {

                    // First, make sure we have 4 active view impression watchers (widget + 3 products)
                    placement._viewedWatchers.length.should.be.exactly(4);

                    // Fake that they entered the view
                    placement._viewedWatchers.forEach((controller) => {
                        controller.successfulCount = 2; // MINIMUM_VIEW_FREQ
                    });

                    // Now we wait for the next tick to deliver another bulk metrics report of views

                }, 10);
            });

            setAdsHandler(() => {
                const payload = TestResponses.getExampleProductResponse();

                // add an extra product
                payload.data.results.push(JSON.parse(JSON.stringify(payload.data.results[0])));
                payload.data.results[2].id = 'product_test_2gT3kBcwVQZ1kpEmc';
                payload.data.results[2].backfill = false;
                payload.data.results[2].shortfill = true;

                // edge case for view events
                payload.data.results[1].backfill = true;

                return {
                    statusCode: 200,
                    payload
                };
            });

            // Make that placement
            placement = new okanjo.Placement(target);

        });

        it('can track basic viewability on articles ', (done) => {

            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key' });
            let placement;

            setMetricsBulkHandler((req) => {

                // widget + 5 article impressions
                req.payload.events.length.should.be.exactly(6);

                setMetricsBulkHandler((req) => {

                    let bf = 0;
                    let sf = 0;
                    let nf = 0;

                    // widget + 5 article impressions
                    req.payload.events.length.should.be.exactly(6);
                    req.payload.events.forEach((e) => {
                        e.event_type.should.be.exactly('vw');

                        if (e.m.bf === 1) {
                            bf++;
                        } else if (e.m.sf === 1) {
                            sf++;
                        } else if (e.object_type === 'am') {
                            nf++;
                        }
                    });

                    bf.should.be.exactly(1);
                    sf.should.be.exactly(1);
                    nf.should.be.exactly(3);

                    // Clean up
                    setMetricsBulkHandler();
                    setAdsHandler();

                    // should(placement._response.data.results[0]._escaped_inline_buy_url).be.ok();
                    // placement._response.data.results[1].backfill.should.be.exactly(true);
                    // placement._response.data.results[1]._image_url.should.be.exactly('');

                    done();

                });

                // Fake some scrolling into view action
                setTimeout(() => {

                    // First, make sure we have 3 active view impression watchers (widget + 2 products)
                    placement._viewedWatchers.length.should.be.exactly(6);

                    // Fake that they entered the view
                    placement._viewedWatchers.forEach((controller) => {
                        controller.successfulCount = 2; // MINIMUM_VIEW_FREQ
                    });

                    // Now we wait for the next tick to deliver another bulk metrics report of views

                }, 10);
            });

            setAdsHandler(() => {
                const payload = TestResponses.getExampleArticlesResponse();

                // edge case for view events
                payload.data.results[0].backfill = true;
                payload.data.results[1].shortfill = true;

                return {
                    statusCode: 200,
                    payload
                };
            });

            // Make that placement
            placement = new okanjo.Placement(target);

        });

        it('should track an viewability on adx', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key' });
            let placement;

            setMetricsBulkHandler(() => {

                let iframe = target.querySelector('iframe');
                should(iframe).be.ok();

                setAdsHandler();
                setMetricsBulkHandler((req) => {
                    req.payload.events.length.should.be.exactly(1);
                    req.payload.events[0].event_type.should.be.exactly(okanjo.metrics.constructor.Event.impression);
                    req.payload.events[0].object_type.should.be.exactly(okanjo.metrics.constructor.Object.thirdparty_ad);

                    setMetricsBulkHandler((req) => {

                        // widget + adx view
                        req.payload.events.length.should.be.exactly(2);
                        req.payload.events.forEach((e) => {
                            e.event_type.should.be.exactly('vw');
                        });

                        // Clean up
                        setMetricsBulkHandler();
                        setAdsHandler();

                        // should(placement._response.data.results[0]._escaped_inline_buy_url).be.ok();
                        // placement._response.data.results[1].backfill.should.be.exactly(true);
                        // placement._response.data.results[1]._image_url.should.be.exactly('');

                        done();

                    });

                    // Fake some scrolling into view action
                    setTimeout(() => {

                        // First, make sure we have 3 active view impression watchers (widget + 2 products)
                        placement._viewedWatchers.length.should.be.exactly(2);

                        // Fake that they entered the view
                        placement._viewedWatchers.forEach((controller) => {
                            controller.successfulCount = 2; // MINIMUM_VIEW_FREQ
                        });

                        // Now we wait for the next tick to deliver another bulk metrics report of views

                    }, 10);

                    done();
                });

                // jsDom isn't going to actually load the google ad, so fake it
                iframe.contentWindow.trackImpression();
            });

            setAdsHandler(() => {
                const payload = TestResponses.getExampleAdxResponse();

                return {
                    statusCode: 200,
                    payload
                };

            });

            // We don't need to fully load to test this
            placement = new okanjo.Placement(target);
        });

    });

});