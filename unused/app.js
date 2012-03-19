/**
 * Dom cache and library
 */
(function(window, undefined) {
    window.App = App = (function() {
        var
        // settings
        _options = {},

        // Loaded data
        _data = {},

        // Map contains all widgets
        _widgets = {},

        // Loading state (contains number of active requests)
        _loading = 0,

        // Debug mode
        _debug = false,

        // Reference to the window
        $win = $(window);

        // Public methods
        return {
            init : function(debug) {
                // Set debug mode on/off
                _debug = !!debug;

                // Load tags of the current user
                this.Tags.load();
            },
            addData : function(data) {
                if(data && data.id) {
                    _data[data.id] = data;
                }
            },
            getData : function(id, fullData) {
                if(_data[id] !== undefined) {
                    if(!!fullData) {
                        return _data[id];
                    }
                    return _data[id].data;
                }
                return null;
            },
            addWidget : function(id, widget) {
                _widgets[id] = widget;
            },
            getWidget : function(id) {
                if(_widgets.hasOwnProperty(id)) {
                    return _widgets[id];
                }
                return null;
            },
            loading : function(start) {
                _loading = start ? ++_loading : (--_loading < 0 ? 0 : _loading);

                if(_loading > 0) {
                    Dom.get('#loading').show();
                } else {
                    Dom.get('#loading').hide();
                }
            },
            ajax : function(request) {
                var self = this, settings = $.extend({}, {
                    type : 'POST',
                    dataType : 'json'
                }, request);

                self.loading(true);

                return $.ajax(settings)
                // Success
                .done($.proxy(this.ajaxDone, this))
                // Error
                .fail($.proxy(this.ajaxFail, this))
                // Complete
                .always($.proxy(this.ajaxAlways, this));
            },
            ajaxDone : function(data) {
                if(data && data.error) {
                    this.error(data.message);
                }
            },
            ajaxFail : function() {
                var args = Array.prototype.slice.call(arguments);
                this.error.apply(this, args);
            },
            ajaxAlways : function() {
                this.loading(false);
            },
            error : function() {
                var args = Array.prototype.slice.call(arguments);
                debug.error(args);
            }
        };

    })();

})(window);
