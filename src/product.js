//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(okanjo, window) {


    /**
     * Okanjo Product
     * @param element - DOM element to attach the output to
     * @param {*} config - Optional base widget configuration object, element data attributes will override these
     * @constructor
     */
    function Product(element, config) {
        okanjo._Widget.call(this, element, config);

        this.items = [];
        this.config = config = config || {
            mode: Product.contentTypes.browse, // Default to browse
            use_cache: true,
            cache_ttl: 60000
        };

        // Param to stop the URL nagging if none is given
        this.config.nag = config.nag === undefined ? true : config.nag === true;
        this.config.use_cache = config.use_cache === undefined ? true : config.use_cache === true;
        this.config.cache_ttl = config.cache_ttl === undefined ? 60000 : config.cache_ttl;
        this.use_cache = this.config.use_cache;
        this.cache_ttl = this.config.cache_ttl;

        // Option to ignore inline buy functionality
        this.disable_inline_buy = this.config.disable_inline_buy === undefined ? false : config.disable_inline_buy === true;

        this.cache_key_prefix = 'ok_product_block_';

        this.templates = {
            product_error: "okanjo.error",
            product_main: "product.block"
        };

        this.css = {
            product_main: "product.block",
            product_modal: "okanjo.modal"
        };

        this.configMap = {

            // Api Widget Key
            key: "key",

            // Widget mode
            mode: "mode", // What provider to use to retrieve products, browse, sense or single, default: browse
            disable_inline_buy: "disable-inline-buy", // Whether to disable inline buy functionality, default: false

            // ProductSense Params
            url: "url",  // The URL to digest
            selectors: "selectors", // CSV of page element selectors, default: p,title,meta[name="description"],meta[name="keywords"]
            text: "text", // The given text to digest, but no more than 50KB

            // Search Params

            "id": "id", // The specific product ID to fetch (single mode), default: null

            "q": "q", // Search query text

            marketplace_status: ['marketplace-status'], // Option to switch to testing product pool, default: live
            marketplace_id: ['marketplace-id'], // Limit products listed under the given marketplace, default: null

            pools: 'pools', // Limit products to one or more pools (CSV), default: global

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
            take: ['take', 'page-size'], // The number of products to return, default: 5

            expandable: 'expandable', // Indicates whether the inline_buy experience is allowed to expand outside the bounds of the widget. Default: true

            // Override template names
            template_product_main: 'template-product-main', // The product template to render, default: product.block
            template_product_error: 'template-product-error' // The product error template to render, default: okanjo.error
        };

        // Initialize unless told not to
        //noinspection JSUnresolvedVariable
        if (!config.no_init) {
            //noinspection JSUnresolvedFunction
            this.init();
        }
    }

    okanjo.util.inherits(Product, okanjo._Widget);


    Product.contentTypes = {
        browse: "browse",
        sense: "sense",
        single: "single"
    };

    var proto = Product.prototype;

    proto.widgetName = "Product";

    // Parameters to compile to generate the cache key
    proto.cacheKeyAttributes = 'mode,url,selectors,text,id,q,marketplace_status,marketplace_id,external_id,sku,sold_by,min_price,max_price,condition,manufacturer,upc,isbn,tags,category,min_donation_percent,max_donation_percent,donation_to,suboptimal,skip,take'.split(',');

    /**
     * Loads the widget content onto the page
     */
    proto.load = function() {

        // Check if the product ID is set or is running in single mode
        if (this.config.id || this.config.mode == Product.contentTypes.single) {
            // Override mode if the ID is set or not set
            if (okanjo.util.empty(this.config.id)) {
                this.config.mode = Product.contentTypes.browse;
            } else {
                this.config.mode = Product.contentTypes.single;
            }

            // If in sense mode, ensure the URL param is set
        } else if (this.config.url || this.config.text || this.config.mode == Product.contentTypes.sense) {
            // Require url or text attributes
            if (okanjo.util.empty(this.config.url) && okanjo.util.empty(this.config.text)) {
                this.config.url = this.getCurrentPageUrl();
                // Nag since we had to derive a URL from the window
                if (this.config.nag) {
                    console.info('[Okanjo.'+this.widgetName+'] No canonical url given for ProductSense. We recommend using a canonical url to ensure page visibility by Okanjo. Using derived url:', this.config.url);
                }
            }
            this.config.mode = Product.contentTypes.sense;
        } else {
            // Make sure a mode is always set, and cannot be empty
            this.config.mode = okanjo.util.empty(this.config.mode) ? Product.contentTypes.browse : this.config.mode;
        }

        // Check for CSV values and convert to an array
        (function(configNames){
            for(var i = 0; i < configNames.length; i++) {
                //noinspection JSPotentiallyInvalidUsageOfThis
                var val = this.config[configNames[i]];
                if (val && typeof val === "string" /*&& val.indexOf(',') >= 0*/) {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.config[configNames[i]] = val.split(',');
                }
            }
        }).call(this, ['pools','tags','category']);
        
        // Immediately show products from the local browser cache, if present, for immediate visual feedback
        if (this.config.use_cache && this.loadProductsFromCache()) {
            // Loaded from cache successfully!
        } else {
            this.getProducts();
        }

        // Verify the disable param is not a string
        if (this.config.disable_inline_buy && typeof this.config.disable_inline_buy === "string") {
            this.disable_inline_buy = this.config.disable_inline_buy.toLowerCase() === "true";
        }

        return true;

    };


    /**
     * Immediately show products from the local browser cache, if present
     * @returns boolean – True if products were successfully loaded from the cache, false if not
     */
    proto.loadProductsFromCache = function() {

        var items = this.loadFromCache(this.getCacheKey());
        if (items !== null) {
            this.items = items;
            this.showProducts(this.items);
            return true;
        } else {
            return false;
        }

    };


    /**
     * Execute the Product request to Okanjo to get some product tile markup
     */
    proto.getProducts = function() {
        var self = this;
        this.executeSearch(function(err, res) {
            if (err) {
                // Can't show anything, just render a generic error message
                console.error('[Okanjo.'+self.widgetName+'] Failed to retrieve products.', err);
                self.element.innerHTML = okanjo.mvc.render(self.templates.product_error, { message: 'Could not retrieve products.' });
            } else {
                // Store the products array locally
                self.items = res.data;

                // Render the products
                self.showProducts(self.items);

                if (self.use_cache) {
                    // Cache the products for next page load so something loads up right away until refreshed
                    var key = self.getCacheKey();
                    self.saveInCache(key, self.items);
                }

            }
        });
    };


    /**
     * Performs a JSONP request to the API to get the desired products
     * @param {function(err:*, res:*)} callback – Closure to fire when completed
     */
    proto.executeSearch = function(callback) {
        if (this.config.mode === Product.contentTypes.sense) {
            okanjo.exec(okanjo.getRoute(okanjo.routes.products_sense), this.config, callback);
        } else if (this.config.mode === Product.contentTypes.single) {
            okanjo.exec(okanjo.getRoute(okanjo.routes.products_id, { product_id: this.config.id }), this.config, function(err, res) {
                if (!err && res && res.data) {
                    res.data = [ res.data ];
                }
                if (callback) callback(err, res);
            });
        } else {
            okanjo.exec(okanjo.getRoute(okanjo.routes.products), this.config, callback);
        }
    };


    /**
     * Manipulates the item data to keep or remove inline_buy URLs.
     */
    proto.handleInlineBuyOption = function() {
        // If we should ignore the inline buy functionality, strip the data off the products
        if (this.disable_inline_buy) {
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].inline_buy_url = null;
            }
        }
    };


    /**
     * Displays the products results
     * @param {[*]} data - The array of products
     */
    proto.showProducts = function(data) {

        // Handle the inline buy configuration option
        this.handleInlineBuyOption();

        // Render the product content!
        this.element.innerHTML = okanjo.mvc.render(this.templates.product_main, {
            products: data || this.items || [],
            config: this.config
        });

        this.bindEvents();
        this.trackMoat();
    };


    /**
     * Handle user interaction with the product tile
     * @param e – User interaction DOM event
     * @param trigger – Whether to trigger the click event or not on the link
     */
    Product.interactTile = function(e, trigger) {
        var inline = this.getAttribute('data-inline-buy-url'),
            base = this.getAttribute('data-inline-buy-url-base'),
            expandable = this.getAttribute('data-expandable');

        if (!okanjo.util.empty(inline)) {

            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }


            var iframe = document.createElement('iframe');
            iframe.setAttribute('class', 'okanjo-inline-buy-frame');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('vspace', '0');
            iframe.setAttribute('hspace', '0');
            iframe.setAttribute('webkitallowfullscreen', '');
            iframe.setAttribute('mozallowfullscreen', '');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('scrolling', 'auto');

            iframe.src = base + "&n="+(new Date()).getTime()+"&u=" + encodeURIComponent(inline);

            if(expandable !== undefined && expandable.toLowerCase() === "false") {
                iframe.className += " okanjo-ad-in-unit";
                iframe.setAttribute('height', "100%");
                iframe.setAttribute('width', "100%");
                var parent = this.parentNode;
                while(parent && parent.className != 'okanjo-ad-container') {
                    parent = parent.parentNode;
                }
                if(parent) {
                    parent.appendChild(iframe);
                }
            } else {
                okanjo.modal.show(iframe);
            }
        } else if (trigger) {
            this.click();
        }
    };


    /**
     * Binds event listeners to the anchor elements in the product widgets
     */
    proto.bindEvents = function() {

        //noinspection JSUnresolvedFunction
        okanjo.qwery('a', this.element).every(function(a) {
            if(a.addEventListener) {
                a.addEventListener('click', Product.interactTile);
            } else {
                a.attachEvent('onclick', function(e) { Product.interactTile.call(a, e); });
            }

            return true;
        });

    };

    okanjo.Product = Product;
    return Product;

})(okanjo, this);