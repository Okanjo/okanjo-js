
    /*! Okanjo Cookie Helper v1.0.0 | (c) 2013 Okanjo Partners Inc */
    //noinspection ThisExpressionReferencesGlobalObjectJS
    (function(c, w) {

        var document = w.document || { cookie: '' };

        c.Cookie = {
            set: function(cookieName, value, expireDays) {
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + expireDays);
                var cookieValue = encodeURI(value) + ((!expireDays) ? "" : "; Expires=" + expireDate.toUTCString() + "; Path=/");
                document.cookie = cookieName + "=" + cookieValue;
            },
            get: function(cookieName) {
                var idx, nameTest, value, cookieArray = document.cookie.split(";");
                for (idx = 0; idx < cookieArray.length; idx++) {
                    nameTest = cookieArray[idx].substr(0, cookieArray[idx].indexOf("="));
                    value = cookieArray[idx].substr(cookieArray[idx].indexOf("=") + 1);
                    nameTest = nameTest.replace(/^\s+|\s+$/g, "");
                    if (nameTest == cookieName) {
                        return decodeURI(value);
                    }
                }
                return null;
            }
        };

        return c.Cookie;

    })(okanjo || this, this);