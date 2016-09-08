//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(okanjo, window) {


    /**
     * Okanjo Product
     * @param element - DOM element to attach the output to
     * @param {*} [config] - Optional base widget configuration object, element data attributes will override these
     * @constructor
     */
    function Product(element, config) {
        okanjo._Widget.call(this, element, config);

        this.items = [];
        this.config = config = config || {
            mode: Product.contentTypes.browse, // Default to browse
            use_cache: false,
            cache_ttl: 60000
        };

        // Param to stop the URL nagging if none is given
        this.config.nag = config.nag === undefined ? true : config.nag === true;

        // Set default caching settings
        this.config.use_cache = config.use_cache === undefined ? false : config.use_cache === true;
        this.config.cache_ttl = config.cache_ttl === undefined ? 60000 : config.cache_ttl;
        this.disable_popup = config.disable_popup === true;
        this.use_cache = this.config.use_cache;
        this.cache_ttl = this.config.cache_ttl;
        this.proxy_url = null;

        // Allow changing the metrics context, e.g. embedded in an Ad widget
        this.config.metrics_context = config.metrics_context === undefined ? "pw" : config.metrics_context;
        this.config.metrics_channel_context = config.metrics_channel_context === undefined ? null : config.metrics_channel_context;

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
            proxy_url: "proxy-url", // 3rd party click through tracking url

            // ProductSense Params
            url: "url",  // The URL to digest
            selectors: "selectors", // CSV of page element selectors, default: p,title,meta[name="description"],meta[name="keywords"]
            url_category: "url-category", // Article taxonomy (e.g. news, sports, lifestyles, etc)

            // Search Params (Filters)

            id: "id", // The specific product ID to fetch (single mode), default: null

            q: "q", // Search query text

            marketplace_status: ['marketplace-status'], // Option to switch to testing product pool, default: live
            marketplace_id: ['marketplace-id'], // Limit products listed under the given marketplace, default: null

            pools: 'pools', // Limit products to one or more pools (CSV), default: global

            external_id: "external-id", // Vendor-given ID
            sku: "sku", // Vendor stock keeping unit

            sold_by: 'sold-by', // Limit products listed by a certain store, default: null
            external_store_id: "external-store-id", // Limit products to a vendor-given store ID

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
            backfill: 'backfill', // Option to allow placing a display ad in the event no products are returned.

            // Pagination
            skip: ['skip', 'page-start'], // The index of the result set to start at, starting from 0. default: 0
            take: ['take', 'page-size'], // The number of products to return, default: 5

            expandable: 'expandable', // Indicates whether the inline_buy experience is allowed to expand outside the bounds of the widget. Default: true

            // Override template names
            template_product_main: 'template-product-main', // The product template to render, default: product.block
            template_product_error: 'template-product-error', // The product error template to render, default: okanjo.error

            // template customization options
            size: "size", // the product container size
            template_layout: "template-layout",  // Products displayed as grid or list, default grid, size can override this
            template_theme: "template-theme", // Typographic theme, either newsprint or modern, default: modern
            template_cta_style: "template-cta-style", // The CTA button visual style. Can be button or link, links will take less space.
            template_cta_text: "template-cta-text", // The text within the CTA button, will be css-truncated if too long for given layout, default: Shop Now
            template_cta_color: "template-cta-color" // The color of text of the CTA button or link, default: 0099ff.
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
            this.config.take = this.config.take || 5; // Default the take to ensure an upper-bound is set
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

        // Set the metric context to the product mode, if not already set
        if (this.config.metrics_channel_context === null) {
            this.config.metrics_channel_context = this.config.mode;
        }

        // Set the proxy url, if present
        if (this.config.proxy_url) {
            this.proxy_url = this.config.proxy_url;

            // Don't send this (probably gigantic) url on jsonp requests
            delete this.config.proxy_url;
        }

        // Build the base metric data for events from this widget
        // Generate metric url for this type
        this.metricBase = {
            // id: 'APPLIED IN TEMPLATE',
            ch: this.config.metrics_context,
            cx: this.config.metrics_channel_context || this.config.mode,
            key: this.config.key,
            m: {
                //ok_ver: 'COMES FROM NORMALIZATION',
                //pgid: 'COMES FROM NORMALIZATION',
                //bf: 'APPLIED IN TEMPLATE',
                wgid: this.instanceId
            }
        };

        // Immediately show products from the local browser cache, if present, for immediate visual feedback
        if (this.config.use_cache && this.loadProductsFromCache()) {
            // Loaded from cache successfully!
            // Notify integrations that the widget loaded
            this.emit('load', { fromCache: true });
        } else {
            this.getProducts();
        }

        // Verify the disable param is not a string
        if (this.config.disable_inline_buy && typeof this.config.disable_inline_buy === "string") {
            this.disable_inline_buy = this.config.disable_inline_buy.toLowerCase() === "true";
        }

        // Track widget impression
        if (this.config.metrics_context == okanjo.metrics.channel.product_widget) {
            var eventData = okanjo.util.deepClone(this.metricBase, {});
            eventData.m = okanjo.metrics.truncate(okanjo.metrics.copy(this.config, okanjo.metrics.includeElementInfo(this.element, eventData.m)));
            okanjo.metrics.trackEvent(okanjo.metrics.object_type.widget, okanjo.metrics.event_type.impression, eventData);
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
        var self = this, count;
        this.executeSearch(function(err, res) {
            if (err) {
                // Can't show anything, just render a generic error message
                console.error('[Okanjo.'+self.widgetName+'] Failed to retrieve products.', err);
                self.element.innerHTML = okanjo.mvc.render(self.templates.product_error, self, { message: 'Could not retrieve products.' });
                self.emit('error', err);
            } else {

                // Hook on empty
                count = (res.data||[]).length;
                if (count === 0) self.emit('empty');

                // Check for adx backfill scenario, if allowed
                if (res.backfillADX) {

                    // Replace content with backfill from adx
                    self.backfillAd();

                } else {

                    // Store the products array locally
                    self.items = res.data;
                    self.numFound = res.numFound;
                    self.articleId = res.articleId;
                    self.placementTest = res.placementTest;
                    self.shorted = self.config.mode == Product.contentTypes.sense && self.config.take > count;

                    // Update the base metric data with new new information
                    if (self.articleId) self.metricBase.m.aid = self.articleId;
                    self.metricBase.m.pten = (self.placementTest && self.placementTest.enabled) ? '1' : '0';
                    if (self.placementTest) {
                        if (self.placementTest.id) self.metricBase.m.ptid = self.placementTest.id;
                        if (self.placementTest.seed) self.metricBase.m.ptseed = self.placementTest.seed;
                    }

                    // Allow hooks when the response returns from the server
                    self.emit('data', res);

                    // Render the products
                    self.showProducts(self.items);

                    // If cache is enabled and placement testing is not applicable
                    if (!self.shorted && self.use_cache && (!self.placementTest || (self.placementTest && !self.placementTest.enabled))) {
                        // Cache the products for next page load so something loads up right away until refreshed
                        var key = self.getCacheKey();
                        self.saveInCache(key, self.items);
                    }

                    // Allow hooks when the product widget finishes initialization
                    self.emit('load', {fromCache: false});
                }
            }
        });
    };


    /**
     * Performs a JSONP request to the API to get the desired products
     * @param {function(err:*, res:*)} callback – Closure to fire when completed
     */
    proto.executeSearch = function(callback) {
        var config = okanjo.util.deepClone(this.config);
        if (this.config.mode === Product.contentTypes.sense) {
            okanjo.exec(okanjo.getRoute(okanjo.routes.products_sense), config, callback);
        } else if (this.config.mode === Product.contentTypes.single) {
            okanjo.exec(okanjo.getRoute(okanjo.routes.products_id, { product_id: this.config.id }), config, function(err, res) {
                if (!err && res && res.data) {
                    res.data = [ res.data ];
                }
                if (callback) callback(err, res);
            });
        } else {
            okanjo.exec(okanjo.getRoute(okanjo.routes.products), config, callback);
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
        this.element.innerHTML = okanjo.mvc.render(this.templates.product_main, this, {
            products: data || this.items || [],
            config: this.config
        });

        this.bindEvents();
    };


    /**
     * Builds the final frame url to use, given the base, url, and params to tack on
     * @param eventData – Metric event data
     * @param inline – Inline buy URL
     * @param proxy – The vendor given url to redirect to, after we've tracked the interaction, which should redirect to the buy_url
     * @param params – Additional params to tack on to the inline buy URL
     * @returns {string} – Final frame url
     */
    function makeClickThroughUrl(eventData, inline, proxy, params) {

        var pairs = [],
            i,
            joiner = (inline.indexOf('?') < 0 ? '?' : '&'),
            buy_url;

        for (i in params) {
            if (params.hasOwnProperty(i)) {
                pairs.push(i+"="+encodeURIComponent(params[i]));
            }
        }

        // Normalize the event data
        okanjo.metrics.normalizeEventData(eventData);

        // Cache buster
        eventData.n = (new Date()).getTime();

        // Build buy url
        buy_url = inline + (pairs.length > 0 ? (joiner + pairs.join('&')) : "");

        // If we're relaying through a proxy tracker, then build the link accordingly
        if (proxy) {
            eventData.u = proxy + encodeURIComponent(buy_url);
        } else {
            eventData.u = buy_url;
        }

        // Convert event to url
        return okanjo.JSONP.makeUrl({
            url: okanjo.getRoute(okanjo.routes.metrics, {
                object_type: okanjo.metrics.object_type.product,
                event_type: okanjo.metrics.event_type.interaction
            }),
            data: eventData
        });
    }


    /**
     * Handle user interaction with the product tile
     * @param e – User interaction DOM event
     * @param trigger – Whether to trigger the click event or not on the link
     */
    Product.interactTile = function(e, trigger) {

        var container = this.parentNode.parentNode,
            eventData = JSON.parse(container.getAttribute('data-metric-json')),
            expandable = container.getAttribute('data-expandable'),
            disablePopup = container.getAttribute('data-disable-popup') || false,
            backfill = this.getAttribute('data-backfill'),
            buyUrl = this.getAttribute('data-buy-url'),
            inline = this.getAttribute('data-inline-buy-url'),
            proxyUrl = this.getAttribute('data-proxy-url'),
            url,
            inlineParams = {},
            expanded = false,
            nativeBuy = !okanjo.util.empty(inline),
            doPopup = disablePopup ? false : (okanjo.util.isMobile() && nativeBuy),
            passThroughParams = "ok_msid=" + okanjo.metrics.sid + '&ok_ch=' + eventData.ch + '&ok_cx=' + eventData.cx,
            modifiedBuyUrl = buyUrl + (buyUrl.indexOf('?') < 0 ? '?' : '&') + passThroughParams,
            modifiedInlineBuyUrl = inline + (inline.indexOf('?') < 0 ? '?' : '&') + passThroughParams;

        // Add product / positional meta data
        eventData.id = this.getAttribute('data-id');
        eventData.m = okanjo.metrics.includeEventInfo(e, okanjo.metrics.includeViewportInfo(okanjo.metrics.includeElementInfo(this, eventData.m)));

        // Show a new window on applicable devices instead of a native buy experience
        if (doPopup) {

            //
            // Mobile devices (especially iOS) have real janky UX when interacting with iframes.
            // So, we'll choose to popup a window with the native buy experience, so we can ensure
            // a positive user experience. Nobody likes bouncy form fields and really weird zooming.
            //

            // Tell the buy experience that we're loading up in a popup, so they can render that nicely
            eventData.ea = okanjo.metrics.action.inline_click;
            eventData.m.popup = 'true';
            url = makeClickThroughUrl(eventData, modifiedInlineBuyUrl, proxyUrl, { popup: 1 });

            okanjo.active_frame = window.open(url, "okanjo-inline-buy-frame", "width=400,height=400,location=yes,resizable=yes,scrollbars=yes");
            if (!okanjo.active_frame) {

                console.error('Popup blocker prevented new inline-buy experience from being displayed');

                // fallback to an anchor click using the inline buy url
                this.href = url;

            } else {
                e.preventDefault();
            }

        } else if (nativeBuy) {

            //
            // Native/Inline Buy (buy on the page)
            // All the conditions are right to embed the inline buy experience right here, right now.
            // Whip up a new iframe with the target url and either show it as a modal or confine it to the widget space
            //

            e.preventDefault();

            var frame = document.createElement('iframe'),
                frameAttributes = {
                    'class': 'okanjo-inline-buy-frame',
                    frameborder: 0,
                    vspace: 0,
                    hspace: 0,
                    webkitallowfullscreen: '',
                    mozallowfullscreen: '',
                    allowfullscreen: '',
                    scrolling: 'auto'
                };

            for (var i in frameAttributes) {
                if (frameAttributes.hasOwnProperty(i)) {
                    frame.setAttribute(i, frameAttributes[i]);
                }
            }

            // By default, we assume we're going to modal, which is an expandable
            inlineParams.expandable = 1;

            // Now check if we should not actually be expanding
            if (expandable !== undefined && expandable.toLowerCase() === "false") {

                //
                // Non-expandable: Per IAB, we should not expand the ad content past the bounds of the ad unit
                // So, confine the iframe to the bounds of the ad.
                //

                // Locate the parent ad container and attempt to shove the frame in there
                // If it fails to do so, then resort to a modal, since expandable was set not on an ad, de72qw2227.
                var candidate = this, parent = null;
                while(candidate) {
                    candidate = candidate.parentNode;
                    if (candidate && candidate.className && candidate.className.indexOf('okanjo-expansion-root') >= 0) {
                        parent = candidate;
                    }
                }

                // If we have the parent ad unit container, then stick it in there, otherwise let it fallback to a modal
                if (parent) {
                    frame.className += " okanjo-ad-in-unit";
                    frame.setAttribute('height', "100%");
                    frame.setAttribute('width', "100%");

                    parent.appendChild(frame);
                    expanded = true;

                    // Provide the buy experience some context information
                    var size = okanjo.util.getElementSize(parent);
                    inlineParams.expandable  = 0;
                    inlineParams.frame_height = size.height;
                    inlineParams.frame_width  = size.width;
                    inlineParams.ad_size = parent.getAttribute('data-size') || "undefined";
                }
            }

            eventData.ea = okanjo.metrics.action.inline_click;
            eventData.m.expandable = (inlineParams.expandable === 1 ? 'true' : 'false');
            url = makeClickThroughUrl(eventData, modifiedInlineBuyUrl, proxyUrl, inlineParams);

            frame.src = url;

            if (!expanded) {
                okanjo.modal.show(frame);
            }

        } else if (trigger) {
            eventData.ea = okanjo.metrics.action.click;
            this.href = makeClickThroughUrl(eventData, modifiedBuyUrl, proxyUrl, {});
            this.click();
        } else {
            eventData.ea = okanjo.metrics.action.click;
            this.href = makeClickThroughUrl(eventData, modifiedBuyUrl, proxyUrl, {});
        }
    };


    /**
     * Binds event listeners to the anchor elements in the product widgets
     */
    proto.bindEvents = function() {

        var self = this;

        //noinspection JSUnresolvedFunction
        okanjo.qwery('a', this.element).every(function(a) {
            var id = a.getAttribute('data-id');
            if (id) {
                if (a.addEventListener) {
                    a.addEventListener('click', Product.interactTile);
                } else {
                    a.attachEvent('onclick', function (e) {
                        Product.interactTile.call(a, e);
                    });
                }

                // Only stick metrics on the product widget if *not* embedded in another widget
                if (self.config.metrics_context == okanjo.metrics.channel.product_widget) {

                    // Gather the goods
                    var backfill = a.getAttribute('data-backfill'),
                        eventData = okanjo.util.deepClone(self.metricBase, {});

                    // Was the product loaded as a last-ditch effort?
                    eventData.id = a.getAttribute('data-id');
                    eventData.m.bf = (backfill === "true") ? 1 : 0;

                    // Update the event metadata
                    eventData.m = okanjo.metrics.truncate(okanjo.metrics.copy(self.config, okanjo.metrics.includeElementInfo(a.parentNode, eventData.m)));

                    // Track product impression event
                    okanjo.metrics.trackEvent(okanjo.metrics.object_type.product, okanjo.metrics.event_type.impression, eventData);
                }
            }

            return true;
        });

        // Show ellipses on title text that doesn't quite fit
        okanjo.qwery('.okanjo-product-title', this.element).every(function(t) {
            okanjo.util.ellipsify(t);
            return true;
        });
    };


    /**
     * Fills the widget with empty products to best match an ad to the dimensions of the widget
     * @return {{width:number,height:number}|null}
     */
    proto.guessAdSize = function() {
        // Load the container with placeholders to see how big we expand to.
        var size, items = [], i = 0,
            //sizes = '980x120|980x90|970x250|970x90|970x66|960x90|950x90|930x180|750x300|750x200|750x100|728x90|580x400|468x60|336x280|320x100|320x50|300x1050|300x600|300x250|300x100|300x50|300x31|292x30|250x360|250x250|240x400|240x133|234x60|220x90|200x446|200x200|180x150|160x600|125x125|120x600|120x240|120x60|88x31'.split('|'),
            sizes = '300x250|728x90|250x250|200x200|120x240|468x60|180x150|320x50|125x125|234x60'.split('|'),
            sizeInstance, sizeInstanceWidth, sizeInstanceHeight;

        for ( ; i < this.config.take; i++) {
            items.push({});
        }
        this.showProducts(items);

        // Get the actual size of the unit
        size = okanjo.util.getElementSize(this.element);

        // Drop the content
        this.element.innerHTML = "";

        // Avoid rounding errors in some browsers (looking at you, IE8)
        size.width += 1;
        size.height += 1;

        // Best fit the size to an ad-size
        for (i = 0; i < sizes.length; i++) {
            sizeInstance = sizes[i].split('x');
            sizeInstanceWidth = parseInt(sizeInstance[0]);
            sizeInstanceHeight = parseInt(sizeInstance[1]);
            if (sizeInstanceWidth <= size.width && sizeInstanceHeight <= size.height) {
                return { width: sizeInstanceWidth, height: sizeInstanceHeight };
            }
        }

        // No match, don't show an ad
        return null;
    };


    /**
     * Starts the backfill process to show an backup display ad
     */
    proto.backfillAd = function() {

        var backfill = this.config.backfill,
            match,
            size = null;

        if (typeof backfill === "string") {
            // Check if the backfill target is a known ad unit size
            if (okanjo.Ad) {
                size = okanjo.Ad.sizes[backfill];
            }

            // Check if the string is a dimensional value
            if (!size) {
                /* jshint -W084 */
                if (match = (/^([0-9]+)x([0-9]+)$/i).exec(backfill)) {
                    size = {
                        width: match[1],
                        height: match[2]
                    };
                }
                /* jshint +W084 */
            }
        }

        // Do we have to guess the size?
        if (!size) {
            size = this.guessAdSize();
        }

        if (size) {
            this.loadAd(size);
        } else {
            console.error('[Okanjo.'+this.widgetName+'] Failed to backfill ad: Unable to match ad size to widget dimensions');
        }
    };


    /**
     * Loads an ad from Google Adx of the given dimensions
     * @param size
     */
    proto.loadAd = function(size) {
        var adxframe = document.createElement('iframe'),
            frameAttributes = {
                'class': 'okanjo-inline-buy-frame',
                frameborder: 0,
                vspace: 0,
                hspace: 0,
                webkitallowfullscreen: '',
                mozallowfullscreen: '',
                allowfullscreen: '',
                scrolling: 'auto'
            },
            pubId = 'ca-pub-9976681432228271',
            slotId = '3992956792',
            adxframeContent = '<html><head><style type="text/css">html,body {margin: 0; padding: 0;}</style></head><body><'+'script type="text/javascript">' +
                'google_ad_client = "'+pubId+'";' +
                'google_ad_slot = "'+slotId+'";' +
                'google_ad_width = '+size.width+';' +
                'google_ad_height = '+size.height+';' +
                'google_page_url = "'+window.location.href+'";' +
                //'google_adtest = "on";' +
                '<'+'/script>' +
                '<' +'script type="text/javascript" src="//pagead2.googlesyndication.com/pagead/show_ads.js"><'+'/script></body></html>';

        this.element.innerHTML = "";
        this.element.appendChild(adxframe);
        adxframe.contentWindow.document.open();
        adxframe.contentWindow.document.write(adxframeContent);
        adxframe.contentWindow.document.close();

        for (var i in frameAttributes) {
            if (frameAttributes.hasOwnProperty(i)) {
                adxframe.setAttribute(i, frameAttributes[i]);
            }
        }

        adxframe.className = "okanjo-ad-backfill";
        adxframe.setAttribute('width', size.width + "px");
        adxframe.setAttribute('height', size.height + "px");

        // Track backfill impression
        var eventData = okanjo.util.deepClone(this.metricBase, {});
        eventData.m.ta_w = size.width;
        eventData.m.ta_h = size.height;
        eventData.m.ta_pubid = pubId;
        eventData.m.ta_slotid = slotId;
        eventData.m = okanjo.metrics.truncate(okanjo.metrics.copy(this.config, okanjo.metrics.includeElementInfo(this.element, eventData.m)));
        okanjo.metrics.trackEvent(okanjo.metrics.object_type.thirdparty_ad, okanjo.metrics.event_type.impression, eventData);
    };

    okanjo.Product = Product;
    return Product;

})(okanjo, this);