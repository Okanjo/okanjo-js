import okanjo from '/src/Okanjo';

okanjo.ui.engine.registerCss("okanjo.core", "@@include(jsStringEscape('okanjo.core.css'))", {id: 'okanjo-core'});
okanjo.ui.engine.registerCss("okanjo.modal", "@@include(jsStringEscape('okanjo.modal.css'))", {id: 'okanjo-modal'});

okanjo.ui.engine.registerTemplate("okanjo.error", "@@include(jsStringEscape('okanjo.error.mustache'))", {css: ['okanjo.core']});