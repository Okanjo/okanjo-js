"use strict";

const TestUtil = require('./_test_util');
const should = require('should');

describe('Modal', () => {

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
        TestUtil.reloadModal();
    });

    after(() => {
        delete global.okanjo;
        delete window.okanjo;
        TestUtil.cleanEnvironment();
    });

    it('should show/hide a modal', (done) => {

        okanjo.ui.modal.show('Where do babies come from?');
        document.documentElement.innerHTML.should.match(/okanjo-modal-container/);
        document.documentElement.innerHTML.should.match(/babies come from/);
        document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

        okanjo.ui.modal.hide();
        setTimeout(() => {
            document.documentElement.innerHTML.should.match(/okanjo-modal-hidden/);
            done();
        }, 225);
    });

    it('should display existing dom elements if given', (done) => {

        let p = document.createElement('p');
        p.innerHTML = 'Oh hey this is DOM content';
        
        okanjo.ui.modal.show(p);
        document.documentElement.innerHTML.should.match(/okanjo-modal-container/);
        document.documentElement.innerHTML.should.match(/hey this is DOM/);
        document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

        okanjo.ui.modal.hide();
        setTimeout(() => {
            document.documentElement.innerHTML.should.match(/okanjo-modal-hidden/);
            done();
        }, 225);
    });

    it('should close when the overlay is clicked', (done) => {
        okanjo.ui.modal.show('Where do babies come from?');
        setTimeout(() => {
            document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

            let event = new window.Event('click', { bubbles: true });
            document.querySelector('.okanjo-modal-container').dispatchEvent(event);

            setTimeout(() => {
                document.documentElement.innerHTML.should.match(/okanjo-modal-hidden/);
                done();
            }, 225);

        }, 25);
    });

    it('should close when the close button is clicked', (done) => {
        okanjo.ui.modal.show('Where do babies come from?');
        setTimeout(() => {
            document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

            let event = new window.Event('click', { bubbles: true });
            document.querySelector('.okanjo-modal-close-button').dispatchEvent(event);

            setTimeout(() => {
                document.documentElement.innerHTML.should.match(/okanjo-modal-hidden/);
                done();
            }, 225);

        }, 25);
    });

    it('should eat clicks within the modal', (done) => {
        okanjo.ui.modal.show('Where do babies come from?');
        setTimeout(() => {
            document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

            let event = new window.Event('click', { bubbles: true });
            document.querySelector('.okanjo-modal-window').dispatchEvent(event);

            setTimeout(() => {
                document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

                okanjo.ui.modal.hide();
                setTimeout(() => {
                    document.documentElement.innerHTML.should.match(/okanjo-modal-hidden/);
                    done();
                }, 225);

            }, 225);

        }, 25);
    });

    it('should handle device orientation change events', (done) => {
        okanjo.ui.modal.show('Where do babies come from?');
        setTimeout(() => {
            document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

            let event = new window.Event('orientationchange', { bubbles: true });
            window.dispatchEvent(event);

            setTimeout(() => {
                document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

                okanjo.ui.modal.hide();
                setTimeout(() => {
                    document.documentElement.innerHTML.should.match(/okanjo-modal-hidden/);
                    done();
                }, 225);

            }, 225);

        }, 25);
    });

    it('should handle resize events', (done) => {
        okanjo.ui.modal.show('Where do babies come from?');
        setTimeout(() => {
            document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

            let event = new window.Event('resize', { bubbles: true });
            window.dispatchEvent(event);

            setTimeout(() => {
                document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

                okanjo.ui.modal.hide();
                setTimeout(() => {
                    document.documentElement.innerHTML.should.match(/okanjo-modal-hidden/);
                    done();
                }, 225);

            }, 225);

        }, 25);
    });
    
    it('should deal with mobile devices', (done) => {

        // Fudge the UA
        let oldOkanjo = window.okanjo;
        TestUtil.cleanEnvironment();
        TestUtil.setupEnvironment({
            userAgent: 'iPhone/8,1' // custom option
        });

        // Reload okanjo with the new UA
        should(window.okanjo).be.exactly(undefined);
        TestUtil.reloadOkanjo();
        okanjo = window.okanjo;
        global.okanjo = okanjo;
        TestUtil.reloadModal();

        // Test it
        window.okanjo.util.isMobile().should.be.exactly(true);

        okanjo.ui.modal.show('Where do babies come from?');
        document.documentElement.innerHTML.should.match(/okanjo-modal-container/);
        document.documentElement.innerHTML.should.match(/babies come from/);
        document.documentElement.innerHTML.should.not.match(/okanjo-modal-hidden/);

        okanjo.ui.modal.hide();
        setTimeout(() => {
            document.documentElement.innerHTML.should.match(/okanjo-modal-hidden/);

            // Revert
            TestUtil.cleanEnvironment();
            TestUtil.setupEnvironment();
            window.okanjo = oldOkanjo;
            okanjo = oldOkanjo;
            global.okanjo = oldOkanjo;
            
            done();
        }, 225);
    });

});