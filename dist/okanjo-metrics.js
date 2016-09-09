/*! okanjo-metrics.js v0.8.4 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
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

        // Override version with this version
        okanjo.version = "0.8.4";

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

                if (!document.body.contains(el)) {
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
            var doc = document,
                win = window,
                el = (doc.compatMode && doc.compatMode === 'CSS1Compat') ? doc.documentElement : doc.body,
                width = el.clientWidth,
                height = el.clientHeight,
                inWidth = win.innerWidth || 0,
                inHeight = win.innerHeight || 0,
                mobileZoom = (inWidth && width > inWidth) || (inHeight && height > inHeight);

            return {
                vw: mobileZoom ? inWidth : width,
                vh: mobileZoom ? inHeight : height
            };
        };


        /**
         * Gets the x, y location of the event relative to the page
         * @param e – Event
         * @return {{ex: number, ey: number}}
         */
        util.getEventPosition = function(e) {
            var ex = e.pageX,
                ey = e.pageY,
                doc = document,
                body = doc.body,
                el = doc.documentElement,
                scrollLeft = 'scrollLeft',
                scrollTop = 'scrollTop';
            return {
                ex: ex === undefined ? e.clientX + body[scrollLeft] + el[scrollLeft] : ex,
                ey: ey === undefined ? e.clientY + body[scrollTop] + el[scrollTop] : ey
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

        /**
         * Flattens a multi-dimensional object into a single object
         * @param obj
         * @return {{}}
         */
        util.flatten = function (obj) {
            var toReturn = {}, flatObject, x, i;

            for (i in obj) {
                if (!obj.hasOwnProperty(i)) continue;

                // Convert object ids to hex strings
                if (Array.isArray(obj[i])) {
                    toReturn[i] = obj[i];
                } else if ((typeof obj[i]) == 'object') {
                    flatObject = util.flatten(obj[i]);
                    for (x in flatObject) {
                        if (!flatObject.hasOwnProperty(x)) continue;
                        toReturn[i + '_' + x] = flatObject[x];
                    }
                } else {
                    toReturn[i] = obj[i];
                }
            }
            return toReturn;
        };

        /*! based on shortid https://github.com/dylang/shortid */
        util.shortid = (function(clusterWorkerId) {

            var shuffled = 'ylZM7VHLvOFcohp01x-fXNr8P_tqin6RkgWGm4SIDdK5s2TAJebzQEBUwuY9j3aC',

                crypto = typeof require !== 'undefined' ? require('crypto') : (window.crypto || window.msCrypto),

                randomByte = function() {
                    if (crypto && crypto.randomBytes) {
                        return crypto.randomBytes(1)[0] & 0x30;
                    } else if (!crypto || !crypto.getRandomValues) {
                        return Math.floor(Math.random() * 256) & 0x30;
                    }

                    var dest = new Uint8Array(1);
                    crypto.getRandomValues(dest);
                    return dest[0] & 0x30;
                },

                encode = function(number) {
                    var loopCounter = 0,
                        done,
                        str = '';

                    while (!done) {
                        str = str + shuffled[ ( (number >> (4 * loopCounter)) & 0x0f ) | randomByte() ];
                        done = number < (Math.pow(16, loopCounter + 1 ) );
                        loopCounter++;
                    }
                    return str;
                },

            // Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
            // This number should be updated every year or so to keep the generated id short.
            // To regenerate `new Date() - 0` and bump the version. Always bump the version!

                REDUCE_TIME = 1458848907498,
                version = 6,
                counter,
                previousSeconds;
            clusterWorkerId = clusterWorkerId || 0;

            return function() {
                var str = '',
                    seconds = Math.floor(((new Date()).getTime() - REDUCE_TIME) * 0.001);

                if (seconds === previousSeconds) {
                    counter++;
                } else {
                    counter = 0;
                    previousSeconds = seconds;
                }

                str = str + encode(version) + encode(clusterWorkerId);
                if (counter > 0) {
                    str = str + encode(counter);
                }
                str = str + encode(seconds);

                return str;
            };
        })();


        function splitArguments(query) {
            var params = {},
                ampSplit = query.split('&'),
                i = 0,
                temp, key, value, eqIndex;
            for ( ; i < ampSplit.length; i++) {
                try {
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
                } catch(e) {
                    //noinspection JSUnusedAssignment
                    console.error('[Okanjo] Failed to parse URL parameter:', temp, e);
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
    (function (win) {
        'use strict';
        var con = win.console || {},
            prop, method,
            empty = {},
            dummy = function() {},
            properties = 'memory'.split(','),
            methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
            'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
            'time,timeEnd,trace,warn').split(',');
        win.console = con;
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
    })(this || {});

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



}).apply(okanjo);

/* jshint ignore:end */
//noinspection ThisExpressionReferencesGlobalObjectJS
(function(okanjo, window) {


    function OkanjoMetrics() {

        this.default_channel = this.channel.external;

        this._queue = [];

        // Generate a page id
        this.pageId = okanjo.util.shortid();

        var pageArgs = okanjo.util.getPageArguments(true),
            urlSid = pageArgs[this.msid_key],
            cookieSid = okanjo.Cookie.get(this.msid_key),
            sourceContext = pageArgs[this.source_cx],
            sourceChannel = pageArgs[this.source_ch];

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
        this.sourceCh = sourceChannel || null;
        this.sourceCx = sourceContext || null;

        this._lastKey = undefined;
    }

    OkanjoMetrics.prototype = {

        msid_key: "ok_msid",
        source_cx: "ok_cx",
        source_ch: "ok_ch",
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
            thirdparty_ad: 'ta',
            cart: 'ct',
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

            // Make the key stick in case future events don't have an API key, we can get a fuzzy idea who's responsible for the event
            // This is also useful for auto page load events, were there is no key defined at time the event was created
            this._lastKey = data.key || data.key || (data.m && data.m.key) || okanjo.key || this._lastKey || undefined;

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

            this.normalizeEventData(event);

            okanjo.exec(okanjo.getRoute(okanjo.routes.metrics, { object_type: object_type, event_type: event_type }), event, function(err, res) {
                if (err) { console.warn('[Okanjo.Metrics] Reporting failed', err, res); }

                /*jslint -W030 */
                callback && (callback(err, res));
            });

        },

        /**
         * Normalizes event data for consistency and adds common information to the event
         * @param event
         */
        normalizeEventData: function(event) {

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
            } else {
                event.m = {};
            }


            // If we were referred through a particular channel/context, then hold on to that for events emitted by this page
            if (this.sourceCh || this.sourceCx) {
                if (this.sourceCh) { event.m.ref_ch = this.sourceCh; }
                if (this.sourceCx) { event.m.ref_cx = this.sourceCx; }
            }

            // Automatically attach page load id
            event.m.pgid = this.pageId;

            // Automatically attach JS build version
            event.m.ok_ver = okanjo.version;

            // Pass the page's source reference
            if (document.referrer) {
                event.ref = document.referrer;
            }
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
        },

        /**
         * Injects the event information into the given data object
         * @param event
         * @param data
         * @return {*|{}}
         */
        includeEventInfo: function(event, data) {
            var pos = okanjo.util.getEventPosition(event);
            data.ex = pos.ex;
            data.ey = pos.ey;
            return data;
        },

        /**
         * Copies a config object and another thing and flattens it
         * @param config
         * @param base
         * @return {{}|*}
         */
        copy: function(config, base) {
            return okanjo.util.flatten(okanjo.util.deepClone(config, base));
        },

        /**
         * Ensure that all parameters are less than the data limit
         * @param data
         * @return {*}
         */
        truncate: function(data) {
            for(var i in data) {
                if (data.hasOwnProperty(i) && typeof data[i] === "string") {
                    data[i] = data[i].substr(0, 255);
                }
            }
            return data;
        }
    };

    okanjo.metrics = new OkanjoMetrics();

})(okanjo, this);

return okanjo;
}));
