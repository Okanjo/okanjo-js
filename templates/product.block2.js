
    okanjo.mvc.registerCss("product.block2", "@@include(jsStringEscape('product.block2.css'))", { id: 'okanjo-product-block2' });

    var product_block2 = "@@include(jsStringEscape('product.block2.mustache'))",
        blockId = 0;

    okanjo.mvc.registerTemplate("product.block2", product_block2, function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.template_name = 'okanjo-product-block2';
        options.config = data.config;
        options.proxy_url = this.proxy_url;
        options.products = okanjo.mvc.formats.product(data.products);
        options.article_id = this.articleId || "";
        options.placement_test_enabled = this.placementTest && this.placementTest.enabled ? "1" : "0";
        options.placement_test_id = this.placementTest ? this.placementTest.id : "";
        options.placement_test_seed = this.placementTest ? this.placementTest.seed : "";
        options.disable_popup = this.disable_popup ? "1" : "";


        // enforce format restrictions
        if ((options.config.size == "leaderboard")  || (options.config.size == "large_mobile_banner")) {
            options.config.template_layout = "list";
            options.config.template_cta_style = "link";
        } else if (options.config.size == "half_page") {
            options.config.template_layout = "list";
        }

        // add branding if necessary
        var brandColor = options.config.template_cta_color;

        if (brandColor) {
            var brandCSS,
                brandCSSId = "okanjo-product-block2-cus-" + blockId;

            brandCSS = ".okanjo-product-block2."+brandCSSId+" .okanjo-product-buy-button { color: "+brandColor+";} " +
                ".okanjo-product-block2."+brandCSSId+".okanjo-cta-style-button .okanjo-product-buy-button { border: 1px solid "+brandColor+"; } " +
                ".okanjo-product-block2."+brandCSSId+".okanjo-cta-style-button .okanjo-product-buy-button:hover { background: "+brandColor+"; } ";

            okanjo.mvc.registerCss(brandCSSId, brandCSS, { id: brandCSSId });
            okanjo.mvc.ensureCss(brandCSSId);
        }

        options.blockId = blockId++;



        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.block2', 'okanjo.modal']
    });


