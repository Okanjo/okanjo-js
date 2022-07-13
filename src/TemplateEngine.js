"use strict";

//noinspection JSUnusedLocalSymbols,ThisExpressionReferencesGlobalObjectJS
(function(window, document) {

    const okanjo = window.okanjo;

    /**
     * UI Rendering Engine
     */
    class TemplateEngine {

        constructor() {

            // Load initial templates from options
            this._templates = {};
            this._css = {};

            // Hook point for adding custom styles to ui elements
            this.classDetects = '';
        }

        /**
         * Registers a template for use
         * @param name
         * @param template
         * @param beforeRender
         * @param options
         */
        registerTemplate(name, template, beforeRender, options) {

            if (typeof template === "object") {
                //noinspection JSValidateTypes
                if (template.nodeType === undefined) {
                    throw new Error('Parameter template must be a string or a DOM element');
                } else {
                    template = template.innerHTML;
                    okanjo.lib.Mustache.parse(template);
                }
            } else if (typeof template !== "string") {
                throw new Error('Parameter template must be a string or a DOM element');
            }

            // Shift options if only have 3 params
            if (arguments.length === 3 && typeof beforeRender === "object") {
                options = beforeRender;
                beforeRender = null;
            } else {
                options = options || {};
            }

            if (beforeRender && typeof beforeRender !== "function") {
                throw new Error('Parameter beforeRender must be a function');
            }

            // Assign the template
            this._templates[name] = {
                markup: template,
                options,
                beforeRender
            };
        }

        /**
         * Registers a CSS payload for use
         * @param name
         * @param css
         * @param options
         */
        registerCss(name, css, options) {
            options = options || {};

            if (typeof css === "object") {
                //noinspection JSValidateTypes
                if (css.nodeType === undefined) {
                    throw new Error('Parameter css must be a string or a DOM element');
                }
            } else if (typeof css !== "string") {
                throw new Error('Parameter css must be a string or a DOM element');
            }

            this._css[name] = {
                markup: css,
                options: options
            };
        }

        /**
         * Checks whether a template is registered
         * @param name
         * @return {boolean}
         */
        isTemplateRegistered(name) {
            return !!this._templates[name];
        }

        //noinspection JSUnusedGlobalSymbols
        /**
         * Checks whether a CSS payload is registered
         * @param name
         * @return {boolean}
         */
        isCssRegistered(name) {
            return !!this._css[name];
        }

        /**
         * Ensures that a CSS payload has been added to the DOM
         * @param name
         */
        ensureCss(name) {
            if (this._css[name]) {
                //noinspection JSValidateTypes
                const css = this._css[name],
                    id = css.markup.nodeType === undefined ? css.options.id || "okanjo-css-" + name : null; // If it's a DOM element, just forget it cuz it's already on the page

                // Check for css element on page, if we have an ID to look for
                if (id) {
                    const element = document.querySelector('#' + id.replace(/\./g, '\\.'));
                    if (!element) {
                        const head = document.head,
                            style = document.createElement('style');

                        style.id = id;
                        style.setAttribute('type', 'text/css');

                        /* istanbul ignore else: old ie */
                        if (style.hasOwnProperty) { // old ie
                            style.textContent = css.markup;
                        } else {
                            style.styleSheet.cssText = css.markup;
                        }

                        if (head) {
                            head.appendChild(style);
                        } else {
                            // NO HEAD, just prepend to body then
                            const body = document.body;
                            if (body) {
                                body.appendChild(style);
                            } else {
                                // And if this doesn't work, just give up
                                okanjo.report('Cannot add CSS template to document. Does it not have a body or head?');
                            }
                        }
                    }
                }
            } else {
                okanjo.report('Attempted to add CSS template "'+name+'" to the DOM, however it does not appear to be registered?');
            }
        }

        /**
         * Ensures that a custom CSS stylesheet has been added to the DOM
         * @param url
         */
        ensureExternalCss(url) {
            const id = 'okanjo-custom-css-'+url;
            if (document.getElementById(id)) return;

            const head = document.head,
                link = document.createElement('link');

            link.id = id;
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', url);

            if (head) {
                head.appendChild(link);
            } else {
                // NO HEAD, just prepend to body then
                const body = document.body;
                if (body) {
                    body.appendChild(link);
                } else {
                    // And if this doesn't work, just give up
                    okanjo.report('Cannot add custom CSS stylesheet to document. Does it not have a body or head?');
                }
            }
        }

        /**
         * Renders a template and returns the markup
         * @param templateName
         * @param context
         * @param model
         * @return {string}
         */
        render(templateName, context, model) {

            model = model || {};
            const template = this._templates[templateName];

            // If there's a data controller closure set, and if so, run the data through there
            if (template.beforeRender) {
                model = template.beforeRender.call(context, model);
            }

            // Attach globals
            model.okanjo = okanjo;
            model.okanjoMetricUrl = okanjo.net.endpoint.replace(/^https?:\/\//,''); // Url w/o scheme to prevent mixed-content warnings
            model.now = function() { return (new Date()).getTime(); };
            model.classDetects = this.classDetects;

            //noinspection JSUnresolvedVariable
            if (model.blockClasses && Array.isArray(model.blockClasses)) {
                model.classDetects += " " + model.blockClasses.join(' ');
                delete model.blockClasses;
            }

            // Add CSS unless we are told not to
            if (model.css !== false && template.options.css && template.options.css.length > 0) {
                template.options.css.forEach((css) => this.ensureCss(css));
                delete model.css;
            }

            // Render the template and return the result
            return okanjo.lib.Mustache.render(template.markup, model);
        }

    }

    /**
     * Formats a number into a currency string (rounded, decimal points, thousands separators)
     * See: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
     *
     * @param value – the number to format
     * @param [decimals] - The number of decimals to show
     * @param [decimalSeparator] – The decimals separator, default: .
     * @param [thousandsSeparator] – The thousands separator, default: ,
     * @returns {string} – Formatted currency string
     */
    TemplateEngine.formatCurrency = (value, decimals=2, decimalSeparator='.', thousandsSeparator=',') => {
        const s = value < 0 ? "-" : "",
            i = parseInt(value = Math.abs(+value || 0).toFixed(decimals)) + "";
        let j = i.length;
        j = (j) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + thousandsSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousandsSeparator) + (decimals ? decimalSeparator + Math.abs(value - i).toFixed(decimals).slice(2) : "");
    };

    // Export
    okanjo.ui.engine = new TemplateEngine();

})(window, document);