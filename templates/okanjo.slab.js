(function(window) {
    const okanjo = window.okanjo;
    okanjo.ui.engine.registerCss("okanjo.slab", "@@include(jsStringEscape('okanjo.slab.css'))", {id: 'okanjo-slab'});

    okanjo.ui.engine.registerTemplate("container.slab", okanjo.ui.__block2, function (model) {
        model.config = this.config;
        model.instanceId = this.instanceId;
        model.blockClasses = ['okanjo-slab'];
        model.fitImage = 'okanjo-fit';

        // Enforce format restrictions
        this._enforceSlabLayoutOptions();

        return model;
    }, {
        css: ['okanjo.slab', 'okanjo.block2', 'okanjo.modal']
    });
})(window);