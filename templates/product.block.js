
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
        options.disable_popup = this.disable_popup ? "1" : "";
        options.instanceId = this.instanceId;

        var eventData = okanjo.util.deepClone(this.metricBase, {});
        eventData.m = okanjo.metrics.truncate(okanjo.metrics.copy(this.config, eventData.m));
        options.metricBaseJSON = JSON.stringify(eventData);

        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.block', 'okanjo.modal']
    });


