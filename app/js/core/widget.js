/**
 * Widget 'class' to create new widgets, register their root element
 * in the DOM 'class' library and which provides a getter and setter functionality
 * for every kind of property within this widget.
 */
(function(window, undefined) {

    /**
     * AppWidget constructor
     *
     * @param selector - Selector to attach the element(s) to the new widget
     * @param name - Name of the widget initialize function (mostly name of the plugin)
     * @param opts - Options to pass to the widget initialization
     * @return Widget
     */
    function AppWidget(selector, name, opts) {
        this.options = opts || {};
        this.el = App.Dom.get(selector);

        // Id of the widget is the selector without its special chars (.|#)
        this.id = selector.replace(/(\.|#)/gi, '');
        this.name = name;

        // Call the constructor
        this.init();
    }

    // Widget prototype object
    var object = {
        // Reserved fields for this object
        __reserved : 'options el id name set get'.split(' '),

        init : function() {
            // Check for the existence of the element
            if(!this.el || this.el.length === 0) {
                console.warn('Warning: Element with id "' + this.id + '" not found.');
                return false;
            }

            // Use given initialization function or use the id as the init proxy function name
            var init = this.name || this.id;
            if(!!this.el[init]) {
                this.el = this.el[init].call(this.el, this.options);
            }

            // Set the created widget by its id
            this.set(this.name, this.el.data(this.name));
        },
        // Setter
        set : function(name, obj) {
            if($.inArray(name, this.__reserved) > -1) {
                $.error('Error: Unable to use ' + name + ' as a name for a widget!');
            } else {
                switch ($.type(obj)) {
                    case 'object':
                    case 'function':
                        // valid type
                        break;
                    case 'null':
                    default:
                        console.warn('Warning: Cannot set unknown or null widget with name "' + name + '".');
                        break;
                }
            }
            return this[name] = obj;
        },
        // Getter
        get : function(name) {
            if(this[name]) {
                return this[name];
            }
            return null;
        }
    };

    // Protoypal inheritance
    Construct(AppWidget, object, false);

    // Factory pattern to avoid the 'new' keyword on instantiation
    window.Widget = function(selector, name, opts) {
        // Calling logic
        if($.type(selector) === 'object') {
            var opts = selector;

            // Add template
            if(opts.tmpl && opts.parent) {
                opts.parent = $.type(opts.parent) === 'string' ? App.Dom.get(opts.parent) : opts.parent;
                opts.parent.append(opts.tmpl);
            }

            // Map object parameters to use them for the widget initialization
            selector = opts.selector = opts.selector || '#' + opts.id;
            name = opts.name;
            opts = opts.setup
        }

        // Initialize widget
        return new AppWidget(selector, name, opts);
    };
})(window);
