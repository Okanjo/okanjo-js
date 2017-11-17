"use strict";

import okanjo from './Okanjo';
import Placement from './Placement';

// **********
// DEPRECATED - USE okanjo.Placement instead!
// **********

/**
 * Backwards compatible interface, turning a Product widget into a placement widget
 * @deprecated
 */
class Product extends Placement {

    constructor(element, options) {
        // Initialize placement w/o loading (we need to jack the config)
        options = options || {};
        const no_init = options.no_init; // hold original no_init flag, if set
        options.no_init = true;
        super(element, options);

        okanjo.warn('Product widget has been deprecated. Use Placement instead (may require configuration changes)', { widget: this });

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
        this.config.backwards = 'Product';
        this.config.type = Placement.ContentTypes.products;

        // Set filters based on old "mode"
        if (this.config.mode === 'sense') {
            // sense
            this.config.url = this.config.url || 'referrer';
            this.config.take = this.config.take || 5;
        } else if (this.config.mode === 'single') {
            // single
            this.config.url = null;
            if (this.config.id) this.config.ids = [this.config.id];
            this.config.take = 1;
            delete this.config.id;
        } else {
            // browse
            this.config.url = null;
            this.config.take = this.config.take || 25;
        }
        delete this.config.mode;

        // Sold by changed to store name
        if (this.config.sold_by) {
            this.config.store_name = this.config.sold_by;
            delete this.config.sold_by;
        }

        // Selectors is now url_selectors
        if (this.config.selectors) {
            this.config.url_selectors = this.config.selectors;
            delete this.config.selectors;
        }

        // Marketplace_id is no longer a thing, closest analog are properties.
        if (this.config.marketplace_id) {
            this.config.property_id = this.config.marketplace_id;
            delete this.config.marketplace_id
        }

        // Marketplace status is no longer a thing, instead, use the sandbox environment for testing
        if (this.config.marketplace_status === 'testing') {
            this.config.sandbox = true;
        }
        delete this.config.marketplace_status;

        // Deprecated
        delete this.config.suboptimal;
        delete this.config.text;
    }

}

export default Product;