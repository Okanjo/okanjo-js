//noinspection JSUnusedLocalSymbols,ThisExpressionReferencesGlobalObjectJS
(function(okanjo, window) {

    var TemplateEngine = okanjo.TemplateEngine = function TemplateEngine(options) {
        options = options || { templates: {}, css: {} };
        this._templates = options.templates || {};
        this._css = options.css || {};

        // Add special styles for ie 7, 8, 9
        this.classDetects = okanjo.util.detectClasses();
        this.classDetects = this.classDetects.join(' ');
    };

    TemplateEngine.prototype = {

        constructor: TemplateEngine,

        /**
         * Register a template
         * @param {string} name – Template name
         * @param {string|HTMLElement} template - Template markup string
         * @param {function(data:*):*} [viewClosure] – Optional data manipulation closure
         * @param {*} [options] – Optional hash of template options, e.g. css: [ 'name1', 'name2' ]
         */
        registerTemplate: function(name, template, viewClosure, options) {
            // Example template:
            // {{title}} spends {{calc}}

            if (typeof template === "object") {
                //noinspection JSValidateTypes
                if (template.nodeType === undefined) {
                    throw new Error('Parameter template must be a string or a DOM element');
                } else {
                    okanjo.Mustache.parse(template);
                }
            } else if (typeof template !== "string") {
                throw new Error('Parameter template must be a string or a DOM element');
            }

            // Shift options if only have 3 params
            if (arguments.length === 3 && typeof viewClosure === "object") {
                options = viewClosure;
                viewClosure = undefined;
            } else {
                options = options || {};
            }

            if (viewClosure !== undefined && typeof viewClosure !== "function") {
                throw new Error('Parameter viewClosure must be a function');
            }

            // Assign the template
            this._templates[name] = {
                markup: template,
                options: options,
                viewClosure: viewClosure || null
            };
        },


        /**
         * Registers a CSS block
         *
         * @param {string} name – CSS block name
         * @param {string|HTMLElement} css – The CSS markup or existing style element
         * @param {undefined|{id:string}|null} [options] – Optional hash of KVP settings
         */
        registerCss: function(name, css, options) {
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
        },


        /**
         * Checks if a template was registered
         * @param {string} name – The template name to look for
         * @returns {boolean} – True if registered, False if not
         */
        isTemplateRegistered: function(name) {
            return this._templates[name] ? true : false;
        },


        /**
         * Checks if a CSS block was registered
         * @param {string} name – The CSS block name to look for
         * @returns {boolean} – True if registered, False if not
         */
        isCssRegistered: function(name) {
            return this._css[name] ? true : false;
        },


        /**
         * Ensures that the given CSS block name has been added to the page
         * @param {string|HTMLElement} name - The CSS name that was registered through registerCss
         */
        ensureCss: function(name) {

            if (this._css[name]) {
                //noinspection JSValidateTypes
                var css = this._css[name],
                    id = css.markup.nodeType === undefined ? css.options.id || "okanjo-css-" + name : null; // If it's a DOM element, just forget it cuz it's already on the page

                // Check for css element on page, if we have an ID to look for
                if (id) {
                    var elements = okanjo.qwery('#' + id);
                    if (elements.length === 0) {
                        var head = okanjo.qwery('head'),
                            style = document.createElement('style');

                        style.id = id;
                        style.setAttribute('type', 'text/css');

                        if (style.hasOwnProperty) { // old ie
                            style.innerHTML = css.markup;
                        } else {
                            style.styleSheet.cssText = css.markup;
                        }

                        if (head.length > 0) {
                            head[0].appendChild(style);
                        } else {
                            // NO HEAD, just prepend to body then
                            var body = okanjo.qwery('body');
                            if (body.length > 0) {
                                body[0].appendChild(style);
                            } // And if this doesn't work, just give up
                        }
                    }
                }
            } else {
                console.warn('[Okanjo.Template] Attempted to add CSS template "'+name+'" to the DOM, however it does not appear to be registered?');
            }

        },


        /**
         * Renders a template with the given data
         *
         * @param {string} templateName – The template name to render
         * @param {*} context – The context to execute the template under
         * @param {*} data – Data to pass into the controller
         * @param {*} [options] – Optional settings object to pass into the controller closure
         * @returns {*}
         */
        render: function(templateName, context, data, options) {

            options = options || {};
            var template = this._templates[templateName],
                view = data;

            // If there's a data controller closure set, and if so, run the data through there
            if (template.viewClosure) {
                view = template.viewClosure.call(context, data, options);
            }

            // Attach globals
            view.okanjoConfig = okanjo.config;
            view.okanjoMetricUrl = okanjo.config.ads.apiUri.replace(/^https?:\/\//,''); // Url w/o scheme to prevent mixed-content warnings
            view.now = function() { return (new Date()).getTime(); };
            view.classDetects = this.classDetects;

            //noinspection JSUnresolvedVariable
            if (options.blockClasses && Array.isArray(options.blockClasses)) {
                view.classDetects = view.classDetects += " " + options.blockClasses.join(' ');
            }

            // Add CSS unless we are told not to
            if (options.css !== false) {
                if (template.options.css && template.options.css.length > 0) {
                    for(var i = 0; i < template.options.css.length; i++) {
                        this.ensureCss(template.options.css[i]);
                    }
                }
            }

            // Render the template and return the result
            return okanjo.Mustache.render(template.markup, view);
        },

        formats: {

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
            currency: function(value, decimals, decimalSeparator, thousandsSeparator){
                decimals = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
                decimalSeparator = decimalSeparator === undefined ? "." : decimalSeparator;
                thousandsSeparator = thousandsSeparator === undefined ? "," : thousandsSeparator;
                var s = value < 0 ? "-" : "",
                    i = parseInt(value = Math.abs(+value || 0).toFixed(decimals)) + "",
                    j = i.length;
                j = (j) > 3 ? j % 3 : 0;
                return s + (j ? i.substr(0, j) + thousandsSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousandsSeparator) + (decimals ? decimalSeparator + Math.abs(value - i).toFixed(decimals).slice(2) : "");
            },


            /**
             * Formats a product or an array of product objects for the view
             * @param {*} mixed – Product or an array of product objects
             * @returns {*} – Formatted product array or object
             */
            product: function(mixed) {
                // If we got an array of products, handle each one
                if (typeof mixed === "object" && Array.isArray(mixed)) {
                    var products = [];
                    for(var i = 0; i < mixed.length; i++) {
                        products.push(this.product(mixed[i]));
                    }
                    return products;
                } else if(typeof mixed === "object" ) { // Individual product
                    // Set first image as the display image

                    //noinspection JSUnresolvedVariable
                    mixed.image_url = mixed.image_urls ? mixed.image_urls[0] : '' ;
                    //noinspection JSUnresolvedVariable
                    mixed.escaped_buy_url = encodeURIComponent(mixed.buy_url);
                    mixed.escaped_inline_buy_url = okanjo.util.empty(mixed.inline_buy_url) ? '' : encodeURIComponent(mixed.inline_buy_url);
                    mixed.price_formatted = this.currency(mixed.price);
                    return mixed;
                } else { // Unknown value
                    return null;
                }
            }

        }
    };

    // global template engine for all the widgets
    okanjo.mvc = new TemplateEngine();


})(okanjo, this);
