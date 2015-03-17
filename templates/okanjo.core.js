
    okanjo.mvc.registerCss("okanjo.core", "@@include(jsStringEscape('okanjo.core.css'))", { id: 'okanjo-core' });

    okanjo.mvc.registerTemplate("okanjo.error", "@@include(jsStringEscape('okanjo.error.mustache'))", { css: ['okanjo.core'] });