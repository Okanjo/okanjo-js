okanjo.mvc.registerCss("ad.block", "@@include(jsStringEscape('ad.block.css'))", { id: 'okanjo-ad-block' });

okanjo.mvc.registerTemplate("ad.block", "@@include(jsStringEscape('ad.block.mustache'))", function(data, options) {
    // Ensure params
    data = data || { config: {} };
    options = okanjo.util.clone(options);

    // Copy, format and return the config and products
    options.config = data.config;
    options.size = data.config.size || "undefined";
    return options;
}, {
    css: [ 'ad.block' ]
});
