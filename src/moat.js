//noinspection JSUnusedLocalSymbols
(function(okanjo, window) {

    okanjo.moat = {

        /**
         * Flag to prevent accidental loading twice
         */
        loaded: (okanjo.moat && okanjo.moat.loaded) || false,

        /**
         * Load Moat Analytics
         */
        init: function() {
            if (!okanjo.moat.loaded) {
                okanjo.moat.loaded = true;
                var d = document,
                    b = d.getElementsByTagName('body')[0],
                    ns = d.createElement('noscript'),
                    ma = d.createElement('script'),
                    moatParams = [],
                    moat = okanjo.config.moat;


                // Build config param string
                moat.clientLevels.every(function (v, i) {
                    if (v !== null) moatParams.push('moatClientLevel' + (i + 1) + '=' + v);
                    return true;
                });
                moat.clientSlicers.every(function (v, i) {
                    if (v !== null) moatParams.push('moatClientSlicer' + (i + 1) + '=' + v);
                    return true;
                });
                moatParams = moatParams.join('&');

                ns.className = 'MOAT-' + moat.tag + '?' + moatParams;

                ma.type = 'text/javascript';
                ma.async = true;
                ma.src = '//js.moatads.com/' + moat.tag + '/moatad.js#' + moatParams;

                b.appendChild(ns);
                b.appendChild(ma);
            }
        }

    };

})(okanjo, this);