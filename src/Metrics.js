"use strict";

import okanjo from './Okanjo';

/**
 * Event tracking class
 * @type {Metrics}
 */
class Metrics {

    //noinspection JSUnusedGlobalSymbols
    constructor() {

        /**
         * Events queued here before submission
         * @type {Array}
         * @private
         */
        this._queue = this._getStoredQueue();
        this._processTimeout = null; // queue event loop timeout pointer

        /**
         * Unique page grouping event identifier
         */
        this.pageId = okanjo.util.shortid();
        this.defaultChannel = Metrics.Channel.external;

        this.sid = null;
        this.sourceCh = null;
        this.sourceCx = null;

        // Extract referral data, if set
        this._checkUrlForReferral();

        // TODO - look into iframe session correlation system
    }

    //noinspection JSMethodCanBeStatic
    /**
     * Gets the storage backed metric queue, in case we did not send everything last time
     * @return {Array}
     * @private
     */
    _getStoredQueue() {
        if (window.localStorage[Metrics.Params.queue]) {
            try {
                let queue = JSON.parse(window.localStorage[Metrics.Params.queue]);
                if (Array.isArray(queue)) {
                    return queue;
                } else {
                    okanjo.report('Stored queue is not a queue', {queue});
                    return [];
                }
            } catch (e) {
                okanjo.report('Failed to load metric queue from storage', {err: e});
                return [];
            }
        } else {
            // not stored
            return [];
        }
    }

    /**
     * Updates the queue stored in storage, in the event we can't complete our submissions
     * @param delay - Whether to delay updating the queue for a bit, to let other metrics pile in
     * @private
     */
    _saveQueue(delay) {
        if (delay) {
            if (this._saveQueueTimeout) clearTimeout(this._saveQueueTimeout);
            this._saveQueueTimeout = setTimeout(() => {
                this._saveQueue(false);
                this._saveQueueTimeout = null;
            }, 100);
        } else {
            window.localStorage[Metrics.Params.queue] = JSON.stringify(this._queue);
        }
    }

    /**
     * Extract contextual pass-through data from the URL, if present
     * @private
     */
    _checkUrlForReferral() {
        const pageArgs = okanjo.util.getPageArguments(true),
            urlSid = pageArgs[Metrics.Params.name],
            localSid = window.localStorage[Metrics.Params.name] || okanjo.util.cookie.get(Metrics.Params.name), // pull from storage or cookie
            sourceContext = pageArgs[Metrics.Params.context],
            sourceChannel = pageArgs[Metrics.Params.channel];

        // If for some reason, both are set, record the incident as a possible correlation
        if (urlSid && localSid && urlSid !== localSid) {
            this.trackEvent({
                object_type: Metrics.Object.metric_session,
                event_type: Metrics.Event.correlation,
                id: urlSid+"_"+localSid,
                ch: this.defaultChannel,
                _noProcess: true
            });
        }

        // Update local values
        this.sid = localSid || urlSid || null; // prefer local over remote (changed in 1.0)
        this.sourceCh = sourceChannel || null;
        this.sourceCx = sourceContext || null;
    }

