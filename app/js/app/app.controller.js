/**
 * App Controller module
 */
App.Controller = (function() {

    // Private
    function Controller() {
        this.control = null;
    }

    // Viewport object
    var object = {
        name : 'Controller',
        init : function() {
            App.log('init', this);

            var self = this;

            //
            // Control widget
            //
            this.control = Widget('#control', 'control').control;
            if(this.control) {
                // Bind ready event to the inputbar
                App.Dom.get('#inputbar').bind('inputbarready', function(event, data) {
                    self.control.show();
                });
                //
                // Inputbar widget
                //
                var inputbar = Widget('#inputbar', 'inputbar', {
                    // options
                }).inputbar;

                // NOTE: If you bind an event directly to widget instead of its element
                // you dont have to use its namespace as eventprefix.
                self.control.bind('visible', function(event, data) {
                    inputbar.focus();
                });
                // Add widgets to the App
                App.addWidget('control', self.control);
                App.addWidget('inputbar', inputbar);
            }
        }
    };

    // Create new Viewport
    return new Construct(Controller, object);

})();
