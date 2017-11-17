"use strict";


/*

 div .modal-container .fade-out .hidden
 | div .modal-window .clearfix
 | |
 | | div .modal-window-skin
 | | | div .modal-window-outer
 | | | | div .modal-window-inner
 | | | | | iframe .okanjo-inline-buy-frame
 | | | | /div
 | | | /div
 | | /div
 | |
 | | div .close-button
 | | | ×
 | | /div
 | |
 | /div
 /div

 */

class Modal {
    constructor(okanjo) {
        this.okanjo = okanjo;
        this.IS_MOBILE = okanjo.util.isMobile();
        this.initialized = false;

        // Selectors
        this.$html = null;
        this.$body = null;
        this.$modalContainer = null;
        this.$modalWindow = null;
        this.$modalSkin = null;
        this.$modalOuter = null;
        this.$modalInner = null;
        this.$modalClose = null;
        this.$modalFrame = null;
    }

    createElements() {
        //noinspection JSUnresolvedFunction
        this.$html = document.documentElement /* istanbul ignore next: old browsers */ || document.querySelector('html');
        //noinspection JSUnresolvedFunction
        this.$body = document.body /* istanbul ignore next: old browsers */ || document.querySelector('body');

        // Modal elements
        this.$modalContainer = document.createElement('div');
        this.$modalWindow = document.createElement('div');
        this.$modalSkin = document.createElement('div');
        this.$modalOuter = document.createElement('div');
        this.$modalInner = document.createElement('div');
        this.$modalClose = document.createElement('div');
        this.$modalFrame = document.createElement('iframe');

        this.$modalContainer.setAttribute('class', 'okanjo-modal-container okanjo-modal-hidden ' /*+ okanjo.util.detectClasses().join(' ')*/);
        this.$modalWindow.setAttribute('class', 'okanjo-modal-window');
        this.$modalSkin.setAttribute('class', 'okanjo-modal-window-skin');
        this.$modalOuter.setAttribute('class', 'okanjo-modal-window-outer');
        this.$modalInner.setAttribute('class', 'okanjo-modal-window-inner');
        this.$modalClose.setAttribute('class', 'okanjo-modal-close-button');

        this.$modalFrame.setAttribute('class', 'okanjo-inline-buy-frame');
        this.$modalFrame.setAttribute('frameborder', '0');
        this.$modalFrame.setAttribute('vspace', '0');
        this.$modalFrame.setAttribute('hspace', '0');
        this.$modalFrame.setAttribute('webkitallowfullscreen', '');
        this.$modalFrame.setAttribute('mozallowfullscreen', '');
        this.$modalFrame.setAttribute('allowfullscreen', '');
        this.$modalFrame.setAttribute('scrolling', 'auto');

        this.$modalClose.innerHTML = '×';

        // Create the modal element tree
        this.$modalInner.appendChild(this.$modalFrame);
        this.$modalOuter.appendChild(this.$modalInner);
        this.$modalSkin.appendChild(this.$modalOuter);
        this.$modalWindow.appendChild(this.$modalSkin);
        this.$modalWindow.appendChild(this.$modalClose);
        this.$modalContainer.appendChild(this.$modalWindow);

        // Add the modal stuff to the body
        this.$body.appendChild(this.$modalContainer);
    }

    addListener(el, event, handler) {
        /* istanbul ignore else: old browsers */
        if (el.addEventListener) {
            el.addEventListener(event, handler, false);
        } else {
            el.attachEvent("on" + event, handler);
        }
    }

    getWindowHeight() {
        return window.innerHeight /* istanbul ignore next: old browsers */ || document.documentElement.clientHeight;
    }

    handleReposition() {
        // scrollY = okanjo.ui.getScrollPosition().y;
        //$modalWindow.style.marginTop = scrollY + 40 + "px";
        this.$modalWindow.style.height = (this.getWindowHeight() - 80) + "px";
    }

    bindEvents() {

        // If the device orientation changes, adjust the modal view port
        this.addListener(window, 'orientationchange', () => {
            for (let t = 0; t < 2; t++) {
                setTimeout(this.handleReposition.bind(this), 1000 * t + 10);
            }
        });

        // If the window changes size, also adjust the modal view port
        this.addListener(window, 'resize', () => {
            setTimeout(this.handleReposition.bind(this), 100);
        });

        // Click the overlay to close the modal
        this.addListener(this.$modalContainer, 'click', this.closeModal.bind(this));

        // If you click in the modal, don't close it!
        this.addListener(this.$modalWindow, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Click the close button to close it
        this.addListener(this.$modalClose, 'click', (e) => {

            // Don't close it twice
            e.preventDefault();
            e.stopPropagation();

            this.closeModal();
        });

    }

    addClass(el, name) {
        el.className += " " + name;
    }

    removeClass(el, name) {
        el.className = el.className.replace(new RegExp(' *?'+name), '');
    }

    openModal() {

        // scrollY = document.body.scrollTop;

        this.removeClass(this.$modalContainer, 'okanjo-modal-hidden');
        this.addClass(this.$modalContainer, 'okanjo-modal-fade-out');

        this.handleReposition();

        this.addClass(this.$html, "okanjo-modal-active");

        if (!this.IS_MOBILE) {
            this.addClass(this.$html, "okanjo-modal-margin-fix");
        }

        setTimeout(() => {
            this.removeClass(this.$modalContainer, 'okanjo-modal-fade-out');
        }, 10);

        // Click the overlay to close the modal
        //addListener($body, 'click', closeModal);

    }

    closeModal() {
        this.addClass(this.$modalContainer, 'okanjo-modal-fade-out');

        setTimeout(() => {
            this.removeClass(this.$modalContainer, 'okanjo-modal-fade-out');
            this.addClass(this.$modalContainer, "okanjo-modal-hidden");

            this.removeClass(this.$html, "okanjo-modal-active");
            if (!this.IS_MOBILE) {
                this.removeClass(this.$html, "okanjo-modal-margin-fix");
            }
        }, 210);

        // Click the overlay to close the modal
        //removeListener($body, 'click', closeModal);
    }

    /**
     * Insert an element or markup into the modal
     * @param content
     */
    setContent(content) {

        // Remove existing content
        this.$modalInner.innerHTML = "";

        // Insert new content
        if (typeof content === "string") {
            this.$modalInner.innerHTML = content;
        } else {
            this.$modalInner.appendChild(content);
        }
    }

    //removeListener(el, event, handler) {
    //    if (el.removeEventListener) {
    //        el.removeEventListener(event, handler);
    //    } else {
    //        el.detachEvent("on" + event, handler);
    //    }
    //}

    show(content) {
        if (!this.initialized) {
            this.initialized = true;
            this.createElements();
            this.bindEvents();
        }

        this.setContent(content);
        this.openModal();
    }

    hide() {
        this.closeModal();
    }
}

export default Modal;