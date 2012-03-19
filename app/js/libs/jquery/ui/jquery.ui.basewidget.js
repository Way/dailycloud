;(function($, undefined) {

    var aps = Array.prototype.slice;

    $.widget('ui.baseWidget', {
        bind : function(ev, fn) {
            return this.element.bind(this.widgetName + ev, fn);
        },
        unbind : function(ev) {
            return this.element.unbind(this.widgetName + ev);
        },
        option : function(key, val) {
            if(val !== undefined) {
                // Set
                return (this.options[key] = val);
            }
            // Get
            if(this.has(this.options, key)) {
                return this.options[key];
            }
            return null;
        },
        data : function() {
            var args = aps.call(arguments);
            // handle removeData call by passing null as first argument
            // and the key of the data to remove as second argument.
            if(args.length > 1 && $.type(args[0]) === null) {
                return this.element.removeData.apply(this.element, args.slice(1));
            }
            return this.element.data.apply(this.element, args);
        },
        store : function(cmd, key, val) {
            switch(cmd) {
                case 'set':
                    try {
                        return $.jStorage.set(this.widgetName + key, val);
                    } catch(e) {
                    };
                    break;
                case 'get':
                    try {
                        return $.jStorage.get(this.widgetName + key, val);
                    } catch(e) {
                    };
                    break;
                default:
                    break;
            }
        },
        is : function() {
            var args = aps.call(arguments);
            return this.element.is.apply(this.element, args);
        },
        has : function(haystack, needle) {
            for(var key in haystack) {
                if(haystack.hasOwnProperty(key)) {
                    if(key === needle) {
                        return true;
                    }
                }
            }
            return false;
        },
        ajax : function(request) {
            return App.ajax(request);
        },
        loadScript : function(url, callback, fallback, cache) {
            callback = callback || $.noop;
            fallback = fallback || $.noop;
            cache = !!cache;

            return $.ajax({
                url : url,
                dataType : 'script',
                cache : cache,
                success : callback,
                error : fallback
            });
        }
    });

})(jQuery);
