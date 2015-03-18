(function(okanjo, window) {


    /**
     * LocalStorage library to use
     * @type {Storage}
     */
    var cache = okanjo.Cache,

        /**
         * Okanjo Product
         * @param element - DOM element to attach the output to
         * @param {*} config - Optional base widget configuration object, element data attributes will override these
         * @constructor
         */
        OkanjoProduct = okanjo.Product = function (element, config) {

            //noinspection JSValidateTypes
            if (!element || typeof element !== 'object' || element.nodeType === undefined) {
                throw new Error('Invalid element - must be a valid DOM element');
            }

            if ((typeof config !== "undefined") && (typeof config !== "object")) {
                throw new Error('Invalid configuration, must be an object or nothing at all, got: ' + typeof config);
            } else {
                config = config || {};
            }

            this.items = [];
            this.element = element;
            this.config = config || {
                mode: this.modes.browse, // Default to browse
                use_cache: true,
                cache_ttl: 60000
            };

            // Param to stop the URL nagging if none is given
            this.config.nag = config.nag === undefined ? true : config.nag === true;
            this.config.use_cache = config.use_cache === undefined ? true : config.use_cache === true;
            this.config.cache_ttl = config.cache_ttl === undefined ? 60000 : config.cache_ttl;

            // Initialize unless told not to
            //noinspection JSUnresolvedVariable
            if (!config.no_init) {
                this.init();
            }
        };


    OkanjoProduct.prototype = {

        cache_key_prefix: 'ok_product_block_',

        modes: {
            browse: "browse",
            sense: "sense",
            single: "single"
        },

        templates: {
            error: "okanjo.error",
            main: "product.block"
        },

        css: {
            main: "product.block"
        },

        // Parameters to compile to generate the cache key
        cacheKeyAttributes: 'mode,url,selectors,text,id,q,marketplace_status,marketplace_id,external_id,sku,sold_by,min_price,max_price,condition,manufacturer,upc,isbn,tags,category,min_donation_percent,max_donation_percent,donation_to,suboptimal,skip,take'.split(','),


        constructor: OkanjoProduct,

        /**
         * Loads the widget content onto the page
         */
        init: function() {

            // Ensure we have a widget key or bail out if we don't
            if (!this.findWidgetKey()) return;

            // Make sure that we have the templates necessary to render Product
            this.ensureTemplates();

            // Parse the final widget instance configuration
            this.parseConfiguration();

            // Check if the product ID is set or is running in single mode
            if (this.config.id || this.config.mode == this.modes.single) {
                // Override mode if the ID is set or not set
                if (okanjo.util.empty(this.config.id)) {
                    this.config.mode = this.modes.browse;
                } else {
                    this.config.mode = this.modes.single;
                }

                // If in sense mode, ensure the URL param is set
            } else if (this.config.url || this.config.text || this.config.mode == this.modes.sense) {
                // Require url or text attributes
                if (okanjo.util.empty(this.config.url) && okanjo.util.empty(this.config.text)) {
                    this.config.url = this.getCurrentPageUrl();
                }
                this.config.mode = this.modes.sense;
            }

            // Immediately show products from the local browser cache, if present, for immediate visual feedback
            if (this.config.use_cache && this.loadProductsFromCache()) {
                // Loaded from cache successfully!
            } else {
                this.getProducts();
            }

            // If metrics doesn't exist in the Okanjo context for some reason, don't get bent out of shape about it
            var loc = window.location;
            okanjo.metrics.trackEvent('Okanjo Product Widget', 'Loaded', loc.protocol + '//' + loc.hostname + (loc.port ? (':' + loc.port) : '') + loc.pathname);

            // Async clean up the cache
            var self = this;
            setTimeout(function() {
                self.cleanCache();
            }, 2000);

        },


        /**
         * Make sure that a set of templates have been defined
         */
        ensureTemplates: function() {
            var templates = this.templates,
                css = this.css,
                key;
            for (key in templates) {
                if (templates.hasOwnProperty(key)) {
                    if (!okanjo.mvc.isTemplateRegistered(templates[key])) throw new Error('[Okanjo] Missing template: ' + templates[key]);
                }
            }
            for (key in css) {
                if (css.hasOwnProperty(key)) {
                    if (!okanjo.mvc.isCssRegistered(css[key])) throw new Error('[Okanjo] Missing css block: ' + css[key]);
                }
            }
        },


        /**
         * Parses the widget configuration by merging data attributes on top of the base configuration given in the constructor
         */
        parseConfiguration: function() {
            //noinspection JSUnresolvedVariable
            var attributes = okanjo.util.data(this.element);

            okanjo.util.copyIfSetMap(this.config, attributes, {

                // Widget mode
                mode: "mode", // What provider to use to retrieve products, browse, sense or single, default: browse

                // ProductSense Params
                url: "url",  // The URL to digest
                selectors: "selectors", // CSV of page element selectors, default: p,title,meta[name="description"],meta[name="keywords"]
                text: "text", // The given text to digest, but no more than 50KB

                // Search Params

                "id": "id", // The specific product ID to fetch (single mode), default: null

                "q": "query", // Search query text

                marketplace_status: ['marketplace-status'], // Option to switch to testing product pool, default: live
                marketplace_id: ['marketplace-id'], // Limit products listed under the given marketplace, default: null

                external_id: "external-id", // Vendor-given ID
                sku: "sku", // Vendor stock keeping unit
                sold_by: 'sold-by', // Limit products listed by a certain store, default: null

                min_price: "min-price", // Products with price greater-than or equal to this amount
                max_price: "max-price", // Products with price less-than or equal to this amount
                condition: "condition", // Condition of the product (e.g. new, used, refurbished, unspecified)
                manufacturer: "manufacturer", // Who made the product
                upc: "upc", // UPC code
                isbn: "isbn", // ISBN number
                tags: "tags", // CSV list of tags
                category: "category", // CSV list of categories (in order)

                min_donation_percent: "min-donation-percent", // Minimum donation amount: default: 0 (between 0 and 1)
                max_donation_percent: "max-donation-percent", // Maximum donation amount: default: 1 (between 0 and 1)
                donation_to: "donation-to", // The name of the non-profit that benefits from the purchase

                suboptimal: 'suboptimal', // Option to enable products labeled as suboptimal (e.g. products that have weak descriptions and could come back as false matches)

                // Pagination
                skip: ['skip', 'page-start'], // The index of the result set to start at, starting from 0. default: 0
                take: ['take', 'page-size'] // The number of products to return, default: 5

            }, { stripEmpty: true });
        },


        /**
         * If no canonical url or text was given in the configuration, this method will return the current page url to use
         * It will not be very nice, and will just use the path. Query string and fragment will be stripped
         * @returns {string} - The URL of the current page to have Okanjo analyze
         */
        getCurrentPageUrl: function() {

            // While we're at it, let's escape fragments too (#fun)
            //var url = window.location.href,
            //    hashBangIndex = url.indexOf('#!'),
            //    hashIndex = hashBangIndex >= 0 ? hashBangIndex : url.indexOf('#');
            //
            //if (hashIndex >= 0) {
            //    var uri = url.substring(0, hashIndex),
            //        fragment = encodeURIComponent(url.substring(hashIndex + (hashBangIndex >= 0 ? 2 : 1)));
            //    url = uri + (uri.indexOf('?') >= 0 ? '&' : '?') + '_escaped_fragment_=' + fragment;
            //}

            // On second thought, we're not so nice
            var href = window.location.href,
                stopPos = Math.min(href.indexOf('?'), href.indexOf('#')),
                url = stopPos > 0 ? href.substr(0, stopPos) : href;

            // Nag since we had to derive a URL from the window
            if (this.config.nag) {
                console.info('[Okanjo.Product] No canonical url given for ProductSense. We recommend using a canonical url to ensure page visibility by Okanjo. Using derived url:', url);
            }

            return url;
        },


        /**
         * Generates a new cache key unique to the configuration of this widget instance
         * @returns {string}
         */
        getCacheKey: function() {
            var parts = [window.location.host + window.location.pathname], keys = this.cacheKeyAttributes;
            for(var i = 0; i < keys.length; i++) {
                if (this.config[keys[i]] !== undefined) {
                    parts.push(keys[i], this.config[keys[i]]);
                }
            }
            return this.cache_key_prefix+okanjo.util.hash(parts.join(';'));
        },


        /**
         * Purges expired product stores from the cache
         */
        cleanCache: function() {
            try {
                var now = (new Date()).getTime(), expireKeys = [], safeExpireKeys = [];
                for (var i = 0; i < cache.length; i++) {
                    var key = cache.key(i);
                    if (key.indexOf(this.cache_key_prefix) === 0 && key.indexOf('_expires') < 0) { // Ignore _expires keys

                        // Look for an expirey
                        var expires = cache.getItem(key+"_expires");
                        if (expires !== null && now < parseInt(expires)) {
                            // Save the key!
                            safeExpireKeys.push(key+"_expires");
                        } else {
                            // Check if the expires
                            cache.removeItem(key);
                            cache.removeItem(key + "_expires");
                        }
                    } else if (key.indexOf('_expires') >= 0) {
                        expireKeys.push(key);
                    }
                }

                for (i = 0; i < expireKeys.length; i++) {
                    if (safeExpireKeys.indexOf(expireKeys[i]) < 0) {
                        cache.removeItem(expireKeys[i]);
                    }
                }

            } catch (e) {
                okanjo.report('Product', e);
            }
        },


        /**
         * Immediately show products from the local browser cache, if present
         * @returns boolean – True if products were successfully loaded from the cache, false if not
         */
        loadProductsFromCache: function() {
            // Check if items are cached, and if we should use them
            try {
                var cacheKey = this.getCacheKey(),
                    val = cache.getItem(cacheKey),
                    expires = cache.getItem(cacheKey+"_expires"),
                    now = (new Date()).getTime();

                // Make sure exists and has not expired
                if (val !== null && expires !== null && now < parseInt(expires)) {
                    this.items = JSON.parse(val);
                    this.showProducts(this.items);
                    return true;
                } else {
                    // Purge if expired
                    cache.removeItem(cacheKey);
                    cache.removeItem(cacheKey + "_expires");
                }
            } catch (e) {
                okanjo.report("Product", e);
            }

            return false;
        },


        /**
         * Execute the Product request to Okanjo to get some product tile markup
         */
        getProducts: function() {
            var self = this;
            this.executeSearch(function(err, res) {
                if (err) {
                    // Can't show anything, just render a generic error message
                    console.error('[Okanjo.Product] Failed to retrieve products.', err);
                    self.element.innerHTML = okanjo.mvc.render(self.templates.error, { message: 'Could not retrieve products.' });
                } else {
                    // Store the products array locally
                    self.items = res.data;

                    // Render the products
                    self.showProducts(self.items);

                    // Async save it, don't block for stringify
                    setTimeout(function() {
                        if (self.config.use_cache) {
                            // Cache the products for next page load so something loads up right away until refreshed
                            var key = self.getCacheKey();
                            cache.setItem(key, JSON.stringify(self.items));
                            cache.setItem(key+"_expires", (new Date()).getTime() + self.config.cache_ttl);
                        }
                    }, 100);

                }
            });
        },


        /**
         * Does some magic to try to track down the widget key to use for requests
         * @returns {boolean}
         */
        findWidgetKey: function() {

            // Attempt to locate the proper widget key to use for this instance
            if (!okanjo.util.empty(this.config.key)) {
                // Use the key given in the widget instance configuration
                this.key = this.config.key;
                this.config.key = this.key;
                return true;
            } else if (!okanjo.util.empty(okanjo.key)) {
                // Use the key on the okanjo instance if specified
                this.key = okanjo.key;
                this.config.key = this.key;
                return true;
            }

            // Still no key?
            if(!okanjo.util.empty(this.key)) {
                this.element.innerHTML = okanjo.mvc.render(this.templates.error, { message: 'Missing Okanjo key.' });
                okanjo.report('Product', 'Missing key. Define one using okanjo.configure or pass the key parameter as an option in the Product constructor');
                return false;
            } else {
                this.config.key = this.key;
                return true;
            }
        },


        /**
         * Performs a JSONP request to the API to get the desired products
         * @param {function(err:*, res:*)} callback – Closure to fire when completed
         */
        executeSearch: function(callback) {
            if (this.config.mode === this.modes.sense) {
                okanjo.exec(okanjo.getRoute(okanjo.routes.products_sense), this.config, callback);
            } else if (this.config.mode === this.modes.single) {
                okanjo.exec(okanjo.getRoute(okanjo.routes.products_id, { product_id: this.config.id }), this.config, function(err, res) {
                    if (!err && res && res.data) {
                        res.data = [ res.data ];
                    }
                    if (callback) callback(err, res);
                });
            } else {
                okanjo.exec(okanjo.getRoute(okanjo.routes.products), this.config, callback);
            }
        },


        /**
         * Displays the products results
         * @param {[*]} data - The array of products
         */
        showProducts: function(data) {
            this.element.innerHTML = okanjo.mvc.render(this.templates.main, {
                products: data || this.items || [],
                config: this.config
            });
        }

    };

    return okanjo.Product;

})(okanjo, this);