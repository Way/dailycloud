(function(App, undefined) {
    var inputbar = App ? App.getWidget('inputbar') : null;
    if(inputbar === null) {
        // App and the inputbar are essential!
        return false;
    }

    var type = {
        id : 'Bookmark',
        key : 'b:',
        icon : 'osi-grey/bookmark.gif',
        hint : 'Add or Find Bookmarks...',
        desc : 'Manage your Bookmarks',
        options : {
            gallery : {
                id : 'bookmarkGallery',
                name : 'bookmarkGallery',
                tmpl : '<div id="bookmarkGallery"/>',
                parent : '#widgets',
                setup : {}
            }
        },
        gallery : null,
        load : function(type) {
            // Load Bookmark gallery
            if(type.gallery === null) {
                // Create new bookmark gallery widget
                type.gallery = Widget(type.options.gallery);
            }
            type.gallery.bookmarkGallery.load();
        },
        unload : function(type) {
            // Cancel parsing
            $.doTimeout(type.id + 'parse');

            // Unload Bookmark gallery
            if(type.gallery) {
                type.gallery.bookmarkGallery.unload();
            }
        },
        parse : function(value, type) {
            // App.log('parse', value, type);
            if(value && type.isUrlValid(value)) {
                $.doTimeout(type.id + 'parse', 250, function() {
                    App.log('Search bookmark with url: ' + value);
                    // TODO
                });
            }
        },
        validate : function(value, type) {
            //App.log('validate', value);
            return true;
        },
        submit : function(value, type) {
            var self = this, gallery = type.gallery.bookmarkGallery;

            // Split value to handle first token as command
            var values = value.split(/ \s*/);
            var cmd = values.shift();

            switch(cmd) {
                case 'show':
                    // Is any bookmark selected?
                    var selected = gallery.getSelectedBookmarks();
                    if(selected.length) {
                        for(var i = 0, len = selected.length; i < len; i++) {
                            App.log(selected[i]);
                        }
                    }
                    break;
                case 'webshot':
                case 'delete':
                    // Is any bookmark selected?
                    var selected = gallery.getSelectedBookmarks();
                    if(selected.length) {
                        for(var i = 0, len = selected.length; i < len; i++) {
                            var bm = selected[i], request = {
                                type : 'POST',
                                url : 'bookmark/' + cmd,
                                data : {
                                    id : bm.id,
                                    url : bm.url
                                },
                                success : function(data) {
                                    switch (cmd) {
                                        case 'delete':
                                            var el = gallery.getRenderedBookmarkById(bm.id);
                                            if(el !== null) {
                                                el.fadeOut(200, function() {
                                                    $(this).remove();
                                                });
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            };
                            App.ajax(request);
                        }
                    }
                    break;
                default:
                    value = type.clean(value);
                    var url = value;
                    if(type.isUrlValid(url)) {
                        var request = {
                            type : 'POST',
                            url : 'bookmark/create/',
                            data : {
                                url : url
                            },
                            dataType : 'json',
                            success : function(data) {
                                if(data && !data.error) {
                                    // Bookmark successfully created
                                    if(data.created) {
                                        // App.log(data, type);
                                        gallery.addBookmark(data.bookmark, null, function(el) {
                                            el.find('a.url').shuffleLetters();
                                        });
                                    } else {
                                        App.log(data.message);
                                    }
                                }
                            }
                        };
                        App.ajax(request);
                    } else {
                        App.error('Invalid url: "' + url + '"');
                        // prevent clearing input
                        return false;
                    }
                    break;
            }
        },
        clean : function(str) {
            return str.replace(/^\s+|\s+$/g, '');
        },
        isUrlValid : function(url) {
            return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
        }
    };

    inputbar.addType(type);

})(window.App || null);
