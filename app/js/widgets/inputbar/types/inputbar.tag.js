(function(App, undefined) {
    var inputbar = App ? App.getWidget('inputbar') : null;
    if(inputbar === null) {
        // App and the inputbar are essential!
        return false;
    }

    var type = {
        id : 'tag',
        key : 't:',
        icon : 'osi-grey/tag.gif',
        hint : '',
        desc : 'Manage your Tags',
        submit : function(value, type) {
            console.log(type.id, 'submit', value, this);
        },
        trigger : {}
    };

    inputbar.addType(type);

})(window.App || null);
