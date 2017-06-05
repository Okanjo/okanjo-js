"use strict";

const TestUtil = require('./_test_util');
const should = require('should');
const QS = require('qs');

describe('Request', () => {

    let okanjo;

    before(() => {
        // make us a dom
        TestUtil.setupEnvironment();

        // get okanjo on the dom
        TestUtil.reloadOkanjo();

        // update shortcut pointer
        okanjo = window.okanjo;
        global.okanjo = okanjo;

        // make sure it requires
        TestUtil.reloadRequest();
    });

    after(() => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();
    });

    describe('okanjo.net.request', () => {

        let server, doneWithServer;

        before((done) => {
            TestUtil.mockServer((mocker, endServer) => {
                server = mocker;
                doneWithServer = endServer;
                done();
            });
        });

        after((done) => {
            doneWithServer(done);
        });

        it('should handle a basic get request', (done) => {
            okanjo.net.request('get', okanjo.net.sandboxEndpoint + '/', null, (err, res) => {
                should(err).not.be.ok();
                should(res).be.ok();

                res.statusCode.should.be.exactly(200);
                should(res.error).not.be.ok();
                res.data.should.be.ok();
                res.data.mode.should.be.exactly('sandbox');

                done();
            });
        });

        it('should handle optionally take a payload', (done) => {
            okanjo.net.request.get(okanjo.net.sandboxEndpoint + '/', (err, res) => {
                should(err).not.be.ok();
                should(res).be.ok();

                res.statusCode.should.be.exactly(200);
                should(res.error).not.be.ok();
                res.data.should.be.ok();
                res.data.mode.should.be.exactly('sandbox');

                done();
            });
        });

        it('should handle timeouts', (done) => {

            // Fudge the global request timeout
            okanjo.net.request.timeout = 200;

            // Make a route that takes 210ms to reply
            server.routes.push({
                method: 'GET',
                path: '/test/timeout',
                handler: (req, reply) => {
                    setTimeout(() => {
                        reply({
                            statusCode: 200,
                            payload: {
                                statusCode: 200,
                                error: null,
                                data: "too slow"
                            }
                        });
                    }, 210)
                }
            });

            // Exec the route, it should trigger the xhr timeout case
            okanjo.net.request.get(`http://localhost:${server.port}/test/timeout`, (err, res) => {
                // use setImmediate to break the loop, stopping jsdom xhr from catching errors it shouldn't
                setImmediate(() => {
                    should(err).be.ok();
                    should(res).not.be.ok();

                    err.statusCode.should.be.oneOf(503, 504); // either the timeout event handler or readystatechange handler
                    err.error.should.match(/(timed out)|(failed)/);

                    okanjo.net.request.timeout = 0;
                    done();
                });
            });

        });

        it('should handle non-json replies like when down', (done) => {

            // Make a route that returns markup
            server.routes.push({
                method: 'POST',
                path: '/test/lb/down',
                handler: (req, reply) => {

                    // Make sure the data is ok
                    req.payload.should.be.exactly('{"some":"payload"}');

                    // Fake the LB error
                    reply({
                        statusCode: 504,
                        payload: '<html><body><h1>Gateway Timeout</h1></body>',
                        contentType: 'text/html; charset=utf-8'
                    });
                }
            });

            // Fire off the req
            okanjo.net.request.post(`http://localhost:${server.port}/test/lb/down`, { some: 'payload' }, (err, res) => {
                // use setImmediate to break the loop, stopping jsdom xhr from catching errors it shouldn't
                setImmediate(() => {
                    should(err).be.ok();
                    should(res).not.be.ok();

                    err.statusCode.should.be.exactly(504);
                    err.data.should.be.exactly('<html><body><h1>Gateway Timeout</h1></body>');

                    done();
                });
            });
        });

        it('can post without a payload', (done) => {

            server.routes.push({
                method: 'POST',
                path: '/test/no/payload',
                handler: (req, reply) => {
                    req.payload.should.be.empty();
                    reply({
                        statusCode: 200,
                        payload: {
                            statusCode: 200,
                            data: 'ok'
                        }
                    });
                }
            });

            // Fire off the req
            okanjo.net.request.post(`http://localhost:${server.port}/test/no/payload`, undefined, (err, res) => {
                // use setImmediate to break the loop, stopping jsdom xhr from catching errors it shouldn't
                setImmediate(() => {
                    should(err).not.be.ok();
                    should(res).be.ok();

                    res.statusCode.should.be.exactly(200);
                    res.data.should.be.exactly('ok');

                    done();
                });
            });

        });

    });

    describe('okanjo.net.request.stringify', () => {

        it('should build a proper querystring', () => {
            const source = {
                a: 1,
                b: "bees",
                c: ["cookies","cream","candy"],
                d: {
                    dogs: true,
                    derps: "no",
                    dandelions: "smelly=yes",
                    deep: ["sea", "oceans", "eyes"],
                    deeper: {
                        drop: null,
                        dot: "."
                    },
                    dumpster: {},
                    dumpster_fire: []
                },
                u: undefined
            };

            let res = okanjo.net.request.stringify(source);
            res.should.not.be.empty();

            // Reverse it to an object and see if it matches
            let mutation = QS.parse(res);

            // handle special fields that wont mutate back
            mutation.a.should.be.exactly('1');
            mutation.a = parseInt(mutation.a);
            mutation.d.dogs.should.be.exactly('true');
            mutation.d.dogs = Boolean(mutation.d.dogs);
            mutation.d.deeper.drop.should.be.exactly('');
            mutation.d.deeper.drop = null;
            should(mutation.u).be.exactly(undefined);
            mutation.u = undefined;

            should(mutation.d.dumpster).be.exactly(undefined);
            should(mutation.d.dumpster_fire).be.exactly(undefined);
            mutation.d.dumpster = source.d.dumpster;
            mutation.d.dumpster_fire = source.d.dumpster_fire;

            mutation.should.deepEqual(source);

        });

    });
});