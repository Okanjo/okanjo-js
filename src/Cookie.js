"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS
(function(window, document) {

    /**
     * Okanjo cookie utility helpers
     */
    window.okanjo.util.cookie = {

        /**
         * Sets a cookie
         * @param cookieName
         * @param value
         * @param expireDays
         */
        set: (cookieName, value, expireDays) => {
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + expireDays);
            const expires = expireDays ? " Expires=" + expireDate.toUTCString() + ";" : "";
            const path = " Path=/";
            const cookieValue = `${encodeURI(value)};${expires}${path}`;
            document.cookie = cookieName + "=" + cookieValue;
        },

        /**
         * Gets a cookie
         * @param cookieName
         * @return {*}
         */
        get: (cookieName) => {
            let output = null;
            document.cookie
                .split(";")
                .find((cookie) => {
                    let nameTest = cookie.substr(0, cookie.indexOf("=")).trim();
                    let value = cookie.substr(cookie.indexOf("=") + 1);
                    if (nameTest === cookieName) {
                        output = decodeURI(value);
                        return true;
                    } else {
                        return false;
                    }
                })
            ;
            return output;
        }
    };

})(window, document);