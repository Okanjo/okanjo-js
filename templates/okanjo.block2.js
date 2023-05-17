(function(window) {
    const okanjo = window.okanjo;
    okanjo.ui.engine.registerCss("okanjo.block2", "@@include(jsStringEscape('okanjo.block2.css'))", {id: 'okanjo-block2'});

    okanjo.ui.__block2 = "@@include(jsStringEscape('okanjo.block2.mustache'))";

    okanjo.ui.engine.registerTemplate("container.block2", okanjo.ui.__block2, function (model) {
        model.config = this.config;
        model.instanceId = this.instanceId;
        return model;
    }, {
        css: ['okanjo.block2']
    });
})(window);