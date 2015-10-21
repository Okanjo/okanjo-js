/*! okanjo-js v0.6.5 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.okanjo = factory();
  }
}(this, function() {

    //noinspection JSUnusedAssignment
    /**
     * index.js
     * @type {okanjo|*}
    */
    var okanjo = (function(ok) {


        //noinspection JSValidateTypes,JSUnusedGlobalSymbols
        var supportPageOffset = window.pageXOffset !== undefined,
            isCSS1Compatible = ((document.compatMode || "") === "CSS1Compat"),
            agent = window.navigator.userAgent,
            noop = function(){},
            okanjo = ok || {};


        // Override these later
        okanjo.qwery = noop;


        /**
         * Placeholder, just in case okanjo-js is built without metrics
         */
        okanjo.metrics = {
            trackEvent: noop,
            trackPageView: noop
        };

        /**
         * Placeholder, just in case okanjo-js is built without moat
         */
        okanjo.moat = { insert: noop };

        /**
         * API route definitions
         */
        okanjo.routes = {
            products: '/products',
            products_id: '/products/:product_id',
            products_sense: '/products/sense',
            metrics: '/metrics/:object_type/:event_type'
        };


        /**
         * Compiles a route and parameters into a final URL
         * @param route – The route to use (e.g. okanjo.routes.products )
         * @param [params] - Optional route parameters
         * @returns {*}
         */
        okanjo.getRoute = function(route, params) {
            if (params) {
                for (var i in params) {
                    if (params.hasOwnProperty(i)) {
                        route = route.replace(":"+i, params[i] + "");
                    }
                }
            }
            return okanjo.config.ads.apiUri + route;
        };


        /**
         * Execute a JSONP request
         * @param {string} url – Request URL
         * @param {*} data – Request data
         * @param {function(err:*, res:*)} callback – Closure to fire when completed
         */
        okanjo.exec = function(url, data, callback) {
            data = data || {};
            //noinspection JSUnresolvedFunction
            okanjo.JSONP({
                url: url,
                data: data,
                error: function(data) {
                    var err = { statusCode: 500, error: "Communication Error", message: data.message || "JSONP communication failure." };
                    okanjo.report("core-jsonp", data.error || new Error(err.message));
                    callback(err, null);
                },
                success: function(data) {
                    var err, res;
                    if (data) {
                        if (data.error) {
                            err = data;
                        } else {
                            res = data;
                        }
                    } else {
                        err = { statusCode: 500, error: "Invalid Response", message: "Could not interpret the JSONP response."};
                        okanjo.report('core-jsonp', new Error(err.message));
                    }

                    callback(err, res);
                }
            });
        };


        /**
         * Report a message or error back to Okanjo
         * @param {string} context – What module is responsible for emitting the error (e.g. Product)
         * @param {string|Error} mixed – The message or Error to report
         */
        okanjo.report = function(context, mixed) {
            // REPORT THIS BACK TO OKANJO!
            var error;
            if (typeof mixed === "string") {
                error = new Error('[Okanjo' + (context ? ' ' + context : '') + '] ' + mixed);
            } else if (typeof mixed === "object" && mixed instanceof Error) {
                error = mixed;
            }

            console.error(error);
            //TODO - integrate with Raven
        };

        /**
         * Utility functions
         */
        var util = okanjo.util = okanjo.util || {};


        /**
         * Trims leading and trailing whitespace on a string
         * @param val
         */
        util.trim = function(val) {
            return (val || "").replace(/^\s+|\s+$/g, '');
        };


        /**
         * Function to test whether the given var has a value
         * @param val - The var to check
         * @returns {boolean} - True when the var has value, false when it does not
         */
        util.empty = function (val) {
            return (val === null || val === undefined || (typeof val === "string" && util.trim(val) === ""));
        };

        /**
         * Helper to shallow clone an object so we don't ruin the top-level object reference
         * Note: If the shallow keys are objects, the references to the keyed objects will be maintained!
         *
         * @param {*} obj – Source object to copy
         * @returns {{}} – Shallow clone of the object
         */
        util.clone = function (obj) {
            var clone = {};
            obj = obj || {};
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    clone[k] = obj[k];
                }
            }
            return clone;
        };


        /**
         * Super simple hashing algorithm
         * @see http://jsperf.com/hashing-strings
         * @param str - String to hash
         * @returns {string}
         */
        util.hash = function(str) {
            var hash = 0;
            if (str.length === 0) return ""+hash;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash<<5)-hash)+char;
            }

            return hash.toString(16).replace(/^-/, 'n');

        };


        /**
         * Instead of using HTML5 dataset, just rip through attributes and return data attributes
         * @param element
         * @returns {{}}
         */
        util.data = function (element) {
            var data = {};
            if (element) {
                var attrs = element.attributes;
                for(var i = attrs.length - 1; i >= 0; i--) {
                    if (attrs[i].name.indexOf('data-') === 0) {
                        data[attrs[i].name.substr(5)] = attrs[i].value;
                    }
                }
            }
            return data;
        };


        /**
         * Copies a value to the target if the source contains it
         * @param {*} target – The destination object
         * @param {*} source – The source object
         * @param {string} targetKey – The destination key name
         * @param {string} [sourceKey] – The source key name, if different
         * @param {{stripEmpty:boolean}} [options] – Copy options, e.g. strip empty values
         */
        util.copyIfSet = function(target, source, targetKey, sourceKey, options) {
            sourceKey = sourceKey || targetKey;
            options = options || { };

            function doCopy(sourceKey) {
                if (source && source[sourceKey] !== undefined && (!options.stripEmpty || !util.empty(source[sourceKey]))) {
                    target[targetKey] = source[sourceKey];
                }
            }

            if (typeof sourceKey === "object" && Array.isArray(sourceKey)) {
                // Copy the first source key that is found
                for(var k = 0; k < sourceKey.length; k++) {
                    doCopy(sourceKey[k]);
                }

            } else {
                doCopy(sourceKey);
            }
        };


        /**
         * Copies a mapping of target-source from source to target
         * @param {*} target – The destination object
         * @param {*} source – The source object
         * @param {*} map – The mapping of targetKey => sourceKey (null if same)
         * @param {{stripEmpty:boolean}} [options] – Copy options, e.g. strip empty values
         */
        util.copyIfSetMap = function(target, source, map, options) {
            var keys = Object.keys(map);
            for(var k = 0; k < keys.length; k++) {
                util.copyIfSet(target, source, keys[k], map[keys[k]], options);
            }
        };


        /*! https://github.com/isaacs/inherits/blob/master/inherits_browser.js */
        /**
         * Extends an object from another
         * @param ctor – Child class
         * @param superCtor – Parent class
         */
        util.inherits = function inherits(ctor, superCtor) {
            if (typeof Object.create === 'function') {
                // implementation from standard node.js 'util' module
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            } else {
                // old school shim for old browsers
                ctor.super_ = superCtor;
                var TempCtor = function () {};
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor();
                ctor.prototype.constructor = ctor;
            }
        };


        /**
         * Gets the current page's scroll position
         * @returns {{x: Number, y: Number}}
         */
        util.getScrollPosition = function() {
            return {
                x: supportPageOffset ? window.pageXOffset : isCSS1Compatible ? document.documentElement.scrollLeft : document.body.scrollLeft,
                y: supportPageOffset ? window.pageYOffset : isCSS1Compatible ? document.documentElement.scrollTop : document.body.scrollTop
            };
        };


        /**
         * Gets the height and width of the given element
         * @param {HTMLElement|Node} el – The DOM element to get the size of
         * @param {boolean} [includeMargin] – Whether to include the margins of the element in the size
         * @returns {{height: number, width: number}}
         */
        util.getElementSize = function(el, includeMargin) {

            var size = {
                height: el.offsetHeight,
                width : el.offsetWidth
            }, style;

            if (includeMargin) {
                style = el.currentStyle || getComputedStyle(el);
                size.height += parseInt(style.marginTop) + parseInt(style.marginBottom);
                size.width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            }

            return size;
        };


        /**
         * Gets the elements rectangle coordinates on the page
         * @param el - DOM Element
         * @return {{x1: *, y1: *, x2: *, y2: *}}
         */
        util.getElementPosition = function(el) {

            // Wrapped in try-catch because IE is super strict about the
            // element being on the DOM before you call this. Other browsers
            // let it slide, but oh well.
            var rect, pos, errMsg = '[Okanjo Core] Could not get position of element. Did you attach the element to the DOM before initializing?';
            try {
                rect = el.getBoundingClientRect();
                pos = util.getScrollPosition();

                if (rect.left === 0 &&
                    rect.top === 0 &&
                    rect.right === 0 &&
                    rect.bottom === 0) {
                    console.warn(errMsg);
                }

                return {
                    x1: rect.left + pos.x,
                    y1: rect.top + pos.y,
                    x2: rect.right + pos.x,
                    y2: rect.bottom + pos.y
                };
            } catch (e) {
                console.warn(errMsg, e);
                return {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0
                };
            }

        };


        /**
         * Gets the current page size
         * @return {{w: number, h: number}}
         */
        util.getPageSize = function() {
            var body = okanjo.qwery('body')[0],
                html = document.documentElement;

            return {
                w: Math.max( body.scrollWidth, body.offsetWidth,
                    html.clientWidth, html.scrollWidth, html.offsetWidth ),

                h: Math.max( body.scrollHeight, body.offsetHeight,
                    html.clientHeight, html.scrollHeight, html.offsetHeight )
            };
        };


        /**
         * Gets the current viewport size
         * @return {{vw: number, vh: number}}
         */
        util.getViewportSize = function() {
            return {
                vw: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                vh: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
            };
        };


        /**
         * Splits the text in the element to fit within the visible height of its container, and separates with an ellipses
         * @param {HTMLElement|Node} element – The DOM element containing the text to fit
         * @param {HTMLElement} [container] – Optional container to compute fit on. Defaults to the element's parent
         */
        util.ellipsify = function(element, container) {

            // It's a sad day when you have to resort to JS because CSS kludges are too hacky to work down to IE8, programmatically
            //noinspection JSValidateTypes
            var parent = container || element.parentNode,
                targetHeight = util.getElementSize(parent).height,
                useTextContent = element.textContent !== undefined,
                text = useTextContent ? element.textContent : element.innerText,
                replacedText = "",
                safety = 5000, // Safety switch to bust out of the loop in the event something goes terribly wrong
                replacer = function(match) {
                    replacedText = match.substr(0, match.length-3) + replacedText;
                    return '...';
                };

            // Trim off characters until we can fit the text and ellipses
            // If the text already fits, this loop is ignored
            while (util.getElementSize(element).height > targetHeight && text.length > 0 && (safety-- > 0)) {
                text = useTextContent ? element.textContent : element.innerText;

                text = text.replace(/[\s\S](?:\.\.\.)?$/, replacer);

                if (useTextContent) {
                    element.textContent = text;
                } else {
                    element.innerText = text;
                }
            }

            // If there is work to do, split the content into two span tags
            // Like so: [content]...[hidden content]
            if (replacedText.length > 0) {

                var content = document.createElement('span'),
                    span = document.createElement('span');

                content.setAttribute('class','okanjo-ellipses');
                span.setAttribute('class','okanjo-visually-hidden');

                if (useTextContent) {
                    content.textContent = text.substr(0, text.length-3);
                    span.textContent = replacedText;
                } else {
                    content.innerText = text.substr(0, text.length-3);
                    span.innerText = replacedText;
                }

                element.innerHTML = '';
                element.appendChild(content);
                element.appendChild(span);
            }

        };


        /**
         * Return various browser detections
         * @returns {Array}
         */
        util.detectClasses = function() {
            var classDetects = [];
            if (navigator.appVersion.indexOf("MSIE 9.") != -1) {
                classDetects.push('lt-ie10');
            } else if (navigator.appVersion.indexOf("MSIE 8.") != -1) {
                classDetects.push('lt-ie9');
            } else if (navigator.appVersion.indexOf("MSIE 7.") != -1) {
                classDetects.push('lt-ie8');
            } else if (navigator.appVersion.indexOf("MSIE 6.") != -1) {
                classDetects.push('lt-ie7');
            }
            return classDetects;
        };


        /**
         * Checks if we're executing this code inside a frame or not
         * @returns {boolean}
         */
        util.isFramed = function() {
            return window.top !== window.self;
        };

        /**
         * Checks if the current user agent identifies as an iOS device
         * @returns {boolean}
         */
        util.isiOS = function() {
            return /(iPhone|iPad|iPod)/i.test(agent);
        };


        /**
         * Checks if the current user agent identifies as Android device
         * @returns {boolean}
         */
        util.isAndroid = function() {
            return /Android/.test(agent);
        };


        /**
         * Checks if the current user agent identifies as a mobile device
         * @returns {boolean}
         */
        util.isMobile = function() {
            return util.isiOS() || util.isAndroid();
        };


        /**
         * Returns an object hashmap of query and hash parameters
         * @param {boolean} includeHashArguments - Whether to include the hash arguments, if any
         * @return {*}
         */
        util.getPageArguments = function(includeHashArguments) {

            var queryArgs = splitArguments(window.location.search.substring(window.location.search.indexOf('?') + 1));

            if (includeHashArguments) {
                var hashArgs = splitArguments(window.location.hash.substring(Math.max(window.location.hash.indexOf('#') + 1, window.location.hash.indexOf('#!') + 2)));
                for (var k in hashArgs) {
                    if (hashArgs.hasOwnProperty(k)) {
                        queryArgs[k] = hashArgs[k];
                    }
                }
            }

            return queryArgs;
        };


        /**
         * Deep clones a thing
         * @param mixed Something to clone
         * @param [out] Optional object/array receiver if clone-merge is desirable. Just make sure the type matches the source
         * @return {*}
         */
        util.deepClone = function(mixed, out) {
            var i = 0, k;
            if (Array.isArray(mixed)) {
                out = out || [];
                for ( ; i < mixed.length; i++) {
                    out.push(util.deepClone(mixed[i]));
                }
            } else if (typeof mixed === "object") {
                out = out || {};
                for (k in mixed) {
                    if (mixed.hasOwnProperty(k)) {
                        out[k] = util.deepClone(mixed[k]);
                    }
                }
            } else {
                out = mixed;
            }
            return out;
        };


        function splitArguments(query) {
            var params = {},
                ampSplit = query.split('&'),
                i = 0,
                temp, key, value, eqIndex;
            for ( ; i < ampSplit.length; i++) {
                temp = ampSplit[i];
                eqIndex = temp.indexOf('=');
                if (eqIndex < 0) {
                    key = decodeURIComponent(temp);
                    value = null;
                } else {
                    key = decodeURIComponent(temp.substring(0, eqIndex));
                    value = decodeURIComponent(temp.substring(eqIndex + 1));
                }
                if (key) {
                    params[key] = value;
                }
            }
            return params;
        }

        return okanjo;

    })(okanjo || window.okanjo);





    var config = okanjo.config = okanjo.config || {};

    // okanjo-ads api key
    config.key = config.key || undefined;

        // Marketplace config
    config.marketplace = {
        uri: 'https://shop.okanjo.com',
        apiUri: 'https://api.okanjo.com',
        routerUri: 'https://shop.okanjo.com/widgets/router/',
        balancedMarketplacePath: '/v1/marketplaces/MP6vnNdXY7izEEVPs1gl7jSy',
        socketIOUri: 'https://mke-rt.okanjo.com:13443'
    };

        // Ads config
    config.ads = {
        apiUri: 'https://ads-api.okanjo.com'
    };

        // Moat Analytics config
    config.moat = {
        tag: 'okanjo969422799577'
    };

    /**
     * Override the default production configuration
     * @param options
     */
    okanjo.configure = function(options) {

        // Merge keys
        Object.keys(options).every(function(root) {
            if (config[root] && typeof config[root] === "object" && typeof options[root] === "object") {
                Object.keys(options[root]).every(function(key) {
                    config[root][key] = options[root][options[key]];
                    return true;
                });
            } else {
                config[root] = options[root];
            }
            return true;
        });


    };
