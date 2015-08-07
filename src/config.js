

    okanjo.config = {

        // okanjo-ads api key
        key: undefined,

        // Okanjo default UA code
        analyticsId: 'UA-36849843-6',

        // Marketplace config
        marketplace: {
            uri: 'https://shop.okanjo.com',
            apiUri: 'https://api.okanjo.com',
            routerUri: 'https://shop.okanjo.com/widgets/router/',
            balancedMarketplacePath: '/v1/marketplaces/MP6vnNdXY7izEEVPs1gl7jSy',
            socketIOUri: 'https://mke-rt.okanjo.com:13443'
        },

        // Ads config
        ads: {
            apiUri: 'https://ads-api.okanjo.com'
        },

        // Moat Analytics config
        moat: {
            tag: 'okanjo969422799577'
        }
    };

    /**
     * Override the default production configuration
     * @param options
     */
    okanjo.configure = function(options) {

        // Merge keys
        Object.keys(options).every(function(root) {
            if (okanjo.config[root] && typeof okanjo.config[root] === "object" && typeof options[root] === "object") {
                Object.keys(options[root]).every(function(key) {
                    okanjo.config[root][key] = options[root][options[key]];
                    return true;
                });
            } else {
                okanjo.config[root] = options[root];
            }
            return true;
        });


    };