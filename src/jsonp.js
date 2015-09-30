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
