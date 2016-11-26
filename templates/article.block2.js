
    okanjo.mvc.registerCss("article.block2", "@@include(jsStringEscape('article.block2.css'))", { id: 'okanjo-article-block2' });

    var article_block2 = "@@include(jsStringEscape('article.block2.mustache'))",
        blockId = 0;

    okanjo.mvc.registerTemplate("article.block2", article_block2, function(data, options) {
        // Ensure params
        data = data || { articles: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.template_name = 'okanjo-article-block2';
        options.config = data.config;
        options.proxy_url = this.proxy_url;
        options.articles = okanjo.mvc.formats.article(data.articles);
        options.instanceId = this.instanceId;

        var eventData = okanjo.util.deepClone(this.metricBase, {});
        eventData.m = okanjo.metrics.truncate(okanjo.metrics.copy(this.config, eventData.m));
        options.metricBaseJSON = JSON.stringify(eventData);


        // enforce format restrictions
        if ((options.config.size == "leaderboard") || (options.config.size == "large_mobile_banner")) {
            options.config.template_layout = "list";
            options.config.template_cta_style = "link";
        } else if ((options.config.size == "half_page") || (options.config.size == "auto")){
            options.config.template_layout = "list";
        }

        // add branding if necessary
        var brandColor = options.config.template_cta_color;

        if (brandColor) {
            var brandCSS,
                brandCSSId = "okanjo-article-block2-cus-" + blockId;

            brandCSS = ".okanjo-article-block2."+brandCSSId+" .okanjo-article-buy-button { color: "+brandColor+";} " +
                ".okanjo-article-block2."+brandCSSId+".okanjo-cta-style-button .okanjo-article-buy-button { border: 1px solid "+brandColor+"; } " +
                ".okanjo-article-block2."+brandCSSId+".okanjo-cta-style-button .okanjo-article-buy-button:hover { background: "+brandColor+"; } ";

            okanjo.mvc.registerCss(brandCSSId, brandCSS, { id: brandCSSId });
            okanjo.mvc.ensureCss(brandCSSId);
        }

        options.blockId = blockId++;



        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'article.block2', 'okanjo.modal']
    });


