"use strict";

const TestUtil = require('./_test_util');
const should = require('should');

describe('Templates', () => {

    let okanjo;

    before((done) => {

        // make us a dom
        TestUtil.setupEnvironment();

        // get okanjo on the dom
        TestUtil.reloadOkanjo();

        // update shortcut pointer
        okanjo = window.okanjo;
        global.okanjo = okanjo;

        // make sure it requires
        TestUtil.reloadTemplateEngine();

        // load the app templates
        TestUtil.reloadAppTemplates(done);
    });

    after(() => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();
    });

    it('should have loaded templates', () => {
        okanjo.ui.engine._css.should.not.be.empty();
        okanjo.ui.engine._templates.should.not.be.empty();
    });

    // If there are any template-specific tests, they can go here
});