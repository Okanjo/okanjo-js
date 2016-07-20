
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
        okanjo.version = "%%OKANJO_VERSION";

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



