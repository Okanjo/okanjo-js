
    okanjo.mvc.registerCss("product.block", "@@include(jsStringEscape('product.block.css'))", { id: 'okanjo-product-block' });

    var product_block = "@@include(jsStringEscape('product.block.mustache'))";

    okanjo.mvc.registerTemplate("product.block", product_block, function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.template_name = 'okanjo-product-block';
        options.config = data.config;
        options.products = okanjo.mvc.formats.product(data.products);
        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.block', 'okanjo.modal']
    });


