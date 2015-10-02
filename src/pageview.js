//noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(okanjo, window) {

    // Track the page view, but don't send it right away.
    // Send it in one full second unless something else pushes an event
    // This way, we have a chance that the api key will be set globally
    okanjo.metrics.trackPageView({_noProcess:true});
    setTimeout(function() {
        okanjo.metrics._processQueue();
    }, 1000);

})(okanjo || this);