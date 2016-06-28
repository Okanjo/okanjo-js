
    okanjo.mvc.registerCss("product.single", "@@include(jsStringEscape('product.single.css'))", { id: 'okanjo-product-single' });

    // Note: Requires product.block.js for product_block content
    okanjo.mvc.registerTemplate("product.single", product_block, function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.template_name = 'okanjo-product-single';
        options.config = data.config;
        options.proxy_url = this.proxy_url;
        options.products = okanjo.mvc.formats.product(data.products);

        options.article_id = this.articleId || "";
        options.placement_test_enabled = this.placementTest && this.placementTest.enabled ? "1" : "0";
        options.placement_test_id = this.placementTest ? this.placementTest.id : "";
        options.placement_test_seed = this.placementTest ? this.placementTest.seed : "";
        options.disable_popup = this.disable_popup ? "1" : "";
        options.instanceId = this.instanceId;


        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.single', 'okanjo.modal']
    });


