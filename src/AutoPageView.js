"use strict";

//noinspection ThisExpressionReferencesGlobalObjectJS
(function(window) {

    const okanjo = window.okanjo;

    // Track the page view, but don't send it right away.
    // Send it in one full second unless something else pushes an event
    // This way, we have a chance that a placement key will be set globally
    okanjo.metrics.trackPageView({_noProcess:true});
    setTimeout(() => {
        okanjo.metrics._processQueue();
    }, 1000);

})(window);