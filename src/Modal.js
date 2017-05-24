"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(window, document) {

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

    const okanjo = window.okanjo;
    const IS_MOBILE = okanjo.util.isMobile();

    let initialized = false,
        // scrollY = null,

        // Selectors
        $html, $body, $modalContainer, $modalWindow, $modalSkin, $modalOuter, $modalInner, $modalClose, $modalFrame,

        createElements = function() {

            // Page elements
            //noinspection JSUnresolvedFunction
            $html = document.documentElement /* istanbul ignore next: old browsers */ || document.querySelector('html');
            //noinspection JSUnresolvedFunction
            $body = document.body /* istanbul ignore next: old browsers */ || document.querySelector('body');

            // Modal elements
            $modalContainer = document.createElement('div');
            $modalWindow = document.createElement('div');
            $modalSkin = document.createElement('div');
            $modalOuter = document.createElement('div');
            $modalInner = document.createElement('div');
            $modalClose = document.createElement('div');
            $modalFrame = document.createElement('iframe');

            $modalContainer.setAttribute('class', 'okanjo-modal-container okanjo-modal-hidden ' /*+ okanjo.util.detectClasses().join(' ')*/);
            $modalWindow.setAttribute('class', 'okanjo-modal-window');
            $modalSkin.setAttribute('class', 'okanjo-modal-window-skin');
            $modalOuter.setAttribute('class', 'okanjo-modal-window-outer');
            $modalInner.setAttribute('class', 'okanjo-modal-window-inner');
            $modalClose.setAttribute('class', 'okanjo-modal-close-button');

            $modalFrame.setAttribute('class', 'okanjo-inline-buy-frame');
            $modalFrame.setAttribute('frameborder', '0');
            $modalFrame.setAttribute('vspace', '0');
            $modalFrame.setAttribute('hspace', '0');
            $modalFrame.setAttribute('webkitallowfullscreen', '');
            $modalFrame.setAttribute('mozallowfullscreen', '');
            $modalFrame.setAttribute('allowfullscreen', '');
            $modalFrame.setAttribute('scrolling', 'auto');

            $modalClose.innerHTML = '×';

            // Create the modal element tree
            $modalInner.appendChild($modalFrame);
            $modalOuter.appendChild($modalInner);
            $modalSkin.appendChild($modalOuter);
            $modalWindow.appendChild($modalSkin);
            $modalWindow.appendChild($modalClose);
            $modalContainer.appendChild($modalWindow);

            // Add the modal stuff to the body
            $body.appendChild($modalContainer);
        },

        addListener = function(el, event, handler) {
            /* istanbul ignore else: old browsers */
            if (el.addEventListener) {
                el.addEventListener(event, handler, false);
            } else {
                el.attachEvent("on" + event, handler);
            }
        },

        getWindowHeight = function() {
            return window.innerHeight /* istanbul ignore next: old browsers */ || document.documentElement.clientHeight;
        },

        handleReposition = function() {
            // scrollY = okanjo.ui.getScrollPosition().y;
            //$modalWindow.style.marginTop = scrollY + 40 + "px";
            $modalWindow.style.height = (getWindowHeight() - 80) + "px";
        },

        bindEvents = function() {

            // If the device orientation changes, adjust the modal view port
            addListener(window, 'orientationchange', function() {
                for (let t = 0; t < 2; t++) {
                    setTimeout(handleReposition, 1000 * t + 10);
                }
            });

            // If the window changes size, also adjust the modal view port
            addListener(window, 'resize', function() {
                setTimeout(handleReposition, 100);
            });

            // Click the overlay to close the modal
            addListener($modalContainer, 'click', closeModal);

            // If you click in the modal, don't close it!
            addListener($modalWindow, 'click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });

            // Click the close button to close it
            addListener($modalClose, 'click', function(e) {

                // Don't close it twice
                e.preventDefault();
                e.stopPropagation();

                closeModal();
            });

        },

        //removeListener = function(el, event, handler) {
        //    if (el.removeEventListener) {
        //        el.removeEventListener(event, handler);
        //    } else {
        //        el.detachEvent("on" + event, handler);
        //    }
        //},

        addClass = function(el, name) {
            el.className += " " + name;
        },

        removeClass = function(el, name) {
            el.className = el.className.replace(new RegExp(' *?'+name), '');
        },

        openModal = function() {

            // scrollY = document.body.scrollTop;

            removeClass($modalContainer, 'okanjo-modal-hidden');
            addClass($modalContainer, 'okanjo-modal-fade-out');

            handleReposition();

            addClass($html, "okanjo-modal-active");

            if (!IS_MOBILE) {
                addClass($html, "okanjo-modal-margin-fix");
            }

            setTimeout(function() {
                removeClass($modalContainer, 'okanjo-modal-fade-out');
            }, 10);

            // Click the overlay to close the modal
            //addListener($body, 'click', closeModal);

        },

        closeModal = function() {
            addClass($modalContainer, 'okanjo-modal-fade-out');

            setTimeout(function() {
                removeClass($modalContainer, 'okanjo-modal-fade-out');
                addClass($modalContainer, "okanjo-modal-hidden");

                removeClass($html, "okanjo-modal-active");
                if (!IS_MOBILE) {
                    removeClass($html, "okanjo-modal-margin-fix");
                }
            }, 210);

            // Click the overlay to close the modal
            //removeListener($body, 'click', closeModal);
        },

        /**
         * Insert an element or markup into the modal
         * @param content
         */
        setContent = function(content) {

            // Remove existing content
            $modalInner.innerHTML = "";

            // Insert new content
            if (typeof content === "string") {
                $modalInner.innerHTML = content;
            } else {
                $modalInner.appendChild(content);
            }
        };


    // Expose the modal functions
    okanjo.ui.modal = {

        show: function(content) {

            if (!initialized) {
                initialized = true;
                createElements();
                bindEvents();
            }

            setContent(content);
            openModal();
        },

        hide: function() {
            closeModal();
        }

    };

    return okanjo.ui.modal;

})(window, document);