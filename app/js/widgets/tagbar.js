/**
 * Control module
 */
(function($) {
    /**
     * Widget
     */
    var widget = {
        /**
         * Namespace of the Widget
         */
        ns : 'ui',

        /**
         * Name of the Widget
         */
        name : 'tagbar',

        // default options
        options : {
            editor : null
        },

        // Templates
        _templates : {
            tagbarTemplate : '<li id="tag${id}" class="tag">' + //
            '<span class="tag_name">${name}</span>' + //
            '<span class="tag_remove">x</span>' + //
            '</li>'
        },

        // Element store
        _dom : {},

        // Create widget
        _create : function() {
            if(this._trigger('create', null, this) !== false) {
                var self = this, dom = {
                    self : self.element,
                    parent : self.element.parent(),
                    tags : $('<ul class="tags"/>'),
                    taginsert : $('<input type="text" autocomplete="off" maxlength="32" class="taginsert"/>'),
                };

                // Compile markups as named templates
                $.each(this._templates, function(name, tmpl) {
                    $.template(name, tmpl);
                });
                //
                // Build dom...
                //
                // Speed up dom manipulation
                dom.self.detach();

                dom.self.append(dom.tags, dom.taginsert);

                // At last append the root element back to its parent
                dom.self.appendTo(dom.parent);

                $.extend(this._dom, dom);
                this.bindEvents();
            }
        },
        // Initialize widget
        _init : function() {
            if(this._trigger('init', null, this) !== false) {
                this._trigger('ready', null, this);
            }
        },
        bindEvents : function() {
            var self = this;

            // Tagbar
            this._dom.self.click(function(event) {
                self._dom.taginsert.focus();
            });
            // Bind tag events
            this._dom.tags.delegate('li', 'click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                var $this = $(this);

                if($(event.target).hasClass('tag_remove')) {
                    // Get current note
                    var note = self.editor().getNote();

                    // Get selected tag
                    var tag = $this.data('tag');

                    var tagAttr = {
                        tagid : tag.id,
                        targetid : note.id,
                        target : 'notes'
                    };

                    // Delete tag from the note tags
                    for(var i in note.tags) {
                        if(tag.id === note.tags[i].id) {
                            note.tags.splice(i, 1);
                            break;
                        }
                    }

                    $this.hide();

                    function removeDone(data) {
                        if(data && data.error) {
                            $this.show();
                        } else {
                            $this.remove();
                        }
                        self._dom.taginsert.focus();
                    }


                    App.Tags.remove(tagAttr, removeDone);

                } else {
                    $(this).toggleClass('selected');
                }
            }).delegate('li', 'mouseenter', function(event) {
                $(this).stop().animate({
                    paddingRight : 15
                }, 'easeInOutExpo');
            }).delegate('li', 'mouseleave', function(event) {
                $(this).stop().animate({
                    paddingRight : 5
                }, 'easeInOutExpo');
            }).delegate('.tag_remove', 'mouseenter', function() {
                $(this).addClass('hover');
            }).delegate('.tag_remove', 'mouseleave', function() {
                $(this).removeClass('hover');
            });
            this._dom.taginsert.autocomplete({
                appendTo : self._dom.self,
                // Get list of all available tags
                source : function(request, response) {
                    var editor, note, tags;
                    editor = self.editor();
                    note = editor.getNote();
                    tags = App.Tags.getAll(true/*get only their names*/);

                    // Prevent tags that are already assigned to the note
                    for(var i = tags.length - 1; i >= 0; i--) {
                        if(editor.noteHasTag(note, tags[i])) {
                            tags.splice(i, 1);
                        }
                    }

                    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), 'i');
                    response($.map(tags, function(tag) {
                        if(tag && !request.term || matcher.test(tag)) {
                            return {
                                label : tag.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(request.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), '<span class="matched">$1</span>'),
                                value : tag
                            };
                        }
                    }));
                }
            }).data('autocomplete')._renderItem = function(ul, item) {
                return $('<li/>').data('item.autocomplete', item).append('<a>' + item.label + '</a>').appendTo(ul);
            };

            this._dom.taginsert.keydown(function(event) {
                if(event.keyCode == $.ui.keyCode.ENTER) {
                    var $this = $(this), newTag = $this.val();
                    event.preventDefault();

                    // Get current note
                    var editor = self.editor(), note = editor.getNote();

                    // Prevent adding the same tag twice to a target! -> check against the tags of the note
                    if(!newTag || editor.noteHasTag(note, newTag)) {
                        // No tag entered or tag already assigned
                        return;
                    }

                    // Tags are always lowercased
                    newTag = newTag.toLowerCase();

                    var tagAttr = {
                        name : newTag,
                        targetid : note.id,
                        target : 'notes'
                    };

                    // Render new tag
                    var tagRendered = self.renderTag({
                        name : newTag
                    });
                    var $tag = $(tagRendered).addClass('saving').appendTo(self._dom.tags);

                    $this.val('');

                    // Close autocomplete
                    self._dom.taginsert.autocomplete('close');

                    // Saving tag...
                    function saveDone(data) {
                        if(data && !data.error) {
                            // Set tag id and mark tag as saved
                            var tag = {
                                id : data.id,
                                name : newTag
                            };

                            // Rerender tag with its values so it has its new id
                            $tag.replaceWith(self.renderTag(tag));

                            // Add tag to the current note
                            note.tags.push(tag);

                            // Update note reference
                            self.editor().updateNote(note);
                            // App.log(App.getWidget('inputbar').getType('note').getEditor().getNote(note.id).tags);
                        } else {
                            // Error!
                            $tag.remove();
                            $this.val(newTag);
                        }
                    }


                    App.Tags.save(tagAttr, saveDone);
                }
            });
        },
        editor : function() {
            return this.options.editor;
        },
        emptyTags : function() {
            this._dom.tags.empty();
            return this;
        },
        setTags : function(note) {
            var self = this, tags = note.tags;
            this.emptyTags();

            if(tags && tags.length) {
                for(var i = tags.length - 1; i >= 0; i--) {
                    var tag = this.renderTag(tags[i]);
                    this._dom.tags.append(tag);
                }
            }
        },
        renderTag : function(tag) {
            var tagEl = $.tmpl('tagbarTemplate', tag);
            return $(tagEl).data('tag', tag);
        },
    };

    // Create widget under the namespace with its name and let it inherit from the base widget
    $.widget(widget.ns + '.' + widget.name, $.ui.baseWidget, widget);

})(jQuery);
