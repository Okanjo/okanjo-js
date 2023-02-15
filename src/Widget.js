"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(window) {

    const okanjo = window.okanjo;
    const DATA_ATTRIBUTE_PATTERN = /^data-(.+)$/;
    const DATA_REPLACE_PATTERN = /-/g;

    /**
     * Base widget class
     */
    class Widget extends okanjo._EventEmitter {

        constructor(element, options) {
            super();

            // Verify element was given (we can't load unless we have one)
            if (!element || element === null || element.nodeType === undefined) {
                okanjo.report('Invalid or missing element on widget construction', { widget: this, element, options });
                throw new Error('Okanjo: Invalid element - make sure to pass a valid DOM element when constructing Okanjo Widgets.');
            }

            // Verify configuration is OK
            if (options && typeof options !== "object") {
                // Warn and fix it
                okanjo.report('Invalid widget options. Expected object, got: ' + typeof options, { widget: this, element, options });
                options = {};
            } else {
                options = options || {};
            }

            // Store basics
            this.name = 'Widget';
            this.element = element;
            this.instanceId = okanjo.util.shortid();

            // Clone initial config, breaking the top-level reference
            this.config = Object.assign({}, options);
        }

        /**
         * Base widget initialization procedures
         */
        init() {
            // process config attributes
            this._applyConfiguration();

            this._setCompatibilityOptions();

            // ensure placement key
            if (!this._ensurePlacementKey()) return;

            // Tell the widget to load
            this.load();
        }

        /**
         * This is for extended widgets, so they may modify the configuration before loading
         */
        _setCompatibilityOptions() {
            // By default, this does nothing. Must be overridden to be useful
        }

        //noinspection JSMethodCanBeStatic
        /**
         * Widget configuration definitions
         * @return {{}}
         */
        getSettings() {
            // Override this
            return {};
        }

        /**
         * Main widget load function.
         */
        load() {
            // Override this in the widget implementation
        }

        /**
         * Applies data attribute settings and defaults to the widget configuration
         * @private
         */
        _applyConfiguration() {

            // this.config was set to the options provided in the constructor
            // so layer data attributes on top

            const data = this.getDataAttributes();
            const settings = this.getSettings();
            Object
                .keys(data)
                .forEach((key) => {
                    let normalizedKey = key.replace(DATA_REPLACE_PATTERN, '_');

                    let val = data[key];

                    // Attempt to convert the value if there's a setting for it
                    if (settings[normalizedKey]) val = settings[normalizedKey].value(val, false);

                    if (!okanjo.util.isEmpty(val)) {
                        this.config[normalizedKey] = val;
                    }
                })
            ;

            // Apply defaults from the widget settings
            Object.keys(settings).forEach((key) => {
                if (this.config[key] === undefined && settings[key]._default !== undefined) {
                    this.config[key] = settings[key].value(undefined, false);
                }
            });
        }

        //noinspection JSUnusedGlobalSymbols
        /**
         * Gets a copy of the configuration, suitable for transmission
         * @return {{}}
         */
        getConfig() {
            const settings = this.getSettings();
            const out = {};

            Object.keys(this.config).forEach((origKey) => {
                let val = this.config[origKey];
                let key = origKey;
                let group = null;

                // Check if this is a known property
                if (settings[key]) {
                    val = settings[key].value(val);
                    group = settings[key].getGroup();
                }

                // Init the target/group if not already setup
                let target = out;
                if (group) {
                    target[group] = target[group] || {};
                    target = target[group];
                }

                // Set the value on the target if set
                if (val === null) {
                    target[key] = ''; // format null values as empty strings for transmission
                } else if (val !== undefined) {
                    target[key] = val;
                }
            });

            return out;
        }

        /**
         * Before loading, ensure that a placement key is present or abort
         * @return {boolean}
         * @private
         */
        _ensurePlacementKey() {

            // Check if set on widget or globally
            if (this.config.key) {
                return true;
            } else if (okanjo.key) {
                // Copy key from global scope,
                this.config.key = okanjo.key;
                return true;
            }

            // No key set, can't load.
            okanjo.report('No key provided on widget', { widget: this });
            this.showError('Error: Missing placement key.');
            return false;
        }

        /**
         * Displays an error in the widget element
         * @param message
         */
        showError(message) {
            this.setMarkup(okanjo.ui.engine.render(
                'okanjo.error',
                this,
                { message }
            ));
        }

        /**
         * Sets the markup of the widget's element
         * @param markup
         */
        setMarkup(markup) {
            this.element.innerHTML = markup;
            this.setFlexClasses(); // implicitly set the classes
        }

        /**
         * Sets the flex classes for the placement container element
         */
        setFlexClasses() {
            const align = this.config.align;
            const justify = this.config.justify;
            if (align) this.element.classList.add('okanjo-align-'+align);
            if (justify) this.element.classList.add('okanjo-justify-'+justify);
        }

        //noinspection JSUnusedGlobalSymbols
        /**
         * Gets the current page URL, sans query string and fragment.
         * @returns {string} - URL
         */
        static getCurrentPageUrl() {
            return window.location.href.replace(/([?#].*)$/, '');
        }

        /**
         * Instead of using HTML5 dataset, just rip through attributes and return data attributes
         * @returns {*}
         */
        getDataAttributes() {
            const data = {};
                Array
                    .from(this.element.attributes)
                    .forEach((attr) => {
                        const match = DATA_ATTRIBUTE_PATTERN.exec(attr.name);
                        if (match) {
                            data[match[1]] = attr.value;
                        }
                    });
            return data;
        }

    }

    /**
     * Fluent configuration helper for organizing and formatting ad-hoc configuration values
     * @type {Field}
     */
    Widget.Field = class Field {

        //noinspection JSUnusedGlobalSymbols
        constructor() {
            this._convert = null;
            this._strip = false;
            this._default = undefined;
            this._group = null;
        }

        /**
         * Formats the value as an array of strings
         * @param converter
         * @return {Field}
         */
        array(converter) {
            this._convert = (val) => {
                if (Array.isArray(val)) {
                    if (converter) {
                        return val.map((v) => converter(v))
                    } else {
                        return val;
                    }
                }
                val = val.replace(/\\,/g, '\0');
                return val.split(',').map((v) => {
                    let res = v.trim().replace('\0', ',');
                    if (converter) res = converter(res);
                    return res;
                });
            };
            return this;
        }
        //noinspection JSUnusedGlobalSymbols
        static array(converter) { return (new Field()).array(converter); }

        /**
         * Formats the value as a string
         * @return {Field}
         */
        string() {
            this._convert = (val) => {
                if (val === null || val === undefined) return val;
                else return ""+val;
            };
            return this;
        }
        static string() { return (new Field()).string(); }

        /**
         * Formats the value as a boolean (takes 1, 0, true, false)
         * @return {Field}
         */
        bool() {
            this._convert = (val) => {
                if (typeof val === "string") {
                    return (val === "1" || val.toLowerCase() === "true");
                } else {
                    return !!val;
                }
            };
            return this;
        }
        //noinspection JSUnusedGlobalSymbols
        static bool() { return (new Field()).bool(); }

        /**
         * Indicates the field should not be passed on for transmission
         * @return {Field}
         */
        strip() { this._strip = true; return this; }
        static strip() { return (new Field()).strip(); }

        /**
         * Formats the value as a integer (whole) number
         * @return {Field}
         */
        int() { this._convert = (val) => parseInt(val); return this; }
        //noinspection JSUnusedGlobalSymbols
        static int() { return (new Field()).int(); }

        /**
         * Formats the value as a floating point number
         * @return {Field}
         */
        float() { this._convert = (val) => parseFloat(val); return this; }
        //noinspection JSUnusedGlobalSymbols
        static float() { return (new Field()).float(); }

        //noinspection ReservedWordAsName
        /**
         * Sets the default value to use if not set
         * @param val
         * @return {Field}
         */
        default(val) {
            this._default = val;
            return this;
        }

        /**
         * Assigns the property to a bucket for hierarchy
         * @param name
         * @return {Field}
         */
        group(name) {
            this._group = name;
            return this;
        }

        /**
         * Gets the group the field belongs to
         * @return {*|null}
         */
        getGroup() {
            return this._group;
        }

        //noinspection JSUnusedGlobalSymbols
        /**
         * Gets the formatted value of the field
         * @param val
         * @param strip
         * @return {*}
         */
        value(val, strip=true) {
            if (this._strip && strip) return undefined;
            if (val !== undefined && this._convert) {
                val = this._convert(val);
            }
            return val !== undefined ? val : this._default;
        }

    };

    // Export
    return okanjo._Widget = Widget;

})(window);