//noinspection JSUnusedLocalSymbols,ThisExpressionReferencesGlobalObjectJS
(function(okanjo, window) {

    var TemplateEngine = okanjo.TemplateEngine = function TemplateEngine(options) {
        options = options || { templates: {}, css: {} };
        this._templates = options.templates || {};
        this._css = options.css || {};

        // Add special styles for ie 7, 8, 9
        this.classDetects = okanjo.util.detectClasses();
        this.classDetects = this.classDetects.join(' ');
    };

    TemplateEngine.prototype = {

        constructor: TemplateEngine,

        /**
         * Register a template
         * @param {string} name – Template name
         * @param {string|HTMLElement} template - Template markup string
         * @param {function(data:*):*} [viewClosure] – Optional data manipulation closure
         * @param {*} [options] – Optional hash of template options, e.g. css: [ 'name1', 'name2' ]
         */
        registerTemplate: function(name, template, viewClosure, options) {
            // Example template:
            // {{title}} spends {{calc}}

            if (typeof template === "object") {
                //noinspection JSValidateTypes
                if (template.nodeType === undefined) {
                    throw new Error('Parameter template must be a string or a DOM element');
                } else {
                    okanjo.Mustache.parse(template);
                }
            } else if (typeof template !== "string") {
                throw new Error('Parameter template must be a string or a DOM element');
            }

            // Shift options if only have 3 params
            if (arguments.length === 3 && typeof viewClosure === "object") {
                options = viewClosure;
                viewClosure = undefined;
            } else {
                options = options || {};
            }

            if (viewClosure !== undefined && typeof viewClosure !== "function") {
                throw new Error('Parameter viewClosure must be a function');
            }

            // Assign the template
            this._templates[name] = {
                markup: template,
                options: options,
                viewClosure: viewClosure || null
            };
        },


        /**
         * Registers a CSS block
         *
         * @param {string} name – CSS block name
         * @param {string|HTMLElement} css – The CSS markup or existing style element
         * @param {undefined|{id:string}|null} [options] – Optional hash of KVP settings
         */
        registerCss: function(name, css, options) {
            options = options || {};

            if (typeof css === "object") {
                //noinspection JSValidateTypes
                if (css.nodeType === undefined) {
                    throw new Error('Parameter css must be a string or a DOM element');
                }
            } else if (typeof css !== "string") {
                throw new Error('Parameter css must be a string or a DOM element');
            }

            this._css[name] = {
                markup: css,
                options: options
            };
        },


        /**
         * Checks if a template was registered
         * @param {string} name – The template name to look for
         * @returns {boolean} – True if registered, False if not
         */
        isTemplateRegistered: function(name) {
            return this._templates[name] ? true : false;
        },


        /**
         * Checks if a CSS block was registered
         * @param {string} name – The CSS block name to look for
         * @returns {boolean} – True if registered, False if not
         */
        isCssRegistered: function(name) {
            return this._css[name] ? true : false;
        },


        /**
         * Ensures that the given CSS block name has been added to the page
         * @param {string|HTMLElement} name - The CSS name that was registered through registerCss
         */
        ensureCss: function(name) {

            if (this._css[name]) {
                //noinspection JSValidateTypes
                var css = this._css[name],
                    id = css.markup.nodeType === undefined ? css.options.id || "okanjo-css-" + name : null; // If it's a DOM element, just forget it cuz it's already on the page

                // Check for css element on page, if we have an ID to look for
                if (id) {
                    var elements = okanjo.qwery('#' + id);
                    if (elements.length === 0) {
                        var head = okanjo.qwery('head'),
                            style = document.createElement('style');

                        style.id = id;
                        style.setAttribute('type', 'text/css');

                        if (style.hasOwnProperty) { // old ie
                            style.innerHTML = css.markup;
                        } else {
                            style.styleSheet.cssText = css.markup;
                        }

                        if (head.length > 0) {
                            head[0].appendChild(style);
                        } else {
                            // NO HEAD, just prepend to body then
                            var body = okanjo.qwery('body');
                            if (body.length > 0) {
                                body[0].appendChild(style);
                            } // And if this doesn't work, just give up
                        }
                    }
                }
            } else {
                console.warn('[Okanjo.Template] Attempted to add CSS template "'+name+'" to the DOM, however it does not appear to be registered?');
            }

        },


        /**
         * Renders a template with the given data
         *
         * @param {string} templateName – The template name to render
         * @param {*} context – The context to execute the template under
         * @param {*} data – Data to pass into the controller
         * @param {*} [options] – Optional settings object to pass into the controller closure
         * @returns {*}
         */
        render: function(templateName, context, data, options) {

            options = options || {};
            var template = this._templates[templateName],
                view = data;

            // If there's a data controller closure set, and if so, run the data through there
            if (template.viewClosure) {
                view = template.viewClosure.call(context, data, options);
            }

            // Attach globals
            view.okanjoConfig = okanjo.config;
            view.okanjoMetricUrl = okanjo.config.ads.apiUri.replace(/^https?:\/\//,''); // Url w/o scheme to prevent mixed-content warnings
            view.now = function() { return (new Date()).getTime(); };
            view.classDetects = this.classDetects;

            //noinspection JSUnresolvedVariable
            if (options.blockClasses && Array.isArray(options.blockClasses)) {
                view.classDetects = view.classDetects += " " + options.blockClasses.join(' ');
            }

            // Add CSS unless we are told not to
            if (options.css !== false) {
                if (template.options.css && template.options.css.length > 0) {
                    for(var i = 0; i < template.options.css.length; i++) {
                        this.ensureCss(template.options.css[i]);
                    }
                }
            }

            // Render the template and return the result
            return okanjo.Mustache.render(template.markup, view);
        },

        formats: {

            /**
             * Formats a number into a currency string (rounded, decimal points, thousands separators)
             * See: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
             *
             * @param value – the number to format
             * @param [decimals] - The number of decimals to show
             * @param [decimalSeparator] – The decimals separator, default: .
             * @param [thousandsSeparator] – The thousands separator, default: ,
             * @returns {string} – Formatted currency string
             */
            currency: function(value, decimals, decimalSeparator, thousandsSeparator){
                decimals = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
                decimalSeparator = decimalSeparator === undefined ? "." : decimalSeparator;
                thousandsSeparator = thousandsSeparator === undefined ? "," : thousandsSeparator;
                var s = value < 0 ? "-" : "",
                    i = parseInt(value = Math.abs(+value || 0).toFixed(decimals)) + "",
                    j = i.length;
                j = (j) > 3 ? j % 3 : 0;
                return s + (j ? i.substr(0, j) + thousandsSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousandsSeparator) + (decimals ? decimalSeparator + Math.abs(value - i).toFixed(decimals).slice(2) : "");
            },


            /**
             * Formats a product or an array of product objects for the view
             * @param {*} mixed – Product or an array of product objects
             * @returns {*} – Formatted product array or object
             */
            product: function(mixed) {
                // If we got an array of products, handle each one
                if (typeof mixed === "object" && Array.isArray(mixed)) {
                    var products = [];
                    for(var i = 0; i < mixed.length; i++) {
                        products.push(this.product(mixed[i]));
                    }
                    return products;
                } else if(typeof mixed === "object" ) { // Individual product
                    // Set first image as the display image

                    //noinspection JSUnresolvedVariable
                    mixed.image_url = mixed.image_urls ? mixed.image_urls[0] : '' ;
                    //noinspection JSUnresolvedVariable
                    mixed.escaped_buy_url = encodeURIComponent(mixed.buy_url);
                    mixed.escaped_inline_buy_url = okanjo.util.empty(mixed.inline_buy_url) ? '' : encodeURIComponent(mixed.inline_buy_url);
                    mixed.price_formatted = this.currency(mixed.price);
                    return mixed;
                } else { // Unknown value
                    return null;
                }
            }

        }
    };

    // global template engine for all the widgets
    okanjo.mvc = new TemplateEngine();


})(okanjo, this);

/*

 Adaptation based on https://github.com/larryosborn/JSONP

 The MIT License (MIT)

 Copyright (c) 2014 Larry Osborn <larry.osborn@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */
(function() {
    if(this.JSONP) { return; }
    var JSONP, computedUrl, encode, noop, objectToURI, makeUniqueCallback, head;

    encode = window.encodeURIComponent;

    noop = function() {
        return void 0;
    };

    computedUrl = function(params) {
        var url;
        url = params.url;
        url += params.url.indexOf('?') < 0 ? '?' : '&';
        url += objectToURI(params.data);
        return url;
    };

    makeUniqueCallback = function() {
        JSONP.requestCounter += 1;
        return (new Date()).getTime() + "_" + JSONP.requestCounter;
    };

    objectToURI = function(obj) {
        var data, key, value;
        data = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                value = obj[key];
                if (Array.isArray(value)) {
                    var i = 0;
                    for( ; i < value.length; i++ ) {
                        data.push(encode(key) + '[]=' + encode(value[i]));
                    }
                } else if (typeof value === "object") {
                    // SINGLE DEPTH OBJECTS - no recursion
                    for (var k in value) {
                        if (value.hasOwnProperty(k)) {
                            data.push(encode(key) + '['+encode(k)+']=' + encode(value[k]));
                        }
                    }
                } else {
                    data.push(encode(key) + '=' + encode(value));
                }
            }
        }
        return data.join('&');
    };

    JSONP = function(options) {
        options = options ? options : {};
        var callback, done, params, script, timeoutHandle, removeCallback;
        params = {
            data: options.data || {},
            error: options.error || noop,
            success: options.success || noop,
            beforeSend: options.beforeSend || noop,
            complete: options.complete || noop,
            url: options.url || '',
            timeout: options.timeout || 30000
        };
        params.computedUrl = computedUrl(params);
        if (params.url.length === 0) {
            throw new Error('MissingUrl');
        }
        done = false;
        if (params.beforeSend({}, params) !== false) {
            //noinspection JSUnresolvedVariable
            callback = params.data[options.callbackName || 'callback'] = '_okanjo_jsonp_' + makeUniqueCallback();
            window[callback] = function(data) {

                if (timeoutHandle) { clearTimeout(timeoutHandle); }
                timeoutHandle = null;

                params.success(data, params);
                params.complete(data, params);
                removeCallback();
            };

            removeCallback = function() {
                try {
                    return delete window[callback];
                } catch (_error) {
                    window[callback] = void 0;
                    return void 0;
                }
            };

            script = window.document.createElement('script');
            script.src = computedUrl(params);
            script.async = true;

            timeoutHandle = setTimeout(function() {
                timeoutHandle = null;
                var err = new Error("JSONP request did not respond in time!");
                err.url = (script && script.src) || null;
                params.error(err);
                removeCallback();
                return params.complete(err, params);
            }, params.timeout);

            script.onerror = function(evt) {
                if (timeoutHandle) { clearTimeout(timeoutHandle); }
                params.error({
                    url: script.src,
                    event: evt
                });
                return params.complete({
                    url: script.src,
                    event: evt
                }, params);
            };

            script.onload = script.onreadystatechange = function() {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;
                    script.onload = script.onreadystatechange = null;
                    if (script && script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    //jshint -W093
                    return script = null;
                    //jshint +W093
                }
            };

            head = head || window.document.getElementsByTagName('head')[0] || window.document.documentElement;
            return head.insertBefore(script, head.firstChild);
        }
    };

    JSONP.requestCounter = 0;
    JSONP.makeUrl = computedUrl;
    JSONP.objectToURI = objectToURI;

    if ((typeof define !== "undefined" && define !== null) && define.amd) {
        define(function() {
            return JSONP;
        });
    } else if ((typeof module !== "undefined" && module !== null) && module.exports) {
        module.exports = JSONP;
    } else {
        this.JSONP = JSONP;
    }

}).call(okanjo);

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

//// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
//if (typeof Object.create != 'function') {
//    Object.create = (function() {
//        var Temp = function() {};
//        return function (prototype) {
//            if (arguments.length > 1) {
//                throw new Error('Second argument not supported');
//            }
//            if (typeof prototype != 'object') {
//                throw new TypeError('Argument must be an object');
//            }
//            Temp.prototype = prototype;
//            var result = new Temp();
//            Temp.prototype = null;
//            return result;
//        };
//    })();
//}

// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.14
// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {

        var k;

        /* jshint ignore:start */
        // 1. Let O be the result of calling ToObject passing
        //    the this value as the argument.
        if (this == null) { //
            throw new TypeError('"this" is null or not defined');
        }
        /* jshint ignore:end */

        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get
        //    internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If len is 0, return -1.
        if (len === 0) {
            return -1;
        }

        // 5. If argument fromIndex was passed let n be
        //    ToInteger(fromIndex); else let n be 0.
        var n = +fromIndex || 0;

        if (Math.abs(n) === Infinity) {
            n = 0;
        }

        // 6. If n >= len, return -1.
        if (n >= len) {
            return -1;
        }

        // 7. If n >= 0, then Let k be n.
        // 8. Else, n<0, Let k be len - abs(n).
        //    If k is less than 0, then let k be 0.
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 9. Repeat, while k < len
        while (k < len) {
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the
            //    HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            //    i.  Let elementK be the result of calling the Get
            //        internal method of O with the argument ToString(k).
            //   ii.  Let same be the result of applying the
            //        Strict Equality Comparison Algorithm to
            //        searchElement and elementK.
            //  iii.  If same is true, return k.
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
    Array.prototype.every = function(callbackfn, thisArg) {
        'use strict';
        var T, k;

        // jshint -W041
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        // jshint +W041

        // 1. Let O be the result of calling ToObject passing the this
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method
        //    of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
        if (typeof callbackfn !== 'function') {
            throw new TypeError();
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let k be 0.
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method
                //    of O with argument Pk.
                kValue = O[k];

                // ii. Let testResult be the result of calling the Call internal method
                //     of callbackfn with T as the this value and argument list
                //     containing kValue, k, and O.
                var testResult = callbackfn.call(T, kValue, k, O);

                // iii. If ToBoolean(testResult) is false, return false.
                if (!testResult) {
                    return false;
                }
            }
            k++;
        }
        return true;
    };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun/*, thisArg*/) {
        'use strict';

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this),
            len = t.length >>> 0;

        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [],
            thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}

