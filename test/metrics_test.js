"use strict";

const TestUtil = require('./_test_util');
const should = require('should');
const Url = require('url');
const Qs = require('qs');

describe('Metrics', () => {

    let okanjo;
    let server, doneWithServer;

    const setup = () => {
        // get okanjo on the dom
        TestUtil.reloadOkanjo();

        // update shortcut pointer
        okanjo = window.okanjo;
        global.okanjo = okanjo;

        // make sure it requires
        TestUtil.reloadRequest();
        TestUtil.reloadCookie();
        TestUtil.reloadMetrics();

        okanjo.net.endpoint = `http://localhost:${server.port}`;
    };

    before((done) => {
        // make us a dom
        TestUtil.setupEnvironment();


        // mock the server to inspect request payloads
        TestUtil.mockServer((mocker, endServer) => {
            server = mocker;
            doneWithServer = endServer;

            // add our junk
            setup();

            done();
        });
    });

    after((done) => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();

        doneWithServer(done);
    });
    
    describe('Fluent MetricEvent builder', () => {
        
        it('should build metric payloads accurately', (done) => {

            const e = new window.Event('click', { bubbles: true });
            e.pageX = 1;
            e.pageY = 2;
            
            const el = document.createElement('div');
            document.body.appendChild(el);
            
            const event = okanjo.metrics.create({ a: 1 }, { b: 2 })
                .data({ c: 3 })
                .event(e)
                .element(el)
                .viewport()
                .meta({ d: 4, e: [ 5, 6, "7" ]})
                .type('unit', 'test');
            
            event.should.containDeep({
                a: 1,
                b: 2,
                c: 3,
                m: { 
                    et: 'Event',
                    ex: 1,
                    ey: 2,
                    pw: 0,
                    ph: 0,
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0,
                    vx1: 0,
                    vy1: 0,
                    vx2: 0,
                    vy2: 0,
                    d: 4,
                    e: [ 5, 6, '7' ] 
                },
                object_type: 'unit',
                event_type: 'test' 
            });
            
            let url = event.toUrl();
            let parts = Url.parse(url);
            let args = Qs.parse(parts.query);
            
            let pageId = okanjo.metrics.pageId;
            
            args.should.deepEqual({ 
                a: '1',
                b: '2',
                c: '3',
                m: { 
                    et: 'Event',
                    ex: '1',
                    ey: '2',
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
                    d: '4',
                    e: '5,6,7',
                    pgid: pageId,
                    ok_ver: '%%OKANJO_VERSION',
                },
                win: 'about:blank'
            });


            // Register a route to test the response
            server.routes.push({
                method: 'POST',
                path: okanjo.net.routes.metrics_batch,
                handler: (req, reply) => {
                    
                    let payload = JSON.parse(req.payload);
                    
                    payload.should.deepEqual({ 
                        events: [ 
                            { 
                                a: 1,
                                b: 2,
                                c: 3,
                                m: {
                                    et: 'Event',
                                    ex: 1,
                                    ey: 2,
                                    pw: 0,
                                    ph: 0,
                                    x1: 0,
                                    y1: 0,
                                    x2: 0,
                                    y2: 0,
                                    vx1: 0,
                                    vy1: 0,
                                    vx2: 0,
                                    vy2: 0,
                                    d: 4,
                                    e: '5,6,7',
                                    pgid: pageId,
                                    ok_ver: '%%OKANJO_VERSION'
                                },
                                object_type: 'unit',
                                event_type: 'test' 
                            } 
                        ],
                        win: 'about:blank'
                    });
                    
                    reply({
                        statusCode: 200,
                        payload: {
                            statusCode: 200,
                            data: {
                                sid: 'MTunittesting1'
                            }
                        }
                    });
                }
            });
            
            // Send the event and wait for ack
            event.send((err, res) => {
                setImmediate(() => { // failed asseration breaker - jsdom try-catches here
                    should(err).not.be.ok();
                    should(res).be.ok();
                    res.statusCode.should.be.exactly(200);
                    res.data.should.be.ok();
                    res.data.sid.should.be.exactly('MTunittesting1');

                    // Remove our route from the stack
                    server.routes.pop();

                    done();
                });
            });

        });

        it('should create an event without anything for some reason', () => {
            let event = okanjo.metrics.create();
            event.should.be.ok();

            event = okanjo.metrics.create(null);
            event.should.be.ok();
        });

        it('should handle blank edge cases', () => {

            let Metrics = okanjo.metrics.constructor;

            let el = document.createElement('div');
            document.body.appendChild(el);

            let event = null;
            event = Metrics.addElementInfo(el, event);
            event.should.be.ok();
            event.m.should.be.ok();

            event = null;
            event = Metrics.addViewportInfo(event);
            event.should.be.ok();
            event.m.should.be.ok();

            let e = new window.Event('click');
            e.pageX = 0;
            e.pageY = 0;
            event = null;
            event = Metrics.addEventInfo(e, event);
            event.should.be.ok();
            event.m.should.be.ok();

            event = null;
            event = Metrics.addEventMeta(event, {a:1});
            event.should.be.ok();
            event.m.should.be.ok();

        });

        it('should not leak base data', () => {

            const base = { a: 1, m: { b: 2 } };
            const meta = { vx: 1, vy: 2 };
            const meta2 = { x: 3, y: 4 };
            const event = okanjo.metrics.create(base).type('obj', 'evt').meta(meta).meta(meta2);

            should(event.m.vx).be.exactly(1);
            should(event.m.vy).be.exactly(2);

            should(base.m.vx).be.exactly(undefined);
            should(base.m.vy).be.exactly(undefined);

            should(meta.x).be.exactly(undefined);
            should(meta.y).be.exactly(undefined);
            should(meta.y).be.exactly(undefined);

        });
        
    });

    describe('Methods', () => {

        describe('_getStoredQueue', () => {

            let Metrics;

            it('should load from storage if present', () => {

                Metrics = okanjo.metrics.constructor;

                // Save a queue
                okanjo.metrics._queue = [ { happy: 'face' } ];
                okanjo.metrics._saveQueue(false);

                // Load it
                let queue = okanjo.metrics._getStoredQueue();

                // Verify
                queue.should.deepEqual([ { happy: 'face' } ]);
                okanjo.metrics._queue = [];
                okanjo.metrics._saveQueue(false);
            });

            it('should discard garbage', () => {
                okanjo.metrics._queue = "poop";
                okanjo.metrics._saveQueue(false);

                let queue = okanjo.metrics._getStoredQueue();

                queue.should.be.an.Array().and.be.empty();
                okanjo.metrics._queue = [];
                okanjo.metrics._saveQueue(false);
            });

            it('should deal with busted json', () => {

                window.localStorage[Metrics.Params.queue] = '{notjson"';

                let queue = okanjo.metrics._getStoredQueue();

                queue.should.be.an.Array().and.be.empty();
                okanjo.metrics._queue = [];
                okanjo.metrics._saveQueue(false);
            });

        });

        describe('_saveQueue', () => {

            it('should reset delay counter if set', (done) => {

                okanjo.metrics._saveQueueTimeout = setTimeout(() => { "1".should.be.equal('should not fire') }, 1000);
                okanjo.metrics._saveQueue(true);

                setTimeout(done, 120);
            });

        });

        describe('_checkUrlForReferral', () => {

            it('should correlate when we have a local sid already and the url contains a non-matching sid', (done) => {

                // Save it locally
                let Metrics = okanjo.metrics.constructor;

                // Fudge the UA
                TestUtil.cleanEnvironment();
                TestUtil.setupEnvironment({
                    url: `https://okanjo.com/test?${Metrics.Params.name}=MTremotesid&${Metrics.Params.channel}=myapp&${Metrics.Params.context}=mymode`,
                    referrer: 'http://unit.test/my/referrer/here'
                });

                // Set a new local sid
                window.localStorage[Metrics.Params.name] = 'MTunittesting1';

                let pageId;

                // Verify the event payload
                server.routes.push({
                    method: 'POST',
                    path: okanjo.net.routes.metrics_batch,
                    handler: (req, reply) => {
                        let payload = JSON.parse(req.payload);

                        payload.should.deepEqual({
                            events: [
                                {
                                    object_type: 'mt',
                                    event_type: 'cor',
                                    id: 'MTremotesid_MTunittesting1',
                                    ch: 'ex',
                                    m: {
                                        ok_ver: "%%OKANJO_VERSION",
                                        pgid: pageId,
                                        ref_ch: 'myapp',
                                        ref_cx: 'mymode'
                                    },
                                    ref: 'http://unit.test/my/referrer/here',
                                    // sid: 'MTunittesting1'
                                }
                            ],
                            sid: 'MTunittesting1',
                            win: `https://okanjo.com/test?${Metrics.Params.name}=MTremotesid&${Metrics.Params.channel}=myapp&${Metrics.Params.context}=mymode`
                        });

                        server.routes.pop();

                        reply({
                            statusCode: 200,
                            payload: {
                                statusCode: 200,
                                data: {
                                    sid: 'MTunittesting1'
                                }
                            }
                        });

                        // Reset for the next test
                        TestUtil.cleanEnvironment();
                        TestUtil.setupEnvironment();

                        setup();

                        done();
                    }
                });

                // Construct okanjo and metrics namespaces
                setup();

                pageId = okanjo.metrics.pageId;

                // _checkUrlForReferral is called on construction, but does not unload the queue
                okanjo.metrics._queue.length.should.be.exactly(1);
                okanjo.metrics._processQueue();

            });

        });

        describe('trackEvent', () => {

            it('should report invalid usages', () => {
                okanjo.metrics.trackEvent({ _noProcess: true });
                okanjo.metrics._queue.length.should.be.exactly(0);
            });

        });

        describe('trackPageView', () => {

            it('should track the view w/o help', (done) => {

                let pageId = okanjo.metrics.pageId;

                server.routes.push({
                    method: 'POST',
                    path: okanjo.net.routes.metrics_batch,
                    handler: (req, reply) => {
                        let payload = JSON.parse(req.payload);

                        payload.should.deepEqual({
                            events: [
                                {
                                    object_type: 'pg',
                                    event_type: 'vw',
                                    id: window.location.href,
                                    ch: 'ex',
                                    m: {
                                        ok_ver: "%%OKANJO_VERSION",
                                        pgid: pageId
                                    },
                                    // sid: 'MTunittesting1' // doesn't have the sid yet
                                }
                            ],
                            win: 'about:blank'
                            // sid: 'MTunittesting1'
                        });

                        server.routes.pop();

                        reply({
                            statusCode: 200,
                            payload: {
                                statusCode: 200,
                                data: {
                                    sid: 'MTunittesting1'
                                }
                            }
                        });

                        done();
                    }
                });

                okanjo.metrics.trackPageView();
            });

        });

        describe('_processQueue', () => {

            it('should send in multiple batches', (done) => {

                let Metrics = okanjo.metrics.constructor;

                let batches = 0;
                let received = 0;

                server.routes.push({
                    method: 'POST',
                    path: okanjo.net.routes.metrics_batch,
                    handler: (req, reply) => {

                        let payload = JSON.parse(req.payload);
                        batches++;
                        received += payload.events.length;

                        // we shouldn't recieve more than 2 batches
                        batches.should.be.lessThanOrEqual(2);

                        if (batches === 1) {
                            received.should.equal(1); // we should only get 1 in this batch
                            payload.events[0].id.should.be.equal('http://unit.test');
                        } else {
                            received.should.equal(3); // second batch should have 2 wrapped up
                            payload.events[0].id.should.be.equal('product_1');
                            payload.events[1].id.should.be.equal('product_2');
                        }

                        reply({
                            statusCode: 200,
                            payload: {
                                statusCode: 200,
                                data: {
                                    sid: 'MTunittesting1'
                                }
                            }
                        });

                        if (received === 3) {
                            server.routes.pop();
                            done();
                        }
                    }
                });

                okanjo.metrics
                    .create({ id: 'http://unit.test' })
                    .type(Metrics.Object.page, Metrics.Event.view)
                    .send();

                // Force a delay to group the others up
                setTimeout(() => {
                    okanjo.metrics
                        .create({ id: 'product_1' })
                        .type(Metrics.Object.product, Metrics.Event.impression)
                        .send();

                    okanjo.metrics
                        .create({ id: 'product_2' })
                        .type(Metrics.Object.product, Metrics.Event.impression)
                        .send();

                    // BATCH SHOULD GO OUT HERE

                }, 10);

                // BATCH SHOULD GO OUT HERE

            });

        });

        describe('_normalizeEvent', () => {

            it('should truncate values that are too long', () => {

                // Too long of a value
                const event = okanjo.metrics.create({ a: 1 }, { b: 2 })
                    .meta({
                        keywords: 'foo,bar,baz.,lorem,ipsum dolor,sit amet,consectetur adipiscing elit,sed a rutrum felis,aliquam nec m,in diam sagittis ultricies,sed eget magna,cras mollis,nisl in mattis,nisl erat tempus nulla,sed vulputate ipsum,convallis tortor,sed eu tincidunt,id semper justo,proin id eros diam,aenean facilisis aliquet,tellus sit amet euismod,donec ut laoreet felis'
                    })
                    .type('unit', 'test');

                // Normalize it
                okanjo.metrics._normalizeEvent(event);

                event.m.keywords.length.should.be.exactly(255);

            });

        });
        
    });

});