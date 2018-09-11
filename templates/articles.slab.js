(function(window) {

    const okanjo = window.okanjo;
    okanjo.ui.engine.registerCss("articles.slab", "@@include(jsStringEscape('articles.slab.css'))", {id: 'okanjo-article-slab'});

    // Reuses block2 markup layout, extended css
    okanjo.ui.engine.registerTemplate("articles.slab", okanjo.ui.__article_block2, function (model) {
        const data = (this._response || { data: { results: [] } }).data || { results: [] };
        model.blockClasses = ['okanjo-slab'];
        model.articles = data.results;
        model.config = this.config;
        model.instanceId = this.instanceId;
        model.metricChannel = this._metricBase.ch;
        model.metricContext = this._metricBase.cx;
        model.metricParams = okanjo.net.request.stringify(this._metricBase);
        model.fitImage = 'okanjo-fit';

        // Enforce format restrictions
        // this._enforceLayoutOptions();
        this._enforceSlabLayoutOptions();

        // Add branding if necessary
        this._registerCustomBranding('.okanjo-article', 'button');

        return model;
    }, {
        css: [ 'articles.slab',/* 'articles.block2',*/ 'okanjo.block2' ]
    });

})(window);