// Doesn't work in IE7 so it's only here for reference
//https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
(function() {
    if (!Event.prototype.preventDefault) {
        Event.prototype.preventDefault=function() {
            //noinspection JSUnusedGlobalSymbols
            this.returnValue=false;
        };
    }
    if (!Event.prototype.stopPropagation) {
        Event.prototype.stopPropagation=function() {
            //noinspection JSUnusedGlobalSymbols
            this.cancelBubble=true;
        };
    }
    if (!Element.prototype.addEventListener) {
        var eventListeners=[];

        var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
            var self=this;
            var wrapper=function(e) {
                e.target=e.srcElement;
                e.currentTarget=self;
                if (listener.handleEvent) {
                    listener.handleEvent(e);
                } else {
                    listener.call(self,e);
                }
            };
            if (type=="DOMContentLoaded") {
                var wrapper2=function(e) {
                    if (document.readyState=="complete") {
                        wrapper(e);
                    }
                };
                document.attachEvent("onreadystatechange",wrapper2);
                eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});

                if (document.readyState=="complete") {
                    //noinspection JSClosureCompilerSyntax
                    var e=new Event();
                    e.srcElement=window;
                    wrapper2(e);
                }
            } else {
                this.attachEvent("on"+type,wrapper);
                eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
            }
        };
        var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
            var counter=0;
            while (counter<eventListeners.length) {
                var eventListener=eventListeners[counter];
                if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
                    if (type=="DOMContentLoaded") {
                        this.detachEvent("onreadystatechange",eventListener.wrapper);
                    } else {
                        this.detachEvent("on"+type,eventListener.wrapper);
                    }
                    eventListeners.splice(counter, 1);
                    break;
                }
                ++counter;
            }
        };
        Element.prototype.addEventListener=addEventListener;
        Element.prototype.removeEventListener=removeEventListener;
        if (HTMLDocument) {
            HTMLDocument.prototype.addEventListener=addEventListener;
            HTMLDocument.prototype.removeEventListener=removeEventListener;
        }
        if (Window) {
            //noinspection JSUnresolvedVariable
            Window.prototype.addEventListener=addEventListener;
            //noinspection JSUnresolvedVariable
            Window.prototype.removeEventListener=removeEventListener;
        }
    }
})();

    // Make it safe to do console.log() always.
    /*! Console-polyfill. | MIT license. | https://github.com/paulmillr/console-polyfill */
    //noinspection ThisExpressionReferencesGlobalObjectJS
    (function (con) {
        'use strict';
        var prop, method,
            empty = {},
            dummy = function() {},
            properties = 'memory'.split(','),
            methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
            'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
            'time,timeEnd,trace,warn').split(',');
        // jshint -W084
        while (prop = properties.pop()) {
            if (con[prop] === undefined) {
                con[prop] = con[prop] || empty;
            }
        }
        while (method = methods.pop()) {
            if(con[method] === undefined) {
                con[method] = con[method] || dummy;
            }
        }
        // jshint +W084
    })(this.console || {});

    /*! Okanjo Local Storage Polyfill v1.0.0 | (c) 2013 Okanjo Partners Inc | Based on https://gist.github.com/juliocesar/926500/ddb28fb72903be87cb9044a945c6edbe1aa28b3a */
    //noinspection ThisExpressionReferencesGlobalObjectJS
    (function(c, window) {
        var OkanjoCache = null;
        if ('localStorage' in window && window.localStorage !== null && isLocalStorageNameSupported()) {
            OkanjoCache = window.localStorage;
        } else {
            OkanjoCache = {
                _data       : {}, // jshint -W093
                length      : 0,
                _updateLen  : function() { this.length = this._data.length; },

                setItem     : function(id, val) { var res = this._data[id] = String(val); this._updateLen(); return res; },
                getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
                removeItem  : function(id) { var res = delete this._data[id]; this._updateLen(); return res; },
                clear       : function() { return this._data = {}; },
                key         : function(index) { return Object.keys(this._data)[index]; } // jshint +W093
            };
        }
        c.Cache = OkanjoCache;
        return OkanjoCache;

        // Make sure LocalStorage is usable.
        // Thanks stackoverflow! http://stackoverflow.com/a/17604754/1373782
        function isLocalStorageNameSupported() {
            var testKey = 'test', storage = window.sessionStorage;
            try {
                storage.setItem(testKey, '1');
                storage.removeItem(testKey);
                return true;
            } catch (error) {
                return false;
            }
        }
    })(okanjo || this, this);

    /*! Okanjo Cookie Helper v1.0.0 | (c) 2013 Okanjo Partners Inc */
    //noinspection ThisExpressionReferencesGlobalObjectJS
    (function(c, w) {

        var document = w.document || { cookie: '' };

        c.Cookie = {
            set: function(cookieName, value, expireDays) {
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + expireDays);
                var cookieValue = encodeURI(value) + ((!expireDays) ? "" : "; Expires=" + expireDate.toUTCString() + "; Path=/");
                document.cookie = cookieName + "=" + cookieValue;
            },
            get: function(cookieName) {
                var idx, nameTest, value, cookieArray = document.cookie.split(";");
                for (idx = 0; idx < cookieArray.length; idx++) {
                    nameTest = cookieArray[idx].substr(0, cookieArray[idx].indexOf("="));
                    value = cookieArray[idx].substr(cookieArray[idx].indexOf("=") + 1);
                    nameTest = nameTest.replace(/^\s+|\s+$/g, "");
                    if (nameTest == cookieName) {
                        return decodeURI(value);
                    }
                }
                return null;
            }
        };

        return c.Cookie;

    })(okanjo || this, this);
/* jshint ignore:start */

/*
 json2.js
 2013-05-26

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

*/
if (typeof JSON !== 'object') {
    JSON = {};

    (function () {
        'use strict';

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        if (typeof Date.prototype.toJSON !== 'function') {

            Date.prototype.toJSON = function () {

                return isFinite(this.valueOf())
                    ? this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z'
                    : null;
            };

            String.prototype.toJSON =
                Number.prototype.toJSON =
                    Boolean.prototype.toJSON = function () {
                        return this.valueOf();
                    };
        }

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }


        function str(key, holder) {

// Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

// What happens next depends on the value's type.

            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                    return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

                case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                    if (!value) {
                        return 'null';
                    }

// Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

// Is the value an array?

                    if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                        v = partial.length === 0
                            ? '[]'
                            : gap
                            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                            : '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

// If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {

// Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                    v = partial.length === 0
                        ? '{}'
                        : gap
                        ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                        : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        }

// If the JSON object does not yet have a stringify method, give it one.

        if (typeof JSON.stringify !== 'function') {
            JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

// If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

                return str('', {'': value});
            };
        }


// If the JSON object does not yet have a parse method, give it one.

        if (typeof JSON.parse !== 'function') {
            JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/
                        .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function'
                        ? walk({'': j}, '')
                        : j;
                }

// If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            };
        }
    }());
}
/* jshint ignore:end */
/* jshint ignore:start */

