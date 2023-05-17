(function(window) {

    const okanjo = window.okanjo;
    okanjo.ui.engine.registerCss("articles.block2", "@@include(jsStringEscape('articles.block2.css'))", {id: 'okanjo-article-block2'});

    okanjo.ui.__article_block2 = "@@include(jsStringEscape('articles.block2.mustache'))";

    okanjo.ui.engine.registerTemplate("articles.block2", okanjo.ui.__article_block2, function (model) {
        model.config = this.config;
        model.instanceId = this.instanceId;
        model.metricChannel = this._metricBase.ch;
        model.metricContext = this._metricBase.cx;
        model.metricParams = okanjo.net.request.stringify(this._metricBase);
        model.fallbackSVG = okanjo.ui.articleSVG();

        // Enforce format restrictions
        this._enforceLayoutOptions();

        // Add branding if necessary
        this._registerCustomBranding('.okanjo-article', 'button');

        return model;
    }, {
        css: [/*'okanjo.core',*/ 'articles.block2', 'okanjo.block2' /*, 'okanjo.modal'*/]
    });

})(window);