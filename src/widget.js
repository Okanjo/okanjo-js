//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(okanjo, window) {

    var cache = okanjo.Cache,

        WidgetBase = okanjo._Widget = function Widget(element, config) {

            okanjo._EventEmitter.call(this);

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

    okanjo.util.inherits(WidgetBase, okanjo._EventEmitter);

    var proto = WidgetBase.prototype;

    proto.widgetName = "BaseWidget";

    proto.config = null;
    proto.use_cache = false;
    proto.cache_key_prefix = 'ok_widget_';
    proto.cache_ttl = 60000;
    proto.cacheKeyAttributes = 'id'.split(','); // Parameters to compile to generate the cache key

    /**
     * Loads the widget
     */
    proto.init = function() {

        // Parse the final widget instance configuration
        this.parseConfiguration();

        // Override template names if given as parameters
        this.processTemplateOverrides();

        // Make sure that the templates specified are present to render the widget
        this.ensureTemplates();

        // Ensure we have a widget key or bail out if we don't
        if (!this.findWidgetKey()) return;

        // Run the widget's main init logic, and  bail if needed
        if (!this.load()) return;

        // Async clean the cache, if needed
        this.autoCleanCache();
    };


    /**
     * Does some magic to try to track down the widget key to use for requests
     * @returns {boolean}
     */
    proto.findWidgetKey = function() {

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
            this.element.innerHTML = okanjo.mvc.render(this.templates.error, this, { message: 'Missing Okanjo key.' });
            okanjo.report(this.widgetName, 'Missing key. Define one using okanjo.configure or pass the key parameter as an option in the '+this.widgetName+' constructor');
            return false;
        } else {
            this.config.key = this.key;
            return true;
        }
    };


    /**
     * Check for configuration parameters that start with template_ and css_, and replace the template and css templates where specified.
     */
    proto.processTemplateOverrides = function() {

        var m;
        for (var i in this.config) {
            if (this.config.hasOwnProperty(i)) {

                // Check for template override
                m = i.match(/^template_(.+)$/);
                //noinspection JSUnresolvedFunction
                if (m !== null && this.templates.hasOwnProperty(m[1])) {
                    this.templates[m[1]] = this.config[i];
                } else {
                    // Check for css override
                    m = i.match(/^css_(.+)$/);
                    //noinspection JSUnresolvedFunction
                    if (m !== null && this.css.hasOwnProperty(m[1])) {
                        this.css[m[1]] = this.config[i];
                    }
                }

            }
        }

    };


    /**
     * Make sure that a set of templates have been defined
     */
    proto.ensureTemplates = function() {
        var templates = this.templates,
            css = this.css,
            key;
        for (key in templates) {
            //noinspection JSUnresolvedFunction
            if (templates.hasOwnProperty(key)) {
                if (!okanjo.mvc.isTemplateRegistered(templates[key])) throw new Error('[Okanjo.'+this.widgetName+'] Missing template: ' + templates[key] + ". Did you forget to include the template?");
            }
        }
        for (key in css) {
            //noinspection JSUnresolvedFunction
            if (css.hasOwnProperty(key)) {
                if (!okanjo.mvc.isCssRegistered(css[key])) throw new Error('[Okanjo.'+this.widgetName+'] Missing css block: ' + css[key] + ". Did you forget to include the css template?");
            }
        }
    };


    /**
     * Parses the widget configuration by merging data attributes on top of the base configuration given in the constructor
     */
    proto.parseConfiguration = function() {
        //noinspection JSUnresolvedVariable
        var attributes = okanjo.util.data(this.element);

        okanjo.util.copyIfSetMap(this.config, attributes, this.configMap, { stripEmpty: true });
    };


    /**
     * Core widget loader. Override this!
     * @returns {boolean}
     */
    proto.load = function() {

        // TODO - override this on the actual wideget implementation

        return true;
    };


    /**
     * Async cleans the widget cache
     */
    proto.autoCleanCache = function() {
        if (this.use_cache) {
            var self = this;
            setTimeout(function () {
                self.cleanCache();
            }, 2000);
        }
    };


    /**
     * If no canonical url or text was given in the configuration, this method will return the current page url to use
     * It will not be very nice, and will just use the path. Query string and fragment will be stripped
     * @returns {string} - The URL of the current page to have Okanjo analyze
     */
    proto.getCurrentPageUrl = function() {

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
            candidatePos = [href.indexOf('?'), href.indexOf('#')].filter(function(pos) { return pos >= 0; }),
            stopPos = candidatePos.length > 0 ? Math.min.apply(null, candidatePos) : -1;

        return stopPos > 0 ? href.substr(0, stopPos) : href;
    };


    /**
     * Generates a new cache key unique to the configuration of this widget instance
     * @returns {string}
     */
    proto.getCacheKey = function() {
        var parts = [window.location.host + window.location.pathname], keys = this.cacheKeyAttributes;
        for(var i = 0; i < keys.length; i++) {
            if (this.config[keys[i]] !== undefined) {
                parts.push(keys[i], this.config[keys[i]]);
            }
        }
        return this.cache_key_prefix+okanjo.util.hash(parts.join(';'));
    };


    /**
     * Purges expired keys from the cache
     */
    proto.cleanCache = function() {
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
    };


    /**
     * Pull a key from the cache, if it has not expired yet
     * @returns boolean – The value of what was cached, or null if nothing
     */
    proto.loadFromCache = function(cacheKey) {
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
    };


    /**
     * Save a key to the cache
     * @param cacheKey
     * @param obj
     */
    proto.saveInCache = function(cacheKey, obj) {

        // Async save it, don't block for stringify
        var self = this;
        setTimeout(function() {
            cache.setItem(cacheKey, JSON.stringify(obj));
            cache.setItem(cacheKey+"_expires", (new Date()).getTime() + self.cache_ttl);
        }, 100);

    };

    return okanjo._Widget;

})(okanjo, this);