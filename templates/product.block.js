
    okanjo.mvc.registerCss("product.block", "@@include(jsStringEscape('product.block.css'))", { id: 'okanjo-product-block' });

    var product_block = "@@include(jsStringEscape('product.block.mustache'))";

    okanjo.mvc.registerTemplate("product.block", product_block, function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.template_name = 'okanjo-product-block';
        options.config = data.config;
        options.proxy_url = this.proxy_url;
        options.products = okanjo.mvc.formats.product(data.products);

        options.article_id = this.articleId || "";
        options.placement_test_enabled = this.placementTest && this.placementTest.enabled ? "1" : "0";
        options.placement_test_id = this.placementTest ? this.placementTest.id : "";
        options.placement_test_seed = this.placementTest ? this.placementTest.seed : "";
        options.disable_popup = this.disable_popup ? "1" : "";

        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.block', 'okanjo.modal']
    });


