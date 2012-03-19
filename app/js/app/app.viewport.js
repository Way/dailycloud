/**
 * App Viewport module
 */
App.Viewport = (function() {

    function ResizeListener(win) {
        this.win = (win && win.length) ? win : $(window);
        this.listener = [];
    }


    ResizeListener.prototype = {
        add : function(fn) {
            this.listener.push(fn);
        },
        remove : function(fn) {
            var index = this.listener.indexOf(fn);
            if(index != -1) {
                this.listener.splice(index, 1);
            }
        },
        resize : function(event) {
            var self = this;
            $.doTimeout(event.type, 100, function() {
                var height = self.win.height(), width = self.win.width();
                for(var i = self.listener.length - 1; i >= 0; i--) {
                    self.listener[i].call(self, event, height, width);
                };
            });
        }
    }

    // Private
    function Viewport() {
        // Set window reference
        this.win = App.Dom.win;

        // Initialize listener
        this.resizeListener = new ResizeListener(this.win);

        // Bind global resize event
        this.win.bind('resize', $.proxy(this.resizeListener.resize, this.resizeListener));
    }

    // Viewport object
    var object = {
        height : function() {
            return this.win.height();
        },
        width : function() {
            return this.win.width();
        },
        scrollTop : function() {
            return this.win.scrollTop();
        },
        scrollLeft : function() {
            return this.win.scrollLeft();
        },
        addResizeListener : function(fn) {
            this.resizeListener.add(fn);
        },
        removeResizeListener : function(fn) {
            this.resizeListener.remove(fn);
        }
    };

    // Create new Viewport
    return new Construct(Viewport, object);

})();
