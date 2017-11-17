"use strict";

import metrics from './Metrics';

// Track the page view, but don't send it right away.
// Send it in one full second unless something else pushes an event
// This way, we have a chance that a placement key will be set globally
metrics.trackPageView({_noProcess:true});
setTimeout(() => {
    metrics._processQueue();
}, 1000);

export default null;