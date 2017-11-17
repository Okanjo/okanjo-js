"use strict";

import okanjo from './Okanjo';
import metrics, { Metrics} from './Metrics';
import Widget from './Widget';

//region Imports and Constants

const { string, array, float, int, bool } = Widget.Field;
const TemplateEngine = okanjo.ui.engine.constructor;

const FILTERS = 'filters';
const DISPLAY = 'display';
const ARTICLE_META = 'article_meta';

const MINIMUM_VIEW_PX = 0.5;    // 50% of pixels must be in viewport
const MINIMUM_VIEW_TIME = 1000; // for 1 full second
const MINIMUM_VIEW_FREQ = 2;    // time / freq = interval

//endregion

/**
 * Placement widget
 */
class Placement extends Widget {

    //region Configuration & Overrides

    /**
     * Initializes a new placement
     * @param element
     * @param options
     */
    constructor(element, options = {}) {

        // Flatten the options before passing on
        options = okanjo.util.flatten(options, { ignoreArrays: true });
        super(element, options);

        this.name = 'Placement';
        this._metricBase = {}; // placeholder for metrics
        this._response = null;

        // Aggregate view watchers into a single interval fn
        this._viewWatcherIv = null;
        this._viewedWatchers = [];

        // Start loading content
        if (!options.no_init) this.init();
    }

    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    /**
     * Gets the widget settings configuration
     * @return {{type: *, ids: *, q: *, url: *, url_referrer: *, url_selectors: *, organization_id: *, property_id: *, store_id: *, organization_name: *, property_name: *, store_name: *, external_id: *, sku: *, external_store_id: *, condition: *, manufacturer: *, upc: *, isbn: *, tags: *, category: *, pools: *, min_price: *, max_price: *, min_donation_percent: *, max_donation_percent: *, donation_to: *, sort_by: *, sort_direction: *, skip: *, take: *, placement_tests_only: *, size: *, template_name: *, template_layout: *, template_theme: *, template_cta_style: *, template_cta_text: *, template_cta_color: *, adx_unit_path: *, url_category: *, url_keywords: *, no_init: *, proxy_url: *, expandable, disable_inline_buy, disable_popup, backwards: *}}
     */
    getSettings() {
        return {

            // What type of response do you want
            type: string().group(FILTERS),

            // What specific products do you want
            ids: array().group(FILTERS),

            // Filter by generic query string
            q: string().group(FILTERS),

            // Filter by relation to content
            url: string().group(FILTERS),
            url_referrer: string().group(FILTERS).strip(),
            url_selectors: string().group(FILTERS),

            // Filter by hierarchy
            organization_id: string().group(FILTERS),
            property_id: string().group(FILTERS),
            store_id: string().group(FILTERS),

            // Filter by hierarchy names (use *_id where possible, this might not work as you might expect)
            organization_name: string().group(FILTERS),
            property_name: string().group(FILTERS),
            store_name: string().group(FILTERS),

            // Filter by integrations
            external_id: string().group(FILTERS),
            sku: string().group(FILTERS),
            external_store_id: string().group(FILTERS),

            // Filter by product attributes
            condition: string().group(FILTERS),
            manufacturer: string().group(FILTERS),
            upc: string().group(FILTERS),
            isbn: string().group(FILTERS),

            // Filter by categorization / distribution
            tags: array().group(FILTERS),
            category: array().group(FILTERS),
            pools: array().group(FILTERS),

            // Filter by price range
            min_price: float().group(FILTERS),
            max_price: float().group(FILTERS),

            // Filter by donation ranges
            min_donation_percent: float().group(FILTERS),
            max_donation_percent: float().group(FILTERS),

            // Filter by donation recipient
            donation_to: string().group(FILTERS),

            // Sorting
            sort_by: string().group(FILTERS),
            sort_direction: string().group(FILTERS),

            // Pagination
            skip: int().group(FILTERS),
            take: int().group(FILTERS),

            // Placement Testing
            placement_tests_only: bool(),

            // Display settings
            size: string().group(DISPLAY),
            template_name: string().group(DISPLAY),
            template_layout: string().group(DISPLAY),
            template_theme: string().group(DISPLAY),
            template_cta_style: string().group(DISPLAY),
            template_cta_text: string().group(DISPLAY),
            template_cta_color: string().group(DISPLAY),
            adx_unit_path: string().group(DISPLAY), // Custom DFP ad unit path

            // Article metadata
            url_category: array().group(ARTICLE_META),
            url_keywords: array().group(ARTICLE_META),

            // Functional settings
            key: string().strip(), // don't need to resend key on all our requests
            no_init: bool().strip(), // don't automatically load the placement, do it manually (e.g. (new Placement({no_init:true})).init()
            proxy_url: string().strip(),
            expandable: bool().strip().default(true),
            disable_inline_buy: bool().strip().default(false), // stops inline buy functionality
            disable_popup: bool().strip().default(false), // stops new window on mobile for inline buy functionality
            backwards: string().strip() // internal flag indicating port from a deprecated widget
        };
    }

