
/**
 * index.js
 * @type {okanjo|*}
*/
    var okanjo = okanjo || window.okanjo || (function(ok) {


        //noinspection JSValidateTypes
        var supportPageOffset = window.pageXOffset !== undefined,
            isCSS1Compatible = ((document.compatMode || "") === "CSS1Compat"),
            noop = function(){},
            okanjo = {

                // Override these later
                qwery: noop,


                /**
                 * Placeholder, just in case okanjo-js is built without metrics
                 */
                metrics: {
                    trackEvent: noop,
                    trackPageView: noop
                },

                /**
                 * Placeholder, just in case okanjo-js is built without moat
                 */
                moat: { insert: noop },

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
                        return (val || "").replace(/^\s+|\s+$/g, '');
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
                        if (str.length === 0) return ""+hash;
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
                            var attrs = element.attributes;
                            for(var i = attrs.length - 1; i >= 0; i--) {
                                if (attrs[i].name.indexOf('data-') === 0) {
                                    data[attrs[i].name.substr(5)] = attrs[i].value;
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
                    },

                    /*! https://github.com/isaacs/inherits/blob/master/inherits_browser.js */
                    /**
                     * Extends an object from another
                     * @param ctor – Child class
                     * @param superCtor – Parent class
                     */
                    inherits: function inherits(ctor, superCtor) {
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
                    },


                    /**
                     * Gets the current page's scroll position
                     * @returns {{x: Number, y: Number}}
                     */
                    getScrollPosition: function() {
                        return {
                            x: supportPageOffset ? window.pageXOffset : isCSS1Compatible ? document.documentElement.scrollLeft : document.body.scrollLeft,
                            y: supportPageOffset ? window.pageYOffset : isCSS1Compatible ? document.documentElement.scrollTop : document.body.scrollTop
                        };
                    },


                    /**
                     * Return various browser detections
                     * @returns {Array}
                     */
                    detectClasses: function() {
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
                    }

                }

            };

        // Merge properties on existing okanjo object if exists
        if (ok) {
            for(var i in okanjo) {
                //noinspection JSUnfilteredForInLoop
                if (!ok.hasOwnProperty(i)) {
                    //noinspection JSUnfilteredForInLoop
                    ok[i] = okanjo[i];
                }
            }
            return ok;
        }

        return okanjo;

    })(okanjo || window.okanjo);



