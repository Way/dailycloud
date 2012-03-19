/**
 * Control module
 */
(function($) {
    /**
     * Widget
     */
    var widget = (function() {

        return {
            /**
             * Namespace of the Widget
             */
            ns : 'ui',

            /**
             * Name of the Widget
             */
            name : 'control',

            // default options
            options : {

            },

            // Element store
            _dom : {},

            // Create widget
            _create : function() {
                if(this._trigger('create', null, this) !== false) {
                    var dom = {};

                    // Store self of the input element
                    dom.self = this.element;
                    $.extend(this._dom, dom);

                    this.bindEvents();
                }
            },
            // Initialize widget
            _init : function() {
                if(this._trigger('init', null, this) !== false) {
                    this._trigger('ready', null, this);
                }
            },
            show : function() {
                if(this.isVisible()) {
                    this._trigger('visible', null, this);
                } else {
                    var self = this;
                    this._dom.self.animate({
                        opacity : 'toggle',
                        height : 'toggle'
                    }, function() {
                        self._trigger('visible', null, self);
                    });
                }
            },
            hide : function() {
                this._dom.self.hide();
            },
            bindEvents : function() {
                var self = this;
                // App.Dom.get(document).mousemove(function(e) {
                // if(!self._firstMove) {
                // self._firstMove = true;
                // self.show();
                // }
                // });

                // Add separator between control and widgets container
                // App.Dom.get('#widgets').scroll(function() {
                // if(this.scrollTop > 0) {
                // App.Dom.get('#control').addClass('separate');
                // } else {
                // App.Dom.get('#control').removeClass('separate');
                // }
                // });
            },
            isVisible : function() {
                return this._dom.self.is(':visible');
            }
        }
    })();

    // Create widget under the namespace with its name and let it inherit from the base widget
    $.widget(widget.ns + '.' + widget.name, $.ui.baseWidget, widget);

})(jQuery);
