"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(window) {

    //region Imports and Constants

    const okanjo = window.okanjo;
    const { string, array, float, int, bool } = okanjo._Widget.Field;
    const Metrics = okanjo.metrics.constructor;
    const TemplateEngine = okanjo.ui.engine.constructor;

    const FILTERS = 'filters';
    const DISPLAY = 'display';
    const ARTICLE_META = 'article_meta';

    const MINIMUM_VIEW_PX = 0.5;    // 50% of pixels must be in viewport
    const MINIMUM_VIEW_TIME = 1000; // for 1 full second
    const MINIMUM_VIEW_FREQ = 2;    // time / freq = interval

    const LARGE_PX_THRESHOLD = 242000;  // For large ads, a reduced % is applied
    const LARGE_MINIMUM_VIEW_PX = 0.3;  // 30% of pixels must be in viewport for large ads

    //endregion

    /**
     * Placement widget
     */
    class Placement extends okanjo._Widget {

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
            this._response = null; // placeholder for api response

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
                url_paths: array().group(FILTERS),
                not_url_paths: array().group(FILTERS),

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
                template_variant: string().group(DISPLAY),
                template_cta_style: string().group(DISPLAY),
                template_cta_text: string().group(DISPLAY),
                template_cta_color: string().group(DISPLAY),
                template_cta_invert: bool().group(DISPLAY), // Whether to invert the cta color scheme
                adx_unit_path: string().group(DISPLAY), // Custom DFP ad unit path
                hide_pricing: bool().group(DISPLAY), // hide price container on product resources

                // Flexbox
                align: string().group(DISPLAY),
                justify: string().group(DISPLAY),

                // Custom CSS
                custom_css_url: string().group(DISPLAY),
                custom_css: string().group(DISPLAY),

                // Article metadata
                url_category: array().group(ARTICLE_META),
                url_keywords: array().group(ARTICLE_META),

                // Functional settings
                key: string().strip(), // don't need to resend key on all our requests
                no_init: bool().strip(), // don't automatically load the placement, do it manually (e.g. (new Placement({no_init:true})).init()
                no_css: bool().strip(), // don't automatically include stylesheets
                verbose_click_data: bool().strip().default(false), // when enabled, sends ok_msid, ok_ch, ok_cx, _okjr to the destination url
                utm_click_data: bool().strip().default(false), // when enabled, sends url_source, utm_campaign, and utm_medium to the destination url
                proxy_url: string().strip(),
                expandable: bool().strip().default(true),
                disable_inline_buy: bool().strip().default(false), // stops inline buy functionality
                disable_popup: bool().strip().default(false), // stops new window on mobile for inline buy functionality
                backwards: string().strip(), // internal flag indicating port from a deprecated widget
                testing: bool().strip() // metrics flag to indicate testing
            };
        }

        /**
         * Gets the widget configuration formatted using settings, suitable for transmission
         * @return {{filters: {}, display: {}, backfill: {}, shortfill: {}, article_meta: {}}}
         */
        getConfig() {
            const settings = this.getSettings();
            const out = { filters: {}, display: {}, backfill: {}, shortfill: {}, article_meta: {} };
            const backfillPattern = /^backfill_(.+)$/; // backfill_property
            const shortfillPattern = /^shortfill_(.+)$/; // shortfill_property

            Object.keys(this.config).forEach((origKey) => {
                let val = this.config[origKey];
                let key = origKey;
                let isBackfill = false;
                let isShortfill = false;
                let group = null;

                // Get the property name if it was prefixed with backfill
                let matches = backfillPattern.exec(origKey);
                if (matches) {
                    key = matches[1];
                    isBackfill = true;
                } else {
                    // Get the property name if it was prefixed with shortfill
                    matches = shortfillPattern.exec(origKey);
                    if (matches) {
                        key = matches[1];
                        isShortfill = true;
                    }
                }

                // Check if this is a known property
                if (settings[key]) {
                    val = settings[key].value(val);
                    group = settings[key].getGroup();
                }

                // Init the target/group if not already setup
                let target = out;
                if (isBackfill) {
                    target = out.backfill;
                } else if (isShortfill) {
                    target = out.shortfill;
                }

                // Set the target to the bucket in the settings container
                // except shortfill - can only apply settings directly to the bucket
                // e.g. backfill_url -> { backfill: { filters: { url: xxx } } }
                // e.g. shortfill_url-> { shortfill: { url: xxx } }
                if (!isShortfill && group) {
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
                    this._reportWidgetLoad("fetch failed: " + err.statusCode || /* istanbul ignore next: out of scope */ err.toString());
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

            if (this.config.testing) base.env = Metrics.Environment.testing;
        }

        /**
         * Emits the widget impression event
         * @param declined
         * @private
         */
        _reportWidgetLoad(declined) {

            const segments = this._getResponseData();

            // widget stats now aggregate all segments
            const backfilled = segments.find(s => s.backfilled) ? 1 : 0,
                shortfilled = segments.find(s => s.shortfilled) ? 1 : 0,
                splitfilled = segments.length > 1 ? 1 : 0,
                res_total = segments.reduce((a, c) => a + (c.total || 0), 0),
                res_length = segments.reduce((a, c) => a + (c.results && c.results.length || 0), 0),
                res_types = Array.from(new Set(segments.map(s => s.type)));

            // If this is declined, mark future events as declined too
            this._metricBase.m.decl = declined || '0';

            // Attach other main response attributes to all future events
            this._metricBase.m.res_bf = backfilled; // whether the response used the backfill flow
            this._metricBase.m.res_sf = shortfilled; // whether the response used the shortfill flow
            this._metricBase.m.res_spltfl = splitfilled; // whether the response used the splitfill flow
            this._metricBase.m.res_total = res_total; // how many total candidate results were available given filters
            this._metricBase.m.res_type = res_types.length > 1 ? Placement.ContentTypes.mixed : res_types[0]; // what the given resource type was
            this._metricBase.m.res_length = res_length; // number of resources delivered

            // Track impression
            okanjo.metrics.create(this._metricBase)
                .type(Metrics.Object.widget, Metrics.Event.impression)
                .meta(this.getConfig())
                .element(this.element) // this might not be all that useful cuz the content hasn't been rendered yet
                .viewport()
                .widget(this.element)
                .send();

            // Start watching for a viewable impression
            this._addOnceViewedHandler(this.element, () => {
                okanjo.metrics.create(this._metricBase)
                    .type(Metrics.Object.widget, Metrics.Event.view)
                    .meta(this.getConfig())
                    .element(this.element)
                    .viewport()
                    .widget(this.element)
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
            if (okanjo.metrics.sid) query.sid = okanjo.metrics.sid;
            query.filters.url_referrer = this.config.url_referrer || window.location.href;
            query.wgid = this.instanceId;
            query.pgid = okanjo.metrics.pageId;

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
         * Extracts the response data from the payload (segments)
         * @returns {*[]}
         * @private
         */
        _getResponseData() {
            const res = this._response;
            return [].concat((res && res.data) || [{}]); // will force the old response data into an array
        }

        /**
         * Applies response filters and display settings into the widget configuration
         * @private
         */
        _mergeResponseSettings() {
            // Apply the base segment settings as the main widget display settings
            const data = this._getResponseData()[0];

            // Merge the base results
            const settings = (data.settings) || {};

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

            // SmartServe can now return an array of result objects
            const data = this._getResponseData()[0] || {};

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
            const segments = this._getResponseData();

            // 1. Render each segment to list html, store in array
            // 2a. If array is empty, handle empty decline
            // 2b. If not empty, render container html passing contents to embed
            // 3. Set markup to final container render
            // 4. Do follow-up event binding and cleanup stuff

            // If there are multiple segments, force responsive slab template for now
            if (segments.length > 1) {
                this.config.template_name = 'slab';
                this.config.size = 'responsive';
            }

            // Assemble list contents
            let renderedSegments = [];

            for (let segment, i = 0; i < segments.length; i++) {
                segment = segments[i];

                // Known content types we can display
                if (segment.type === Placement.ContentTypes.products) {
                    renderedSegments.push(this._renderProductSegment(segment, i));

                } else if (segment.type === Placement.ContentTypes.articles) {
                    renderedSegments.push(this._renderArticleSegment(segment, i));

                } else if (segment.type === Placement.ContentTypes.adx) {
                    renderedSegments.push(this._renderADXSegment(segment, i));

                } else {
                    // Unknown response type!

                    // Report the widget load as declined
                    const msg = 'Unknown response content type: ' + segment.type;
                    okanjo.report(msg, { placement: this });
                    // this.setMarkup(''); // Don't show anything
                    this.emit('error', msg);
                    // this._reportWidgetLoad(msg);
                }
            }

            // Filter empty segments
            // console.log('rendered segs', renderedSegments)
            renderedSegments = renderedSegments.filter(html => !!html);

            // No segments? Decline
            if (renderedSegments.length === 0) {
                this.emit('empty');
                this._reportWidgetLoad('empty'); // decline the impression
                return;
            }

            // Render the container and insert the markup
            const model = this._getBaseRenderModel({
                segmentContent: renderedSegments.join('')
            });
            const templateName = this._getTemplate(Placement.ContentTypes.container, Placement.DefaultTemplates.container);
            this.setMarkup(okanjo.ui.engine.render(templateName, this, model));

            // Report load
            this._reportWidgetLoad();

            // Handle resource post-render events
            this._postProductRender();
            this._postArticleRender();
            this._postADXRender();

            // Fit images
            okanjo.ui.fitImages(this.element);

            // Hook point that the widget is done loading
            this.emit('load');
        }

        /**
         * Returns the base render model with common properties set
         * @param model
         * @returns {{}}
         * @private
         */
        _getBaseRenderModel(model) {
            model.css = !this.config.no_css;
            model.button_classes = this.config.template_cta_invert ? 'invert' : '';
            model.price_classes = this.config.hide_pricing ? 'okanjo-invisible' : '';
            return model;
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
            additionalUrlParams = additionalUrlParams || /* istanbul ignore next: paranoia */ {};
            additionalUrlParams.ok_msid = okanjo.metrics.sid || 'unknown';
            if (this.config.verbose_click_data) {
                additionalUrlParams.ok_ch = this._metricBase.ch;
                additionalUrlParams.ok_cx = this._metricBase.cx;
                additionalUrlParams._okjr = btoa(window.location.href.split(/[?#]/)[0]); // mod_security by default 403's when urls are present as query args
            }
            if (this.config.utm_click_data) {
                additionalUrlParams.utm_source = 'okanjo';
                additionalUrlParams.utm_medium = 'smartserve';
                // additionalUrlParams.utm_source = window.location.hostname;
                // additionalUrlParams.utm_campaign = 'smartserve';
            }

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
            // const clickId = okanjo.util.shortid();
            const clickId = resource._cid;

            // Start building the event
            const event = okanjo.metrics.create(this._metricBase, {
                id: resource.id
            })
                .type(type, Metrics.Event.interaction)
                .meta(this.getConfig())
                .meta({ cid: clickId })
                .meta({
                    bf: resource.backfill ? 1 : 0,
                    sf: resource.shortfill ? 1 : 0,
                    spltfl_seg: okanjo.util.ifDefined(resource.splitfill_segment)
                })
                .event(e)
                .element(e.currentTarget)
                .viewport()
                .widget(this.element);

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
            if (resource[trackParam]) additionalParams[resource[trackParam]] = clickId;

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
         * Enforces
         * @private
         */
        _enforceSlabLayoutOptions() {
            if (this.config.size === "medium_rectangle" || this.config.size === "billboard") {
                // no list view
                this.config.template_layout = "grid";

                // no buttons
                if (this.config.template_cta_style === "button") {
                    this.config.template_cta_style = "link";
                }
            } else if (this.config.size === "half_page") {
                this.config.template_layout = "grid";
            } else if (this.config.size === "leaderboard" || this.config.size === "large_mobile_banner") {
                this.config.template_layout = "list";

                // no button
                if (this.config.template_cta_style === "button") {
                    this.config.template_cta_style = "link";
                }
            } else if (this.config.size === "auto") {
                this.config.template_layout = "list";
            } else if (this.config.size === "responsive") {
                // no button in responsive mode
                if (this.config.template_cta_style === "button") {
                    this.config.template_cta_style = "link";
                }
            }
        }

        /**
         * Handles custom styling display settings
         * @private
         */
        _registerCustomBranding(/*prefix, buttonClass*/) {
            const brandColor = this.config.template_cta_color,
                brandCSSId = "okanjo-wgid-" + this.instanceId;
            let brandCSS = '';

            if (brandColor) {
                brandCSS = `
                    .okanjo-block2.${brandCSSId} .okanjo-resource-cta-button, .okanjo-block2.${brandCSSId} .okanjo-resource-buy-button { color: ${brandColor} !important; }
                    .okanjo-block2.${brandCSSId}.okanjo-cta-style-button .okanjo-resource-cta-button, .okanjo-block2.${brandCSSId}.okanjo-cta-style-button .okanjo-resource-buy-button { border-color: ${brandColor} !important; }
                    .okanjo-block2.${brandCSSId}.okanjo-cta-style-button .okanjo-resource-cta-button:hover, .okanjo-block2.${brandCSSId}.okanjo-cta-style-button .okanjo-resource-buy-button:hover { background: ${brandColor} !important; color: #fff !important; }
                    .okanjo-block2.${brandCSSId}.okanjo-cta-style-button .okanjo-resource-buy-button.invert, .okanjo-block2.${brandCSSId}.okanjo-cta-style-button .okanjo-resource-cta-button.invert { background: ${brandColor} !important; color: #fff !important; }
                    .okanjo-block2.${brandCSSId}.okanjo-cta-style-button .okanjo-resource-buy-button.invert:hover, .okanjo-block2.${brandCSSId}.okanjo-cta-style-button .okanjo-resource-cta-button.invert:hover { background: #fff !important; color: ${brandColor} !important; }
                `;
            }

            // Append custom inline css to the element
            if (this.config.custom_css) {
                brandCSS += '\n\n' + this.config.custom_css;
            }

            // Custom external stylesheet first (so inline styles can get priority)
            if (this.config.custom_css_url) {
                okanjo.ui.engine.ensureExternalCss(this.config.custom_css_url);
            }

            // Append the custom widget css to the dom
            if (brandCSS) {
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

                const { percentage, elementArea } = okanjo.ui.getPercentageInViewport(controller.element);

                // Check if watcher is complete, then remove it from the list
                /* istanbul ignore next: jsdom won't trigger this */
                if (okanjo.ui.isElementVisible(controller.element) &&
                    percentage >= (elementArea >= LARGE_PX_THRESHOLD ? LARGE_MINIMUM_VIEW_PX : MINIMUM_VIEW_PX)) {
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
         * Renders a product segment
         * @param data SmartServe segment data
         * @param segmentIndex Segment index number
         * @returns {string} Rendered segment HTML
         * @private
         */
        _renderProductSegment(data, segmentIndex) {

            // Determine template to render, using custom template name if it exists
            const templateName = this._getTemplate(Placement.ContentTypes.products, Placement.DefaultTemplates.products);

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
                offer.splitfill_segment = segmentIndex;
                offer._segmentIndex = segmentIndex;
            });

            const model = this._getBaseRenderModel({
                resources: data.results
            });

            // Render and return html (will get concatenated later)
            return okanjo.ui.engine.render(templateName, this, model);
        }

        /**
         * Handles post-render events for product resources
         * @private
         */
        _postProductRender() {

            // Detect broken images
            this.element.querySelectorAll('.okanjo-product .okanjo-resource-image').forEach((img) => {
                img.addEventListener('error', () => {
                    img.src = okanjo.ui.inlineSVG(okanjo.ui.productSVG());
                    console.error('[okanjo] Failed to load product image: ' + img.getAttribute('data-id'));
                    // TODO: notify of resource failure
                });
            });

            // Bind interaction handlers and track impressions
            const segments = this._getResponseData();
            this.element.querySelectorAll('.okanjo-product > a').forEach((a) => {

                const id = a.getAttribute('data-id'),
                    segment = parseInt(a.getAttribute('data-segment')),
                    index = parseInt(a.getAttribute('data-index'));

                // Don't bind links that are not tile links
                /* istanbul ignore else: custom templates could break it */
                if (id && index >= 0 && segment >= 0) {
                    const data = segments[segment];

                    /* istanbul ignore if: custom templates could break it */
                    if (!data) return;

                    const product = data.results[index];

                    /* istanbul ignore else: custom templates could break it */
                    if (product) {

                        // Bind interaction listener
                        a.addEventListener('mousedown', this._handleResourceMouseDown.bind(this, Metrics.Object.product, product));
                        a.addEventListener('click', this._handleProductClick.bind(this, product));

                        // Track impression
                        okanjo.metrics.create(this._metricBase, { id: product.id })
                            .type(Metrics.Object.product, Metrics.Event.impression)
                            .meta(this.getConfig())
                            .meta({
                                bf: product.backfill ? 1 : 0,
                                sf: product.shortfill ? 1 : 0,
                                spltfl_seg: okanjo.util.ifDefined(product.splitfill_segment)
                            })
                            .element(a)
                            .viewport()
                            .widget(this.element)
                            .send();

                        // Start watching for a viewable impression
                        this._addOnceViewedHandler(a, () => {
                            okanjo.metrics.create(this._metricBase, { id: product.id })
                                .type(Metrics.Object.product, Metrics.Event.view)
                                .meta(this.getConfig())
                                .meta({
                                    bf: product.backfill ? 1 : 0,
                                    sf: product.shortfill ? 1 : 0,
                                    spltfl_seg: okanjo.util.ifDefined(product.splitfill_segment)
                                })
                                .element(a)
                                .viewport()
                                .widget(this.element)
                                .send();
                        });
                    }
                }
            });

            // Truncate product name to fit the space
            this.element.querySelectorAll('.okanjo-product .okanjo-resource-title').forEach((element) => {
                okanjo.ui.ellipsify(element);
            });

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
                additionalParams.ok_expandable = this.config.expandable ? 1: 0;
                if (!this.config.expandable) {
                    const parent = this.element.querySelector('.okanjo-expansion-root');
                    /* istanbul ignore else: custom templates could break this */
                    if (parent) {
                        frame.className += ' okanjo-ad-in-unit';
                        frame.setAttribute('height', "100%");
                        frame.setAttribute('width', "100%");

                        parent.appendChild(frame);

                        const size = okanjo.ui.getElementSize(parent);
                        additionalParams.ok_frame_height = size.height;
                        additionalParams.ok_frame_width = size.width;
                        /* istanbul ignore next: i'm not writing a whole test for this one config param */
                        if (this.config.size) additionalParams.ok_ad_size = this.config.size;
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
         * Renders an article segment
         * @param data SmartServe segment data
         * @param segmentIndex Segment index number
         * @returns {string} Rendered segment HTML
         * @private
         */
        _renderArticleSegment(data, segmentIndex) {

            // Determine template to render, using custom template name if it exists
            const templateName = this._getTemplate(Placement.ContentTypes.articles, Placement.DefaultTemplates.articles);

            // - render

            // Format articles
            data.results.forEach((article, index) => {
                // Escape url (fixme: does not include proxy_url!)
                article._escaped_url = encodeURIComponent(article.url);
                article._index = index;
                article.splitfill_segment = segmentIndex;
                article._segmentIndex = segmentIndex;
            });

            const model = this._getBaseRenderModel({
                resources: data.results,
            });

            // Render and return html (will get concatenated later)
            return okanjo.ui.engine.render(templateName, this, model);
        }

        /**
         * Handles post-render events for article resources
         * @private
         */
        _postArticleRender() {

            // Detect broken images
            this.element.querySelectorAll('.okanjo-article .okanjo-resource-image').forEach((img) => {
                img.addEventListener('error', () => {
                    img.src = okanjo.ui.inlineSVG(okanjo.ui.articleSVG());
                    console.error('[okanjo] Failed to load article image: ' + img.getAttribute('data-id'));
                    // TODO: notify of resource failure
                });
            });

            // Bind interaction handlers and track impressions
            const segments = this._getResponseData();
            this.element.querySelectorAll('.okanjo-article > a').forEach((a) => {

                const id = a.getAttribute('data-id'),
                    segment = parseInt(a.getAttribute('data-segment')),
                    index = parseInt(a.getAttribute('data-index'));

                // Don't bind links that are not tile links
                /* istanbul ignore else: custom templates could break this */
                if (id && index >= 0 && segment >= 0) {
                    const data = segments[segment];

                    /* istanbul ignore if: custom templates could break it */
                    if (!data) return;

                    const article = data.results[index];
                    /* istanbul ignore else: custom templates could break this */
                    if (article) {

                        // Bind interaction listener
                        a.addEventListener('mousedown', this._handleResourceMouseDown.bind(this, Metrics.Object.article, article));
                        a.addEventListener('click', this._handleArticleClick.bind(this, article));

                        // Track impression
                        okanjo.metrics.create(this._metricBase, { id: article.id })
                            .type(Metrics.Object.article, Metrics.Event.impression)
                            .meta(this.getConfig())
                            .meta({
                                bf: article.backfill ? 1 : 0,
                                sf: article.shortfill ? 1 : 0,
                                spltfl_seg: okanjo.util.ifDefined(article.splitfill_segment)
                            })
                            .element(a)
                            .viewport()
                            .widget(this.element)
                            .send();

                        // Start watching for a viewable impression
                        this._addOnceViewedHandler(a, () => {
                            okanjo.metrics.create(this._metricBase, { id: article.id })
                                .type(Metrics.Object.article, Metrics.Event.view)
                                .meta(this.getConfig())
                                .meta({
                                    bf: article.backfill ? 1 : 0,
                                    sf: article.shortfill ? 1 : 0,
                                    spltfl_seg: okanjo.util.ifDefined(article.splitfill_segment)
                                })
                                .element(a)
                                .viewport()
                                .widget(this.element)
                                .send();
                        });

                    }
                }
            });

            // Truncate product name to fit the space
            this.element.querySelectorAll('.okanjo-article .okanjo-resource-title').forEach((element) => {
                okanjo.ui.ellipsify(element);
            });

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
         * Renders a DFP/ADX/GPT segment
         * @param data SmartServe segment data
         * @param segmentIndex Segment index number
         * @returns {string} Rendered segment HTML
         * @private
         */
        _renderADXSegment(data, segmentIndex) {

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
            // let declineReason;
            if (data.settings.display && data.settings.display.adx_unit_path) {
                adUnitPath = data.settings.display.adx_unit_path;
                // declineReason = 'custom_ad_unit';
            }

            // Pass along what the template needs to know to display the ad
            const renderContext = this._getBaseRenderModel({
                size,
                adUnitPath,
                segmentIndex
            });

            // Render the container
            return okanjo.ui.engine.render(templateName, this, renderContext);
        }

        /**
         * Handles post-render events for DFP/ADX/GPT resources
         * @private
         */
        _postADXRender() {

            // Insert the actual ads into their containers
            const segments = this._getResponseData();
            this.element.querySelectorAll('.okanjo-adx .okanjo-adx-container').forEach((container) => {

                const path = container.getAttribute('data-path'),
                    segment = parseInt(container.getAttribute('data-segment')),
                    width = parseInt(container.getAttribute('data-width')),
                    height = parseInt(container.getAttribute('data-height'));

                const data = segments[segment];

                /* istanbul ignore if: custom templates could break it */
                if (!data) return;
                const meta = {
                    ta_s: path,
                    ta_w: width,
                    ta_h: height,
                    spltfl_seg: okanjo.util.ifDefined(segment)
                };

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
                    width: width,
                    height: height
                };

                // Apply attributes
                Object.keys(attributes).forEach((key) => frame.setAttribute(key, attributes[key]));

                // Hold a ref to the frame for later
                data._frame = frame;

                // Attach to DOM
                container.appendChild(frame);

                // Build a click-through tracking url, so we know when an ad is clicked too
                let clickUrl = okanjo.metrics.create(this._metricBase)
                    .type(Metrics.Object.thirdparty_ad, Metrics.Event.interaction)
                    .meta(this.getConfig())
                    .meta(meta)
                    .element(frame)
                    .viewport()
                    .widget(this.element)
                    .toUrl();

                // Transfer references to the frame window
                // frame.contentWindow.okanjo = okanjo;
                // frame.contentWindow.placement = this;
                frame.contentWindow.trackImpression = () => {
                    okanjo.metrics.create(this._metricBase)
                        .type(Metrics.Object.thirdparty_ad, Metrics.Event.impression)
                        .meta(this.getConfig())
                        .meta(meta)
                        .element(frame)
                        .viewport()
                        .widget(this.element)
                        .send()
                    ;

                    // Start watching for a viewable impression
                    this._addOnceViewedHandler(frame, () => {
                        okanjo.metrics.create(this._metricBase)
                            .type(Metrics.Object.thirdparty_ad, Metrics.Event.view)
                            .meta(this.getConfig())
                            .meta(meta)
                            .element(frame)
                            .viewport()
                            .widget(this.element)
                            .send()
                        ;
                    });
                };

                // Load Google ad!
                // See: https://developers.google.com/publisher-tag/reference#googletag.events.SlotRenderEndedEvent
                frame.contentWindow.document.open();
                frame.contentWindow.document.write(
                    `<html><head><style type="text/css">html,body {margin: 0; padding: 0;}</style></head><body><div id="gpt-passback">
<`+`script type="text/javascript" src="https://securepubads.g.doubleclick.net/tag/js/gpt.js">
    
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
        
        // Define the slot
        googletag.defineSlot("${path.replace(/"/g, '\\"')}", [[${width}, ${height}]], 'gpt-passback')
            .setClickUrl("${clickUrl}&u=")     // Track click event on the okanjo side
            .addService(googletag.pubads())    // Service the ad
        ;
        
        // Track load/view events
        googletag.pubads().addEventListener('slotRenderEnded', function(e) { 
            trackImpression(e);
        });
        
        // Go time
        googletag.enableServices();
        googletag.display('gpt-passback');
    });
    
<`+`/script></div>
</body></html>`);
                frame.contentWindow.document.close();

                // TODO future event hooks
                // googletag.pubads().addEventListener('impressionViewable', function(e) { future )});
                // googletag.pubads().addEventListener('slotOnload', function(e) { future });
                // googletag.pubads().addEventListener('slotVisibilityChangedEvent', function(e) { future );

                // Impression tracking is done from within the iframe. Crazy, right?
            });

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
        billboard:              { width: 970, height: 250 }, // aka: sidekick

        // IAB / Others
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
     * @type {{adx: string, articles: string, products: string, mixed: string, container: string}}
     */
    Placement.ContentTypes = {
        products: 'products',   // only products
        articles: 'articles',   // only articles
        adx: 'adx',             // only display ad
        mixed: 'mixed',         // mix of two or more of the above (used for metrics responses, not a template)
        container: 'container', // Widget container - segment content gets rendered into this one at the end
    };

    /**
     * Default templates for each content type
     * @type {{products: string, articles: string, adx: string, container: string}}
     */
    Placement.DefaultTemplates = {
        products: 'block2',
        articles: 'block2',
        adx: 'block2',
        container: 'block2'
    };

    //endregion

    return okanjo.Placement = Placement;

})(window);