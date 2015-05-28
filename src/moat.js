//noinspection JSUnusedLocalSymbols
(function(okanjo, window) {

    var d = document,
        addIfNotNull = function(list, params, label) {
            for (var i = 0; i < list.length; i++) {
                if (list[i] !== null) params.push(label + (i + 1) + '=' + list[i]);
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
         */
        insert: function(element) {
            if (okanjo.moat.enabled) {

                var b = element || d.getElementsByTagName('body')[0],
                    ma = d.createElement('script'),
                    moatParams = [],
                    moat = okanjo.config.moat;


                // Build config param string
                addIfNotNull(moat.clientLevels, moatParams, 'moatClientLevel');
                addIfNotNull(moat.clientSlicers, moatParams, 'moatClientSlicer');
                moatParams = moatParams.join('&');

                ma.type = 'text/javascript';
                ma.async = true;
                ma.src = '//js.moatads.com/' + moat.tag + '/moatad.js#' + moatParams;

                b.appendChild(ma);
            }
        }

    };

})(okanjo, this);