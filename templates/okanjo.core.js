
okanjo.mvc.registerCss("okanjo.core", "@@include(jsStringEscape('okanjo.core.css'))", { id: 'okanjo-core' });
okanjo.mvc.registerCss("okanjo.modal", "@@include(jsStringEscape('okanjo.modal.css'))", { id: 'okanjo-modal' });

okanjo.mvc.registerTemplate("okanjo.error", "@@include(jsStringEscape('okanjo.error.mustache'))", { css: ['okanjo.core'] });