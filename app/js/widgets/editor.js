/**
 * Control module
 */
(function($) {
    /**
     * Properties
     */
    //var lastPos = null, lastQuery = null, marked = [];

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
        name : 'editor',

        // default options
        options : {
            autosave : 5000, // Set 0 to disable
        },

        // Templates
        _templates : {
            noteTemplate : '<li id="note${id}" class="note">${plaintext}</li>',
            noteinfoTemplate : '<ul>' + //
            '<li><span>Created</span> <time datetime="${createdISO}">${created}</time></li>' + //
            '<li><span>Updated</span> <time datetime="${updatedISO}">${updated}</time></li>' + //
            '<li><span>Version</span> ${version}</li>' + //
            '</ul>',
            editbarButtonTemplate : '<li class="${cls}"><a href="${href}">${text}</a></li>'
        },

        // Element store
        _dom : {},

        // ContentEditable instance
        _content : null,

        // Tagbar instance
        _tagbar : null,

        // Loaded notes
        _notes : null,
        _notesScroller : null,

        // Loading counter
        _loadingCounter : 0,

        // Create widget
        _create : function() {
            if(this._trigger('create', null, this) !== false) {
                var self = this, dom = {
                    self : self.element,
                    parent : self.element.parent(),
                    sidebar : $('<div class="sidebar"/>'),
                    notes : $('<ul class="notes cf"/>'),
                    loader : $('<div class="loader"/>'),
                    editscroll : $('<div class="editscroll"/>'),
                    editheader : $('<div class="editheader"/>'),
                    editbar : $('<div class="editbar"/>'),
                    tagbar : $('<div id="tagbar" class="tagbar cf"/>'),
                    editor : $('<div class="editor" contentEditable="false"/>'),
                    noteinfo : $('<div class="noteinfo"/>')
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

                // Self with Sidebar with Notes
                dom.self.append(dom.sidebar.append(dom.loader, dom.notes));

                // Editheader with Noteinfo, Editbar and Tagbar
                dom.editheader.append(dom.noteinfo, dom.editbar, dom.tagbar);

                // Self with Editscroll, Editheader and Editor
                dom.self.append(dom.editscroll.append(dom.editheader, dom.editor));

                // Init contentEditable
                this._content = dom.editor.contentEditable().data('contentEditable');

                //
                // Editbar - Buttons
                //
                var buttons = {
                    'edit' : {
                        href : '#edit',
                        cls : 'first-child',
                        text : 'Edit'
                    },
                    'save' : {
                        href : '#save',
                        cls : 'first-child isEditing',
                        text : 'Save'
                    },
                    'cancel' : {
                        href : '#cancel',
                        cls : 'isEditing',
                        text : 'Cancel'
                    },
                    'delete' : {
                        href : '#delete',
                        cls : 'always',
                        text : 'Delete'
                    },
                    'close' : {
                        href : '#close',
                        cls : 'always',
                        text : 'Close'
                    }
                };

                var buttonlist = $('<ul/>').addClass('dropbutton');
                $.each(buttons, function(name, button) {
                    buttonlist.append($.tmpl('editbarButtonTemplate', button));
                });

                dom.editbar.append(buttonlist);
                dom.editbar.data('buttons', dom.editbar.find('li'));

                dom.editheader.hide();
                dom.editor.hide();

                // At last append the root element back to its parent
                dom.self.appendTo(dom.parent);

                // Update dom reference map
                $.extend(this._dom, dom);

                this.initTagbar();
                this.bindEvents();
                this.loadNotes();
            }
        },
        // Initialize widget
        _init : function() {
            if(this._trigger('init', null, this) !== false) {
                this._trigger('ready', null, this);
            }
        },
        load : function() {
            if(this._trigger('load', null, this) !== false) {
                this._dom.self.appendTo(this._dom.parent);
                this.activate(true);

                this._trigger('loaded', null, this);
            }
        },
        unload : function() {
            if(this._trigger('unload', null, this) !== false) {
                this._dom.self.detach();
                this.activate(false);
                this.renderNotes();

                this._trigger('unloaded', null, this);
            }
        },
        bindEvents : function() {
            var self = this, editbar = this._dom.editbar, dropbutton = editbar.find('.dropbutton');

            // Editor events
            this._dom.editor.bind('parse change save', function(event, content, callback) {
                // Handle events triggered by the contentEditable editor
                if(self[event.type]) {
                    self[event.type].call(self, content, callback);
                }
            });
            // Button Click
            editbar.data('buttons').hover(function(event) {
                var $this = $(this);
                $.doTimeout('editbarButtonHover', 200, function() {
                    // Show menu
                    dropbutton.addClass('hover');
                });
            }, function(event) {
                var $this = $(this);
                $.doTimeout('editbarButtonHover', 400, function() {
                    // Hide menu
                    dropbutton.removeClass('hover');
                });
            }).click(function(event) {
                event.preventDefault();
                var cmd = $(this).find('a').attr('href');
                switch(cmd) {
                    case '#edit':
                        self.edit(true);
                        break;
                    case '#save':
                        self.save();
                        break;
                    case '#cancel':
                        self.cancel();
                        break;
                    case '#close':
                        self.close();
                        break;
                    case '#delete':
                        self.deleteNote();
                        break;
                    default:
                        break;
                }
            }).bind('editable', function(event, isEditing) {
                var $this = $(event.target);
                if($this.hasClass('always')) {
                    return;
                }

                var hasEditing = $this.hasClass('isEditing');
                if((isEditing && hasEditing) || (!isEditing && !hasEditing)) {
                    $this.show();
                } else {
                    $this.hide();
                }
            });
            // Global event -> handleEvent to take of the 'active'-state of the editor
            var globalKeys = {
                'ctrl+s' : function(event) {
                    event.preventDefault();
                    self.save();
                },
                'ctrl+e' : function(event) {
                    event.preventDefault();
                    self.edit();
                },
                'esc' : function(event) {
                    if(self.isEditModeOn()) {
                        self.cancel();
                    }
                }
            };
            $.each(globalKeys, function(key, fn) {
                App.Dom.win.bind('keydown', key, self.handleEvent(fn));
            });
            // Bind global resize event
            App.Viewport.addResizeListener($.proxy(this.handleResize, this));
        },
        handleEvent : function(fn) {
            return $.proxy(function() {
                if(this.isActive()) {
                    var args = Array.prototype.slice.call(arguments);
                    return fn.apply(this, args);
                }
            }, this);
        },
        handleResize : function(event, height, width) {
            //App.log(event, width, height);
        },
        initTagbar : function() {
            var self = this, tagbarWidget = Widget({
                id : 'tagbar',
                name : 'tagbar',
                setup : {
                    editor : self
                }
            });
            this._tagbar = tagbarWidget.tagbar;
        },
        initNotesScroller : function() {
            var sidebar = this._dom.sidebar;
            sidebar.jScrollPane({
                contentWidth : 180 // important to avoid horizontal scrollbar
            });

            // the extension functions and options
            var extensionPlugin = {

                extPluginOpts : {
                    // speed for the fadeOut animation
                    mouseLeaveFadeSpeed : 500,

                    // scrollbar fades out after
                    // hovertimeout_t milliseconds
                    hovertimeout_t : 1000,

                    // if set to false, the scrollbar will
                    // be shown on mouseenter and hidden on
                    // mouseleave
                    // if set to true, the same will happen,
                    // but the scrollbar will be also hidden
                    // on mouseenter after "hovertimeout_t" ms
                    // also, it will be shown when we start to
                    // scroll and hidden when stopping
                    useTimeout : false,

                    // the extension only applies for devices
                    // with width > deviceWidth
                    deviceWidth : 980
                },
                hovertimeout : null,
                // timeout to hide the scrollbar

                isScrollbarHover : false,
                // true if the mouse is over the scrollbar

                elementtimeout : null,
                // avoids showing the scrollbar when moving
                // from inside the element to outside, passing
                // over the scrollbar

                isScrolling : false,
                // true if scrolling

                addHoverFunc : function() {

                    // run only if the window has a width bigger than deviceWidth
                    if(App.Viewport.width() <= this.extPluginOpts.deviceWidth) {
                        return false;
                    }

                    var instance = this;

                    // functions to show / hide the scrollbar
                    $.fn.jspmouseenter = $.fn.show;
                    $.fn.jspmouseleave = $.fn.fadeOut;

                    // hide the jScrollPane vertical bar
                    var $vBar = this.getContentPane().siblings('.jspVerticalBar').hide();

                    /*
                     * mouseenter / mouseleave events on the main element
                     * also scrollstart / scrollstop
                     * @James Padolsey : http://james.padolsey.com/javascript/special-scroll-events-for-jquery/
                     */
                    sidebar.bind('mouseenter.jsp', function() {

                        // show the scrollbar
                        $vBar.stop(true, true).jspmouseenter();

                        if(!instance.extPluginOpts.useTimeout)
                            return false;

                        // hide the scrollbar after hovertimeout_t ms
                        clearTimeout(instance.hovertimeout);
                        instance.hovertimeout = setTimeout(function() {
                            // if scrolling at the moment don't hide it
                            if(!instance.isScrolling)
                                $vBar.stop(true, true).jspmouseleave(instance.extPluginOpts.mouseLeaveFadeSpeed || 0);
                        }, instance.extPluginOpts.hovertimeout_t);

                    }).bind('mouseleave.jsp', function() {

                        // hide the scrollbar
                        if(!instance.extPluginOpts.useTimeout)
                            $vBar.stop(true, true).jspmouseleave(instance.extPluginOpts.mouseLeaveFadeSpeed || 0);
                        else {
                            clearTimeout(instance.elementtimeout);
                            if(!instance.isScrolling)
                                $vBar.stop(true, true).jspmouseleave(instance.extPluginOpts.mouseLeaveFadeSpeed || 0);
                        }

                    });
                    if(this.extPluginOpts.useTimeout) {

                        sidebar.bind('scrollstart.jsp', function() {

                            // when scrolling show the scrollbar
                            clearTimeout(instance.hovertimeout);
                            instance.isScrolling = true;
                            $vBar.stop(true, true).jspmouseenter();

                        }).bind('scrollstop.jsp', function() {

                            // when stop scrolling hide the
                            // scrollbar (if not hovering it at the moment)
                            clearTimeout(instance.hovertimeout);
                            instance.isScrolling = false;
                            instance.hovertimeout = setTimeout(function() {
                                if(!instance.isScrollbarHover)
                                    $vBar.stop(true, true).jspmouseleave(instance.extPluginOpts.mouseLeaveFadeSpeed || 0);
                            }, instance.extPluginOpts.hovertimeout_t);

                        });
                        // wrap the scrollbar
                        // we need this to be able to add
                        // the mouseenter / mouseleave events
                        // to the scrollbar
                        var $vBarWrapper = $('<div/>').css({
                            position : 'absolute',
                            left : $vBar.css('left'),
                            top : $vBar.css('top'),
                            right : $vBar.css('right'),
                            bottom : $vBar.css('bottom'),
                            width : $vBar.width(),
                            height : $vBar.height()
                        }).bind('mouseenter.jsp', function() {

                            clearTimeout(instance.hovertimeout);
                            clearTimeout(instance.elementtimeout);

                            instance.isScrollbarHover = true;

                            // show the scrollbar after 100 ms.
                            // avoids showing the scrollbar when moving
                            // from inside the element to outside,
                            // passing over the scrollbar
                            instance.elementtimeout = setTimeout(function() {
                                $vBar.stop(true, true).jspmouseenter();
                            }, 100);
                        }).bind('mouseleave.jsp', function() {

                            // hide the scrollbar after hovertimeout_t
                            clearTimeout(instance.hovertimeout);
                            instance.isScrollbarHover = false;
                            instance.hovertimeout = setTimeout(function() {
                                // if scrolling at the moment
                                // don't hide it
                                if(!instance.isScrolling)
                                    $vBar.stop(true, true).jspmouseleave(instance.extPluginOpts.mouseLeaveFadeSpeed || 0);
                            }, instance.extPluginOpts.hovertimeout_t);

                        });

                        $vBar.wrap($vBarWrapper);
                    }
                }
            };

            // the jScrollPane instance
            this._notesScroller = this._dom.sidebar.data('jsp');

            // extend the jScollPane by merging
            $.extend(true, this._notesScroller, extensionPlugin);
            this._notesScroller.addHoverFunc();

            // reinitialise scrollpane on window size changes
            App.Viewport.addResizeListener($.proxy(this.updateNotesScroller, this));
        },
        updateNotesScroller : function() {
            if(!this._notesScroller) {
                return;
            }

            this._notesScroller.reinitialise();
            this._notesScroller.addHoverFunc();
        },
        activate : function(active) {
            active = active === undefined ? true : active;
            if(active) {
                this.option('active', true);
            } else {
                this.option('active', false);
            }
            return this;
        },
        show : function() {
            this._dom.self.show();
            return this;
        },
        hide : function() {
            this._dom.self.hide();
            return this;
        },
        focus : function() {
            this._dom.editor.focus();
            return this;
        },
        blur : function() {
            this._dom.editor.blur();
            this.cancel();
            return this;
        },
        edit : function() {
            this._content.edit(true);
            this._dom.editbar.data('buttons').trigger('editable', true);
            this.option('editmode', true);
            this.focus();
            return this;
        },
        change : function(content, callback) {
            var self = this;
            if(this.options.autosave > 0 && this.isSaved() === false) {
                $.doTimeout(widget.name + 'autosave', this.options.autosave, function() {
                    self.save(true);
                });
            }

            // Handle possible callback(s)
            if(callback) {
                callback.call(this, content);
            }

            return this;
        },
        save : function(autosave) {
            var self = this;

            if(!autosave) {
                // Only change editmode of the editor if this is not an autosave
                this._content.save();
                this._dom.editbar.data('buttons').trigger('editable', false);
                this.option('editmode', false);
            }

            if(this.isSaved() || this.isSaving()) {
                // Current content is all up to date
                return false;
            }

            this.isSaving(true);

            var curNote = this.getNote();
            var text = this._content.getValue();

            // Create note to save
            var note = {
                id : curNote.id,
                text : text,
                version : (parseInt(curNote.version, 10) || 0) + 1 // raise version number
            };

            // Start saving...
            var request = {
                url : 'note/save',
                data : note,
                success : function(data) {
                    if(data && !data.error) {
                        var note = data.data;

                        // Update data of the current note reference
                        self.data('currentNote', note);

                        // Update note reference
                        self.updateNote(note);

                        // Update note elements (notelist entry and editheader)
                        self._dom.notes.find('#note' + note.id).trigger('update', note);
                        self.setNoteInfo(note);

                        // Set the latest flag of the editor in order to indicate that the note is up to date
                        self._content.setLatest(true);
                    }
                },
                complete : function(data) {
                    self.isSaving(false);
                }
            };
            this.ajax(request);
            return this;
        },
        cancel : function() {
            this._content.cancel();
            this._dom.editbar.data('buttons').trigger('editable', false);
            this.option('editmode', false);
            return this;
        },
        close : function() {
            if(this.isEditable()) {
                this.cancel();
            }
            this.setNote();
        },
        loading : function(isLoading) {
            if(isLoading) {
                this._loadingCounter++;
            } else {
                this._loadingCounter--;
            }
            if(this._loadingCounter > 0) {
                this._dom.loader.show();
            } else {
                this._dom.loader.hide();
                this._loadingCounter = 0;
            }
        },
        createNote : function(content, callback) {
            var self = this, request = {
                url : 'note/create',
                success : function(data) {
                    if(data && !data.error) {
                        // Add note reference
                        self._notes.push(data);

                        // Render note
                        var note = self.renderNote(data);
                        note.prependTo(self._dom.notes);
                        note.trigger('click');

                        self.updateNotesScroller();

                        // Put the notes content into the editor
                        if(content) {
                            self._content.paste(content);
                        }

                        // Enable edit mode
                        self.edit();

                        // Call optional callback
                        if(callback) {
                            callback.call(self, data, note);
                        }
                    }
                }
            }
            this.ajax(request);
        },
        updateNote : function(note) {
            var self = this;
            for(var i = 0; i < this._notes.length; i++) {
                if(this._notes[i].id === note.id) {
                    this._notes[i] = note;
                    break;
                }
            };
        },
        deleteNote : function() {
            var curNote = this.getNote();
            if(curNote) {
                var self = this, request = {
                    url : 'note/delete',
                    data : {
                        id : curNote.id
                    },
                    success : function(data) {
                        self.close();
                        self.removeNote(curNote);
                        self.updateNotesScroller();
                        self.data(null, 'currentNote');
                    }
                };
                this.ajax(request);
            }
            return this;
        },
        setNote : function(note) {
            if(note) {
                // Detach editor while setting note (for better performance)
                var parent = this._dom.editscroll.parent();
                this._dom.editscroll.detach();

                // Load content of the note into the editor
                this._content.paste(note.text, true);
                this.setNoteInfo(note);
                this.setNoteTags(note);

                // Show editor and its header
                this._dom.editheader.show();
                this._dom.editor.show();

                // Set note to selected
                this._dom.notes.find('.selected').removeClass('selected');
                this._dom.notes.find('#note' + note.id).addClass('selected');

                // Adjust editbar button
                this._dom.editbar.data('buttons').trigger('editable', this.isEditable());

                //Set current note referece
                this.data('currentNote', note);

                this._dom.editscroll.appendTo(parent);
            } else {
                // Called without a note...

                // Hide editor and its header
                this._dom.editheader.hide();
                this._dom.editor.hide().empty();

                // Remove the selected state of the last selected note in the notes list
                this._dom.notes.find('.selected').removeClass('selected');
            }
            return this;
        },
        setNoteInfo : function(note) {
            var created, createdISO, updated, updatedISO;
            if(note.created > 0) {
                created = new Date();
                created.setTime(note.created * 1000);
                createdISO = created.toISO();
            }
            if(note.updated > 0) {
                updated = new Date();
                updated.setTime(note.updated * 1000);
                updatedISO = updated.toISO();
            }

            var info = {
                //user : note.userid,
                created : created || 'n/a',
                createdISO : createdISO || '',
                updated : updated || 'n/a',
                updatedISO : updatedISO || '',
                version : note.version
            };
            this._dom.noteinfo.html($.tmpl('noteinfoTemplate', info)).find('time').timeago();
        },
        setNoteTags : function(note) {
            if(this._tagbar) {
                this._tagbar.setTags(note);
            }
        },
        getNote : function() {
            return this.data('currentNote');
        },
        loadNotes : function() {
            var self = this, request = {
                url : 'note/get',
                type : 'GET',
                success : function(data) {
                    if(data && data.notes) {
                        self._notes = data.notes;
                        self.loading(false);
                        self.renderNotes();
                        self.initNotesScroller();
                    }
                }
            };

            this.loading(true);
            this.ajax(request);

            return this;
        },
        renderNotes : function(notes) {
            var self = this, item, list = self._dom.notes, parent = list.parent();

            if(notes === undefined || notes === null) {
                if(this._notes === null) {
                    // No notes available
                    return;
                }

                // Without specified notes load all notes
                notes = this._notes;
            }

            // Clear list
            list.detach().html('');

            // Render each note
            for(var i = 0, len = notes.length; i < len; i++) {
                self.renderNote(notes[i]).appendTo(list);
            }

            list.appendTo(parent);
        },
        renderNote : function(note) {
            var self = this;

            // Some normalization
            note.text = note.text || '';
            note.plaintext = self.stripTags(note.text);
            note.plaintext = self.sliceText(note.plaintext, 0, 300, '...');

            // Create item
            var item = $.tmpl('noteTemplate', note);
            item.data('note', note);

            // Update
            item.bind('update', function(e, data) {
                data.plaintext = self.stripTags(data.text);
                var tmpl = $.tmpl('noteTemplate', data);
                $(this).data('note', data).text(tmpl.text());
            });
            // Hover
            item.hover(function() {
                $(this).addClass('hover');
            }, function() {
                $(this).removeClass('hover');
            });
            // Click
            item.click(function(e) {
                e.preventDefault();
                self.setNote($(this).data('note'));
            });
            return item;
        },
        removeNote : function(note) {
            if(note && note.id) {
                // Note reference
                this._notes = $.map(this._notes, function(n, i) {
                    // Remove deleted note from the noteslist
                    return n.id === note.id ? null : n;
                });
                // Dom element
                this._dom.notes.find('#note' + note.id).remove();
            }
        },
        searchNotes : function(search, by, re) {
            var self = this, result = [];
            by = by || 'text';

            // App.log('searchNotes', search, by);

            if(this._notes) {
                var searchRegexp;
                try {
                    searchRegexp = new RegExp(search, 'ig');
                } catch (ex) {
                    // Maybe the searchstring will result into a SyntaxError on trying to "regexify" it
                    // App.error(ex);
                }

                if(searchRegexp !== undefined) {
                    for(var i = this._notes.length - 1; i >= 0; i--) {
                        var note = this._notes[i];
                        // Search by...
                        switch (by) {
                            case 'tag':
                                if(this.noteHasTag(note, search)) {
                                    result.push(note);
                                }
                                break;
                            case 'text':
                            default:
                                if(note.text.search(searchRegexp) > -1) {
                                    result.push(note);
                                }
                                break;
                        }
                    }
                }
            }

            // Return result instead of rendering?
            if(re) {
                return result;
            }

            this.renderNotes(result);
        },
        isVisible : function() {
            return this._dom.self.is(':visible');
        },
        isActive : function() {
            return this.option('active') || false;
        },
        isEditable : function() {
            return this._dom.editor.find('.editable').length > 0;
        },
        isEditModeOn : function() {
            return this.option('editmode') || false;
        },
        isSaved : function() {
            return this._content.isLatest();
        },
        isSaving : function(saving) {
            if(saving !== undefined) {
                this._saving = saving;
            }
            return this._saving || false;
        },
        noteHasTag : function(note, tag) {
            var tags = [];
            for(var i in note.tags) {
                tags.push(note.tags[i].name);
            }
            return ($.inArray(tag, tags) > -1);
        },
        stripTags : function(text) {
            return $.trim($('<div>').html(text).text());
        },
        sliceText : function(text, begin, end, appendText) {
            if(text.length <= end) {
                return text;
            }
            // Slice text
            return text.slice(begin, end) + appendText || '';
        }
    };

    // Create widget under the namespace with its name and let it inherit from the base widget
    $.widget(widget.ns + '.' + widget.name, $.ui.baseWidget, widget);

})(jQuery);
