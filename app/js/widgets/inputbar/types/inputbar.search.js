(function(App, undefined) {
    var inputbar = App ? App.getWidget('inputbar') : null;
    if(inputbar === null) {
        // App and the inputbar are essential!
        return false;
    }

    var type = {
        id : 'Search',
        key : '/',
        icon : 'osi-grey/search.gif',
        hint : 'Enter text to search for...',
        desc : 'Search...',
        submit : function(value, type) {
            log(value);
        }
    };

    inputbar.addType(type);

})(window.App || null);
