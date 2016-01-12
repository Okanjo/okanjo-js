
    var config = okanjo.config = okanjo.config || {};

    // okanjo-ads api key
    config.key = config.key || undefined;

        // Marketplace config
    config.marketplace = {
        uri: 'https://shop.okanjo.com',
        apiUri: 'https://api.okanjo.com',
        routerUri: 'https://shop.okanjo.com/widgets/router/',
        balancedMarketplacePath: '/v1/marketplaces/MP6vnNdXY7izEEVPs1gl7jSy',
        socketIOUri: 'https://mke-rt.okanjo.com:13443'
    };

        // Ads config
    config.ads = {
        apiUri: 'https://ads-api.okanjo.com'
    };

    /**
     * Override the default production configuration
     * @param options
     */
    okanjo.configure = function(options) {

        // Merge keys
        Object.keys(options).every(function(root) {
            if (config[root] && typeof config[root] === "object" && typeof options[root] === "object") {
                Object.keys(options[root]).every(function(key) {
                    config[root][key] = options[root][options[key]];
                    return true;
                });
            } else {
                config[root] = options[root];
            }
            return true;
        });


    };