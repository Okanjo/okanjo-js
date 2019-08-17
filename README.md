# SmartServe SDK

The Okanjo SmartServe SDK is [Okanjo's](http://okanjo.com) extensible widget framework for displaying recommended content 
units on a web page.

# Introduction

SmartServe matches products from our vast library of merchants to the most relevant content and readers across our 
network. For publishers, this provides a better user experience, showing readers products that compliment their 
interests. For brands, this drives organic product discovery and deeper engagement.

SmartServe can also recommend relevant content for readers from [Pressed](https://okanjo.com/pressed/), your website, 
or other content exchanges.

The SmartServe SDK is the JavaSCript code used to embed this technology in websites and applications. 
The JavaScript framework combines simplicity with flexibility to meet almost every imaginable use-case.

## Terminology

In this documentation, we'll reuse a few common terms.

SmartServe
:   The technology that recommends products and content to readers.
SmartServe SDK
:   The JavaScript framework that is used to deliver recommended content on web pages.
Placement / Widget / Unit
:   An instance of placement created using the SmartServe SDK. All three usages mean the same thing. 
Placement Key
:   The unique placement key, required for a placement to operate.
Resource
:   A product or article displayed within a placement. Placements may display many resources at a time.

## Prerequisites

#### Placement Keys
In order to use the SmartServe SDK, you'll need at least one placement key. 
Log in to the [Okanjo Dashboard](https://dashboard.okanjo.com) to manage placements. 

If you do not yet have an Okanjo Account, please [contact Okanjo](https://okanjo.com/contact/) to get started.

#### CSS
Having a basic understanding of [Cascading Style Sheets](https://developer.mozilla.org/en-US/docs/Web/CSS) (CSS) will 
help you customize how widgets appear on your web page. We offer a number of 
[display configurations](#placements-configuration-display-parameters) which meets the needs of most customers, 
but you can go above and beyond these defaults with your own custom CSS.

## Quick Start

### On Page

Here's a basic example of how to create a placement directly on a page:

```html
<div class="okanjo-placement" data-key="PUT_YOUR_PLACEMENT_KEY_HERE"></div>
<script src="https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js" crossorigin="anonymous"></script>
<script>
    (function() { // Initialize Okanjo placements
        window.__okanjoPlacements = window.__okanjoPlacements || []; 
        var targets = okanjo.qwery('.okanjo-placement:not(.loaded)'), i = 0;
        for ( ; i < targets.length; i++) {
            targets[i].className += ' loaded';
            window.__okanjoPlacements.push(new okanjo.Placement(targets[i]));
        }        
    })();
</script>
```

> Note: the `script` tags should only be included **once** per page. 

You can find [the latest code](https://github.com/Okanjo/okanjo-js/blob/master/examples/dfp.min.html) or the [unminified code](https://github.com/Okanjo/okanjo-js/blob/master/examples/simple.html) on GitHub. 


### Ad Server

You can also deploy SmartServe placements through ad servers, such as Google DFP.  

```html
<!-- Define the container placement tag container -->
<div id="okanjo-placement-container">
    <div class="okanjo-placement" data-key="PUT_YOUR_WIDGET_KEY_HERE"></div>
</div>

<!--
This script will asynchronously load the Ad or Product widget as configured. It will automatically move the drop-zone
outside of the iframe (when able to do so) to enable expandable functionality.
-->
<script>
    /*! Okanjo Placement Loader v3.0.1 - https://developer.okanjo.com/okanjo-js */
    !function(e){var t=document,n=window,a=t.getElementById("okanjo-placement-container"),o=n.top===n.self,c=!1;try{if(!o)for(var l,r,s=n.top.document.getElementsByTagName("iframe"),i=0;i<s.length;i++){l=s[i];try{if(r=l.contentDocument||s.contentWindow.document,r===document){a.removeAttribute("id"),l.parentNode.appendChild(a),l.style.display="none",t=n.top.document,n=n.top,c=!0;break}}catch(d){}}}catch(d){console.warn("[Okanjo]","Failed to locating parent frame.",d)}o||c||(console.warn("[Okanjo]","Forcing non-expandable functionality."),e.placement&&(e.placement.expandable=!1)),function(t){if(this.okanjo)t.call(this);else{var n=this,a=n.document,o=a.getElementsByTagName("body")[0],c=a.createElement("script"),l=!1;c.type="text/javascript",c.async=!0,c.setAttribute("crossorigin","anonymous"),c.onload=c.onreadystatechange=function(){l||this.readyState&&"complete"!==this.readyState&&"loaded"!==this.readyState||(l=!0,t.call(n))},c.src=e.src||"//cdn.okanjo.com/js/latest/okanjo-bundle.min.js",o.parentNode.insertBefore(c,o)}}.call(n,function(){var t=this,n=t.okanjo.qwery(".okanjo-placement:not(.loaded)",a),o=0;for(t.__okanjoPlacements=t.__okanjoPlacements||[];o<n.length;o++)n[o].className+=" loaded",t.__okanjoPlacements.push(new t.okanjo.Placement(n[o],e.placement))})
    }({
        placement: {
            // key: 'PUT_YOUR_PLACEMENT_KEY_HERE', // You could choose to set the placement key here instead of within the div tag 
            // expandable: true,
            proxy_url: '%%CLICK_URL_UNESC%%', // (Google DFP macro, change for your ad server)
        }
    });
</script>
```

You can find [the latest code](https://github.com/Okanjo/okanjo-js/blob/master/examples/dfp.min.html) 
or the [unminified code](https://github.com/Okanjo/okanjo-js/blob/master/examples/dfp.html) on GitHub. 


#### Click Tracking

When deploying placements using ad servers such as Google DoubleClick for Publishers (DFP), you may wish to insert 
your own click tracking URL to gauge performance through your own analytics provider.
  
> **Warning: Incorrectly configuring a custom tracking URL may break the placement and prevent readers from reaching the buy experience.** 
> Always be sure to test deployments before going live!

To insert your tracking url, set the `proxy_url` parameter (or `data-proxy-url` if using data-attributes) to your URL. 

> Do not escape or encode `proxy_url`. The placement will take care of encoding.

Common ad server macros:

 * **Google DFP**: `%%CLICK_URL_UNESC%%`
 * **Site Scout**: `{clickMacro}`
 * **AppNexus**: `${CLICK_URL}`

For example, in Google DFP, you would set `proxy_url` to `'%%CLICK_URL_UNESC%%'`. The placement handles escaping when 
building the final click-through URL chain.

The `proxy_url` must accept the escaped target url as the value of the last parameter. 
For example, this is how a link could be joined together:

> `<okanjo_metrics_url><esc_proxy_url><esc_esc_buy_url>`

```js
Example: 
let url = "https://api.okanjo.com/metrics/...&u=" + // Okanjo metrics
"https%3A%2F%2Fadclick.g.doubleclick.net...%26adurl%3D" + // 3rd Party metrics (escaped) 
"https%253A%252F%252Fshop.okanjo.com..." // Target url (double escaped)
```

The initial URL tracks the click with Okanjo. Next, when the `proxy_url` is given, the client will be redirected to 
the `proxy_url`. The proxy is then responsible for redirecting the client to the final target url. 


## Framework

The SmartServe SDK composed of two main build files – one containing the core functionality (`okanjo.js`), and the other
which controls the visual appearance of the widgets (`okanjo-templates.js`). Both scripts are combined to make
`okanjo-bundle.js`. When used, you will need to include either `okanjo-bundle.js` (recommended)
or both `okanjo.js` and `okanjo-templates.js` scripts separately. 

Architecturally, the SmartServe SDK is designed to be lightweight, unobtrusive and customizable. By default, the 
placements will include their own base stylesheets. Since placements are loaded the Document Object Model (DOM) 
of the page they are embedded, they will inherit the page's applicable styles. This generally minimizes the amount of 
customization needed by the publisher. In most cases, no customization is needed at all.

### Composition

Here is the composition of what each build file includes.

 * **okanjo.js**
   * **polyfills** – Smooths out compatibility across older and janky browsers
     * Array functions (from, find, findIndex, includes)
     * NodeList.forEach
     * Object.Assign
   * **vendor libs**
     * **mustache.js** – Used to render widget templates
   * **classes**
     * **Okanjo** – Core okanjo namespace, utility functions, etc
     * **Request** – Class for making API requests
     * **Cookie** – Class for working with cookies
     * **TemplateEngine** – Class for working with templates
     * **Modal** – Class for displaying interstitial(s)
     * **Metrics** – Class for working with metrics
     * **AutoPageView** – Automatically reports a page view when loaded
     * **EventEmitter** – Simplified EventEmitter base class
     * **Widget** – Base class for building widgets upon (eg. Placement)
     * **Placement** – The core Placement widget
     * **Product** – Deprecated Product widget (just rewrites to Placement)
     * **Ad** – Deprecated Ad widget (just rewrites to Placement)
  
 * **okanjo-templates.js**
   * **okanjo.core** – Base styling and functionality
     * **okanjo.modal** – Interstitial view
     * **okanjo.error** – Error view
   * **okanjo.block2** – Base template for `block2` template.
     * **adx.block2** – Template for third-party display ads in placements
     * **articles.block2** – Template for article content in placements
     * **products.block2** – Template for product content in placements

## CDN

For best results, we suggest using Okanjo's Content Distribution Network (CDN) to load the SmartServe SDK.

Okanjo's CDN offers both the latest and past SmartServe SDK versions. We recommend using the latest version, 
though should the need arise, you may lock your application at a specific version of the SmartServe SDK.

```
https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js
https://cdn.okanjo.com/js/v1.5.4/okanjo-bundle.min.js
```

Additionally, non-minified versions of the SDK are hosted on the CDN for debugging and development. 
Simply remove the `.min.js` with `.js` to load the non-minified version.

For most applications, the bundle script is the only dependency required to load placements.

```
https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js
```

However, you may choose to load the core and templates separately, in which case you would include both scripts.
 
```
https://cdn.okanjo.com/js/latest/okanjo.min.js
https://cdn.okanjo.com/js/latest/okanjo-templates.min.js
```

> Note: If loading asynchronously, the templates script must be loaded after the core (okanjo.js) has executed.  


## Embedding

The SmartServe SDK can be implemented many different ways. Most commonly, the script would be included synchronously, 
then widgets instantiated. Alternatively, the SmartServe SDK can be included asynchronously, useful for custom loaders 
and integration in ad servers.

Using either method, the overall process goes like this:

1. Load and execute the SmartServe SDK script(s)
2. Instantiate placements

When the SmartServe SDK scripts are executed (step 1), they will *not* initialize widgets on the page. 
That must be done manually (step 2).

### Synchronously

This is the most basic and simplest method for loading placements on a page. The premise is that the Okanjo scripts are 
embedded as a script tag, and the widget initialization is done later down on the page or on DOM ready / page load.

This method is best for sites that wish to include the SmartServe SDK on every page of the site, and have a 
generic load function to create widget instances on the page, if found. 
For example, find elements with a specific class name and create a widget instance. 

Take a look at the following example. 
The `div` with class `okanjo-placement` has a data attribute `data-key` which defines the placement's unique key. 
It also has a data attribute `data-take` with a value of `6` which specifies that six resources should be rendered. 
The first `script` tag loads the latest widget bundle from the CDN, specifying the `crossorigin` attribute to ensure that 
[Cross-Origin Resource Sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing), or CORS, does not pose a 
problem when communicating with the Okanjo platform. The second `script` tag locates all elements with the 
`okanjo-placement` class and initializes the placement, if not already loaded.

```html
<div class="okanjo-placement" data-take="6" data-key="PUT_YOUR_PLACEMENT_KEY_HERE"></div>
<script src="https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js" crossorigin="anonymous"></script>
<script>
    (function() { // Initialize Okanjo placements
        window.__okanjoPlacements = window.__okanjoPlacements || []; 
        var targets = okanjo.qwery('.okanjo-placement:not(.loaded)'), i = 0;
        for ( ; i < targets.length; i++) {
            targets[i].className += ' loaded';
            window.__okanjoPlacements.push(new okanjo.Placement(targets[i]));
        }        
    })();
</script>
```

> Note: the `script` tags should only be included **once** per page.

If you would like to load the core and templates separately, simply include both scripts separately, like so.

```html
<div class="okanjo-placement" data-take="6" data-key="PUT_YOUR_PLACEMENT_KEY_HERE"></div>
<script src="https://cdn.okanjo.com/js/latest/okanjo.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.okanjo.com/js/latest/okanjo-template.min.js" crossorigin="anonymous"></script>
<script>
    // same initialization as before
</script>
```

> Remember: When loading synchronously, do not include an `async` attribute on the script tags, or the widgets will fail to load.

> Also, the `script` tags should only be included **once** per page.

You can find [the latest code](https://github.com/Okanjo/okanjo-js/blob/master/examples/simple.html) on GitHub.

### Asynchronously

Loading the widget asynchronously enables you to embed a placement on a page after the page has already loaded or 
programmatically control the entire loading process.

The premise of asynchronous loading is the only one script tag is needed to load the SmartServe SDK.

> You'll need a basic understanding of JavaScript and the DOM to understand and customize these examples. 
 
Take a look at the following example. 

At the top, there is a `div` container that will receive the product widget we will 
dynamically create later in the script. This `div` could any any element on the page that you choose, but in this example, we
gave it an `id` so we can easily find it. Then, in the body of the script there are two parts, first part of the `function`
creates a new `script` element to load the Okanjo-JS bundle script asynchronously and attaches the script to the DOM. 
When the Okanjo-JS script loads, the second part of the script will execute as a callback. Here, the widget key is set
globally and a new DOM element is created to receive the product widget. The product widget is instantiated with the
given configuration options and attached to the `div` container.  


```html
<div
    class="okanjo-placement"
    data-key="PUT_YOUR_WIDGET_KEY_HERE">
</div>
<script>

    /**
     * Okanjo Async Loader v3.0.0
     */
    (function(callback) {
        var doc = document,
            head = doc.getElementsByTagName('head')[0],
            scriptTag = doc.createElement('script'),
            scriptLoaded = false;
        scriptTag.type = 'text/javascript';
        scriptTag.setAttribute('crossorigin', "anonymous");
        scriptTag.async = true;
        scriptTag.onload = scriptTag.onreadystatechange = function() {
            if (!scriptLoaded &&
                (!this.readyState || this.readyState === 'complete' || this.readyState === 'loaded')) {
                scriptLoaded = true;
                callback && callback();
            }
        };
        scriptTag.src = 'https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js';
        head.appendChild(scriptTag);
    }).call(window, function() {
        window.__okanjoPlacements = window.__okanjoPlacements || []; 
        var targets = okanjo.qwery('.okanjo-placement:not(.loaded)'), i = 0;
        for ( ; i < targets.length; i++) {
            targets[i].className += ' loaded';
            window.__okanjoPlacements.push(new okanjo.Placement(targets[i]));
        }   
    });

</script>
```

> Note: the `script` tags should only be included **once** per page.

If you would like to asynchronously load the core and templates separately, then take a look at the following example.
Only the script loading section differs from the previous example. Here, we asynchronously load the `okanjo.js` script.
When it completes, then we asynchronously load the `okanjo-templates.js` script. Once the template script is loaded, then
the initialization callback is fired.

```html
<div
    class="okanjo-placement"
    data-key="PUT_YOUR_WIDGET_KEY_HERE">
</div>
<script>

    /**
     * Okanjo Async Loader v3.0.0 – Dual Async
     */
    (function(callback) {
        var doc = document,
            head = doc.getElementsByTagName('head')[0],
            scriptTag = doc.createElement('script'),
            templateScriptTag = doc.createElement('script'),
            scriptLoaded = false,
            templateScriptLoaded = false;
        scriptTag.type = templateScriptTag.type = 'text/javascript';
        scriptTag.setAttribute('crossorigin', "anonymous");
        templateScriptTag.setAttribute('crossorigin', "anonymous");
        scriptTag.async = templateScriptTag.async = true;
        scriptTag.onload = scriptTag.onreadystatechange = function() {
            if (!scriptLoaded &&
                (!this.readyState || this.readyState === 'complete' || this.readyState === 'loaded')) {
                scriptLoaded = true;
                
                templateScriptTag.onload = templateScriptTag.onreadystatechange = function() {
                    if (!templateScriptLoaded &&
                        (!this.readyState || this.readyState === 'complete' || this.readyState === 'loaded')) {
                        templateScriptLoaded = true;

                        callback && callback();
                    }
                };
                
                scriptTag.src = 'https://cdn.okanjo.com/js/latest/okanjo-templates.min.js';
                head.appendChild(scriptTag);
            }
        };
        scriptTag.src = 'https://cdn.okanjo.com/js/latest/okanjo.min.js';
        head.appendChild(scriptTag);
    }).call(window, function() {
        window.__okanjoPlacements = window.__okanjoPlacements || []; 
        var targets = okanjo.qwery('.okanjo-placement:not(.loaded)'), i = 0;
        for ( ; i < targets.length; i++) {
            targets[i].className += ' loaded';
            window.__okanjoPlacements.push(new okanjo.Placement(targets[i]));
        }   
    });

</script>
```

> Note: the `script` tags should only be included **once** per page.

You can find [the latest code](https://github.com/Okanjo/okanjo-js/blob/master/examples/async.html) on GitHub.

# Placements    

The placement widget renders products, articles or display ads on the page. By default, placements will contextually 
match resources to the page content.

## Context Modes

There are two primary operation modes for placements.

Contextual
:   By default, placements will analyze the content of the page and return resources that are related in some way. Resources can be further limited using filters.  
Non-Contextual
:   Alternatively, the placement can be configured to retrieve resources that just meet the given filter criteria. This mode of operation has previously been called Browse mode.

**To use contextual matching**, set the `url` property to `"referrer"` or the canonical url of the page in which to match. 
By setting `url` to `"referrer"`, the current page url be used automatically.

**To disable contextual matching**, set the `url` property to `null` or `""` (empty string).  

## Native Content

Placements support inline or on-page experiences for resources that have an `inline_buy_url` property set. Primarily, 
this enables the native commerce purchase experience, allowing readers to transact directly through an interstitial. 
The benefit is that readers can engage with resources without leaving the page. 

In order to support this functionality, placements need to be initialized directly on the DOM of the web page. If the 
placement is initialized within an iFrame, the frame must be "friendly" to the parent, such that the placement can "bust"
out so that it may produce modals and other expandable functionality. 

In cases where the placement is initialized in an non-friendly frame, such as through ad-servers, placements will be 
flagged with a property `expandable` set to `false`, which will prevent the interstitial from leaving the bounds of the
placement.

In the event the publisher wishes to disable all native content experiences, setting `disable_inline_buy` to `true` will
disable expandable and non-expandable functionality. 

On mobile devices, modals with input fields are notoriously problematic. In these cases, we open a new window with the 
expandable functionality to create a reliable user experience. To disable this, set `disable_popup` to `true`. 

## Optimizing Results

SmartServe will make every effort to fill placements with the desired number of resources.

Sometimes, SmartServe will not be able to return enough resources to fill the placement. You can try to mitigate this 
in several ways.

### Page Content

When using contextual matching, make sure the page has enough readable content. This is one of the main reasons for poor
matching performance.  

If you programmatically generate page content, Okanjo may not be able to observe it. In this case, you should set the
`url` property to a canonical url that when retrieved, contains the readable content of the page.

If SmartServe is still unable to read the content of the page, you can set the `url_selectors` property to a CSV of CSS
selectors that will match elements that contain the content of the page. SmartServe will fall back to this property in 
the event we cannot automatically find content on the page. We recommend *not* setting this property unless absolutely necessary.

#### Content Access

SmartServe will make HTTP requests to the url of the page. If SmartServe is unable to access the URL, we will be unable
to make contextual matches.   

SmartServe will identify itself using the `user-agent` header:

```
OkanjoBot/VERSION (+https://okanjo.com/smartserve/)
```

If your system implements robot or crawler prevention methods, please make sure to whitelist the SmartServe user agent.
If needed, contact Okanjo support for information on whitelisting IP addresses. 


### Resource Content

Another factor that can cause odd results, is the product and article content itself. Products or articles with weak 
titles, descriptions, content, etc are inherently difficult to match. This may result in false positive or negatives.

To mitigate this, you can use additional filter criteria to limit resources to those you trust or meet the general
criteria you are going for.

### Troubleshooting

If you are experiencing problems, please [contact the Okanjo support team](https://okanjo.com/contact) for assistance.

## Placement (A/B) Testing

SmartServe supports multivariate testing using something we call Placement Tests. A placement may define one or more 
tests that will modify the placement settings during execution. Each test will be executed in sequence when fulfilling 
SmartServe requests. 

The default placement execution is called the default test, or "A" test. The default test can be disabled by setting 
the `placement_tests_only` parameter on the placement to `true`.

Consider the following examples.

 * **Placement 1**
   * Tests: *none*
   
The default placement settings (e.g. A) will execute 100% of the time.
   
 * **Placement 2**
   * Tests:
     * Test B
     
Both the default placement settings (e.g. A) and Test B will execute 50%.  
     
 * **Placement 3**
   * Tests:
     * Test B
     * Test C
     
The default placement settings (e.g. A), Test B, and Test C will each execute 1/3rd of the time.

 * **Placement 4** (`placement_tests_only=true`)
   * Tests: 
     * Test B
     * Test C
     
The default placement settings (e.g. A) is disabled, leaving Test B and Test C with an execution share of 50%.

Placement testing can be a very useful tool for reporting and testing content optimizations.

See the [Create Placement Test](https://developer.okanjo.com/api#placements-create-a-placement-test) api route for more information.

### Test Conditions

SmartServe allows you to schedule your tests so that you can perfect deployments and optimizations. Placement tests 
support two time-based conditions.

Runtime
:   Defines the hours of the day the test can run. Useful for only running a test during certain parts of the day. Takes parameters `start_hour` and `end_hour` (0-23).
Schedule
:   Defines the starting and ending date and times the test will run. Takes parameters `start_date` and `end_date`, as ISO timestamps. If you wish to run the test until cancelled, set `end_date` to `null`. 

See the [Create Placement Test](https://developer.okanjo.com/api#placements-create-a-placement-test) api route for more information.


## Backfill Resources

SmartServe has a contingency feature which allows you to customize how to fill empty placements. 

Sometimes, a placement may not be able locate any matches to fill a placement. For example, if a placement requests
products that are related to the page, perhaps the page content topics are very obscure or there are not enough 
products that are related to those topics available. In this event, the SmartServe backfill process will execute, which
attempts to fill the placement with other resources.

> Note: The backfill process will only execute when no resources were returned from the initial workflow.

Using the `backfill` settings on placements, you can control what content will appear when backfilling. The
`backfill` settings container supports all of the standard `filters` and `display` settings of a placement. If there are
no initial matched resources, SmartServe wil composite the backill settings and re-run the workflow. See the 
[Compositing](#placements-configuration-compositing) section for more details on the compositing process.

For example, with backfill, you could:

 * Remove the contextual matching requirement to find any desirable product or article
 * Display articles instead of products, or vice versa
 * Display a Google DFP ad
 
See the [Create Placement](https://developer.okanjo.com/api#placements-create-a-placement) api route for available 
settings.

> SmartServe does not currently support contingency features for shortfall events (when some but not all resource 
> slots are full). If you are interested in this feature, please contact Okanjo support.


## Configuration

SmartServe placements support a large number of configuration parameters to control how and what resources are displayed.

Placement configuration can be stored on the placement itself (preferred), directly on the web page, or both. 
Additionally, a placement will inherit configuration parameters from its Okanjo Property and Organization.

### Compositing

When SmartServe executes, all settings are composited in the following order:

1) Okanjo Platform Defaults
:   By default, placements use contextual matching to return 5 product resources.
2) Organization Defaults
:   Organization level defaults. None set by default.
3) Property Defaults
:   Property level defaults. None set by default.
4) Placement Settings
:   This is where individual placements should be configured.
5) Request Settings
:   Settings provided by a web page will override all previously set parameters.
6) Placement Test Settings
:   If a placement test is executing, its settings will be applied at this stage.
6a) Workflow Executes
:   SmartServe runs using the composited settings thus far.
7) Backfill Settings
:   If there were not enough resources to fulfill the request, the backfill settings will apply to fill the remaining slots.
7a) Backfill Workflow Executes
:   SmartServe runs one final time, attempting to locate resources to fill the remaining slots.

> Note: steps 7 and 7a only apply when not enough resources could be returned to meet the placement's demand.

### Page-Side Configuration
 
Placements can be configured through the `new Placement(element, options)` constructor or using data-attributes on the target
HTML element. 

> When using both constructor parameters and data-attributes, data-attributes will take priority.

Placements accept all of the `filters` and `display` parameters that the 
[SmartServe API route](https://developer.okanjo.com/api#ads-fill-placement) accepts.

Since each filter and display option is unique, you can specify them directly in `options` or as data-attributes. You 
can optionally choose to bucket them if you wish. Take for instance, the following example.

Here, the instances `placement1`, `placement2`, and `placement3` are all equivilent and will produce the same result.

```html
<div id="placement-1" data-key="PUT_KEY_HERE"></div>
<div id="placement-2" data-key="PUT_KEY_HERE"></div>
<div id="placement-3" data-key="PUT_KEY_HERE" data-take="2" data-size="medium_rectangle"></div>
<script>
let placement1 = new okanjo.Placement(document.getElementById('placement-1'), {
    filters: {
        take: 2
    },
    display: {
        size: 'medium_rectangle'
    }
});

let placement2 = new okanjo.Placement(document.getElementById('placement-2'), {
    take: 2,
    size: 'medium_rectangle'
});

let placement3 = new okanjo.Placement(document.getElementById('placement-3'));

</script>
``` 

> Data attributes: For parameters that contain an underscore (`_`), substitute a dash (`-`). Additionally, parameters that accept an array of values, you can provide a CSV instead.

### Filter Parameters

These parameters affect what resources can be included within a placement.

For a complete list of options, see the [SmartServe API route](https://developer.okanjo.com/api#ads-fill-placement).

Here are a few of the most commonly used parameters:

type ((optional)) ((string))
:   Output result type. One of: `products`, `articles`, `adx`. 
url ((optional, default is `referrer`)) ((string))
:   Filter resources to be related to the given article URL. Can be set to `referrer` to represent the URL of the source placement.  
take ((optional)) ((number))
:   Returns this many resources. Used for pagination.     
sort_by ((optional)) ((string))
:   Result sorting mode. One of: `score`, `random`, `created`, `published`, `title`, `price`. 
sort_direction ((optional)) ((string))
:   Result sort direction. Either: `asc`, `desc`. 

> Note: Some filter parameters only apply to product resources, some only apply to article resource, and some can be used with both.

### Display Parameters

These parameters affect the visual appearance of placements. 

size ((optional)) ((string))
:   Optimizes the placement for a particular ad size. Available sizes: `medium_rectangle` (2 resources), `leaderboard` (3 resources), `large_mobile_banner` (1 resource), `half_page` (5 resources), `billboard` (6 resources).
template_name ((optional)) ((string))
:   Specifies the template to use. Unless you have made your own custom template set, this must be set to `block2`.
template_layout ((optional)) ((string))
:   Resources displayed as a `grid` or `list`. Without `size` specified, defaults to `grid` view. Using size `leaderboard`, `large_mobile_banner`, and `half_page` will default to `list` and ignore this parameter.
template_theme ((optional)) ((string))
:   Typographic theme, defaults to a sans-serif font stack. Otherwise, `newsprint` can be specified, which changes to a serif font stack.
template_cta_style ((optional)) ((string))
:   The call to action (CTA) button visual style. Can be `button` or `link`. Links will take less space, and usually allow for longer product titles. Size `leaderboard` and `large_mobile_banner` override this parameter and are always set to `link`.
template_cta_text ((optional)) ((string))
:   The text within the CTA button, will be css-truncated if too long for given layout. Defaults to `Shop Now` for products and `Read Now` for articles.
template_cta_color ((optional)) ((string))
:   The color of text and border/background of the CTA button or link, default: `#0099ff`. Acceptable values are any css color code or color name. Text will be set against a white background so make sure to specify a color that is dark enough and reads well against white.
adx_unit_path
:   Custom Google DFP ad unit path. Default's to DFP units managed by Okanjo. Change this to use your DFP units. Only applies when displaying third party display ads in the placement (`type: 'adx'`)

### Other Parameters

These parameters affect functionality of the widget.

key ((required)) ((string))
:   The unique placement key in which to load.
no_init ((optional)) ((boolean))
:   When `true`, the placement will not automatically. You will then need to trigger it manually. For example: `(new Placement(element, {no_init:true})).init()`
proxy_url ((optional)) ((string))
:   Ad server click-through tracking url. See [Click Tracking](#clicktracking) for usage details.
expandable ((optional, default is `true`)) ((boolean))
:   Whether interstitials are allowed to expand past the bounds of the placement.
disable_inline_buy ((optional, default is `false`)) ((boolean))
:   Whether interstitials are allowed to run. 
disable_popup ((optional, default is `false`)) ((boolean))
:   Whether mobile devices opens an interstitial in a new window for broader device support. 
testing ((optional, default is `false`)) ((boolean))
:   Whether to flag metrics as testing (excluded from reports)

## Examples

Here are a few live basic examples

### Product Placements

Here are a few examples of placements displaying products.

#### Medium Rectangle 
Two products in a 300x250 ad size.

<div class="placement-example">
    <div class="okanjo-placement" 
        data-key="pmk_rHuDG33MlHEvwcCleJawMaf8urIfsB4"
        data-take="2"
        data-size="medium_rectangle"
        style="min-height: 250px;"
    ></div>
</div>

```html
<div class="okanjo-placement" 
    data-key="PUT_YOUR_KEY_HERE"
    data-take="2"
    data-size="medium_rectangle"
></div>
```

#### Half Page 
Five products in a 300x600 ad size.

<div class="placement-example">
    <div class="okanjo-placement" 
        data-key="pmk_4cCfx1Hv8vro4FY0fg615DraQJlN6Awg"
        data-take="5"
        data-size="half_page"
        style="min-height: 600px;"
    ></div>
</div>

```html
<div class="okanjo-placement" 
    data-key="PUT_YOUR_KEY_HERE"
    data-take="5"
    data-size="half_page"
></div>
```

#### Responsive 
Two products in a responsive ad size.

<div class="placement-example">
    <div class="okanjo-placement" 
        data-key="pmk_rHuDG33MlHEvwcCleJawMaf8urIfsB4"
        data-take="2"
        data-size="auto"
        style="min-height: 250px;"
    ></div>
</div>

```html
<div class="okanjo-placement" 
    data-key="PUT_YOUR_KEY_HERE"
    data-take="2"
    data-size="auto"
></div>
```


### Article Placements

#### Leaderboard

3 articles in a 728x90 ad size.

<div class="placement-example" style="width: 728px;">
    <div class="okanjo-placement" 
        data-key="pmk_1W0fkWVTPLaCGIgRmoCkQ70lsEQFf8R8"
        data-type="articles"
        data-organization-id="org_2hBCLWEwXpfGNRqLc"
        data-take="3"
        data-size="leaderboard"
        style="min-height: 90px;"
    ></div>
</div>

```html
<div class="okanjo-placement" 
    data-type="articles"
    data-key="PUT_YOUR_KEY_HERE"
    data-take="3"
    data-size="leaderboard"
></div>
```

#### Large Mobile Banner

One article in a 320x100 ad size.

<div class="placement-example">
    <div class="okanjo-placement" 
        data-key="pmk_mL6l8g0ZQgwjRVPVc9Ac2bUiqjsnE2d"
        data-type="articles"
        data-organization-id="org_2hBCLWEwXpfGNRqLc"
        data-take="1"
        data-size="large_mobile_banner"
        style="min-height: 100px;"
    ></div>
</div>

```html
<div class="okanjo-placement" 
    data-key="PUT_YOUR_KEY_HERE"
    data-type="articles"
    data-take="1"
    data-size="large_mobile_banner"
></div>
```

#### Responsive

Two articles in a responsive ad size.

<div class="placement-example">
    <div class="okanjo-placement" 
        data-key="pmk_mL6l8g0ZQgwjRVPVc9Ac2bUiqjsnE2d"
        data-organization-id="org_2hBCLWEwXpfGNRqLc"
        data-type="articles"
        data-take="2"
        data-size="auto"
        style="min-height: 250px;"
    ></div>
</div>

```html
<div class="okanjo-placement" 
    data-key="PUT_YOUR_KEY_HERE"
    data-type="articles"
    data-take="2"
    data-size="auto"
></div>
```

<script>
    /**
     * Okanjo Async Loader v3.0.0
     */
    (function(callback) {
        var doc = document,
            head = doc.getElementsByTagName('head')[0],
            scriptTag = doc.createElement('script'),
            scriptLoaded = false;
        scriptTag.type = 'text/javascript';
        scriptTag.setAttribute('crossorigin', "anonymous");
        scriptTag.async = true;
        scriptTag.onload = scriptTag.onreadystatechange = function() {
            if (!scriptLoaded &&
                (!this.readyState || this.readyState === 'complete' || this.readyState === 'loaded')) {
                scriptLoaded = true;
                callback && callback();
            }
        };
        scriptTag.src = 'https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js';
        head.appendChild(scriptTag);
    }).call(window, function() {
        window.__okanjoPlacements = window.__okanjoPlacements || []; 
        var targets = okanjo.qwery('.okanjo-placement:not(.loaded)'), i = 0;
        for ( ; i < targets.length; i++) {
            targets[i].className += ' loaded';
            window.__okanjoPlacements.push(new okanjo.Placement(targets[i]));
        }   
    });
</script>