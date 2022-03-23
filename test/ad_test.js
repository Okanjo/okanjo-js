"use strict";

const TestUtil = require('./_test_util');
const TestResponses = require('./_test_responses');
const should = require('should');

describe('Ad', () => {

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
        TestUtil.reloadAd();
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
            let placement = new okanjo.Ad(target, { no_init: true });

            target.innerHTML.should.be.empty();
            should(placement.config.skip).be.exactly(undefined);
        });

    });

    describe('Use Cases', () => {

        it('should bark if no id is set', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key' });
            let placement;

            setAdsHandler(() => {
                let payload = TestResponses.getExampleProductResponse();
                payload.data.results = [payload.data.results[0]]; // only 1
                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').should.have.length(1);

                placement.config.backwards.should.be.exactly('Ad');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Ad(target);
        });

        it('should show a specific product (standard use case)', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key', id: 'PR12345' });
            let placement;

            setAdsHandler((req) => {

                let args = req.payload;
                args.filters.ids.should.be.an.Array();
                args.filters.ids[0].should.be.exactly('PR12345');

                let payload = TestResponses.getExampleProductResponse();
                payload.data.results = [payload.data.results[0]]; // only 1
                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').should.have.length(1);

                placement.config.backwards.should.be.exactly('Ad');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Ad(target);
            should(placement.config.id).be.exactly(undefined);
            placement.config.ids.should.deepEqual(['PR12345']);
        });

        it('should clobber creative, because we do not support that anymore', (done) => {
            resetDocument();
            let target = insertDropzone({ key: 'unit_test_key', id: 'PR12345' });
            let placement;

            target.innerHTML = '<img src="http://unit.test/creative" alt="" />';

            setAdsHandler(() => {
                let payload = TestResponses.getExampleProductResponse();
                payload.data.results = [payload.data.results[0]]; // only 1
                return {
                    statusCode: 200,
                    payload
                }
            });

            setMetricsBulkHandler(() => {

                // Check the markup
                target.querySelectorAll('.okanjo-product').should.have.length(1);
                target.innerHTML.should.not.containEql('http://unit.test/creative');

                // Cleanup
                setAdsHandler();
                setMetricsBulkHandler();

                done();
            });

            placement = new okanjo.Ad(target);
            should(placement.config.id).be.exactly(undefined);
            placement.config.ids.should.deepEqual(['PR12345']);
        });

    });

});