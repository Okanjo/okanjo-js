
    /*! Okanjo Local Storage Polyfill v1.0.0 | (c) 2013 Okanjo Partners Inc | Based on https://gist.github.com/juliocesar/926500/ddb28fb72903be87cb9044a945c6edbe1aa28b3a */
    //noinspection ThisExpressionReferencesGlobalObjectJS
    (function(c, window) {
        var OkanjoCache = null;
        if ('localStorage' in window && window.localStorage !== null && isLocalStorageNameSupported()) {
            OkanjoCache = window.localStorage;
        } else {
            OkanjoCache = {
                _data       : {}, // jshint -W093
                length      : 0,
                _updateLen  : function() { this.length = this._data.length; },

                setItem     : function(id, val) { var res = this._data[id] = String(val); this._updateLen(); return res; },
                getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
                removeItem  : function(id) { var res = delete this._data[id]; this._updateLen(); return res; },
                clear       : function() { return this._data = {}; },
                key         : function(index) { return Object.keys(this._data)[index]; } // jshint +W093
            };
        }
        c.Cache = OkanjoCache;
        return OkanjoCache;

        // Make sure LocalStorage is usable.
        // Thanks stackoverflow! http://stackoverflow.com/a/17604754/1373782
        function isLocalStorageNameSupported() {
            var testKey = 'test', storage = window.sessionStorage;
            try {
                storage.setItem(testKey, '1');
                storage.removeItem(testKey);
                return true;
            } catch (error) {
                return false;
            }
        }
    })(okanjo || this, this);