(function(okanjo, window) {

    var metrics = okanjo.metrics = {

        _trackers: {},

        events: {},

        addGoogleTracker: function(id, prefix) {

            window._gaq = window._gaq || [];

            var _gaq = window._gaq;

            if (!prefix) {
                prefix = 'tracker_' + Object.keys(metrics._trackers).length;
            }

            _gaq.push(function() {
                window._gat._createTracker(id, prefix);
            });

            _gaq.push([prefix + '._setDomainName', window.location.host]);
            _gaq.push([prefix+'._setAllowLinker', true]);
        },


        addDefaultTracker: function(prefix) {
            metrics.addTracker(prefix, function(event_data) {

                // Ensure event type
                if(typeof event_data.type === 'undefined') {
                    event_data.type = 'event';
                }

                // Push the tracker
                window._gaq.push([prefix+'.'+(event_data.type == 'pageview' ? '_trackPageview' : '_trackEvent')].concat(event_data.args));
            });
        },


        addTracker: function(name, tracker) {
            metrics._trackers[name] = tracker;
        },


        trackEvent: function() {
            metrics.track({
                'type' : 'event',
                'args' : arguments
            });
        },


        trackPageView: function() {
            this.track({
                'type' : 'pageview',
                'args' : arguments
            });
        },


        track: function(event_data) {
            for(var prefix in metrics._trackers) {
                if(metrics._trackers.hasOwnProperty(prefix)) {
                    metrics._trackers[prefix](event_data);
                }
            }
        }

    };

    (function configure() {
        if (!document.getElementById('#okanjo-metrics')) {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            ga.id = 'okanjo-metrics';

            okanjo.qwery('body')[0].appendChild(ga);
            metrics.addGoogleTracker(okanjo.config.analyticsId, 'okanjo');
        }

        metrics.addDefaultTracker('okanjo');
    })();

})(okanjo, this);