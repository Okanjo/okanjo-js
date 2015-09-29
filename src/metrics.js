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

        // Track the page view, but don't send it right away.
        // Send it in one full second unless something else pushes an event
        // This way, we have a chance that the api key get set globally
        if (!window._NoOkanjoPageView) {
            this.trackPageView({_noProcess:true});
            var self = this;
            setTimeout(function() {
                self._processQueue();
            }, 1000);
        }
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
         * @param {{key: string, ea: string, id: string, ch: string, cx: string, url: string, env: string, meta: object }} data
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
         * @param {{key: string, ea: string, id: string, ch: string, cx: string, url: string, env: string, meta: object }} [data]
         * @param callback
         */
        trackPageView: function(data, callback) {

            data = data || {};

            // Set the current page URL as the object id
            data.id = window.location.href;

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
            event.key = event.key || (event.meta && event.meta.key) || okanjo.key || this._lastKey || undefined;

            // Stick the publisher session token in there too, if present
            if (this.sid) {
                event.sid = this.sid;
            }

            // Clone the metadata, since it might be a direct reference to a widget property
            // Deleting properties on the meta object could be very destructive
            if (event.meta) {
                var meta = {};
                for(var i in event.meta) {
                    if (event.meta.hasOwnProperty(i) && this.strip_meta.indexOf(i) < 0) {
                        meta[i] = event.meta[i];
                    }
                }
                event.meta = meta;
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
        }

    };

    okanjo.metrics = new OkanjoMetrics();

})(okanjo, this);