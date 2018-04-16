
# Okanjo JavaScript Widget Framework

When stuff changes, it's described here.

## Unreleased

Housekeeping:
 * Moved docs from okanjo-docs to README.md
 * Removed bower from build flow
 * Added yarn lockfile
 * Updated build flow and tests to work without bower
 * Added travis-ci integration
 * Updated gulp-git to latest to work with node 8+

## 2018-01-22 – v1.5.4
 * Adjusted element position algorithm in an attempt to reconcile differences with mobile browsers and zooming

## 2017-12-14 – v1.5.3
 * Fixed widget impression firing before content was rendered 

## 2017-12-14 – v1.5.2
 * Added missing viewport info on various impression events

## 2017-11-17 – v1.5.1
 * Added polyfills for old IE (support down to IE 10, Edge 14)
 * Removed unused domready shim
 * Fixed typo in parameter sent on placement content fetch

## 2017-11-01 – v1.4.2
 * Added utm_source/utm_campaign params to click-through urls

## 2017-10-17 – v1.4.1
 * Added various response metrics to events

## 2017-10-02 – v1.3.1
Added support for viewable impression events
 * Added: okanjo.ui.getElementPosition will include `err` if the element position is unavailable
 * Added: okanjo.ui.getPercentageInViewport to return what % (0-1) of the element is in the viewport
 * Added: Placement constants and handlers for tracking viewable impressions on widgets, products, articles, and adx
 * Fixed: Placement configuration `url_referrer` was ignored if manually configured

## 2017-09-15 – v1.2.1
 * Added: metrics include window location to disambiguate referral traffic
 * Fixed: sid does not need to be included on every event in a bulk report

## 2017-08-31 – v1.1.2
 * Changed: Moved placement content route

## 2017-07-13 – v1.1.1
 * Fixed: metadata values with long values would cause api error (they're truncated now)
 * Fixed: placement title truncation was not updated to work with the new resource selector names
 * Added: test to ensure long meta values are truncated 

## 2017-06-28 - v1.1.0
 * Changed: Refactored product, article and adx block2 styles into a common block2 stylesheet. Products/Articles/Adx will offer their own extensions to the core block2 styles, reducing overall code payload and improves ease of customization  
 * Fixed: inconsistent declined meta tagging

## 2017-06-06 - v1.0.1
 * Fixed: Missing automatic page view metrics 

## 2017-06-05 – v1.0.0
Total refactor of the placement framework. Everything has changed.

### Goals
 * **New platform**: We've significantly beefed up our SmartServe tech, and have a brand new backend ready to handle content requests. 
 * **One Placement to Rule Them All**: Instead of several different widgets, there is now a single widget: Placement.
 * **Modernization**: The framework has been updated to ES6, using Babel to compile our classes back down to ES5 for the internet.
 * **Fully Tested**: We need to be able to rapidly add enhancements to our placement tech, and that usually means we'll break something. Everything is now 100% unit tested covered. 

### Deprecations
 * The Product widget has been deprecated. It will convert the old configuration to the Placement configuration, but you should change your markup to use Placements instead.
 * The Ad widget has been deprecated. It will now only show the dynamic product view, since support for creatives has been removed. You should update your markup to use Placements instead. 
 * Caching has been removed. This always proved to be problematic and we didn't feel the need to keep it.
 * Polyfills have been removed. As part of our modernization, we will only support browsers with 1% or more of world-wide traffic. Goodbye, IE 8, 9 and 10.
 * Attributes: `data-page-start`, `data-page-size` have been removed. Use `data-skip` and `data-take` instead.

### Updates
 * Use of JSONP has been replaced with XHR.
 * Placements can now be configured on the server. This allows dynamic changes to configurations to be made without contacting your devs.
 * Placements can now serve different types of content depending on type.
 * Template names should be prefixed with the content type they render.
 * Metrics now report in batches and save locally in the event of network issues or navigation events.
 * Widget configuration is substantially more flexible and robust.
 * Tons of bug fixes and other enhancements.

## 2017-03-10 – v0.9.4
 * Added pixels to templates

## 2017-01-23 – v0.9.3
 * Updated Google Ad markup 
 * Added buy url param pass through for better reporting 

## 2016-11-27 - v0.9.2
 * Added product-block2 classes to article markup for backwards compatibility

## 2016-11-26 - v0.9.1
 * Added support for experimental article matching mode

## 2016-09-09 – v0.8.4
 * Prioritized 720x90 over 300x250 to better fill a wider space
 * Default ADX backfill ads to be centered in their original container

## 2016-09-08 - v0.8.3
 * Enabled ADX backfill via placement testing

## 2016-08-07 - v0.8.2
 * Fixed missing product ids in normalized event data

## 2016-08-06 – v0.8.1

Metrics
 * Refactored event normalization to its own helper
 * Added truncation helper to limit properties to ensure acceptance

Product Widget
 * Refactored all events to use metric normalization to correct consistency and reduce redundancy 
 * Fixed leaking of callback param into config property on api exec
 * Refactored click through url function to convert event into an actual url
 * Fixed missing instance id in the deprecated sidebar template

## 2016-08-01 – v0.7.7
 * Added js build version to interaction events

## 2016-07-26 – v0.7.6
 * Disabled caching API responses by default

## 2016-07-20 – v0.7.5
 * Added js build version to the okanjo object and reported metrics

## 2016-07-20 – v0.7.4
 * Added `url_category` sense mode parameter to indicate the taxonomy/genre of the article
 * Added support for back-filled products when running in sense mode
 * Removed deprecated `text` sense mode parameter from product config

## 2016-07-18 - v0.7.2
 * Removed offer/price schema attributes from template to avoid issues where articles list prices in google search results.

## 2016-07-01 - v0.7.1
 * New size `auto` option for product block2 templates, allows full-width lists for more native placements.
 * Added opt-in parameter `backfill` to show a display ad when no products match the page content.

## 2016-06-28 – v0.6.15
 * Added instance ids for page and widgets

## 2016-06-09 - v0.6.14
 * Added ability to disable mobile popup functionality (use at your own risk!)
 * Added placement test support to deprecated templates

## 2016-06-03 – v0.6.13
 * Fixed an issue with page argument parsing, when the arguments themselves are encoded poorly
 * Added support for A/B placement testing and reporting

## 2016-05-12 – v0.6.12
 * Added metric cart object type

## 2016-04-11 – v0.6.11
 * Added shortid derivative helper


## 2016-03-23
 * Fixed edge case in tile display for products without a `sold_by` property
 

## 2016-03-23 - v0.6.10
 * Added support for custom cta text via product meta data key `cta_text`
 * Added click event positional data


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