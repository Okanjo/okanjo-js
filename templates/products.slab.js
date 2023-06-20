(function(window) {

    const okanjo = window.okanjo;
    okanjo.ui.engine.registerCss("products.slab", "@@include(jsStringEscape('products.slab.css'))", {id: 'okanjo-product-slab'});

    // Reuses block2 markup layout, extended css
    okanjo.ui.engine.registerTemplate("products.slab", okanjo.ui.__product_block2, function (model) {
        model.blockClasses = ['okanjo-slab'];
        model.config = this.config;
        model.instanceId = this.instanceId;
        model.metricChannel = this._metricBase.ch;
        model.metricContext = this._metricBase.cx;
        model.metricParams = okanjo.net.request.stringify(this._metricBase);
        model.fitImage = 'okanjo-fit';
        model.price_classes = this.config.hide_pricing ? 'okanjo-invisible' : '';

        // Enforce format restrictions
        // this._enforceLayoutOptions();
        this._enforceSlabLayoutOptions();

        // Add branding if necessary
        this._registerCustomBranding('.okanjo-product', 'button');

        return model;
    }, {
        css: [ 'products.slab', 'okanjo.slab', 'okanjo.block2' ]
    });

})(window);