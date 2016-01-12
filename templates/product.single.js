
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
        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.single', 'okanjo.modal']
    });


