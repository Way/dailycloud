(function(App, undefined) {
    var inputbar = App ? App.getWidget('inputbar') : null;
    if(inputbar === null) {
        // App and the inputbar are essential!
        return false;
    }

    var type = {
        id : 'Debug',
        key : 'debug:',
        icon : 'osi-grey/configuration02.gif',
        hint : 'Debugging...',
        desc : 'For debugging purposes only!',
        load : function(type) {
            //return false;
        },
        unload : function(type) {
            //return false;
        },
        submit : function(value, type) {
            console.log(type, 'submit', value, this);
        },
        trigger : {
            keydown : function(event, widget) {
                console.log('debugType.trigger', event, widget, this);
            },
            keyup : function(event, widget) {
                console.log('debugType.trigger', event, widget, this);
            },
            focus : function(event, widget) {
                console.log('debugType.trigger', event, widget, this);
            },
            blur : function(event, widget) {
                console.log('debugType.trigger', event, widget, this);
            },
            change : function(event, widget) {
                console.log('debugType.trigger', event, widget, this);
            }
        },
        autocomplete : function(request) {
            return [{
                value : request.term + ' tested!',
                desc : 'Test',
                category : 'Suggest'
            }];
        }
    };

    inputbar.addType(type);

})(window.App || null);
