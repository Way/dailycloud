/**
 * Tags
 */
(function(window, undefined) {

    function Tags() {
        this.tags = [];
        this.init();
    }

    // Tag prototype object
    var object = {
        request : {
            load : {
                url : 'tag/get',
                type : 'GET',
            },
            save : {
                url : 'tag/add',
                data : null,
            },
            remove : {
                url : 'tag/remove',
                data : null
            }
        },
        init : function() {
            // Expose this instance by its name to the global window object
            this.expose('Tags', true);
        },
        load : function() {
            App.ajax(this.request.load).success($.proxy(this.setAll, this));
        },
        save : function(tag, callback) {
            var self = this, request = this.request.save;
            request.data = tag;
            request.success = callback;

            App.ajax(request).success(function(data) {
                // Add new tag to the client tag list
                if(data) {
                    if(data.error) {
                        App.error(data.error);
                    } else {
                        self.add({
                            id : data.id,
                            name : data.name
                        });
                    }
                }
            });
        },
        /**
         * Update (or add) tag.
         */
        update : function(tag, add) {
            var index = this.index(tag.id);

            // Search for tag (by id)
            if(index > -1) {
                // Update tag
                this.tags[index] = tag;
            } else if(!!add) {
                // Create new tag
                this.add(tag);
            }
        },
        /**
         * Remove a tag from a target
         *
         * NOTE: Tags will never be deleted theirselfs. Only their association to a target will be removed.
         */
        remove : function(tag, callback) {
            var request = this.request.remove;
            request.data = tag;
            request.success = callback;
            App.ajax(request);
        },
        /**
         * Get Tag by its id
         */
        get : function(id) {
            var map = $.map(this.tags, function(t, i) {
                return t.id == id ? t : null;
            });
            return map.shift();
        },
        /**
         * Get Tag index by its id
         */
        index : function(tagOrId) {
            if( typeof tagOrId === 'object') {
                // Search tag by itselfs
                return this.tags.indexOf(tagOrId);
            }

            // Search tag by its id
            for(var i = 0, len = this.tags.length; i < len; i++) {
                if(this.tags[i].id === id) {
                    return i;
                }
            }

            // tag not found!
            return -1;
        },
        /**
         * Get all tags either as array containing the tags or just the their names.
         */
        getAll : function(namesOnly) {
            if(!!namesOnly) {
                var tags = [];
                for(var i = 0, len = this.tags.length; i < len; i++) {
                    tags.push(this.tags[i].name);
                }
                return tags;
            }
            return this.tags;
        },
        /**
         * Set all tags.
         * This will also be used as callback for the load() method.
         */
        setAll : function(data) {
            if (data && data.tags) {
                this.tags = data.tags;
            }
        },
        /**
         * Add Tag to taglist.
         */
        add : function(tag) {
            if(!this.get(tag.id)) {
                // Tag does not already exist
                this.tags.push(tag);
            }
        }
    };

    Construct(Tags, object);

})(window);
