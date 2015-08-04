// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

//// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
//if (typeof Object.create != 'function') {
//    Object.create = (function() {
//        var Temp = function() {};
//        return function (prototype) {
//            if (arguments.length > 1) {
//                throw new Error('Second argument not supported');
//            }
//            if (typeof prototype != 'object') {
//                throw new TypeError('Argument must be an object');
//            }
//            Temp.prototype = prototype;
//            var result = new Temp();
//            Temp.prototype = null;
//            return result;
//        };
//    })();
//}

// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.14
// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {

        var k;

        /* jshint ignore:start */
        // 1. Let O be the result of calling ToObject passing
        //    the this value as the argument.
        if (this == null) { //
            throw new TypeError('"this" is null or not defined');
        }
        /* jshint ignore:end */

        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get
        //    internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If len is 0, return -1.
        if (len === 0) {
            return -1;
        }

        // 5. If argument fromIndex was passed let n be
        //    ToInteger(fromIndex); else let n be 0.
        var n = +fromIndex || 0;

        if (Math.abs(n) === Infinity) {
            n = 0;
        }

        // 6. If n >= len, return -1.
        if (n >= len) {
            return -1;
        }

        // 7. If n >= 0, then Let k be n.
        // 8. Else, n<0, Let k be len - abs(n).
        //    If k is less than 0, then let k be 0.
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 9. Repeat, while k < len
        while (k < len) {
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the
            //    HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            //    i.  Let elementK be the result of calling the Get
            //        internal method of O with the argument ToString(k).
            //   ii.  Let same be the result of applying the
            //        Strict Equality Comparison Algorithm to
            //        searchElement and elementK.
            //  iii.  If same is true, return k.
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
    Array.prototype.every = function(callbackfn, thisArg) {
        'use strict';
        var T, k;

        // jshint -W041
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        // jshint +W041

        // 1. Let O be the result of calling ToObject passing the this
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method
        //    of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
        if (typeof callbackfn !== 'function') {
            throw new TypeError();
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let k be 0.
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method
                //    of O with argument Pk.
                kValue = O[k];

                // ii. Let testResult be the result of calling the Call internal method
                //     of callbackfn with T as the this value and argument list
                //     containing kValue, k, and O.
                var testResult = callbackfn.call(T, kValue, k, O);

                // iii. If ToBoolean(testResult) is false, return false.
                if (!testResult) {
                    return false;
                }
            }
            k++;
        }
        return true;
    };
}

// Doesn't work in IE7 so it's only here for reference
//https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
(function() {
    if (!Event.prototype.preventDefault) {
        Event.prototype.preventDefault=function() {
            //noinspection JSUnusedGlobalSymbols
            this.returnValue=false;
        };
    }
    if (!Event.prototype.stopPropagation) {
        Event.prototype.stopPropagation=function() {
            //noinspection JSUnusedGlobalSymbols
            this.cancelBubble=true;
        };
    }
    if (!Element.prototype.addEventListener) {
        var eventListeners=[];

        var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
            var self=this;
            var wrapper=function(e) {
                e.target=e.srcElement;
                e.currentTarget=self;
                if (listener.handleEvent) {
                    listener.handleEvent(e);
                } else {
                    listener.call(self,e);
                }
            };
            if (type=="DOMContentLoaded") {
                var wrapper2=function(e) {
                    if (document.readyState=="complete") {
                        wrapper(e);
                    }
                };
                document.attachEvent("onreadystatechange",wrapper2);
                eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});

                if (document.readyState=="complete") {
                    //noinspection JSClosureCompilerSyntax
                    var e=new Event();
                    e.srcElement=window;
                    wrapper2(e);
                }
            } else {
                this.attachEvent("on"+type,wrapper);
                eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
            }
        };
        var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
            var counter=0;
            while (counter<eventListeners.length) {
                var eventListener=eventListeners[counter];
                if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
                    if (type=="DOMContentLoaded") {
                        this.detachEvent("onreadystatechange",eventListener.wrapper);
                    } else {
                        this.detachEvent("on"+type,eventListener.wrapper);
                    }
                    eventListeners.splice(counter, 1);
                    break;
                }
                ++counter;
            }
        };
        Element.prototype.addEventListener=addEventListener;
        Element.prototype.removeEventListener=removeEventListener;
        if (HTMLDocument) {
            HTMLDocument.prototype.addEventListener=addEventListener;
            HTMLDocument.prototype.removeEventListener=removeEventListener;
        }
        if (Window) {
            //noinspection JSUnresolvedVariable
            Window.prototype.addEventListener=addEventListener;
            //noinspection JSUnresolvedVariable
            Window.prototype.removeEventListener=removeEventListener;
        }
    }
})();