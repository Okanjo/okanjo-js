"use strict";

// **********
// DEPRECATED - USE okanjo.Placement instead!
// **********

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(window) {

    const okanjo = window.okanjo;

    /**
     * Backwards compatible interface, turning an Ad widget into a placement widget
     * @deprecated
     */
    class Ad extends okanjo.Placement {

        constructor(element, options) {
            // Initialize placement w/o loading (we need to jack the config)
            options = options || {};
            const no_init = options.no_init; // hold original no_init flag, if set
            options.no_init = true;
            super(element, options);

            okanjo.warn('Ad widget has been deprecated. Use Placement instead (may require configuration changes)', { widget: this });

            // Start loading content
            if (!no_init) {
                delete this.config.no_init;
                this.init();
            }
        }

        //noinspection JSUnusedGlobalSymbols
        /**
         * Converts the old product widget configuration into a usable placement configuration
         */
        _setCompatibilityOptions() {
            // Convert the product config to a placement configuration
            this.config.backwards = 'Ad';
            this.config.type = okanjo.Placement.ContentTypes.products;

            // Id / single mode is now ids
            this.config.url = null;
            if (this.config.id) {
                this.config.ids = [this.config.id];
            } else {
                okanjo.warn('Ad widget should have parameter `id` set.');
            }
            this.config.take = 1;
            delete this.config.id;

            // Content is automatically determined whether the placement element contains children
            delete this.config.content;
        }

    }

    return okanjo.Ad = Ad;

})(window);