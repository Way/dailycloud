(function(App, undefined) {
    var inputbar = App ? App.getWidget('inputbar') : null;
    if(inputbar === null) {
        // App and the inputbar are essential!
        return false;
    }

    var type = {
        id : 'Note',
        key : 'n:',
        icon : 'osi-grey/edit.gif',
        hint : 'Search and Create Notes...',
        desc : 'Manage your Notes',
        options : {
            editor : {
                id : 'noteType',
                name : 'editor',
                tmpl : '<div id="noteType"/>',
                parent : '#widgets',
                setup : {}
            }
        },
        editor : null,
        load : function(type) {
            // Load editor
            if(type.editor === null) {
                type.editor = Widget(type.options.editor);
            }
            type.getEditor().load();
        },
        unload : function(type) {
            // Cancel parsing
            $.doTimeout(type.id + 'parse');

            if(type.editor) {
                type.getEditor().unload();
            }
        },
        submit : function(value, type) {
            // Split value to handle first token as command
            var values = value.split(/ \s*/);
            var cmd = values.shift();

            // Cancel delayed parse event
            $.doTimeout(type.id + 'parse');

            switch(cmd) {
                case 'new':
                case 'create':
                    if(type.editor) {
                        var content;
                        if(values.length) {
                            content = values.join(' ');
                        }
                        // Create new note
                        type.getEditor().createNote(content, function(data, note) {
                            // Need a callback?
                        });
                        // clear the input
                        return true;
                    }
                    break;
                case 'open':
                case 'show':
                    if(type.editor) {
                        App.log(cmd, values);
                        App.log('--> Search for notes with the given value "' + values + '" and open the first of the result set');
                    }
                    // clear the input
                    return true;
                    break;
                default:
                    break;
            }
            // prevent clearing the input
            return false;
        },
        parse : function(value, type) {
            if(!value) {
                // No value -> Load all notes that are basically loaded via startup
                type.getEditor().renderNotes();
                return;
            }

            $.doTimeout(type.id + 'parse', 250, function() {
                // Live search for loaded notes
                if(value.match(/^#(.*)$/ig)) {
                    // Leading hash "#" to search for tags
                    type.getEditor().searchNotes(value.substring(1), 'tag');
                } else {
                    // Normal text to search for text
                    type.getEditor().searchNotes(value);
                }
            });
        },
        autocomplete : function(request) {
            var tags = App.Tags.getAll(), suggests = [];
            for(var i = 0, len = tags.length; i < len; i++) {
                suggests.push({
                    value : '#' + tags[i].name,
                    desc : 'Tag',
                    category : 'Tags'
                });
            }
            return suggests;
        },
        isActive : function(type) {
            return type.loaded;
        },
        getEditor : function() {
            if(this.editor !== null) {
                return this.editor.editor;
            }
            return null;
        }
    };

    inputbar.addType(type);

})(window.App || null);
