//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
/** Based on https://gist.github.com/mudge/5830382 **/
(function(okanjo, window) {

    var indexOf = function (haystack, needle) {
            return haystack.indexOf(needle);
        },

        /* Polyfill indexOf. */
        EventEmitter = function () {
            this.events = {};
        };

    EventEmitter.prototype.on = function (event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);
    };

    EventEmitter.prototype.removeListener = function (event, listener) {
        var idx;

        if (typeof this.events[event] === 'object') {
            idx = indexOf(this.events[event], listener);

            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }
    };

    EventEmitter.prototype.emit = function (event) {
        var i, listeners, length, args = [].slice.call(arguments, 1);

        if (typeof this.events[event] === 'object') {
            listeners = this.events[event].slice();
            length = listeners.length;

            for (i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    };

    EventEmitter.prototype.once = function (event, listener) {
        this.on(event, function g () {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        });
    };

    okanjo._EventEmitter = EventEmitter;
    return EventEmitter;

})(okanjo, this);