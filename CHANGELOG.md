
# Okanjo JavaScript Widget Framework

When stuff changes, it's described here.

## 2016-03-22 - v0.6.9
 * New block2 template for product blocks, supporting list and grid views for better ad formats (will become default in the near future)
 * Block2 includes logic for enforcing ad format restrictions on style config, and custom cta colors
 * Fixed broken console polyfill
 * Fixed issue with product-single template where long words in product titles would overflow past tile boundaries
 * Added template configuration fields: `size`, `template_layout`, `template_theme`, `template_cta_style`, `template_cta_text`, and `template_cta_color`
 * Added font stack variables to common.less
 * Fixed bad mobile viewport dimensions
 

## 2016-02-09
 * Added ad server example code (original and minified)

## 2016-01-12 - v0.6.8

Ad & Product Widget
 * Added support for 3rd-party click tracking via the `proxy_url` parameter to an Ad or Product widget
 
Core
* Removed integration with Moat


## 2015-11-06 - v0.6.7

Ad Widget
 * Reordered widget impression to fire before product impression
 * Fixed bad metadata in product impression event
  
Core
 * Better error detection for detached elements when getting element position
 
Metrics
 * Enhanced key detection when not setting a key globally
 

## 2015-10-27 - v0.6.6

 * Metrics: Automatically passes the source channel and context if provided in the page's url on events emitted by the page
 * Product Widget: Pass through the widget channel and context when loading the buy_url or inline_buy_url so events can be properly attributed to the original source.

## 2015-10-21 - v0.6.5

 * Added a new, super simple event emitter class, allowing objects to emit events and developers to hookup integrations to the widgets
 * The base widget class now extends from event emitter. Refactored the base widget away from prototype = { ... }
 * The product widget will emit the `data` event when the browse/sense/id call completes. The raw response will the only event parameter.
 * The product widget will emit the `load` event when the widget completes initialization and products are rendered. The only event parameter is an object with property `fromCache` to indicate whether the widget used cached content or not.
 * The product widget will emit the `error` event if the product data failed to be received. The error will be returned as the only event parameter.
 * Added `numFound` property to the product widget
 * Added referrer to metrics, when available
 * Fixed an issue with IE being picky about getting positional rectangles of elements not attached to the DOM. Will now nag if this is the case.

## 2015-10-06 - v0.6.4

 * Allow overriding the page url in metrics trackPageView

## 2015-10-05 - v0.6.3

 * Refactored config to not clobber if it already exists, and merge properties instead.
 * Added metrics build into the default build pipeline
 * Allow the key to be set globally prior to loading okanjo-js

## 2015-10-01 - v0.6.1

Core
 * Refactored core to set properties on global okanjo object instead of set and replace. Easier conflict resolution.
 
Metrics
 * Extracted automatic page view functionality to separate module for optional inclusion
 * Added isolated build for metrics-only library, okanjo-metrics.js

## 2015-09-30 - v0.5.2

Core
 * Added util function to get the viewport size
 * Exposed the objectToUri function in JSONP
 
Product
 * Added positional data and inline metrics to interactions
 * Added missing sid passing to the metric url for interactions

Metrics
 * Added includeViewportInfo helper to return the viewport rectangle coordinates relative to the page

## 2015-09-29 - v0.5.1

Metrics
 * Replaced janky GA metrics with new v2 library to report better quality events
 * Added positioning information to widget and product impressions
 
Ad Widget
 * Added metrics v2 integration for widget load and product load
 * Removed hardcoded channel references and used metrics constant
 * Now sends the channel_context to the underlying product widget in addition to the channel
 
Product Widget
 * Added channel_context as something that can be set during initialization. Defaults do the product widget's mode if not set
 * Added metrics v2 integration for widget load, product load, and product interaction
 * Added support for non-expandable functionality in product widgets
 * Removed hardcodded channel references and used metrics constant

Base Widget
 * Removed load tracking from the widget init process

Core
 * Added new route for reporting metrics without pixels
 * Added util function to get the page query and hash arguments as an object
 * Cookie: Capitalized the param names, looks nicer
 * JSONP: Added better shallow serialization of objects and arrays
 * JSONP: Exposed the url builder as `JSONP.makeUrl`
 * Added util functions for getting an element's position and the page size
 * Added util function for deep cloning an object with the option to merge properties into an existing array/object

## 2015-09-01 - v0.4.7

Product Widget
 * Fixed clobbering of price on formatted product, causing duplicate currency formatting and ultimately showing as $0.00

## 2015-08-31 – v0.4.6

General
 * Updated minifyCSS compatibility to _not_ convert to points. https://github.com/jakubpawlowicz/clean-css/issues/654
 * Added unminified dump of css for debugging to build directory
 
Product Widget
 * Changed word-break:break-all to word-wrap:brake-word for better text handling

## 2015-08-21 – v0.4.5
 * Core: Added Array.filter IE polyfill
 * Ad: Fixed an issue when setting expandable to a boolean value instead of stringified boolean
 * Template: Added a context parameter to the render function, used to set the `this` context when calling a template's view closure
 * Widget: Fixed an issue generating the current page url
 * Product: Added various CSS enhancements to for cross-site compatibility
 
## 2015-08-14

Core
 * Added util functions for detecting frames and mobile devices
 * Replaced the getOuterHeight util function with getElementSize, so both width and height are accessible
 
