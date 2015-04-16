//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(okanjo, window) {

    var cache = okanjo.Cache,

        WidgetBase = okanjo._Widget = function Widget(element, config) {

            //noinspection JSValidateTypes
            if (!element || typeof element !== 'object' || element.nodeType === undefined) {
                throw new Error('Invalid element - must be a valid DOM element');
            }

            if ((typeof config !== "undefined") && (typeof config !== "object")) {
                throw new Error('Invalid configuration, must be an object or nothing at all, got: ' + typeof config);
            } else {
                config = config || {};
            }

            this.element = element;
            this.config = config || { };

            this.configMap = { };

            this.templates = {
                error: "okanjo.error"
            };

            this.css = { };
        };


    WidgetBase.prototype = {

        widgetName: "BaseWidget",

        config: null,
        use_cache: false,
        cache_key_prefix: 'ok_widget_',
        cache_ttl: 60000,
        cacheKeyAttributes: 'id'.split(','), // Parameters to compile to generate the cache key

        constructor: WidgetBase,

        /**
         * Loads the widget
         */
        init: function() {

            // Make sure that we have the templates necessary to render the widget
            this.ensureTemplates();

            // Parse the final widget instance configuration
            this.parseConfiguration();

            // Ensure we have a widget key or bail out if we don't
            if (!this.findWidgetKey()) return;

            // Run the widget's main init logic, and  bail if needed
            if (!this.load()) return;

            // Track the widget load
            this.trackLoad();

            // Async clean the cache, if needed
            this.autoCleanCache();
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
                okanjo.report(this.widgetName, 'Missing key. Define one using okanjo.configure or pass the key parameter as an option in the '+this.widgetName+' constructor');
                return false;
            } else {
                this.config.key = this.key;
                return true;
            }
        },


        /**
         * Make sure that a set of templates have been defined
         */
        ensureTemplates: function() {
            var templates = this.templates,
                css = this.css,
                key;
            for (key in templates) {
                //noinspection JSUnresolvedFunction
                if (templates.hasOwnProperty(key)) {
                    if (!okanjo.mvc.isTemplateRegistered(templates[key])) throw new Error('[Okanjo.'+this.widgetName+'] Missing template: ' + templates[key]);
                }
            }
            for (key in css) {
                //noinspection JSUnresolvedFunction
                if (css.hasOwnProperty(key)) {
                    if (!okanjo.mvc.isCssRegistered(css[key])) throw new Error('[Okanjo.'+this.widgetName+'] Missing css block: ' + css[key]);
                }
            }
        },


        /**
         * Parses the widget configuration by merging data attributes on top of the base configuration given in the constructor
         */
        parseConfiguration: function() {
            //noinspection JSUnresolvedVariable
            var attributes = okanjo.util.data(this.element);

            okanjo.util.copyIfSetMap(this.config, attributes, this.configMap, { stripEmpty: true });
        },


        /**
         * Core widget loader. Override this!
         * @returns {boolean}
         */
        load: function() {

            // TODO - override this on the actual wideget implementation

            return true;
        },


        /**
         * Tracks the widget load metric
         */
        trackLoad: function() {
            // If metrics doesn't exist in the Okanjo context for some reason, don't get bent out of shape about it
            var loc = window.location;
            okanjo.metrics.trackEvent('Okanjo '+this.widgetName+' Widget', 'Loaded', loc.protocol + '//' + loc.hostname + (loc.port ? (':' + loc.port) : '') + loc.pathname);
        },


        /**
         * Async cleans the widget cache
         */
        autoCleanCache: function() {
            if (this.use_cache) {
                var self = this;
                setTimeout(function () {
                    self.cleanCache();
                }, 2000);
            }
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
                stopPos = Math.min(href.indexOf('?'), href.indexOf('#'));

            return stopPos > 0 ? href.substr(0, stopPos) : href;
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
         * Purges expired keys from the cache
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
                okanjo.report(this.widgetName, e);
            }
        },


        /**
         * Pull a key from the cache, if it has not expired yet
         * @returns boolean – The value of what was cached, or null if nothing
         */
        loadFromCache: function(cacheKey) {
            // Check if items are cached, and if we should use them
            try {
                var val = cache.getItem(cacheKey),
                    expires = cache.getItem(cacheKey+"_expires"),
                    now = (new Date()).getTime();

                // Make sure exists and has not expired
                if (val !== null && expires !== null && now < parseInt(expires)) {
                    return JSON.parse(val);
                } else {
                    // Purge if expired
                    cache.removeItem(cacheKey);
                    cache.removeItem(cacheKey + "_expires");
                }
            } catch (e) {
                okanjo.report(this.widgetName, e);
            }

            return null;
        },


        /**
         * Save a key to the cache
         * @param cacheKey
         * @param obj
         */
        saveInCache: function(cacheKey, obj) {

            // Async save it, don't block for stringify
            var self = this;
            setTimeout(function() {
                cache.setItem(cacheKey, JSON.stringify(obj));
                cache.setItem(cacheKey+"_expires", (new Date()).getTime() + self.cache_ttl);
            }, 100);

        }


    };

    return okanjo._Widget;

})(okanjo, this);