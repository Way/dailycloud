/**
 * App ajax function
 */
App.ajax = (function() {
    // Private
    var ajax = {
        settings : {
            type : 'POST',
            dataType : 'json'
        },
        done : function(data) {
            if(data && data.error) {
                App.error(data.message);
            }
        },
        fail : function() {
            var args = Array.prototype.slice.call(arguments);
            App.error.apply(args);
        },
        always : function() {
            App.loading(false);
        }
    };

    return function(request) {
        // Merge default with specified request settings
        var opts = $.extend({}, ajax.settings, request);

        App.loading(true);

        return $.ajax(opts)
        // Success
        .done($.proxy(ajax.done, App))
        // Error
        .fail($.proxy(ajax.fail, App))
        // Complete
        .always($.proxy(ajax.always, App));
    };
})();
