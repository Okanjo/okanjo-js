
# Okanjo JavaScript Widget Framework

Extensible framework for embedding Okanjo on the web.

## CDN
Please use the following URLS hosted on our CDN:

### Bundle
Includes both the widget framework and standard templates. Unless you're using customized templates, you should use these.

```
https://cdn.okanjo.com/js/latest/okanjo-bundle.js      -- for development
https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js  -- for production
```

### Components
You can also choose to include the framework and templates separately, such as when you use your own set of templates.

```
https://cdn.okanjo.com/js/latest/okanjo.js      -- for development
https://cdn.okanjo.com/js/latest/okanjo.min.js  -- for production

https://cdn.okanjo.com/js/latest/okanjo-templates.js      -- for development
https://cdn.okanjo.com/js/latest/okanjo-templates.min.js  -- for production
```

### Lock Versions
You may also choose to lock your version at a specific [release](https://github.com/Okanjo/okanjo-js/releases), for example:
```
https://cdn.okanjo.com/js/v0.2.11/okanjo-bundle.js      -- for development
https://cdn.okanjo.com/js/v0.2.11/okanjo-bundle.min.js  -- for production
```

## Basic Usage
The simplest way of using the Okanjo widget framework, is to include the bundle and create widget instances on the page load. For example:

```html
<div id="i-want-a-product-widget-here" data-take="6"></div>
<script src="https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js" crossorigin="anonymous"></script>
<script>

    // You can set the global key on the okanjo namespace, or you can set it as an option on the widget constructor
    okanjo.key = 'PUT_YOUR_WIDGET_KEY_HERE';

    // Load a product widget an element of your choice
    var p = new okanjo.Product(document.getElementById('i-want-a-product-widget-here'), { /* options, if any */ });
    
</script>
```

And that's it. Pretty simple!


## Asynchronous Usage
You can load the Okanjo widget framework dynamically during or after the page has already loaded. There are many different ways to achieve this, but the simplest can look like this:

```html
<div id="some-random-container"></div>
<script>

    // Async load
    (function(callback) {

        var d = document,
                es = d.getElementsByTagName('script')[0],
                o = d.createElement('script'),
                ro = false;

        o.type = 'text/javascript';
        o.async = true;
        o.setAttribute('crossorigin', "anonymous");
        o.onload = o.onreadystatechange = function() {
            if ( !ro && (!this.readyState || this.readyState == 'complete' || this.readyState == 'loaded') ) { 
                ro = true; callback && callback(); 
            }
        };

        o.src = 'https://cdn.okanjo.com/js/latest/okanjo-bundle.min.js';

        es.parentNode.insertBefore(o, es);

    }).call(window,
            function() {

                // Set global widget key
                okanjo.key = "PUT_YOUR_WIDGET_KEY_HERE";

                // Create a new element to stick the widget in, and find the desired container
                var test = document.createElement("div"),
                    container = document.getElementById('some-random-container');

                // These properties will override any options passed into the Product constructor
                test.setAttribute('data-mode', 'browse');
                test.setAttribute('data-take', '6');
                test.id = 'test-browse';

                // Stick our element on the DOM
                container.appendChild(test);

                // Use the options of the Product widget constructor to options
                window.myWidget = new okanjo.Product(test, { mode: 'browse', take: 6 });
                
                // ^ You can access the widget instance on the window if you need to or just throw it away

            });

</script>
```


## Building Okanjo-JS
 
1. `git clone https://github.com/Okanjo/okanjo-js.git`
2. `npm install` # (install build dependencies)
3. `gulp` # (builds and starts a file watcher; control+c to exit)

### Gulp Build Tasks

#### `gulp`
Active development mode. Does a `full-build` and watches for changes to templates and sources and automatically rebuild.

#### `gulp full-build`
Builds, bundles, and fixes everything.

#### `gulp min`
Builds only `okanjo.js` and `okanjo.min.js` and exits.

#### `gulp templatesjs`
Builds only `okanjo-templates.js` and `okanjo-templates.min.js` and exists.

#### `gulp bundle`
Builds `okanjo-bundle.js` and `okanjo-bundle.min.js` and exists.

#### `gulp fix-maps`
Fixes the minified sourcemap references to relative paths, used for deployment.


### Gulp Deployment Tasks
Make sure you do a full-build

#### `gulp pre-deploy-bump`
Bumps the build version in `package.json` and `bower.json`, commits to git, tags the release in git, and does a push.

#### `gulp deploy-s3`
Deploys the distribution files to `/js/latest` and `/js/version` to the Amazon S3 bucket defined in `aws-credentials.json`. 
If you want to do this, you'll want to copy `aws-credentials.default.json` to `aws-credentials.json`, and probably change the paths in `gulpfile.js`.

#### `gulp deploy`
The full gambit. Bumps the release version, commits to git, tags the release in git, pushes to git, and deploys everything to Amazon S3.


### Gulp File Watchers

#### `gulp watch`
Watches for core `okanjo.js` related changes (except vendor files) and rebuilds the core when changed.

#### `gulp watch-templates`
Watches for core `okanjo-templates.js` related changes and rebuilds the templates when changed.


## Contributing
We would love your pull-requests, and feedback in general. Please fork this repository, make a branch, make your changes, and start a pull-request.


## Known Issues
These are the things we currently know of:

* IE7: Clicking images in product tiles won't trigger link action