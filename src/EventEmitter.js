"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
/** Based on https://gist.github.com/mudge/5830382 **/
(function(window) {

    /**
     * Simplified EventEmitter base class
     */
    class EventEmitter {

        constructor() {
            this._events = {};
        }

        /**
         * Registers an event handler to fire on any occurrence of an event
         * @param event
         * @param listener
         */
        on(event, listener) {
            if (!this._events[event]) {
                this._events[event] = [];
            }

            this._events[event].push(listener);
        }

        /**
         * Removes an event handler for an event
         * @param event
         * @param listener
         */
        removeListener(event, listener) {

            if (this._events[event]) {
                let idx = this._events[event].indexOf(listener);
                if (idx >= 0) {
                    this._events[event].splice(idx, 1);
                }
            }
        }

        /**
         * Emits an event
         * @param event
         */
        emit(event) {
            let i, listeners, length, args = [].slice.call(arguments, 1);

            if (this._events[event]) {
                listeners = this._events[event].slice();
                length = listeners.length;

                for (i = 0; i < length; i++) {
                    listeners[i].apply(this, args);
                }
            }
        }

        //noinspection JSUnusedGlobalSymbols
        /**
         * Registers an event handler to fire only once on an event
         * @param event
         * @param listener
         */
        once(event, listener) {

            const callback = () => {
                let args = [].slice.call(arguments, 1);
                this.removeListener(event, callback);
                listener.apply(this, args);
            };

            this.on(event, callback);
        }

    }

    window.okanjo._EventEmitter = EventEmitter;
    return EventEmitter;

})(window);