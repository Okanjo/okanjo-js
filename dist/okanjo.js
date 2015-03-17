(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.okanjo = factory();
  }
}(this, function() {

/**
 * index.js
 * @type {okanjo|*}
*/
    var okanjo = okanjo || (function() {

        var okanjo = {

            /**
             * Placeholder, just in case okanjo-js is built without metrics
             */
            metrics: {
                trackEvent: function() {},
                trackPageView: function() {}
            },

            /**
             * API route definitions
             */
            routes: {
                products: '/products',
                products_id: '/products/:product_id',
                products_sense: '/products/sense'
            },


            /**
             * Compiles a route and parameters into a final URL
             * @param route – The route to use (e.g. okanjo.routes.products )
             * @param [params] - Optional route parameters
             * @returns {*}
             */
            getRoute: function(route, params) {
                if (params) {
                    for (var i in params) {
                        if (params.hasOwnProperty(i)) {
                            route = route.replace(":"+i, params[i] + "");
                        }
                    }
                }
                return okanjo.config.ads.apiUri + route;
            },


            /**
             * Execute a JSONP request
             * @param {string} url – Request URL
             * @param {*} data – Request data
             * @param {function(err:*, res:*)} callback – Closure to fire when completed
             */
            exec: function(url, data, callback) {
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
            },


            /**
             * Report a message or error back to Okanjo
             * @param {string} context – What module is responsible for emitting the error (e.g. Product)
             * @param {string|Error} mixed – The message or Error to report
             */
            report: function(context, mixed) {
                // REPORT THIS BACK TO OKANJO!
                var error;
                if (typeof mixed === "string") {
                    error = new Error('[Okanjo' + (context ? ' ' + context : '') + '] ' + mixed);
                } else if (typeof mixed === "object" && mixed instanceof Error) {
                    error = mixed;
                }

                console.error(error);
                //TODO - integrate with Raven
            },


            /**
             * Utility functions
             */
            util: {

                /**
                 * Trims leading and trailing whitespace on a string
                 * @param val
                 */
                trim: function(val) {
                    (val || "").replace(/^\s+|\s+$/g, '');
                },


                /**
                 * Function to test whether the given var has a value
                 * @param val - The var to check
                 * @returns {boolean} - True when the var has value, false when it does not
                 */
                empty: function (val) {
                    return (val === null || val === undefined || (typeof val === "string" && okanjo.util.trim(val) === ""));
                },

                /**
                 * Helper to shallow clone an object so we don't ruin the top-level object reference
                 * Note: If the shallow keys are objects, the references to the keyed objects will be maintained!
                 *
                 * @param {*} obj – Source object to copy
                 * @returns {{}} – Shallow clone of the object
                 */
                clone: function (obj) {
                    var clone = {};
                    obj = obj || {};
                    for (var k in obj) {
                        if (obj.hasOwnProperty(k)) {
                            clone[k] = obj[k];
                        }
                    }
                    return clone;
                },


                /**
                 * Super simple hashing algorithm
                 * @see http://jsperf.com/hashing-strings
                 * @param str - String to hash
                 * @returns {string}
                 */
                hash: function(str) {
                    var hash = 0;
                    if (str.length === 0) return hash;
                    for (var i = 0; i < str.length; i++) {
                        var char = str.charCodeAt(i);
                        hash = ((hash<<5)-hash)+char;
                    }

                    return hash.toString(16).replace(/^-/, 'n');

                },


                /**
                 * Instead of using HTML5 dataset, just rip through attributes and return data attributes
                 * @param element
                 * @returns {{}}
                 */
                data: function (element) {
                    var data = {};
                    if (element) {
                        if (element.hasAttributes()) {
                            var attrs = element.attributes;
                            for(var i = attrs.length - 1; i >= 0; i--) {
                                if (attrs[i].name.indexOf('data-') === 0) {
                                    data[attrs[i].name.substr(5)] = attrs[i].value;
                                }
                            }
                        }
                    }
                    return data;
                },


                /**
                 * Copies a value to the target if the source contains it
                 * @param {*} target – The destination object
                 * @param {*} source – The source object
                 * @param {string} targetKey – The destination key name
                 * @param {string} [sourceKey] – The source key name, if different
                 * @param {{stripEmpty:boolean}} [options] – Copy options, e.g. strip empty values
                 */
                copyIfSet: function(target, source, targetKey, sourceKey, options) {
                    sourceKey = sourceKey || targetKey;
                    options = options || { };

                    function doCopy(sourceKey) {
                        if (source && source[sourceKey] !== undefined && (!options.stripEmpty || !okanjo.util.empty(source[sourceKey]))) {
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
                },


                /**
                 * Copies a mapping of target-source from source to target
                 * @param {*} target – The destination object
                 * @param {*} source – The source object
                 * @param {*} map – The mapping of targetKey => sourceKey (null if same)
                 * @param {{stripEmpty:boolean}} [options] – Copy options, e.g. strip empty values
                 */
                copyIfSetMap: function(target, source, map, options) {
                    var keys = Object.keys(map);
                    for(var k = 0; k < keys.length; k++) {
                        okanjo.util.copyIfSet(target, source, keys[k], map[keys[k]], options);
                    }
                }

            }


        };

        /*! https://github.com/isaacs/inherits/blob/master/inherits_browser.js */
        if (typeof Object.create === 'function') {
            // implementation from standard node.js 'util' module
            okanjo.util.inherits = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            };
        } else {
            // old school shim for old browsers
            okanjo.util.inherits = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function () {};
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor();
                ctor.prototype.constructor = ctor;
            };
        }

        return okanjo;

    })();






    okanjo.config = {

        // okanjo-ads api key
        key: undefined,

        marketplace: {
            uri: 'https://shop.okanjo.com',
            apiUri: 'https://api.okanjo.com',
            routerUri: 'https://shop.okanjo.com/widgets/router/',
            balancedMarketplacePath: '/v1/marketplaces/MP6vnNdXY7izEEVPs1gl7jSy',
            socketIOUri: 'https://mke-rt.okanjo.com:13443',
            analyticsId: 'UA-36849843-1'
        },

        ads: {
            apiUri: 'https://ads-api.okanjo.com'
        }
    };

    /**
     * Override the default production configuration
     * @param options
     */
    okanjo.configure = function(options) {

        // Merge keys
        Object.keys(options).every(function(root) {
            if (okanjo.config[root] && typeof okanjo.config[root] === "object" && typeof options[root] === "object") {
                Object.keys(options[root]).every(function(key) {
                    okanjo.config[root][key] = options[root][options[key]];
                    return true;
                });
            } else {
                okanjo.config[root] = options[root];
            }
            return true;
        });


    };

//noinspection JSUnusedLocalSymbols
(function(okanjo, window) {

    var TemplateEngine = okanjo.TemplateEngine = function TemplateEngine(options) {
        options = options || { templates: {}, css: {} };
        this._templates = options.templates || {};
        this._css = options.css || {};
    };

    TemplateEngine.prototype = {

        constructor: TemplateEngine,

        /**
         * Register a template
         * @param {string} name – Template name
         * @param {string} template - Template markup string
         * @param {function(data:*):*} [viewClosure] – Optional data manipulation closure
         * @param {*} [options] – Optional hash of template options, e.g. css: [ 'name1', 'name2' ]
         */
        registerTemplate: function(name, template, viewClosure, options) {
            // Example template:
            // {{title}} spends {{calc}}

            if (typeof template === "object") {
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
                var css = this._css[name],
                    id = css.markup.nodeType === undefined ? css.options.id || "okanjo-css-" + name : null; // If it's a DOM element, just forget it cuz it's already on the page

                // Check for css element on page, if we have an ID to look for
                if (id) {
                    var elements = okanjo.qwery('#' + id);
                    if (elements.length === 0) {
                        var head = okanjo.qwery('head'),
                            style = document.createElement('style');
                        style.id = id;
                        style.innerHTML = css.markup;
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
            }

        },


        /**
         * Renders a template with the given data
         *
         * @param {string} templateName – The template name to render
         * @param {*} data – Data to pass into the controller
         * @param {*} [options] – Optional settings object to pass into the controller closure
         * @returns {*}
         */
        render: function(templateName, data, options) {

            options = options || {};
            var template = this._templates[templateName],
                view = data;

            // If there's a data controller closure set, and if so, run the data through there
            if (template.viewClosure) {
                view = template.viewClosure(data, options);
            }

            // Attach globals
            view.okanjoConfig = okanjo.config;
            view.now = function() { return (new Date()).getTime(); };

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
             * @param {*|[]} mixed – Product or an array of product objects
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
                    mixed.escaped_buy_url = encodeURIComponent(mixed.buy_url);
                    mixed.price = this.currency(mixed.price);
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
    (function(c, w) {

        var document = w.document || { cookie: '' };

        c.Cookie = {
            set: function(cookieName, value, expireDays) {
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + expireDays);
                var cookieValue = encodeURI(value) + ((!expireDays) ? "" : "; expires=" + expireDate.toUTCString() + "; path=/");
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

    /**! Array.every polyfill | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every */
    if (!Array.prototype.every) {
        Array.prototype.every = function (callbackfn, thisArg) {
            'use strict';
            var T, k;
            // jshint -W041
            if (this == null) {  // jshint +W041
                throw new TypeError('this is null or not defined');
            }

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


(function() {
  var JSONP, computedUrl, createElement, encode, noop, objectToURI, random, randomString;

  createElement = function(tag) {
    return window.document.createElement(tag);
  };

  encode = window.encodeURIComponent;

  random = Math.random;

  JSONP = function(options) {
    var callback, done, head, params, script;
    options = options ? options : {};
    params = {
      data: options.data || {},
      error: options.error || noop,
      success: options.success || noop,
      beforeSend: options.beforeSend || noop,
      complete: options.complete || noop,
      url: options.url || ''
    };
    params.computedUrl = computedUrl(params);
    if (params.url.length === 0) {
      throw new Error('MissingUrl');
    }
    done = false;
    if (params.beforeSend({}, params) !== false) {
      callback = params.data[options.callbackName || 'callback'] = 'jsonp_' + randomString(15);
      window[callback] = function(data) {
        params.success(data, params);
        params.complete(data, params);
        try {
          return delete window[callback];
        } catch (_error) {
          window[callback] = void 0;
          return void 0;
        }
      };
      script = createElement('script');
      script.src = computedUrl(params);
      script.async = true;
      script.onerror = function(evt) {
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
          return script = null;
        }
      };
      head = head || window.document.getElementsByTagName('head')[0] || window.document.documentElement;
      return head.insertBefore(script, head.firstChild);
    }
  };

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

  randomString = function(length) {
    var str;
    str = '';
    while (str.length < length) {
      str += random().toString(36)[2];
    }
    return str;
  };

  objectToURI = function(obj) {
    var data, key, value;
    data = [];
    for (key in obj) {
      value = obj[key];
      data.push(encode(key) + '=' + encode(value));
    }
    return data.join('&');
  };

  if ((typeof define !== "undefined" && define !== null) && define.amd) {
    define(function() {
      return JSONP;
    });
  } else if ((typeof module !== "undefined" && module !== null) && module.exports) {
    module.exports = JSONP;
  } else {
    this.JSONP = JSONP;
  }

}).call(this);

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
(function(okanjo, window) {

    var metrics = okanjo.metrics = {

        _trackers: {},

        _gaq: [],

        events: {},

        addGoogleTracker: function(id, prefix) {
            var _gaq = window._gaq || metrics._gaq;

            if (!prefix) {
                prefix = 'tracker_' + metrics._trackers.length;
            }

            _gaq.push(function() {
                window._gat._createTracker(id, prefix);
            });

            _gaq.push([prefix+'._setDomainName', window.location.host]);
            _gaq.push([prefix+'._setAllowLinker', true]);
        },


        addDefaultTracker: function(prefix) {
            metrics.addTracker(prefix, function(event_data) {

                // Ensure event type
                if(typeof event_data.type === 'undefined') {
                    event_data.type = 'event';
                }

                // Push the tracker
                (window._gaq || metrics._gaq).push([prefix+'.'+(event_data.type == 'pageview' ? '_trackPageview' : '_trackEvent')].concat(event_data.args));
            });
        },


        addTracker: function(name, tracker) {
            metrics._trackers[name] = tracker;
        },


        trackEvent: function() {
            metrics.track({
                'type' : 'event',
                'args' : arguments
            });
        },


        trackPageView: function() {
            this.track({
                'type' : 'pageview',
                'args' : arguments
            });
        },


        track: function(event_data) {
            for(var prefix in metrics._trackers) {
                if(metrics._trackers.hasOwnProperty(prefix)) {
                    metrics._trackers[prefix](event_data);
                }
            }
        }

    };

    (function configure() {
        if (!document.getElementById('#okanjo-metrics')) {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            ga.id = 'okanjo-metrics';

            okanjo.qwery('body')[0].appendChild(ga);
            metrics.addGoogleTracker(okanjo.config.analyticsId, 'okanjo');
        }

        metrics.addDefaultTracker('okanjo');
    })();

})(okanjo, this);
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

            console.log('key', this.key);

            // Parse the final widget instance configuration
            this.parseConfiguration();

            console.log('key after', this.key);

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
                ok.report('Product', e);
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
return okanjo;
}));