Product Widget
 * Updated interaction handling to popup the inline buy experience in a new window for applicable mobile devices
 * Added various contextual parameters to the inline_buy_url: popup, expandable, frame_height, frame_width, and ad_size
 * Added break for long run on titles on product widgets
 
Ad Widget
 * Added the computed ad size to the template container and data model

## 2015-08-12

Core
 * Added preview s3 CDN deployment for testing upcoming changes and related gulp task
 
Ad Widget
 * Uses the `product.single` template when dynamically rendering a product in an ad
 
Product Widget
 * Added template `product.sidebar` for a vertically-stacking product tile view
 * Added template `product.single` for a scaling a single product to fit into a medium_rectangle ad size
 * Updated the product.block template to accept a template name for reuse across other templates
 * Changed the text "Sold by" to "From" on product tiles for better semantic reading

## 2015-08-11

Core
 * Added util function `getOuterHeight` to get the height of an element
 * Added util function `ellipsify` to programmatically slice off text and add an ellipses, useful for multi-line overflow handling (won't break screen readers)
 
Product
 * Updated product.block template to include more default styling to work better as-is
 * Added buy button to the product.block template
 * Added the seller name to the product.block template
 * Updated overflow handling to use `ellipsify` for the title and standard css overflow for the seller name

Templates
 * Added common `visually-hidden` mixin to make things invisible on a page but still visible to the DOM
 * Added common `ellipses-after` mixin to add an ellipsis after the element's content
 * Moved the clearfix mixin from core to common
 * Updated modal.less to include from common instead of core

## 2015-08-06 – v0.4.3

Core
 * Removed Moat levels and slicers from the config
 
Moat
 * Fixed level/slicer values not getting encoded during compilation
 * Refactored the Moat URL generation logic to its own function, getTagUrl
 
Widget Base
 * Updated trackMoat to accept options for levels/slicers and the element to stick the tag in

Product
 * Added metrics_context constructor-only param to override the metrics reporting context
 * Updated the Moat usage to insert per product tile including levels and slicers, instead of per widget
 * Updated the product.block template to use the metrics_context value 

Ad
 * Updated Moat usage to include levels and slicers
 * Added an override to set the metrics context of the embedded product widget (to the ad widget)

## 2015-08-05 - v0.4.2
 * Changed modal overlay logic to fixed position instead of absolute positioning to better handle edge cases on scroll-hacked websites

## 2015-08-05 - v0.4.1

General
 * Added IDEA linting hinting & fixes
 * Removed support for IE7. Lowest IE support is now IE8.
 
Core
 * Added `getScrollPosition` util function to get the current page scroll location
 * Moved template class detect logic to `detectClasses` util function
 * Added clearfix and inline-block LESS mixins

Modal
 * Removed (customized) NanoModal
 * Created a new modal UI from scratch to better facilitate cross-platform inline-buy functionality
 
Polyfill
 * Re-enabled the IE8 Event preventDefault and stopPropagation shim
 
Ad
 * Prefixed template key names with `ad_`
 * Added config params to override which markup templates to use when rendering the widget instance (`template_ad_main` and `template_ad_error`)
 * Added product template override params to pass-through to the product widget
 
Product
 * Prefixed template key names with `product_`
 * Added config params to override which markup templates to use when rendering the widget instance (`template_product_main` and `template_product_error`)
 * Changed the class name given to the inline buy iframe to `okanjo-inline-buy-frame`
 * Updated inline_buy functionality to use the new modal
 
Templates
 * Added warning when attempting to insert a stylesheet that is not registered
 
Widget Base
 * Added a new step to the widget init workflow, `processTemplateOverrides` which handles overriding markup templates given in the  widget configuration
 * Changed the init order so that configuration parsing occurs first, then overriding templates, then followed by ensuring the templates are registered.
 * Added an additional note to the console when a template is fails the registration check, to check if the template was included.

## 2015-06-29 – v0.3.9
 * Fixed inconsistent data attribute `query` to be `q`.  
 * Fixed CSV handling to be consistent with `pools`, `tags`, and `category`.

## 2015-05-28 – v0.3.8
 * Enabled integration with Moat by default
 * Fixed AWS S3 upload handling of UTF-8 files (workaround gulp-awspublish + bad charset handling)

## 2015-05-11 – v0.3.7
 * Better okanjo namespace conflict handling
 * Fixed reference error in product sense mode if no URL was specified
 * Better sourcemaps for the js bundle 

## 2015-05-07 - v0.3.6
 * Updated Ad Widget modal to be re-center on screen resize.

## 2015-05-07 - v0.3.5
 * Added option `expandable` to indicate whether an ad should expand in a modal or remain in-unit.
 * Fixed close button for the modal to no longer initially be visible.
 * Added CSS for the ad iframe when it is in-unit.

## 2015-05-06 – v0.3.4
 * Added option `disable_inline_buy` to disable inline buy functionality in ad and product widgets, if desired (e.g. to drive traffic to a marketplace instead of transact on the publisher's page)

## 2015-04-27 – v0.3.3
 * Updated JSONP object serializer to handle arrays slightly better
 * Added support for Ad product pools, searches the global pool by default
 * Updated Moat analytics support to inject per widget, currently disabled by default
 * Removed duplicate Array.every polyfill

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