    /**
     * Gets the widget configuration formatted using settings, suitable for transmission
     * @return {{filters: {}, display: {}, backfill: {}, article_meta: {}}}
     */
    getConfig() {
        const settings = this.getSettings();
        const out = { filters: {}, display: {}, backfill: {}, article_meta: {} };
        const backfillPattern = /^backfill_(.+)$/; // backfill_property

        Object.keys(this.config).forEach((origKey) => {
            let val = this.config[origKey];
            let key = origKey;
            let isBackfill = false;
            let group = null;

            // Get the property name if it was prefixed with backfill
            let matches = backfillPattern.exec(origKey);
            if (matches) {
                key = matches[1];
                isBackfill = true;
            }

            // Check if this is a known property
            if (settings[key]) {
                val = settings[key].value(val);
                group = settings[key].getGroup();
            }

            // Init the target/group if not already setup
            let target = isBackfill ? out.backfill : out;
            if (group) {
                target[group] = target[group] || {};
                target = target[group];
            }

            // Set the value on the target if set
            if (val === null) {
                target[key] = ''; // format null values as empty strings for transmission
            } else if (val !== undefined) {
                target[key] = val;
            }
        });

        return out;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Core load process
     */
    load() {
        // Set metric base data (stub for all future events emitted by the widget)
        this._setMetricBase();

        // Find out what we should display here
        this._fetchContent((err) => {
            if (err) {
                // Report the widget load as declined
                this._reportWidgetLoad("fetch failed: " + err.statusCode /* istanbul ignore next: out of scope */ || err.toString());
            } else {
                // Merge display settings from response
                this._mergeResponseSettings();

                // Merge the referential data from the response
                this._updateBaseMetaFromResponse();

                // Handle rendering based on output type
                this._showContent();
            }
        });
    }

    //endregion

    //region Internal Helpers

    /**
     * Initializes the common metric data for events emitted by the placement
     * @private
     */
    _setMetricBase() {
        const base = this._metricBase;
        base.ch = Metrics.Channel.placement;
        base.cx = this.config.backwards || 'auto';
        base.key = this.config.key;
        base.m = base.m || {};
        base.m.wgid = this.instanceId;
    }

    /**
     * Emits the widget impression event
     * @param declined
     * @private
     */
    _reportWidgetLoad(declined) {

        const res = this._response || {};
        const data = res.data || { results: [] };

        // If this is declined, mark future events as declined too
        this._metricBase.m.decl = declined || '0';

        // Attach other main response attributes to all future events
        this._metricBase.m.res_bf = data.backfilled ? 1 : 0; // whether the response used the backup fill flow
        this._metricBase.m.res_total = data.total || 0; // how many total candidate results were available given filters
        this._metricBase.m.res_type = data.type; // what the given resource type was
        this._metricBase.m.res_length = data.results.length; // what the given resource type was

        // Track impression
        metrics.create(this._metricBase)
            .type(Metrics.Object.widget, Metrics.Event.impression)
            .meta(this.getConfig())
            .element(this.element) // this might not be all that useful cuz the content hasn't been rendered yet
            .viewport()
            .send();

        // Start watching for a viewable impression
        this._addOnceViewedHandler(this.element, () => {
            metrics.create(this._metricBase)
                .type(Metrics.Object.widget, Metrics.Event.view)
                .meta(this.getConfig())
                .element(this.element)
                .viewport()
                .send();
        });
    }

    /**
     * Executes the request for content to fill the placement
     * @param callback
     * @private
     */
    _fetchContent(callback) {
        // Build request to api, starting with this placement config params
        const query = this.getConfig();

        // Extract the key
        const key = this.config.key;

        // Attach sid and referrer
        if (metrics.sid) query.sid = metrics.sid;
        query.filters.url_referrer = this.config.url_referrer || window.location.href;
        query.wgid = this.instanceId;
        query.pgid = metrics.pageId;

        // Send it
        okanjo.net.request.post(
            `${okanjo.net.getRoute(okanjo.net.routes.ads, null, this.config.sandbox ? 'sandbox' : 'live')}?key=${encodeURIComponent(key)}`,
            query,
            (err, res) => {
                if (err) {
                    okanjo.report('Failed to retrieve placement content', err, { placement: this });
                    this.setMarkup(''); // Don't show anything
                    this.emit('error', err);
                    callback && callback(err);
                } else {

                    // Store the raw response
                    this._response = res;

                    // Hook point for response handling
                    this.emit('data');

                    // Return
                    callback && callback();
                }
            }
        );
    }

    /**
     * Applies response filters and display settings into the widget configuration
     * @private
     */
    _mergeResponseSettings() {
        const res = this._response;
        const data = res.data || {};
        const settings = data.settings || {};

        if (settings.filters) {
            Object.keys(settings.filters).forEach((key) => {
                this.config[key] = settings.filters[key];
            });
        }

        if (settings.display) {
            Object.keys(settings.display).forEach((key) => {
                this.config[key] = settings.display[key];
            });
        }
    }

    /**
     * Applies response data to future metric events
     * @private
     */
    _updateBaseMetaFromResponse() {
        // Update the base metric data with info from the response
        const data = (this._response|| {}).data || {};
        this._metricBase.m = this._metricBase.m || {};
        const meta = this._metricBase.m;

        // Article
        if (data.article) meta.aid = data.article.id;

        if (data.test && data.test.enabled) {
            meta.pten = 1;
            meta.ptid = data.test.id;
            meta.ptseed = data.test.seed;
        } else {
            meta.pten = 0;
        }
    }

    /**
     * Beings the render process based on the response content
     * @private
     */
    _showContent() {
        const data = (this._response|| {}).data || {};

        // Known content types we can display
        if (data.type === Placement.ContentTypes.products) {
            this._showProducts();
        } else if (data.type === Placement.ContentTypes.articles) {
            this._showArticles();
        } else if (data.type === Placement.ContentTypes.adx) {
            this._showADX();
        } else {
            // Unknown response type!

            // Report the widget load as declined
            const msg = 'Unknown response content type: ' + data.type;
            okanjo.report(msg, { placement: this });
            this.setMarkup(''); // Don't show anything
            this.emit('error', msg);
            this._reportWidgetLoad(msg);
        }
    }

    /**
     * Generates the click url using the event, proxy_url, and additional params
     * @param event
     * @param url
     * @param additionalUrlParams
     * @return {*}
     * @private
     */
    _getClickThroughURL(event, url, additionalUrlParams) {
        const joiner = url.indexOf('?') >= 0 ? '&' : '?';

        // Tack on transfer params
        additionalUrlParams = additionalUrlParams /* istanbul ignore next: paranoia */ || {};
        additionalUrlParams.ok_msid = metrics.sid || 'unknown';
        additionalUrlParams.ok_ch = this._metricBase.ch;
        additionalUrlParams.ok_cx = this._metricBase.cx;
        additionalUrlParams.utm_source = 'okanjo';
        additionalUrlParams.utm_campaign = 'smartserve';


        url += joiner + Object.keys(additionalUrlParams)
                .map((key) => encodeURIComponent(key)+'='+encodeURIComponent(additionalUrlParams[key]))
                .join('&');

        // Wrap the url if we're proxying
        if (this.config.proxy_url) {
            url = this.config.proxy_url + encodeURIComponent(url);
        }

        // Set the url on the event
        event.data({
            u: url
        });

        return event.toUrl();
    }

    /**
     * Converts a resource's link into one suitable for tracking, making middle-click safe
     * @param type
     * @param resource
     * @param e
     * @private
     */
    _handleResourceMouseDown(type, resource, e) {
        // Generate a new click id for this event
        const clickId = okanjo.util.shortid();

        // Start building the event
        const event = metrics.create(this._metricBase, {
            id: resource.id
        })
            .type(type, Metrics.Event.interaction)
            .meta(this.getConfig())
            .meta({ cid: clickId })
            .meta({ bf: resource.backfill ? 1 : 0 })
            .event(e)
            .element(e.currentTarget)
            .viewport();

        // Pull the proper params out of the resource depending on it's type
        let trackParam = 'url_track_param';
        let urlParam = 'url';

        if (type === Metrics.Object.product) {
            trackParam = 'buy_url_track_param';
            urlParam = 'buy_url';
        }

        // Attach the campaign tracking identifier
        const additionalParams = {
            ok_cid: clickId
        };
        if (resource[trackParam]) additionalParams[resource[trackParam]] = (metrics.sid || 'unknown') + ':' + clickId;

        // Update the link with the event data
        event.data({ ea: Metrics.Action.click });
        e.currentTarget.href = this._getClickThroughURL(event, resource[urlParam], additionalParams);

        // Cache this on the product
        resource._clickId = clickId;
        resource._event = event;
        resource._additionalParams = additionalParams;
    }

    /**
     * Gets the template to use, accounting for configured preference if available
     * @param contentType
     * @param defaultName
     * @return {string}
     * @private
     */
    _getTemplate(contentType, defaultName) {
        let templateName = this.config.template_name;
        if (!templateName ||
            !okanjo.ui.engine.isTemplateRegistered(`${contentType}.${templateName}`)) {
            templateName = defaultName;
        }
        return `${contentType}.${templateName}`;
    }

    /**
     * Enforces size/layout/cta restrictions
     * @private
     */
    _enforceLayoutOptions() {
        // Enforce format restrictions
        if (this.config.size === "leaderboard" || this.config.size === "large_mobile_banner") {
            this.config.template_layout = "list";
            this.config.template_cta_style = "link";
        } else if (this.config.size === "half_page" || this.config.size === "auto") {
            this.config.template_layout = "list";
        }
    }

    /**
     * Register a custom
     * @private
     */
    _registerCustomBranding(prefix, buttonClass) {
        const brandColor = this.config.template_cta_color;
        if (brandColor) {
            let brandCSS,
                brandCSSId = "okanjo-wgid-" + this.instanceId;

            brandCSS = `
                ${prefix}-block2.${brandCSSId} ${prefix}-${buttonClass} { color: ${brandColor};} 
                ${prefix}-block2.${brandCSSId}.okanjo-cta-style-button ${prefix}-${buttonClass} { border: 1px solid ${brandColor}; } 
                ${prefix}-block2.${brandCSSId}.okanjo-cta-style-button ${prefix}-${buttonClass}:hover { background: ${brandColor}; } 
            `;

            okanjo.ui.engine.registerCss(brandCSSId, brandCSS, { id: brandCSSId });
            okanjo.ui.engine.ensureCss(brandCSSId);
        }
    }

    /**
     * When element is in view per viewability constants (50% for 1s) trigger handler once
     * @param element
     * @param handler
     * @private
     */
    _addOnceViewedHandler(element, handler) {
        let controller = {
            element,
            successfulCount: 0,
            handler
        };

        // Add our element to the watch list and turn on the watcher if not already on
        this._viewedWatchers.push(controller);
        this._toggleViewWatcher(true);
    }

    /**
     * Interval function to check viewability of registered elements
     * @private
     */
    _checkViewWatchers() {

        // Check each registered watcher
        for (let i = 0, controller; i < this._viewedWatchers.length; i++) {
            controller = this._viewedWatchers[i];

            // Check if watcher is complete, then remove it from the list
            /* istanbul ignore if: jsdom won't trigger this */
            if (okanjo.ui.getPercentageInViewport(controller.element) >= MINIMUM_VIEW_PX) {
                controller.successfulCount++;
            }

            // While this could more optimally be contained within the former condition, unit-testing blocks on this
            if (controller.successfulCount >= MINIMUM_VIEW_FREQ) {
                controller.handler();
                this._viewedWatchers.splice(i, 1);
                i--;
            }
        }

        // Turn off if nobody is watching
        if (this._viewedWatchers.length === 0) {
            this._toggleViewWatcher(false);
        }
    }

    /**
     * Turns the viewability watcher on and off
     * @param enabled
     * @private
     */
    _toggleViewWatcher(enabled) {
        if (enabled) {
            if (this._viewWatcherIv === null) {
                this._viewWatcherIv = setInterval(this._checkViewWatchers.bind(this), MINIMUM_VIEW_TIME / MINIMUM_VIEW_FREQ);
            }
        } else {
            clearInterval(this._viewWatcherIv);
            this._viewWatcherIv = null;
        }
    }

    //endregion

    //region Product Handling

    /**
     * Renders a product response
     * @private
     */
    _showProducts() {
        const data = (this._response || { data: { results: [] } }).data || { results: [] };

        // Determine template to render, using custom template name if it exists
        const templateName = this._getTemplate(Placement.ContentTypes.products, Placement.DefaultTemplates.products);

        // Track widget impression
        if (data.results.length === 0) {
            // Hook point for no results found
            this.emit('empty');
            this._reportWidgetLoad('empty'); // decline the impression
        } else {
            this._reportWidgetLoad();
        }

        // - render

        // Format products
        data.results.forEach((offer, index) => {
            // Disable inline buy if configured to do so
            if (this.config.disable_inline_buy) offer.inline_buy_url = null;
            if (offer.inline_buy_url) offer._escaped_inline_buy_url = encodeURIComponent(offer.inline_buy_url);

            // Set primary image
            offer._image_url = offer.image_urls ? offer.image_urls[0] : '' ;

            // Escape buy url (fixme: does not include proxy_url!)
            offer._escaped_buy_url = encodeURIComponent(offer.buy_url);

            // Make price tag pretty
            offer._price_formatted = TemplateEngine.formatCurrency(offer.price);
            offer._index = index;
        });

        // Render and display the results
        this.setMarkup(okanjo.ui.engine.render(templateName, this));

        // Bind interaction handlers and track impressions
        this.element.querySelectorAll('a').forEach((a) => {

            const id = a.getAttribute('data-id'),
                index = a.getAttribute('data-index');

            // Don't bind links that are not tile links
            /* istanbul ignore else: custom templates could break it */
            if (id && index >= 0) {
                const product = this._response.data.results[index];
                /* istanbul ignore else: custom templates could break it */
                if (product) {

                    // Bind interaction listener
                    a.addEventListener('mousedown', this._handleResourceMouseDown.bind(this, Metrics.Object.product, product));
                    a.addEventListener('click', this._handleProductClick.bind(this, product));

                    // Track impression
                    metrics.create(this._metricBase, { id: product.id })
                        .type(Metrics.Object.product, Metrics.Event.impression)
                        .meta(this.getConfig())
                        .meta({ bf: product.backfill ? 1 : 0 })
                        .element(a)
                        .send();

                    // Start watching for a viewable impression
                    this._addOnceViewedHandler(a, () => {
                        metrics.create(this._metricBase, { id: product.id })
                            .type(Metrics.Object.product, Metrics.Event.view)
                            .meta(this.getConfig())
                            .meta({ bf: product.backfill ? 1 : 0 })
                            .element(a)
                            .send();
                    });
                }
            }
        });

        // Truncate product name to fit the space
        this.element.querySelectorAll('.okanjo-resource-title').forEach((element) => {
            okanjo.ui.ellipsify(element);
        });

        // Hook point that the widget is done loading
        this.emit('load');
    }

    /**
     * Handles the product click process
     * @param product
     * @param e
     * @private
     */
    _handleProductClick(product, e) {

        // Update the event
        if (!product._event || !product._additionalParams || !product._clickId) {
            this._handleResourceMouseDown(Metrics.Object.product, product, e);
        }

        // Extract the already generated event and params list
        const {
            _event: event,
            _additionalParams: additionalParams
        } = product;

        // Update the event to the current one
        event.event(e);

        // Determine what we're doing - native ux or redirect
        const showNativeBuyUx = !!product.inline_buy_url,
            showPopupNativeBuyUx = !this.config.disable_popup && showNativeBuyUx && okanjo.util.isMobile()
        ;

        // Show the inline buy experience or redirect
        if (showPopupNativeBuyUx) {
            // Mobile native buy ux

            // Don't follow the link
            e.preventDefault();

            //
            // Mobile devices (especially iOS) have real janky UX when interacting with iframes.
            // So, we'll choose to popup a window with the native buy experience, so we can ensure
            // a positive user experience. Nobody likes bouncy form fields and really weird zooming.
            //

            // Update the event
            event
                .data({ ea: Metrics.Action.inline_click })
                .meta({ popup: 'true' });

            // Get the frame url
            let url = this._getClickThroughURL(event, product.inline_buy_url, additionalParams);

            // Open the window or redirect if that failed
            this._popupFrame = window.open(url, "okanjo-inline-buy-frame", "width=400,height=400,location=yes,resizable=yes,scrollbars=yes");
            /* istanbul ignore else: jsdom doesn't support window.open or setting window.location.href */
            if (!this._popupFrame) {
                // Fallback to just replacing the window with the target, since popups don't work :(
                okanjo.report('Popup blocker stopped buy experience from showing', { placement: this });
                window.location.href = url;
            }

        } else if (showNativeBuyUx) {
            // Regular native buy ux

            // Don't follow the link
            e.preventDefault();

            const frame = document.createElement('iframe');
            const attributes = {
                'class': 'okanjo-inline-buy-frame',
                frameborder: 0,
                vspace: 0,
                hspace: 0,
                webkitallowfullscreen: '',
                mozallowfullscreen: '',
                allowfullscreen: '',
                scrolling: 'auto'
            };

            // Apply attributes
            Object.keys(attributes).forEach((key) => frame.setAttribute(key, attributes[key]));

            // Check whether we're allowed to expand past the bounds of the placement
            additionalParams.expandable = this.config.expandable ? 1: 0;
            if (!this.config.expandable) {
                const parent = this.element.querySelector('.okanjo-expansion-root');
                /* istanbul ignore else: custom templates could break this */
                if (parent) {
                    frame.className += ' okanjo-ad-in-unit';
                    frame.setAttribute('height', "100%");
                    frame.setAttribute('width', "100%");

                    parent.appendChild(frame);

                    const size = okanjo.ui.getElementSize(parent);
                    additionalParams.frame_height = size.height;
                    additionalParams.frame_width = size.width;
                    /* istanbul ignore next: i'm not writing a whole test for this one config param */
                    if (this.config.size) additionalParams.ad_size = this.config.size;
                }
            }

            // Update the event
            event
                .data({ ea: Metrics.Action.inline_click })
                .meta({ expandable: this.config.expandable ? 'true' : 'false' });

            // Set the frame url
            frame.src = this._getClickThroughURL(event, product.inline_buy_url, additionalParams);

            // Show the modal if it was not internally expanded
            if (!frame.parentNode) {
                okanjo.ui.modal.show(frame);
            }

        } else {
            // Update the link a second time, just in case the data changed
            e.currentTarget.href = this._getClickThroughURL(event, product.buy_url, additionalParams);
        }
    }

    //endregion

    //region Article Handling

    /**
     * Renders an article response
     * @private
     */
    _showArticles() {
        const data = (this._response || { data: { results: [] } }).data || { results: [] };

        // Determine template to render, using custom template name if it exists
        const templateName = this._getTemplate(Placement.ContentTypes.articles, Placement.DefaultTemplates.articles);

        // Track widget impression
        if (data.results.length === 0) {
            // Hook point for no results found
            this.emit('empty');
            this._reportWidgetLoad('empty'); // decline the impression
        } else {
            this._reportWidgetLoad();
        }

        // - render

        // Format articles
        data.results.forEach((article, index) => {
            // Escape url (fixme: does not include proxy_url!)
            article._escaped_url = encodeURIComponent(article.url);
            article._index = index;
        });

        // Render and display the results
        this.setMarkup(okanjo.ui.engine.render(templateName, this));

        // Bind interaction handlers and track impressions
        this.element.querySelectorAll('a').forEach((a) => {

            const id = a.getAttribute('data-id'),
                index = a.getAttribute('data-index');

            // Don't bind links that are not tile links
            /* istanbul ignore else: custom templates could break this */
            if (id && index >= 0) {
                const article = this._response.data.results[index];
                /* istanbul ignore else: custom templates could break this */
                if (article) {

                    // Bind interaction listener
                    a.addEventListener('mousedown', this._handleResourceMouseDown.bind(this, Metrics.Object.article, article));
                    a.addEventListener('click', this._handleArticleClick.bind(this, article));

                    // Track impression
                    okanjo.metrics.create(this._metricBase, { id: article.id })
                        .type(Metrics.Object.article, Metrics.Event.impression)
                        .meta(this.getConfig())
                        .meta({ bf: article.backfill ? 1 : 0 })
                        .element(a)
                        .send();

                    // Start watching for a viewable impression
                    this._addOnceViewedHandler(a, () => {
                        okanjo.metrics.create(this._metricBase, { id: article.id })
                            .type(Metrics.Object.article, Metrics.Event.view)
                            .meta(this.getConfig())
                            .meta({ bf: article.backfill ? 1 : 0 })
                            .element(a)
                            .send();
                    });

                }
            }
        });

        // Truncate product name to fit the space
        this.element.querySelectorAll('.okanjo-resource-title').forEach((element) => {
            okanjo.ui.ellipsify(element);
        });

        // Hook point that the widget is done loading
        this.emit('load');
    }

    /**
     * Handles the article click process
     * @param article
     * @param e
     * @private
     */
    _handleArticleClick(article, e) {
        // Update the event
        if (!article._event || !article._additionalParams || !article._clickId) {
            this._handleResourceMouseDown(Metrics.Object.article, article, e);
        }

        // Extract the already generated event and params list
        const {
            _event: event,
            _additionalParams: additionalParams
        } = article;

        // Update the event to the current one
        event.event(e);

        // Update the link a second time, just in case the data changed
        e.currentTarget.href = this._getClickThroughURL(event, article.url, additionalParams);
    }

    //endregion

    //region ADX Handling

    /**
     * Renders a Google DFP/ADX response
     * @private
     */
    _showADX() {
        const data = (this._response || { data: { settings: {} } }).data || { settings: {} };

        // Get the template we should use to render the google ad
        const templateName = this._getTemplate(Placement.ContentTypes.adx, Placement.DefaultTemplates.adx);

        // Determine what size ad we can place here
        let size = null;
        if (this.config.size) {
            if (Placement.Sizes[this.config.size]) {
                // Defined size, use these known dimensions
                size = Placement.Sizes[this.config.size];
            } else {
                let match = (/^([0-9]+)x([0-9]+)$/i).exec(this.config.size);
                if (match) {
                    size = { width: match[1], height: match[2] }
                }
            }
        }

        // No given size, we need to guess
        if (!size) size = Placement.Sizes.default;


        // If we're using okanjo's ad slot, then track the impression
        // otherwise decline it because we're just passing through to the publishers account
        let adUnitPath = '/90447967/okanjo:<publisher>';
        if (data.settings.display && data.settings.display.adx_unit_path) {
            adUnitPath = data.settings.display.adx_unit_path;
            this._reportWidgetLoad('empty'); // decline the impression
        } else {
            this._reportWidgetLoad(); // accept it because we're serving out of our exchange
        }

        // Pass along what the template needs to know to display the ad
        const renderContext = {
            size,
            adUnitPath
        };

        // Render the container
        this.setMarkup(okanjo.ui.engine.render(templateName, this, renderContext));

        // Insert the actual ad into the container
        const container = this.element.querySelector('.okanjo-adx-container');
        /* istanbul ignore else: custom templates could break this */
        if (container) {

            // Make the frame element
            const frame = document.createElement('iframe');
            const attributes = {
                'class': 'okanjo-adx-frame',
                frameborder: 0,
                vspace: 0,
                hspace: 0,
                webkitallowfullscreen: '',
                mozallowfullscreen: '',
                allowfullscreen: '',
                scrolling: 'auto',
                width: size.width,
                height: size.height
            };

            // Apply attributes
            Object.keys(attributes).forEach((key) => frame.setAttribute(key, attributes[key]));

            // Attach to dOM
            container.appendChild(frame);

            // Build a click-through tracking url so we know when an ad is clicked too
            let clickUrl = okanjo.metrics.create(this._metricBase)
                .type(Metrics.Object.thirdparty_ad, Metrics.Event.interaction)
                .meta(this.getConfig())
                .meta({
                    ta_s: adUnitPath,
                    ta_w: size.width,
                    ta_h: size.height
                })
                .element(frame)
                .toUrl();

            // Transfer references to the frame window
            // frame.contentWindow.okanjo = okanjo;
            // frame.contentWindow.placement = this;
            frame.contentWindow.trackImpression = () => {
                okanjo.metrics.create(this._metricBase)
                    .type(Metrics.Object.thirdparty_ad, Metrics.Event.impression)
                    .meta(this.getConfig())
                    .meta({
                        ta_s: adUnitPath,
                        ta_w: size.width,
                        ta_h: size.height
                    })
                    .element(frame)
                    .send()
                ;

                // Start watching for a viewable impression
                this._addOnceViewedHandler(frame, () => {
                    okanjo.metrics.create(this._metricBase)
                        .type(Metrics.Object.thirdparty_ad, Metrics.Event.view)
                        .meta(this.getConfig())
                        .meta({
                            ta_s: adUnitPath,
                            ta_w: size.width,
                            ta_h: size.height
                        })
                        .element(frame)
                        .send()
                    ;
                });
            };

            // Load Google ad!
            frame.contentWindow.document.open();
            frame.contentWindow.document.write(
`<html><head><style type="text/css">html,body {margin: 0; padding: 0;}</style></head><body>
<`+`script type="text/javascript" src="https://www.googletagservices.com/tag/js/gpt.js">
googletag.pubads().addEventListener('slotRenderEnded', function(e) { 
    trackImpression(e);
});
googletag.pubads()
    .definePassback("${adUnitPath.replace(/"/g, '\\"')}", [[${size.width}, ${size.height}]])
    .setClickUrl("${clickUrl}&u=")
    .display();
<`+`/script>
</body></html>`);
            frame.contentWindow.document.close();

            // TODO future event hooks
            // googletag.pubads().addEventListener('impressionViewable', function(e) { future )});
            // googletag.pubads().addEventListener('slotOnload', function(e) { future });
            // googletag.pubads().addEventListener('slotVisibilityChangedEvent', function(e) { future );

            // Impression tracking is done from within the iframe. Crazy, right?
        }

        // Hook point that the widget is done loading
        this.emit('load');
    }

    //endregion
}

//region Enumerations

/**
 * Standard ad sizes
 * @type {{billboard: {width: number, height: number}, button_2: {width: number, height: number}, half_page: {width: number, height: number}, leaderboard: {width: number, height: number}, medium_rectangle: {width: number, height: number}, micro_bar: {width: number, height: number}, portrait: {width: number, height: number}, rectangle: {width: number, height: number}, super_leaderboard: {width: number, height: number}, wide_skyscraper: {width: number, height: number}, large_mobile_banner: {width: number, height: number}, mobile_leaderboard: {width: number, height: number}, small_square: {width: number, height: number}, button_1: {width: number, height: number}, full_banner: {width: number, height: number}, half_banner: {width: number, height: number}, large_rectangle: {width: number, height: number}, pop_under: {width: number, height: number}, three_to_one_rectangle: {width: number, height: number}, skyscraper: {width: number, height: number}, square: {width: number, height: number}, square_button: {width: number, height: number}, vertical_banner: {width: number, height: number}, vertical_rectangle: {width: number, height: number}}}
 */
Placement.Sizes = {

    // Supported
    medium_rectangle:       { width: 300, height: 250 }, // aka: sidekick
    leaderboard:            { width: 728, height:  90 },
    large_mobile_banner:    { width: 320, height: 100 },
    half_page:              { width: 300, height: 600 }, // aka: filmstrip, sidekick

    // IAB / Others
    billboard:              { width: 970, height: 250 }, // aka: sidekick
    button_2:               { width: 120, height:  60 },
    micro_bar:              { width:  88, height:  31 },
    portrait:               { width: 300, height:1050 },
    rectangle:              { width: 180, height: 150 },
    super_leaderboard:      { width: 970, height:  90 }, // aka: pushdown, slider, large_leaderboard
    wide_skyscraper:        { width: 160, height: 600 },

    // Google
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

// When we should show an ad but nobody told us what size
Placement.Sizes.default = Placement.Sizes.medium_rectangle;

/**
 * Placement content types
 * @type {{products: string, articles: string, adx: string}}
 */
Placement.ContentTypes = {
    products: 'products',
    articles: 'articles',
    adx: 'adx'
};

/**
 * Default templates for each content type
 * @type {{products: string, articles: string, adx: string}}
 */
Placement.DefaultTemplates = {
    products: 'block2',
    articles: 'block2',
    adx: 'block2'
};

//endregion

export default Placement;