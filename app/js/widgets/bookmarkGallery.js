/**
 * Control module
 */
(function($) {
    /**
     * Properties
     */

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
        name : 'bookmarkGallery',

        // default options
        options : {
            defaultLimit : 12,
            webshot : {
                url : 'http://ws.dailyd.de/',
                thumbs : 'thumbs/',
                height : 150, //100,
                width : 210, //160,
                ext : '.jpeg',
                reloadInterval : 5000, // ms
                reloadTries : 6
            },
            favicon : 'http://g.etfv.co/'
            //favicon : 'http://www.google.com/s2/favicons?domain='
        },

        // Templates
        _templates : {
            bookmarkTemplate : (function() {
                var tmpl = [];
                tmpl.push('<li class="bookmarkHolder">');
                // id="bookmark${id}"
                tmpl.push('  <div class="bookmark">');
                tmpl.push('    <span class="highlight"></span>');
                tmpl.push('    <div class="placeholder"/>');
                tmpl.push('    <img class="webshot" src="${webshot}" alt="" width="${width}" height="${height}"/>');
                tmpl.push('  </div>');
                tmpl.push('  <div class="caption cf">');
                tmpl.push('    <img class="favicon" src="${favicon}" alt="" />');
                tmpl.push('    <a class="url" href="${url}" title="${title}" rel="nofollow" target="_blank">${title}</a>');
                tmpl.push('  </div>');
                tmpl.push('</li>');
                return tmpl.join('');
            })()
        },

        // Element store
        _dom : {},

        // Tagbar instance
        _tagbar : null,

        // Loaded bookmarks
        _bookmarks : null,

        // Rendered bookmarks
        _rendered : {},

        // Selected bookmarks
        _selected : [],

        // Create widget
        _create : function() {
            if(this._trigger('create', null, this) !== false) {
                var self = this, dom = {
                    self : self.element,
                    parent : self.element.parent(),
                    gallery : $('<ul class="gallery"/>')
                };

                // Compile markups as named templates
                $.each(this._templates, function(name, tmpl) {
                    $.template(name, tmpl);
                });
                //
                // Build dom...
                //
                // Speed up dom manipulation
                dom.self.detach().append(dom.gallery);

                // At last append the root element back to its parent
                dom.self.appendTo(dom.parent);

                // Update dom reference map
                $.extend(this._dom, dom);

                // this.initTagbar();
                this.bindEvents();
                this.loadBookmarks();
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

                this._trigger('unloaded', null, this);
            }
        },
        bindEvents : function() {
            var self = this;

            // Hover
            this._dom.gallery.on('mouseenter', '.bookmarkHolder', $.proxy(self.mouseEnterBookmark, self));
            this._dom.gallery.on('mouseleave', '.bookmarkHolder', $.proxy(self.mouseLeaveBookmark, self));

            // Selectable
            this._dom.gallery.selectable({
                //delay : 20,
                filter : '.bookmarkHolder',
                stop : $.proxy(self.stopSelectingBookmarks, this)
            });

            // // Link click forward directly to the page
            // this._dom.gallery.on('click', '.url', function(event) {
            // App.log($(this).attr('href'));
            // });

            // Bind global resize event
            App.Viewport.addResizeListener($.proxy(this.handleResize, this));
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
            if(this.isVisible()) {
                this._trigger('visible', null, this);
            } else {
                var self = this;
                this._dom.self.animate({
                    opacity : 'toggle',
                    height : 'toggle'
                }, function() {
                    self._trigger('visible', null, self);
                });
            }
            return this;
        },
        hide : function() {
            this._dom.self.hide();
            return this;
        },
        gallery : function() {
            return this._dom.gallery;
        },
        loadBookmarks : function() {
            var self = this, request = {
                url : 'bookmark/latest/' + this.options.defaultLimit,
                type : 'GET',
                success : function(data) {
                    if(data) {
                        if(data.message) {
                            App.log(data.message);
                        }
                        if(data.count > 0) {
                            self._bookmarks = data.bookmarks;
                            self.renderBookmarks();
                        }
                    }
                }
            };
            this.ajax(request);

            return this;
        },
        renderBookmarks : function(data) {
            var self = this, gallery = this.gallery(), parent = gallery.parent();

            // Clear list (detach to boost performance)
            gallery.detach().html('');

            // Without specified notes load simply all notes
            data = data || this._bookmarks;

            // Render each bookmark
            $.each(data, function(i, bm) {
                self.addBookmark(bm, gallery);
            });

            gallery.appendTo(parent);
        },
        renderBookmark : function(bm) {
            var self = this, ws = this.options.webshot, attr, el, webshot, numTries = 0;

            // Bookmark attributes for the template
            attr = $.extend({}, bm, {
                title : bm.title || bm.url, // use url as fallback when there is no title
                webshot : ws.url + ws.thumbs + bm.webshot + ws.ext,
                height : ws.height,
                width : ws.width,
                favicon : this.options.favicon + bm.url,
                placeholder : 'app/theme/default/images/ws_placeholder.png'
            });

            // Create element
            el = $.tmpl('bookmarkTemplate', attr);
            el.find('.bookmark').data('bookmark', bm);

            // Ensure loading the webshot
            webshot = el.find('img.webshot').hide().load(function() {
                // Webshot is loaded -> remove placeholder, show webshot
                var $this = $(this);
                $this.siblings('.placeholder').hide();
                $this.fadeIn(200, function() {
                    $this.siblings('.placeholder').remove();
                });
            }).error(function() {
                // Webshot is not (yet) available
                var $this = $(this);
                $this.siblings('.placeholder').show();
                //App.log('Webshot ' + $this.attr('src') + ' is not (yet) available');
                // if(++numTries < ws.reloadTries) {
                // setTimeout(function() {
                // $this.attr('src', $this.attr('src'));
                // }, ws.reloadInterval);
                // }
            });
            // Put bookmark element into the rendered table
            this._rendered[bm.id] = el;

            return el;
        },
        addBookmark : function(bm, gallery, callback) {
            var el = this.renderBookmark(bm);
            if(gallery) {
                el.appendTo(gallery);
            } else {
                el.prependTo(this.gallery());
            }

            if(callback) {
                callback.call(this, el);
            }

            return el;
        },
        showBookmark : function() {
            App.log('showBookmark', this);
        },
        mouseEnterBookmark : function(event) {
            var el = $(event.target).closest('.bookmarkHolder').addClass('hover');
            var bm = el.data('bookmark');
            // App.getWidget('inputbar').setValue(bm.url);
        },
        mouseLeaveBookmark : function(event) {
            var el = $(event.target).closest('.bookmarkHolder').removeClass('hover');
            // App.getWidget('inputbar').setValue();
        },
        stopSelectingBookmarks : function(event) {
            var selected = [];

            // Get all selected bookmark
            this._dom.gallery.find('.ui-selected').each(function() {
                selected.push($(this).find('.bookmark').data('bookmark'));
            });
            // Store selected
            this._selected = selected;
            App.log(this._selected);
        },
        getSelectedBookmarks : function() {
            return this._selected;
        },
        getRenderedBookmarkById : function(id) {
            if( id in this._rendered) {
                return this._rendered[id];
            }
            return null;
        },
        handleResize : function(event, height, width) {
            //App.log(event, width, height);
        },
        isVisible : function() {
            return this._dom.self.is(':visible');
        },
        isActive : function() {
            return this.option('active');
        }
    };

    // Create widget under the namespace with its name and let it inherit from the base widget
    $.widget(widget.ns + '.' + widget.name, $.ui.baseWidget, widget);

})(jQuery);
