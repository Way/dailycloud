(function($, window, undefined) {

    $.fn.contentEditable = function(settings) {
        var plugin = {
            name : 'contentEditable',
            version : '1.0'
        };

        /**
         * contentEditable "class"
         *
         * public methods are available through $('selector').data(plugin.name)
         */
        function contentEditable($this, s) {
            // Internal properties (for each instance of the plugin)
            var settings = s;

            function edit(isEditing) {
                isEditing = (isEditing === true) ? true : false;
                var data = $this.data(plugin.name);

                $this.attr(plugin.name, isEditing);
                if(isEditing) {
                    // Store current content in order to be able to cancel current edit
                    $this.data('storedContent', $this.html());
                    $this.addClass('editable');
                    setEndOfContenteditable();
                } else {
                    $this.removeClass('editable').blur();
                }
            }

            function save() {
                $.doTimeout(plugin.name + 'save', 200, function() {
                    var content = $this.html();
                    paste(content, true);

                    // Clear stored content -> cancel is not possible after saving
                    $this.data('storedContent', null);
                });
            }

            // Set content and save it after that (this way the content will be parsed as well)
            function paste(content, latest) {
                // Disable editing
                edit(false);

                // Write content back to the element
                content = parseContent(content);
                setValue(content);
                setLatest(latest || false);
            }

            function cancel() {
                $.doTimeout(plugin.name + 'save', 200, function() {
                    // Disable editing
                    edit(false);

                    var storedContent = $this.data('storedContent');
                    if(storedContent) {
                        setValue(storedContent);
                    }
                });
            }

            function getValue() {
                return $this.data(plugin.name).cache.val();
            }

            function setValue(content, latest) {
                var parent = $this.parent();

                $this.detach();
                $this.html(content);
                $this.appendTo(parent);

                cache(content);
                setLatest(latest);
            }

            function cache(content) {
                var cch = $this.data(plugin.name).cache;
                if(cch && content) {
                    cch.val(content);
                }
                return cch.val();
            }

            function setLatest(latest) {
                // Clear stored content -> cancel is not possible after saving
                $this.data('storedContent', null);
                return $this.data('latest', latest || false);
            }

            function isLatest() {
                return $this.data('latest');
            }

            function createlink() {/* This can be improved */
                var urlPrompt = prompt('Enter URL:', 'http://');
                document.execCommand('createlink', false, urlPrompt);
            }

            function insertimage() {/* This can be improved */
                var urlPrompt = prompt('Enter Image URL:', 'http://');
                document.execCommand('insertimage', false, urlPrompt);
            }

            function formatblock(block) {
                document.execCommand('formatblock', null, block);
            }

            function parseContent(content) {
                content = autolink(content);
                content = trim(content);
                return content;
            }

            function setEndOfContenteditable() {
                var range, selection, contentEditableElement = $this[0];
                if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
                {
                    range = document.createRange();
                    //Create a range (a range is a like the selection but invisible)
                    range.selectNodeContents(contentEditableElement);
                    //Select the entire contents of the element with the range
                    range.collapse(false);
                    //collapse the range to the end point. false means collapse to end rather than the start
                    selection = window.getSelection();
                    //get the selection object (allows you to change selection)
                    selection.removeAllRanges();
                    //remove any selections already made
                    selection.addRange(range);
                    //make the range you have just created the visible selection
                } else if(document.selection)//IE 8 and lower
                {
                    range = document.body.createTextRange();
                    //Create a range (a range is a like the selection but invisible)
                    range.moveToElementText(contentEditableElement);
                    //Select the entire contents of the element with the range
                    range.collapse(false);
                    //collapse the range to the end point. false means collapse to end rather than the start
                    range.select();
                    //Select the range (make it the visible selection
                }
            }

            function autolink(str) {
                var match, regex = /[^<]*(<a href="([^"]+)">([^<]+)<\/a>)/i;
                while( match = regex.exec(str)) {
                    str = str.replace(match[1], match[3]);
                }
                var re = /((http[s]?|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/ig;
                return str.replace(re, '<a href="$1">$1</a>');
            }

            function trim(str) {
                var str = str.replace(/^\s\s*/, ''), ws = /\s/, i = str.length;
                while(ws.test(str.charAt(--i)));
                return str.slice(0, i + 1);
            }

            function init(s) {
                settings = s;

                bindEvents();
                bindShortcuts();
            }

            function bindEvents() {
                $this.bind('paste copy cut keyup mouseup', function(event) {
                    var newContent = $this.html();

                    // Update cache only when any change has occured
                    if(newContent !== cache()) {
                        $.doTimeout(plugin.name + 'change', 200, function() {
                            $this.trigger('change', newContent);
                        });
                        cache(newContent);
                        setLatest(false);
                    }
                });
            }

            function bindShortcuts() {
                var shortcuts = [{
                    keys : 'Ctrl+l',
                    method : function() {
                        createlink();
                    }
                }, {
                    keys : 'Ctrl+g',
                    method : function() {
                        insertimage();
                    }
                }, {
                    keys : 'Ctrl+Alt+U',
                    method : function() {
                        document.execCommand('insertunorderedlist', false, null);
                    }
                }, {
                    keys : 'Ctrl+Alt+O',
                    method : function() {
                        document.execCommand('insertorderedlist', false, null);
                    }
                }, {
                    keys : 'Ctrl+q',
                    method : function() {
                        formatblock(['<blockquote>']);
                    }
                }, {
                    keys : 'Ctrl+Shift+k',
                    method : function() {
                        formatblock(['<code>']);
                    }
                }, {
                    keys : 'Ctrl+.',
                    method : function() {
                        document.execCommand('superscript', false, null);
                    }
                }, {
                    keys : 'Ctrl+Shift+.',
                    method : function() {
                        document.execCommand('subscript', false, null);
                    }
                }, {
                    keys : 'Ctrl+Shift+0',
                    method : function() {
                        formatblock(['p']);
                    }
                }, {
                    keys : 'Ctrl+b',
                    method : function() {
                        document.execCommand('bold', false, null);
                    }
                }, {
                    keys : 'Ctrl+i',
                    method : function() {
                        document.execCommand('italic', false, null);
                    }
                }, {
                    keys : 'Ctrl+Shift+1',
                    method : function() {
                        formatblock(['H1']);
                    }
                }, {
                    keys : 'Ctrl+Shift+2',
                    method : function() {
                        formatblock(['H2']);
                    }
                }, {
                    keys : 'Ctrl+Shift+3',
                    method : function() {
                        formatblock(['H3']);
                    }
                }, {
                    keys : 'Ctrl+Shift+4',
                    method : function() {
                        formatblock(['H4']);
                    }
                }, {
                    keys : 'Ctrl+m',
                    method : function() {
                        document.execCommand('removeFormat', false, null);
                    }
                }, {
                    keys : 'Ctrl+u',
                    method : function() {
                        document.execCommand('underline', false, null);
                    }
                }, {
                    keys : 'tab',
                    method : function() {
                        document.execCommand('indent', false, null);
                    }
                }, {
                    keys : 'Ctrl+tab',
                    method : function() {
                        document.execCommand('indent', false, null);
                    }
                }, {
                    keys : 'Shift+tab',
                    method : function() {
                        document.execCommand('outdent', false, null);
                    }
                }/*, {
                 keys : 'Ctrl+s',
                 method: function() {
                 save();
                 }
                 }*/];

                //
                // Bind shortcuts
                //
                $.each(shortcuts, function(index, item) {
                    $this.bind('keydown', item.keys, function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        item.method.call($this);
                    });
                });
            }

            // Public methods
            $.extend(this, {
                name : plugin.name,
                version : plugin.version,
                reinit : function(s) {
                    s = $.extend({}, settings, s);
                    init(s);
                },
                edit : function(isEditing) {
                    return edit(isEditing);
                },
                save : function() {
                    return save();
                },
                cancel : function() {
                    return cancel();
                },
                paste : function(content, isLatest) {
                    return paste(content, isLatest);
                },
                getValue : function() {
                    return getValue();
                },
                setLatest : function(isLatest) {
                    return setLatest(isLatest);
                },
                isLatest : function() {
                    return isLatest();
                }
            });

            // Last and least, init the plugin instance...
            init(s);
        }

        // Merge settings with defaults
        settings = $.extend({}, $.fn.contentEditable.defaults, settings);

        // Plugin call logic
        return this.each(function() {
            var elem = $(this), api = elem.data(plugin.name);
            if(api) {
                api.reinit(settings);
            } else {
                // The plugin hasn't been initialized yet
                api = new contentEditable(elem, settings);
                $.extend(api, {
                    cache : $('<textarea/>')
                });
                elem.data(plugin.name, api);
            }
        });
    };

    $.fn.contentEditable.defaults = {

    };

})(jQuery, this);
