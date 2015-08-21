
# Okanjo JavaScript Widget Framework

When stuff changes, it's described here.

## 2015-08-21
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