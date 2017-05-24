"use strict";

const TestUtil = require('./_test_util');
const should = require('should');

describe('Widget', () => {

    let okanjo;

    const setup = (callback) => {
        // get okanjo on the dom
        TestUtil.reloadOkanjo();

        // update shortcut pointer
        okanjo = window.okanjo;
        global.okanjo = okanjo;

        // make sure it requires
        TestUtil.reloadCookie();
        TestUtil.reloadModal();
        TestUtil.reloadTemplateEngine();
        TestUtil.reloadEventEmitter();
        TestUtil.reloadWidget();
        callback();
    };

    const resetDocument = TestUtil.resetDocument.bind(TestUtil);
    const insertDropzone = TestUtil.insertDropzone.bind(TestUtil);

    before((done) => {
        // make us a dom
        TestUtil.setupEnvironment({
            url: 'http://unit.test/whatever?query#hash'
        });
        setup(done);
    });

    after((done) => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();
        done();
    });

    //noinspection JSUnusedLocalSymbols
    const debug = () => {
        console.log(document.documentElement.innerHTML);
    };

    describe('Construction', () => {

        it('should explode if you do not provide an element', () => {
            (function() {
                new okanjo._Widget();
            }).should.throw(/invalid element/i);
        });

        it('should report if provided non-options', () => {
            resetDocument();
            let target = insertDropzone();
            let w = new okanjo._Widget(target, 2);
            w.config.should.be.an.Object();
        });

        it('should init without options', () => {
            resetDocument();
            let target = insertDropzone();
            let w = new okanjo._Widget(target);
            w.config.should.be.an.Object();
        });

    });

    describe('getSettings', () => {

        it('does nothing', () => {
            resetDocument();
            let target = insertDropzone();
            let w = new okanjo._Widget(target);
            let settings = w.getSettings();
            settings.should.be.an.Object().and.empty();
        });

    });

    describe('load', () => {

        it('does nothing because it should be overridden', () => {
            resetDocument();
            let target = insertDropzone();
            let w = new okanjo._Widget(target);
            w.load();
        });

    });

    describe('getConfig', () => {

        it('should convert widget config into transmittable parameters', () => {
            resetDocument();
            let target = insertDropzone({ thing:'', not_a_thing: 'hi', name: 'beep' });
            let w = new okanjo._Widget(target, { nil: null, nope: undefined });
            w.getSettings = function() {
                return {
                    thing: okanjo._Widget.Field.string(),
                    defaulted: okanjo._Widget.Field.string().default('hithere'),
                    name: okanjo._Widget.Field.string().group('bucket')
                };
            };

            //noinspection JSAccessibilityCheck
            w._applyConfiguration();
            let config = w.getConfig();

            should(w.config.thing).be.exactly(undefined);
            should(w.config.name).be.exactly('beep');
            should(w.config.not_a_thing).be.exactly('hi');
            should(w.config.defaulted).be.exactly('hithere');
            should(w.config.nil).be.exactly(null);
            should(w.config.nope).be.exactly(undefined);

            config.should.deepEqual({
                not_a_thing: 'hi',
                bucket: {
                    name: 'beep'
                },
                defaulted: 'hithere',
                nil: '' // nulls should be treated as empty strings
            });

        });

    });

    describe('_ensurePlacementKey', () => {

        it('should find the key on the global namespace if set', () => {
            resetDocument();
            let target = insertDropzone();
            okanjo.key = 'test_placement_key';
            let w = new okanjo._Widget(target);
            w.init();
            w.config.key.should.be.exactly('test_placement_key');

            delete okanjo.key;
        });
    });

    describe('getCurrentPageUrl', () => {

        it('should work', () => {
            okanjo._Widget.getCurrentPageUrl().should.be.exactly('http://unit.test/whatever');
        });
    });

    describe('Widget.Field', () => {

        it('handles all the various bits and pieces', () => {
            const Field = okanjo._Widget.Field;

            // array
            Field.array().value('1,2,3').should.deepEqual(['1','2','3']);
            Field.array().value('1,2\\,,3').should.deepEqual(['1','2,','3']);
            Field.array().value([1,2,3]).should.deepEqual([1,2,3]);
            Field.array((v) => ""+v).value([1,2,3]).should.deepEqual(['1','2','3']);
            Field.array((v) => parseInt(v)).value('1,2,3').should.deepEqual([1,2,3]);

            // bool
            Field.bool().value(true).should.be.exactly(true);
            Field.bool().value(false).should.be.exactly(false);
            Field.bool().value("1").should.be.exactly(true);
            Field.bool().value("true").should.be.exactly(true);
            Field.bool().value("nope").should.be.exactly(false);

            // strip
            should(Field.strip().value('beans')).be.exactly(undefined);

            // float
            Field.float().value('1.23').should.be.exactly(1.23);
        });

    });

});