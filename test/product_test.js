"use strict";

const TestUtil = require('./_test_util');
const TestResponses = require('./_test_responses');
const should = require('should');

describe('Product', () => {

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
        okanjo.net.sandboxEndpoint = `http://localhost:${server.port}`;

        TestUtil.reloadCookie();
        TestUtil.reloadMetrics();
        TestUtil.reloadModal();
        TestUtil.reloadTemplateEngine();
        TestUtil.reloadEventEmitter();
        TestUtil.reloadWidget();
        TestUtil.reloadPlacement();
        TestUtil.reloadProduct();
        TestUtil.reloadAppTemplates(callback);

    };

    const resetDocument = TestUtil.resetDocument.bind(TestUtil);
    const insertDropzone = TestUtil.insertDropzone.bind(TestUtil);
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
    const debug = () => { // eslint-disable-line no-unused-vars
        console.log(document.documentElement.innerHTML);
    };

    describe('Construction', () => {

        it('should not initialize if told not to', () => {
            resetDocument();
            let target = insertDropzone({ skip: 4 });
            let placement = new okanjo.Product(target, { no_init: true });

            target.innerHTML.should.be.empty();
            should(placement.config.skip).be.exactly(undefined);
        });

    });

    describe('Use Cases', () => {

        it('should convert sense mode widgets', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key', mode: 'sense' });
            let placement;

            setAdsHandler((req) => {

                let args = req.payload;
                args.filters.url.should.be.exactly('referrer');
                args.filters.url_referrer.should.be.exactly('https://example.com/');
                args.filters.take.should.be.exactly(5); // this was the old default

                let payload = TestResponses.getExampleProductResponse();

                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').length.should.be.greaterThan(1);

                placement.config.backwards.should.be.exactly('Product');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Product(target);
            should(placement.config.mode).be.exactly(undefined);
            should(placement.config.url).be.exactly('referrer');
            should(placement.config.take).be.exactly(5);
        });

        it('should convert single mode widgets', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key', mode: 'single' });
            let placement;

            setAdsHandler((req) => {

                let args = req.payload;
                args.filters.url.should.be.exactly('');
                args.filters.url_referrer.should.be.exactly('https://example.com/');
                args.filters.take.should.be.exactly(1); // this was the old default

                let payload = TestResponses.getExampleProductResponse();

                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').length.should.be.greaterThan(1);

                placement.config.backwards.should.be.exactly('Product');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Product(target);
            should(placement.config.mode).be.exactly(undefined);
            should(placement.config.id).be.exactly(undefined);
            should(placement.config.url).be.exactly(null);
            should(placement.config.take).be.exactly(1);
        });

        it('should convert single mode widgets with id', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key', mode: 'single', id: 'PR12345' });
            let placement;

            setAdsHandler((req) => {

                let args = req.payload;
                args.filters.url.should.be.exactly('');
                args.filters.ids.should.deepEqual(['PR12345']);
                args.filters.url_referrer.should.be.exactly('https://example.com/');
                args.filters.take.should.be.exactly(1); // this was the old default

                let payload = TestResponses.getExampleProductResponse();

                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').length.should.be.greaterThan(1);

                placement.config.backwards.should.be.exactly('Product');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Product(target);
            should(placement.config.mode).be.exactly(undefined);
            should(placement.config.id).be.exactly(undefined);
            should(placement.config.url).be.exactly(null);
            should(placement.config.take).be.exactly(1);
        });

        it('should convert browse mode widgets with mode set', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key', mode: 'browse' });
            let placement;

            setAdsHandler((req) => {

                let args = req.payload;
                args.filters.url.should.be.exactly('');
                args.filters.url_referrer.should.be.exactly('https://example.com/');
                args.filters.take.should.be.exactly(25); // this was the old default

                let payload = TestResponses.getExampleProductResponse();

                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').length.should.be.greaterThan(1);

                placement.config.backwards.should.be.exactly('Product');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Product(target);
            should(placement.config.mode).be.exactly(undefined);
            should(placement.config.url).be.exactly(null);
            should(placement.config.take).be.exactly(25); // that was the old default lol
        });

        it('should convert browse mode widgets with no mode set', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key' });
            let placement;

            setAdsHandler((req) => {

                let args = req.payload;
                args.filters.url.should.be.exactly('');
                args.filters.url_referrer.should.be.exactly('https://example.com/');
                args.filters.take.should.be.exactly(25); // this was the old default

                let payload = TestResponses.getExampleProductResponse();

                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').length.should.be.greaterThan(1);

                placement.config.backwards.should.be.exactly('Product');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Product(target);
            should(placement.config.mode).be.exactly(undefined);
            should(placement.config.url).be.exactly(null);
            should(placement.config.take).be.exactly(25); // that was the old default lol
        });

        it('should convert old parameters where applicable', (done) => {
            resetDocument();
            let target = insertDropzone({
                key: 'unit_test_key',
                sold_by: 'okanjo',
                selectors: 'a,img,lol',
                marketplace_id: 'MPasdf1234',
                marketplace_status: 'testing'
            });
            let placement;

            setAdsHandler((req) => {

                let args = req.payload;
                args.filters.url.should.be.exactly('');
                args.filters.url_referrer.should.be.exactly('https://example.com/');
                args.filters.take.should.be.exactly(25); // this was the old default
                args.filters.store_name.should.be.exactly('okanjo');
                args.filters.url_selectors.should.be.exactly('a,img,lol');
                args.filters.property_id.should.be.exactly('MPasdf1234');

                let payload = TestResponses.getExampleProductResponse();

                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').length.should.be.greaterThan(1);

                placement.config.backwards.should.be.exactly('Product');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Product(target);
            should(placement.config.mode).be.exactly(undefined);
            should(placement.config.sold_by).be.exactly(undefined);
            should(placement.config.selectors).be.exactly(undefined);
            should(placement.config.marketplace_id).be.exactly(undefined);
            should(placement.config.marketplace_status).be.exactly(undefined);
            should(placement.config.url).be.exactly(null);
            should(placement.config.take).be.exactly(25); // that was the old default lol
            should(placement.config.store_name).be.exactly('okanjo'); // that was the old default lol
            should(placement.config.property_id).be.exactly('MPasdf1234'); // that was the old default lol
            should(placement.config.sandbox).be.exactly(true); // that was the old default lol
        });

    });

});