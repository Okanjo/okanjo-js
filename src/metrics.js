//noinspection ThisExpressionReferencesGlobalObjectJS
(function(okanjo, window) {


    function OkanjoMetrics() {

        this.default_channel = this.channel.external;

        this._queue = [];

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

            // If we were referred through a particular channel/context, then hold on to that for events emitted by this page
            if (this.sourceCh || this.sourceCx) {
                if (!event.m) {
                    event.m = {};
                }

                if (this.sourceCh) { event.m.ref_ch = this.sourceCh; }
                if (this.sourceCx) { event.m.ref_cx = this.sourceCx; }
            }

            // Pass the page's source reference
            if (document.referrer) {
                event.ref = document.referrer;
            }

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
        }

    };

    okanjo.metrics = new OkanjoMetrics();

})(okanjo, this);