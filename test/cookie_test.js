"use strict";

const TestUtil = require('./_test_util');
const should = require('should');

describe('Cookie', () => {

    let okanjo;

    before(() => {
        // make us a dom
        TestUtil.setupEnvironment({
            url: "http://okanjo.com/test?query=1#hash=2&nope"
        });

        // get okanjo on the dom
        TestUtil.reloadOkanjo();

        // update shortcut pointer
        okanjo = window.okanjo;
        global.okanjo = okanjo;

        // make sure it requires
        TestUtil.reloadCookie();
        okanjo.util.cookie.should.be.ok();
        okanjo.util.cookie.set.should.be.a.Function();
        okanjo.util.cookie.get.should.be.a.Function();
    });

    after(() => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();
    });

    describe('okanjo.util.cookie.set', () => {

        it('it should set a cookie', () => {
            const key = 'unit_test', value = 'was here';
            okanjo.util.cookie.set(key, value, 1);
            let res = okanjo.util.cookie.get(key);
            res.should.be.exactly(value);
        });

        it('it should set a cookie without expiration', () => {
            const key = 'unit_test', value = 'was here';
            okanjo.util.cookie.set(key, value);
            let res = okanjo.util.cookie.get(key);
            res.should.be.exactly(value);
        });

    });

    describe('okanjo.util.cookie.get', () => {

        it('does not find a bogus cookie', () => {
            let res = okanjo.util.cookie.get('bogus');
            should(res).be.exactly(null);
        });

    });

    describe('https', () => {

        it('should set https flag', () => {

            // Fudge the UA
            TestUtil.cleanEnvironment();
            TestUtil.setupEnvironment({
                url: "https://okanjo.com/test?query=1#hash=2&nope"
            });
            should(window.okanjo).be.exactly(undefined);
            TestUtil.reloadOkanjo();
            TestUtil.reloadCookie();
            should(window.okanjo).be.ok();

            const key = 'unit_test2', value = 'was here';
            window.okanjo.util.cookie.set(key, value, 1);
            let res = window.okanjo.util.cookie.get(key);
            res.should.be.exactly(value);

        });

    });

});