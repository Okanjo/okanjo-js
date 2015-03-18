/*! okanjo-js v0.2.7 | (c) 2013 Okanjo Partners Inc | https://okanjo.com/ */
(function(okanjo) {
    okanjo.mvc.registerCss("okanjo.core", "", { id: 'okanjo-core' });

    okanjo.mvc.registerTemplate("okanjo.error", "<span class=okanjo-error>{{ message }}</span> {{#code}} <span class=okanjo-error-code>Reference: {{ code }}</span> {{/code}}", { css: ['okanjo.core'] });

    okanjo.mvc.registerCss("product.block", ".lt-ie8.okanjo-product-block .okanjo-product-title,.lt-ie8.okanjo-product-block .okanjo-product-title-container:before{zoom:1}.okanjo-product-block .okanjo-product-list{list-style-type:none;padding:0}.okanjo-product-block .okanjo-product{width:150px;overflow:hidden;text-align:center;border:1px solid #ccc;padding:.5em;display:inline-block;margin:0 .1em;box-shadow:1px 1px 1px 1px #eee;background-color:#fff}.lt-ie8.okanjo-product-block .okanjo-product{display:inline;zoom:1}.okanjo-product-block .okanjo-product-image-container{height:150px}.okanjo-product-block .okanjo-product-image{max-width:100%;max-height:100%;border:0}.okanjo-product-block .okanjo-product-title-container{margin:.5em;height:4em;overflow:auto;vertical-align:middle}.okanjo-product-block .okanjo-product-title-container:before{content:\"\";display:inline-block;height:100%;vertical-align:middle}.okanjo-product-block .okanjo-product-title{vertical-align:middle;display:inline-block}.okanjo-product-block .okanjo-product-meta{height:0;width:0;text-indent:-100%;overflow:hidden}.lt-ie7.okanjo-product-block .okanjo-product,.lt-ie8.okanjo-product-block .okanjo-product,.lt-ie9.okanjo-product-block .okanjo-product{margin-bottom:.2em}.lt-ie7.okanjo-product-block .okanjo-product-title-container:before,.lt-ie8.okanjo-product-block .okanjo-product-title-container:before,.lt-ie9.okanjo-product-block .okanjo-product-title-container:before{display:block;height:0}.lt-ie7.okanjo-product-block .okanjo-product-title,.lt-ie8.okanjo-product-block .okanjo-product-title,.lt-ie9.okanjo-product-block .okanjo-product-title{display:block}", { id: 'okanjo-product-block' });

    okanjo.mvc.registerTemplate("product.block", "<div class=\"okanjo-product-block {{classDetects}}\"><ul class=okanjo-product-list itemscope=\"\" itemtype=http://schema.org/ItemList>{{#products}}<li class=okanjo-product itemscope=\"\" itemtype=http://schema.org/Product><a href=\"http://{{okanjoMetricUrl}}/metrics/{{ id }}?c=ps&n={{now}}&u={{ escaped_buy_url }}\" target=_blank itemprop=url><div class=okanjo-product-image-container><img class=okanjo-product-image src=\"{{ image_url }}\" title=\"{{ name }}\" itemprop=image></div><div class=okanjo-product-title-container><span class=okanjo-product-title itemprop=name>{{ name }}</span></div><div class=okanjo-product-price-container itemprop=offers itemscope=\"\" itemtype=http://schema.org/Offer><span itemprop=priceCurrency content=\"{{ currency }}\">$</span><span class=okanjo-product-price itemprop=price>{{ price }}</span></div><div class=okanjo-product-meta><img src=\"{{#okanjoConfig}}{{#ads}}{{apiUri}}{{/ads}}{{/okanjoConfig}}/metrics/{{ id }}?c=ps&n={{now}}\" alt=\"\"> {{! Okanjo impression tracking URL }} {{#impression_url}}<img src=\"{{ impression_url }}\" alt=\"\">{{/impression_url}} {{! Vendor impression tracking URL }} {{#sold_by}}<span itemprop=brand>{{brand}}</span>{{/sold_by}} {{#upc}}<span itemprop=productID>upc:{{upc}}</span>{{/upc}} {{#manufacturer}}<span itemprop=manufacturer>{{manufacturer}}</span>{{/manufacturer}}</div></a></li>{{/products}}</ul></div>", function(data, options) {
        // Ensure params
        data = data || { products: [], config: {} };
        options = okanjo.util.clone(options);

        // Copy, format and return the config and products
        options.config = data.config;
        options.products = okanjo.mvc.formats.product(data.products);
        return options;
    }, {
        css: [ /*'okanjo.core',*/ 'product.block']
    });


})(okanjo);