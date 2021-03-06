(function(window) {

    const okanjo = window.okanjo;
    okanjo.ui.engine.registerCss("adx.block2", "@@include(jsStringEscape('adx.block2.css'))", {id: 'okanjo-adx-block2'});

    okanjo.ui.engine.registerTemplate("adx.block2", "@@include(jsStringEscape('adx.block2.mustache'))", function (model) {

        // Attach required properties
        model.config = this.config;
        model.instanceId = this.instanceId;
        model.metricParams = okanjo.net.request.stringify(this._metricBase);

        return model;
    }, {
        css: ['adx.block2','okanjo.block2']
    });

})(window);