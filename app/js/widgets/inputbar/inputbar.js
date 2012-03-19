/**
 * Inputbar module
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
        name : 'inputbar',

        // default options
        options : {
            elements : 'bar inner clear submit hint icon input'.split(' '),
            events : 'keydown keyup focus blur change'.split(' '),
            eventDelay : 50,

            defaultType : 'search',

            type : null,
            typesPath : 'app/js/widgets/inputbar/types/',
            typesPrefix : 'inputbar.',
            typesSuffix : '.js',
            typeSelector : false,

            iconPath : '/dailycloud/app/theme/default/images/icons/',
            rvalidcommand : /^([a-z]*)(:|\/)$/i,
            maxHistorySize : 20
        },

        // Element store
        _dom : {},

        // Store last submitted values
        _history : [],

        // Contains all available and added types
        _types : {},

        _typeSelector : (function() {
            var options = {
                eventDelay : 200
            };

            return {
                render : function(dom, self) {
                    dom.typeSelector = $('<div class="typeSelector"/>').append('<ul/>');
                    dom.typeSelector.on('mouseenter', $.proxy(this.mouseenter, self));
                    dom.typeSelector.on('mouseleave', $.proxy(this.mouseleave, self));
                    dom.typeSelector.insertBefore(dom.clear);
                    return dom;
                },
                mouseenter : function(event) {
                    $.doTimeout('hover', options.eventDelay, $.proxy(function() {
                        this._dom.typeSelector.addClass('open');
                    }, this), this);
                },
                mouseleave : function(event) {
                    $.doTimeout('hover', options.eventDelay, $.proxy(function() {
                        this._dom.typeSelector.removeClass('open');
                    }, this), this);
                },
                addType : function(type) {
                    var typeItem = $('<a href="#"/>').text(type.id).data('id', type.id).click($.proxy(function(event) {
                        event.preventDefault();
                        this.setType(type.id)
                    }, this));
                    this._dom.typeSelector.find('ul').append($('<li/>').append(typeItem));
                },
                setType : function(type) {
                    var typeItem, types = this._dom.typeSelector.find('a');
                    for(var i = types.length - 1; i >= 0; i--) {
                        typeItem = $(types[i]);
                        if(typeItem.hasClass('selected')) {
                            typeItem.removeClass('selected');
                        }
                        if(typeItem.data('id') == type.id) {
                            typeItem.addClass('selected');
                        }
                    };

                }
            };
        })(),

        // Create widget
        _create : function() {
            // Called only once
            if(this._trigger('create', null, this) !== false) {
                this.loadTypes().then(this.refresh);
                this.render();
                this.bindEvents();
            }
        },
        // Initialize widget
        _init : function() {
            // Called for every instance
            if(this._trigger('init', null, this) !== false) {
                this._trigger('ready', null, this);
            }
        },
        render : function() {
            var id, dom = {}, self = this;

            // Store self and parent of the input element
            dom.self = this.element;
            dom.parent = this.element.parent();

            for(var e in this.options.elements) {
                id = this.options.elements[e];
                dom[id] = this.element.find('#input_' + id);
            }

            // Add type selector
            if(this.options.typeSelector) {
                var ts = this._typeSelector.render(dom, self);
                $.extend(dom, ts);
            }

            $.extend(this._dom, dom);
        },
        // Refresh the widget
        refresh : function() {
            // Used stored type id when available
            var typeId = this.store('get', 'type', this.option('type'));
            if(typeId !== undefined) {
                if(!this.setType(typeId)) {
                    this.setType(this.options.defaultType);
                }
            }
            this.setHint();
            this.setClear();
        },
        // Bind all events
        bindEvents : function() {
            var self = this, ev, e;
            for(e in this.options.events) {
                ev = this.options.events[e];
                this.getInput().bind(ev, $.proxy(this['_event_' + ev], this));
            }

            /**
             * Focus on input - Currently disabled cause it's quite complicated to handle this gracefully!
             */
            // App.Dom.get(document).keydown(function(event) {
            // // Don't fire in text-accepting inputs that weren't directly bind to
            // App.log(event.target, event.target.nodeName, event.target.type);
            // if(this !== event.target && (/textarea|select|canvas/i.test(event.target.nodeName) || event.target.type === "text")) {
            // return;
            // }
            // // Don't fire on special keys they weren't make an input
            // if(e..keyCode < 33 || e.keyCode > 256) {
            // return;
            // }
            //
            // // Focus inputbar if it is not already focused
            // if(!self.isFocused()) {
            // self.focus();
            // }
            // });

            // Focus
            this._dom.bar.click($.proxy(this.focus, this));

            // Clear
            this._dom.clear.click($.proxy(this.clear, this));

            // Submit
            this._dom.submit.click($.proxy(this.triggerSubmit, this));

            this.bindAutocomplete();
        },
        // Autocomplete functionality
        bindAutocomplete : function() {
            var self = this;
            var input = this.getInput();
            var triggerHistory;

            // Helper functions
            function split(val) {
                return val.split(/ \s*/);
            }

            function extractLast(term) {
                return split(term).pop();
            }

            //
            // Keydown Event
            //
            input.bind('keydown', function(event) {
                // don't navigate away from the field on tab when selecting an item
                var autocomplete = $(this).data('autocomplete');
                if(autocomplete.menu.active) {
                    switch (event.keyCode) {
                        case $.ui.keyCode.TAB:
                            event.preventDefault();
                            break;
                        case $.ui.keyCode.DELETE:
                            event.preventDefault();
                            // Bind delete key to remove item from the history
                            var item = autocomplete.menu.active;
                            var hint, value = item.text();
                            if( hint = item.find('.hint')) {
                                value = value.replace(hint.text(), '');
                            }
                            item.remove();
                            self.removeFromHistory(value);
                            //self.clear();
                            triggerHistory = true;
                            break;
                        case $.ui.keyCode.ENTER:
                            event.preventDefault();
                            event.stopPropagation();
                            break;
                    }
                }

                // Adjust minLength option for autocomplete suggestions depending on the pressed key
                // triggerHistory = (triggerHistory || event.keyCode == $.ui.keyCode.UP || event.keyCode == $.ui.keyCode.DOWN);
                // var minLength = $(this).autocomplete('option', 'minLength');
                // if(triggerHistory && minLength > 0) {
                // // Pressed Key is UP or DOWN so set minLength to 0 in order to show history entries.
                // $(this).autocomplete('option', 'minLength', 0);
                // } else if(!triggerHistory && minLength === 0) {
                // // On any other key the minLength will be set to its default value 1 in order to show
                // // only suggestions when at least 1 char is inserted.
                // $(this).autocomplete('option', 'minLength', 1);
                // }
            });
            //
            // Autocomplete
            //
            input.autocomplete({
                //appendTo : self._dom.self,
                source : function(request, response) {
                    if(!request.term && !triggerHistory) {
                        return;
                    }

                    var items, i, types, type, curId, suggest;

                    // Default take the actual stored history as items
                    items = [];
                    items = items.concat(self._history);

                    // Update timeago description of history entries
                    for(i = items.length - 1; i >= 0; i--) {
                        items[i].desc = items[i].date ? $.timeago(items[i].date) : items[i].desc;
                    }

                    // if(!triggerHistory) {
                    // Add 'Type'-items if the history wasn't triggered explicitly
                    types = self.getTypes(true);
                    type = self.getType();
                    curId = type ? type.id : null;
                    for(i in types) {
                        type = types[i];

                        // Do not add current active type to the list of suggestions
                        if(type.id == curId) {
                            continue;
                        }

                        items.push({
                            icon : type.icon,
                            id : type.id,
                            value : type.key,
                            desc : type.desc,
                            category : 'Type'
                        });
                    }

                    // Check for type specified autocomplete suggestions
                    type = self.getType();
                    if(type.autocomplete) {
                        suggest = type.autocomplete.call(self, request);
                        if(suggest) {
                            items = items.concat(suggest);
                        }
                    }
                    // }
                    // Response with the list of filtered items for autocomplete
                    response($.ui.autocomplete.filter(items, extractLast(request.term)));
                    //var result = $.ui.autocomplete.filter(items, request.term);
                    // response(result);
                },
                focus : function(event, ui) {
                    // prevent value inserted on focus
                    return false;
                },
                select : function(event, ui) {
                    // Allow multiple values
                    var terms = split(this.value);
                    // remove the current input
                    terms.pop();
                    // add the selected item
                    terms.push(ui.item.value);
                    // add placeholder to get the comma-and-space at the end
                    terms.push('');
                    this.value = terms.join(' ');

                    // Submit on select
                    //self.submit();

                    return false;
                }
            });

            // Render autocomplete items customly
            input.data('autocomplete')._renderItem = function(ul, item) {
                var terms = split(this.term);
                var term = terms[terms.length - 1];
                var re = new RegExp(term);
                var t = item.value.replace(re, '<span class="matched">$&</span>') + ' <span class="hint"> - ' + item.desc + '</span>';
                return $('<li class="' + item.desc.toLowerCase() + '"/>').data('item.autocomplete', item).append('<a>' + t + '</a>').appendTo(ul);
            };
            // Render autocomplete menu customly
            input.data('autocomplete')._renderMenu = function(ul, items) {
                var self = this, currentCategory = '';
                $.each(items, function(index, item) {
                    // if(item.category != currentCategory) {
                    // ul.append('<li class="ui-autocomplete-category">' + item.category + '</li>');
                    // currentCategory = item.category;
                    // }
                    self._renderItem(ul, item);
                });
            };
        },
        getInput : function() {
            if(!this._dom.input) {
                this._dom.input = this.element.find('input:first');
            }
            return this._dom.input;
        },
        getValue : function() {
            return $.trim(this.getInput().val());
        },
        setValue : function(val) {
            this.getInput().val(val);
            this.setHint();
            this.setClear();
        },
        loadTypes : function() {
            // Load default and user type(s)
            var self = this, dfd = $.Deferred(function() {
                var request = {
                    type : 'GET',
                    url : 'app/types',
                    success : function(data) {
                        if(data && !data.error) {
                            // User types
                            var types = data.data.types.split(',');

                            // Add default type
                            if(self.options.defaultType) {
                                types.push(self.options.defaultType);
                            }

                            var deferreds = [], type;
                            for(var i = 0, len = types.length; i < len; i++) {
                                type = types[i];
                                if(!type) {
                                    continue;
                                }

                                deferreds.push($.Deferred(function(defer) {
                                    self.loadType(type).always(defer.resolve);
                                }));
                            }

                            $.when.apply(this, deferreds).then($.proxy(dfd.resolve, self));
                        }
                    }
                };
                self.ajax(request);
            });
            return dfd.promise();
        },
        loadType : function(name, callback) {
            var self = this, src;
            src = this.options.typesPath + this.options.typesPrefix + name + this.options.typesSuffix;
            return this.loadScript(src, callback, true);
        },
        getType : function(id) {
            if(id === undefined) {
                id = this.option('type');
            }
            return this.getTypeBy('id', id);
        },
        getTypeBy : function(prop, val) {
            for(var id in this._types) {
                if(this._types.hasOwnProperty(id)) {
                    var type = this._types[id];
                    if($.type(type[prop]) === 'string' && $.type(val) === 'string') {
                        if(type[prop].toLowerCase() === val.toLowerCase()) {
                            return type;
                        }
                    } else if(type[prop] === val) {
                        return type;
                    }
                }
            }
            return null;
        },
        getTypes : function(toArray) {
            if(toArray) {
                var types = [];
                for(var id in this._types) {
                    if(this._types.hasOwnProperty(id)) {
                        types.push(this._types[id]);
                    }
                }
                return types;
            }
            return this._types;
        },
        setType : function(id) {
            var type = this.getType(id);
            if(!type) {
                App.error({
                    type : 'error',
                    method : 'inputbar.setType',
                    message : 'invalid type with id "' + id + '". type is null!'
                });
                return false;
            }

            // Check if the type is actual already set
            if(this.option('type') === id) {
                App.log({
                    type : 'info',
                    method : 'inputbar.setType',
                    message : 'type "' + id + '" is already set'
                });
                // type already set
                return false;
            }

            // Check if there is actual a type which have to be unset
            if(this.option('type') !== null) {
                // When unsetting the current type failed, setType stops!
                if(this.unsetType() === false) {
                    App.log({
                        type : 'info',
                        method : 'inputbar.setType',
                        message : 'unsetType "' + this.getType().id + '" blocked setType "' + id + '"'
                    });
                    return false;
                }
            }

            // Trigger load event
            if(type.load && type.load.call(this, type) === false) {
                // When the types own load function returns false, setType stops!
                App.log({
                    type : 'info',
                    method : 'inputbar.setType',
                    message : 'load type "' + id + '" returns FALSE so type will not be set'
                });
                return false;
            }

            // Bind trigger events of the new type
            if(type.trigger) {
                $.each(type.trigger, $.proxy(function(triggerEvent, triggerFn) {
                    this.bind(triggerEvent, triggerFn);
                }, this));
            }

            this.element.addClass('type' + type.id);

            this.setHint(type.hint);

            // Load icon of the new type
            if(type.icon) {
                var icon, iconPath, url, newIcon;
                icon = this._dom.icon;
                iconPath = this.option('iconPath');
                url = iconPath + type.icon;
                newIcon = $('<img/>');
                newIcon.hide().bind('load', function() {
                    $(this).fadeIn();
                });
                icon.parent().append(newIcon);
                icon.remove();
                this._dom.icon = newIcon;
                newIcon.attr('src', url).load();
            }

            // Set the new type in the type selector as well
            if(this.options.typeSelector) {
                this._typeSelector.setType.call(this, type);
            }

            // Store type id in option and into the global storage
            this.option('type', type.id);
            this.store('set', 'type', type.id);

            return true;
        },
        unsetType : function(id) {
            // Get actual selected type to unset it
            id = id || this.option('type');
            var type = this.getType(id);

            if(type.unload && type.unload.call(this, type) === false) {
                // When the types own unload function returns false, unsetType stops!
                App.log({
                    type : 'info',
                    method : this.widetName + '.unsetType',
                    message : 'unload type "' + id + '" returns FALSE so type will not be unset'
                });

                return false;
            }

            // Bind trigger events of the new type
            if(type.trigger) {
                $.each(type.trigger, $.proxy(function(triggerEvent, triggerFn) {
                    this.unbind(triggerEvent);
                }, this));
            }

            this.element.removeClass('type' + id);
        },
        /**
         * Add a (new) type for that inputbar.
         */
        addType : function(type, set) {
            var normalizedType = this.normalizeType(type);
            if(normalizedType) {
                // Checking whether the type already exists
                var isNewType = this.getType(type.id) === null;
                this._types[type.id] = type;

                // Set new type as current selected type?
                if(set !== undefined) {
                    this.setType(type.id);
                }

                if(isNewType && this.options.typeSelector) {
                    this._typeSelector.addType.call(this, type);
                }

                this._trigger('addType', null, this, type);
            } else {
                App.log({
                    type : 'error',
                    method : 'addType',
                    message : 'Type "' + type.id + '" misses mandatory value(s)',
                    data : type
                });
            }
        },
        addTypes : function(types) {
            if(types.length) {
                for(var i = 0, len = types.length; i < len; i++) {
                    this.addType(types[i]);
                };
            }
        },
        /**
         * Equip a type with its necessary default and maybe missing values
         */
        normalizeType : function(type) {
            // Check for mandatory values first
            var mandatories = 'id key submit'.split(' ');
            for(var i = mandatories.length - 1, val = mandatories[i]; i >= 0; i--) {
                if(!type.hasOwnProperty(val)) {
                    return false;
                }
            };

            var optionals = 'icon hint desc'.split(' ');
            for(var i = optionals.length - 1, val = optionals[i]; i >= 0; i--) {
                if(!type.hasOwnProperty(val)) {
                    // TODO are there default values?
                    type[val] = null;
                }
            };

            return type;
        },
        getHint : function() {
            var type = this.getType()
            if(type) {
                return type.hint;
            }
            return null;
        },
        setHint : function(hint) {
            if(!this.isFocused()) {
                // no focus
                if(!this.hasValue()) {
                    // no value
                    hint = hint || this.getHint();
                } else {
                    // value
                    hint = hint || null;
                    // TODO get dynamic hint
                }
            } else {
                // focus
                if(!this.hasValue()) {
                    // no value
                    hint = hint || this.getHint();

                } else {
                    // value
                    hint = hint || null;
                    // TODO get dynamic hint
                }
            }

            if(hint) {
                this._dom.hint.show();

                // Support <input> as well as <span> (non-input) elements
                if(this._dom.hint[0].nodeName.toLowerCase() === 'input') {
                    this._dom.hint.val(hint);
                } else {
                    this._dom.hint.html(hint);
                }
            } else {
                this._dom.hint.hide();
            }
        },
        setClear : function() {
            if(this.hasValue()) {
                this._dom.submit.show();
                this._dom.clear.show();
            } else {
                this._dom.submit.hide();
                this._dom.clear.hide();
            }
        },
        addToHistory : function(value) {
            // Regard the maximum size of the history
            if(this.options.maxHistorySize < this._history.length) {
                // Remove the first element of the history (shift the oldest entry out)
                this._history.shift();
            }
            //Prevent duplciates
            var add = true;
            for(var i = this._history.length - 1; i >= 0; i--) {
                if(this._history[i].value === value) {
                    // value already in the history -> only update its last used date value
                    this._history[i].date = new Date;
                    add = false;
                    break;
                }
            }

            if(add) {
                this._history.push({
                    value : value,
                    date : new Date,
                    category : 'History'
                });
            }
        },
        removeFromHistory : function(value) {
            for(var i = this._history.length - 1; i >= 0; i--) {
                if($.trim(this._history[i].value) === $.trim(value)) {
                    array_remove(this._history, i);
                }
            }
        },
        isFocused : function() {
            return (document.activeElement && (document.activeElement.id === this._dom.input.attr('id')));
        },
        hasValue : function(value) {
            value = value !== undefined ? value : this.getValue();
            return (value !== null && value !== '');
        },
        hasValueChanged : function() {
            if(this.getValue() !== this._lastValue) {
                return true;
            }
            return false;
        },
        // Focus inputbar first input element
        focus : function() {
            this.getInput().focus().addClass('focus');
        },
        blur : function() {
            this.getInput().blur().removeClass('focus');
        },
        submit : function(callback) {
            var value, type, hasValue, isCommand, result;
            value = this.getValue();
            type = this.getType();
            hasValue = this.hasValue(value);
            isCommand = this.options.rvalidcommand.test(value);

            // First of all check if there is any kind of value input to prevent empty value submitting
            if(!hasValue) {
                return false;
            }

            // Store submitted value to history
            this.addToHistory(value);

            // Check if the submitted value is a valid and available type
            var newType = isCommand && this.getTypeBy('key', value);
            if(newType) {
                // Set new type
                result = this.setType(newType.id);
            } else {
                // Call optional validate function of the type
                if(!type.validate || type.validate.call(this, value, type)) {
                    // Call the submit function of the type
                    if(type.submit) {
                        var result = type.submit.call(this, value, type);
                        // No response (=== undefined) means the submit succeeds
                        result = result === undefined ? true : result;
                    }
                }
            }

            // Call the submit callback, regarding the submit response
            if($.type(callback) === 'function') {
                callback.call(this, {
                    success : result
                });
            } else {
                return result;
            }
        },
        asyncSubmit : function() {
            return $.Deferred($.proxy(function(dfd) {
                this.submit(dfd.resolve);
            }, this)).promise();
        },
        triggerSubmit : function() {
            var self = this;

            // Use asynchronous submit (handled by deferred-promise functionality)
            // to prevent other code from interfering with the progress or status
            // of the internal submit request.
            this.asyncSubmit().then(function(response) {
                if(response.success) {
                    self.clear();
                    self.getInput().autocomplete('close');
                }
            });
        },
        clear : function() {
            // Override the preceding timeout with a new one
            var type = this.getType();
            if(type && type.clear) {
                type.clear.call(this);
            }
            this.getInput().val('').trigger('keyup');
            this.setClear();
        },
        _event_keydown : function(e) {
            var self = this, value = this.getValue();

            // Trigger event for other widgets
            if(this._trigger(e.type, null, this) !== false) {
                $.doTimeout(this.widgetName + e.type, this.options.eventDelay, $.proxy(function() {
                    // Call event for the current type
                    var type = this.getType();
                    if(type && type[e.type]) {
                        type[e.type].call(this, e, value, type);
                    }

                    switch(e.keyCode) {
                        case $.ui.keyCode.ENTER:
                            this.triggerSubmit();
                            break;
                    }

                    this.setHint();
                }, this));
            }
        },
        _event_keyup : function(e) {
            var value = this.getValue(), hasValueChanged = this.hasValueChanged();

            // Trigger event for other widgets
            if(this._trigger(e.type, null, this) !== false) {
                $.doTimeout(this.widgetName + e.type, this.options.eventDelay, $.proxy(function() {
                    var type = this.getType();
                    if(type) {
                        // Call event for the current type
                        if(type[e.type]) {
                            type[e.type].call(this, e, value, type);
                        }

                        // A type can has a parse function which has to be called
                        if(type.parse && hasValueChanged) {
                            type.parse.call(this, value, type);

                            // Store current value as last changed
                            this._lastValue = this.getValue();
                        }
                    }

                    this.setHint();
                    this.setClear();
                }, this));
            }
        },
        _event_focus : function(e) {
            var value = this.getValue();

            this.element.addClass('focus');
            this.setHint();

            // Trigger event for other widgets
            if(this._trigger(e.type, null, this) !== false) {
                $.doTimeout(this.widgetName + e.type, this.options.eventDelay, $.proxy(function() {
                    var type = this.getType();
                    if(type && type[e.type]) {
                        type[e.type].call(this, e, value, type);
                    }
                }, this));
            }
        },
        _event_blur : function(e) {
            var value = this.getValue();

            this.element.removeClass('focus');
            this.setHint();

            // Trigger event for other widgets
            if(this._trigger(e.type, null, this) !== false) {
                $.doTimeout(this.widgetName + e.type, this.options.eventDelay, $.proxy(function() {
                    var type = this.getType();
                    if(type && type[e.type]) {
                        type[e.type].call(this, e, value, type);
                    }
                }, this));
            }
        },
        _event_change : function(e) {
            var value = this.getValue();

            // Trigger event for other widgets
            if(this._trigger(e.type, null, this) !== false) {
                $.doTimeout(this.widgetName + e.type, this.options.eventDelay, $.proxy(function() {
                    var type = this.getType();
                    if(type) {
                        // Call event for the current type
                        if(type[e.type]) {
                            type[e.type].call(this, e, value, type);
                        }

                        // A type can has a validate function which has to be called
                        if(type.validate && this.hasValueChanged()) {
                            type.validate.call(this, value);
                        }
                    }

                    // Store current value as last changed
                    this._lastValue = this.getValue();

                }, this));
            }
        },
        _debug : function(type) {
            switch (type) {
                case 'events':
                    App.log({
                        type : type,
                        message : this.data('events')
                    });
                    break;
                default:
                    break;
            }
        }
    };

    // Create widget under the namespace with its name and let it inherit from the base widget
    $.widget(widget.ns + '.' + widget.name, $.ui.baseWidget, widget);

})(jQuery);
