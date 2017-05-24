"use strict";

const TestUtil = require('./_test_util');
const should = require('should');

describe('EventEmitter', () => {

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
        TestUtil.reloadEventEmitter();
    });

    after(() => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();
    });

    describe('Instance Methods', () => {

        describe('emitter.on', () => {

            it('should fire on emissions', (done) => {
                let emitter = new okanjo._EventEmitter();
                emitter.on('test', (data) => {
                    data.should.be.exactly(true);
                    done();
                });
                emitter.emit('test', true);
            });

            it('should allow duplicate handlers', (done) => {
                let first = false;
                let second = false;
                let emitter = new okanjo._EventEmitter();

                let check = () => {
                    first && second && done();
                };

                emitter.on('test', () => {
                    first = true;
                    check();
                });

                emitter.on('test', () => {
                    second = true;
                    check();
                });

                emitter.emit('test');
            });

        });

        describe('emitter.once', () => {

            it('should only fire once', (done) => {
                let recieved = 0;
                let emitted = 0;
                let emitter = new okanjo._EventEmitter();

                let check = () => {
                    recieved === 1 && emitted === 2 && done();
                };

                emitter.once('test', () => {
                    recieved.should.be.exactly(0);
                    recieved++;
                    check();
                });

                emitted++;
                emitter.emit('test');

                emitted++;
                emitter.emit('test');
                check();
            });

        });

        describe('emitter.removeListener', () => {

            it('should be able to unsubscribe', (done) => {

                let listener = () => {
                    // this should not fire
                    should(false).be.exactly(true);
                };

                let emitter = new okanjo._EventEmitter();
                emitter.on('test', listener);
                emitter.removeListener('test', listener);

                emitter.emit('test');
                done();
            });

            it('should handle bogus removals', () => {
                let emitter = new okanjo._EventEmitter();
                emitter.removeListener('test', ()=>{});
                emitter.on('test', () => {});
                emitter.removeListener('test', ()=>{});
                emitter._events['test'].length.should.be.exactly(1);
            });

        });

        describe('emitter.emit', () => {

            it('should handle emissions of unregistered handlers', () => {
                let emitter = new okanjo._EventEmitter();
                emitter.emit('test');
            });

        });

    });

});