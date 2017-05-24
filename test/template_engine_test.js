"use strict";

const TestUtil = require('./_test_util');
const should = require('should');

describe('TemplateEngine', () => {

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
        TestUtil.reloadTemplateEngine();
    });

    after(() => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();
    });

    describe('Instance Methods', () => {

        describe('okanjo.ui.TemplateEngine.registerTemplate', () => {

            it('should register a template', () => {

                // Register the template
                okanjo.ui.engine.registerTemplate(
                    'unit.test1',
                    '<div>hello {{ test }} – {{ contextTest }}</div>',
                    function (model) {
                        model.test = model.test || 'set by closure';
                        model.contextTest = this.contextTest || 'context set by closure';
                        return model;
                    },
                    {
                        // no options set
                    }
                );

                okanjo.ui.engine.isTemplateRegistered('unit.test1').should.be.exactly(true);

                let markup = okanjo.ui.engine.render('unit.test1', {}, {});
                markup.should.be.exactly('<div>hello set by closure – context set by closure</div>');

                markup = okanjo.ui.engine.render('unit.test1', { contextTest: 'beep' }, { test: 'boop'});
                markup.should.be.exactly('<div>hello boop – beep</div>')

            });

            it('should register a template without a closure', () => {
                okanjo.ui.engine.registerTemplate(
                    'unit.test2',
                    '<div>hello {{ test }} – {{ contextTest }}</div>',
                    {
                        // no options set
                    }
                );
                okanjo.ui.engine.isTemplateRegistered('unit.test2').should.be.exactly(true);

                let markup = okanjo.ui.engine.render('unit.test2', {}, {});
                markup.should.be.exactly('<div>hello  – </div>');

                markup = okanjo.ui.engine.render('unit.test2', {}, { test: 'test', contextTest: 'context' });
                markup.should.be.exactly('<div>hello test – context</div>')

            });

            it('should register a template without options', () => {
                okanjo.ui.engine.registerTemplate(
                    'unit.test3',
                    '<div>hello {{ test }} – {{ contextTest }}</div>',
                    function (model) {
                        model.test = model.test || 'set by closure';
                        model.contextTest = this.contextTest || 'context set by closure';
                        return model;
                    }
                );
                okanjo.ui.engine.isTemplateRegistered('unit.test3').should.be.exactly(true);

                let markup = okanjo.ui.engine.render('unit.test3', {}, {});
                markup.should.be.exactly('<div>hello set by closure – context set by closure</div>');

                markup = okanjo.ui.engine.render('unit.test3', { contextTest: 'beep' }, { test: 'boop'});
                markup.should.be.exactly('<div>hello boop – beep</div>')
            });

            it('should register a template without a closure or options', () => {
                okanjo.ui.engine.registerTemplate(
                    'unit.test4',
                    '<div>hello {{ test }} – {{ contextTest }}</div>'
                );
                okanjo.ui.engine.isTemplateRegistered('unit.test4').should.be.exactly(true);

                let markup = okanjo.ui.engine.render('unit.test4', {}, {});
                markup.should.be.exactly('<div>hello  – </div>');

                markup = okanjo.ui.engine.render('unit.test4', {}, { test: 'test', contextTest: 'context' });
                markup.should.be.exactly('<div>hello test – context</div>')

            });

            it('should register a template using a dom element', () => {
                let script = document.createElement('script');
                script.setAttribute('type','x-tmpl-mustache');
                script.innerHTML = '<div>hello {{ test }} – {{ contextTest }}</div>';

                // Register the template
                okanjo.ui.engine.registerTemplate(
                    'unit.test5',
                    script,
                    function (model) {
                        model.test = model.test || 'set by closure';
                        model.contextTest = this.contextTest || 'context set by closure';
                        return model;
                    },
                    {
                        // no options set
                    }
                );

                okanjo.ui.engine.isTemplateRegistered('unit.test5').should.be.exactly(true);


                let markup = okanjo.ui.engine.render('unit.test5', {}, {});
                markup.should.be.exactly('<div>hello set by closure – context set by closure</div>');

                markup = okanjo.ui.engine.render('unit.test5', { contextTest: 'beep' }, { test: 'boop'});
                markup.should.be.exactly('<div>hello boop – beep</div>')
            });

            it('should throw if the template object is not a dom element', () => {
                (function() {
                    okanjo.ui.engine.registerTemplate('unit.test6', {});
                }).should.throw(/must be a string or a DOM element/);
            });

            it('should throw if the template is not a dom element or string', () => {
                (function() {
                    okanjo.ui.engine.registerTemplate('unit.test6', 0xdeadbeef);
                }).should.throw(/must be a string or a DOM element/);
            });

            it('should throw if the closure is not a function', () => {
                (function() {
                    okanjo.ui.engine.registerTemplate('unit.test6', '', 'oops', {});
                }).should.throw(/must be a function/);
            });

        });

        describe('okanjo.ui.engine.registerCSS', () => {

            it('should register a string payload', () => {
                okanjo.ui.engine.registerCss('unit.test1', '* { color: red; }');
                okanjo.ui.engine.isCssRegistered('unit.test1').should.be.exactly(true);

                okanjo.ui.engine.ensureCss('unit.test1');
                let els = document.querySelectorAll('#okanjo-css-unit\\.test1');
                els.length.should.be.exactly(1);
                els[0].innerHTML.should.be.exactly('* { color: red; }');

                // Ensure it again, make sure it didn't dup
                okanjo.ui.engine.ensureCss('unit.test1');
                els = document.querySelectorAll('#okanjo-css-unit\\.test1');
                els.length.should.be.exactly(1);
            });

            it('should register with given id', () => {
                okanjo.ui.engine.registerCss('unit.test2', '* { color: blue; }', { id: 'unit_test2' });
                okanjo.ui.engine.isCssRegistered('unit.test2').should.be.exactly(true);
                okanjo.ui.engine.ensureCss('unit.test2');
                okanjo.ui.engine.ensureCss('unit.test2');

                let els = document.querySelectorAll('#unit_test2');
                els.length.should.be.exactly(1);
                els[0].innerHTML.should.be.exactly('* { color: blue; }');
            });

            it('should register a DOM payload', () => {
                let style = document.createElement('style');
                style.innerHTML = '* { color: green; }';

                okanjo.ui.engine.registerCss('unit.test3', style);
                okanjo.ui.engine.isCssRegistered('unit.test3').should.be.exactly(true);

                okanjo.ui.engine.ensureCss('unit.test3');
                let els = document.querySelectorAll('#okanjo-css-unit\\.test3');
                els.length.should.be.exactly(0); // assumed to already be on dom
            });

            it('should throw if payload is an object and not an element', () => {
                (function() {
                    okanjo.ui.engine.registerCss('unit.test4', {});
                }).should.throw(/must be a string or a DOM element/);
            });

            it('should throw if payload is not a string or element', () => {
                (function() {
                    okanjo.ui.engine.registerCss('unit.test5', 0xdeadbeef);
                }).should.throw(/must be a string or a DOM element/);
            });

        });

        describe('okanjo.ui.engine.ensureCss', () => {

            it('should report if template is not registered', () => {
                okanjo.ui.engine.ensureCss('unit.bogus');
                let els = document.querySelectorAll('#okanjo-css-unit\\.bogus');
                els.length.should.be.exactly(0);
            });

            it('should attach style to the body when head is missing', () => {
                // Strip head off the dom
                let head = document.documentElement.removeChild(document.querySelector('head'));
                should(document.querySelector('head')).not.be.ok();
                should(document.head).not.be.ok();

                okanjo.ui.engine.registerCss('unit.test6', '* { color: orange; }');
                okanjo.ui.engine.isCssRegistered('unit.test6').should.be.exactly(true);

                okanjo.ui.engine.ensureCss('unit.test6');
                let els = document.querySelectorAll('#okanjo-css-unit\\.test6');
                els.length.should.be.exactly(1);
                els[0].innerHTML.should.be.exactly('* { color: orange; }');

                els[0].parentNode.nodeName.should.be.exactly('BODY');
            });

            it('should report if there is no body or head', () => {
                // Strip head off the dom
                let body = document.documentElement.removeChild(document.querySelector('body'));
                should(document.querySelector('body')).not.be.ok();
                should(document.body).not.be.ok();

                okanjo.ui.engine.registerCss('unit.test7', '* { color: purple; }');
                okanjo.ui.engine.isCssRegistered('unit.test7').should.be.exactly(true);

                okanjo.ui.engine.ensureCss('unit.test7');
                let els = document.querySelectorAll('#okanjo-css-unit\\.test7');
                els.length.should.be.exactly(0);
            });

            after(() => {
                // Add body/head back in again
                if (!document.head) document.documentElement.appendChild(document.createElement('head'));
                if (!document.body) document.documentElement.appendChild(document.createElement('body'));
            });

        });

        describe('okanjo.ui.engine.render', () => {

            it('should not need a model to render', () => {
                okanjo.ui.engine.registerTemplate(
                    'unit.render-test1',
                    '<div>hello {{ test }} – {{ contextTest }}</div>'
                );

                let markup = okanjo.ui.engine.render('unit.render-test1');
                markup.should.be.exactly('<div>hello  – </div>')
            });

            it('should render `now` as the current timestamp', () => {
                okanjo.ui.engine.registerTemplate(
                    'unit.render-test2',
                    '<div>hello {{ now }}</div>'
                );

                let markup = okanjo.ui.engine.render('unit.render-test2');
                markup.should.match(/^<div>hello [0-9]+<\/div>$/);
            });

            it('should append model.blockClasses if given', () => {
                okanjo.ui.engine.registerTemplate(
                    'unit.render-test3',
                    '<div>hello {{ classDetects }}</div>'
                );

                okanjo.ui.engine.classDetects = 'engine detects';
                let markup = okanjo.ui.engine.render('unit.render-test3', null, { blockClasses: ['block1', 'block2'] });
                markup.should.be.exactly('<div>hello engine detects block1 block2</div>');
            });

            it('should ensure related css payloads', () => {
                okanjo.ui.engine.registerTemplate(
                    'unit.render-test4',
                    '<div>hello {{ now }}</div>',
                    { css: ['unit.render-test4'] }
                );

                okanjo.ui.engine.registerCss('unit.render-test4', '* { color: purple; }');

                let markup = okanjo.ui.engine.render('unit.render-test4');
                markup.should.match(/^<div>hello [0-9]+<\/div>$/);

                let els = document.querySelectorAll('#okanjo-css-unit\\.render-test4');
                els.length.should.be.exactly(1);
                els[0].innerHTML.should.be.exactly('* { color: purple; }')

            });

        });

    });

    describe('Class Methods', () => {

        describe('TemplateEngine.formatCurrency', () => {

            it('should format a number as currency', () => {
                const TemplateEngine = okanjo.ui.engine.constructor;

                TemplateEngine.formatCurrency(0).should.be.exactly('0.00');
                TemplateEngine.formatCurrency(-1).should.be.exactly('-1.00');
                TemplateEngine.formatCurrency(4.9).should.be.exactly('4.90');
                TemplateEngine.formatCurrency(1234.567).should.be.exactly('1,234.57');

                TemplateEngine.formatCurrency(1234.56, 0).should.be.exactly('1,235');
                TemplateEngine.formatCurrency(1234.56, 1, ',', '.').should.be.exactly('1.234,6');
            });

        });

    });
});