    /**
     * Submits an individual event metric
     * @param event
     * @param callback
     */
    trackEvent(event, callback) {
        // Ensure the event contains the required fields
        if (!event.object_type || !event.event_type) {
            okanjo.report('Invalid metric to track (missing object_type or event_type)', {event});
            return;
        }

        // Queue the event for publishing
        this._push(event, callback);
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Submits a page view metric
     * @param event
     * @param callback
     */
    trackPageView(event, callback) {
        event = event || {};
        event.object_type = Metrics.Object.page;
        event.event_type = Metrics.Event.view;
        event.id = event.id || window.location.href;
        event.ch = event.ch || this.defaultChannel;

        // Queue the event for publishing
        this.trackEvent(event, callback);
    }

    /**
     * Adds an event to the queue
     * @param event
     * @param callback
     * @private
     */
    _push(event, callback) {
        this._queue.push({ event, callback });

        // Save the queue
        this._saveQueue(true);

        // Start burning down the queue, unless the event says not to
        if (event._noProcess) {
            delete event._noProcess;
        } else {
            this._processQueue();
        }
    }

    /**
     * Burn down the queue
     * @protected
     */
    _processQueue() {
        // If the queue is not already being processed, and there's stuff to process, continue sending them
        if (!this._processTimeout && this._queue.length > 0) {
            this._processTimeout = setTimeout(() => {

                // Pull the items we're going to batch out of the queue
                const items = this._queue.splice(0, 255);
                this._saveQueue(false);

                // Track the item
                this._batchSend(items, (err, res) => {
                    // TODO: If there was an error, consider splicing the batch back into the queue

                    // Update / Set the metric sid on the publisher
                    /* istanbul ignore else: server barks */
                    if (res && res.data && res.data.sid) this._updateSid(res.data.sid);

                    // When this batch is done being tracked, iterate to the next metric then fire it's callback if set
                    this._processTimeout = null;
                    this._processQueue();

                    // Fire the event callbacks if there are any
                    items.forEach((item) => {
                        item.callback && item.callback(err, res);
                    });
                });

            }, 0); // break event loop, maybe
        }
    }

    /**
     * Sends a bunch of queued metric events
     * @param items
     * @param callback
     * @private
     */
    _batchSend(items, callback) {

        // Normalize event data
        const events = items.map((item) => {
            this._normalizeEvent(item.event);

            // Strip duplicated data from event batch
            delete item.event.sid;
            delete item.event.win;

            return item.event;
        });

        const payload = {
            events,
            win: window.location.href
        };

        const route = okanjo.net.getRoute(okanjo.net.routes.metrics_batch);

        // Set sid if present
        if (this.sid) {
            payload.sid = this.sid;
        }

        // Send it
        okanjo.net.request.post(
            route,
            payload,
            (err, res) => {
                /* istanbul ignore if: out of scope */
                if (err) {
                    okanjo.report('Failed to send metrics batch', { err, res, items, route });
                }
                callback && callback(err, res);
            }
        );
    }

    /**
     * Normaizes events so that they contain consistent data values
     * @param event
     * @private
     */
    _normalizeEvent(event) {

        // Ensure meta is ready to receive values
        event.m = event.m || {};

        // Set key
        event.key = event.key || event.m.key || okanjo.key || undefined;

        // Set session
        if (this.sid) event.sid = this.sid;

        // Clone the metadata, since it might be a direct reference to a widget property
        // Deleting properties on the meta object could be very destructive
        event.m = Object.assign({}, event.m); // event.m should be flat

        // Strip meta keys that should be excluded
        Object.keys(Metrics.Meta.exclude).forEach((key) => delete event.m[key]);

        // Set referral channel / context
        if (this.sourceCh) { event.m.ref_ch = this.sourceCh; }
        if (this.sourceCx) { event.m.ref_cx = this.sourceCx; }

        // Set page group id
        event.m.pgid = this.pageId;

        // Set okanjo version
        event.m.ok_ver = okanjo.version;

        // Finalize metadata
        event.m = okanjo.util.flatten(event.m, { arrayToCsv: true });

        // Ensure metadata strings won't exceed the imposed limit
        Object.keys(event.m).forEach((key) => {
            if (typeof event.m[key] === "string") {
                event.m[key] = event.m[key].substr(0, 255);
            }
        });

        // Set page source reference
        if (document.referrer) {
            event.ref = document.referrer;
        }

         // Set the window location
        event.win = window.location.href;
    }

    /**
     * Updates the stored session identifier
     * @param sid
     * @private
     */
    _updateSid(sid) {
        if (!this.sid && sid) {
            this.sid = sid;
            window.localStorage[Metrics.Params.name] = sid;
            okanjo.util.cookie.set(Metrics.Params.name, sid, Metrics.Params.ttl);
        }
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Adds DOM element dimensions / positional data to the event
     * @param element
     * @param event
     * @return {*|{}}
     */
    static addElementInfo(element, event) {
        const page = okanjo.ui.getPageSize(),
            size = okanjo.ui.getElementPosition(element);

        event = event || {};
        event.m = event.m || {};
        event.m.pw = page.w;
        event.m.ph = page.h;
        event.m.x1 = size.x1;
        event.m.y1 = size.y1;
        event.m.x2 = size.x2;
        event.m.y2 = size.y2;

        return event;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Adds viewport dimensions / positional data to the event
     * @param event
     * @return {*|{}}
     */
    static addViewportInfo(event) {
        const vp = okanjo.ui.getViewportSize(),
            pos = okanjo.ui.getScrollPosition();

        event = event || {};
        event.m = event.m || {};
        event.m.vx1 = pos.x;
        event.m.vy1 = pos.y;
        event.m.vx2 = pos.x+vp.vw;
        event.m.vy2 = pos.y+vp.vh;

        return event;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Adds DOM event positional data to the event
     * @param jsEvent
     * @param event
     * @return {*|{}}
     */
    static addEventInfo(jsEvent, event) {
        const pos = okanjo.ui.getEventPosition(jsEvent);

        event = event || {};
        event.m = event.m || {};
        event.m.et = pos.et;
        event.m.ex = pos.ex;
        event.m.ey = pos.ey;

        return event;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Adds meta data values to the event
     * @param event
     * @param args
     * @return {*|{}}
     */
    static addEventMeta(event, ...args) {
        event = event || {};
        event.m = event.m || {};
        event.m = Object.assign.apply(Object, [event.m].concat(args));

        return event;
    }

    /**
     * Helper to create a new fluent event structure
     * @param data
     * @param args
     * @return {MetricEvent}
     */
    static create(data, ...args) {
        // return okanjo.util.deepClone(Object.assign.apply(Object, [{}].concat(args)));
        return new MetricEvent(data, args);
    }

    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    /**
     * Helper to create a new fluent event structure
     * @param args
     * @return {*}
     */
    create(...args) {
        return Metrics.create.apply(null, args);
    }

}

/**
 * The storage/cookie/url param names
 * @type {{queue: string, name: string, channel: string, context: string, ttl: number}}
 */
Metrics.Params = {
    queue: '_ok_q',
    name: 'ok_msid',
    channel: 'ok_ch',
    context: 'ok_cx',
    ttl: 1460 // 4 years
};

/**
 * Event Metadata configuration
 * @type {{exclude: [*]}}
 */
Metrics.Meta = {
    exclude: ['key','callback','metrics_channel_context','metrics_context','mode']
};

/**
 * Event Types
 * @type {{view: string, impression: string, interaction: string, correlation: string}}
 */
Metrics.Event = {
    view: 'vw',
    impression: 'imp',
    interaction: 'int',
    correlation: 'cor'
};

/**
 * Event Action Types
 * @type {{click: string, inline_click: string}}
 */
Metrics.Action = {
    click: "click",
    inline_click: "inline_click"
};

/**
 * Event Object Types
 * @type {{article: string, thirdparty_ad: string, cart: string, page: string, widget: string, product: string, store: string, cause: string, marketplace: string, order: string, order_item: string, user: string, metric_session: string}}
 */
Metrics.Object = {
    article: 'am',
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
};

/**
 * Event Channels
 * @type {{product_widget: string, ad_widget: string, store_widget: string, marketplace: string, external: string}}
 */
Metrics.Channel = {
    placement: 'pw',
    marketplace: 'mp',
    external: 'ex',

    // Deprecated:
    product_widget: 'pw',
    ad_widget: 'aw',
    store_widget: 'sw'
};

/**
 * Event Environments
 * @type {{live: string, testing: string}}
 */
Metrics.Environment = {
    live: "live",
    testing: "testing"
};

/**
 * Fluent wrapper around making events simple
 */
class MetricEvent {
    constructor(data, others) {
        // Merge the data and other data sets into this object
        data = data || {};
        this.data(data);
        /* istanbul ignore else: metrics.create is the only way to create this right now */
        if (Array.isArray(others)) {
            others.forEach((data) => {
                this.data(data);
            });
        }
    }

    /**
     * Sets event parameter key-values
     * @param data
     */
    data(data) {
        Object.assign(this, okanjo.util.deepClone(data));
        return this;
    }

    /**
     * Adds DOM event positional data to the event
     * @param jsEvent
     * @return {MetricEvent}
     */
    event(jsEvent) {
        Metrics.addEventInfo(jsEvent, this);
        return this;
    }

    /**
     * Adds viewport dimensions / positional data to the event
     * @return {MetricEvent}
     */
    viewport() {
        Metrics.addViewportInfo(this);
        return this;
    }

    /**
     * Adds DOM element dimensions / positional data to the event
     * @param element
     * @return {MetricEvent}
     */
    element(element) {
        Metrics.addElementInfo(element, this);
        return this;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Adds meta data values to the event
     * @param args
     * @return {MetricEvent}
     */
    meta(...args) {
        Metrics.addEventMeta.apply(null, [this].concat(args));
        return this;
    }

    /**
     * Sets the object and event type on the event w/o having to use .data
     * @param object_type
     * @param event_type
     * @return {MetricEvent}
     */
    type(object_type, event_type) {
        this.object_type = object_type;
        this.event_type = event_type;
        return this;
    }

    /**
     * Finalizes and sends the event
     * @param callback
     */
    send(callback) {
        okanjo.metrics.trackEvent(this, callback);
        // DONT RETURN - BREAK THE CHAIN HERE
    }

    /**
     * Gets the single-metric tracking url for this event
     * @return {string}
     */
    toUrl() {
        // Copy data w/o modifying it
        const event = Object.assign({}, this);

        // Extract params
        const {
            object_type,
            event_type
        } = event;
        delete event.object_type;
        delete event.event_type;

        // Normalize event data
        okanjo.metrics._normalizeEvent(event);

        // Get the URL
        return okanjo.net.getRoute(okanjo.net.routes.metrics, { object_type, event_type }) + '?' +
            okanjo.net.request.stringify(event);
    }
}

export default new Metrics();
export { Metrics, MetricEvent };

// export Metrics
// export MetricEvent;

    // Export / initialize
    // okanjo.metrics = new Metrics();

// })(window, document);