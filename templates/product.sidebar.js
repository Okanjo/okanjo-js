
okanjo.mvc.registerCss("product.sidebar", "@@include(jsStringEscape('product.sidebar.css'))", { id: 'okanjo-product-sidebar' });

// Note: Requires product.block.js for product_block content
okanjo.mvc.registerTemplate("product.sidebar", product_block, function(data, options) {
    // Ensure params
    data = data || { products: [], config: {} };
    options = okanjo.util.clone(options);

    // Copy, format and return the config and products
    options.template_name = 'okanjo-product-sidebar';
    options.config = data.config;
    options.products = okanjo.mvc.formats.product(data.products);
    return options;
}, {
    css: [ /*'okanjo.core',*/ 'product.sidebar', 'okanjo.modal']
});
    
    
