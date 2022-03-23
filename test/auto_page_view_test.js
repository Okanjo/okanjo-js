"use strict";

const TestUtil = require('./_test_util');
const should = require('should');

describe('AutoPageView', () => {

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

        // make sure it requires
        TestUtil.reloadCookie();
        TestUtil.reloadMetrics();
        callback();
    };

    const resetDocument = TestUtil.resetDocument.bind(TestUtil);
    const setMetricsBulkHandler = TestUtil.setMetricsBulkHandler.bind(TestUtil);

    before((done) => {
        // make us a dom
        TestUtil.setupEnvironment();

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

    describe('Plugin', () => {

        it('should require and send a page view', (done) => {
            resetDocument();

            let fired = false;

            setMetricsBulkHandler((req) => {

                should(fired).be.exactly(false);
                fired = true;

                req.payload.events.length.should.be.exactly(1);
                req.payload.events[0].object_type.should.be.exactly('pg');
                req.payload.events[0].event_type.should.be.exactly('vw');

                setMetricsBulkHandler();
                done();
            });

            // Do it
            require('../src/AutoPageView');
        });

    });

});