(function() {

/*!
  * @preserve Qwery - A Blazing Fast query selector engine
  * https://github.com/ded/qwery
  * copyright Dustin Diaz 2012
  * MIT License
  */

(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
})('qwery', this, function () {
  var doc = document
    , html = doc.documentElement
    , byClass = 'getElementsByClassName'
    , byTag = 'getElementsByTagName'
    , qSA = 'querySelectorAll'
    , useNativeQSA = 'useNativeQSA'
    , tagName = 'tagName'
    , nodeType = 'nodeType'
    , select // main select() method, assign later

    , id = /#([\w\-]+)/
    , clas = /\.[\w\-]+/g
    , idOnly = /^#([\w\-]+)$/
    , classOnly = /^\.([\w\-]+)$/
    , tagOnly = /^([\w\-]+)$/
    , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
    , splittable = /(^|,)\s*[>~+]/
    , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
    , splitters = /[\s\>\+\~]/
    , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
    , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
    , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
    , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
    , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
    , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
    , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
    , tokenizr = new RegExp(splitters.source + splittersMore.source)
    , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')

  var walker = {
      ' ': function (node) {
        return node && node !== html && node.parentNode
      }
    , '>': function (node, contestant) {
        return node && node.parentNode == contestant.parentNode && node.parentNode
      }
    , '~': function (node) {
        return node && node.previousSibling
      }
    , '+': function (node, contestant, p1, p2) {
        if (!node) return false
        return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
      }
    }

  function cache() {
    this.c = {}
  }
  cache.prototype = {
    g: function (k) {
      return this.c[k] || undefined
    }
  , s: function (k, v, r) {
      v = r ? new RegExp(v) : v
      return (this.c[k] = v)
    }
  }

  var classCache = new cache()
    , cleanCache = new cache()
    , attrCache = new cache()
    , tokenCache = new cache()

  function classRegex(c) {
    return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
  }

  // not quite as fast as inline loops in older browsers so don't use liberally
  function each(a, fn) {
    var i = 0, l = a.length
    for (; i < l; i++) fn(a[i])
  }

  function flatten(ar) {
    for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
    return r
  }

  function arrayify(ar) {
    var i = 0, l = ar.length, r = []
    for (; i < l; i++) r[i] = ar[i]
    return r
  }

  function previous(n) {
    while (n = n.previousSibling) if (n[nodeType] == 1) break;
    return n
  }

  function q(query) {
    return query.match(chunker)
  }

  // called using `this` as element and arguments from regex group results.
  // given => div.hello[title="world"]:foo('bar')
  // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
    var i, m, k, o, classes
    if (this[nodeType] !== 1) return false
    if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
    }
    if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
    if (wholeAttribute && !value) { // select is just for existance of attrib
      o = this.attributes
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
      // select is for attrib equality
      return false
    }
    return this
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
    }
    return 0
  }

  // given a selector, first check for simple cases then collect all base candidate matches and filter
  function _qwery(selector, _root) {
    var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
      , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      , dividedTokens = selector.match(dividers)

    if (!tokens.length) return r

    token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
    if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
    if (!root) return r

    intr = q(token)
    // collect base candidates to filter
    els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
      function (r) {
        while (root = root.nextSibling) {
          root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
        }
        return r
      }([]) :
      root[byTag](intr[1] || '*')
    // filter elements according to the right-most part of the selector
    for (i = 0, l = els.length; i < l; i++) {
      if (item = interpret.apply(els[i], intr)) r[r.length] = item
    }
    if (!tokens.length) return r

    // filter further according to the rest of the selector (the left side)
    each(r, function (e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
    return ret
  }

  // compare element to a selector
  function is(el, selector, root) {
    if (isNode(selector)) return el == selector
    if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

    var selectors = selector.split(','), tokens, dividedTokens
    while (selector = selectors.pop()) {
      tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      dividedTokens = selector.match(dividers)
      tokens = tokens.slice(0) // copy array
      if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
        return true
      }
    }
    return false
  }

  // given elements matching the right-most part of a selector, filter out any that don't match the rest
  function ancestorMatch(el, tokens, dividedTokens, root) {
    var cand
    // recursively work backwards through the tokens and up the dom, covering all options
    function crawl(e, i, p) {
      while (p = walker[dividedTokens[i]](p, e)) {
        if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
          if (i) {
            if (cand = crawl(p, i - 1, p)) return cand
          } else return p
        }
      }
    }
    return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
  }

  function isNode(el, t) {
    return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
  }

  function uniq(ar) {
    var a = [], i, j;
    o:
    for (i = 0; i < ar.length; ++i) {
      for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
      a[a.length] = ar[i]
    }
    return a
  }

  function arrayLike(o) {
    return (typeof o === 'object' && isFinite(o.length))
  }

  function normalizeRoot(root) {
    if (!root) return doc
    if (typeof root == 'string') return qwery(root)[0]
    if (!root[nodeType] && arrayLike(root)) return root[0]
    return root
  }

  function byId(root, id, el) {
    // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
    return root[nodeType] === 9 ? root.getElementById(id) :
      root.ownerDocument &&
        (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
          (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
  }

  function qwery(selector, _root) {
    var m, el, root = normalizeRoot(_root)

    // easy, fast cases that we can dispatch with simple DOM calls
    if (!root || !selector) return []
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)
    if (m = selector.match(easy)) {
      if (m[1]) return (el = byId(root, m[1])) ? [el] : []
      if (m[2]) return arrayify(root[byTag](m[2]))
      if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
    }

    return select(selector, root)
  }

  // where the root is not document and a relationship selector is first we have to
  // do some awkward adjustments to get it to work, even with qSA
  function collectSelector(root, collector) {
    return function (s) {
      var oid, nid
      if (splittable.test(s)) {
        if (root[nodeType] !== 9) {
          // make sure the el has an id, rewrite the query, set root to doc and run it
          if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
          s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
          collector(root.parentNode || root, s, true)
          oid || root.removeAttribute('id')
        }
        return;
      }
      s.length && collector(root, s, false)
    }
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } : 'contains' in html ?
    function (element, container) {
      container = container[nodeType] === 9 || container == window ? html : container
      return container !== element && container.contains(element)
    } :
    function (element, container) {
      while (element = element.parentNode) if (element === container) return 1
      return 0
    }
  , getAttr = function () {
      // detect buggy IE src/href getAttribute() call
      var e = doc.createElement('p')
      return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
        function (e, a) {
          return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
            e.getAttribute(a, 2) : e.getAttribute(a)
        } :
        function (e, a) { return e.getAttribute(a) }
    }()
  , hasByClass = !!doc[byClass]
    // has native qSA support
  , hasQSA = doc.querySelector && doc[qSA]
    // use native qSA
  , selectQSA = function (selector, root) {
      var result = [], ss, e
      try {
        if (root[nodeType] === 9 || !splittable.test(selector)) {
          // most work is done right here, defer to qSA
          return arrayify(root[qSA](selector))
        }
        // special case where we need the services of `collectSelector()`
        each(ss = selector.split(','), collectSelector(root, function (ctx, s) {
          e = ctx[qSA](s)
          if (e.length == 1) result[result.length] = e.item(0)
          else if (e.length) result = result.concat(arrayify(e))
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      } catch (ex) { }
      return selectNonNative(selector, root)
    }
    // no native selector support
  , selectNonNative = function (selector, root) {
      var result = [], items, m, i, l, r, ss
      selector = selector.replace(normalizr, '$1')
      if (m = selector.match(tagAndOrClass)) {
        r = classRegex(m[2])
        items = root[byTag](m[1] || '*')
        for (i = 0, l = items.length; i < l; i++) {
          if (r.test(items[i].className)) result[result.length] = items[i]
        }
        return result
      }
      // more complex selector, get `_qwery()` to do the work for us
      each(ss = selector.split(','), collectSelector(root, function (ctx, s, rewrite) {
        r = _qwery(s, ctx)
        for (i = 0, l = r.length; i < l; i++) {
          if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
        }
      }))
      return ss.length > 1 && result.length > 1 ? uniq(result) : result
    }
  , configure = function (options) {
      // configNativeQSA: use fully-internal selector or native qSA where present
      if (typeof options[useNativeQSA] !== 'undefined')
        select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
    }

  configure({ useNativeQSA: true })

  qwery.configure = configure
  qwery.uniq = uniq
  qwery.is = is
  qwery.pseudos = {}

  return qwery
});

/*! onDomReady.js 1.4.0 (c) 2013 Tubal Martin - MIT license | Wrapped in UMD by Okanjo */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.onDomReady = factory();
    }
}(this, function() {

    'use strict';

    var win = window,
        doc = win.document,
        docElem = doc.documentElement,

        LOAD = "load",
        FALSE = false,
        ONLOAD = "on"+LOAD,
        COMPLETE = "complete",
        READYSTATE = "readyState",
        ATTACHEVENT = "attachEvent",
        DETACHEVENT = "detachEvent",
        ADDEVENTLISTENER = "addEventListener",
        DOMCONTENTLOADED = "DOMContentLoaded",
        ONREADYSTATECHANGE = "onreadystatechange",
        REMOVEEVENTLISTENER = "removeEventListener",

    // W3C Event model
        w3c = ADDEVENTLISTENER in doc,
        top = FALSE,

    // isReady: Is the DOM ready to be used? Set to true once it occurs.
        isReady = FALSE,

    // Callbacks pending execution until DOM is ready
        callbacks = [];

    // Handle when the DOM is ready
    function ready( fn ) {
        if ( !isReady ) {

            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if ( !doc.body ) {
                return defer( ready );
            }

            // Remember that the DOM is ready
            isReady = true;

            // Execute all callbacks
            while ( fn = callbacks.shift() ) {
                defer( fn );
            }
        }
    }

    // The ready event handler
    function completed( event ) {
        // readyState === "complete" is good enough for us to call the dom ready in oldIE
        if ( w3c || event.type === LOAD || doc[READYSTATE] === COMPLETE ) {
            detach();
            ready();
        }
    }

    // Clean-up method for dom ready events
    function detach() {
        if ( w3c ) {
            doc[REMOVEEVENTLISTENER]( DOMCONTENTLOADED, completed, FALSE );
            win[REMOVEEVENTLISTENER]( LOAD, completed, FALSE );
        } else {
            doc[DETACHEVENT]( ONREADYSTATECHANGE, completed );
            win[DETACHEVENT]( ONLOAD, completed );
        }
    }

    // Defers a function, scheduling it to run after the current call stack has cleared.
    function defer( fn, wait ) {
        // Allow 0 to be passed
        setTimeout( fn, +wait >= 0 ? wait : 1 );
    }

    // Attach the listeners:

    // Catch cases where onDomReady is called after the browser event has already occurred.
    // we once tried to use readyState "interactive" here, but it caused issues like the one
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if ( doc[READYSTATE] === COMPLETE ) {
        // Handle it asynchronously to allow scripts the opportunity to delay ready
        defer( ready );

        // Standards-based browsers support DOMContentLoaded
    } else if ( w3c ) {
        // Use the handy event callback
        doc[ADDEVENTLISTENER]( DOMCONTENTLOADED, completed, FALSE );

        // A fallback to window.onload, that will always work
        win[ADDEVENTLISTENER]( LOAD, completed, FALSE );

        // If IE event model is used
    } else {
        // Ensure firing before onload, maybe late but safe also for iframes
        doc[ATTACHEVENT]( ONREADYSTATECHANGE, completed );

        // A fallback to window.onload, that will always work
        win[ATTACHEVENT]( ONLOAD, completed );

        // If IE and not a frame
        // continually check to see if the document is ready
        try {
            top = win.frameElement == null && docElem;
        } catch(e) {}

        if ( top && top.doScroll ) {
            (function doScrollCheck() {
                if ( !isReady ) {
                    try {
                        // Use the trick by Diego Perini
                        // http://javascript.nwbox.com/IEContentLoaded/
                        top.doScroll("left");
                    } catch(e) {
                        return defer( doScrollCheck, 50 );
                    }

                    // detach all dom ready events
                    detach();

                    // and execute any waiting functions
                    ready();
                }
            })();
        }
    }

    function onDomReady( fn ) {
        // If DOM is ready, execute the function (async), otherwise wait
        isReady ? defer( fn ) : callbacks.push( fn );
    }

    // Add version
    onDomReady.version = "1.4.0";
    // Add method to check if DOM is ready
    onDomReady.isReady = function(){
        return isReady;
    };

    return onDomReady;
}));


