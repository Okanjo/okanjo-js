"use strict";

/* exported okanjo */

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
/**
 * Okanjo widget framework namespace
 * @global okanjo
 */
const okanjo = (function(window, document) { // eslint-disable-line no-unused-vars

    //region Constants

    // Environment Vars
    const SUPPORTS_PAGE_OFFSET = window.pageXOffset !== undefined;
    const CSS1_COMPATIBLE = (document.compatMode || /* istanbul ignore next: out of scope */ "") === "CSS1Compat";
    const AGENT = window.navigator.userAgent;
    const ELLIPSIFY_PATTERN = /[\s\S](?:\.\.\.)?$/;
    const MOBILE_PATTERN = /(iPhone|iPad|iPod|Android|blackberry)/i;
    const NOOP = () => {};
    const Console = window.console;

    // Place to pull defaults, if already set
    const settings = window.okanjo || {};

    //endregion

    //region Okanjo Core


    //noinspection JSValidateJSDoc,JSClosureCompilerSyntax - idk phpStorm generated it so why would it be wrong? :P
    /**
     * Okanjo namespace
     * @global
     * @type {{version: string, metrics: null, key: null, report: ((...p1?:*[])), warn: ((p1?:*, ...p2?:*[])), qwery: ((p1?:*, p2?:*))}}
     */
    const okanjo = {

        /**
         * Okanjo version
         */
        version: "%%OKANJO_VERSION",

        /**
         * Placeholder
         */
        metrics: null,

        /**
         * Global/default placement key
         */
        key: settings.key || null,

        /**
         * Reports an error to the console and possibly Raven in the future
         * @param args
         */
        report: (...args) => {
            let err = args.find((arg) => arg instanceof Error);
            if (!err) {
                let messageIndex = args.findIndex((arg) => typeof arg === "string");
                err = new Error(args[messageIndex] || "Okanjo Error");
                if (messageIndex >= 0) args.splice(messageIndex, 1);
            } else {
                // Grow our own stack so we can figure out what async thing did it
                let stack = (new Error()).stack.split('\n');
                stack.shift();
                stack.shift();
                args.push({ reportStack: stack.join('\n') });
                args = args.filter((a) => a !== err);
            }

            Console.error(`[Okanjo v${okanjo.version}]: ${err.stack}`);
            args.length && Console.error.apply(Console, ['Additional information:'].concat(args));

            // TODO - integrate with Raven
        },

        /**
         * Warn developers of their misdeeds
         * @param message
         * @param args
         */
        warn: (message, ...args) => {
            const err = new Error(message);

            Console.warn(`[Okanjo v${okanjo.version}]: ${err.stack}`);
            args.length && Console.warn.apply(Console, ['Additional information:'].concat(args));
        },

        // Backwards compatibility when we shipped with qwery, cuz querySelector[All] wasn't mainstream enough
        qwery: (selector, parent) => {

            // If parent is a selector, select the parent first!
            if (typeof parent === "string") {
                parent = document.querySelector(parent);

                // If parent is not found, there are obviously no results
                if (!parent) return [];
            }

            if (!parent) parent = document;

            return parent.querySelectorAll(selector);
        }
    };

    //endregion

    //region Vendor Libs

    /**
     * Placeholder for where vendor libraries get no-conflict loaded
     * @type {{}}
     */
    okanjo.lib = {};

    //endregion

    //region Networking

    /**
     * Networking methods
     * @type {{getRoute: *, exec: *}}
     */
    okanjo.net = {

        /**
         * API Endpoints
         */
        endpoint: 'https://api2.okanjo.com',
        sandboxEndpoint: 'https://sandbox-api2.okanjo.com',

        /**
         * API routes
         */
        routes: {
            ads: '/content',
            metrics: '/metrics/:object_type/:event_type',
            metrics_batch: '/metrics'
        },

        /**
         * Compiles a route and parameters into a final URL
         * @param {string} route - Route constant
         * @param {*} [params] - Key value hash
         * @param {*} [env] - Optional environment to use instead of live
         * @return {string} - Route
         */
        getRoute: (route, params, env) => {
            if (params) {
                Object.keys(params).forEach((key) => {
                    route = route.replace(`:${key}`, params[key]+"");
                });
            }
            env = env || okanjo.env || 'live';
            return (env === 'sandbox' ? okanjo.net.sandboxEndpoint : okanjo.net.endpoint) + route;
        },

        // placeholder, xhr request extension
        request: NOOP
    };

    //endregion

    // region Utilities

    //noinspection JSClosureCompilerSyntax,JSValidateJSDoc
    /**
     * Utility functions and helpers
     * @type {{isEmpty: ((p1?:*)=>boolean), isMobile: (()), getPageArguments: ((p1:boolean))}}
     */
    okanjo.util = {

        /**
         * Checks whether a value is _really_ empty (trims)
         * @param val
         * @return {boolean}
         */
        isEmpty: (val) => val === null || val === undefined || (typeof val === "string" && val.trim().length === 0),

        /**
         * Checks if the current user agent identifies as a mobile device
         * @returns {boolean}
         */
        isMobile: () => {
            // KludgyAF™, but let's go with it
            return MOBILE_PATTERN.test(AGENT);
        },

        /**
         * Returns an object hashmap of query and hash parameters
         * @param {boolean} includeHashArguments - Whether to include the hash arguments, if any
         * @return {*}
         */
        getPageArguments: (includeHashArguments) => {

            const split = (query) => {
                query = query || "";
                const params = {};
                const parts = query.split('&');
                parts.forEach((part) => {
                    const eqIndex = part.indexOf('=');
                    let key, value;
                    if (eqIndex < 0) {
                        key = decodeURIComponent(part);
                        value = null;
                    } else {
                        key = decodeURIComponent(part.substring(0, eqIndex));
                        value = decodeURIComponent(part.substring(eqIndex + 1));
                    }
                    if (key) params[key] = value;
                });
                return params;
            };

            const queryArgs = split(window.location.search.substring(window.location.search.indexOf('?') + 1));
            const hashArgs = includeHashArguments ? split(window.location.hash.substring(Math.max(window.location.hash.indexOf('#') + 1, window.location.hash.indexOf('#!') + 2))) : {};
            Object.keys(hashArgs).forEach((key) => queryArgs[key] = hashArgs[key]);

            return queryArgs;
        }

    };

    /**
     * Deep clones an object by breaking references, unlike Object.assign
     * @param mixed – Source to clone (object, array, value)
     * @param [out] - Existing output, if any
     * @return {*}
     */
    okanjo.util.deepClone = (mixed, out) => {
        if (Array.isArray(mixed)) {
            // Array reference
            out = out || [];
            out = out.concat(mixed.map((val) => okanjo.util.deepClone(val)));
        } else if (typeof mixed === "object" && mixed !== null) {
            // Object reference
            out = out || {};
            Object.keys(mixed).forEach((key) => {
                out[key] = okanjo.util.deepClone(mixed[key]);
            });
        } else {
            // Value
            out = mixed;
        }

        return out;
    };

    /**
     * Flattens a multi-dimensional object into a single object
     * @param input
     * @param [options]
     * @return {{}}
     */
    okanjo.util.flatten = (input, options = {}) => {
        const output = {};

        if (input !== undefined && input !== null) {
            Object
                .keys(input)
                .forEach((key) => {
                    // Convert object ids to hex strings
                    if (input[key] instanceof Date) {
                        if (options.dateToIso) {
                            output[key] = input[key].toISOString(); // convert to iso
                        } else {
                            output[key] = input[key]; // as-is
                        }
                    } else if (typeof input[key] === 'object' && input[key] !== null) {
                        // Allow ignoring arrays if desired
                        if (Array.isArray(input[key]) && options.ignoreArrays === true) {
                            output[key] = input[key];
                        } else if (Array.isArray(input[key]) && options.arrayToCsv === true) {
                            output[key] = input[key].join(',');
                        } else {
                            // Make child objects flat too (always returns object so Object.keys is safe)
                            const childObject = okanjo.util.flatten(input[key], options);
                            Object
                                .keys(childObject)
                                .forEach((childKey) => {
                                    output[key + '_' + childKey] = childObject[childKey];
                                })
                            ;
                        }
                    } else {
                        // Copy value references
                        output[key] = input[key];
                    }
                })
            ;
        }

        return output;
    };

    /*! based on shortid https://github.com/dylang/shortid */
    okanjo.util.shortid = (function(clusterWorkerId) {

        const shuffled = 'ylZM7VHLvOFcohp01x-fXNr8P_tqin6RkgWGm4SIDdK5s2TAJebzQEBUwuY9j3aC',

            crypto = window.crypto || window.msCrypto || (typeof require === "function" && require('crypto')),

            randomByte = () => {
                /* istanbul ignore next: platform diffs out of scope */
                if (crypto && crypto.randomBytes) {
                    return crypto.randomBytes(1)[0] & 0x30;
                } else if (!crypto || !crypto.getRandomValues) {
                    return Math.floor(Math.random() * 256) & 0x30;
                }
                /* istanbul ignore next: platform diffs out of scope */
                const dest = new Uint8Array(1);
                /* istanbul ignore next: platform diffs out of scope */
                crypto.getRandomValues(dest);
                /* istanbul ignore next: platform diffs out of scope */
                return dest[0] & 0x30;
            },

            encode = (number) => {
                let loopCounter = 0,
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

            REDUCE_TIME = 1490384907498,
            version = 7;

        let counter,
            previousSeconds;

        clusterWorkerId = clusterWorkerId || 0;

        return function() {
            let str = '',
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

    /**
     * Gets the best URL for where we are operating
     * @returns {string|*}
     */
    okanjo.util.getLocation = () => {
        /* istanbul ignore if: hard to reproduce in jsdom at the moment */
        if (window.location !== window.parent.location) {
            // attempt to see if the frame is friendly and get the parent
            try {
                return window.parent.location.href;
            } catch (e) {
                // Not friendly :(
            }

            // prefer the frame referrer (at least the same as the origin site) over the ad server url
            if (document.referrer) return document.referrer;
            return document.referrer;
        }

        // Direct on page or frame is goofy
        return window.location.href
    }

    //endregion

    //region User Interface

    okanjo.ui = {

        /**
         * Gets the current page scroll position
         * @returns {{x: Number, y: Number}}
         */
        getScrollPosition: () => {
            return {
                x: SUPPORTS_PAGE_OFFSET ? window.pageXOffset : /* istanbul ignore next: old browsers */ CSS1_COMPATIBLE ? document.documentElement.scrollLeft : document.body.scrollLeft,
                y: SUPPORTS_PAGE_OFFSET ? window.pageYOffset : /* istanbul ignore next: old browsers */ CSS1_COMPATIBLE ? document.documentElement.scrollTop : document.body.scrollTop
            };
        },

        /**
         * Gets the height and width of the given element
         * @param {HTMLElement|Node} element – The DOM element to get the size of
         * @param {boolean} [includeMargin] – Whether to include the margins of the element in the size
         * @returns {{height: number, width: number}}
         */
        getElementSize: (element, includeMargin) => {
            const size = {
                height: element.offsetHeight,
                width : element.offsetWidth
            };
            const style = element.currentStyle || window.getComputedStyle(element);

            if (includeMargin) {
                size.height += parseInt(style.marginTop) + parseInt(style.marginBottom);
                size.width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            }

            return size;
        },

        /**
         * Gets the current page size
         * @return {{w: number, h: number}}
         */
        getPageSize: () => {
            const body = document.querySelector('body');
            const html = document.documentElement;

            return {
                w: Math.max(
                    body.scrollWidth,
                    body.offsetWidth,
                    html.clientWidth,
                    html.scrollWidth,
                    html.offsetWidth
                ),

                h: Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                )
            };
        },

        /**
         * Gets the current viewport size
         * @return {{vw: number, vh: number}}
         */
        getViewportSize: () => {
            const element = CSS1_COMPATIBLE ? document.documentElement : /* istanbul ignore next: browser diffs */ document.body;
            const width = element.clientWidth;
            const height = element.clientHeight;
            const inWidth = window.innerWidth || /* istanbul ignore next: browser diffs */ 0;
            const inHeight = window.innerHeight || /* istanbul ignore next: browser diffs */ 0;
            const isMobileZoom = (inWidth && width > inWidth) || (inHeight && height > inHeight);

            return {
                vw: isMobileZoom ? /* istanbul ignore next: browser diffs */ inWidth : width,
                vh: isMobileZoom ? /* istanbul ignore next: browser diffs */ inHeight : height
            };
        },

        /**
         * Gets the x, y location of the event relative to the page
         * @param event – Mouse/Touch Event
         * @return {{ex: number, ey: number}}
         */
        getEventPosition: (event) => {
            const ex = event.pageX;
            const ey = event.pageY;
            const body = document.body;
            const el = document.documentElement;
            const scrollLeft = 'scrollLeft';
            const scrollTop = 'scrollTop';
            const type = event.__proto__.constructor.name;

            return {
                et: type, // mouse? touch? keyboard? robot?
                ex: ex === undefined /* istanbul ignore next: browser diffs */ ? event.clientX + body[scrollLeft] + el[scrollLeft] : ex,
                ey: ey === undefined /* istanbul ignore next: browser diffs */ ? event.clientY + body[scrollTop] + el[scrollTop] : ey
            };
        },

        /**
         * Gets the element's rectangle coordinates on the page
         * @param element
         * @return {{x1: number, y1: number, x2: number, y2: number}}
         */
        getElementPosition: (element) => {

            // Wrapped in try-catch because IE is super strict about the
            // element being on the DOM before you call this. Other browsers
            // let it slide, but oh well.

            const err = 'Could not get position of element. Did you attach the element to the DOM before initializing?';
            try {
                let rect = element.getBoundingClientRect();
                let body = document.body.getBoundingClientRect();
                // let pos = okanjo.ui.getScrollPosition();

                /* istanbul ignore else: jsdom doesn't mock this */
                if (!document.body.contains(element)) {
                    okanjo.report(err, element);
                }
                return {
                    // x1: rect.left + pos.x,
                    // y1: rect.top + pos.y,
                    // x2: rect.right + pos.x,
                    // y2: rect.bottom + pos.y

                    // This might fix
                    x1: rect.left - body.left,
                    y1: rect.top - body.top,
                    x2: rect.right - body.left,
                    y2: rect.bottom - body.top,

                };
            } catch (e) {
                okanjo.report(err, { exception: e, element });
                return {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0,
                    err: 1
                };
            }
        },

        /**
         * Gets the intersection information given the element, viewport and scroll positions
         * @param e – Element position
         * @param s - Scroll position
         * @param v - Viewport size
         * @return {{intersectionArea: number, elementArea: number}}
         * @private
         */
        _getIntersection: (e, s, v) => {
            let iLeft = Math.max(e.x1, s.x),
                iRight = Math.min(e.x2, s.x+v.vw),
                iTop = Math.max(e.y1, s.y),
                iBottom = Math.min(e.y2, s.y+v.vh),

                intersectionArea = Math.max(0, iRight - iLeft) * Math.max(0, iBottom - iTop),
                elementArea = (e.x2 - e.x1) * (e.y2 - e.y1);

            return {
                intersectionArea,
                elementArea
            };
        },

        /**
         * Checks whether the element is actually displayed on the DOM
         * @param element
         * @return {boolean}
         */
        isElementVisible: (element) => {
            /* istanbul ignore next: jsdom won't trigger this */
            return element.offsetWidth > 0 && element.offsetHeight > 0;
        },

        /**
         * Gets the percentage of the element pixels currently within the viewport
         * @param {HTMLElement|Node} element
         * @return {number}
         */
        getPercentageInViewport: (element) => {
            let e = okanjo.ui.getElementPosition(element),
                s = okanjo.ui.getScrollPosition(),
                v = okanjo.ui.getViewportSize();

            // If there was a problem getting the element position, fail fast
            if (e.err) return 0;

            // Get intersection rectangle
            let { intersectionArea, elementArea } = okanjo.ui._getIntersection(e,s,v);

            // Don't let it return NaN
            /* istanbul ignore else: jsdom no love positional data */
            if (elementArea <= 0) return 0;

            /* istanbul ignore next: jsdom no love positional data, area tested with helper fn tho */
            return intersectionArea / elementArea;
        }
    };

    /**
     * Splits the text in the element to fit within the visible height of its container, and separates with an ellipses
     * @param {HTMLElement|Node} element – The DOM element containing the text to fit
     * @param {HTMLElement} [container] – Optional container to compute fit on. Defaults to the element's parent
     */
    okanjo.ui.ellipsify = function(element, container) {

        // It's a sad day when you have to resort to JS because CSS kludges are too hacky to work down to IE8, programmatically

        //noinspection JSValidateTypes
        const parent = container || element.parentNode,
            targetHeight = okanjo.ui.getElementSize(parent).height,
            useTextContent = element.textContent !== undefined;

        let text = useTextContent ? element.textContent : /* istanbul ignore next: browser diffs */ element.innerText,
            replacedText = "",
            safety = 5000, // Safety switch to bust out of the loop in the event something goes terribly wrong
            replacer = /* istanbul ignore next: n/a to jsdom */ (match) => {
                replacedText = match.substring(0, match.length-3) + replacedText;
                return '...';
            };

        // Trim off characters until we can fit the text and ellipses
        // If the text already fits, this loop is ignored
        /* istanbul ignore next: jsdom doesn't do element size computing stuff */
        while (okanjo.ui.getElementSize(element).height > targetHeight && text.length > 0 && (safety-- > 0)) {
            text = useTextContent ? element.textContent : element.innerText;

            text = text.replace(ELLIPSIFY_PATTERN, replacer);

            if (useTextContent) {
                element.textContent = text;
            } else {
                element.innerText = text;
            }
        }

        // If there is work to do, split the content into two span tags
        // Like so: [content]...[hidden content]
        /* istanbul ignore if: n/a to jsdom */
        if (replacedText.length > 0) {

            let content = document.createElement('span'),
                span = document.createElement('span');

            content.setAttribute('class','okanjo-ellipses');
            span.setAttribute('class','okanjo-visually-hidden');

            if (useTextContent) {
                content.textContent = text.substring(0, text.length-3);
                span.textContent = replacedText;
            } else {
                content.innerText = text.substring(0, text.length-3);
                span.innerText = replacedText;
            }

            element.innerHTML = '';
            element.appendChild(content);
            element.appendChild(span);
        }

    };

    /**
     * Locates images with the class okanjo-fit and ensures that they get filled.
     * This is basically a object-fit hacky workaround
     * @param element
     */
    okanjo.ui.fitImages = function(element) {
        // Detect objectFit support
        /* istanbul ignore if: jsdom has objectFit defined and refuses to let you hack it */
        if (!('objectFit' in document.documentElement.style)) {
            // Find images to fit
            element.querySelectorAll('img.okanjo-fit').forEach((img) => {

                // Hide the image
                img.style.display = 'none';

                // Update the parent w/ the background
                let parent = img.parentNode;
                parent.style.backgroundSize = 'cover';
                parent.style.backgroundImage = 'url('+img.src+')';
                parent.style.backgroundposition = 'center center';
            });
        }
    };

    //endregion

    // Export the root namespace
    return window.okanjo = okanjo;

})(window, document);