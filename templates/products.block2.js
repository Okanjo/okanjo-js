import okanjo from '/src/Okanjo';

okanjo.ui.engine.registerCss("products.block2", "@@include(jsStringEscape('products.block2.css'))", { id: 'okanjo-product-block2' });

const product_block2 = "@@include(jsStringEscape('products.block2.mustache'))";

okanjo.ui.engine.registerTemplate("products.block2", product_block2, function(model) {

    // Attach placement properties
    const data = (this._response || { data: { results: [] } }).data || { results: [] };
    model.products = data.results;
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase);

    // Enforce format restrictions
    this._enforceLayoutOptions();

    // Add branding if necessary
    this._registerCustomBranding('.okanjo-product', 'buy-button');

    return model;
}, {
    css: [ /*'okanjo.core',*/ 'products.block2', 'okanjo.block2', 'okanjo.modal']
});