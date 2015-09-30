//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(okanjo, window) {

    /**
     * Okanjo Ad
     * @param element - DOM element to attach the output to
     * @param {*} [config] - Optional base widget configuration object, element data attributes will override these
     * @constructor
     */
    function Ad(element, config) {

        okanjo._Widget.call(this, element, config);

        this.config = config = config || {};

        this.templates = {
            ad_error: "okanjo.error",
            ad_main: "ad.block"
        };

        this.css = {
            ad_main: "ad.block"
        };

        this.disable_inline_buy = this.config.disable_inline_buy === undefined ? false : config.disable_inline_buy === true;

        this.configMap = {

            // Api Widget Key
            key: "key",

            // How should this thing look?
            content: "content", // The content of the ad, creative or dynamic. Default: creative if element has markup, dynamic if not.
            size: "size", // Hint as to the intended IAB display size, e.g. large_rectangle, leaderboard, skyscraper. Default: medium_rectangle
            expandable: "expandable", // Indicates whether the inline_buy experience is allowed to expand outside the bounds of the widget. Default: true

            // What should this thing point at?
            type: "type", // The source type. Default: product
            id: "id", // The source id. e.g. PRasdfMyProductId. Default: null

            // Allow overriding of the ad templates
            template_ad_main: 'template-ad-main',
            template_ad_error: 'template-ad-error',

            // Pass these params through to the underlying product widget
            disable_inline_buy: "disable-inline-buy", // Whether to disable inline buy functionality, default: false
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

    // Extend the base widget
    okanjo.util.inherits(Ad, okanjo._Widget);


    /**
     * Ad display types
     * @type {{creative: string, dynamic: string}}
     */
    Ad.contentTypes = {
        creative: "creative",
        dynamic: "dynamic"
    };


    /**
     * Ad display types (currently just product)
     * @type {{product: string}}
     */
    Ad.types = {
        product: "product"
    };


    /**
     * Known Ad Dimensions
     */
    Ad.sizes = {

        // IAB / Others
        billboard:              { width: 970, height: 250 }, // aka: sidekick
        button_2:               { width: 120, height:  60 },
        half_page:              { width: 300, height: 600 }, // aka: filmstrip, sidekick
        leaderboard:            { width: 728, height:  90 },
        medium_rectangle:       { width: 300, height: 250 }, // aka: sidekick
        micro_bar:              { width:  88, height:  31 },
        portrait:               { width: 300, height:1050 },
        rectangle:              { width: 180, height: 150 },
        super_leaderboard:      { width: 970, height:  90 }, // aka: pushdown, slider, large_leaderboard
        wide_skyscraper:        { width: 160, height: 600 },

        // Google
        large_mobile_banner:    { width: 320, height: 100 },
        mobile_leaderboard:     { width: 320, height:  50 },
        small_square:           { width: 200, height: 200 },

        // Retired / Deprecated
        button_1:               { width: 120, height:  90 },
        full_banner:            { width: 468, height:  60 },
        half_banner:            { width: 234, height:  60 },
        large_rectangle:        { width: 336, height: 280 },
        pop_under:              { width: 720, height: 300 },
        three_to_one_rectangle: { width: 300, height: 100 },
        skyscraper:             { width: 120, height: 600 },
        square:                 { width: 250, height: 250 },
        square_button:          { width: 125, height: 125 },
        vertical_banner:        { width: 120, height: 240 },
        vertical_rectangle:     { width: 240, height: 400 }
    };

    var proto = Ad.prototype;

    /**
     * Ad Widget!
     * @type {string}
     */
    proto.widgetName = 'Ad';

    /**
     * Widget loader, sandwiched in the widget init
     * @returns {boolean}
     */
    proto.load = function() {
        //
        // Ensure proper content
        //

        if (okanjo.util.empty(this.config.content)) {
            if (this.hasCreativeContent()) {
                this.config.content = Ad.contentTypes.creative;
            } else {
                this.config.content = Ad.contentTypes.dynamic;
            }
        } else if (this.config.content === Ad.contentTypes.creative && !this.hasCreativeContent()) {
            // You say you want creative, but you don't really have any
            console.warn('[Okanjo.Ad] Ad content is creative, but ad placement does not contain creative markup. Switching to dynamic!');
            this.config.content = Ad.contentTypes.dynamic;
        } else if (this.config.content === Ad.contentTypes.dynamic && this.hasCreativeContent()) {
            console.warn('[Okanjo.Ad] Ad content is dynamic, but ad placement contains markup. Markup will be clobbered!');
        } else if (!Ad.contentTypes.hasOwnProperty(this.config.content)){
            this.element.innerHTML = okanjo.mvc.render(this.templates.ad_error, this, { message: 'Invalid ad content: ' + this.config.content });
            okanjo.report(this.widgetName, 'Invalid ad content: ' + this.config.content);
            return false;
        }


        //
        // Ensure proper type
        //

        if (okanjo.util.empty(this.config.type)) {

            // Default to product
            this.config.type = Ad.types.product;

            //if (okanjo.util.empty(this.config.size)) {
            //    this.config.size = Ad.sizes.medium_rectangle; // Defaults to medium_rectangle
            //}
        } else if (!Ad.types.hasOwnProperty(this.config.type)) {
            console.warn('[Okanjo.'+this.widgetName+'] Unknown type', this.config.type, 'given, using type `product` instead');
            this.config.type = Ad.types.product;
        }


        //
        // Ensure element size
        //

        // Check if we have known dimensions
        if (!okanjo.util.empty(this.config.size) && Ad.sizes.hasOwnProperty(this.config.size)) {
            // Set the placement's dimensions automagically
            this.setElementSize(Ad.sizes[this.config.size]);
        }

        // Verify the disable param is not a string
        if (this.config.disable_inline_buy && typeof this.config.disable_inline_buy === "string") {
            this.disable_inline_buy = this.config.disable_inline_buy.toLowerCase() === "true";
        }

        //
        // Ensure target id, and RENDER IT!
        //

        if (this.config.type === Ad.types.product) {

            // Make sure an ID is set
            if (okanjo.util.empty(this.config.id)) {
                this.element.innerHTML = okanjo.mvc.render(this.templates.ad_error, this, { message: 'Missing ad product id' });
                okanjo.report(this.widgetName, 'Missing ad product id');
                return false;
            }

            // Get the product
            if (this.config.content == Ad.contentTypes.dynamic) {
                // If dynamic, render in a product block
                this.insertProductWidget();
            } else if (this.config.content == Ad.contentTypes.creative) {
                // If creative, don't mess with the markup, just bind up the click / modal
                this.insertCreativeWidget();
            } else {
                this.element.innerHTML = okanjo.mvc.render(this.templates.ad_error, this, { message: 'Cannot render ad in content: ' + this.config.content });
                okanjo.report(this.widgetName, 'Cannot render ad in content: ' + this.config.content);
                return false;
            }

        }

        // Track ad widget load
        okanjo.metrics.trackEvent(okanjo.metrics.object_type.widget, okanjo.metrics.event_type.impression, {
            ch: okanjo.metrics.channel.ad_widget,
            cx: this.config.content,
            m: okanjo.util.deepClone(this.config, okanjo.metrics.includeElementInfo(this.element))
        });

        return true;

    };


    /**
     * Renders the ad and moves existing content into the spot it should be
     */
    proto.render = function() {

        var div = document.createElement('div'),
            existingChildren = [],
            i,
            fit = this.config.content == Ad.contentTypes.dynamic && !okanjo.util.empty(this.config.size);

        div.innerHTML = okanjo.mvc.render(this.templates.ad_main, this, {
            //products: data || this.items || [],
            config: this.config
        }, {
            blockClasses: fit ? ['okanjo-ad-fit'] : []
        });


        // Get all children in the current element
        for( i = 0; i < this.element.childNodes.length; i++) {
            if (this.element.childNodes[i].nodeType === 1 /*Node.ELEMENT_NODE*/) {
                existingChildren.push(this.element.childNodes[i]);
            }
        }


        // Attach markup to the element
        for( i = 0; i < div.childNodes.length; i++) {
            if (div.childNodes[i].nodeType === 1 /*Node.ELEMENT_NODE*/) {
                this.element.appendChild(div.childNodes[i]);
            }
        }

        // Get the new container element
        //noinspection JSUnresolvedFunction
        var container = okanjo.qwery('.okanjo-ad-container', this.element)[0];


        // Move children to the new container
        for( i = 0; i < existingChildren.length; i++ ) {
            container.appendChild(existingChildren[i]);
        }

        // Stick a moat tag on the bottom of the ad
        this.trackMoat({
            element: container,
            levels: [
                this.config.key,
                okanjo.metrics.channel.ad_widget,
                this.config.id
            ],
            slicers: [
                window.location.hostname + window.location.pathname
            ]
        });

        // Track product impression
        okanjo.metrics.trackEvent(okanjo.metrics.object_type.product, okanjo.metrics.event_type.impression, {
            id: this.config.id,
            ch: okanjo.metrics.channel.ad_widget, // pw or aw
            cx: this.config.content, // single, browse, sense | creative, dynamic
            me: okanjo.util.deepClone(this.config, okanjo.metrics.includeElementInfo(this.element))
        });

    };


    /**
     * When a creative ad is clicked, funnel the event to the nearest product
     * @param e
     */
    proto.interact = function(e) {
        //noinspection JSUnresolvedFunction
        var links = okanjo.qwery('a', this.productWidget.element);
        if (links.length > 0) {
            this._waitingOnProductLoad = false;
            okanjo.Product.interactTile.call(links[0], e, true);
        } else {
            if (!this._waitingOnProductLoad) {
                this._waitingOnProductLoad = true;
                var self = this,
                    interval = setInterval(function() {
                        if (!self._waitingOnProductLoad) {
                            clearInterval(interval);
                        } else {
                            self.interact(e);
                        }
                    }, 250);
                console.warn('Waiting for Okanjo Product widget to load...');
            }
        }
    };


    /**
     * Formats the creative content and adds a product widget in the ad space
     */
    proto.insertCreativeWidget = function() {
        this.insertProductWidget({ hidden: true });

        // Bind a click handler
        var self = this;
        if (this.element.addEventListener) {
            this.element.addEventListener('click', function(e) { self.interact(e); });
        } else {
            this.element.attachEvent('onclick', function(e) { self.interact(e); });
        }
    };


    /**
     * Inserts a product widget into the ad space
     * @param [options]
     * @returns {okanjo.Product|*}
     */
    proto.insertProductWidget = function(options) {
        options = options || {};

        // Create a non-conflicting container for the ad block
        var el = document.createElement('div');
        el.className = 'okanjo-ad-dynamic-product';

        if (options.hidden) {
            el.style.display = "none";
        }

        this.element.appendChild(el);

        this.render();

        var productWidgetConfig = {
            id: this.config.id,
            key: this.key,
            mode: okanjo.Product.contentTypes.single,
            disable_inline_buy: this.disable_inline_buy,
            expandable: this.config.expandable === undefined || (typeof this.config.expandable === "boolean" ? this.config.expandable : (""+this.config.expandable).toLowerCase() === "true"),
            metrics_context: okanjo.metrics.channel.ad_widget, // Set the context of the click to the Ad widget please!
            metrics_channel_context: this.config.content, // Set the channel context to this widget's mode of operation (creative, dynamic)
            template_product_main: "product.single"
        };

        // Copy parameters through from the ad config, to the product config, if set
        (function addIfSet(params,config) {
            for (var i = 0; i < params.length; i++) {
                if (config[params[i]] !== undefined) {
                    productWidgetConfig[params[i]] = config[params[i]];
                }
            }
        })(['template_product_main','template_product_error'], this.config);

        // Instantiate the widget
        this.productWidget = new okanjo.Product(el, productWidgetConfig);

        return this.productWidget;
    };


    /**
     * Updates the placement element's dimensions based on given size
     * @param size
     */
    proto.setElementSize = function(size) {
        this.element.style.display = "block";
        this.element.style.overflow = "hidden";
        this.element.style.width = size.width + "px";
        this.element.style.height = size.height + "px";
    };


    /**
     * Check if the element has predefined content to show
     * @returns {boolean}
     */
    proto.hasCreativeContent = function() {
        if (this.element.childElementCount && this.element.childElementCount > 0) {
            return true;
        } else {
            for (var i = 0; i < this.element.childNodes.length; i++) {
                if (this.element.childNodes[i].nodeType === 1/*Node.ELEMENT_NODE*/) {
                    return true;
                }
            }
        }
    };


    okanjo.Ad = Ad;
    return Ad;

})(okanjo, this);