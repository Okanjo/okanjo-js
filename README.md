
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
TODO

## Asynchronous Usage
TODO

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