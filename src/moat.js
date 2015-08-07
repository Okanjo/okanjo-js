//noinspection JSUnusedLocalSymbols,ThisExpressionReferencesGlobalObjectJS
(function(okanjo, window) {

    var d = document,
        addIfNotNull = function(list, params, label) {
            for (var i = 0; i < list.length; i++) {
                if (list[i] !== null) params.push(label + (i + 1) + '=' + encodeURIComponent(list[i]));
            }
        };

    okanjo.moat = {

        /**
         * Disable by default until testing is completed
         */
        enabled: true,

        /**
         * Insert a Moat Analytics tracker
         * @param [element] - The element to append to or leave blank to track the entire page
         * @param {{levels:Array,slicers:Array}} options – Moat levels and slicers to report on
         */
        insert: function(element, options) {
            if (okanjo.moat.enabled) {

                var b = element || d.getElementsByTagName('body')[0],
                    ma = d.createElement('script'),
                    uri = okanjo.moat.getTagUrl(options);

                if (uri) {
                    ma.type = 'text/javascript';
                    ma.async = true;
                    ma.src = uri;

                    b.appendChild(ma);
                }
            }
        },


        /**
         * Builds a Moat script tag URL based on the options received
         * @param {{levels:Array,slicers:Array}} options – Moat levels and slicers to report on
         * @returns {string}
         */
        getTagUrl: function(options) {
            if (options && options.levels && Array.isArray(options.levels) && options.slicers && Array.isArray(options.slicers)) {

                var moatParams = [],
                    moat = okanjo.config.moat;


                // Build config param string
                addIfNotNull(options.levels, moatParams, 'moatClientLevel');
                addIfNotNull(options.slicers, moatParams, 'moatClientSlicer');
                moatParams = moatParams.join('&');

                return '//js.moatads.com/' + moat.tag + '/moatad.js#' + moatParams;

            } else {
                console.warn(new Error('Invalid moat tag options'), options);
                return null;
            }
        }

    };

})(okanjo, this);