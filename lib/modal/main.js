
var okanjoModal = (function() {

    var overlay, overlayButton;
    var doc = document;

    function init() {
        //noinspection JSUnresolvedFunction
        if (okanjo.qwery("#okanjoModalOverlay").length === 0) {
            //// Put the main styles on the page.
            //var styleObj = El("style");
            //var style = styleObj.el;
            //var firstElInHead = okanjo.qwery("head")[0].childNodes[0];
            //firstElInHead.parentNode.insertBefore(style, firstElInHead);
            //
            //var styleText = fs.readFileSync("src/style.min.css", "utf8");
            //if (style.styleSheet) {
            //    style.styleSheet.cssText = styleText;
            //} else {
            //    styleObj.text(styleText);
            //}"

            // Make the overlay and put it on the page.
            overlay = El("div", "okanjoModalOverlay okanjoModalOverride");
            overlay.el.id = "okanjoModalOverlay";

            // Make a pretty overlay button
            overlayButton = El("button", "okanjoOverlayCloseButton");
            overlayButton.el.setAttribute("title", "Close (Esc)");
            overlayButton.el.setAttribute("type", "button");
            overlayButton.el.innerHTML = '×';
            //overlay.el.appendChild(overlayButton.el);
            doc.body.appendChild(overlayButton.el);

            doc.body.appendChild(overlay.el);

            // Add an event so that the modals can hook into it to close.
            overlay.onRequestHide = ModalEvent();

            var overlayCloseFunc = function() {
                overlay.onRequestHide.fire();
            };

            overlay.addClickListener(overlayCloseFunc);
            overlayButton.addClickListener(overlayCloseFunc);
            El(doc).addListener("keydown", function(e) {
                var keyCode = e.which || e.keyCode;
                if (keyCode === 27) { // 27 is Escape
                    overlayCloseFunc();
                }
            });

            var windowEl = El(window);
            var resizeOverlayTimeout;
            windowEl.addListener("resize", function() {
                if (resizeOverlayTimeout) {
                    clearTimeout(resizeOverlayTimeout);
                }
                resizeOverlayTimeout = setTimeout(Modal.resizeOverlay, 100);
            });

            // Make SURE we have the correct dimensions so we make the overlay the right size.
            // Some devices fire the event before the document is ready to return the new dimensions.
            windowEl.addListener("orientationchange", function() {
                for (var t = 0; t < 3; ++t) {
                    setTimeout(Modal.resizeOverlay, 1000 * t + 200);
                }
            });
        }
    }

    if (document.body) {
        init();
    }

    var api = function(content, options) {
        init();
        //noinspection JSPotentiallyInvalidConstructorUsage
        return Modal(content, options, overlay, overlayButton, api.customShow, api.customHide);
    };
    api.resizeOverlay = Modal.resizeOverlay;

    return api;
})();

