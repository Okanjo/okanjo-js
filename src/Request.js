"use strict";

(function(window) {

    const JSON_TEST = /^application\/json/;
    const okanjo = window.okanjo;

    /**
     * Performs a reliable XHR request
     * @param {string} method - Request method
     * @param {string} url - URL
     * @param [payload] optional payload
     * @param callback Fired on when completed (err, res), normalized to standard response format
     */
    okanjo.net.request = function (method, url, payload, callback) {

        // payload is not required
        if (typeof payload === "function") {
            callback = payload;
            payload = undefined;
        }

        // Create a new instance
        const req = new (window.XMLHttpRequest || /* istanbul ignore next: old ie */ window.ActiveXObject)('MSXML2.XMLHTTP.3.0');

        // Flag to prevent duplicate callbacks / races
        let calledBack = false;

        // Normalized done handler
        const done = function(err, res) {
            /* istanbul ignore else: out of scope */
            if (!calledBack) {
                calledBack = true;
                callback(err, res);
            }
        };

        // Apply timeout if configured globally
        if (okanjo.net.request.timeout) {
            req.timeout = okanjo.net.request.timeout;
        }

        // Catch timeout errors
        req.ontimeout = function(e) {
            /* istanbul ignore next: idk if jsdom can mock this, also readystatechange may fire before this anyway */
            done({
                statusCode: 504,
                error: "Request timed out",
                message: 'Something went wrong',
                attributes: {
                    event: e,
                    xhr: req
                }
            });
        };

        // Handle the response
        req.onreadystatechange = function(e) {
            // 4 = completed / failed
            if (req.readyState === 4) {
                // Do we have a response?
                if (req.status > 0) {
                    let res;

                    // Check if we got JSON and parse it right away
                    if (JSON_TEST.test(req.getResponseHeader('Content-Type'))) {
                        res = JSON.parse(req.responseText);
                    } else {
                        // Not JSON, normalize it instead
                        res = {
                            statusCode: req.status,
                            data: req.responseText
                        };
                    }

                    // Put the response in the proper slot (err for non success responses)
                    if (req.status >= 200 && req.status < 300) {
                        done(null, res);
                    } else {
                        done(res);
                    }
                } else {
                    // Request failed - e.g. CORS or network issues
                    done({
                        statusCode: 503,
                        error: "Request failed",
                        message: 'Something went wrong',
                        attributes: {
                            event: e,
                            xhr: req
                        }
                    });
                }
            }
        };

        // Open the request
        req.open(method.toUpperCase(), url);

        // Include credentials
        req.withCredentials = true;

        // Handle post payloads
        if (['POST','PUT','PATCH'].includes(method.toUpperCase())) {
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            if (payload !== undefined) {
                payload = JSON.stringify(payload);
            }
        }

        // Ship it
        req.send(payload || undefined);
    };

    // Bind helpers to make things easy as pie
    okanjo.net.request.get = okanjo.net.request.bind(this, 'GET');
    okanjo.net.request.post = okanjo.net.request.bind(this, 'POST');
    okanjo.net.request.put = okanjo.net.request.bind(this, 'PUT');
    okanjo.net.request.delete = okanjo.net.request.bind(this, 'DELETE');

    /**
     * Helper to aid in minificiation+querystringify and redundant encodeURIComponent stuff
     * @param val
     * @return {*}
     */
    const encode = (val) => {
        if (val === null || val === undefined) return '';
        return encodeURIComponent(''+val);
    };

    /**
     * Helper to aid in getting a query string key using a prefix and keyname
     * @param key
     * @param keyPrefix
     * @return {*}
     */
    const getKey = (key, keyPrefix) => {
        if (keyPrefix) {
            return `${keyPrefix}[${encode(key)}]`;
        } else {
            return encode(key)
        }
    };

    /**
     * Super basic querystringify helper. It handles deep objects, but not for array values
     * @param obj
     * @param [keyPrefix]
     * @return {string}
     */
    okanjo.net.request.stringify = (obj, keyPrefix) => {
        let pairs = [];
        keyPrefix = keyPrefix || "";
        Object.keys(obj).forEach((key) => {
            let value = obj[key];
            if (Array.isArray(value)) {
                value.forEach((v) => pairs.push(getKey(key, keyPrefix) + '=' + encode(v))); // Does not do that PHP garbage with key[]=val
            } else if (typeof value === "object" && value !== null) {
                // Recurse
                let res = okanjo.net.request.stringify(value, getKey(key, keyPrefix));
                if (res) pairs.push(res);
            } else if (value !== undefined) {
                pairs.push(getKey(key, keyPrefix) + '=' + encode(value));
            }
        });
        return pairs.join('&');
    };

})(window);