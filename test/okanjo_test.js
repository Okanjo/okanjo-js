"use strict";

const TestUtil = require('./_test_util');
const should = require('should');

describe('Okanjo Core', () => {

    let okanjo;

    before(() => {
        TestUtil.setupEnvironment();

        should(window.okanjo).be.exactly(undefined);

        // Attach okanjo to window
        TestUtil.reloadOkanjo();

        window.okanjo.should.be.ok();

        // Expose okanjo to be useable in later tests
        okanjo = window.okanjo;

        okanjo.net.should.be.ok();
        okanjo.ui.should.be.ok();
        // okanjo.metrics.should.be.ok();
        okanjo.version.should.be.ok();
        okanjo.lib.should.be.ok();
        okanjo.util.should.be.ok();
    });

    after(() => {
        TestUtil.cleanEnvironment();
    });

    describe('Core methods', () => {

        describe('okanjo.report', () => {

            it('reports without arguments', () => {
                okanjo.report();
            });

            it('reports with arguments', () => {
                okanjo.report('Kaboom!', { a: 1}, 2);
            });

            it('reports an Error', () => {
                let err = new Error('Ouch');
                okanjo.report(err);
            });

        });

        describe('okanjo.warn', () => {

            it('reports without arguments', () => {
                okanjo.warn();
            });

            it('reports with arguments', () => {
                okanjo.warn('Pants on fire', { a: 1 }, 2, [3]);
            });

        });

        describe('okanjo.qwery', () => {

            it('still selects elements', () => {
                let elements = okanjo.qwery('body');
                elements.length.should.be.exactly(1);
            });

            it('still can select using a parent selector', () => {
                let elements = okanjo.qwery('body', 'html');
                elements.length.should.be.exactly(1);
            });

            it('still can select using a parent node', () => {
                let html = document.querySelector('html');
                let elements = okanjo.qwery('body', html);
                elements.length.should.be.exactly(1);
            });

            it('still can select using a bogus parent selector', () => {
                let elements = okanjo.qwery('body', 'nope');
                elements.length.should.be.exactly(0);
            });

        });

    });

    describe('Net Methods', () => {

        describe('okanjo.net.getRoute', () => {

            it('should return a route with no params', () => {
                let route = okanjo.net.getRoute(okanjo.net.routes.ads);
                route.should.startWith(okanjo.net.endpoint);
                route.should.endWith(okanjo.net.routes.ads);
            });

            it('should return a route with params', () => {
                let route = okanjo.net.getRoute(okanjo.net.routes.metrics, {
                    object_type: 'coffee',
                    event_type: 'consume'
                });
                route.should.startWith(okanjo.net.endpoint);
                route.should.endWith('coffee/consume');
            });

            it('should use sandbox endpoint if environment is configured for testing', () => {
                let route = okanjo.net.getRoute(okanjo.net.routes.ads, null, 'sandbox');
                route.should.startWith(okanjo.net.sandboxEndpoint);
                route.should.endWith(okanjo.net.routes.ads);
            });

        });

        describe('okanjo.net.request', () => {

            it('should noop', () => {

                should(okanjo.net.request).be.a.Function();
                okanjo.net.request();

            });

        });

    });

    describe('Util Methods', () => {

        describe('okanjo.util.isEmpty', () => {
            it('should return property', () => {
                okanjo.util.isEmpty().should.be.exactly(true);
                okanjo.util.isEmpty(undefined).should.be.exactly(true);
                okanjo.util.isEmpty(null).should.be.exactly(true);
                okanjo.util.isEmpty("").should.be.exactly(true);
                okanjo.util.isEmpty(" ").should.be.exactly(true);

                okanjo.util.isEmpty("a").should.be.exactly(false);
                okanjo.util.isEmpty(" a ").should.be.exactly(false);
                okanjo.util.isEmpty({}).should.be.exactly(false);
                okanjo.util.isEmpty(2).should.be.exactly(false);
            });
        });

        describe('okanjo.util.isMobile', () => {

            it('should not return mobile', () => {
                okanjo.util.isMobile().should.be.exactly(false);
            });

            it('should return mobile for apple products', () => {
                let oldOkanjo = window.okanjo;

                // Fudge the UA
                TestUtil.cleanEnvironment();
                TestUtil.setupEnvironment({
                    userAgent: 'iPhone/8,1'
                });

                // Reload okanjo with the new UA
                should(window.okanjo).be.exactly(undefined);
                TestUtil.reloadOkanjo();

                // Test it
                window.okanjo.util.isMobile().should.be.exactly(true);

                // Revert
                TestUtil.cleanEnvironment();
                TestUtil.setupEnvironment();
                window.okanjo = oldOkanjo;
            });

            it('should return mobile for android', () => {
                let oldOkanjo = window.okanjo;

                // Fudge the UA
                TestUtil.cleanEnvironment();
                TestUtil.setupEnvironment({
                    userAgent: 'Android/Garbage'
                });

                // Reload okanjo with the new UA
                should(window.okanjo).be.exactly(undefined);
                TestUtil.reloadOkanjo();

                // Test it
                window.okanjo.util.isMobile().should.be.exactly(true);

                // Revert
                TestUtil.cleanEnvironment();
                TestUtil.setupEnvironment();
                window.okanjo = oldOkanjo;
            });
        });

        describe('okanjo.util.getPageArguments', () => {

            it('should extract nothing', () => {
                let args = okanjo.util.getPageArguments(false);
                should(args).be.empty();

                args = okanjo.util.getPageArguments(true);
                should(args).be.empty();
            });

            it('should extract all the args', () => {
                let oldOkanjo = window.okanjo;

                // Fudge the UA
                TestUtil.cleanEnvironment();
                TestUtil.setupEnvironment({
                    url: "https://okanjo.com/test?query=1#hash=2&nope"
                });

                // Reload okanjo with the new UA
                should(window.okanjo).be.exactly(undefined);
                TestUtil.reloadOkanjo();

                // Test it
                let args = window.okanjo.util.getPageArguments(false);
                args.should.deepEqual({
                    query: "1"
                });

                args = window.okanjo.util.getPageArguments(true);
                args.should.deepEqual({
                    nope: null,
                    hash: "2",
                    query: "1",
                });

                // Revert
                TestUtil.cleanEnvironment();
                TestUtil.setupEnvironment();
                window.okanjo = oldOkanjo;
            });

        });

        describe('okanjo.util.deepClone', () => {

            it('should make clones correctly', () => {

                const source = {
                    a: 1,
                    b: {
                        c: {
                            d: 2,
                            e: [3, 4, 5]
                        },
                        f: "f",
                        g: null
                    }
                };

                const clone = okanjo.util.deepClone(source);

                clone.should.deepEqual(source);

                // Check that references are broken
                Boolean(source === clone).should.be.exactly(false);
                Boolean(source.b === clone.b).should.be.exactly(false);
                Boolean(source.b.c === clone.b.c).should.be.exactly(false);
                Boolean(source.b.c.e === clone.b.c.e).should.be.exactly(false);

            });

        });

        describe('okanjo.util.flatten', () => {

            it('should flatten an empty thing to a real object', () => {
                let pancake = okanjo.util.flatten();
                pancake.should.deepEqual({});

                pancake = okanjo.util.flatten(null);
                pancake.should.deepEqual({});
            });

            it('should flatten properly', () => {

                const now = new Date();

                const source = {
                    a: 1,
                    b: {
                        c: {
                            d: 2,
                            e: [3, 4, 5]
                        },
                        f: "f",
                        g: null
                    },
                    h: null,
                    i: now
                };

                let pancake = okanjo.util.flatten(source);
                pancake.should.deepEqual({
                    a: 1,
                    b_c_d: 2,
                    b_c_e_0: 3,
                    b_c_e_1: 4,
                    b_c_e_2: 5,
                    b_f: 'f',
                    b_g: null,
                    h: null,
                    i: now
                });

                // with iso conversion
                pancake = okanjo.util.flatten(source, { dateToIso: true });
                pancake.should.deepEqual({
                    a: 1,
                    b_c_d: 2,
                    b_c_e_0: 3,
                    b_c_e_1: 4,
                    b_c_e_2: 5,
                    b_f: 'f',
                    b_g: null,
                    h: null,
                    i: now.toISOString()
                });

                // with array ignore
                pancake = okanjo.util.flatten(source, { ignoreArrays: true });
                pancake.should.deepEqual({
                    a: 1,
                    b_c_d: 2,
                    b_c_e: [3, 4, 5],
                    b_f: 'f',
                    b_g: null,
                    h: null,
                    i: now
                });

                // with array to csv
                pancake = okanjo.util.flatten(source, { arrayToCsv: true });
                pancake.should.deepEqual({
                    a: 1,
                    b_c_d: 2,
                    b_c_e: "3,4,5",
                    b_f: 'f',
                    b_g: null,
                    h: null,
                    i: now
                });


            });

        });

        describe('okanjo.util.shortid', () => {

            it('should generate ids', () => {
                let id1 = okanjo.util.shortid();
                let id2 = okanjo.util.shortid();

                id1.should.be.ok();
                id2.should.be.ok();

                id1.should.not.equal(id2);

            });

        });

        describe('okanjo.util.ifDefined', () => {

            it('should handle defined values', () => {
                okanjo.util.ifDefined("string").should.be.exactly("string");
                okanjo.util.ifDefined(42).should.be.exactly(42);
                okanjo.util.ifDefined(0).should.be.exactly(0); // falsy but has a value!
                should(okanjo.util.ifDefined(null)).be.exactly(null);
                should(okanjo.util.ifDefined(undefined)).be.exactly(null);
            });

        });

    });

    describe('UI Methods', () => {

        describe('okanjo.ui.getScrollPosition', () => {

            it('should return a value', () => {
                let res = okanjo.ui.getScrollPosition();
                res.x.should.be.equal(0);
                res.y.should.be.equal(0);
            });

        });

        describe('okanjo.ui.getElementSize', () => {

            it('should return a value', () => {
                let res = okanjo.ui.getElementSize(document.body);
                res.width.should.be.equal(0);
                res.height.should.be.equal(0);

                res = okanjo.ui.getElementSize(document.body, true);
                res.width.should.be.equal(16);
                res.height.should.be.equal(16);
            });

        });

        describe('okanjo.ui.getPageSize', () => {

            it('should return a value', () => {
                let res = okanjo.ui.getPageSize();
                res.w.should.be.equal(0);
                res.h.should.be.equal(0);
            });

        });

        describe('okanjo.ui.getViewportSize', () => {

            it('should return a value', () => {
                let res = okanjo.ui.getViewportSize();
                res.vw.should.be.equal(0);
                res.vh.should.be.equal(0);
            });

        });

        describe('okanjo.ui.getEventPosition', () => {

            it('should return a value', () => {

                function MouseEvent() {
                    //noinspection JSUnusedGlobalSymbols
                    this.pageX = 0;
                    //noinspection JSUnusedGlobalSymbols
                    this.pageY = 0;
                }

                let res = okanjo.ui.getEventPosition(new MouseEvent());
                res.et.should.be.equal('MouseEvent');
                res.ex.should.be.equal(0);
                res.ey.should.be.equal(0);
            });

        });

        describe('okanjo.ui.getElementPosition', () => {

            it('should return a value', () => {
                let res = okanjo.ui.getElementPosition(document.body);
                res.x1.should.equal(0);
                res.y1.should.equal(0);
                res.x2.should.equal(0);
                res.y2.should.equal(0);
            });

            it('should not get positions of unattached elements', () => {
                let element = document.createElement('p');
                let res = okanjo.ui.getElementPosition(element);
                res.x1.should.equal(0);
                res.y1.should.equal(0);
                res.x2.should.equal(0);
                res.y2.should.equal(0);
            });

            it('should not get positions of unattached elements', () => {
                let res = okanjo.ui.getElementPosition(null);
                res.x1.should.equal(0);
                res.y1.should.equal(0);
                res.x2.should.equal(0);
                res.y2.should.equal(0);
                res.err.should.equal(1);
            });

        });

        describe('okanjo.ui._getIntersection', () => {

            // Since jsdom won't give us real positional info, let's make sure this logic works

            it('should return 0% when element is below the viewport', () => {
                let test = {
                    "e": {
                        "x1": 8,
                        "y1": 1280,
                        "x2": 757,
                        "y2": 1530
                    },
                    "s": {
                        "x": 0,
                        "y": 276
                    },
                    "v": {
                        "vw": 765,
                        "vh": 593
                    }
                };

                // noinspection JSAccessibilityCheck
                let res = okanjo.ui._getIntersection(test.e, test.s, test.v);
                let { intersectionArea, elementArea } = res;
                should(intersectionArea / elementArea).be.equal(0);
            });

            it('should return 0% when element is above the viewport', () => {
                let test = {
                    "e": {
                        "x1": 8,
                        "y1": 1280,
                        "x2": 757,
                        "y2": 1530
                    },
                    "s": {
                        "x": 0,
                        "y": 1559
                    },
                    "v": {
                        "vw": 765,
                        "vh": 593
                    }
                };

                // noinspection JSAccessibilityCheck
                let res = okanjo.ui._getIntersection(test.e, test.s, test.v);
                let { intersectionArea, elementArea } = res;
                should(intersectionArea / elementArea).be.equal(0);
            });

            it('should return a partial % when partially contained', () => {
                let test = {
                    "e": {
                        "x1": 8,
                        "y1": 1280,
                        "x2": 757,
                        "y2": 1530
                    },
                    "s": {
                        "x": 0,
                        "y": 1390
                    },
                    "v": {
                        "vw": 765,
                        "vh": 593
                    }
                };

                // noinspection JSAccessibilityCheck
                let res = okanjo.ui._getIntersection(test.e, test.s, test.v);
                let { intersectionArea, elementArea } = res;
                should(intersectionArea / elementArea).be.equal(0.56);
            });

            it('should return a 100% when fully contained', () => {
                let test = {
                    "e": {
                        "x1": 8,
                        "y1": 1280,
                        "x2": 757,
                        "y2": 1530
                    },
                    "s": {
                        "x": 0,
                        "y": 1166
                    },
                    "v": {
                        "vw": 765,
                        "vh": 593
                    }
                };

                // noinspection JSAccessibilityCheck
                let res = okanjo.ui._getIntersection(test.e, test.s, test.v);
                let { intersectionArea, elementArea } = res;
                should(intersectionArea / elementArea).be.equal(1);
            });

            it('large ad: should return a 100% when fully contained', () => {
                let test = {
                        "e": {
                            "x1": 336,
                            "y1": 3576.859375,
                            "x2": 1188,
                            "y2": 4116.859375
                        },
                        "s": {
                            "x": 0,
                            "y": 3122
                        },
                        "v": {
                            "vw": 1216,
                            "vh": 1162
                        }
                    }
                ;

                // noinspection JSAccessibilityCheck
                let res = okanjo.ui._getIntersection(test.e, test.s, test.v);
                let { intersectionArea, elementArea } = res;
                should(intersectionArea / elementArea).be.equal(1);
            });

            it('large ad: should return 49% when large ad in view', () => {
                let test = {
                        "e": {
                            "x1": 336,
                            "y1": 3576.859375,
                            "x2": 1188,
                            "y2": 4116.859375
                        },
                        "s": {
                            "x": 0,
                            "y": 2684
                        },
                        "v": {
                            "vw": 1216,
                            "vh": 1162
                        }
                    }
                ;

                // noinspection JSAccessibilityCheck
                let res = okanjo.ui._getIntersection(test.e, test.s, test.v);
                let { intersectionArea, elementArea } = res;
                should(intersectionArea / elementArea).be.equal(0.4984085648148148);
            });

        });

        describe('okanjo.ui.getPercentageInViewport', () => {

            it('should return a value', () => {
                let res = okanjo.ui.getPercentageInViewport(document.body);
                should(res).be.ok();
                res.percentage.should.be.exactly(0);
            });

            it('should deal with element position errors', () => {
                let res = okanjo.ui.getPercentageInViewport(null);
                should(res).be.ok();
                res.percentage.should.be.exactly(0);
            });

        });

        describe('okanjo.ui.ellipsify', () => {

            it('should do something', () => {
                let container = document.createElement('div');
                container.style.height = '16px';
                container.style.width = '30px';

                let text = document.createElement('span');
                text.innerHTML = 'This is a really long title that must wrap to fit in a container';

                container.appendChild(text);
                document.body.appendChild(container);

                okanjo.ui.ellipsify(container);

                // If this breaks, it's because JSDOM suddenly decided to handle box sizing
                text.textContent.should.equal('This is a really long title that must wrap to fit in a container');
            });

        });

    });

});