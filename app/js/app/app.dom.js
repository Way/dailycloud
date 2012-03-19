/**
 * App Dom module
 */
App.Dom = (function() {

    // Private
    function Dom() {
        this.tree = {};
    }

    // Public
    var methods = {
        win : (function(win) {
            return $(win);
        })(window),
        set : function(name, el) {
            if($.type(el) !== 'object' || $.type(el.length) !== 'number') {
                $.error('Error: Cannot set the invalid element with name "' + name + '" into the Dom.', el);
            }
            return this.tree[name] = el;
        },
        get : function(name, refresh) {
            if(!refresh && this.tree.hasOwnProperty(name)) {
                // Get dom element straight out of the pool
                return this.tree[name];
            }
            // Fetch the element again
            return this.set(name, $(name));
        },
        getNew : function(name) {
            return this.get(name, true);
        },
        add : function(name, $el, to, callback) {
            var newEl;
            if( newEl = this.set(name, $el).appendTo(this.get(to))) {
                if(callback) {
                    callback.call(this, newEl);
                }
            }
            return newEl;
        },
        remove : function(name, detach) {
            if(detach) {
                this.get(name).detach();
            } else {
                this.get(name).remove();
            }
        }
    };

    // Create new App
    return new Construct(Dom, methods);

})();
