
# Okanjo JavaScript Widget Framework

When stuff changes, it's described here.

## 2015-04-27 – v0.3.3
 * Updated JSONP object serializer to handle arrays slightly better
 * Added support for Ad product pools, searches the global pool by default

## 2015-04-16 – v0.3.2
 * Added key parameter to ad and product widgets
 * Fixed: when automatically inserting a product widget into an ad, use the ad's key instead of assuming a global key is defined
 * Fixed: call `findWidgetKey` after `parseConfiguration` in the widget init process, so the given key data element can be used

## 2015-04-14 – v0.3.1
 * Added new and improved version of the initial AdCommerce widget, the Ad Widget
 * Added and integrated modified NanoModal library
 * Added Array.every polyfill because IE sucks
 * Added global okanjo Moat configuration (currently testing)
 * Integrated asyncronous version of Moat into the framework
 * Fixed okanjo.util.trim not actually returning the trimmed result
 * Added okanjo.util.inherits to extend objects with support for old IE
 * Fixed okanjo metrics to wait until the dom is loaded before starting on that
 * Added widget base, for code reuse across new and existing widgets
 * Refactored product widget to inherit basic functionality from the base widget
 * Added inline_buy functionality to the product widget
 * Added blockClasses option to render, to allow inserting classes on the widget element at render time
 * Added escaped_inline_buy_url to the formatted product model, in case the view could make use of that

## 2015-04-07 – v0.2.13
 * Removed errant console.log in JSONP
 * Ensure config.mode is always set on product widget

## 2015-04-02 – v0.2.12
 * Fixed ga analytics id in config
 * Use window._gaq instead of internal 
 * Added product widget impression metrics
 * Changed impression/interaction context ps to pw

## 2015-03-18 – v0.2.11
 * Initial import / setup