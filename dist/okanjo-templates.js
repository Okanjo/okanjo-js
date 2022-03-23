/*! okanjo-js v2.0.0 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
(function(okanjo) {(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("adx.block2", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-block2.okanjo-adx{padding:0}.okanjo-block2.okanjo-adx:after,.okanjo-block2.okanjo-adx:before{content:\" \";display:table}.okanjo-block2.okanjo-adx:after{clear:both}.okanjo-block2.okanjo-adx .okanjo-visually-hidden{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2.okanjo-adx .okanjo-adx-container{text-align:center;padding:0}.okanjo-block2.okanjo-adx .okanjo-adx-frame{margin:0}", {
    id: 'okanjo-adx-block2'
  });
  okanjo.ui.engine.registerTemplate("adx.block2", "<div class=\"okanjo-block2 okanjo-adx {{classDetects}}\"><div class=\"okanjo-adx-container okanjo-expansion-root\" data-size={{size.width}}x{{size.height}}></div><div class=okanjo-visually-hidden><img src=\"//cdn.okanjo.com/px/1.gif?n={{ now }}\"></div></div>", function (model) {
    // Attach required properties
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricParams = okanjo.net.request.stringify(this._metricBase);
    return model;
  }, {
    css: ['adx.block2', 'okanjo.block2']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("articles.block2", ".okanjo-block2 .okanjo-article.okanjo-cta-style-button .okanjo-resource-title-container{height:52px}.okanjo-block2 .okanjo-article .okanjo-resource-title-container.modern{height:44px}.okanjo-block2.leaderboard .okanjo-article .okanjo-resource-title-container{margin-top:2px;margin-bottom:4px}", {
    id: 'okanjo-article-block2'
  });
  okanjo.ui.__article_block2 = "<div class=\"okanjo-block2 okanjo-expansion-root {{ classDetects }} {{#config}} {{ size }} {{ template_variant }} theme-{{ template_theme }}{{^template_theme}}modern{{/template_theme}} okanjo-cta-style-{{ template_cta_style }}{{^template_cta_style}}link{{/template_cta_style}}{{/config}} okanjo-wgid-{{ instanceId }}\"><div class=okanjo-resource-list itemscope itemtype=http://schema.org/ItemList data-instance-id=\"{{ instanceId }}\">{{! dont change the structure below, click events use a.parentNode.parentNode to access these data attributes! }} {{#articles}}<div class=\"okanjo-resource okanjo-article {{#config}}{{ template_layout }}{{/config}}\" itemscope itemtype=http://schema.org/Article><a href=\"//{{ okanjoMetricUrl }}/metrics/am/int?m[bot]=true&id={{ id }}&{{ metricParams }}&n={{ now }}&u={{ _escaped_url }}\" data-id=\"{{ id }}\" data-index=\"{{ _index }}\" target=_blank itemprop=url title=\"Read More: {{ title }}\"><div class=okanjo-resource-image-container>{{#image}} <img class=\"okanjo-resource-image {{ fitImage }}\" src=\"{{ image }}\" title=\"{{ name }}\" itemprop=image> {{/image}} {{^image}} <svg version=1.1 id=Layer_1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px viewBox=\"0 0 48 48\" style=\"enable-background:new 0 0 48 48;\" xml:space=preserve><g id=newspaper_1_><g id=newspaper_2_><path id=newspaper_6_ d=\"M21.5,23h-5c-0.276,0-0.5-0.224-0.5-0.5v-5c0-0.276,0.224-0.5,0.5-0.5h5c0.276,0,0.5,0.224,0.5,0.5v5\n                                    C22,22.776,21.776,23,21.5,23z M37,32c0,1.654-1.346,3-3,3h-2H15c-1.654,0-3-1.346-3-3V14c0-0.552,0.448-1,1-1h17\n                                    c0.552,0,1,0.448,1,1v18c0,0.552,0.449,1,1,1h2c0.551,0,1-0.448,1-1V17h-1v14.75c0,0.138-0.112,0.25-0.25,0.25h-1.5\n                                    C32.112,32,32,31.888,32,31.75V16c0-0.552,0.448-1,1-1h3c0.552,0,1,0.448,1,1v1V32z M15,33h14.184C29.072,32.686,29,32.352,29,32\n                                    V15H14v17C14,32.552,14.449,33,15,33z M26.5,19h-2c-0.276,0-0.5-0.224-0.5-0.5v-1c0-0.276,0.224-0.5,0.5-0.5h2\n                                    c0.276,0,0.5,0.224,0.5,0.5v1C27,18.776,26.776,19,26.5,19z M26.5,23h-2c-0.276,0-0.5-0.224-0.5-0.5v-1c0-0.276,0.224-0.5,0.5-0.5\n                                    h2c0.276,0,0.5,0.224,0.5,0.5v1C27,22.776,26.776,23,26.5,23z M26.5,27h-10c-0.276,0-0.5-0.224-0.5-0.5v-1\n                                    c0-0.276,0.224-0.5,0.5-0.5h10c0.276,0,0.5,0.224,0.5,0.5v1C27,26.776,26.776,27,26.5,27z M26.5,31h-10\n                                    c-0.276,0-0.5-0.224-0.5-0.5v-1c0-0.276,0.224-0.5,0.5-0.5h10c0.276,0,0.5,0.224,0.5,0.5v1C27,30.776,26.776,31,26.5,31z\"/></g></g></svg> {{/image}}</div><div class=okanjo-resource-info-container><div class=okanjo-resource-publisher-container itemprop=publisher itemscope itemtype=http://schema.org/Organization><span class=okanjo-resource-publisher itemprop=name title=\"{{ publisher_name }}\">{{ publisher_name }}{{^publisher_name}}&nbsp;{{/publisher_name}}</span></div><div class=okanjo-resource-title-container><span class=okanjo-resource-title itemprop=name>{{ title }}</span></div><div class=\"okanjo-resource-description-container okanjo-visually-hidden\"><div class=okanjo-resource-description itemprop=description>{{ description }}</div></div><div><div class=okanjo-resource-button-container><div class=okanjo-resource-cta-button><span>{{meta.cta_text}}{{^meta.cta_text}}{{#config}}{{ template_cta_text }}{{^template_cta_text}}Read Now{{/template_cta_text}}{{/config}}{{/meta.cta_text}}</span></div><meta property=url itemprop=url content=\"//{{ okanjoMetricUrl }}/metrics/am/int?m[bot]=true&m[microdata]=true&id={{ id }}&{{ metricParams }}&n={{ now }}&u={{ _escaped_url }}\"></div></div><div class=\"okanjo-resource-meta okanjo-visually-hidden\">{{#author}}<span itemprop=author>{{ author }}</span>{{/author}} {{#published}}<span itemprop=dateCreated>{{ published }}</span>{{/published}} <img src=\"//cdn.okanjo.com/px/1.gif?n={{ now }}\"></div></div></a></div>{{/articles}}</div><div class=\"okanjo-resource-meta okanjo-visually-hidden\"></div></div>";
  okanjo.ui.engine.registerTemplate("articles.block2", okanjo.ui.__article_block2, function (model) {
    var data = (this._response || {
      data: {
        results: []
      }
    }).data || {
      results: []
    };
    model.articles = data.results;
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase); // Enforce format restrictions

    this._enforceLayoutOptions(); // Add branding if necessary


    this._registerCustomBranding('.okanjo-article', 'button');

    return model;
  }, {
    css: [
    /*'okanjo.core',*/
    'articles.block2', 'okanjo.block2'
    /*, 'okanjo.modal'*/
    ]
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("articles.slab", "", {
    id: 'okanjo-article-slab'
  }); // Reuses block2 markup layout, extended css

  okanjo.ui.engine.registerTemplate("articles.slab", okanjo.ui.__article_block2, function (model) {
    var data = (this._response || {
      data: {
        results: []
      }
    }).data || {
      results: []
    };
    model.blockClasses = ['okanjo-slab'];
    model.articles = data.results;
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase);
    model.fitImage = 'okanjo-fit'; // Enforce format restrictions
    // this._enforceLayoutOptions();

    this._enforceSlabLayoutOptions(); // Add branding if necessary


    this._registerCustomBranding('.okanjo-article', 'button');

    return model;
  }, {
    css: ['articles.slab', 'okanjo.slab', 'okanjo.block2']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("okanjo.block2", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-block2{color:#333;font-size:12px/1.2;font-family:inherit}.okanjo-block2:after,.okanjo-block2:before{content:\" \";display:table}.okanjo-block2:after{clear:both}.okanjo-block2.theme-newsprint .okanjo-resource-seller-container{font-family:Georgia,serif}.okanjo-block2.theme-newsprint .okanjo-resource-title-container{font:13px/15px Georgia,serif}.okanjo-block2.theme-modern,.okanjo-block2.theme-newsprint .okanjo-resource-buy-button,.okanjo-block2.theme-newsprint .okanjo-resource-cta-button,.okanjo-block2.theme-newsprint .okanjo-resource-price-container{font-family:\"Helvetica Neue\",Helvetica,Roboto,Arial,sans-serif}.okanjo-block2 .okanjo-ellipses:after{content:\"...\"}.okanjo-block2 .okanjo-visually-hidden{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2 .okanjo-resource{display:block;float:left;background-color:#fff;box-sizing:content-box;width:148px;border:1px solid #e6e6e6;margin:0 -1px -1px 0}.okanjo-block2 .okanjo-resource:last-child{margin:0}.okanjo-block2 a{display:block;overflow:hidden;color:#333;text-decoration:none;padding:10px}.okanjo-block2 a:hover{color:inherit;text-decoration:none}.okanjo-block2 .okanjo-resource-image-container{float:left;overflow:hidden;text-align:center;vertical-align:middle;width:100%;height:128px;line-height:127px;margin:0 0 3px}.okanjo-block2 .okanjo-resource-image{max-width:100%;max-height:100%;border:none;vertical-align:middle}.okanjo-block2 .okanjo-resource-info-container{float:left;height:auto;width:100%}.okanjo-block2 .okanjo-resource-publisher-container,.okanjo-block2 .okanjo-resource-seller-container{color:#999;font-size:11px;line-height:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-block2 .okanjo-resource-title-container{overflow:hidden;margin-top:3px;margin-bottom:4px;font-weight:700;font-size:12px;line-height:14px;height:45px;word-wrap:break-word}.okanjo-block2 .okanjo-resource-title-container span{display:inline-block}.lt-ie8.okanjo-block2 .okanjo-resource-title-container span{display:inline;zoom:1}.okanjo-block2 .okanjo-resource-price-container{font-size:15px;line-height:1;margin-bottom:5px}.okanjo-block2 .okanjo-resource-buy-button,.okanjo-block2 .okanjo-resource-cta-button{color:#09f;font-size:12px;line-height:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.okanjo-block2 .okanjo-resource.list{width:298px;height:122px}.okanjo-block2 .okanjo-resource.list a{padding:11px}.okanjo-block2 .okanjo-resource.list .okanjo-resource-title-container{margin-top:4px;margin-bottom:6px}.okanjo-block2 .okanjo-resource.list .okanjo-resource-image-container{width:100px;height:100px;line-height:1px;margin:0 11px 0 0}.okanjo-block2 .okanjo-resource.list .okanjo-resource-info-container{height:auto;float:none}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-title-container{height:30px}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-buy-button,.okanjo-block2.okanjo-cta-style-button .okanjo-resource-cta-button{display:block;text-align:center;line-height:26px;padding:0 8px;border:1px solid #09f;border-radius:2px;transition:50ms}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-buy-button:hover,.okanjo-block2.okanjo-cta-style-button .okanjo-resource-cta-button:hover{background:#09f;color:#fff}.okanjo-block2.okanjo-cta-style-button .okanjo-resource-buy-button:active,.okanjo-block2.okanjo-cta-style-button .okanjo-resource-cta-button:active{box-shadow:inset 0 3px 10px rgba(0,0,0,.15)}.okanjo-block2.medium_rectangle{width:300px;height:250px;overflow:hidden}.okanjo-block2.medium_rectangle .okanjo-resource{width:148px;height:248px}.okanjo-block2.medium_rectangle .okanjo-resource:first-child{width:149px;height:248px}.okanjo-block2.medium_rectangle .okanjo-resource.list{width:298px;height:123px}.okanjo-block2.medium_rectangle .okanjo-resource.list .okanjo-resource-image-container{width:100px;height:100px;line-height:1px}.okanjo-block2.medium_rectangle .okanjo-resource.list .okanjo-resource-info-container{height:auto;float:left;width:165px}.okanjo-block2.medium_rectangle .okanjo-resource.list:first-child{height:124px}.okanjo-block2.medium_rectangle .okanjo-resource.list:first-child a{padding-top:12px}.okanjo-block2.leaderboard{width:728px;height:90px;overflow:hidden}.okanjo-block2.leaderboard .okanjo-resource{width:241px;height:88px}.okanjo-block2.leaderboard .okanjo-resource:first-child{width:242px}.okanjo-block2.leaderboard .okanjo-resource a{padding:7px}.okanjo-block2.leaderboard .okanjo-resource .okanjo-resource-image-container{width:74px;height:74px;line-height:1px;margin:0 7px 0 0}.okanjo-block2.leaderboard .okanjo-resource .okanjo-resource-title-container{font-size:11px;line-height:13px;height:26px;margin-top:1px;margin-bottom:4px}.okanjo-block2.leaderboard .okanjo-resource .okanjo-resource-price-container{margin-bottom:3px}.okanjo-block2.leaderboard.theme-newsprint .okanjo-resource-title-container{font:bold 11px/13px Georgia,serif}.okanjo-block2.half_page{width:300px;height:600px;overflow:hidden}.okanjo-block2.half_page .okanjo-resource{height:118px}.okanjo-block2.half_page .okanjo-resource:nth-last-child(n+2){height:119px}.okanjo-block2.half_page .okanjo-resource .okanjo-resource-image-container{width:96px;height:96px}.okanjo-block2.half_page .okanjo-resource .okanjo-resource-title-container{margin-bottom:3px}.okanjo-block2.large_mobile_banner{width:320px;height:100px;overflow:hidden}.okanjo-block2.large_mobile_banner .okanjo-resource{width:318px;height:98px}.okanjo-block2.large_mobile_banner .okanjo-resource a{padding:6px}.okanjo-block2.large_mobile_banner .okanjo-resource .okanjo-resource-image-container{width:86px;height:86px}.okanjo-block2.large_mobile_banner .okanjo-resource .okanjo-resource-title-container{height:30px}.okanjo-block2.billboard{width:970px;height:250px;overflow:hidden}.okanjo-block2.billboard .okanjo-resource{width:160px;height:248px}.okanjo-block2.billboard .okanjo-resource:first-child{width:163px;height:248px}.okanjo-block2.billboard .okanjo-resource.list{width:322px;height:123px}.okanjo-block2.billboard .okanjo-resource.list .okanjo-resource-image-container{width:100px;height:100px;line-height:1px}.okanjo-block2.billboard .okanjo-resource.list .okanjo-resource-info-container{height:auto;float:left;width:165px}.okanjo-block2.auto{font-size:1em;width:100%}.okanjo-block2.auto .okanjo-resource{width:100%;height:auto;border-left:none;border-right:none}.okanjo-block2.auto .okanjo-resource a{max-width:500px;width:95%;margin:0 auto;padding:2.5%}.okanjo-block2.auto .okanjo-resource.list{height:auto}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-image-container{width:18%;height:auto;line-height:1px}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-info-container{height:auto;float:none;margin-left:21%;width:79%}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-publisher-container,.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-seller-container{height:auto;font-size:12px;line-height:1.2}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-price-container{height:auto;font-size:15px;line-height:1.5}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-title-container{font-size:15px;line-height:1.4;height:auto}.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-buy-button,.okanjo-block2.auto .okanjo-resource.list .okanjo-resource-cta-button{display:inline-block;font-size:14px;line-height:1.8;margin-bottom:-1.7%}.okanjo-block2.auto.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-price-container{line-height:1.3}.okanjo-block2.auto.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-title-container{line-height:1.25}.okanjo-block2.auto.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-buy-button,.okanjo-block2.auto.okanjo-cta-style-button .okanjo-resource.list .okanjo-resource-cta-button{font-size:13px}.okanjo-inline-buy-frame{display:block;height:100%;width:100%}", {
    id: 'okanjo-block2'
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("okanjo.core", "", {
    id: 'okanjo-core'
  });
  okanjo.ui.engine.registerCss("okanjo.modal", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}html.okanjo-modal-active{overflow:hidden!important}html.okanjo-modal-active body{overflow:hidden!important;margin:0}.okanjo-modal-margin-fix{margin-right:15px!important}.okanjo-modal-container{position:fixed;top:0;right:0;left:0;bottom:0;z-index:2147483647;background-color:rgba(0,0,0,.65);transition-duration:210ms;transition-property:background-color}.okanjo-modal-container.lt-ie9{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiWAoAAK4AqL41IDIAAAAASUVORK5CYII=)}.okanjo-modal-container.okanjo-modal-fade-out{background-color:rgba(0,0,0,0)}.okanjo-modal-container.okanjo-modal-fade-out .okanjo-modal-window{opacity:0;transform:scale(.95,.95) translateY(50px)}.okanjo-modal-container.okanjo-modal-hidden{display:none!important}.okanjo-modal-container .okanjo-modal-window{position:relative;max-width:900px;width:90%;background:0 0;margin:56px auto 40px;opacity:1;transform:scale(1,1) translateY(0);transition-duration:210ms;transition-timing-function:cubic-bezier(0.13,0.025,0.15,1.15);transition-property:opacity}.okanjo-modal-container .okanjo-modal-window:after,.okanjo-modal-container .okanjo-modal-window:before{content:\" \";display:table}.okanjo-modal-container .okanjo-modal-window:after{clear:both}.okanjo-modal-container .okanjo-modal-window .okanjo-modal-header{padding-top:5px;padding-bottom:5px;border-bottom:1px solid #d7d7d7}.okanjo-modal-container .okanjo-modal-window .okanjo-modal-header img{height:50px;width:auto}.okanjo-modal-container .okanjo-modal-window-skin{width:auto;height:auto;box-shadow:0 10px 25px rgba(0,0,0,.5);position:absolute;background:#fff;border-radius:4px;top:0;bottom:0;left:0;right:0}.okanjo-modal-container .okanjo-modal-window-outer{position:absolute;top:15px;left:15px;bottom:15px;right:15px;vertical-align:top}.okanjo-modal-container .okanjo-modal-window-inner{position:relative;width:100%;height:100%;-webkit-overflow-scrolling:touch;overflow:auto}.okanjo-modal-container .okanjo-modal-window-inner iframe{height:100%;width:100%;margin-right:-15px}.okanjo-modal-container .okanjo-modal-close-button{color:#fff;cursor:pointer;position:absolute;right:0;top:-48px;text-align:right;font-size:40px;line-height:1em;overflow:visible;width:40px;height:40px}", {
    id: 'okanjo-modal'
  });
  okanjo.ui.engine.registerTemplate("okanjo.error", "<span class=okanjo-error>{{ message }}</span><img src=\"//cdn.okanjo.com/px/0.gif?n={{ now }}\"> {{#code}} <span class=okanjo-error-code>Reference: {{ code }}</span> {{/code}}", {
    css: ['okanjo.core']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("okanjo.slab", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-block2.okanjo-slab img.okanjo-fit{height:100%;width:100%;object-fit:cover}.okanjo-block2.okanjo-slab.okanjo-cta-style-none .okanjo-resource-button-container{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2.okanjo-slab.okanjo-cta-style-none .okanjo-resource.list .okanjo-resource-title-container{height:95px}.okanjo-block2.okanjo-slab.okanjo-cta-style-button .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab .okanjo-resource{width:298px}.okanjo-block2.okanjo-slab .okanjo-resource-publisher-container{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2.okanjo-slab .okanjo-resource-image-container{height:155px}.okanjo-block2.okanjo-slab .okanjo-resource-title-container{height:58px;font-size:16px;line-height:19px}.okanjo-block2.okanjo-slab .okanjo-resource.list .okanjo-resource-title-container{font-size:14px;height:60px}.okanjo-block2.okanjo-slab.theme-newsprint .okanjo-resource-title-container{font:16px/19px Georgia,serif}.okanjo-block2.okanjo-slab.theme-newsprint .okanjo-resource.list .okanjo-resource-title-container{font-size:15px}.okanjo-block2.okanjo-slab.responsive .okanjo-resource-list{display:flex;flex-wrap:wrap;justify-content:center}.okanjo-block2.okanjo-slab.responsive .okanjo-resource{width:inherit;flex-grow:1;flex-shrink:0;flex-basis:33.3333%;flex-basis:200px;display:flex;align-items:center;justify-content:center}.okanjo-block2.okanjo-slab.responsive .okanjo-resource.list{flex-basis:33.3333%;flex-basis:250px}.okanjo-block2.okanjo-slab.responsive .okanjo-resource.list a{width:100%}.okanjo-block2.okanjo-slab.responsive .okanjo-resource:last-child{margin:0 -1px -1px 0}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource,.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource:first-child{width:298px;height:248px}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource .okanjo-resource-title-container{height:40px;margin-bottom:8px}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource .okanjo-resource-image-container{height:155px}.okanjo-block2.okanjo-slab.medium_rectangle.okanjo-cta-style-none .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.leaderboard .okanjo-resource .okanjo-resource-title-container{font-size:13px;line-height:15px;height:50px;margin-top:1px;margin-bottom:4px}.okanjo-block2.okanjo-slab.leaderboard.okanjo-cta-style-none .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.leaderboard.theme-newsprint .okanjo-resource .okanjo-resource-title-container{font:bold 13px/15px Georgia,serif}.okanjo-block2.okanjo-slab.large_mobile_banner .okanjo-resource .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.large_mobile_banner.okanjo-cta-style-none .okanjo-resource-title-container{height:80px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource,.okanjo-block2.okanjo-slab.half_page .okanjo-resource:nth-last-child(n+2){width:298px;height:298px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource:first-child{height:299px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource .okanjo-resource-image-container{width:100%;height:180px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource .okanjo-resource-title-container{margin-bottom:3px;height:77px}.okanjo-block2.okanjo-slab.half_page.okanjo-cta-style-button .okanjo-resource-title-container{height:57px;margin-bottom:8px}.okanjo-block2.okanjo-slab.half_page.okanjo-cta-style-none .okanjo-resource-title-container{height:116px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource{width:298px;height:198px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource:nth-last-child(n+2){width:298px;height:199px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource:first-child{height:199px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource .okanjo-resource-button-container{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource .okanjo-resource-image-container{width:100%;height:136px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource .okanjo-resource-title-container{height:42px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource,.okanjo-block2.okanjo-slab.billboard .okanjo-resource:first-child{width:322px;height:248px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource .okanjo-resource-title-container{height:40px;margin-bottom:8px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource .okanjo-resource-image-container{height:155px}.okanjo-block2.okanjo-slab.billboard.okanjo-cta-style-none .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.auto .okanjo-resource.list .okanjo-resource-image-container{width:100px;height:100px}.okanjo-block2.okanjo-slab.auto .okanjo-resource.list .okanjo-resource-info-container{margin-left:111px;width:auto}", {
    id: 'okanjo-slab'
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("products.block2", "", {
    id: 'okanjo-product-block2'
  });
  okanjo.ui.__product_block2 = "<div class=\"okanjo-block2 okanjo-expansion-root {{ classDetects }} {{#config}} {{ size }} {{ template_variant }} theme-{{ template_theme }}{{^template_theme}}modern{{/template_theme}} okanjo-cta-style-{{ template_cta_style }}{{^template_cta_style}}link{{/template_cta_style}}{{/config}} okanjo-wgid-{{ instanceId }}\"><div class=okanjo-resource-list itemscope itemtype=http://schema.org/ItemList data-instance-id=\"{{ instanceId }}\">{{! dont change the structure below, click events use a.parentNode.parentNode to access these data attributes! }} {{#products}}<div class=\"okanjo-resource okanjo-product {{#config}}{{ template_layout }}{{/config}}\" itemscope itemtype=http://schema.org/Product><a href=\"//{{ okanjoMetricUrl }}/metrics/pr/int?m[bot]=true&id={{ id }}&{{ metricParams }}&n={{ now }}&u={{ _escaped_buy_url }}\" data-id=\"{{ id }}\" data-index=\"{{ _index }}\" data-backfill=\"{{ backfill }}\" target=_blank itemprop=url title=\"Buy now: {{ name }}\"><div class=okanjo-resource-image-container><img class=\"okanjo-resource-image {{ fitImage }}\" src=\"{{ _image_url }}\" title=\"{{ name }}\" itemprop=image></div><div class=okanjo-resource-info-container><div class=okanjo-resource-seller-container itemprop=seller itemscope itemtype=http://schema.org/Organization><span class=okanjo-resource-seller itemprop=name title=\"{{ store_name }}\">{{ store_name }}{{^store_name}}&nbsp;{{/store_name}}</span></div><div class=okanjo-resource-title-container><span class=okanjo-resource-title itemprop=name>{{ name }}</span></div><div><div class=okanjo-resource-price-container><span content=\"{{ currency }}\">$</span><span class=okanjo-resource-price>{{ _price_formatted }}</span></div><div class=okanjo-resource-button-container><div class=okanjo-resource-buy-button><span>{{ meta.cta_text }}{{^meta.cta_text}}{{#config}}{{ template_cta_text }}{{^template_cta_text}}Shop Now{{/template_cta_text}}{{/config}}{{/meta.cta_text}}</span></div><meta property=url itemprop=url content=\"//{{ okanjoMetricUrl }}/metrics/pr/int?m[bot]=true&m[microdata]=true&id={{ id }}&{{ metricParams }}&n={{ now }}&u={{ _escaped_buy_url }}\"></div></div><div class=\"okanjo-resource-meta okanjo-visually-hidden\">{{#impression_url}}<img src=\"{{ impression_url }}\" alt=\"\">{{/impression_url}} {{#upc}}<span itemprop=productID>upc:{{ upc }}</span>{{/upc}} {{#manufacturer}}<span itemprop=manufacturer>{{ manufacturer }}</span>{{/manufacturer}} <img src=\"//cdn.okanjo.com/px/1.gif?n={{ now }}\"></div></div></a></div>{{/products}}</div><div class=\"okanjo-resource-meta okanjo-visually-hidden\"></div></div>";
  okanjo.ui.engine.registerTemplate("products.block2", okanjo.ui.__product_block2, function (model) {
    // Attach placement properties
    var data = (this._response || {
      data: {
        results: []
      }
    }).data || {
      results: []
    };
    model.products = data.results;
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase); // Enforce format restrictions

    this._enforceLayoutOptions(); // Add branding if necessary


    this._registerCustomBranding('.okanjo-product', 'buy-button');

    return model;
  }, {
    css: [
    /*'okanjo.core',*/
    'products.block2', 'okanjo.block2', 'okanjo.modal']
  });
})(window);

(function (window) {
  var okanjo = window.okanjo;
  okanjo.ui.engine.registerCss("products.slab", ".okanjo-expansion-root{position:relative}.okanjo-expansion-root iframe.okanjo-ad-in-unit{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1}.okanjo-block2.okanjo-slab .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{font-size:14px;height:40px}.okanjo-block2.okanjo-slab.okanjo-cta-style-button .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{height:30px;font-size:12px;line-height:14px}.okanjo-block2.okanjo-slab.okanjo-cta-style-button.theme-newsprint .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{font-size:13px}.okanjo-block2.okanjo-slab.okanjo-cta-style-none .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource.okanjo-product .okanjo-resource-title-container{margin-bottom:4px;margin-top:2px}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource.okanjo-product .okanjo-resource-price-container{display:inline-block}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource.okanjo-product .okanjo-resource-button-container{display:inline-block;margin-left:10px;font-size:15px;line-height:1}.okanjo-block2.okanjo-slab.medium_rectangle .okanjo-resource.okanjo-product .okanjo-resource-button-container .okanjo-resource-buy-button{font-size:14px;overflow:inherit}.okanjo-block2.okanjo-slab.medium_rectangle.okanjo-cta-style-none .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab.leaderboard .okanjo-resource.okanjo-product .okanjo-resource-title-container{margin-bottom:0;height:32px;font-size:14px}.okanjo-block2.okanjo-slab.leaderboard.okanjo-cta-style-none .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:47px}.okanjo-block2.okanjo-slab.large_mobile_banner .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:34px;font-size:14px;line-height:16px;margin-bottom:2px}.okanjo-block2.okanjo-slab.large_mobile_banner.okanjo-cta-style-none .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:50px}.okanjo-block2.okanjo-slab.half_page .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab.half_page.okanjo-cta-style-button .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:34px;margin-bottom:0;line-height:15px;font-size:15px}.okanjo-block2.okanjo-slab.half_page.okanjo-cta-style-none .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:60px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:33px;font-size:15px;line-height:15px}.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource.okanjo-product .okanjo-resource-button-container,.okanjo-block2.okanjo-slab.half_page.dense .okanjo-resource.okanjo-product .okanjo-resource-price-container{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource.okanjo-product .okanjo-resource-title-container{margin-bottom:4px;margin-top:2px}.okanjo-block2.okanjo-slab.billboard .okanjo-resource.okanjo-product .okanjo-resource-price-container{display:inline-block}.okanjo-block2.okanjo-slab.billboard .okanjo-resource.okanjo-product .okanjo-resource-button-container{display:inline-block;margin-left:10px;font-size:15px;line-height:1}.okanjo-block2.okanjo-slab.billboard .okanjo-resource.okanjo-product .okanjo-resource-button-container .okanjo-resource-buy-button{font-size:14px;overflow:inherit}.okanjo-block2.okanjo-slab.billboard.okanjo-cta-style-none .okanjo-resource.okanjo-product .okanjo-resource-title-container{height:40px}.okanjo-block2.okanjo-slab.auto .okanjo-resource.okanjo-product.list .okanjo-resource-title-container{height:auto;margin-bottom:2px;line-height:20px}.okanjo-block2.okanjo-slab.auto .okanjo-resource.okanjo-product.list .okanjo-resource-price-container{margin-bottom:0}.okanjo-block2.okanjo-slab.auto.okanjo-cta-style-button .okanjo-resource.okanjo-product .okanjo-resource-price-container{margin-bottom:3px}", {
    id: 'okanjo-product-slab'
  }); // Reuses block2 markup layout, extended css

  okanjo.ui.engine.registerTemplate("products.slab", okanjo.ui.__product_block2, function (model) {
    var data = (this._response || {
      data: {
        results: []
      }
    }).data || {
      results: []
    };
    model.blockClasses = ['okanjo-slab'];
    model.products = data.results;
    model.config = this.config;
    model.instanceId = this.instanceId;
    model.metricChannel = this._metricBase.ch;
    model.metricContext = this._metricBase.cx;
    model.metricParams = okanjo.net.request.stringify(this._metricBase);
    model.fitImage = 'okanjo-fit'; // Enforce format restrictions
    // this._enforceLayoutOptions();

    this._enforceSlabLayoutOptions(); // Add branding if necessary


    this._registerCustomBranding('.okanjo-product', 'button');

    return model;
  }, {
    css: ['products.slab', 'okanjo.slab', 'okanjo.block2']
  });
})(window);})(okanjo);