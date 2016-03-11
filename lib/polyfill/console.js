
    // Make it safe to do console.log() always.
    /*! Console-polyfill. | MIT license. | https://github.com/paulmillr/console-polyfill */
    //noinspection ThisExpressionReferencesGlobalObjectJS
    (function (win) {
        'use strict';
        var con = win.console || {},
            prop, method,
            empty = {},
            dummy = function() {},
            properties = 'memory'.split(','),
            methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
            'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
            'time,timeEnd,trace,warn').split(',');
        win.console = con;
        // jshint -W084
        while (prop = properties.pop()) {
            if (con[prop] === undefined) {
                con[prop] = con[prop] || empty;
            }
        }
        while (method = methods.pop()) {
            if(con[method] === undefined) {
                con[method] = con[method] || dummy;
            }
        }
        // jshint +W084
    })(this || {});