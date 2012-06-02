/**
 * Create global scroped Application with the defined name 'App'.
 * All application relevant and specified functions should be added
 * under that scope.
 */
(function(window, undefined) {

    // Private
    function Application(opts) {
        // Essential global unique identifier
        this.guid = this.defaults.name + +new Date();

        // Public
        this.data = {};
        this.state = {};
        this.widgets = {};

        // Constructor
        this.init();
    }

    // Application prototype object
    var options = {}, object = {
        defaults : {
            name : 'App',
            expose : true
        },
        options : function(key, val) {
            var o;
            if(options.hasOwnProperty(this.guid)) {
                o = options[this.guid];
            } else {
                throw new Error("Options have not yet been instantiated!")
            }

            if(val !== undefined) {
                // Set options
                return o[key] = val;
            }
            // Get options
            if(o.hasOwnProperty(key)) {
                return o[key];
            }
            return undefined;
        },
        init : function() {
            this.debug('init');
            
            // Setup options
            options[this.guid] = clone(this.defaults);

            // Expose this instance by its name to the global window object
            if(this.options('expose') === true) {
                this.expose(this.options('name'));
            }
        },
        run : function() {
            this.debug('run');

            // Load tags
            this.Tags = new Tags();
            this.Tags.load();
            
            // Load Controller
            App.Controller.init();
        },
        addData : function(data) {
            if(data && data.id) {
                this.data[data.id] = data;
            }
        },
        getData : function(id, fullData) {
            if(this.data.hasOwnProperty(id)) {
                if(!!fullData) {
                    return this.data[id];
                }
                return this.data[id].data;
            }
            return null;
        },
        addWidget : function(id, widget) {
            this.widgets[id] = widget;
        },
        getWidget : function(id) {
            if(this.widgets.hasOwnProperty(id)) {
                return this.widgets[id];
            }
            return null;
        },
        loading : function(start) {
            if(this.state.loading === undefined) {
                this.state.loading = 0;
            }

            this.state.loading = start ? ++this.state.loading : (--this.state.loading < 0 ? 0 : this.state.loading);

            if(this.state.loading > 0) {
                App.Dom.get('#loading').show();
            } else {
                App.Dom.get('#loading').hide();
            }
        },
        is : function(prop, obj) {
            if(obj === undefined || obj === null) {
                obj = this.state;
            }
            return obj.hasOwnProperty(prop) && obj[prop];
        },
        log : debug.log,
        debug : debug.debug,
        error : debug.error
    };

    // Create new App
    new Construct(Application, object);

})(window);
