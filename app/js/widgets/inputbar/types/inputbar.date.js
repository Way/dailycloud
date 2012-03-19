(function(App, undefined) {
    var inputbar = App ? App.getWidget('inputbar') : null;
    if(inputbar === null) {
        // App and the inputbar are essential!
        return false;
    }

    var type = {
        id : 'Date',
        key : 'd:',
        icon : 'osi-grey/calendar.gif',
        hint : 'Add or Find Dates...',
        desc : 'Manage your Dates',
        submit : function(value, type) {
            var date = Date.parse(value);
            //var date = widget.data('date');
            if(date !== null) {
                this.data('date', date);
                log(this.getType().id, 'submit', value, '=>', date);
            }
        },
        clear : function() {
            this.data(null, 'date');
            //datepicker.input.datepicker('setDate', Date.today());
            //datepicker.input.datepicker('hide');
            this.focus();
        },
        parse : function(value, type) {
            if(value && value.length > 0) {
                var date = Date.parse(value);
                if(date !== null) {
                    // Store valid date
                    this.data('date', date);
                    //datepicker.input.datepicker('setDate', date);
                    //datepicker.input.datepicker('show');
                    this.focus();
                }
            }
        }
    };

    inputbar.addType(type);

})(window.App || null);