/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (global, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else if (typeof define === "function" && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    factory(global.Mustache = {}); // <script>
  }
}(this, function (mustache) {

  var Object_toString = Object.prototype.toString;
  var isArray = Array.isArray || function (object) {
    return Object_toString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var RegExp_test = RegExp.prototype.test;
  function testRegExp(re, string) {
    return RegExp_test.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate(template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags(tags) {
      if (typeof tags === 'string')
        tags = tags.split(spaceRe, 2);

      if (!isArray(tags) || tags.length !== 2)
        throw new Error('Invalid tags: ' + tags);

      openingTagRe = new RegExp(escapeRegExp(tags[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tags[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tags[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context(view, parentContext) {
    this.view = view == null ? {} : view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function (name) {
    var cache = this.cache;

    var value;
    if (name in cache) {
      value = cache[name];
    } else {
      var context = this, names, index;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          while (value != null && index < names.length)
            value = value[names[index++]];
        } else if (typeof context.view == 'object') {
          value = context.view[name];
        }

        if (value != null)
          break;

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer() {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this._renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this._renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this._renderPartial(token, context, partials, originalTemplate);
      else if (symbol === '&') value = this._unescapedValue(token, context);
      else if (symbol === 'name') value = this._escapedValue(token, context);
      else if (symbol === 'text') value = this._rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype._renderSection = function (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender(template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype._renderInverted = function(token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype._renderPartial = function(token, context, partials) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null)
      return this.renderTokens(this.parse(value), context, partials, value);
  };

  Writer.prototype._unescapedValue = function(token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype._escapedValue = function(token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype._rawValue = function(token) {
    return token[1];
  };

  mustache.name = "mustache.js";
  mustache.version = "1.1.0";
  mustache.tags = [ "{{", "}}" ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  mustache.to_html = function (template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

}));


}).apply(okanjo);

/* jshint ignore:end */
//noinspection ThisExpressionReferencesGlobalObjectJS
(function(okanjo, window) {


    function OkanjoMetrics() {

        this.default_channel = this.channel.external;

        this._queue = [];

        var urlSid = okanjo.util.getPageArguments(true)[this.msid_key],
            cookieSid = okanjo.Cookie.get(this.msid_key);

        // If for some reason, both are set, replace the cookie with the uri value (# CORRELATION)
        if (urlSid && cookieSid && urlSid != cookieSid) {
            this.trackEvent(this.object_type.metric_session, this.event_type.correlation, {
                id: urlSid+"_"+cookieSid,
                ch: this.default_channel,
                _noProcess: true
            });
            okanjo.Cookie.set(this.msid_key, urlSid, this.msid_ttl);
        }

        this.sid = urlSid || cookieSid || null;

        this._lastKey = undefined;

        //// Track the page view, but don't send it right away.
        //// Send it in one full second unless something else pushes an event
        //// This way, we have a chance that the api key get set globally
        //if (!window._NoOkanjoPageView) {
        //    this.trackPageView({_noProcess:true});
        //    var self = this;
        //    setTimeout(function() {
        //        self._processQueue();
        //    }, 1000);
        //}
    }

    OkanjoMetrics.prototype = {

        msid_key: "ok_msid",
        msid_ttl: 1460,

        strip_meta: ['key','callback','metrics_channel_context','metrics_context','mode'],

        constructor: OkanjoMetrics,

        event_type: {
            view: 'vw',
            impression: 'imp',
            interaction: 'int',
            correlation: 'cor'
        },


        action: {
            click: "click",
            inline_click: "inline_click"
        },


        object_type: {
            page: 'pg',
            widget: 'wg',
            product: 'pr',
            store: 'st',
            cause: 'ca',
            marketplace: 'mp',
            order: 'or',
            order_item: 'oi',
            user: 'ur',
            metric_session: 'mt'
        },


        channel: {
            product_widget: 'pw',
            ad_widget: 'aw',
            store_widget: 'sw',
            marketplace: 'mp',
            external: 'ex'
        },


        environment: {
            live: "live",
            testing: "testing"
        },


        /**
         * Reports an event
         * @param {string} object_type
         * @param {string} event_type
         * @param {{key: string, ea: string, id: string, ch: string, cx: string, url: string, env: string, m: object }} data
         * @param callback
         */
        trackEvent: function(object_type, event_type, data, callback) {

            data = data || {};
            data.object_type = object_type;
            data.event_type = event_type;

            // Queue the event for publishing
            this.push(data, callback);
        },


        /**
         * Reports a page view
         * @param {{key: string, ea: string, id: string, ch: string, cx: string, url: string, env: string, m: object }} [data]
         * @param callback
         */
        trackPageView: function(data, callback) {

            data = data || {};

            // Set the current page URL as the object id
            data.id = data.id || window.location.href;

            // Set the context to external unless instructed otherwise
            data.ch = data.ch || this.default_channel;

            // Track the event
            this.trackEvent(this.object_type.page, this.event_type.view, data, callback);
        },


        /**
         * Sends an event
         * @param event
         * @param callback
         */
        track: function(event, callback) {

            if (!event || typeof event !== "object") { console.warn('[Okanjo.Metrics] event object data required'); return; }
            if (!event.object_type) { console.warn('[Okanjo.Metrics] object_type required'); return; }
            if (!event.event_type) { console.warn('[Okanjo.Metrics] event_type required'); return; }

            var object_type = event.object_type,
                event_type = event.event_type;

            delete event.object_type;
            delete event.event_type;

            // Stick the key in there, if not already set
            event.key = event.key || (event.m && event.m.key) || okanjo.key || this._lastKey || undefined;

            // Stick the publisher session token in there too, if present
            if (this.sid) {
                event.sid = this.sid;
            }

            // Clone the metadata, since it might be a direct reference to a widget property
            // Deleting properties on the meta object could be very destructive
            if (event.m) {
                var meta = {};
                for(var i in event.m) {
                    if (event.m.hasOwnProperty(i) && this.strip_meta.indexOf(i) < 0) {
                        meta[i] = event.m[i];
                    }
                }
                event.m = meta;
            }

            // Pass the page's source reference
            if (document.referrer) {
                event.ref = document.referrer;
            }

            // Make that key stick in case future events don't have an API key, we can get a fuzzy idea who's responsible for the event
            // This is also useful for auto page load events, were there is no key defined at time the event was created
            this._lastKey = event.key || this._lastKey || undefined;

            okanjo.exec(okanjo.getRoute(okanjo.routes.metrics, { object_type: object_type, event_type: event_type }), event, function(err, res) {
                if (err) { console.warn('[Okanjo.Metrics] Reporting failed', err, res); }

                /*jslint -W030 */
                callback && (callback(err, res));
            });

        },


        ///**
        // * Generates the full URL to execute to track the metric. Useful for page redirection instead of straight tracking
        // * @param object_type
        // * @param event_type
        // * @param data
        // * @return {*}
        // */
        //getMetricUrl: function(object_type, event_type, data) {
        //    return okanjo.JSONP.makeUrl({
        //        url: okanjo.getRoute(okanjo.routes.metrics, { object_type: object_type, event_type: event_type }),
        //        data: data
        //    });
        //},


        /**
         * Update the metric sid to live for 4 years if not present
         * @param sid
         */
        updateSid: function(sid) {
            if (!this.sid && sid) {
                this.sid = sid;
                okanjo.Cookie.set(this.msid_key, sid, this.msid_ttl);
            }
        },


        /**
         * Queues an event for publishing
         * @param event
         * @param callback
         */
        push: function(event, callback) {
            this._queue.push({ event: event, callback: callback });

            // Start burning down the queue, unless the event says not to
            if (event._noProcess) {
                delete event._noProcess;
            } else {
                this._processQueue();
            }
        },


        /**
         * Processes the event queue
         * @private
         */
        _processQueue: function() {
            // If the queue is not already being processed, and there's stuff to process, continue sending them
            if (!this._processTimeout && this._queue.length > 0) {
                var self = this;
                this._processTimeout = setTimeout(function() {

                    var item = self._queue.shift();
                    if (item === undefined) {
                        // Nothing in the queue, get outta here
                        self._processTimeout = null;
                    } else {
                        // Track the item
                        self.track(item.event, function(err, res) {

                            // Update / Set the metric sid on the publisher
                            if (res && res.data && res.data.sid) self.updateSid(res.data.sid);

                            // When the item is done being tracked, iterate to the next metric then fire it's callback if set
                            self._processTimeout = null;
                            self._processQueue();
                            /*jslint -W030 */
                            item.callback && item.callback(err, res);
                        });
                    }

                }, 0);
            }
        },


        /**
         * Injects the elements box rectangle coordinates and page size into the given data object
         * @param element
         * @param [data]
         * @return {*|{}}
         */
        includeElementInfo: function(element, data) {

            var page = okanjo.util.getPageSize(),
                size = okanjo.util.getElementPosition(element);

            data = data || {};
            data.pw = page.w;
            data.ph = page.h;
            data.x1 = size.x1;
            data.y1 = size.y1;
            data.x2 = size.x2;
            data.y2 = size.y2;

            return data;
        },


        /**
         * Injects the viewport rectangle coordinates into the given data object
         * @param data
         * @return {*|{}}
         */
        includeViewportInfo: function(data) {

            var vp = okanjo.util.getViewportSize(),
                pos = okanjo.util.getScrollPosition();

            data = data || {};

            data.vx1 = pos.x;
            data.vy1 = pos.y;
            data.vx2 = data.vx1+vp.vw;
            data.vy2 = data.vy1+vp.vh;

            return data;
        }

    };

    okanjo.metrics = new OkanjoMetrics();

})(okanjo, this);
//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(okanjo, window) {

    // Track the page view, but don't send it right away.
    // Send it in one full second unless something else pushes an event
    // This way, we have a chance that the api key will be set globally
    okanjo.metrics.trackPageView({_noProcess:true});
    setTimeout(function() {
        okanjo.metrics._processQueue();
    }, 1000);

})(okanjo || this);
//noinspection JSUnusedLocalSymbols,ThisExpressionReferencesGlobalObjectJS
(function(okanjo, window) {

    var d = document,
        addIfNotNull = function(list, params, label) {
            for (var i = 0; i < list.length; i++) {
                if (list[i] !== null) params.push(label + (i + 1) + '=' + encodeURIComponent(list[i]));
            }
        };

    okanjo.moat = {

        /**
         * Disable by default until testing is completed
         */
        enabled: true,

        /**
         * Insert a Moat Analytics tracker
         * @param [element] - The element to append to or leave blank to track the entire page
         * @param {{levels:Array,slicers:Array}} options – Moat levels and slicers to report on
         */
        insert: function(element, options) {
            if (okanjo.moat.enabled) {

                var b = element || d.getElementsByTagName('body')[0],
                    ma = d.createElement('script'),
                    uri = okanjo.moat.getTagUrl(options);

                if (uri) {
                    ma.type = 'text/javascript';
                    ma.async = true;
                    ma.src = uri;

                    b.appendChild(ma);
                }
            }
        },


        /**
         * Builds a Moat script tag URL based on the options received
         * @param {{levels:Array,slicers:Array}} options – Moat levels and slicers to report on
         * @returns {string}
         */
        getTagUrl: function(options) {
            if (options && options.levels && Array.isArray(options.levels) && options.slicers && Array.isArray(options.slicers)) {

                var moatParams = [],
                    moat = okanjo.config.moat;


                // Build config param string
                addIfNotNull(options.levels, moatParams, 'moatClientLevel');
                addIfNotNull(options.slicers, moatParams, 'moatClientSlicer');
                moatParams = moatParams.join('&');

                return '//js.moatads.com/' + moat.tag + '/moatad.js#' + moatParams;

            } else {
                console.warn(new Error('Invalid moat tag options'), options);
                return null;
            }
        }

    };

})(okanjo, this);
//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
/** Based on https://gist.github.com/mudge/5830382 **/
(function(okanjo, window) {

    var indexOf = function (haystack, needle) {
            return haystack.indexOf(needle);
        },

        /* Polyfill indexOf. */
        EventEmitter = function () {
            this.events = {};
        };

    EventEmitter.prototype.on = function (event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);
    };

    EventEmitter.prototype.removeListener = function (event, listener) {
        var idx;

        if (typeof this.events[event] === 'object') {
            idx = indexOf(this.events[event], listener);

            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }
    };

    EventEmitter.prototype.emit = function (event) {
        var i, listeners, length, args = [].slice.call(arguments, 1);

        if (typeof this.events[event] === 'object') {
            listeners = this.events[event].slice();
            length = listeners.length;

            for (i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    };

    EventEmitter.prototype.once = function (event, listener) {
        this.on(event, function g () {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        });
    };

    okanjo._EventEmitter = EventEmitter;
    return EventEmitter;

})(okanjo, this);
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
     * Injects a Moat tag into the widget, optionally into a specific element
     *
     * @param {{element:HTMLElement|null,levels:Array,slicers:Array}} options – Moat levels and slicers to report on
     */
    proto.trackMoat = function(options) {
        okanjo.moat.insert(options.element || this.element, options);
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
//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(okanjo, window) {

    /*

     div .modal-container .fade-out .hidden
     | div .modal-window .clearfix
     | |
     | | div .modal-window-skin
     | | | div .modal-window-outer
     | | | | div .modal-window-inner
     | | | | | iframe .okanjo-inline-buy-frame
     | | | | /div
     | | | /div
     | | /div
     | |
     | | div .close-button
     | | | ×
     | | /div
     | |
     | /div
     /div

     */

    var initialized = false,
        scrollY = null,
        isMobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false,

        // Selectors
        $html, $body, $modalContainer, $modalWindow, $modalSkin, $modalOuter, $modalInner, $modalClose, $modalFrame,

        createElements = function() {

            // Page elements
            //noinspection JSUnresolvedFunction
            $html = okanjo.qwery('html')[0];
            //noinspection JSUnresolvedFunction
            $body = okanjo.qwery('body')[0] || document.body;

            // Modal elements
            $modalContainer = document.createElement('div');
            $modalWindow = document.createElement('div');
            $modalSkin = document.createElement('div');
            $modalOuter = document.createElement('div');
            $modalInner = document.createElement('div');
            $modalClose = document.createElement('div');
            $modalFrame = document.createElement('iframe');

            $modalContainer.setAttribute('class', 'okanjo-modal-container okanjo-modal-hidden ' + okanjo.util.detectClasses().join(' '));
            $modalWindow.setAttribute('class', 'okanjo-modal-window');
            $modalSkin.setAttribute('class', 'okanjo-modal-window-skin');
            $modalOuter.setAttribute('class', 'okanjo-modal-window-outer');
            $modalInner.setAttribute('class', 'okanjo-modal-window-inner');
            $modalClose.setAttribute('class', 'okanjo-modal-close-button');

            $modalFrame.setAttribute('class', 'okanjo-inline-buy-frame');
            $modalFrame.setAttribute('frameborder', '0');
            $modalFrame.setAttribute('vspace', '0');
            $modalFrame.setAttribute('hspace', '0');
            $modalFrame.setAttribute('webkitallowfullscreen', '');
            $modalFrame.setAttribute('mozallowfullscreen', '');
            $modalFrame.setAttribute('allowfullscreen', '');
            $modalFrame.setAttribute('scrolling', 'auto');

            $modalClose.innerHTML = '×';

            // Create the modal element tree
            $modalInner.appendChild($modalFrame);
            $modalOuter.appendChild($modalInner);
            $modalSkin.appendChild($modalOuter);
            $modalWindow.appendChild($modalSkin);
            $modalWindow.appendChild($modalClose);
            $modalContainer.appendChild($modalWindow);

            // Add the modal stuff to the body
            $body.appendChild($modalContainer);
        },

        bindEvents = function() {

            // If the device orientation changes, adjust the modal view port
            addListener(window, 'orientationchange', function() {
                for (var t = 0; t < 2; t++) {
                    setTimeout(handleReposition, 1000 * t + 10);
                }
            });

            // If the window changes size, also adjust the modal view port
            addListener(window, 'resize', function() {
                setTimeout(handleReposition, 100);
            });

            // Click the overlay to close the modal
            addListener($modalContainer, 'click', closeModal);

            // If you click in the modal, don't close it!
            addListener($modalWindow, 'click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });

            // Click the close button to close it
            addListener($modalClose, 'click', function(e) {

                // Don't close it twice
                e.preventDefault();
                e.stopPropagation();

                closeModal();
            });

        },

        addListener = function(el, event, handler) {
            if (el.addEventListener) {
                el.addEventListener(event, handler, false);
            } else {
                el.attachEvent("on" + event, handler);
            }
        },

        //removeListener = function(el, event, handler) {
        //    if (el.removeEventListener) {
        //        el.removeEventListener(event, handler);
        //    } else {
        //        el.detachEvent("on" + event, handler);
        //    }
        //},

        addClass = function(el, name) {
            el.className += " " + name;
        },

        removeClass = function(el, name) {
            el.className = el.className.replace(new RegExp(' *?'+name), '');
        },

        getWindowHeight = function() {
            return window.innerHeight || document.documentElement.clientHeight;
        },

        handleReposition = function() {
            scrollY = okanjo.util.getScrollPosition().y;
            //$modalWindow.style.marginTop = scrollY + 40 + "px";
            $modalWindow.style.height = (getWindowHeight() - 80) + "px";
        },

        openModal = function() {

            scrollY = document.body.scrollTop;

            removeClass($modalContainer, 'okanjo-modal-hidden');
            addClass($modalContainer, 'okanjo-modal-fade-out');

            handleReposition();

            addClass($html, "okanjo-modal-active");

            if (!isMobile) {
                addClass($html, "okanjo-modal-margin-fix");
            }

            setTimeout(function() {
                removeClass($modalContainer, 'okanjo-modal-fade-out');
            }, 10);

            // Click the overlay to close the modal
            //addListener($body, 'click', closeModal);

        },

        closeModal = function() {
            addClass($modalContainer, 'okanjo-modal-fade-out');

            setTimeout(function() {
                removeClass($modalContainer, 'okanjo-modal-fade-out');
                addClass($modalContainer, "okanjo-modal-hidden");

                removeClass($html, "okanjo-modal-active");
                if (!isMobile) {
                    removeClass($html, "okanjo-modal-margin-fix");
                }
            }, 210);

            // Click the overlay to close the modal
            //removeListener($body, 'click', closeModal);
        },


        /**
         * Insert an element or markup into the modal
         * @param content
         */
        setContent = function(content) {

            // Remove existing content
            $modalInner.innerHTML = "";

            // Insert new content
            if (typeof content === "string") {
                $modalInner.innerHTML = content;
            } else {
                $modalInner.appendChild(content);
            }
        };


    // Expose the modal functions
    okanjo.modal = {

        show: function(content) {

            if (!initialized) {
                initialized = true;
                createElements();
                bindEvents();
            }

            setContent(content);
            openModal();
        },

        hide: function() {
            closeModal();
        }

    };

    return okanjo.modal;

})(okanjo, this);
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
            use_cache: true,
            cache_ttl: 60000
        };

        // Param to stop the URL nagging if none is given
        this.config.nag = config.nag === undefined ? true : config.nag === true;

        // Set default caching settings
        this.config.use_cache = config.use_cache === undefined ? true : config.use_cache === true;
        this.config.cache_ttl = config.cache_ttl === undefined ? 60000 : config.cache_ttl;
        this.use_cache = this.config.use_cache;
        this.cache_ttl = this.config.cache_ttl;

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

        // Set the metric context to the product mode, if not already set
        if (this.config.metrics_channel_context === null) {
            this.config.metrics_channel_context = this.config.mode;
        }
        
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
            okanjo.metrics.trackEvent(okanjo.metrics.object_type.widget, okanjo.metrics.event_type.impression, {
                ch: this.config.metrics_context, // pw or aw
                cx: this.config.metrics_channel_context || this.config.mode, // single, browse, sense | creative, dynamic
                m: okanjo.util.deepClone(this.config, okanjo.metrics.includeElementInfo(this.element))
            });
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
                self.element.innerHTML = okanjo.mvc.render(self.templates.product_error, self, { message: 'Could not retrieve products.' });
                self.emit('error', err);
            } else {
                // Store the products array locally
                self.items = res.data;
                self.numFound = res.numFound;

                // Allow hooks when the response returns from the server
                self.emit('data', res);

                // Render the products
                self.showProducts(self.items);

                if (self.use_cache) {
                    // Cache the products for next page load so something loads up right away until refreshed
                    var key = self.getCacheKey();
                    self.saveInCache(key, self.items);
                }

                // Allow hooks when the product widget finishes initialization
                self.emit('load', { fromCache: false });
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
        this.element.innerHTML = okanjo.mvc.render(this.templates.product_main, this, {
            products: data || this.items || [],
            config: this.config
        });

        this.bindEvents();
    };


    /**
     * Builds the final frame url to use, given the base, url, and params to tack on
     * @param base – Metric tracking URL
     * @param inline – Inline buy URL
     * @param params – Additional params to tack on to the inline buy URL
     * @returns {string} – Final frame url
     */
    function makeFrameUrl(base, inline, params) {

        var pairs = [],
            i,
            joiner = (inline.indexOf('?') < 0 ? '?' : '&');

        for (i in params) {
            if (params.hasOwnProperty(i)) {
                pairs.push(i+"="+encodeURIComponent(params[i]));
            }
        }

        return base + "&n="+(new Date()).getTime()+"&u=" + encodeURIComponent(inline + (pairs.length > 0 ? (joiner + pairs.join('&')) : ""));
    }


    /**
     * Handle user interaction with the product tile
     * @param e – User interaction DOM event
     * @param trigger – Whether to trigger the click event or not on the link
     */
    Product.interactTile = function(e, trigger) {

        var inline = this.getAttribute('data-inline-buy-url'),
            expandable = this.getAttribute('data-expandable'),
            nativeBuy = !okanjo.util.empty(inline),
            doPopup = okanjo.util.isMobile() && nativeBuy,
            url = this.getAttribute('href'),
            inlineParams = {},
            expanded = false,

            // Get positional data
            meta = { m: okanjo.metrics.includeViewportInfo(okanjo.metrics.includeElementInfo(this))},
            id = this.getAttribute('id'),
            buyUrl = this.getAttribute('data-buy-url'),
            metricUrl = this.getAttribute('data-metric-url') + '&sid=' + okanjo.metrics.sid + '&' + okanjo.JSONP.objectToURI(meta),
            modifiedBuyUrl = buyUrl + (buyUrl.indexOf('?') < 0 ? '?' : '&') + "ok_msid=" + okanjo.metrics.sid,
            modifiedInlineBuyUrl = inline + (inline.indexOf('?') < 0 ? '?' : '&') + "ok_msid=" + okanjo.metrics.sid;


        // Show a new window on applicable devices instead of a native buy experience
        if (doPopup) {

            //
            // Mobile devices (especially iOS) have real janky UX when interacting with iframes.
            // So, we'll choose to popup a window with the native buy experience, so we can ensure
            // a positive user experience. Nobody likes bouncy form fields and really weird zooming.
            //

            // Tell the buy experience that we're loading up in a popup, so they can render that nicely
            metricUrl += '&ea='+okanjo.metrics.action.inline_click + "&m[popup]=true";
            url = makeFrameUrl(metricUrl, modifiedInlineBuyUrl, { popup: 1 });

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
                // If it fails to do so, then resort to a modal, since expandable was set not on an ad, derp.
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

            metricUrl += '&ea='+okanjo.metrics.action.inline_click + '&m[expandable]=' + (inlineParams.expandable === 1 ? 'true' : 'false');
            url = makeFrameUrl(metricUrl, modifiedInlineBuyUrl, inlineParams);

            frame.src = url;

            if (!expanded) {
                okanjo.modal.show(frame);
            }

        } else if (trigger) {
            metricUrl += '&ea='+okanjo.metrics.action.click;
            this.href = makeFrameUrl(metricUrl, modifiedBuyUrl, {});
            this.click();
        } else {
            metricUrl += '&ea='+okanjo.metrics.action.click;
            this.href = makeFrameUrl(metricUrl, modifiedBuyUrl, {});
        }
    };


    /**
     * Binds event listeners to the anchor elements in the product widgets
     */
    proto.bindEvents = function() {

        var self = this;

        //noinspection JSUnresolvedFunction
        okanjo.qwery('a', this.element).every(function(a) {

            if(a.addEventListener) {
                a.addEventListener('click', Product.interactTile);
            } else {
                a.attachEvent('onclick', function(e) { Product.interactTile.call(a, e); });
            }

            // Only stick moat on the product widget if *not* embedded in another widget
            if (self.config.metrics_context == okanjo.metrics.channel.product_widget) {

                // Track product impression
                okanjo.metrics.trackEvent(okanjo.metrics.object_type.product, okanjo.metrics.event_type.impression, {
                    id: a.getAttribute('data-id'),
                    ch: self.config.metrics_context, // pw or aw
                    cx: self.config.metrics_channel_context || self.config.mode, // single, browse, sense | creative, dynamic
                    m: okanjo.util.deepClone(self.config, okanjo.metrics.includeElementInfo(a.parentNode))
                });

                self.trackMoat({
                    element: a,
                    levels: [
                        self.config.key,
                        self.config.metrics_context,
                        a.getAttribute('data-id')
                    ],
                    slicers: [
                        window.location.hostname + window.location.pathname
                    ]
                });
            }

            return true;
        });

        // Show ellipses on title text that doesn't quite fit
        okanjo.qwery('.okanjo-product-title', this.element).every(function(t) {
            okanjo.util.ellipsify(t);
            return true;
        });

    };

    okanjo.Product = Product;
    return Product;

})(okanjo, this);
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
return okanjo;
}));
