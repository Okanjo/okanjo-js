
    okanjo.mvc.registerCss("product.block", "@@include(jsStringEscape('product.block.css'))", { id: 'okanjo-product-block' });

    okanjo.mvc.registerTemplate("product.block", "@@include(jsStringEscape('product.block.mustache'))", function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.config = data.config;
        options.products = okanjo.mvc.formats.product(data.products);
        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.block', 'okanjo.modal']
    });


