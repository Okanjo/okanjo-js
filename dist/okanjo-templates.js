/*! okanjo-js v0.6.15 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
(function(okanjo) {okanjo.mvc.registerCss("ad.block", ".okanjo-ad-block{position:relative}.okanjo-ad-block .okanjo-ad-dynamic-product .okanjo-product-list{margin:0;width:100%}.okanjo-ad-block.okanjo-ad-fit{width:100%;height:100%;position:relative}.okanjo-ad-block.okanjo-ad-fit .okanjo-ad-container,.okanjo-ad-block.okanjo-ad-fit .okanjo-ad-dynamic-product,.okanjo-ad-block.okanjo-ad-fit .okanjo-product-block,.okanjo-ad-block.okanjo-ad-fit .okanjo-product-list{height:100%;width:100%}.okanjo-ad-block.okanjo-ad-fit .okanjo-product-block .okanjo-product{height:100%;width:100%;padding:0;box-sizing:border-box;margin:0}.okanjo-ad-block.okanjo-ad-fit .okanjo-product-block .okanjo-product-image-container{margin:.5em}.okanjo-ad-block.okanjo-ad-fit .okanjo-product-block .okanjo-product-title-container{height:auto;margin:1em .5em}.okanjo-ad-block.okanjo-ad-fit .okanjo-product-block .okanjo-product-price-container{position:absolute;bottom:.5em;background:#fff;padding:.25em 0 0;margin:0 1px 0 0;left:1px;right:1px}.okanjo-ad-block.okanjo-ad-fit .okanjo-product-block.lt-ie9 .okanjo-product-title-container:before{display:none}", { id: 'okanjo-ad-block' });

okanjo.mvc.registerTemplate("ad.block", "<div class=\"okanjo-ad-block {{classDetects}}\"><div class=\"okanjo-ad-container okanjo-expansion-root\" data-size={{size}}></div><div class=okanjo-ad-meta></div></div>", function(data, options) {
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


okanjo.mvc.registerCss("okanjo.core", "", { id: 'okanjo-core' });
okanjo.mvc.registerCss("okanjo.modal", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}html.okanjo-modal-active{overflow:hidden!important}html.okanjo-modal-active body{overflow:hidden!important;margin:0}.okanjo-modal-margin-fix{margin-right:15px!important}.okanjo-modal-container{position:fixed;top:0;right:0;left:0;bottom:0;z-index:2147483647;background-color:rgba(0,0,0,.65);-webkit-transition-duration:210ms;transition-duration:210ms;-webkit-transition-property:background-color;transition-property:background-color}.okanjo-modal-container.lt-ie9{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiWAoAAK4AqL41IDIAAAAASUVORK5CYII=)}.okanjo-modal-container.okanjo-modal-fade-out{background-color:rgba(0,0,0,0)}.okanjo-modal-container.okanjo-modal-fade-out .okanjo-modal-window{opacity:0;-webkit-transform:scale(.95,.95) translateY(50px);transform:scale(.95,.95) translateY(50px)}.okanjo-modal-container.okanjo-modal-hidden{display:none!important}.okanjo-modal-container .okanjo-modal-window{position:relative;max-width:900px;width:90%;background:0 0;margin:56px auto 40px;opacity:1;-webkit-transform:scale(1,1) translateY(0);transform:scale(1,1) translateY(0);-webkit-transition-duration:210ms;transition-duration:210ms;-webkit-transition-timing-function:cubic-bezier(.13,.025,.15,1.15);transition-timing-function:cubic-bezier(.13,.025,.15,1.15);transition-property:-webkit-transform,opacity}.okanjo-modal-container .okanjo-modal-window:after,.okanjo-modal-container .okanjo-modal-window:before{content:\" \";display:table}.okanjo-modal-container .okanjo-modal-window:after{clear:both}.okanjo-modal-container .okanjo-modal-window .okanjo-modal-header{padding-top:5px;padding-bottom:5px;border-bottom:1px solid #d7d7d7}.okanjo-modal-container .okanjo-modal-window .okanjo-modal-header img{height:50px;width:auto}.okanjo-modal-container .okanjo-modal-window-skin{width:auto;height:auto;box-shadow:0 10px 25px rgba(0,0,0,.5);position:absolute;background:#fff;border-radius:4px;top:0;bottom:0;left:0;right:0}.okanjo-modal-container .okanjo-modal-window-outer{position:absolute;top:15px;left:15px;bottom:15px;right:15px;vertical-align:top}.okanjo-modal-container .okanjo-modal-window-inner{position:relative;width:100%;height:100%;-webkit-overflow-scrolling:touch;overflow:auto}.okanjo-modal-container .okanjo-modal-window-inner iframe{height:100%;width:100%;margin-right:-15px}.okanjo-modal-container .okanjo-modal-close-button{color:#fff;cursor:pointer;position:absolute;right:0;top:-48px;text-align:right;font-size:40px;line-height:1em;overflow:visible;width:40px;height:40px}", { id: 'okanjo-modal' });

okanjo.mvc.registerTemplate("okanjo.error", "<span class=okanjo-error>{{ message }}</span> {{#code}} <span class=okanjo-error-code>Reference: {{ code }}</span> {{/code}}", { css: ['okanjo.core'] });

    okanjo.mvc.registerCss("product.block", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-product-block{font:14px Helvetica,Arial,sans-serif;line-height:1.2em}.okanjo-product-block a{display:block;text-decoration:none}.okanjo-product-block a:after,.okanjo-product-block a:before{content:\" \";display:table}.okanjo-product-block a:after{clear:both}.okanjo-product-block .okanjo-product-list{list-style-type:none;padding:0;margin:0}.okanjo-product-block .okanjo-product{width:130px;overflow:hidden;text-align:center;border:1px solid #ccc;padding:7px;margin:0 4px 1px 0;display:inline-block;box-shadow:1px 1px 1px 1px #eee;background-color:#fff;box-sizing:content-box}.lt-ie8.okanjo-product-block .okanjo-product{display:inline;zoom:1}.okanjo-product-block .okanjo-product-image-container{height:130px}.okanjo-product-block .okanjo-product-image{max-width:100%;max-height:100%;border:0}.okanjo-product-block .okanjo-product-title-container{line-height:17px;overflow:hidden;height:51px;margin:10px 0 0;word-wrap:break-word}.okanjo-product-block .okanjo-product-title-container span{display:inline-block}.lt-ie8.okanjo-product-block .okanjo-product-title-container span{display:inline;zoom:1}.okanjo-product-block .okanjo-ellipses:after{content:\"...\"}.okanjo-product-block .okanjo-visually-hidden{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-product-block .okanjo-product-price-container{line-height:21px;font-weight:700;color:#333;margin-top:5px;margin-bottom:5px;margin-right:5px}.okanjo-product-block .okanjo-product-buy-button{color:#333;border:1px solid #ccc;border-bottom-color:#bbb;background-color:#eee;background-repeat:no-repeat;background-image:-webkit-linear-gradient(top,#fff,#eee);background-image:linear-gradient(to bottom,#fff,#eee);text-shadow:0 1px 1px rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 1px 2px rgba(0,0,0,.05);-webkit-transition:.1s;transition:.1s;font-size:13px;border-radius:4px;padding:5px 12px 6px;position:relative;bottom:2px}.okanjo-product-block a:hover .okanjo-product-buy-button{color:#111;border:1px solid #bbb;border-bottom-color:#aaa;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 1px 3px rgba(0,0,0,.1)}.okanjo-product-block .okanjo-product-seller-container{margin-top:5px;height:17px;font-size:12px;line-height:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-product-block .okanjo-product-seller-container .okanjo-product-seller-intro{color:#333}.okanjo-inline-buy-frame{display:block;height:100%;width:100%}", { id: 'okanjo-product-block' });

    var product_block = "<div class=\"{{template_name}} okanjo-expansion-root {{classDetects}}\"><ul class=okanjo-product-list itemscope=\"\" itemtype=http://schema.org/ItemList>{{#products}}<li class=okanjo-product itemscope=\"\" itemtype=http://schema.org/Product><a href=\"//{{okanjoMetricUrl}}/metrics/pr/int?m[bot]=true&id={{ id }}&ch={{#config}}{{ metrics_context }}{{/config}}&cx={{#config}}{{ metrics_channel_context }}{{/config}}&key={{#config}}{{ key }}{{/config}}&n={{ now }}&u={{ escaped_buy_url }}\" data-inline-buy-url=\"{{ inline_buy_url }}\" data-buy-url=\"{{ buy_url }}\" data-metric-url=\"//{{okanjoMetricUrl}}/metrics/pr/int?id={{ id }}&ch={{#config}}{{ metrics_context }}{{/config}}&cx={{#config}}{{ metrics_channel_context }}{{/config}}&key={{#config}}{{ key }}{{/config}}\" data-proxy-url=\"{{ proxy_url}}\" data-expandable=\"{{#config}}{{ expandable }}{{/config}}\" data-channel=\"{{#config}}{{ metrics_context }}{{/config}}\" data-context=\"{{#config}}{{ metrics_channel_context }}{{/config}}\" data-article-id=\"{{ article_id }}\" data-placement-enabled=\"{{ placement_test_enabled }}\" data-placement-test=\"{{ placement_test_id }}\" data-placement-seed=\"{{ placement_test_seed }}\" data-disable-popup=\"{{ disable_popup }}\" data-id=\"{{ id }}\" data-instance-id=\"{{ instanceId }}\" target=_blank itemprop=url title=\"Buy now: {{ name }}\"><div class=okanjo-product-image-container><img class=okanjo-product-image src=\"{{ image_url }}\" title=\"{{ name }}\" itemprop=image></div><div class=okanjo-product-title-container><span class=okanjo-product-title itemprop=name>{{ name }}</span></div><div itemprop=offers itemscope=\"\" itemtype=http://schema.org/Offer><div class=okanjo-product-price-container><span itemprop=priceCurrency content=\"{{ currency }}\">$</span><span class=okanjo-product-price itemprop=price>{{ price_formatted }}</span></div><div class=okanjo-product-button-container><div class=okanjo-product-buy-button>Buy Now</div><meta property=url itemprop=url content=\"//{{okanjoMetricUrl}}/metrics/pr/int?m[bot]=true&m[microdata]=true&id={{id}}&ch={{#config}}{{ metrics_context }}{{/config}}&cx={{#config}}{{ metrics_channel_context }}{{/config}}&key={{#config}}{{ key }}{{/config}}&n={{ now }}&u={{ escaped_buy_url }}\"></div>{{#sold_by}}<div class=okanjo-product-seller-container itemprop=seller itemscope=\"\" itemtype=http://schema.org/Organization><span><span class=okanjo-product-seller-intro>From</span>&#32;<span class=okanjo-product-seller itemprop=name title=\"{{ sold_by }}\">{{ sold_by }}</span></span></div>{{/sold_by}}</div><div class=\"okanjo-product-meta okanjo-visually-hidden\">{{#impression_url}}<img src={{impression_url}} alt=\"\">{{/impression_url}}{{#upc}}<span itemprop=productID>upc:{{upc}}</span>{{/upc}} {{#manufacturer}}<span itemprop=manufacturer>{{manufacturer}}</span>{{/manufacturer}}</div></a></li>{{/products}}</ul><div class=\"okanjo-product-meta okanjo-visually-hidden\"></div></div>";

    okanjo.mvc.registerTemplate("product.block", product_block, function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.template_name = 'okanjo-product-block';
        options.config = data.config;
        options.proxy_url = this.proxy_url;
        options.products = okanjo.mvc.formats.product(data.products);

        options.article_id = this.articleId || "";
        options.placement_test_enabled = this.placementTest && this.placementTest.enabled ? "1" : "0";
        options.placement_test_id = this.placementTest ? this.placementTest.id : "";
        options.placement_test_seed = this.placementTest ? this.placementTest.seed : "";
        options.disable_popup = this.disable_popup ? "1" : "";
        options.instanceId = this.instanceId;

        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.block', 'okanjo.modal']
    });




    okanjo.mvc.registerCss("product.block2", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-product-block2{color:#333;font:12px/1.2 \"Helvetica Neue\",Helvetica,Roboto,Arial,sans-serif}.okanjo-product-block2:after,.okanjo-product-block2:before{content:\" \";display:table}.okanjo-product-block2:after{clear:both}.okanjo-product-block2 .okanjo-ellipses:after{content:\"...\"}.okanjo-product-block2 .okanjo-visually-hidden{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-product-block2 .okanjo-product{display:block;float:left;background-color:#fff;box-sizing:content-box;width:148px;border:1px solid #e6e6e6;margin:0 -1px -1px 0}.okanjo-product-block2 .okanjo-product:last-child{margin:0}.okanjo-product-block2 a{display:block;overflow:hidden;color:#333;text-decoration:none;padding:10px}.okanjo-product-block2 a:hover{color:inherit;text-decoration:none}.okanjo-product-block2 .okanjo-product-image-container{float:left;overflow:hidden;text-align:center;vertical-align:middle;width:100%;height:128px;line-height:127px;margin:0 0 3px}.okanjo-product-block2 .okanjo-product-image{max-width:100%;max-height:100%;border:none;vertical-align:middle}.okanjo-product-block2 .okanjo-product-info-container{float:left;height:auto;width:100%}.okanjo-product-block2 .okanjo-product-seller-container{color:#999;font-size:11px;line-height:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-product-block2 .okanjo-product-seller-container.newsprint{font-family:Georgia,serif}.okanjo-product-block2 .okanjo-product-title-container{overflow:hidden;margin-top:3px;margin-bottom:4px;font-weight:700;font-size:12px;line-height:14px;height:45px;word-wrap:break-word}.okanjo-product-block2 .okanjo-product-title-container.newsprint{font:13px/15px Georgia,serif}.okanjo-product-block2 .okanjo-product-title-container span{display:inline-block}.lt-ie8.okanjo-product-block2 .okanjo-product-title-container span{display:inline;zoom:1}.okanjo-product-block2 .okanjo-product-price-container{font-size:15px;line-height:1;margin-bottom:5px}.okanjo-product-block2 .okanjo-product-buy-button{color:#09f;font-size:12px;line-height:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-product-block2 .okanjo-product.list{width:298px;height:122px}.okanjo-product-block2 .okanjo-product.list a{padding:11px}.okanjo-product-block2 .okanjo-product.list .okanjo-product-title-container{margin-top:4px;margin-bottom:6px}.okanjo-product-block2 .okanjo-product.list .okanjo-product-image-container{width:100px;height:100px;line-height:1px;margin:0 11px 0 0}.okanjo-product-block2 .okanjo-product.list .okanjo-product-info-container{height:auto;float:none}.okanjo-product-block2.okanjo-cta-style-button .okanjo-product-title-container{height:30px}.okanjo-product-block2.okanjo-cta-style-button .okanjo-product-buy-button{display:block;text-align:center;line-height:26px;padding:0 8px;border:1px solid #09f;border-radius:2px;-webkit-transition:50ms ease;transition:50ms ease}.okanjo-product-block2.okanjo-cta-style-button .okanjo-product-buy-button:hover{background:#09f;color:#fff}.okanjo-product-block2.okanjo-cta-style-button .okanjo-product-buy-button:active{box-shadow:inset 0 3px 10px rgba(0,0,0,.15)}.okanjo-product-block2.medium_rectangle .okanjo-product{width:148px;height:248px}.okanjo-product-block2.medium_rectangle .okanjo-product:first-child{width:149px;height:248px}.okanjo-product-block2.medium_rectangle .okanjo-product.list{width:298px;height:123px}.okanjo-product-block2.medium_rectangle .okanjo-product.list .okanjo-product-image-container{width:100px;height:100px;line-height:1px}.okanjo-product-block2.medium_rectangle .okanjo-product.list .okanjo-product-info-container{height:auto;float:left;width:165px}.okanjo-product-block2.medium_rectangle .okanjo-product.list:first-child{height:124px}.okanjo-product-block2.medium_rectangle .okanjo-product.list:first-child a{padding-top:12px}.okanjo-product-block2.leaderboard .okanjo-product{width:241px;height:88px}.okanjo-product-block2.leaderboard .okanjo-product:first-child{width:242px}.okanjo-product-block2.leaderboard .okanjo-product a{padding:7px}.okanjo-product-block2.leaderboard .okanjo-product .okanjo-product-image-container{width:74px;height:74px;line-height:1px;margin:0 7px 0 0}.okanjo-product-block2.leaderboard .okanjo-product .okanjo-product-title-container{font-size:11px;line-height:13px;height:26px;margin-top:1px;margin-bottom:4px}.okanjo-product-block2.half_page .okanjo-product .okanjo-product-title-container,.okanjo-product-block2.leaderboard .okanjo-product .okanjo-product-price-container{margin-bottom:3px}.okanjo-product-block2.leaderboard .okanjo-product .okanjo-product-title-container.newsprint{font:700 11px/13px Georgia,serif}.okanjo-product-block2.half_page .okanjo-product{height:118px}.okanjo-product-block2.half_page .okanjo-product:nth-last-child(n+2){height:119px}.okanjo-product-block2.half_page .okanjo-product .okanjo-product-image-container{width:96px;height:96px}.okanjo-product-block2.large_mobile_banner .okanjo-product{width:318px;height:98px}.okanjo-product-block2.large_mobile_banner .okanjo-product a{padding:6px}.okanjo-product-block2.large_mobile_banner .okanjo-product .okanjo-product-image-container{width:86px;height:86px}.okanjo-product-block2.large_mobile_banner .okanjo-product .okanjo-product-title-container{height:30px}.okanjo-inline-buy-frame{display:block;height:100%;width:100%}", { id: 'okanjo-product-block2' });

    var product_block2 = "<div class=\"{{template_name}} okanjo-expansion-root {{classDetects}} {{#config}} {{ size }} okanjo-cta-style-{{ template_cta_style }}{{^template_cta_style}}link{{/template_cta_style}}{{/config}} okanjo-product-block2-cus-{{blockId}}\"><div class=okanjo-product-list itemscope=\"\" itemtype=http://schema.org/ItemList>{{#products}}<div class=\"okanjo-product {{#config}}{{ template_layout }}{{/config}}\" itemscope=\"\" itemtype=http://schema.org/Product><a href=\"//{{okanjoMetricUrl}}/metrics/pr/int?m[bot]=true&id={{ id }}&ch={{#config}}{{ metrics_context }}{{/config}}&cx={{#config}}{{ metrics_channel_context }}{{/config}}&key={{#config}}{{ key }}{{/config}}&n={{ now }}&u={{ escaped_buy_url }}\" data-inline-buy-url=\"{{ inline_buy_url }}\" data-buy-url=\"{{ buy_url }}\" data-metric-url=\"//{{okanjoMetricUrl}}/metrics/pr/int?id={{ id }}&ch={{#config}}{{ metrics_context }}{{/config}}&cx={{#config}}{{ metrics_channel_context }}{{/config}}&key={{#config}}{{ key }}{{/config}}\" data-proxy-url=\"{{ proxy_url}}\" data-expandable=\"{{#config}}{{ expandable }}{{/config}}\" data-channel=\"{{#config}}{{ metrics_context }}{{/config}}\" data-context=\"{{#config}}{{ metrics_channel_context }}{{/config}}\" data-article-id=\"{{ article_id }}\" data-placement-enabled=\"{{ placement_test_enabled }}\" data-placement-test=\"{{ placement_test_id }}\" data-placement-seed=\"{{ placement_test_seed }}\" data-disable-popup=\"{{ disable_popup }}\" data-instance-id=\"{{ instanceId }}\" data-id=\"{{ id }}\" target=_blank itemprop=url title=\"Buy now: {{ name }}\"><div class=okanjo-product-image-container><img class=okanjo-product-image src=\"{{ image_url }}\" title=\"{{ name }}\" itemprop=image></div><div class=okanjo-product-info-container><div class=\"okanjo-product-seller-container {{#config}}{{ template_theme }}{{/config}}\" itemprop=seller itemscope=\"\" itemtype=http://schema.org/Organization><span class=okanjo-product-seller itemprop=name title=\"{{ sold_by }}\">{{ sold_by }}{{^sold_by}}&nbsp;{{/sold_by}}</span></div><div class=\"okanjo-product-title-container {{#config}}{{ template_theme }}{{/config}}\"><span class=okanjo-product-title itemprop=name>{{ name }}</span></div><div itemprop=offers itemscope=\"\" itemtype=http://schema.org/Offer><div class=okanjo-product-price-container><span itemprop=priceCurrency content=\"{{ currency }}\">$</span><span class=okanjo-product-price itemprop=price>{{ price_formatted }}</span></div><div class=okanjo-product-button-container><div class=okanjo-product-buy-button><span>{{meta.cta_text}}{{^meta.cta_text}}{{#config}}{{ template_cta_text }}{{^template_cta_text}}Shop Now{{/template_cta_text}}{{/config}}{{/meta.cta_text}}</span></div><meta property=url itemprop=url content=\"//{{okanjoMetricUrl}}/metrics/pr/int?m[bot]=true&m[microdata]=true&id={{id}}&ch={{#config}}{{ metrics_context }}{{/config}}&cx={{#config}}{{ metrics_channel_context }}{{/config}}&key={{#config}}{{ key }}{{/config}}&n={{ now }}&u={{ escaped_buy_url }}\"></div></div><div class=\"okanjo-product-meta okanjo-visually-hidden\">{{#impression_url}}<img src={{impression_url}} alt=\"\">{{/impression_url}}{{#upc}}<span itemprop=productID>upc:{{upc}}</span>{{/upc}} {{#manufacturer}}<span itemprop=manufacturer>{{manufacturer}}</span>{{/manufacturer}}</div></div></a></div>{{/products}}</div><div class=\"okanjo-product-meta okanjo-visually-hidden\"></div></div>",
        blockId = 0;

    okanjo.mvc.registerTemplate("product.block2", product_block2, function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.template_name = 'okanjo-product-block2';
        options.config = data.config;
        options.proxy_url = this.proxy_url;
        options.products = okanjo.mvc.formats.product(data.products);
        options.article_id = this.articleId || "";
        options.placement_test_enabled = this.placementTest && this.placementTest.enabled ? "1" : "0";
        options.placement_test_id = this.placementTest ? this.placementTest.id : "";
        options.placement_test_seed = this.placementTest ? this.placementTest.seed : "";
        options.disable_popup = this.disable_popup ? "1" : "";
        options.instanceId = this.instanceId;


        // enforce format restrictions
        if ((options.config.size == "leaderboard")  || (options.config.size == "large_mobile_banner")) {
            options.config.template_layout = "list";
            options.config.template_cta_style = "link";
        } else if (options.config.size == "half_page") {
            options.config.template_layout = "list";
        }

        // add branding if necessary
        var brandColor = options.config.template_cta_color;

        if (brandColor) {
            var brandCSS,
                brandCSSId = "okanjo-product-block2-cus-" + blockId;

            brandCSS = ".okanjo-product-block2."+brandCSSId+" .okanjo-product-buy-button { color: "+brandColor+";} " +
                ".okanjo-product-block2."+brandCSSId+".okanjo-cta-style-button .okanjo-product-buy-button { border: 1px solid "+brandColor+"; } " +
                ".okanjo-product-block2."+brandCSSId+".okanjo-cta-style-button .okanjo-product-buy-button:hover { background: "+brandColor+"; } ";

            okanjo.mvc.registerCss(brandCSSId, brandCSS, { id: brandCSSId });
            okanjo.mvc.ensureCss(brandCSSId);
        }

        options.blockId = blockId++;



        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.block2', 'okanjo.modal']
    });




okanjo.mvc.registerCss("product.sidebar", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-product-sidebar{font:14px Helvetica,Arial,sans-serif;line-height:1.2em;border:1px solid #ccc;background-color:#fff;width:298px;height:auto}.okanjo-product-sidebar a{display:block;text-decoration:none}.okanjo-product-sidebar a:after,.okanjo-product-sidebar a:before{content:\" \";display:table}.okanjo-product-sidebar a:after{clear:both}.okanjo-product-sidebar .okanjo-product-list{list-style-type:none;padding:0;margin:0}.okanjo-product-sidebar .okanjo-product{height:123px;width:298px;overflow:hidden;border-top:1px solid #eee}.okanjo-product-sidebar .okanjo-product:first-of-type{height:124px;border-top:none}.okanjo-product-sidebar .okanjo-product-image-container{height:105px;width:105px;margin:10px;float:left}.okanjo-product-sidebar .okanjo-product-image{max-width:100%;max-height:100%;border:0}.okanjo-product-sidebar .okanjo-product-title-container{line-height:17px;overflow:hidden;height:51px;margin:10px 10px 0 0;word-wrap:break-word}.okanjo-product-sidebar .okanjo-product-title-container span{display:inline-block}.lt-ie8.okanjo-product-sidebar .okanjo-product-title-container span{display:inline;zoom:1}.okanjo-product-sidebar .okanjo-ellipses:after{content:\"...\"}.okanjo-product-sidebar .okanjo-visually-hidden{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-product-sidebar .okanjo-product-price-container{display:inline-block;line-height:21px;font-weight:700;color:#333;margin-top:5px;margin-bottom:5px;margin-right:5px}.lt-ie8.okanjo-product-sidebar .okanjo-product-price-container{display:inline;zoom:1}.okanjo-product-sidebar .okanjo-product-button-container{display:inline-block}.lt-ie8.okanjo-product-sidebar .okanjo-product-button-container{display:inline;zoom:1}.okanjo-product-sidebar .okanjo-product-buy-button{color:#333;border:1px solid #ccc;border-bottom-color:#bbb;background-color:#eee;background-repeat:no-repeat;background-image:-webkit-linear-gradient(top,#fff,#eee);background-image:linear-gradient(to bottom,#fff,#eee);text-shadow:0 1px 1px rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 1px 2px rgba(0,0,0,.05);-webkit-transition:.1s;transition:.1s;font-size:13px;border-radius:4px;padding:5px 12px 6px;position:relative;bottom:2px;display:inline-block;margin-top:5px}.lt-ie8.okanjo-product-sidebar .okanjo-product-buy-button{display:inline;zoom:1}.okanjo-product-sidebar a:hover .okanjo-product-buy-button{color:#111;border:1px solid #bbb;border-bottom-color:#aaa;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 1px 3px rgba(0,0,0,.1)}.okanjo-product-sidebar .okanjo-product-seller-container{margin-top:5px;height:17px;font-size:12px;line-height:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-product-sidebar .okanjo-product-seller-container .okanjo-product-seller-intro{color:#333}.okanjo-inline-buy-frame{display:block;height:100%;width:100%}", { id: 'okanjo-product-sidebar' });

// Note: Requires product.block.js for product_block content
okanjo.mvc.registerTemplate("product.sidebar", product_block, function(data, options) {
    // Ensure params
    data = data || { products: [], config: {} };
    options = okanjo.util.clone(options);

    // Copy, format and return the config and products
    options.template_name = 'okanjo-product-sidebar';
    options.config = data.config;
    options.proxy_url = this.proxy_url;
    options.products = okanjo.mvc.formats.product(data.products);

    options.article_id = this.articleId || "";
    options.placement_test_enabled = this.placementTest && this.placementTest.enabled ? "1" : "0";
    options.placement_test_id = this.placementTest ? this.placementTest.id : "";
    options.placement_test_seed = this.placementTest ? this.placementTest.seed : "";
    options.disable_popup = this.disable_popup ? "1" : "";

    return options;
}, {
    css: [ /*'okanjo.core',*/ 'product.sidebar', 'okanjo.modal']
});
    
    


    okanjo.mvc.registerCss("product.single", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-product-single{font:14px Helvetica,Arial,sans-serif;line-height:1.2em}.okanjo-product-single a{display:block;text-decoration:none}.okanjo-product-single a:after,.okanjo-product-single a:before{content:\" \";display:table}.okanjo-product-single a:after{clear:both}.okanjo-product-single .okanjo-product-list{list-style-type:none;padding:0;margin:0}.okanjo-product-single .okanjo-product{width:284px;height:234px;padding:7px;overflow:hidden;text-align:center;border:1px solid #ccc;display:inline-block;background-color:#fff}.lt-ie8.okanjo-product-single .okanjo-product{display:inline;zoom:1}.okanjo-product-single .okanjo-product-image-container{height:113px}.okanjo-product-single .okanjo-product-image{max-width:100%;max-height:100%;border:0}.okanjo-product-single .okanjo-product-title-container{line-height:17px;overflow:hidden;height:34px;margin:10px 0 0;word-wrap:break-word}.okanjo-product-single .okanjo-product-title-container>span{max-width:100%}.okanjo-product-single .okanjo-product-title-container span{display:inline-block}.lt-ie8.okanjo-product-single .okanjo-product-title-container span{display:inline;zoom:1}.okanjo-product-single .okanjo-ellipses:after{content:\"...\"}.okanjo-product-single .okanjo-visually-hidden{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-product-single .okanjo-product-price-container{line-height:21px;font-weight:700;color:#333;margin-top:3px;margin-bottom:5px;margin-right:5px}.okanjo-product-single .okanjo-product-button-container{display:inline-block}.lt-ie8.okanjo-product-single .okanjo-product-button-container{display:inline;zoom:1}.okanjo-product-single .okanjo-product-buy-button{color:#333;border:1px solid #ccc;border-bottom-color:#bbb;background-color:#eee;background-repeat:no-repeat;background-image:-webkit-linear-gradient(top,#fff,#eee);background-image:linear-gradient(to bottom,#fff,#eee);text-shadow:0 1px 1px rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 1px 2px rgba(0,0,0,.05);-webkit-transition:.1s;transition:.1s;font-size:13px;border-radius:4px;padding:5px 12px 6px;position:relative;bottom:2px;display:inline-block}.lt-ie8.okanjo-product-single .okanjo-product-buy-button{display:inline;zoom:1}.okanjo-product-single a:hover .okanjo-product-buy-button{color:#111;border:1px solid #bbb;border-bottom-color:#aaa;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 1px 3px rgba(0,0,0,.1)}.okanjo-product-single .okanjo-product-seller-container{margin-top:5px;height:17px;font-size:12px;line-height:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-product-single .okanjo-product-seller-container .okanjo-product-seller-intro{color:#333}.okanjo-inline-buy-frame{display:block;height:100%;width:100%}", { id: 'okanjo-product-single' });

    // Note: Requires product.block.js for product_block content
    okanjo.mvc.registerTemplate("product.single", product_block, function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.template_name = 'okanjo-product-single';
        options.config = data.config;
        options.proxy_url = this.proxy_url;
        options.products = okanjo.mvc.formats.product(data.products);

        options.article_id = this.articleId || "";
        options.placement_test_enabled = this.placementTest && this.placementTest.enabled ? "1" : "0";
        options.placement_test_id = this.placementTest ? this.placementTest.id : "";
        options.placement_test_seed = this.placementTest ? this.placementTest.seed : "";
        options.disable_popup = this.disable_popup ? "1" : "";
        options.instanceId = this.instanceId;


        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.single', 'okanjo.modal']
    });


})(okanjo);