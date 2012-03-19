(function () {
    new joli.Namespace("launcher");
    launcher.namespace("ui");
    launcher.namespace("locale");
    launcher.ui.namespace("directory");
    launcher.ui.namespace("dashboard");
    launcher.ui.namespace("stream");
    launcher.ui.namespace("files");
    launcher.ui.namespace("settings");
    launcher.ui.namespace("search");
    launcher.ui.namespace("forms")
})();
launcher.ui.extend("Iframe", joli.ui.Modalbox, {
    closeCallback: undefined,
    url: undefined,
    width: 0,
    height: 0,
    initWidget: function () {
        this.content.closeiframe.click(function () {
            this.hide();
            this.closeCallback && this.closeCallback()
        }, this)
    },
    show: function (a, b, c, d) {
        this.closeCallback = b || undefined;
        this.url = a;
        this.width = c || 0;
        this.height = d || 0;
        var g = joli.ui.root.outerHeight() - 100,
            f = joli.ui.root.outerWidth() - 100;
        if (this.width > f || this.width == 0) this.width = f;
        if (this.height > g || this.height == 0) this.height = g;
        this.content.style.width = this.width + "px";
        this.content.style.height = this.height + "px";
        (this.content.description.iframe._element.src = this.url) && this.closeCallback && this._super.apply(this, arguments)
    }
});
launcher.ui.extend("UserDetails", joli.ui.Widget, {
    events: {
        refreshContent: function () {
            this.content.current.redisplay()
        },
        userdetailstabs: function (a, b) {
            if (b == "publicpage") {
                window.open("http://my.jolicloud.com/" + this.username, "_blank", "", false);
                e.preventDefault()
            } else {
                var c = joli.ui.root.content.current.outerHeight() - 20 - 35 - 82 - 35 - 50;
                c = parseInt(c / 70, 10) * 2;
                var d;
                if (b == "apps") d = this.content.apps.pager;
                if (b == "following") d = this.content.following.pager;
                if (b == "followers") d = this.content.followers.pager;
                if (c && d) if (d.options.perPage != c && c > 0) {
                    var g = d.pageData;
                    d.pageData = undefined;
                    d.page = 0;
                    d.options.perPage = c;
                    g && d.redisplay()
                }
                this.content.showChild(b, joli.bind(function () {
                    this.tabs.activate(b, true);
                    this.resizeList()
                }, this));
                a.preventDefault()
            }
        }
    },
    resizeList: function () {
        var a = joli.ui.root.content.current.outerHeight() - 20 - 35 - 82 - 35 - 50;
        a = parseInt(a / 70, 10) * 2;
        var b;
        if (this.tabs.getItem("apps").active) b = this.content.apps.pager;
        if (this.tabs.getItem("following").active) b = this.content.following.pager;
        if (this.tabs.getItem("followers").active) b = this.content.followers.pager;
        if (a && b) if (b.options.perPage != a && a > 0) {
            b.page = 0;
            b.options.perPage = a;
            b.pageData = undefined;
            b.redisplay()
        }
    },
    username: "",
    prepareToShow: function (a) {
        if (this.hasShown) a();
        else {
            var b = joli.ui.root.content.current.outerHeight() - 20 - 35 - 82 - 35 - 50,
                c = parseInt(b / 70, 10) * 2;
            console.log("user details apps elements", c, b);
            if (this.content.apps.pager.options.perPage != c && c > 0) {
                this.content.apps.pager.pageData = undefined;
                this.content.apps.pager.page = 0;
                this.content.apps.pager.options.perPage = c
            }
            this.hasShown = true;
            var d = this.options.username;
            this.username = this.options.username;
            var g;
            joli.cloud.user.id(d, joli.bind(function (f) {
                g = f
            }, this));
            joli.each(this.content.children, function (f) {
                f.setMethodParams({
                    username: d
                })
            });
            this.content.apps.redisplay();
            joli.cloud.joliserver.bind("requests_end", joli.bind(function () {
                this.profile.setModel(g);
                this.tabs.activate("apps", true);
                this.resizeList();
                this.content.showChild("apps");
                a()
            }, this))
        }
    }
});
launcher.ui.extend("Preview", joli.ui.Modalbox, {
    closeCallback: undefined,
    url: undefined,
    type: undefined,
    interval: undefined,
    name: "",
    width: 0,
    height: 0,
    initWidget: function () {
        this.content.audio._element.addEventListener("timeupdate", joli.bind(function () {
            this.updateProgress(this.content.audio._element)
        }, this), false);
        this.content.video._element.addEventListener("timeupdate", joli.bind(function () {
            this.updateProgress(this.content.video._element)
        }, this), false);
        this.content.closepreview.click(function () {
            this.close()
        }, this)
    },
    close: function () {
        this.content.audio._element.src = "";
        this.content.audio._element.pause();
        this.content.video._element.src = "";
        this.content.video._element.pause();
        this.content.body.innerHTML = "";
        this.content.iframe.innerHTML = "";
        this.content.iframe.hide();
        this.hide();
        this.closeCallback && this.closeCallback()
    },
    hide: function () {
        this._super.apply(this, arguments);
        clearInterval(this.interval);
        if (this.interval) this.interval = undefined
    },
    show: function (a, b, c, d, g, f, h) {
        this.closeCallback = d || undefined;
        console.log("show", this, b, c, h);
        this.name = a;
        this.url = b;
        this.type = c;
        this.width = g || 0;
        this.height = f || 0;
        this.content.audio._element.src = "";
        this.content.audio._element.pause();
        this.content.video._element.src = "";
        this.content.video._element.pause();
        this.content.body.innerHTML = "";
        this.content.iframe.innerHTML = "";
        this.content.iframe.hide();
        this.content.audio.hide();
        this.content.video.hide();
        this.content.progress._element.style.marginTop = "0px";
        this.content.progress.setValue(0);
        this.content.progress.hide();
        this.content.body.hide();
        this.content.name.text = this.name;
        this.content.style.width = "500px";
        this.content.style.height = "200px";
        this.content.tooltip.text = _("Loading") + "...";
        this.content.tooltip.show();
        this.content.show();
        this._super.apply(this, arguments);
        this.content.openpreview.unbind("click");
        this.content.openpreviewinfolder.unbind("click");
        if (h) {
            if (h.service == "dropbox") {
                this.content.openpreview._element.childNodes[1].setAttribute("href", joli.cloud.dropbox.server.options.baseUrl + "files/dropbox/redirect?path=" + h.path);
                this.content.openpreview._element.childNodes[1].setAttribute("target", "_blank");
                this.content.openpreview._element.childNodes[1].onclick = joli.bind(function () {
                    this.close();
                    return true
                }, this);
                var i = h.path;
                if (i == "/") i = "";
                i = i.split("/");
                var j = "";
                joli.each(i, function (m, q) {
                    if (q < i.length - 1) j += "/" + m
                });
                j = j.replace("//", "/");
                this.content.openpreviewinfolder._element.childNodes[1].setAttribute("href", "https://www.dropbox.com/home#" + j + ":::");
                this.content.openpreviewinfolder._element.childNodes[1].setAttribute("target", "_blank");
                this.content.openpreviewinfolder._element.childNodes[1].onclick = joli.bind(function () {
                    this.close();
                    return true
                }, this)
            } else if (h.service == "googledocs") {
                this.content.openpreview._element.childNodes[1].setAttribute("href", h.open);
                this.content.openpreview._element.childNodes[1].setAttribute("target", "_blank");
                this.content.openpreview._element.childNodes[1].onclick = joli.bind(function () {
                    this.close();
                    return true
                }, this);
                this.content.openpreviewinfolder.hide()
            } else {
                this.content.openpreview._element.childNodes[1].removeAttribute("href");
                this.content.openpreview._element.childNodes[1].removeAttribute("target");
                this.content.openpreview._element.childNodes[1].onclick = null;
                this.content.openpreview.click(function () {
                    if (h.service != "dropbox") {
                        joli.system.filesystem.open(h.path, h.root);
                        this.close()
                    }
                }, this);
                this.content.openpreviewinfolder._element.childNodes[1].removeAttribute("href");
                this.content.openpreviewinfolder._element.childNodes[1].removeAttribute("target");
                this.content.openpreviewinfolder._element.childNodes[1].onclick = null;
                this.content.openpreviewinfolder.click(function () {
                    if (h.service != "dropbox") {
                        var m = h.path;
                        if (m == "/") m = "";
                        else {
                            pathsplit = h.path.split("/");
                            m = "";
                            joli.each(pathsplit, function (q, p) {
                                if (p > 0 && p < pathsplit.length - 1) m += "/" + q
                            }, this)
                        }
                        joli.system.filesystem.open(m, h.root);
                        this.close()
                    }
                }, this)
            }
            this.content.openpreview.show();
            h.service != "googledocs" && this.content.openpreviewinfolder.show()
        } else {
            this.content.openpreview.hide();
            this.content.openpreviewinfolder.hide()
        }
        var l = joli.ui.root.outerHeight() - 100,
            o = joli.ui.root.outerWidth() - 100;
        if (this.width > o || this.width == 0) this.width = o;
        if (this.height > l || this.height == 0) this.height = l;
        if (this.type == "audio/mpeg") {
            this.content.audio._element.src = this.url;
            this.content.audio._element.play();
            this.interval = setInterval(joli.bind(function () {
                console.log("not loaded");
                if (!(this.content.audio._element.readyState < 1)) {
                    clearInterval(this.interval);
                    this.interval = undefined;
                    console.log("loaded");
                    this.content.style.width = "514px";
                    this.content.style.height = "110px";
                    this.content.audio._element.style.width = "486px";
                    this.content.progress.options.width = 486;
                    this.content.progress.setSize(4, 486);
                    this.content.progress.setMax(486);
                    this.content.progress._element.style.marginTop = "13px";
                    this.content.tooltip.hide();
                    this.content.audio.show();
                    this.content.progress.show()
                }
            }, this), 50);
            var n = 5E3;
            if (this.url.indexOf("api-content.dropbox.com") != -1) n = 1E4;
            if (this.url.indexOf("google.com") != -1) n = 2E4;
            setTimeout(joli.bind(function () {
                clearInterval(this.interval);
                if (this.interval) {
                    var m = _("Unable to preview.");
                    if (h.service == "dropbox") m = _("Unable to preview the file from Dropbox.");
                    if (h.service == "googledocs") m = _("Unable to preview the file from Google Docs.");
                    this.error(m);
                    this.interval = undefined
                }
            }, this), n)
        }
        if (this.type == "image/png" || this.type == "image/jpg" || this.type == "image/jpeg") {
            this.content.body.innerHTML = '<img src="' + this.url + '" />';
            var r = document.createElement("img");
            r.id = "preload";
            r.src = this.url;
            r.style.display = "none";
            if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1 && h.service == "googledocs") {
                n = _("Unable to preview.");
                if (h.service == "googledocs") n = _("Unable to preview the file from Google Docs.");
                this.error(n)
            } else {
                r.onload = joli.bind(function () {
                    var m = $("#preload").outerWidth(),
                        q = $("#preload").outerHeight();
                    document.body.removeChild(r);
                    console.log(m, q);
                    this.setSize(this.content.body._element.firstChild, m, q, o, l);
                    if (m > 0 && q > 0) {
                        this.content.tooltip.hide();
                        this.content.body.show()
                    } else {
                        m = _("Unable to preview.");
                        if (h.service == "dropbox") m = _("Unable to preview the file from Dropbox.");
                        if (h.service == "googledocs") m = _("Unable to preview the file from Google Docs.");
                        this.error(m)
                    }
                }, this);
                document.body.appendChild(r)
            }
        }
        if (this.type.indexOf("video/") == 0) {
            this.content.video._element.src = this.url;
            this.content.video._element.load();
            joli.bind(function () {
                this.url && this.content.video.show()
            }, this);
            console.log(this.content.video._element.readyState);
            this.interval = setInterval(joli.bind(function () {
                console.log("not loaded");
                if (!(this.content.video._element.readyState < 1)) {
                    clearInterval(this.interval);
                    this.interval = undefined;
                    console.log("loaded");
                    var m = this.content.video._element.videoWidth,
                        q = this.content.video._element.videoHeight;
                    console.log(this.content.video, m, q);
                    this.setSize(this.content.video._element, m, q, o, l);
                    if (m > 0 && q > 0) {
                        m = parseInt(this.content.video._element.style.width.replace("px", ""), 10) - 10;
                        this.content.progress.options.width = m;
                        this.content.progress.setSize(4, m);
                        this.content.progress.setMax(m);
                        this.content.progress._element.style.marginTop = "-20px";
                        this.content.video._element.play();
                        this.content.tooltip.hide();
                        this.content.video.show();
                        this.content.progress.show()
                    } else {
                        m = _("Unable to preview.");
                        if (h.service == "dropbox") m = _("Unable to preview the file from Dropbox.");
                        if (h.service == "googledocs") m = _("Unable to preview the file from Google Docs.");
                        this.error(m)
                    }
                }
            }, this), 50);
            n = 5E3;
            if (this.url.indexOf("api-content.dropbox.com") != -1) n = 1E4;
            if (this.url.indexOf("google.com") != -1) n = 2E4;
            setTimeout(joli.bind(function () {
                clearInterval(this.interval);
                if (this.interval) {
                    var m = _("Unable to preview.");
                    if (h.service == "dropbox") m = _("Unable to preview the file from Dropbox.");
                    if (h.service == "googledocs") m = _("Unable to preview the file from Google Docs.");
                    this.error(m);
                    this.interval = undefined
                }
            }, this), n)
        }
        if (this.type == "iframe" || this.type == "application/pdf") if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
            n = _("Unable to preview.");
            if (h.service == "dropbox") n = _("Unable to preview the file from Dropbox.");
            if (h.service == "googledocs") n = _("Unable to preview the file from Google Docs.");
            this.error(n)
        } else {
            n = document.createElement("iframe");
            n.src = h.preview;
            this.content.iframe._element.appendChild(n);
            this.setSize(this.content.iframe._element, o, l, o, l);
            this.content.tooltip.hide();
            this.content.iframe.show()
        }
    },
    setSize: function (a, b, c, d, g) {
        console.log("setSize", b, c, d, g);
        if (b + 14 > d || c + 78 > g) if (b + 14 > d && c + 78 > g) {
            var f = g * b / c;
            b = d * c / b;
            if (f > d) {
                this.content.style.width = d + 14 + "px";
                this.content.style.height = b + 78 + "px";
                a.style.width = d + "px";
                a.style.height = b + "px"
            } else {
                this.content.style.width = f + 14 + "px";
                this.content.style.height = g + 78 + "px";
                a.style.width = f + "px";
                a.style.height = g + "px"
            }
        } else if (b + 14 > d) {
            this.content.style.width = d + "px";
            this.content.style.height = (d - 14) * c / b + 78 + "px";
            a.style.width = d - 14 + "px";
            a.style.height = (d - 14) * c / b + "px"
        } else {
            if (c + 78 > g) {
                this.content.style.width = (g - 78) * b / c + 14 + "px";
                this.content.style.height = g + "px";
                a.style.width = (g - 78) * b / c + "px";
                a.style.height = g - 78 + "px"
            }
        } else {
            this.content.style.width = b + 14 + "px";
            this.content.style.height = c + 78 + "px";
            a.style.width = b + "px";
            a.style.height = c + "px"
        }
    },
    updateProgress: function (a) {
        var b = a.currentTime;
        a = a.duration;
        var c = this.content.progress.getMax();
        this.content.progress.setValue(Math.floor(b * c / a))
    },
    error: function (a) {
        this.content.audio._element.src = "";
        this.content.audio._element.pause();
        this.content.video._element.src = "";
        this.content.video._element.pause();
        this.content.body.innerHTML = "";
        this.content.iframe.innerHTML = "";
        this.content.iframe.hide();
        this.content.audio.hide();
        this.content.video.hide();
        this.content.progress._element.style.marginTop = "0px";
        this.content.progress.setValue(0);
        this.content.progress.hide();
        this.content.body.hide();
        this.content.style.width = "500px";
        this.content.style.height = "200px";
        this.content.tooltip.text = a;
        this.content.tooltip.show()
    }
});
launcher.ui.extend("AppDetails", joli.ui.Widget, {
    prepareToShow: function (a) {
        if (this.hasShown) a();
        else {
            this.hasShown = true;
            var b = this.options["package"];
            this.content.info.clear();
            joli.cloud.apps.id(b, joli.bind(function (c) {
                if (c) {
                    this.profile.setModel(c);
                    var d = c.type.charAt(0).toUpperCase() + c.type.slice(1);
                    if (c.user_generated) d = _("User Created Web App");
                    this.content.info.addItem(_("Type"), d);
                    this.content.info.addItem(_("Category"), "<a>" + _(c.category.name) + "</a>").onclick = joli.bind(function () {
                        joli.ui.root.events.directory();
                        joli.ui.root.content.directory.events.categories(null, "categories|" + c.category.label)
                    }, this);
                    c.publisher.name && c.publisher.url && this.content.info.addItem(_("Publisher"), '<a href="' + c.publisher.url + '" target="_blank">' + c.publisher.name + "</a>");
                    d = JSON.parse(c.support_links);
                    if (d.length == 0) {
                        this.tabs.getItem("support").hide();
                        this.content.support.list.innerHTML = ""
                    } else {
                        var g = "",
                            f, h;
                        for (h in d) {
                            f = d[h].url;
                            urlStripped = f.replace(/^http:\/\//g, "").toLowerCase();
                            g = d[h].title == "Facebook" ? g + '<li class="support-facebook"><a href="' + f + '" target="_blank">' + d[h].title + '<br /><span class="url">' + urlStripped + "</span></a></li>" : d[h].title == "Twitter" ? g + '<li class="support-twitter"><a href="' + f + '" target="_blank">' + d[h].title + '<br /><span class="url">' + urlStripped + "</span></a></li>" : g + '<li><a href="' + f + '" target="_blank">' + d[h].title + '<br /><span class="url">' + urlStripped + "</span></a></li>"
                        }
                        this.content.support.list.innerHTML = g;
                        this.tabs.getItem("support").show()
                    }
                    if (c.url) this.content.info.addItem(c.type == "web" ? _("URL") : _("Website"), '<a href="' + c.url + '" target="_blank">' + c.url.replace(/^http:\/\//g, "").toLowerCase() + "</a>");
                    var i = this.content.info.addItem(_("Friends who shared it"), "");
                    i.previousElementSibling.className = "friends-line";
                    i.className = "friends-line";
                    joli.cloud.apps.friendsThatLike(b, joli.bind(function (j) {
                        for (var l = joli.createElement("ul", {
                            "class": "follow-list"
                        }), o = this, n = j.length < 4 ? j.length : 4, r = 0; r < n; r++) {
                            var m = j[r],
                                q = joli.createElement("li"),
                                p = joli.createElement("a", {
                                    "data-username": m.username,
                                    title: m.name
                                }),
                                u = joli.createElement("span", {
                                    "class": "inset-light"
                                });
                            m = joli.createElement("img", {
                                src: joli.ui.Image.basePath + m.pictures.medium,
                                alt: m.name
                            });
                            var s = document.createElement("figure");
                            s.className = "user";
                            s.appendChild(u);
                            s.appendChild(m);
                            p.appendChild(s);
                            q.appendChild(p);
                            l.appendChild(q);
                            jQuery(p).click(function () {
                                o.trigger("showuser", [jQuery(this).attr("data-username")])
                            });
                            jQuery(p).mouseover(function (t) {
                                var v = jQuery(this).attr("title");
                                jQuery(this).attr("title", "");
                                jQuery(this).append('<div id="tooltip">' + v + "</div>");
                                jQuery("#tooltip").css("top", t.currentTarget.offsetTop + 30);
                                jQuery("#tooltip").css("left", t.currentTarget.offsetLeft)
                            }).mouseout(function () {
                                jQuery(this).attr("title", $("#tooltip").text());
                                jQuery(this).children("div#tooltip").remove()
                            })
                        }
                        if (j.length == 0) {
                            content = "<p>" + _("None of your friends shared it yet.") + "</p>";
                            i.innerHTML = content
                        } else i.appendChild(l)
                    }, this));
                    this.tabs.activate("info")
                }
            }, this));
            joli.cloud.joliserver.bind("requests_end", joli.bind(function () {
                this.profile.model && a()
            }, this))
        }
    }
});
launcher.ui.extend("Application", joli.ui.Widget, {
    onAttached: function () {
        this.checkIntegrity();
        window.onpopstate = joli.bind(function (a) {
            if (a.state) switch (a.state) {
            case "directory":
                this.events.directory(null, true);
                break;
            default:
                if (a.state.indexOf("search?q=") == 0) this.events.search(null, a.state.split("search?q=")[1], true);
                else {
                    this.events.menu(null, a.state, true);
                    this.content.showChild(a.state)
                }
            }
        }, this);
        window.onresize = joli.bind(function () {
            var a = joli.ui.root.outerHeight(),
                b = joli.ui.root.outerWidth();
            setTimeout(function () {
                a == joli.ui.root.outerHeight() && b == joli.ui.root.outerWidth() && joli.Events.publish("resize")
            }, 250)
        }, this);
        joli.system.websocketserver.bind_connection_changed(this.onSystemConnect);
        joli.system.websocketserverapt.bind_connection_changed(this.onSystemAptConnect);
        if (window.WebSocket) {
            joli.system.websocketserver.connect();
            joli.system.websocketserverapt.connect()
        }
        this.updatebox.title.text = _("Jolicloud Launcher has been updated.");
        this.updatebox.description.text = _("You can update now or get the new version the next time your restart.");
        this.checkAppCache();
        this.shutdownbox.title.text = _("Are you sure you want to quit your session?");
        this.shutdownbox.description.text = _("Please select one of the options below.");
        this.offline.hide();
        this.loader.css("visibility", "hidden");
        this.loader.removeClass("active");
        this.sync.css("visibility", "hidden");
        joli.cloud.joliserver.bind_connection_changed(this.connectionChanged.bind(this));
        joli.cloud.joliserver.bind("requests_changed", this.onRequestChanged.bind(this));
        joli.cloud.jolibackgroundserver.bind("requests_changed", this.onRequestChanged.bind(this));
        this.content.settings.prepareToShow(joli.doNothing);
        this.menu.activate("dashboard");
        this.$.find("header").hide();
        this.content.hide();
        joli.cloud.joliserver.bind("requests_end", joli.bind(function () {
            joli.Events.publish("resize");
            console.log("Application loading complete!");
            this.preloader.hide();
            this.preloader.removeClass("active");
            this.$.find("header").show();
            this.content.show()
        }, this));
        this.addClass(joli.browser().browser.toLowerCase())
    },
    checkUpdates: function () {
        if (!joli.live && !joli.guest) {
            var a = false;
            joli.system.packages.checkUpdates(true, {
                success: function (b) {
                    if (!a && b.status == "finished") {
                        a = true;
                        this.listPackagesAndSync()
                    }
                },
                error: function () {}
            }, this)
        }
    },
    getUpdates: function () {
        if (!joli.live && !joli.guest) {
            console.log("Retrieve Updates.");
            joli.raw_list_of_updates = undefined;
            joli.system.packages.listUpdates({
                success: function (a) {
                    console.log("success");
                    joli.raw_list_of_updates = a;
                    if (joli.computer.version && joli.computer.version.indexOf("1.0.6") == 0 && a.length > 200) {
                        joli.packages_to_update = [];
                        joli.ui.root.content.settings.update();
                        joli.ui.root.upgrade.show()
                    } else {
                        var b = [],
                            c = false;
                        joli.each(a, function (d) {
                            if (d.info != "blocked") {
                                if (d.name == "jolicloud-apt-config" || d.name == "jolicloud-apt-repository") c = true;
                                b.push(d)
                            }
                        }, this);
                        if (c) if (joli.versionCompare("1.1.15", joli.computer.version)) joli.system.apps.install("jolicloud-apt-config", null, {
                            complete: function () {
                                joli.system.apps.install("jolicloud-apt-repository", null, {
                                    complete: function () {
                                        joli.ui.root.checkUpdates()
                                    }
                                })
                            }
                        });
                        else joli.versionCompare("1.1.14", joli.computer.version) ? joli.system.apps.install("jolicloud-apt-config", {
                            complete: function () {
                                joli.system.apps.install("jolicloud-apt-repository", {
                                    complete: function () {
                                        joli.ui.root.checkUpdates()
                                    }
                                })
                            }
                        }) : joli.system.apps.installolddaemon("jolicloud-apt-config", {
                            complete: function () {
                                joli.system.apps.installolddaemon("jolicloud-apt-repository", {
                                    complete: function () {
                                        joli.ui.root.checkUpdates()
                                    }
                                })
                            }
                        });
                        else {
                            console.log("List of updates", b);
                            joli.packages_to_update = b;
                            joli.ui.root.content.settings.update();
                            joli.versionCompare("1.1.15", joli.computer.version) || joli.ui.root.sync.sync(true)
                        }
                        if (joli.packages_to_update && joli.packages_to_update.length == 0 && joli.computer.version && joli.computer.version.indexOf("1.0") == 0 && joli.computer.version.indexOf("1.0.6") != 0) {
                            joli.ui.root.processingbox.title.css("padding-top", "0px");
                            joli.ui.root.processingbox.title.text = "";
                            joli.ui.root.processingbox.description.text = _("Configuring your computer... Please wait, it can take several minutes. Your computer will then reboot. Thank you! - The Jolicloud Team");
                            joli.ui.root.processingbox.show();
                            joli.system.apps.launch("gksudo -m '" + _("We have found a configuration problem. Please enter your password to fix it. Your computer will then reboot. Thank you! - The Jolicloud Team") + "' \"bash -c 'dpkg --configure -a ; sed -i s/^/#/g /etc/apt/sources.list.d/vlc.list ; dpkg --configure -a ; apt-get update ; apt-get dist-upgrade -y ; reboot'\"", {
                                complete: function () {}
                            })
                        }
                    }
                },
                complete: function () {
                    console.log("complete");
                    if (joli.raw_list_of_updates === undefined) {
                        joli.packages_to_update = [];
                        joli.ui.root.content.settings.update()
                    }
                    if (joli.packages_to_update && joli.packages_to_update.length == 0 && joli.computer.version && joli.computer.version.indexOf("1.0") == 0 && joli.computer.version.indexOf("1.0.6") != 0) {
                        joli.ui.root.processingbox.title.css("padding-top", "0px");
                        joli.ui.root.processingbox.title.text = "";
                        joli.ui.root.processingbox.description.text = _("Configuring your computer... Please wait, it can take several minutes. Your computer will then reboot. Thank you! - The Jolicloud Team");
                        joli.ui.root.processingbox.show();
                        joli.system.apps.launch("gksudo -m '" + _("We have found a configuration problem. Please enter your password to fix it. Your computer will then reboot. Thank you! - The Jolicloud Team") + "' \"bash -c 'dpkg --configure -a ; sed -i s/^/#/g /etc/apt/sources.list.d/vlc.list ; dpkg --configure -a ; apt-get update ; apt-get dist-upgrade -y ; reboot'\"", {
                            complete: function () {}
                        })
                    }
                }
            }, this)
        } else joli.ui.root.content.settings.stack.content.content.device.tabs.getItem("updates").hide()
    },
    listPackagesAndSync: function () {
        if (joli.updates_ready_event)!joli.live && !joli.guest && joli.system.packages.startPrefetch();
        else this.getUpdates();
        joli.system.packages.list(function (a) {
            console.log("Receiving from daemon all packages, length: ", a.length);
            var b = [],
                c = false;
            joli.each(a, function (d) {
                b.push(d.name);
                if (d.name == "jolicloud-upgrader" && joli.computer.version.indexOf("1.0.6") == 0) c = true
            });
            if (c && !joli.live && !joli.guest && !joli.ui.root.sync.active) {
                joli.ui.root.upgrade.show();
                joli.cloud.apps.sync(b, joli.bind(function (d) {
                    console.log("Receiving data from server", d);
                    console.log("Packages to install, length: ", d.install.length);
                    joli.packages_to_install = d.install;
                    console.log("Packages to remove, length: ", d.remove.length);
                    joli.packages_to_remove = d.remove;
                    if (joli.packages_to_install.length > 0) {
                        joli.clearLocalRegExp("dashboard");
                        joli.dashboard.pager.data = undefined;
                        joli.dashboard.pager.redisplay()
                    }
                    if (joli.model.apps.instances) for (instance in joli.model.apps.instances) joli.model.apps.instances[instance].trigger_change();
                    joli.versionCompare("1.1.15", joli.computer.version) ? joli.ui.root.sync.sync(false) : joli.ui.root.sync.sync(true)
                }, this))
            } else joli.cloud.apps.sync(b, joli.bind(function (d) {
                console.log("Receiving data from server", d);
                console.log("Packages to install, length: ", d.install.length);
                joli.packages_to_install = d.install;
                console.log("Packages to remove, length: ", d.remove.length);
                joli.packages_to_remove = d.remove;
                if (joli.packages_to_install.length > 0) {
                    joli.clearLocalRegExp("dashboard");
                    joli.dashboard.pager.data = undefined;
                    joli.dashboard.pager.redisplay()
                }
                if (joli.model.apps.instances) for (instance in joli.model.apps.instances) joli.model.apps.instances[instance].trigger_change();
                if (joli.versionCompare("1.1.15", joli.computer.version)) {
                    console.log("Installing all web apps");
                    var g = [],
                        f = [];
                    joli.each(joli.packages_to_install, function (h) {
                        h.indexOf("jolicloud-webapp") == -1 ? g.push(h) : f.push(h)
                    });
                    joli.packages_to_install = g;
                    joli.each(f, function (h) {
                        joli.model.apps.instances[h] ? joli.model.apps.instances[h].install(true) : joli.cloud.apps.id(h, function () {
                            joli.model.apps.instances[h].install(true)
                        }, this)
                    });
                    console.log("Finished installing all web apps");
                    console.log("Native packages to install, length: ", joli.packages_to_install.length)
                }
                if (!joli.live && !joli.guest) {
                    joli.daemon_new_version && joli.packages_to_remove.length > 0 && this.synchronizationRemove();
                    joli.versionCompare("1.1.15", joli.computer.version) ? joli.ui.root.sync.sync(false) : joli.ui.root.sync.sync(true)
                }
            }, this))
        }, this)
    },
    liveSession: function () {
        joli.ui.root.content.settings.guestSession();
        if (joli.versionCompare("1.1.15", joli.computer.version)) joli.system.daemon.isGuest(function (a) {
            joli.guest = a || false;
            if (joli.guest) joli.ui.root.content.dashboard.displayNotice(_("You are running Joli OS as a guest. Your local changes will not be saved.") + ' <a href="http://help.jolicloud.com/entries/409583" target="_blank">' + _("More details") + "</a>.");
            else {
                joli.ui.root.content.dashboard.displayNotice(_("You are running Joli OS as a guest. Your local changes will not be saved.") + ' <a id="install-jolicloud" href="#">' + _("Install Joli OS now.") + '</a> <a id="keyboard-conf" href="#">' + _("Keyboard issue?") + "</a>");
                jQuery("#install-jolicloud").click(function () {
                    joli.system.apps.launch("ubiquity", {
                        complete: function () {
                            joli.ui.root.content.dashboard.displayNotice()
                        }
                    })
                });
                jQuery("#keyboard-conf").click(function () {
                    joli.system.apps.launch("gnome-keyboard-properties")
                })
            }
        });
        else {
            joli.ui.root.content.dashboard.displayNotice(_("You are running Joli OS in demo mode so your changes will not be saved.") + ' <a id="install-jolicloud" href="#">' + _("Install Joli OS now.") + '</a> <a id="keyboard-conf" href="#">' + _("Keyboard issue?") + "</a>");
            jQuery("#install-jolicloud").click(function () {
                joli.system.apps.launch("ubiquity", {
                    complete: function () {
                        joli.ui.root.content.dashboard.displayNotice()
                    }
                })
            });
            jQuery("#keyboard-conf").click(function () {
                joli.system.apps.launch("gnome-keyboard-properties")
            })
        }
    },
    differedCheckUpdates: function () {
        !joli.live && !joli.guest && setTimeout(joli.bind(function () {
            joli.system.websocketserver.connected && joli.cloud.joliserver.connected && !joli.upgrade ? this.checkUpdates() : this.differedCheckUpdates()
        }, this), 18E4)
    },
    synchronization: function () {
        joli.ui.root.content.files.getDrives();
        if (joli.cloud.joliserver.connected) if (joli.localJson("lastcheckupdates") || joli.versionCompare("1.1.15", joli.computer.version)) {
            this.listPackagesAndSync();
            joli.saveLocal("lastcheckupdates", {}, true);
            if (!joli.updates_ready_event) {
                console.log("no updates_ready_event, launching differedCheckUpdates");
                this.differedCheckUpdates()
            }
        } else {
            this.checkUpdates();
            joli.saveLocal("lastcheckupdates", {}, true)
        }
    },
    synchronizationRemove: function () {
        if (joli.packages_to_remove.length > 0) {
            var a = joli.packages_to_remove[0];
            if (a != "wine" && a != "brasero") joli.system.apps.remove(a, {
                complete: function () {
                    joli.packages_to_remove.splice(0, 1);
                    this.synchronizationRemove()
                }
            }, this);
            else {
                console.log("Skiping wine or brasero.");
                joli.packages_to_remove.splice(0, 1);
                this.synchronizationRemove()
            }
        } else joli.ui.root.checkFreeSpace()
    },
    checkFreeSpace: function () {
        joli.daemon_new_version = false;
        joli.system.websocketserver.connected && joli.system.info.all(function (a) {
            if (a.disk) {
                joli.daemon_new_version = true;
                a = a.disk.size_free / a.disk.size * 100;
                console.log("Free Space: ", a + "%");
                var b = _("Your device has less than 5% free space. Please free up some disk space.");
                if (a < 5) joli.ui.root.content.dashboard.displayNotice(b);
                else joli.ui.root.content.dashboard.notice.message.innerHTML == b && joli.ui.root.content.dashboard.displayNotice()
            }
        }, this)
    },
    updateBeforeQuit: function (a) {
        if (joli.packages_to_update && joli.packages_to_update.length > 0 && this.shutdownbox.form.updatetext.checkboxupdates._element.checked) {
            if (this.shutdownbox.form.progress._element.className.indexOf("show") == -1) {
                this.shutdownbox.form.updatetext.addClass("hide");
                this.shutdownbox.form.progress.addClass("show");
                this.shutdownbox.buttons.disable()
            }
            this.performUpdates(joli.bind(function () {
                this.shutdownbox.buttons.enable();
                a()
            }, this))
        } else a()
    },
    performUpdates: function (a) {
        joli.clearLocalRegExp("prefetch_ready");
        joli.system.packages.performUpdates({
            success: function (b) {
                a ? this.manageUpdate(b, false, a) : joli.ui.root.sync.manageUpdate(b, false)
            },
            error: function (b) {
                a ? this.manageUpdate(b, true, a) : joli.ui.root.sync.manageUpdate(b, true)
            }
        }, this)
    },
    manageUpdate: function (a, b, c) {
        if (b && c) c();
        else if (a.status === "finished" && c) {
            this.shutdownbox.form.progress.setValue(1);
            this.onUpdatesReady([]);
            c()
        } else {
            b = 0;
            if (a.status === "download") {
                b = a.progress;
                if (b > 1) b = 1;
                else if (b < 0) b = 0;
                if (this.shutdownbox.form.progress._element.className.indexOf("show") == -1) {
                    this.shutdownbox.form.updatetext.addClass("hide");
                    this.shutdownbox.form.progress.addClass("show")
                }
                this.shutdownbox.form.progress.setValue(b / 2)
            }
            if (a.status === "install") {
                b = a.progress;
                if (b > 1) b = 1;
                else if (b < 0) b = 0;
                if (this.shutdownbox.form.progress._element.className.indexOf("show") == -1) {
                    this.shutdownbox.form.updatetext.addClass("hide");
                    this.shutdownbox.form.progress.addClass("show")
                }
                this.shutdownbox.form.progress.setValue(b / 2 + 0.5)
            }
        }
    },
    onUpdatesReady: function (a) {
        console.log("received updates", a);
        var b = [],
            c = false;
        joli.each(a, function (d) {
            if (d.info != "blocked") {
                if (d.name == "jolicloud-apt-config" || d.name == "jolicloud-apt-repository") c = true;
                b.push(d)
            }
        }, this);
        if (c) joli.system.apps.install("jolicloud-apt-config", null, {
            complete: function () {
                joli.system.apps.install("jolicloud-apt-repository", null)
            }
        });
        else {
            console.log("List of updates", b);
            joli.packages_to_update = b;
            if (a = joli.localJson("prefetch_ready")) {
                a = new Date(a);
                new Date - a > 1728E5 && joli.ui.root.sync.sync(true)
            } else {
                a = new Date;
                joli.saveLocal("prefetch_ready", {}, '"' + a + '"')
            }
            joli.ui.root.content.settings.update()
        }
    },
    onSystemConnect: function (a, b) {
        joli.onsystemconnect = false;
        if (b) {
            joli.onsystemconnect = true;
            if (joli.integrityNotOk) {
                console.log("Killing nickel browser as the launcher's integrity is compromised.");
                joli.system.daemon.killNickel()
            }
            console.log("Application.onSystemConnect called: " + b);
            joli.system.events.register("devices/device_added", joli.ui.root.content.files.onDriveAdded);
            joli.system.events.register("devices/device_removed", joli.ui.root.content.files.onDriveRemoved);
            joli.system.events.register("devices/device_changed", joli.ui.root.content.files.onDriveChanged);
            joli.updates_ready_event = true;
            joli.ui.root.content.settings.stack.content.content.device.content.updates.syncstatus.checkupdatebutton.hide();
            joli.system.events.register("packages/updates_ready", {
                success: function (d) {
                    joli.ui.root.onUpdatesReady(d);
                    joli.ui.root.content.settings.stack.content.content.device.content.updates.syncstatus.checkupdatebutton.hide()
                },
                error: function () {
                    joli.updates_ready_event = false;
                    joli.ui.root.content.settings.stack.content.content.device.content.updates.syncstatus.checkupdatebutton.show()
                }
            }, this);
            joli.ui.root.checkFreeSpace();
            joli.system.localstorage.getItem("localapps", function (d) {
                if (d != "") {
                    d = JSON.parse(d);
                    joli.ui.root.content.dashboard.localapps = d;
                    joli.saveLocal("localapps", {}, joli.ui.root.content.dashboard.localapps);
                    joli.ui.root.content.dashboard.loadLocalApps()
                }
            }, this);
            joli.system.daemon.isLive(function (d) {
                joli.live = d || false;
                if (joli.live) {
                    joli.onsystemconnect = false;
                    joli.system.daemon.version(function (g) {
                        joli.computer = {
                            version: g
                        };
                        joli.ui.root.liveSession();
                        joli.ui.root.synchronization()
                    })
                } else joli.system.daemon.version(function (g) {
                    joli.system.daemon.computer(function (f) {
                        joli.computer = f;
                        joli.ui.root.content.settings.refreshDevices();
                        joli.computer.exists = false;
                        joli.computer.linked = false;
                        joli.computer.name = "";
                        joli.computer.error = false;
                        joli.computer.version = g;
                        joli.ui.root.content.dashboard.checkLocalsIcons();
                        joli.model.apps.instances.localapps && joli.model.apps.instances.localapps.trigger_change();
                        joli.model.apps.instances.localsettings && joli.model.apps.instances.localsettings.trigger_change();
                        if (joli.computer.version.indexOf("1.0") == 0) {
                            joli.ui.root.content.settings.stack.content.content.device.tabs.getItem("extra").show();
                            joli.ui.root.content.dashboard.displayNotice(_("Welcome to your new desktop! Joli OS 1.1 is coming very soon. You'll be notified when the upgrade is available."))
                        }
                        if (!joli.versionCompare("1.1.15", joli.computer.version)) {
                            joli.ui.root.content.dashboard.displayNotice(_("You are running an old version of Joli OS") + ', <a id="update-jolicloud-1-2" href="javascript:;">' + _("click here to update your system") + "</a>.");
                            jQuery("#update-jolicloud-1-2").click(function () {
                                joli.ui.root.sync.showUpdates()
                            })
                        }
                        if (f.oem) joli.computer.oem = f.oem;
                        if (joli.cloud.joliserver.connected && !joli.connectionchanged) joli.cloud.user.associateComputer(joli.computer.uuid, joli.computer.version, {
                            success: function (h) {
                                console.log("This computer is already associated.", h);
                                joli.computer.exists = true;
                                joli.computer.linked = true;
                                joli.ui.root.content.settings.refreshDevices();
                                joli.onsystemconnect = false;
                                joli.ui.root.synchronization()
                            },
                            error: function (h, i, j, l) {
                                joli.onsystemconnect = false;
                                console.log("error", i);
                                l = JSON.parse(i.responseText);
                                if (l.error.code != "NOT_FOUND") {
                                    joli.computer.exists = true;
                                    joli.cloud.computers.show(joli.computer.uuid, joli.computer.password, {
                                        success: function (o) {
                                            console.log("success", o);
                                            joli.computer.name = o.name;
                                            joli.ui.root.activation.show()
                                        },
                                        error: function () {
                                            joli.computer.error = _("Sorry, something is wrong with your computer configuration. Please contact us for help.");
                                            joli.ui.root.activation.show()
                                        }
                                    })
                                } else joli.ui.root.activation.show()
                            }
                        });
                        else {
                            console.log("Cloud server not connected or already processing connectionchanged, no need to perform onsystemconnect.");
                            joli.onsystemconnect = false
                        }
                    })
                })
            })
        } else {
            if (joli.model.apps.instances) for (instance in joli.model.apps.instances) {
                var c = joli.model.apps.instances[instance];
                if (c.installing) {
                    c.installing = false;
                    c.state = "installed";
                    c.added = true
                }
                if (c.removing) {
                    c.state = "removed";
                    c.removing = false
                }
                c.trigger_change()
            }
            joli.ui.root.sync.clear()
        }
        if (joli.model.apps.instances) for (instance in joli.model.apps.instances) joli.model.apps.instances[instance].trigger_change()
    },
    onSystemAptConnect: function (a, b) {
        if (b) {
            console.log("Connected on APT daemon.");
            joli.system.apps.install = joli.system.appsapt.install;
            joli.system.apps.remove = joli.system.appsapt.remove;
            joli.system.packages.list = joli.system.packagesapt.list;
            joli.system.packages.checkUpdates = joli.system.packagesapt.checkUpdates;
            joli.system.packages.listUpdates = joli.system.packagesapt.listUpdates;
            joli.system.packages.performUpdates = joli.system.packagesapt.performUpdates
        }
    },
    onRequestChanged: function (a) {
        var b = /ping|stats\/add/,
            c;
        for (c in a.target.requests) if (!b.test(c)) {
            this.loader.css("visibility", "visible");
            this.loader.addClass("active");
            return
        }
        this.loader.css("visibility", "hidden");
        this.loader.removeClass("active")
    },
    connectionChanged: function (a, b) {
        console.log("connectionChanged called");
        joli.connectionchanged = false;
        this.add.enabled = b;
        if (this.menu.getItem("stream").enabled = b) {
            joli.connectionchanged = true;
            this.offline.hide();
            if (joli.system.websocketserver.connected && !joli.onsystemconnect) joli.system.daemon.isLive(function (d) {
                joli.live = d || false;
                if (joli.live) {
                    joli.connectionchanged = false;
                    joli.ui.root.liveSession();
                    joli.ui.root.synchronization()
                } else joli.system.daemon.version(function (g) {
                    joli.system.daemon.computer(function (f) {
                        joli.computer = f;
                        joli.ui.root.content.settings.refreshDevices();
                        joli.computer.exists = false;
                        joli.computer.linked = false;
                        joli.computer.name = "";
                        joli.computer.error = false;
                        joli.computer.version = g;
                        joli.cloud.user.associateComputer(joli.computer.uuid, joli.computer.version, {
                            success: function (h) {
                                console.log("This computer is already associated.", h);
                                joli.computer.exists = true;
                                joli.computer.linked = true;
                                joli.ui.root.content.settings.refreshDevices();
                                joli.connectionchanged = false;
                                joli.ui.root.synchronization()
                            },
                            error: function (h, i, j, l) {
                                joli.connectionchanged = false;
                                console.log("error", i);
                                l = JSON.parse(i.responseText);
                                if (l.error.code != "NOT_FOUND") {
                                    joli.computer.exists = true;
                                    joli.cloud.computers.show(joli.computer.uuid, joli.computer.password, {
                                        success: function (o) {
                                            console.log("success", o);
                                            joli.computer.name = o.name;
                                            joli.ui.root.activation.show()
                                        },
                                        error: function () {
                                            joli.computer.error = _("Sorry, something is wrong with your computer configuration. Please contact us for help.");
                                            joli.ui.root.activation.show()
                                        }
                                    })
                                } else joli.ui.root.activation.show()
                            }
                        })
                    })
                })
            });
            else {
                console.log("Websocket server not connected or already processing onsystemconnect, no need to perform connectionChanged.");
                joli.connectionchanged = false
            }
        } else {
            this.offline.show();
            if (!this.content.current || !this.content.current._varname || this.content.current._varname != "files" && this.content.current._varname != "settings") {
                this.events.menu(null, "dashboard");
                this.content.showChild("dashboard")
            }
            if (joli.model.apps.instances) for (instance in joli.model.apps.instances) {
                var c = joli.model.apps.instances[instance];
                if (c.installing) {
                    c.installing = false;
                    c.state = "installed";
                    c.added = true
                }
                if (c.removing) {
                    c.state = "removed";
                    c.removing = false
                }
                c.trigger_change()
            }
            joli.ui.root.sync.clear()
        }
        console.log("connectionChanged " + b);
        this.content.dashboard.pager.redisplay()
    },
    events: {
        menu: function (a, b, c) {
            this.add.active = false;
            this.menu.deactivate();
            this.menu.getItem(b).active = true;
            if (c === undefined) this.onScreenChanged(b)
        },
        directory: function (a, b) {
            this.add.active = true;
            this.menu.deactivate();
            this.content.showChild("directory");
            if (b === undefined) this.onScreenChanged("directory")
        },
        noticlose: function () {
            joli.ui.root.content.dashboard.notice.$.removeClass("showing");
            joli.ui.root.content.dashboard.notice.$.addClass("hiding");
            joli.ui.root.content.dashboard.notice.hide()
        },
        search: function (a, b, c) {
            this.add.active = false;
            this.menu.deactivate();
            this.content.showChild("search");
            this.content.search.setQuery(b);
            if (c === undefined) this.onScreenChanged("search?q=" + b)
        },
        modalbox: function (a, b) {
            ({
                cancel: function () {
                    this.power.deactivate();
                    this.shutdownbox.buttons.deactivate();
                    this.shutdownbox.hide();
                    this.previewbox.close()
                },
                logout: function () {
                    this.updateBeforeQuit(joli.bind(function () {
                        var c = this,
                            d = function () {
                                joli.system.session.logout();
                                if (joli.system.websocketserver.connected) {
                                    c.processingbox.title.css("padding-top", "0px");
                                    c.processingbox.title.text = "";
                                    c.processingbox.description.text = _("Logging out... Please wait.");
                                    c.processingbox.show()
                                }
                            };
                        joli.ui.root.content.settings.capabilities.indexOf("guestmode") != -1 && jQuery("#guestmodecheckbox")[0].checked ? joli.system.preferences.migrateConnections("enable", {
                            complete: d
                        }, this) : d()
                    }, this))
                },
                sleep: function () {
                    this.updateBeforeQuit(joli.bind(function () {
                        if (joli.system.websocketserver.connected) {
                            this.processingbox.title.css("padding-top", "0px");
                            this.processingbox.title.text = "";
                            this.processingbox.description.text = _("Going to sleep... Please wait.");
                            this.processingbox.show()
                        }
                        joli.system.session.sleep({
                            complete: function () {
                                this.power.deactivate();
                                this.shutdownbox.buttons.deactivate();
                                this.shutdownbox.hide();
                                this.processingbox.hide();
                                this.shutdownbox.form.updatetext.removeClass("hide");
                                this.shutdownbox.form.progress.removeClass("show")
                            }
                        }, this)
                    }, this))
                },
                restart: function () {
                    this.updateBeforeQuit(joli.bind(function () {
                        var c = this,
                            d = function () {
                                joli.system.session.restart();
                                if (joli.system.websocketserver.connected) {
                                    c.processingbox.title.css("padding-top", "0px");
                                    c.processingbox.title.text = "";
                                    c.processingbox.description.text = _("Restarting... Please wait.");
                                    c.processingbox.show()
                                }
                            };
                        joli.ui.root.content.settings.capabilities.indexOf("guestmode") != -1 && jQuery("#guestmodecheckbox")[0].checked ? joli.system.preferences.migrateConnections("enable", {
                            complete: d
                        }, this) : d()
                    }, this))
                },
                shutdown: function () {
                    this.updateBeforeQuit(joli.bind(function () {
                        var c = this,
                            d = function () {
                                joli.system.session.shutdown();
                                if (joli.system.websocketserver.connected) {
                                    c.processingbox.title.css("padding-top", "0px");
                                    c.processingbox.title.text = "";
                                    c.processingbox.description.text = _("Shutting down... Please wait.");
                                    c.processingbox.show()
                                }
                            };
                        joli.ui.root.content.settings.capabilities.indexOf("guestmode") != -1 && jQuery("#guestmodecheckbox")[0].checked ? joli.system.preferences.migrateConnections("enable", {
                            complete: d
                        }, this) : d()
                    }, this))
                }
            })[b].call(this, a);
            a.preventDefault()
        },
        power: function () {
            if (navigator.userAgent.indexOf("Jolicloud") == -1 && !joli.system.websocketserver.connected) window.location.href = "/logout";
            else {
                if (joli.guest) {
                    this.shutdownbox.description.text = _("Once you log out, all your local data will be erased.");
                    this.shutdownbox.buttons.getItem("sleep").hide();
                    this.shutdownbox.buttons.getItem("restart").hide();
                    this.shutdownbox.buttons.getItem("shutdown").hide()
                } else {
                    this.shutdownbox.description.text = _("Please select one of the options below.");
                    this.shutdownbox.buttons.getItem("sleep").show();
                    this.shutdownbox.buttons.getItem("restart").show();
                    this.shutdownbox.buttons.getItem("shutdown").show()
                }
                joli.system.session.properties(function (a) {
                    a.CanSuspend == 0 && this.shutdownbox.buttons.getItem("sleep").hide()
                }, this);
                !joli.live && !joli.guest && joli.packages_to_update && joli.packages_to_update.length > 0 ? this.shutdownbox.form.show() : this.shutdownbox.form.hide();
                this.shutdownbox.show()
            }
        },
        updateapp: function () {
            this.updatebox.show()
        },
        updatebox: function (a, b) {
            ({
                cancel: function () {
                    this.updatebox.buttons.deactivate();
                    this.updatebox.hide()
                },
                update: function () {
                    localStorage.clear();
                    window.location.reload()
                }
            })[b].call(this, a);
            a.preventDefault()
        },
        offlinebox: function (a, b) {
            ({
                connect: function () {
                    localStorage.clear();
                    window.location.reload()
                }
            })[b].call(this, a);
            a.preventDefault()
        },
        stack_child: function (a, b) {
            if (!a.stackChild) a.stackChild = {
                app: function () {
                    return joli.ui("launcher/appdetails", {
                        "package": b["package"]
                    })
                },
                user: function () {
                    return joli.ui("launcher/userdetails", {
                        username: b.username
                    })
                }
            }[b.type]()
        }
    },
    onScreenChanged: function (a) {
        window.history.pushState(a, a, "#!/" + a)
    },
    setState: function (a) {
        this.content.showChild(a)
    },
    checkAppCache: function () {
        self = this;
        var a = window.applicationCache;
        switch (a.status) {
        case 0:
            console.log("Cache status: Uncached");
            break;
        case 1:
            console.log("Cache status: Idle");
            break;
        case 2:
            console.log("Cache status: Checking");
            break;
        case 3:
            console.log("Cache status: Downloading");
            break;
        case 4:
            console.log("Cache status: Updateready");
            break;
        case 5:
            console.log("Cache status: Obsolete");
            break;
        default:
            console.log("Cache status: Unknown")
        }
        a.addEventListener("progress", function () {
            console.log("Cache status: Downloading cache...")
        }, false);
        a.addEventListener("cached", function () {
            console.log("Cache status: Cache has finished downloading");
            try {
                a.swapCache();
                joli.config.debug && self.trigger("updateapp")
            } catch (b) {}
        }, false);
        a.addEventListener("noupdate", function () {
            console.log("Cache status: No update to cache found")
        }, false);
        a.addEventListener("updateready", function () {
            console.log("Cache status: Cache has been updated due to a change found in the manifest");
            try {
                a.swapCache();
                joli.config.debug && self.trigger("updateapp")
            } catch (b) {}
        }, false);
        a.addEventListener("error", function () {
            console.log("Cache status: You're either offline or something has gone horribly wrong. Possible explanation: The manifest was a 404 or 410 page, so the attempt to cache the application has been aborted. The manifest hadn't changed, but the page referencing the manifest failed to download properly. A fatal error occurred while fetching the resources listed in the manifest. The manifest changed while the update was being run.")
        }, false);
        a.addEventListener("checking", function () {
            console.log("Checking cache event.")
        }, false);
        a.addEventListener("downloading", function () {
            console.log("Downloading cache event.")
        }, false);
        a.addEventListener("obsolete", function () {
            console.log("Cache is obsolete. :(")
        }, false);
        document.addEventListener("contextmenu", function (b) {
            joli.config.disableContextMenu && b.target.nodeName != "INPUT" && b.target.nodeName != "TEXTAREA" && b.preventDefault()
        }, false)
    },
    checkIntegrity: function () {
        joli.integrityNotOk = false;
        if (navigator.userAgent.toLowerCase().indexOf("jolicloud") != -1) {
            var a = document.createElement("div");
            document.body.appendChild(a);
            var b = false,
                c;
            a.className = "testTransitionElement";
            a.addEventListener("webkitTransitionEnd", function () {
                console.log("End of webkitTransitionEnd test.");
                b = true;
                clearTimeout(c)
            }, false);
            a.addEventListener("transitionend", function () {
                console.log("End of transitionend test.");
                b = true;
                clearTimeout(c)
            }, false);
            setTimeout(joli.bind(function () {
                a.style.top = "10px";
                c = setTimeout(joli.bind(function () {
                    console.log("TransitionEnd event is fucked up?", !b);
                    if (!b) {
                        joli.integrityNotOk = true;
                        if (joli.system.websocketserver.connected) {
                            console.log("Killing nickel browser as the launcher's integrity is compromised.");
                            joli.system.daemon.killNickel()
                        }
                    }
                    document.body.removeChild(a)
                }, this), 500)
            }, this), 1)
        }
        var d, g, f;
        joli.each(document.styleSheets, function (h) {
            h.rules && joli.each(h.rules, function (i) {
                if (i && i.style && i.style.backgroundImage) {
                    i = i.style.backgroundImage;
                    if (i.indexOf("data:image/png;base64") != -1) {
                        element = i.replace("url(", "");
                        element = element.split(")")[0];
                        d = document.createElement("canvas");
                        g = d.getContext("2d");
                        f = new Image;
                        f.src = element;
                        d.width = f.width;
                        d.height = f.height;
                        g.drawImage(f, 0, 0);
                        d.toDataURL()
                    }
                }
            })
        })
    }
});
launcher.ui.extend("Activation", joli.ui.Modalbox, {
    events: {
        retry: function () {
            window.location.href = window.location.protocol + "//" + window.location.hostname
        },
        support: function () {
            window.open("http://www.jolicloud.com/support")
        },
        start: function () {
            this.content.swap.step1.otherfieldhelp.css("opacity", "0");
            this.content.activationprogress.progressbar.currentprogress.css("width", "25%");
            this.content.swap.showChild("step1")
        },
        begin: function () {
            this.content.swap.step1.otherfieldhelp.css("opacity", "0");
            this.content.title.text = _("Describe your device");
            this.content.activationprogress.progressbar.css("opacity", "1");
            this.content.activationprogress.progressbar.currentprogress.css("width", "25%");
            this.content.swap.showChild("step1")
        },
        begin2: function () {
            this.content.activationprogress.progressbar.css("opacity", "1");
            this.content.activationprogress.progressbar.currentprogress.css("width", "50%");
            this.content.swap.showChild("step6")
        },
        type: function () {
            this.content.swap.step1.otherfieldhelp.css("opacity", "0");
            if (this.devicetypeoriginal) if (this.devicetypeoriginal == "other" && this.content.swap.step1.otherfield.othername.val() == "") this.content.swap.step1.otherfieldhelp.css("opacity", "1");
            else {
                if (this.devicetypeoriginal == "other") this.devicetype = this.devicetypeoriginal + " - " + this.content.swap.step1.otherfield.othername.val();
                this.content.swap.step2.otherfieldhelp.css("opacity", "0");
                this.content.title.text = _("Define your model");
                this.content.activationprogress.progressbar.currentprogress.css("width", "50%");
                this.content.swap.showChild("step2")
            } else this.content.swap.step2.otherfieldhelp.css("opacity", "1")
        },
        brandmodel: function () {
            this.content.swap.step2.otherfieldhelp.css("opacity", "0");
            if (this.modelid && this.modelvalue) if (this.modelvalue == "Other" && this.content.swap.step2.otherfield.othermodel.val() == "") this.content.swap.step2.otherfieldhelp.css("opacity", "1");
            else {
                this.content.swap.step3.otherfieldhelp.css("opacity", "0");
                this.content.title.text = _("Name your computer");
                this.othermodel = this.content.swap.step2.otherfield.othermodel.val();
                this.content.activationprogress.progressbar.currentprogress.css("width", "75%");
                this.content.swap.showChild("step3")
            } else this.content.swap.step2.otherfieldhelp.css("opacity", "1")
        },
        nameit: function () {
            this.content.swap.step3.otherfieldhelp.css("opacity", "0");
            if (this.content.swap.step3.devicename.val() != "") {
                joli.computer.name = this.content.swap.step3.devicename.val();
                joli.cloud.computers.create(joli.computer.uuid, joli.computer.password, joli.computer.name, this.modelid, this.devicetype, this.othermodel, joli.computer.version, {
                    success: function () {
                        joli.clearLocalRegExp("computers");
                        joli.ui.root.content.settings.refreshDevices();
                        joli.computer.exists = true;
                        joli.computer.linked = true;
                        this.content.title.text = _("Thank You");
                        this.content.activationprogress.progressbar.currentprogress.css("width", "100%");
                        this.content.swap.showChild("step4");
                        joli.ui.root.synchronization()
                    },
                    error: function () {
                        this.content.activationprogress.progressbar.currentprogress.addClass("red");
                        this.content.activationprogress.progressbar.currentprogress.css("width", "100%");
                        this.content.swap.showChild("error")
                    }
                }, this)
            } else this.content.swap.step3.otherfieldhelp.css("opacity", "1")
        },
        associate: function () {
            joli.cloud.computers.associate(joli.computer.uuid, joli.computer.password, true, joli.computer.version, {
                success: function () {
                    joli.clearLocalRegExp("computers");
                    joli.ui.root.content.settings.refreshDevices();
                    this.content.title.text = _("Thank You");
                    this.content.activationprogress.progressbar.currentprogress.css("width", "100%");
                    this.content.swap.showChild("step7");
                    joli.ui.root.synchronization()
                },
                error: function () {
                    this.content.activationprogress.progressbar.currentprogress.addClass("red");
                    this.content.activationprogress.progressbar.currentprogress.css("width", "100%");
                    this.content.swap.showChild("error")
                }
            }, this)
        },
        close: function () {
            joli.activation = false;
            this.hide()
        },
        oemclose: function () {
            if (this.content.swap.oem.devicename.val() != "") {
                joli.computer.name = this.content.swap.oem.devicename.val();
                var a, b;
                if (joli.computer.oem) {
                    b = joli.computer.oem.type;
                    joli.each(this.oemManufacturers, function (c) {
                        c.name.toLowerCase() == joli.computer.oem.manufacturer.toLowerCase() && joli.each(c.models, function (d) {
                            if (d.name.toLowerCase() == joli.computer.oem.model.toLowerCase()) a = d.id
                        }, this)
                    }, this);
                    joli.cloud.computers.create(joli.computer.uuid, joli.computer.password, joli.computer.name, a, b, "", joli.computer.version, {
                        success: function () {
                            joli.clearLocalRegExp("computers");
                            joli.ui.root.content.settings.refreshDevices();
                            joli.computer.exists = true;
                            joli.computer.linked = true;
                            joli.clearLocalRegExp("/dashboard");
                            joli.ui.root.content.dashboard.pager.data = undefined;
                            joli.ui.root.content.dashboard.pager.redisplay(joli.bind(function () {
                                joli.activation = false;
                                this.hide();
                                joli.ui.root.synchronization()
                            }, this))
                        },
                        error: function () {
                            this.content.activationprogress.progressbar.currentprogress.addClass("red");
                            this.content.activationprogress.progressbar.currentprogress.css("width", "100%");
                            this.content.swap.showChild("error")
                        }
                    }, this)
                } else {
                    this.content.activationprogress.progressbar.currentprogress.addClass("red");
                    this.content.activationprogress.progressbar.currentprogress.css("width", "100%");
                    this.content.swap.showChild("error")
                }
            } else this.content.swap.oem.otherfieldhelp.css("opacity", "1")
        }
    },
    show: function () {
        this._super.apply(this, arguments);
        joli.activation = true;
        if (joli.computer.error) {
            this.content.title.text = _("Associate this computer");
            this.content.activationprogress.progressbar.currentprogress.addClass("red");
            this.content.activationprogress.progressbar.currentprogress.css("width", "100%");
            this.content.swap.showChild("error")
        } else if (joli.computer.oem && !joli.computer.exists) {
            this.content.css("height", "382px");
            this.content.title.text = _("Welcome!");
            this.content.activationprogress.progressbar.css("opacity", "0");
            this.content.activationprogress.progressbar.currentprogress.css("width", "100%");
            joli.cloud.apps.oemapps();
            joli.cloud.joliserver.computerOemManufacturers(function (a) {
                this.oemManufacturers = a;
                this.content.swap.showChild("oem")
            }, this)
        } else if (joli.computer.exists) {
            joli.computer.oem && joli.cloud.apps.oemapps({
                success: function () {
                    joli.clearLocalRegExp("/dashboard");
                    joli.ui.root.content.dashboard.pager.data = undefined;
                    joli.ui.root.content.dashboard.pager.redisplay()
                }
            });
            this.content.title.text = _("Associate this computer");
            this.content.activationprogress.progressbar.css("opacity", "0");
            this.content.activationprogress.progressbar.currentprogress.css("width", "0%");
            this.content.swap.showChild("step5");
            this.content.swap.step6.description.devicename.text = joli.computer.name
        } else {
            this.content.title.text = _("Associate this computer");
            this.content.activationprogress.progressbar.css("opacity", "0");
            this.content.activationprogress.progressbar.currentprogress.css("width", "0%");
            this.content.swap.step1.netbook.click(function () {
                this.clearSelectedType();
                this.content.swap.step1.netbook.addClass("selected");
                this.devicetype = this.devicetypeoriginal = "netbook";
                this.content.swap.step1.otherfield.css("opacity", "0")
            }, this);
            this.content.swap.step1.laptop.click(function () {
                this.clearSelectedType();
                this.content.swap.step1.laptop.addClass("selected");
                this.devicetype = this.devicetypeoriginal = "laptop";
                this.content.swap.step1.otherfield.css("opacity", "0")
            }, this);
            this.content.swap.step1.desktop.click(function () {
                this.clearSelectedType();
                this.content.swap.step1.desktop.addClass("selected");
                this.devicetype = this.devicetypeoriginal = "desktop";
                this.content.swap.step1.otherfield.css("opacity", "0")
            }, this);
            this.content.swap.step1.other.click(function () {
                this.clearSelectedType();
                this.content.swap.step1.other.addClass("selected");
                this.devicetype = this.devicetypeoriginal = "other";
                this.content.swap.step1.otherfield.css("opacity", "1")
            }, this);
            this.content.swap.showChild("step0");
            this.content.swap.step2.otherfieldhelp.text = _("There is an error in listing the models, press F5 to retry.");
            this.content.swap.step2.otherfieldhelp.css("opacity", "1");
            joli.cloud.joliserver.computerManufacturers(function (a) {
                this.processManufacturers(a)
            }, this)
        }
    },
    processManufacturers: function (a) {
        function b(c, d) {
            if (c.name.toLowerCase() == "other") return 1;
            if (d.name.toLowerCase() == "other") return -1;
            if (c.name.toLowerCase() < d.name.toLowerCase()) return -1;
            if (c.name.toLowerCase() > d.name.toLowerCase()) return 1;
            return 0
        }
        console.log("processManufacturers", a);
        if (a.length > 0) this.content.swap.step2.otherfieldhelp.text = _("Please tell us the brand and/or model you're using.");
        this.manufacturers = a.sort(b);
        joli.each(this.manufacturers, function (c) {
            var d = document.createElement("option");
            d.text = c.name;
            d.value = c.id;
            this.content.swap.step2.brands._element.add(d, null)
        }, this);
        this.content.swap.step2.brands._element.onchange = joli.bind(function () {
            this.content.swap.step2.otherfieldhelp.css("opacity", "0");
            this.content.swap.step2.otherfield.css("opacity", "0");
            for (this.content.swap.step2.modelscontainer.css("opacity", "1"); this.content.swap.step2.modelscontainer.models._element.hasChildNodes();) this.content.swap.step2.modelscontainer.models._element.removeChild(this.content.swap.step2.modelscontainer.models._element.childNodes[0]);
            joli.each(this.manufacturers, function (c) {
                if (c.id == this.content.swap.step2.brands._element.options[this.content.swap.step2.brands._element.selectedIndex].value) {
                    c = c.models.sort(b);
                    joli.each(c, function (d) {
                        var g = document.createElement("option");
                        g.text = d.name;
                        g.value = d.id;
                        this.content.swap.step2.modelscontainer.models._element.add(g, null)
                    }, this)
                }
            }, this)
        }, this);
        this.content.swap.step2.modelscontainer.models._element.onchange = joli.bind(function () {
            this.content.swap.step2.otherfieldhelp.css("opacity", "0");
            var c = this.content.swap.step2.modelscontainer.models._element.options[this.content.swap.step2.modelscontainer.models._element.selectedIndex];
            if (c) {
                this.modelid = c.value;
                this.modelvalue = c.text;
                if (c && c.text == "Other") {
                    this.content.swap.step2.otherfield.css("opacity", "1");
                    c = _("Tell us more about your") + " " + this.devicetype + ".";
                    if (this.devicetype == "other") c = _("Tell us more about your") + " " + this.content.swap.step1.otherfield.othername.val() + ".";
                    this.content.swap.step2.otherfield.othermodel._element.placeholder = c
                } else this.content.swap.step2.otherfield.css("opacity", "0")
            }
        }, this)
    },
    clearSelectedType: function () {
        this.content.swap.step1.otherfieldhelp.css("opacity", "0");
        this.content.swap.step1.netbook.removeClass("selected");
        this.content.swap.step1.laptop.removeClass("selected");
        this.content.swap.step1.desktop.removeClass("selected");
        this.content.swap.step1.other.removeClass("selected")
    }
});
launcher.ui.extend("Upgrade", joli.ui.Modalbox, {
    on_cellular: false,
    on_battery: false,
    space_left: 0,
    state: "stop",
    events: {
        cancel: function () {
            this.state = "stop";
            joli.refreshDisabled = false;
            this.clearEvents();
            joli.upgrade = false;
            this.hide()
        },
        upgrade: function () {
            this.upgrade();
            this.content.swap.showChild("step2")
        }
    },
    show: function () {
        if (!joli.upgrade) {
            this._super.apply(this, arguments);
            joli.refreshDisabled = false;
            this.clearEvents();
            joli.upgrade = true;
            joli.system.network.onCellularNetwork(joli.bind(function (a) {
                this.on_cellular = a;
                console.log(this);
                this.on_cellular ? this.content.swap.step1.connection.removeClass("selected") : this.content.swap.step1.connection.addClass("selected")
            }, this));
            joli.system.events.register("network/state_changed", joli.bind(function (a) {
                if (a.state == "CONNECTED") joli.system.network.onCellularNetwork(joli.bind(function (b) {
                    (this.on_cellular = b) ? this.content.swap.step1.connection.removeClass("selected") : this.content.swap.step1.connection.addClass("selected")
                }, this));
                else {
                    this.clearEvents();
                    this.content.swap.showChild("nonetwork")
                }
            }, this));
            joli.system.session.onBattery(joli.bind(function (a) {
                (this.on_battery = a) ? this.content.swap.step1.battery.removeClass("selected") : this.content.swap.step1.battery.addClass("selected")
            }, this));
            joli.system.events.register("session/changed", joli.bind(function (a) {
                if (a.properties.OnBattery == 1) {
                    this.on_battery = true;
                    this.content.swap.step1.battery.removeClass("selected")
                } else {
                    this.on_battery = false;
                    this.content.swap.step1.battery.addClass("selected")
                }
            }, this));
            joli.system.info.disk(joli.bind(function (a) {
                this.space_left = a;
                if (this.space_left.size_free < 1048576E3) {
                    this.clearEvents();
                    this.content.swap.showChild("nospace")
                } else {
                    this.content.swap.step1.space.addClass("selected");
                    this.content.swap.showChild("step1")
                }
            }, this));
            this.content.swap.showChild("step1")
        }
    },
    clearEvents: function () {
        joli.system.events.unregister("network/state_changed");
        joli.system.events.unregister("session/changed")
    },
    upgrade: function () {
        this.clearEvents();
        joli.system.session.inhibitScreensaver(_("Upgrade to 1.1"));
        joli.refreshDisabled = true;
        joli.system.apps.launch("sudo /usr/bin/jolicloud-upgrader")
    }
});
launcher.ui.extend("Profile", joli.ui.Widget, {
    initWidget: function () {
        this.action.click(function () {
            if (this.model.first_name !== undefined) {
                this.model.subscribed ? joli.cloud.user.unfollow("user", this.model.username, joli.bind(function () {
                    joli.clearLocalRegExp(this.model.username);
                    joli.clearLocalRegExp("actions?");
                    joli.clearLocalRegExp("subscriptions?");
                    joli.clearLocalRegExp("subscribers?");
                    joli.clearLocalRegExp("friends_likes?");
                    joli.clearLocalRegExp("myself");
                    this.action.label.text = _("Follow");
                    this.action.$.addClass("follow");
                    this.action.$.removeClass("unfollow");
                    this.trigger("refreshContent");
                    this.model.subscribed = false
                }, this)) : joli.cloud.user.follow("user", this.model.username, joli.bind(function () {
                    joli.clearLocalRegExp(this.model.username);
                    joli.clearLocalRegExp("actions?");
                    joli.clearLocalRegExp("subscriptions?");
                    joli.clearLocalRegExp("subscribers?");
                    joli.clearLocalRegExp("friends_likes?");
                    joli.clearLocalRegExp("myself");
                    this.action.label.text = _("Unfollow");
                    this.action.$.addClass("unfollow");
                    this.action.$.removeClass("follow");
                    this.trigger("refreshContent");
                    this.model.subscribed = true
                }, this));
                return false
            } else this.model.install(false)
        }, this);
        this.star.click(function () {
            if (this.model.first_name === undefined) {
                this.model.liked ? joli.cloud.apps.unlike(this.model["package"], joli.bind(function () {
                    this.model.liked = false;
                    this.model.likes -= 1;
                    this.star.addClass("unstarred");
                    this.star.text = this.model.likes;
                    joli.clearLocalRegExp(this.model["package"]);
                    joli.clearLocalRegExp("apps/favorites?")
                }, this)) : joli.cloud.apps.like(this.model["package"], joli.bind(function () {
                    this.model.liked = true;
                    this.model.likes += 1;
                    this.star.removeClass("unstarred");
                    this.star.text = this.model.likes;
                    joli.clearLocalRegExp(this.model["package"]);
                    joli.clearLocalRegExp("apps/favorites?")
                }, this));
                joli.ui.root.content.dashboard.saveDashboard()
            }
        }, this);
        this.report.click(function () {
            this.model.first_name === undefined && joli.cloud.apps.report(this.model["package"], joli.bind(function () {
                this.report.text = "Your report has been send to Jolicloud. Thank you."
            }, this))
        }, this)
    },
    onModelChanged: function (a) {
        if (a.first_name !== undefined) {
            this.report.hide();
            this.star.hide();
            this.badges.clear();
            a.badges.length > 0 ? joli.each(a.badges, function (b) {
                var c = this.badges.addItem();
                c.text = b.title;
                c._element.setAttribute("title", b.description);
                c.addClass(b.key)
            }, this) : this.badges.hide();
            this.name.text = a.name;
            this.description.text = a.about;
            this.icon.src = a.pictures.large;
            this.icon.$.parent().addClass("user");
            this.devices.text = a.devices;
            if (a.me) this.action.hide();
            else if (a.subscribed) {
                this.action.label.text = _("Unfollow");
                this.action.$.addClass("unfollow");
                this.action.$.removeClass("follow")
            } else {
                this.action.label.text = _("Follow");
                this.action.$.addClass("follow");
                this.action.$.removeClass("unfollow")
            }
        } else if (a.model) {
            this.report.hide();
            this.action.hide();
            this.star.hide();
            this.devices.hide();
            this.badges.hide();
            if (a.model == "browser") {
                this.name.text = a.name + " " + _("Web Browser");
                this.description.text = a.description
            } else {
                this.name.text = a.description;
                this.description.text = ""
            }
            if (a.model == "browser") switch (a.name) {
            case "Chrome":
                this.icon.src = "data:image/png;base64,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";
                break;
            case "Safari":
                this.icon.src = "data:image/png;base64,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";
                break;
            case "Opera":
                this.icon.src = "data:image/png;base64,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";
                break;
            case "Firefox":
                this.icon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAgAElEQVR4AbV7CbRlVXnmf8Z77nzfffNU9V7Nr4oagLKYRBAFEQUJsYjL2Ks1rthx6HTbxF72stMl3erKCtidobPMgpjGxBYXukg6KgaJKOjCABaDNVBz1as31JvffXe+Z+zv2/feoqCqBAUPtd859wz77P/b3z/ugxZFkfymNm393Zlch7XGiBnbrKS13UzGNjkpZ8BOOr1W3ElZtmlpmhZZmlFPdaaXY4O5M17cOV13gxfrQfSL0mztwIH7vjsT7d/j/sbG+GYDoI3e7SS6gjHH1m6w48718c7U9uxArrNnpDs+MNSl9fZmpTuXlM6ELbZpiGgiWewd05RSGMlsxZXpkutPFRul2YXaxOyR6aeX95/+F4m8p46tn5qO9uwJ30wwtDcLAO2ST6YSVvJtMcf8YCzlvD3dn+/t3TJsrN8xKpvW9MtwZ0b64rbEDU1sCN0F2XVIQmnY8FNIRg/7ih/KXMOXE8WGHJhckb1PHKpNH5w8HLnhPyZiwbe3VHOHHnpod4Bb3/D2hgHQ1t8Sizkb3mY7+h84cfsd6e6ubH5sjay7YoNs3bJKBvNpJXQC0g5aIknsKagJEAgANyrhuY2S+ThRx/5k1ZfHj07L8RePy/TB2XB5unRSC+XBeDx64OgDHzuOW97Q9oYA0Nb/u7XxuPEpy7Y+lEgnurKDa6Rr4zoZu2KNbBrrl5RjigEpOy1NBjHtDoRWgmPPrbVTx20AoAXSBsDHlSLocXChIuNHjkm2Ni+F2Yo88dxCODHnvhgF0ZcXzMbD0UOfrqlOfo0/rw3Ag+/snZypFoc+/dTZl2ja201jw8hNtmXtsWLmW5KZnJYd2CLZVUOy4bJB2bC1X2IxXboThnTHDei4JnEAYUBkCq3jz7nCc9xtAMiOAL887AmAi/0UWHDw1LyMv/CS7MwV5cqNOXn8F0X59k/mSkdmgweqkXNPdOmXZ2UzHti9/1cymMbnP/95PHXhrfRXV3SKYXwhFbeOGDv+7Tzv0gZvS5i9fZ80TeNPLUvfmEiltUzPJZLsHJSu/rSMbOwRHcKGYSBZx4Cxs0TjCYoM6SgoZ5lNHfN361yAE83Zj5TgFN7DMxYQi2K2uPG0/HjvvCxOzMgn3tslt14Ji+BVd03MNbadmTCya2cX3hEev+9o4sqPldHl69o4sotusZh9k3jhHYHnj/EmrfNDGdPJ/DGG8z8MPeq1YzFJZIbESWQxSJFU2hG/EUgVlrzSCGVxqSi1yWPg8JMSHfmZeF5DCeRDKNWAgt9qFJTnPPx2W60RhNIAKjUYRRpJuFBZtW2TPDHTKZ+776gkzSm55/dD7c8/qr/jpb51d/+/o/nPnX62dN/0FzZtvKhQr7pgvur3yz/v29kf1o0/jFy/S3z/js/edu0zkhz8D5FonzR0LWZBuZ1EhzhOAsYsEI0TjMGWy57EXVe6TrwoGw98W/oW92PwvlR+6zPij1wqBqZb8eFVaqDYgD8h6Q8AGjgmAwjGHACdgUeo1n0xLVu6R1fJ3oOa/Ne/PiZ/8rEl2X2NaOsGO7N/+dW3SenJR957c+OkZXxu3R8t7nCObH4NlbgoAPWl+ruCWnhZWPUwYP99I5GstaPuS4IoFkPwIrqVEMNKgtUR6O5JGARSqQTSP35Art5/vwzN7pVkUIDZd2T+trukcdUHJCYwihCINkBv2YM24iH6wT8J8IfCN7DnzAd4V9ULpFB2xQW7ahUPvYj0DPbKUy958idfK8kXPzIllw4UZc9/HJF7QdpHH/nmO+9wqt9wvI5vypqdfyaX/7zafs+r9xe2AffttGqTK58KVuo7/UJVgkrdGvBXBgvVwDruZaQ3Z8mm3pis69SlPx1KChY+smKyunhQbtn/v2R46mkxNAwUvu/YJe+TqZvvEjOZaio7RgAWQZ/wDI5DHNMGUP8hr5r1OoSfrboyVYQjBNMqbiCLy3WoViAl7P35eblptCYbVyXlsafL4pUXZNfIkuTjFdl+ea88PpXXw6OnenNueFWYSbuZS59+WuRWvua87YIMKO09knUbsUsiUC4g8n4gJnh719hpeW82kL58HBbeEsuOi2YnxbWzoKkjjWefksTShASmBfWIZLl7lezb/kHpS2WkDn2OMPVh1AyEQISWN2gaxgDnPUBSxn0LYN0ZCF+p+VKEB1gpgf7YNwBAANdQ8uLy2M9OyWffn5V33bVR/u7BOfnp3oK89ZIFGUgH8ql/3y8P3LtTnH/914RxyPlM98nCcXtUHjpPepy4oBEsL0pXY7E6WFmsyfKyJw1Yc3ssLT0bY/LWjjlZVTsl9hxikJnDos2+JIn5fdIz/oQky2fE1w0xHRE7ZcqBgeskWrNFOX/6JjYGN2weSEB6+2guWNA+X/RCmS66UoMR9RENFUqe1HEcIET0YRRCPGgnUjIbdsmXvnZcOtPT8t//aLW4Rp+UCjCa8wsyGp+S931kQF5MD8rxn852VOaC/yLzt67Ha8/bLghAtRQkl5Y8ewFRiLUmIR3bs2LYljQWI6nMB1JfCcSr+OIXazi3KOXJSSnNLikqmzFNYgj3XCsuJ3LbxEgnVXhLv97UbQCA4xpatdVq1Hcc87xpIW5AnuDETHHilgTQDR/I+bhoYgzZVRlBYgWPkJCT5Yzc89VD8AZH5IZ3OuJ090tQw/jOLMiOgYLs/PAa+cUZTRYOF3aEofMRuVs7T97zThCiyTlPXyhHWmZTUvLrU+KVYJjmPHELrgR1UBk0ZIPtQ46i4RxGDk6D+ZgdTSxEPXqtKt3Hn5MGPEJDM6QBsp1toDsfqeKZGhuOafTYmAskU5Z0dgL4roSkcnFJZh3J9CGBWp+T1FBaOjZ1SnI4K4g95YcvOvK9xxbF9KYl3meJ0TEkHhjknlmSG6+JJHHtqEweraBXbbd7x/UbKN+52wUBCGMSdm9JRF2jjtTn66BVFSC4EBjCY8AR9iEME3+HmFq6P8OMxEasa4MBBiK/ANe3PvtNWffP/1tiM8fEXDkjxsqMaMU56HJJ6h50GkAQgAYbQYCZau/JGKpIujMuucGUJAFAhKzRBXKRYUlqpF/i3XkJnKx8/VFHlmYgVmVWYgOW6MkOqc9VxamU5Z23d8gZcSQIg9FIs288V3geX9AIXv6e3qvC0M/Ul12pLzYkxMhCDBK+DzMPPcSD+CURBtj0abqK+WlRdAjP07BlEmsUZcf3/lScfX8vZiaJW2H5ERXOJEfk8eRlYt7wW9KxbkxFjexeBUVgwdmACMC6bECjwQbhXSDkwmB4Ht6ZTkssnZLnT8XlqRc8ee8V8Hb6rDjDCWnMGFKddWVDHwzvlWkwyzfMUL/61N2j94/sOUmTo7bzACj/2YYx0cNPBJXAbixi1uEJQhofOm94A1pxCt4EAH2QQzp+tQTHXQodjTfgPj0KJLU8KUaRJ+jVIsnp++XxiafkaO9WWdu/ASzCO3CNQRCBINiQW7lFFRniR6MBI4pWhycojJNFddEhfHxoUApTk/KDZypy41aogF8SsysUu9eWxqwlNtDascaDt4LBlXBz93UjObyKfFHbeQCEbu3O0PXH3AKCmzppzgFBLNiPkLOvhAcN8bhiAEeO8E7DdY0xO35jEkVH3k/MoB941lAzHwJAzTAkMbpOVm+/Xo6kVskCGBaFEL0tOJ4PCACEVnsc47U4Rjjm61I6sywL+14SDzbGgfD24JDY+eOy9+iMLBV06YzBp9gi8d5QvALEgzGOgiXME8YQeb2WuF0Y1YUBWPri4LCpabeHFbigGvW8qd/MbiIMoB2tcZbwD4LhOhjAyJBTCDnEoCRwazYsuJ1JS3JsVDJX7cRFT4KJExJfPyaTPdvlx0+lZaUQSRI+n+CxT868mn0KDQB80N5DdORxj+bD8BaQCDXKJbwD77bgmZYLsDmGTMyYcnIqkPwA7geodpcusQ5PDAcT7uBeRJNa6Nqh3yADzm6vYEAsZl0bFoMxD8L7CEJ8MEBNI6QMMSCKxtA3ohrwmMTAAY+5IbfGOSS9mGUH0eLwjuslf8W1ktgwrFxXYaYg33l6Wf72wYpM4dl1o0l4CT6NBJgA4nm8BoIH0ihU4G4rMISG6CnocIBACaoSIQbQO3ukMT0p/pGjwBVqCk/jBjYAcOXybgRLiAdCeKJYCmF3AsEaAzBEllG9bgZBGSHpy9vLANwN4iRH3hUGYcxn4AHfG6npxewrgTlQCt4Sl7NOdUDnigH8DcF1yxQNM2PRlyfqEs5MSm15Sp6Cz74fAenPZpERdPRK/+Y1YmVyUqc/JHDovc0Ct9KQwvEpccsVMAHgoF+zu1eieFLCmCMGngsnxyVAHKJBxWykiqVAl9NnqOWBmjgDHslKAwDUJULYxrAGABBQ+KUgffDOXX2bH3pGqcFZAOq9IwNS1q5kMsKoKwLiKrEnPTE7jN9xqbmnckNgXGoyBL91xMoGghcjBkOkWky06rjUFmz5v6dWywMnEPzkUTO4dEjSfd2w3gihffQDu0Dh2XeIF5FpYQSBe3qkVjstbrEIRvhQLR3nDPh4uFAIz1mPCE51WXa/e1S+9+MlWVhqCh+Aud4yUmgjAFsYsJgSIqKMgtBd2hfb6ht+P175F2gvu8HQs7ZAy/oDCB4y0AH7SX8lOP6S7uqcsvatmScQNHaI3gynLbiFUBiznIyLhRD6cLkm95/qFhndJD0jqB1AcOXPXaCK4h56aAoPBa9Nz6Ce4IqZyyLmRx4CVLx6HROCcHxyQswGgrG5GQmqCGxQcImQGNRLJVnfV5a7PpiXAz8AgADPSCfELyyAMXwHjKIGAMgCgD1/RLtaq3sLk98avn9o90TtLANQ0VileVoRfj6tjB8HxlkntTlH3PMfBCYw1Cs6fx2VEDXjqPhaCQoew28b6GMgKJikUO7Orx0Wt69fUblRx4D4PBmk+kb32ELXk+rSEjI7FHNmISR+KxAAiA8AQgjrjR/DjRgV+g5c2AOAABLIIrLDT3xAk4EVxCkssffFpTwNJiOBgtXHfZx9TZYWJXNqLrxqOB3tyxSzcby2CQCCA6enx/YQ1UWB0n8gyUHxD2iuQCDfDQABoQmCaq2Z12zqvSmoZMM/h5JGHVDAAB3KmYCwMRxXYMWj0G25RyKJPtB9e6Nx1fNdEkLvvVIZAsMF+wQBe0qJwdBd4g/AarvOpvtcAQsyRlmuv8KD69ORiCEVT9nqPph/qFkdww5kZtmwjiyEVl86Si8m+qwMXq4Y8DU55f6nxtqFsCGpAFY5YOrK4VE5MVBl7Tla0p+NM2/DNgCUhTlX5mbL0Fe4H+QJISz4eP9mOTy8BlFYIOkcCiKo6IR5NKpLiz2c/DYAfA03xhluFfl+tQZ524IDOOUiKCxBfBmIZvwQSRUxQehVEYYjwMuCBY0SEiOwxsVEAPQIwZAW1mR8zpEThUCuTTasnnWI2bEpAPbsicLivRsSftWPcxA0SBwUCcBNMbU9cADAcJf6OTOFTo+zUBFCK1i8RKQWS8pD4VUyvjgq5mxd0kiOjNWexOgR2n1w9lVr9s+/6p0QTs93QwCABT3XbMTwyBvU7LeEJwOagrf2mCwXAgZwW1q9hiIMbkf9QNM9sZBMIVMDAEwnPTk5k5EFxBXJES9Kbm6++6wNCOthp7vYsFXCg7lR+o+XEia6QR5w9vWWCqws+TI53hAXM49lMLFwLQaaVbNZqfavlY6+taJBb0MYMyUIB0EAVEcEoDmA5guagCsULEes/mExcH9YgzqsLOMiheWsNPeKEeoYhhAWO/KhEkwQ8ApNB9BweSHKZ0YOk1mDOtVRjIXRPTwJz9RpysBljTpCykCS53gBvxJ0eoWGhoAPGwBosUBRQZ2h8Bg4GoOV5UWkF7AX8RhSYAupMNgWAwgjvb7kYw2ZRcZmwgiqtQBIy3ifs04sm2hyr46aB/jLdzb/4Lxp49VcioBbxLPcN1WhuVf2gOoAG2Gi/IaZAGPTokG2AHEEu9IMTAByhgiGt7ASyqEJR979nph0r0I8/RNETbvPBaDkpfwyHsBiBm0Ow1Bl8dGTstYEBjPIRsFdWFiHKTDibthAMIBAaNLX3ZBbnH3y1dp68RC08BGuCzRnnDPfmvo2EAC7qWp4H9+lBOXwm1ggMIMFZ7EM58CCVzCBdgLBTdKEjtdhB0KYNQ2ledgcMwvDHMGeoIiKgEOOTRkytrEqH75pWoLFwqR1cFkt9LRUQION6PWDOuoutu4EsAM0aFYS08qtPWiCgIEzXjcxoIRDoZvNxOhjiL5QM5bf7XhaSsWc/EPjOnF1RG5QDdUF/igWKKFhSEHftFQkZWDW0GMhSKA4AhfK99DtzZ0BfTFO0h30ULPe2qu6BADQoPs9yapoZRZ+IbSNYgYMuY74H/LAFcIYQh36kCH+tzsnpBPRY73gH3L2RFCYNgO+tRs1rB8fxqLGIc2LdlDzWXgwUNhk+Zr/1B9ODI650ONg5qkKsRYLFABQB15LGK78Yfb7sqk2Ld+oXi/HvQHUAIFUq6u4VpeN+ri8I7FfduRmpSsPOLN5OR31yj+PD8gPxvuxBoDZpbvDOyLYEQLQNIZNO0BmdCbrMpovoZXFXwFQSagp1E/HOLC4ACY3Y4EQ/nnAgRqB4cCjgsToRUrErcWAbyHX7n7eq0VHDSfcweiOhQcbTKDh429ulJ9/TJxLwLqHmHVFfxDFAv1pC3QMFhOD+DyQ21J7ZVfsmDxTXysveUOoAcakV1+Wrda4bI1NSEccmWCMyUoa0aMmG4bict0uW3bsrcs9jyEyz/XDfUGIxemXqU8GoHnQ68GeZfnEzVgSzJWQFbriAAAjgieIATyoKKwH7AHUB3bCL4IJAEW3oikAsp+icGsCsDsKqt/SDqLKcph2QMvZqgLrkUo2Gl4I8pKJqhnwdynomIcgg4mIhQCJ1KcdYCJTBu2T8Mf0i31WUW639qIq/xxVGIxi+Mt4H5NELayhyrG4jFB3WrypaUmuG5E7h7LyWALL4vMjomHwKhkD1dtqwHzBg2qs71qUd29dkQhlO68Eg6yDSVxcgNFETQNahPeASTznrkAuFGMQzj+1VK1P9Srx2wDgx+aHIvfZLea+oOLXrZTlgGEqqrOgSzDlHDl0tqn/BhKfWDYmFgZlwUBx9hHxIi/HIhneMH2iIpluR/I9CI8RFeoIXfl808AZEB59ttD0MSseBllHunr61IqMPzcrJcuVQ0vrcA9mD0lqyFCYagCr30yYQjH9irxldEUS8H0rEC4CG5kZqiIOhEdMg3CZA0aGw9QeE2vEohqKuY9sbuk/MWgygEfYUPM9oHnGglsJhhj1lYuBOBmu8WPA0AIkVUzdYXhgH8B9syMuZgXHnFWExRFUJQYLFof7OfJiWfJ9tuRRmiJbWCylG+VG/fUxOBpaCj9fteS7pc3yPe8yWTB7gCQMDFaaNCQyDIh8WHgV/EAYBQLAGEiU5Oo10H0I6kK4GFapIuQPIWab0SjcepMNSLh8ZIIB7ABykH2wJz9Vg2j9eQUA6UU5VczI837RHzLA55UlFBpgDDUgaiCziwMUhsHMFlVCE3eU0BEKdjBNiBAx0xBycEiT+SVPJo7WZGnWk2QaNX6sFZhQCRpJzj51m8pw2MvLN8qXyvPGFhQ7cugXN5AgeKeiPCvPVAN4BSoiEyAB/d+6tSBrMzXxqph1UN5MmCr5oaFkEkRgWKAB3Cjng0kNZBSa9tDo/4zOXBSAbTNR5ckNxg9Bnffg5WB8kwVxrPFVYD5t7FGgUWzQoPccbODAF0JwHaEm5kdFihbyhLGtyN2RXHC1RmdNtg4DBQAIYB0e4Qwc4DPugDzhjcmcg8jPRHLGgIfCKxVhb2AM0tuQRT6sOImdRul7QZK2K++/rCAWokUXiwpmDO+Aq0UhF2ODfQAjWMxlus3Q3ivjmpcMZGlEfeNwUQB4wWuEjyGXHfdqwSgHu4KlsRhmugI9S+YCuDilzE2dZj7PLBEVoAiMoV+nBIz5ExldLtlpycMvJuWFGawkgz0uqF3UkjIZ5uSM1illKy+Rk0EfWAHCjKsNwjf9PYSpLSpAUNrB++DbAhhMIyM3js3IWwcLwAsFTxRk7XQDs45baVnxfjKAvp+TRVBKZVPmC8P2kNM12HzJy39foQI8bZyWI8Fo+Ajm65NEr45WKoFmmI3CPHQtjkeoymjN4AYv5QEMIFZLcayIiloePpjI6nLDWzT5+bN5+c7kgLhmFveAMdBvrHPhZegL9iTy4Q4Qzyvdqi81BbcR1S0ebI60YwxLYXmMxZTVSbi+yw8LrTRrg+E8giWoCAWmoQV9YPSgMoxkqS0rIj+aGJZRIxtZ6zoYLb1iOw+A66PIf2xQexCFjvdjsnsZuXGBNAU9XoZeZ/IWcnzqAeUmCrC06s3YYZa58EE1JjGAnQwmG/KFq0/LW7AW8aOZfjldS8u8n5ISGsqPeAg3FY6hqDcBABC2kkVsfIc6Rvra+Qu5cUtc/ml/p/zBruOyLbMsWvcgYgiUyhHZRRCYs027xJUqfNeAfvEbBvEHpwbk8PyAXLPNqObevuukunDOn/MA4LX8tDwzNxw+7Jj6x+vokOCWqFfod34GAQj0nhAggG5Kqlwai6fNSSUTGTcQHwwNVSFf/s2Gablz3YwcXnbkay/1y4/mBmQRH58oJuDTGUQy7FDhwY60qIH4IpRr1zXky7e7kkdae3NHJP15BM3ZnBhgor+4ggIInqVRxWzpsEvU9xBBnIHj56bz8tDpS+VDXdMyfNuu8d5bNp6NANsYXBCAy7GC8EiPdp9h6++CPVsDe6rK18zGFhY8SWDpO99jqSUsTBMGQOFRhFSFw1bWCBCUQceep5llmgBsLFeVj2+ZkG0dBXl6pkOOF8B0A7U+Lmigr6QVymAmlJ0DPpa+Q7l1uyvDOnz9si+9cbjZNFwvNQefzrnLVZXsUHhTfZ/EgAizBerNlWPylSO7ZEtXQ27+aIcMXJP4LtboQLM72rKr/cU/kwO//6lP/wzq8V9EFGmqlV0seEIeiTu6jK5NSDrLNQCgDSoaCIZo6PT2ni4TQjcrQHgI9FQagx4MGk8I24ChKMDNslXBNAP2I+cgxkc5O5skjaDn8Pk1RHkaZoIxCU2HDmRDLEVX5isq4rO7c1g7iEt9fBYAgKlA/IFj62S2e4388QeOy+ho6lBlObs7ddOPzobAbRQuDgDueDCjdcUd42+R/d6KlXG1cssFTAqSQqa4Zk1c6CI1JESmAoE0hBoABLVIiphA1RCUTWgB0DKS5Dq+kwYuEBwOV0ewpVQK5/kfM04fgRKyXcRFmGGYC9U33kXbWcf3CQ1EeA4+zXMGO1FRLkjtJGwD+qtiIXait1euuawuOdsvuyvhp5075v+mLfS5+18KAG98uFu7LNLMr9f8aGwZusWl7HZVN4PgZvWIAxCaApsYaFN4DBZeAaF5EwACoUCgmuN59EsheUz9ZbiqfD/2FJy2BE8i+EFdn4Cyn5bgBhIuv47iJwKkxOoMhM+oqK92ahF6D1c9jAWZfoTpLPkBI8RN984cXPzCyB4UBy6wvSYAfObPc+Zv99raX1UbUe8KqMoVW4JgQbAU9HJoGOXvNGN+DJQq0GpkQbuK1FYFBQAFVxtVoSm8Ug+G3OiDW9CAhUeYTMOmUgmCAKYwItShBvHhlKr5hVgRQnUGeVcF0SDRUgk83XZ1xZW/qNkrX9r4exEXEy+4vS4AYA6se7P6R/sM/Uv4DLCjDPcC961mlSCwNjCAuD/bgbxB0Z/GHQkSjxn9YYyYbrQWA8gC0oAsQGurA/f8p74H4qoRNqoGP77gzFuI+GwAbaXx9SleysVRVo91r6juYwWL0WZgaIuni+G933yy8pf3PBrx85CLbq8JAITnSCCipD+b1D+6wdb/M4K2PL/s4Ko5qQs5wQZ8FI2CYzcywBg/kcGMkbpUCzZ8W9HccD+fURWdtvC40gx/uW8KTiQovIV03EZx1wLTaAuIHGHTsBDD5CzEVyAaIh6lfjEtKrjaSz87Hd776f9TfxiOtYx+4RYuvr0eADh/XEVBGCedH47LLVfErI8DkdVVpqfEhypBN4iZTcI4dgGEHAIm6iEpr4CAkSQrlKdQNOfMQ/+xKeEpMEXD25QqgfrM35tGtMkTdTM5A/UL0G+ISjDVgl7IFaN0YCn8/t88G3zjO/uCA7gXDlZIfRf982UX3F4PABwuAehAQ+Qi6Wstfdv7Msbv9eiyHV9z6lQHNTMAhEKwRE6bkO+yJQO1UBEyBtykM5hBIMAIgqEMnBK6eR09vYohPNNkBV/DIkegIkQkWECrjopAzM/Iz2f0f/z9H07ch6CNgiMAlgW0Ihq+vbo4ACDRa258Lxuni037iReePLEc3v87aeP27XH9WtQH4vyoOYJAjHpoySvw3S4WNotLugIhneNnb5g9qg5GyVg9xCyHgFcZuhYI1Di+TMmstA/9gV0sooSgum4FUvQcObTQjxWnDlmNu/XQO/6V/Wd+iG7bdOc42+NmbxfdXg8DCD+DdqRkkm81fmWBTyCk94a4vuuWtHZdn6H144MmjfG/ejMGbEAAGkKWymKY9TgAiKNux9qAxfV7xYLmzJMdjAlU1IjhAycUTiA0zms2mAVbUIks+ensiDyPVace1P6uzk7BOFRP/PXBla8/eqrKMJczTwYgjRSYAJQhEdVif9HtNQHgk5gVMqVtBwgC1YGNKtE5aMjIbWnt8isT+ljKkJQPKagWrMrSBpiwzlwzYOO3hCZdG3rksQIBLKC+M6dShhXP8I00nAagN1rVpNO1nJwyh2VNuiidMlt7biZ44SvPNh59YTpENqUEptBIJ9Ux9Z/0Jxsuur1eAMgCDAcKJ4I8VQnfZkMnfucx9s5tcVn1nox+yda4Npo2NazOM+DFo9R/UhV7JbgSngyADYDgBISBjvIUOKeW4Cg0Gg2cCa9CECJTDye9vcoAAAI/SURBVIuNqLxv2jv5D/v8575/JDiIYHAO728LTuHbxo+BD5YwL67/uI6h/fLrvEdtYAFkVCAgoVfqQDUgC85lRAYoZS9NyuBNOX3jJQl9BM4gg++B8emQFjqGBjKQ5gCixQLFDLgUuk36U63V8L+WRYGlIx7SvGVfK02UwvkXZvyJJ0/4J1+aCaYRJbeFbQtPwakCZTSkiMzVXlu41w0AOqQqtJnAuABLiwqILPYEg43sYEOFTpJrHem6JqeNDMS03gVX89JmZAzHtI7umJbN2Br+fyuxUCnzjjdkBl/cNkKki3XUz6qRXi/5UXWmFq2cKkUr08WgMF8NV1BHpXBspDeFbQtdbJ1joZ0rPq8587hHbb8SAHyiBUKbDTSOVAt+eUUjycZjNp4nWxwkjwkwOYH8hUsFRqcl8X5bEv1xPRnXI/vnhWgRq+wUhvpKS4471WfDFIazyUbhGNW1ASAIPOY5XmvP+i/Vedz3iu1XBqD9dEslCATJS0ZQWBpKNgrfPuZ5XmejHeH9fI5s4sY9G53HqwFoC099ppBsLGtxz3NstPIEDJ7ytSmP+16x/doAtHs5hxEMmJQmY98WuL2n4G3h2wCcCwK7o/BtAMiCtmBkwasbBVZC85lfR3A8p7Y3DMDZjpr2gT8pGBsBObe1z7Wvt2cet50NWtosaAPR3hMQtjZIb0hovrC9vWkAtDts71vMaAvJPTcKz619vvnr5b8E4GKNITKvvanbbwyAi42yBczFLqvzvwlBL/bC/w+mlKa+ZGzupQAAAABJRU5ErkJggg=";
                break;
            default:
                this.icon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAbvElEQVR42tVbCXBcd3n/3nt7r1YrrW7JsiRHku/4TmwnNXEYjkIbMsMknRaGMkxL2umQ0hkoR6fk6FBgmqZAJvSiLWehMQ11IHGSIRmOXHZIYuL4iGXLsiTLkrU6drX3vqO/73vHvpWdYAiBsJ7n3X3afe//Xb/v933ffxXLsujX9VDweP/7bw9TE0UiAQqZelDj88VS1YiaxXI4XCjdc889FevXuCjl9bzX+z56Vzxk5LssyxxSLPUKsqwBRVU6FLLaLFJSKlEE58hUqICFzJmWmcaSzlsmncHKTplV/VQ+Wp657+67i781Crjllo8n9Wh0I5nGHrLM3YqiroPQbaqqxRRVHvAE3Bj/7FvjP7yQfyaUAelNwzDwnLcMYwZnj+D8U/jUT4pq7th9996be8MpQLnjDvUDM9Sva/o7IcENEHCrqijNWiAA2VURzjQNMnUcpi5C8n0t0xT5ERn2AeWocmjyWtSD77E+8JjF64P4zn5SjEe/+eV7zv0qQuU1KYBj+o9u+eigogb+EIL8Aa42rKlagAXAykmvVuQwDF2EhRBk3889ak+1i9oK4WtoGo5AgAJakEhV5BqGrgMjzCN4+d+BgHXfN/79i5O/MQV86BOffffc/OKdkGINFqwGgkEK4ygWc7SUzciCLcfa5FnddnfX9T0lKDUNKI4S7NeKeAVfOxAIQikBuSa8ooprPW9ZxpeUsnb/fff9cqHxSyng5ptv1ga3bGlazNA/z88v3sQLSzYmqLU1RQ2JBJ2bGKeTJ47LQj3BLSfWvfv5X9fJ7ztnK4AczGBFaLhXKBQmFd5hilcZBShiv2KZn7v/2//xs9dVAS++OBN/fuSFN91//3ffNjt9fnBo7ZWb8oViT1OykYbXrCG4P83OTEP4o5TP5Wqu7lnaEmEs//u6x+WtRTzCUQQ/BF8sCxo3Pm3k577z0EMPlS9XpsDlfvDpn53sSWdynxwdHX3v6MvHGm2gUigYCrC/YgFEE2Nn6Mypk1StlOVvJEjvi3nFeXKVoCjLsEC5LCWw5Su4h65XcX94A9/fMNZCEfcqoaYrrn3Xu/7pif37ly5LmZfzoR8fHh2aSi/+y9xi7s9GRk43aqEINTS1Ujgao01br6JSqUzPPXuITp8aId0wILzmXdp2YcVWgUV2unNCQTDCdJ7dkPA+aF3CQy6hiHJJQNZOr0pSN8xPxMzQZ/becEPrr0QBjx06MTw9O3fvXLbwexXdUC0lQA3JVmpta6fh4SEKRqIUSzRSNpu114u0Zx8stFKzp+CgLWAAyB6D8hobGymZTFIC34/iOgEBOBbMqsnuV8YlFMNKq1arjhLYKymCU7cErPDn9rzj5rbXFALf/uHh/mqp9IVcofKWIGIuHg0B5BpFsI1XbqT169bQSyfHcdOAHCR/YSUw+EEJFhSAhTGAMTi2tLZSGw4WPBqNUhCKYAdBmocQFWSPIi0uLlL6wgVKp2epUCjUvKgu/S5DDkisV3Ef1XBDixfzx9GAknvb+973yUe+9rX8L6yA/zrwkzaFQp/JFStv54W2tzTKgls7Okh9+aQI0xCP4l4mZZeWxO3F3pYih2kZopBUSysNrBqgnp5uSjQ0yGcqCJlSqShCc5Zg8IzHotTc3ITP9ZA+PCweNTExQWfHRimbyXqZoJYqlmcQy8VYIVFQhIa3f9pghk/i1JdeCVwuqYA7vvLDSH9X7CNLhcpNKkhIKtkgCwTSUnfvSgpHYlSuQtuKRs3JBJUhkJAf4pi2LRKBiw8PDdLg0BVw9ygtZRbp+NEjNA6B5mZh3WKBSY3EsQrAZI9oTqWot7eP+voHqKm5WY7+gX4agcJPnx4BuFYdcGVB1WVpsz4snEcUyv6rv/jIpw7de9edz15KVu3222+/6OTY9Ox7S1XzU4alRMLhILU3J2rMLBiCZSbl9cCqfnk/m16ghYV5ASIO81RLiq7eeTUNDg/C2kV6/tDT9KPHf0DHjr1Ec3PzVC5XbRB0MMJECBSLJUpDMaOnT9HIyZepkF+ipiZbCR2dXQibJMJjgSrwGgfw7MP9p9QAV/GRCRCmFFLmwPi5hSd37ti48HMV8J+PHNpkkfb5smn1mLhQLILqNRG1SYimwvoRLMKgcSjhClhYAXCpCI2JiXNISzp1IER2X7OL2tvbaBQp8ZEHHwAvOAGB8d1wFHVwlBoQCnFgSUNDI8VxxGJxXDdKYaQ0Znxs6UmQqbEzp+XzbQBcViqH3fz8PJWA/J4SVJcsuUqpJ1COElYFglr8bDHz2Lbh4eorKuCurz8ab2xMfLpQNd7MFi8ZFjXEItQYj8gN+SYBKCHZ1ESjo2ex2BAlYKVQOIKFLQq6X/M7u2C5JL3w04P02CMHYNkyRWMJCNogmaOltV2E5zAKhsMUZIobCgmx4ecQUmw4HBLKyyA4CtdnRtndswLXbaKWlhaavZCGEarADrdwQkBgbaprfUXxooMVoTMQq9pw0AqMXrd7x4uvqICTF5Zu1C36uKUooSqKdPYAdvVELExVKGMhX6F8Waemhhgl4JIvnxqFQC1itRgEXLlyBRaYgss/Qz9+7AfwjDDF4hC8HRZsbcP7oIBlCMLHGlgpCSinQcgMP0rFPBULOREq0dgknsFeNX72jPy9r6+fmHWyMmemZyTcmBK71aMcriIUqnmEJV4QQqpdeW4m/ejWjWszFyng3u8eaonFgp8t6eYaFHSEZ7mwyQvD63zFoKrkZ4UqIDsN4P7wf5oYn6AmgFcEIJZIxOkUaoDHH3mY1GBEhExBQRzvlaqJ7zSJF7QhPBJIiwx8fDRASSwwKzUuYZHA9eLUkmqBd4WBGRWanDwr3+kFCHPNAcIDr1sQL3CFl1La4SB1GKEKU2Sv6oRS09fu3PrERQo4MZW+Adb/ED4dxFoJAOhdlJyLiMtpqpOXkeKQthbn5mgOC2nGYhnEHn/oewTCRFEIxbGu43UkmqC+gQHq7OyAGydkgQzmnFbDoSDCwH5mZcTxvWDQ9ohKpYJzMZCkCNpmRcGFfG4JXlKQUOQwCENBjEshhA97g+sFfhZqL9diGRRgStdCNvfI+tWD814avOP7z8VWJyI3Z8rVKC+K3Y4FdRkdOaWpv1RzEXwNyNAzTz5Nc+m05OFURzfC5TzcOoKrgzgh/gcGViIVRiCwRmUIhYaBCM1CuFSULcSxyp/RnIMxpQzASza3iDBMjo68dAzHUQlN9lC7MAp4h/QP5Lt2tcipllkisxIDxshkMmtm05l34e0/eh5wZiy9FSv5GDwgzkJXDMvTJN9Yc2py1fEC1ofqAE0DBGtpjNELLxyh3lWrqB0pa3z0lCgjGm9ECuuAywO9MznRXxh90AhbGxaLIMVymg2FWBmaXF+yDd9Ds+8fBw5UsXC2MgsYjzN2JAU7OEMwcDInqIIJlkolyuWylFvKIo3mpChjQ0YiDKwRWS88RYnGIvFMWXlguL+7IB7QEA/tzRYr7Wz9IvxfUZQ6vmmSU8QQA6OF29U4vqYpNNDXSz9+4iCdGx9HWDSL5jVgQBA3bW1rBempiHuGcP0QFMACs8uH2QtUu2Wmu6jugRg4BcwWhACpVFK4R9/AIDClA99Thf9nswBNAGcJpIrDoohnZphcKVbLZfGexYUFKHWRGlFztACIOaMszC9cmV+c24HlHwj8277nks1dsT2M8jEsTsdd3W6M6/pSoFjkVHEkQMiskBca0hyCBOCchAKy87OUhwWa2xspEmMLhWlpIQvBbSuziwZFEQHxBFYGV4NlVanrHTDm6HjNLLMTSmQgnAbyawirNasHadvGYcoXyjS/mJVjAXQZ7i0CL+DIgnkWxQsqyDphqRqnJidFOf2rhhKFUvl63ObhQHNPdEDXrQ21klXxig8/o2LhTRacqa7CJawitWQwoArQFbHQMlxwYnZKlMXXYLfV8UaAMBJw8rViuzo/a6ooxcJ7jk9dFGRS0LLhJ4R7VSu6GKKzq4umz89Iz4HxZPe29dTZ2kS9XS1SjufBJBcySzQDVnp+Jk3T4ArpC7M0n56W1BtFVllcSAODyvCcDMhUeeeBAz9pDcSDwS0XSqUWdjXddKuJZYBn2enPcryAlaA6DQ8WpAqgKcFCfIazgldrI++XweoMp/vrlremtL8tqQIriF05x0UEkaMYRQqkALySS2ROeUy2WKEc4yxwqVz1KkPhKijMmLR1taVoqL+H0nOLNH5uhs6cnaAL6TnKQWjBM3gfM0ngxVBFs4ZA5gKbAXqxMFyxDBR0ycPy0smUhaMHp9h83/T19xjB+RAALRchQAjvdVFYBRbk+Nb1EBShIb2qohD2iopit7PIctpa0hixlWuaDqlxshGXu/Z5u8fIyrPBWHXO2wZiL4tGQtTVgZ4FsGNoYAVNTE3T0eMnKbOQFo0ZtscmTd28MlAq64NVXCwOACpauq8zWwsAywFBNqSpyCQHgtRwQXFSEed/fq8K/9aF01dDUADisFIFm9QR+xqExyKril0um4bqtMjs7pDbIjYcT5FwgRcs5fLCBfj6bEW35aZ4bXS3KFadNdnrisErBpGGuzvbqbe7nZ548imaQihVyhXwe2VtoFAxeoRSqnZfz8+jXR/zK8J0gJA/y5bECMfu8ADwSgAj7trKZ2DRfGZBChz2hipjBECWp4GawIclTRNTkN9Vux2CDH46NMyWYr7AAgG5Kbu4IKERQThEQgGqw2rpGtsYZimcSi25tskW5/SH66xft5a6uzrpucNHwC1ShIbBqgBu1OqyJmt5a3pZ68VywdCUwZbEZtVggAtRe1sLYm1B8nMGpTFbKZeZkwqSSUkZ1kOoQtgot6JxaJ4CNLVWxXEQVHW7zcUJOByKIu5z4P5TguotbVwaN8DNw3Xeai/a7i2wElRT8XiF6niDhakU0+lrdl4lhAzY1akiquP1bSe7o/OKjUh2b57fQRtspVLFkMX3962A21fRLG22CYgUKJp4gSE9uyqV0fIq5AuC2HmAZgn4UNF1CZ0yjhKTmbINqDYb1QQcz52bhAek5ZoNiSZqRy3Ace5aRfFzf0Wte28rwck67owB7zn7AGBbuacdsOrnEa/6sMPAdn9UjVIdsif09XZTMtEgHsHlbH4pQ6m2TipkF8QDVDUhRIdTJRqFmBOGSGcWyLTXqe3dwYnieAQrYfbCDE1PTYkHJZMpKbX7VrSLAKbl0jP+vCXVa10V6CnEtFOwamcXJWCDqWqacdVyGvYu+bOcQHi1hrSkMMtOZTmkI7ZcY0Ocrly/WohLx4o+yi2mwcZK0jpnZZTQ4eE5oTPWkkKnhF4B9wuKpYq8ZxJmOYJnMHaamjxH50FeuADi+SArtLOjjVZ0ttoGc0mTk7rrm6eKl9EVd8rkyClAytRbsWvHkm/YWRtb/pz5hOnk7jKEz6BPwLG7ZfN69A8TaJunUNo20vzMObEA9wcLyN/57CKELiIkdG9g4qpb3sG1gM6YLl2gmfPnQWSmhVWyoK0dXSi7W2j96gFpxtbNEernaZceNrlKcj/A2UpTCpwzMq5ba44but+65FzCd1I8AV+cz5WoiHhuRAi8+brdEvO9q4YF9NLT42LxCIoazvVFeEKBS1pgQTFflOf8Ug5HHo3TJZoF3Z2bnaEs6GwxnxchU+gitbb3UF9PBw2vWuEtw/SIW12+rnt5kQiKH+PVdAAyn8eJQR0xweWpBVDzMMFpXHqetUwjlkOIisj3s5kChVMNNLhqJe299ir60ZPP0uC6K2ni9MuUPj8unSGp3hDz1RILrUmG0BxKzLHJo64S/mYIOyQpibmF1tG9ktpamkB/1wr4uaN2dw7h7bNw1+wbnrj1S22oUlMK0vE0g+AZgMPvcJubqzU31Vlu/l/uBkrtbk76FSXMZYtSTLU1Rmjr5nVQpkJPHjxMQ1BCBnycJ8aZ+bxTONkN1oDTcJHGiw+4MGiXFltreyfydSt1tCVp767N1NneYu8iMR0hlWVublm19ftHcM7MwP2b+3mU3GMBpKGjyMPVYtUIxiMhUlxlKZYHJe4cU1EudgSXPXBWmJ5fAtMjam4I09ZN66gNVPTJQz+jYOcK6l3ZRwtzFyS+eQLEtJKF1py6nxUTQlZgT0k2taB91iydoIHedtq1fT21NidrNNgFP3ctPoGFrrv1hlkbzZuOB7iZA4ovw8jHAmXTPBxUtKWlipHia3F1V9FNpyp8lbm6T3gXbTkFnktnQXIaqAWt9FX9vdTT2UbHT56h02enqLd/kHZdsxs8oSTTnsxCBqVrVvJ7GMSG2+ZaMCjtrQ4ob8PqPuHyIZTNpjNINZzagXwB4BE0V0DTqntv+pRgOUUXFJ/Vq+aRQG6pdCyZiJ0FmKW43x+BG5d1R3PM6tVaWSw52u27OzGg+HBIcjeUMD2fFSrc1hRHhRal3ds30JYNgzQ5g+EJvCyMI7OYw7xgjELRpDRGmPLGomGM4JKwegd1o5hhtudZ1bOoz+u9WamzwcpRkun7DgvseoI7dGWvg31HcxX9ZODAkeL0zTujB7H4LUvI6Um0wLMl3SY8rAJpjlo1hmjRRfiqOLZgTq85ewLm0a3BLi9MlTAPVEJUgeIj6Bozizw3eQGj9EnqQWzv3LMVdURYeoFhngvAA2w6WxPY78q+AZgHwqa7u8wT3BHee66N43mdTLyqpvHMV2bHZmWHyN0PPHcT1PJVUPBoNxa8WAJtrdq8WnE6uPJs1QixO/zG1hSct5tlaG1QAC4R5GYGT5ECql34BJh9SfmDrtE0Ojtp2jS8knZvXYdGRdgrqy3ff9Yyd66jJk4cS5tBCjKbXHGJbEhz1ZBy2322/2YIYxXMIW4mld+zd/f2/dITLJYrT2EIeAJW2sLMjtEcs0Fn3m83QxQn1vyzSNfybo+45glS6FNmqSB8Pp6IkVGo0JnRKdLRq7v+6g2I736p5XnR9YPNehS/FA+xlUNeOjRdJSw7TN/ONH6vOVkHTPNosWId9DZI/M1Nu6aglwd5SJnFQrk6C2mK3aXxdYHcHR7k3/Bk+QQX9yLh+9ySYiwJoGydSy/S4cMjFIQyf//6HbRhuF8GotwGZ1AzTMs5zDp3p1rq9u5bA7p6wT1FGPbh/s0VXnEyDs5b8IwH3nHdjmn/DhErmQh9B6xorIjiJl+0vcDehuLmU2fLm6sJp1fszMPtEhdaWASyc0+Om6FMrM6OTdHRo6eovytFN77laoBbi7hmrcFKdQKTL1d7Kc6qD4mLLO65v+nDgBog8nel92hPok+j1P7uRVtkPrB3/UvRkLKPY3oxXxLBwpricyPT2dPjKIG1ataE58/PnJ+WngCPtrigOX5sBDE/SdduXU2/e902yevcP7R8hIV8m6jqiYs/dTlAZzjWFkFrsS3CiyfZh+sJ7ndYeGdPEXRifvuJxx8+ccltcp9/8Pm1Vd28v1gx1/B2mMZYSDKC3QK3taU6sc7PmmIfuBtNoW/PbLIVs8AyBpxnz4xRA4jNDW/ZTWsG++xrUK0+r+s8+9iln61Z7rmLlFFThO0FNQ9wgdBVgnsv21PMI6D8795z9eaRV9wnePf+Z29Fn+MfAIKhpoaI4AHypRPjlqC6pwC5gE5jp06DBBG1dbSD5+fp9PETNLCig2582x50ilLi8ppS69DUJkv1ZMtDe2sZrfUpwO/iNUs7gpv1ClCchqkTJiXsU/7wNVdt/ddX3SKzVNG/0RTR9uLuNy7liuIFYVi5pBtOJWU3PWU2gH9nRkYAcvPUNzgkjVBuP+/YOERvvW6XNEa4u8NKNBW1lkK57FasWmmq+NPfsmd2Y/fZvFgJfsBzlSDe5jRZ3M/hFv8XsKrfuqydol988OA2zVS+ifpgNbe9YuEAceeYK0a3oRmAUEvo/T3/zDPSFF21dh02QcVp61APre7r8pBZc2aKqr9FpfjGLsry2r2+cLH81NY061ie6csAggWOgjTnXr6/HwmFQ+/ZtnHNkcvaJ3jrO69+Dou8Mx5U5oNgPzyIUNBQ1GTLe9Xu+XPXF81KnsFx3T49PkYr27Bltq9bhiFMQLxy1KOxTtwavvj1x665LI7l8CG9D/EFBM0a8TEcJQUchZuWl1ZnMIr720sJ/6rb5LQpbZ/SY/bGg+qnSpYRq+qGR77tiysYhCbRo2tEw3Ke5mcvkFUuCMobTqXn8gZT5reKWM3ryfiCv1bV1qfCutj3PMG2vuEDQqlRyO4fkEOdHS9ZAsX+u+2b133vF94p+sEPbqtaVvCekGZ9Ph7SShFuaXPOh/XZA7h5wdx9w/o1UsyYnPZOjGCIWfbYIflceLnbGpdgcbX3hndON2seUw92Rt0gVYR3ts/aOGDmYITPNDWEv+yQFrrsbXLuY9twd/XU1OlDZlVDlaxuA2AEhRJz85IXx1tl4nEMKTTZIDGHeVxAxuUrLt78bS1ruF4i59esTRfVArW/uYq0x3iyR4i9zbR8BMjMAAT/3iwvfWHTpk2l17xd/uuPPhpXjPhfQut/jVlfkjcjGA4o8oJ4SjM2gs2MI6dl9P32N19LO6/a6rZT6rav+YG/pqNajeumwFoN72N0ZPN/t4HrHrpu1NyerEko5M4dm9d/lXfZ/DzZXtUD3MemK66o/ujU0UPY1jQJV9gIlE2xAAEejzsIzxuXeF8wb4Qcw55BHkWt6Om0Z3jWqwnvegN5pa93uDWHz2tUt42mKLUujwuyRM9iTR/evnnD/+LT+uvyi5F9Dz+1C8u8DaXl9eDUQTcWpdcHyY4dO0YnR0alDrh213bas/sqzPJC9tzRTfnMASx/a8EW0nQ8yt7kZHl1gmdxpyZ1lWN7AxMdYwmf+1YwrN61ee3akdf9JzMPPHawA0L8CUbWH4QCVhpOutKcQedJkKNjGEezVBsxLLl+zy5sc2nyqsuau1vLGKDlkRgiX0/ScX1beMvf4cEAUTkEUP6iapW/v23btsKv7UdT+/bt01I9/VvLZePP4Q03QAEtXqsa1prAROf48RGZ/3V3tdObrtlBqwCOrCTDqQZrjM+nF9Os9Zl8WGD5iyITP5iy6CXg0NeDSuB/tmxZPfUb+93gD8fGIubU/G5Uf+/Btd6KBXbjWWUl8J6dY8dfphHUCmVsYFoz2E/X790jO8BlY7VRH+cuFogiFarLAM4uk0V40U+hwPsrpvrgtdvXT7zW3w7+yn45euDAqXBTW35duWK+E7Z7K667AW3nJOoDdRqt8KNHj9MJFEk6OsIbN66jnVdfha2vK6VErus7+GIfpKfCm7ogNJevT1RM4/GCWXn+us2bF9/Ivx1Wnj52rJnKxkYsfiek2I44XgOG2DW/kIlhl3kYP4RQi4Wi1dyS0nu62hdWDfS93NvdlUHrLWFZkvjS6J6OQgVHES8vmWZ0dP/+r2Zvu+0287fqx9Pya7Onn4aRU81qWFmBXWa92JfThh9LBOcWMtbZ8ans4RefP66VzdO33voxjCiKwcZG05qZmans2rWrdNm/o3sjK+CN/vh/23vRpwslKcMAAAAASUVORK5CYII="
            } else this.icon.src = "data:image/png;base64,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"
        } else {
            this.report.hide();
            this.icon.$.parent().removeClass("userapp");
            if (a.user_generated) {
                this.report.show();
                this.icon.$.parent().addClass("userapp")
            }
            this.badges.hide();
            this.devices.hide();
            this.name.text = a.name;
            this.description.text = a.description;
            this.icon.src = a.pictures.large;
            a.liked ? this.star.removeClass("unstarred") : this.star.addClass("unstarred");
            this.star.text = this.model.likes;
            if (a.added || a.mandatory) {
                this.action.label.text = _("Added");
                this.action.addClass("disabled")
            } else {
                this.action.label.text = _("Add");
                this.action.removeClass("disabled")
            }
        }
    }
});
launcher.ui.extend("Sync", joli.ui.Widget, {
    state: "pause",
    active: false,
    classicActive: false,
    total: 0,
    packages: [],
    syncedPackages: [],
    initWidget: function () {
        joli.packages_to_sync = [];
        this.icon.click(joli.bind(function () {
            this.togglePanel()
        }, this));
        this.itemsByValue = {};
        this.hideButton();
        this.panel.item.desc.apps.$.click(joli.bind(function () {
            this.showApps()
        }, this));
        this.panel.item.desc.updates.$.click(joli.bind(function () {
            this.showUpdates()
        }, this));
        joli.model.apps.bind_newinstance(this.onNewApp.bind(this));
        for (var a in joli.model.apps.instances) this.onNewApp(null, joli.model.apps.instances[a])
    },
    onNewApp: function (a, b) {
        b.bind_change(this.onAppChanged.bind(this))
    },
    onAppChanged: function (a) {
        if (joli.system.websocketserver.connected && !joli.live && !joli.guest) {
            a = a.target;
            if (a.type == "native") if (this.active) this.updateSyncPackage(a) && this.updateUISync();
            else this.updatePackage(a) && this.updateUIApp();
            else a.type == "web" && this.active && joli.computer && joli.computer.version && !joli.versionCompare("1.1.15", joli.computer.version) && this.updateSyncPackage(a) && this.updateUISync()
        }
    },
    updateSyncPackage: function (a) {
        var b = false;
        joli.each(this.syncedPackages, function (d) {
            if (d["package"] == a["package"]) b = true
        }, this);
        if (!b) if (a.state != "unknown" && a.state != "installed" && a.state != "removed" && a.state != "failed") {
            this.syncedPackages.push({
                "package": a["package"],
                name: a.name,
                state: "preparing",
                progress: 0
            });
            b = true
        }
        if (b) {
            var c = 0;
            if (a.progress) {
                c = a.progress;
                if (c < 0) c = 0;
                if (c > 1) c = 1
            }
            if (a.state == "installed" || a.state == "removed" || a.state == "failed") {
                c = 1;
                joli.each(joli.packages_to_sync, function (d, g) {
                    if (d == a["package"]) {
                        joli.packages_to_sync.splice(g, 1);
                        if (joli.packages_to_sync.length > 0) {
                            if (joli.model.apps.instances) {
                                var f = joli.packages_to_sync[0];
                                if (f == "systemupdate") joli.ui.root.performUpdates();
                                else joli.model.apps.instances[f] ? joli.model.apps.instances[f].install(true) : joli.cloud.apps.id(f, function () {
                                    joli.model.apps.instances[f].install(true)
                                }, this)
                            }
                        } else setTimeout(joli.bind(function () {
                            this.sync()
                        }, this), 1E3)
                    }
                }, this)
            }
            if (a.state == "preparing") c = 0;
            joli.each(this.syncedPackages, function (d) {
                if (d["package"] == a["package"]) {
                    d.name = a.name;
                    d.state = a.state;
                    d.progress = c
                }
            }, this);
            return true
        }
        return false
    },
    updateUISync: function () {
        joli.ui.root.content.settings.syncing(true);
        this.icon.status.text = _("Syncing...");
        var a = 0;
        a = this.syncedPackages.length;
        var b = 0,
            c = undefined;
        joli.each(this.syncedPackages, function (f) {
            if (f.state == "installed" || f.state == "removed" || f.state == "failed") b += 1;
            if (f.state == "downloading" || f.state == "installing" || f.state == "removing") c || (c = f)
        }, this);
        c || joli.each(this.syncedPackages, function (f) {
            if (f.state == "preparing") c || (c = f)
        }, this);
        if (c) {
            if (c) {
                var d = 1 / a,
                    g = c.progress * d;
                switch (c.state) {
                case "downloading":
                    g = c.progress / 2 * d;
                    break;
                case "installing":
                    g = (c.progress / 2 + 0.5) * d
                }
                this.icon.progress.setValue(d * b + g);
                this.panel.item.title.text = _("Item") + " " + (b + 1) + _(" of ") + a;
                this.panel.item.current.text = c.name
            }
            this._element.className.indexOf("show") == -1 && this.hidePanel();
            this.showButton();
            this.panel._element.className.indexOf("no-action") == -1 && this.hideAction()
        } else {
            this.syncedPackages = [];
            this.total = 0;
            this.icon.progress.setValue(1);
            setTimeout(joli.bind(function () {
                this.sync()
            }, this), 1E3)
        }
    },
    updatePackage: function (a) {
        var b = false;
        joli.each(this.packages, function (d) {
            if (d["package"] == a["package"]) b = true
        }, this);
        if (!b) if (a.state != "unknown" && a.state != "installed" && a.state != "removed" && a.state != "failed") {
            this.packages.push({
                "package": a["package"],
                name: a.name,
                state: "preparing",
                progress: 0
            });
            b = true
        }
        if (b) {
            var c = 0;
            if (a.progress) {
                c = a.progress;
                if (c < 0) c = 0;
                if (c > 1) c = 1
            }
            if (a.state == "installed" || a.state == "removed" || a.state == "failed") c = 1;
            if (a.state == "preparing") c = 0;
            joli.each(this.packages, function (d) {
                if (d["package"] == a["package"]) {
                    d.state = a.state;
                    d.progress = c
                }
            }, this);
            return true
        }
        return false
    },
    updateUIApp: function () {
        this.classicActive = true;
        joli.ui.root.content.settings.disableSyncButtons();
        this.icon.status.text = _("Syncing...");
        var a = 0;
        a = this.packages.length;
        var b = 0,
            c = undefined;
        joli.each(this.packages, function (f) {
            if (f.state == "installed" || f.state == "removed" || f.state == "failed") b += 1;
            if (f.state == "preparing" || f.state == "downloading" || f.state == "installing" || f.state == "removing") c || (c = f)
        }, this);
        if (c) {
            if (c) {
                var d = 1 / a,
                    g = c.progress * d;
                switch (c.state) {
                case "downloading":
                    g = c.progress / 2 * d;
                    break;
                case "installing":
                    g = (c.progress / 2 + 0.5) * d
                }
                this.icon.progress.setValue(d * b + g);
                this.panel.item.title.text = _("Item") + " " + (b + 1) + _(" of ") + a;
                this.panel.item.current.text = c.name
            }
            this._element.className.indexOf("show") == -1 && this.hidePanel();
            this.showButton();
            this.panel._element.className.indexOf("no-action") == -1 && this.hideAction()
        } else {
            this.packages = [];
            this.total = 0;
            this.icon.progress.setValue(1);
            this.classicActive = false;
            joli.ui.root.content.settings.enableSyncButtons();
            setTimeout(joli.bind(function () {
                this.sync()
            }, this), 1E3)
        }
    },
    showAction: function () {
        this.panel.removeClass("no-action")
    },
    hideAction: function () {
        this.panel.addClass("no-action")
    },
    showButton: function () {
        this.addClass("show")
    },
    hideButton: function () {
        this.removeClass("show");
        this.icon.removeClass("active");
        this.hidePanel()
    },
    toggleButton: function () {
        this._element.className.indexOf("show") == -1 ? this.showButton() : this.hideButton()
    },
    showPanel: function () {
        this.icon.addClass("active");
        this.panel.addClass("show")
    },
    hidePanel: function () {
        this.icon.removeClass("active");
        this.panel.removeClass("show")
    },
    togglePanel: function () {
        this.panel._element.className.indexOf("show") == -1 ? this.showPanel() : this.hidePanel()
    },
    clear: function () {
        this.total = 0;
        this.classicActive = this.active = false;
        joli.ui.root.content.settings.enableSyncButtons();
        this.hideButton();
        joli.packages_to_sync = [];
        this.packages = [];
        this.syncedPackages = [];
        joli.ui.root.content.settings.syncing(false);
        joli.ui.root.checkFreeSpace()
    },
    sync: function (a) {
        if (!joli.live && !joli.guest && joli.system.websocketserver.connected) {
            var b = 0;
            joli.each(this.syncedPackages, function (c) {
                if (c.state == "finished" || c.state == "installed" || c.state == "removed" || c.state == "failed") b += 1
            }, this);
            if (this.packages.length == 0 && (this.syncedPackages.length == 0 || this.syncedPackages.length == b)) {
                joli.packages_to_sync = [];
                if (joli.packages_to_install) joli.packages_to_sync = joli.packages_to_install.slice(0);
                a && joli.packages_to_update && joli.packages_to_update.length > 0 && joli.packages_to_sync.indexOf("systemupdate") == -1 && joli.packages_to_sync.push("systemupdate");
                if (joli.packages_to_sync.length > 0) {
                    this.hidePanel();
                    this.showAction();
                    this.icon.status.text = _("Sync Ready");
                    this.icon.progress.setValue(0);
                    this.panel.item.title.text = joli.packages_to_sync.length + " " + (joli.packages_to_sync.length == 1 ? _("item") : _("items"));
                    this.panel.item.desc.apps.text = joli.packages_to_install.length + " " + (joli.packages_to_install.length == 1 ? _("app") : _("apps"));
                    this.panel.item.desc.updates.text = _("1 update");
                    if (joli.packages_to_sync.indexOf("systemupdate") == -1) {
                        this.panel.item.desc.apps.show();
                        this.panel.item.desc.and.hide();
                        this.panel.item.desc.updates.hide()
                    } else {
                        if (joli.packages_to_sync.length == 1) {
                            this.panel.item.desc.apps.hide();
                            this.panel.item.desc.and.hide()
                        } else {
                            this.panel.item.desc.apps.show();
                            this.panel.item.desc.and.show()
                        }
                        this.panel.item.desc.updates.show()
                    }
                    this.showButton();
                    joli.ui.root.content.settings.syncing(false)
                } else this.clear()
            }
        } else this.clear()
    },
    manageUpdate: function (a, b) {
        if (b) {
            joli.packages_to_update = [];
            joli.ui.root.content.settings.upgrading(false);
            joli.each(this.syncedPackages, function (f) {
                if (f["package"] == "systemupdate") {
                    f.state = "failed";
                    f.progress = 1
                }
            }, this);
            joli.each(joli.packages_to_sync, function (f, h) {
                if (f == "systemupdate") {
                    joli.packages_to_sync.splice(h, 1);
                    joli.cloud.apps.saveSystemUpdate();
                    if (joli.packages_to_sync.length > 0) {
                        if (joli.model.apps.instances) {
                            var i = joli.packages_to_sync[0];
                            joli.model.apps.instances[i] ? joli.model.apps.instances[i].install(true) : joli.cloud.apps.id(i, function () {
                                joli.model.apps.instances[i].install(true)
                            }, this)
                        }
                    } else {
                        this.icon.progress.setValue(1);
                        setTimeout(joli.bind(function () {
                            this.sync()
                        }, this), 1E3)
                    }
                }
            }, this)
        } else if (a.status === "finished") {
            joli.packages_to_update = [];
            joli.ui.root.content.settings.upgrading(false);
            joli.each(this.syncedPackages, function (f) {
                if (f["package"] == "systemupdate") {
                    f.state = "installed";
                    f.progress = 1
                }
            }, this);
            joli.each(joli.packages_to_sync, function (f, h) {
                if (f == "systemupdate") {
                    joli.packages_to_sync.splice(h, 1);
                    joli.cloud.apps.saveSystemUpdate();
                    if (joli.packages_to_sync.length > 0) {
                        if (joli.model.apps.instances) {
                            var i = joli.packages_to_sync[0];
                            joli.model.apps.instances[i] ? joli.model.apps.instances[i].install(true) : joli.cloud.apps.id(i, function () {
                                joli.model.apps.instances[i].install(true)
                            }, this)
                        }
                    } else {
                        this.icon.progress.setValue(1);
                        setTimeout(joli.bind(function () {
                            this.sync()
                        }, this), 1E3)
                    }
                }
            }, this)
        } else {
            var c = 0;
            joli.each(this.syncedPackages, function (f) {
                if (f.state == "installed" || f.state == "removed" || f.state == "failed") c += 1
            }, this);
            var d = 0;
            d = 1 / this.total;
            var g = a.progress * d;
            switch (a.status) {
            case "download":
                g = a.progress / 2 * d;
                break;
            case "install":
                g = (a.progress / 2 + 0.5) * d
            }
            this.icon.progress.setValue(d * c + g);
            this.panel.item.title.text = _("Item") + " " + (c + 1) + _(" of ") + this.total;
            this.panel.item.current.text = _("System")
        }
    },
    showApps: function () {
        joli.ui.root.events.menu(null, "settings", true);
        joli.ui.root.content.current._varname != "settings" && window.history.pushState("settings", "settings", "#!/settings");
        joli.ui.root.content.showChild("settings", function () {
            joli.ui.root.content.settings.events.sidebar(null, "myjolicloud|device");
            joli.ui.root.content.settings.stack.content.content.device.tabs.activate("appssync")
        })
    },
    showUpdates: function () {
        joli.ui.root.events.menu(null, "settings", true);
        joli.ui.root.content.current._varname != "settings" && window.history.pushState("settings", "settings", "#!/settings");
        joli.ui.root.content.showChild("settings", function () {
            joli.ui.root.content.settings.events.sidebar(null, "myjolicloud|device");
            joli.ui.root.content.settings.stack.content.content.device.tabs.activate("updates")
        })
    },
    events: {
        start: function () {
            this.hideAction();
            this.active = true;
            joli.ui.root.content.settings.disableSyncButtons();
            this.syncedPackages = [];
            this.icon.status.text = _("Syncing...");
            joli.each(joli.packages_to_sync, function (b) {
                var c = "";
                if (joli.model.apps.instances[b]) c = joli.model.apps.instances[b].name;
                this.syncedPackages.push({
                    "package": b,
                    name: c,
                    state: "preparing",
                    progress: 0
                })
            }, this);
            joli.ui.root.content.settings.syncing(true);
            this.total = joli.packages_to_sync.length;
            var a = joli.packages_to_sync[0];
            if (a == "systemupdate") joli.ui.root.performUpdates();
            else if (joli.model.apps.instances) joli.model.apps.instances[a] ? joli.model.apps.instances[a].install(true) : joli.cloud.apps.id(a, function () {
                joli.model.apps.instances[a].install(true)
            }, this)
        }
    }
});
launcher.ui.extend("Element", joli.ui.Widget, {
    initWidget: function () {
        joli.cloud.joliserver.bind_connection_changed(this.connectionChanged.bind(this));
        this.name.click(this.showElement, this);
        this.icon.click(this.showElement, this);
        this.action.click(function () {
            if (this.model.uuid) joli.cloud.computers.dissociate(this.model.uuid, joli.bind(function () {
                joli.clearLocalRegExp("/computers");
                this.trigger("refreshDevices")
            }, this));
            else if (this.model.actor || this.model.username || typeof this.model.me == "boolean") {
                this.model = this.model.actor ? this.model.actor[this.model.actor.type] : this.model;
                this.model.subscribed === true ? joli.cloud.user.unfollow("user", this.model.username, joli.bind(function () {
                    joli.clearLocalRegExp(this.model.username);
                    joli.clearLocalRegExp("actions?");
                    joli.clearLocalRegExp("subscriptions?");
                    joli.clearLocalRegExp("subscribers?");
                    joli.clearLocalRegExp("friends_likes?");
                    joli.clearLocalRegExp("myself");
                    joli.clearLocalRegExp("_friends");
                    this.action.label.text = _("Follow");
                    this.action.$.addClass("follow");
                    this.action.$.removeClass("unfollow");
                    this.trigger("refreshContent");
                    if (typeof this.model.subscribed != "undefined") this.model.subscribed = false
                }, this)) : joli.cloud.user.follow("user", this.model.username, joli.bind(function () {
                    joli.clearLocalRegExp(this.model.username);
                    joli.clearLocalRegExp("actions?");
                    joli.clearLocalRegExp("subscriptions?");
                    joli.clearLocalRegExp("subscribers?");
                    joli.clearLocalRegExp("friends_likes?");
                    joli.clearLocalRegExp("myself");
                    joli.clearLocalRegExp("_friends");
                    this.action.label.text = _("Unfollow");
                    this.action.$.addClass("unfollow");
                    this.action.$.removeClass("follow");
                    this.trigger("refreshContent");
                    if (typeof this.model.subscribed != "undefined") this.model.subscribed = true
                }, this))
            } else if (this.model.category || this.model.install) this.model.install(false)
        }, this);
        this.star.click(function () {
            if (this.model.category || this.model.install) {
                this.model.liked ? joli.cloud.apps.unlike(this.model["package"], joli.bind(function () {
                    this.model.liked = false;
                    this.model.likes -= 1;
                    this.star.addClass("unstarred");
                    this.star.text = this.model.likes;
                    joli.clearLocalRegExp(this.model["package"]);
                    joli.clearLocalRegExp("apps/favorites?")
                }, this)) : joli.cloud.apps.like(this.model["package"], joli.bind(function () {
                    this.model.liked = true;
                    this.model.likes += 1;
                    this.star.removeClass("unstarred");
                    this.star.text = this.model.likes;
                    joli.clearLocalRegExp(this.model["package"]);
                    joli.clearLocalRegExp("apps/favorites?")
                }, this));
                joli.ui.root.content.dashboard.saveDashboard()
            }
        }, this)
    },
    connectionChanged: function () {
        this.setModel(this.model)
    },
    onModelChanged: function (a) {
        if (a.uuid) {
            this.action.hide();
            this.star.hide();
            this.devices.hide();
            this.badges.hide();
            this.removeClass("user-generated");
            this.name.text = a.name;
            this.description.text = a.model.name;
            this.action.label.text = _("Remove");
            this.icon.src = "data:image/png;base64,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";
            this.icon.$.parent().removeClass("user");
            if (joli.computer && a.uuid == joli.computer.uuid) this.icon.src = "data:image/png;base64,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";
            this.shared.text = a.users_count;
            this.shared.show();
            !joli.cloud.joliserver.connected || joli.computer && a.uuid == joli.computer.uuid ? this.action.hide() : this.action.show()
        } else if (a.actor || a.username || typeof a.me == "boolean") {
            this.star.hide();
            this.badges.hide();
            this.shared.hide();
            this.removeClass("user-generated");
            a = a.actor ? a.actor[this.model.actor.type] : a;
            this.devices.text = a.devices || 0;
            !a.devices && !a.username ? this.devices.hide() : this.devices.show();
            this.name.text = a.name;
            this.icon.src = a.pictures.large;
            this.icon.$.parent().addClass("user");
            this.description.text = a.about ? a.about.replace("\r\n", " ").substring(0, 70) : "";
            if (typeof a.subscribed == "undefined" && this.parent.parent._varname != "newfriends") this.action.hide();
            else {
                if (a.subscribed === true) {
                    this.action.label.text = _("Unfollow");
                    this.action.$.addClass("unfollow")
                } else {
                    this.action.label.text = _("Follow");
                    this.action.$.removeClass("unfollow")
                }
                if (typeof a.username == "undefined" || joli.ui.root.content.currentChild === "user" || a.me) {
                    this.action.hide();
                    this.star.hide()
                } else this.action.show()
            }
            a.badges && joli.each(a.badges, function (b) {
                b.key == "founding_member" && this.star.addClass("founder")
            }, this)
        } else if (a.category || a.install) {
            this.badges.hide();
            this.devices.hide();
            this.shared.hide();
            a.user_generated ? this.addClass("user-generated") : this.removeClass("user-generated");
            this.name.text = a.name;
            this.star.text = a.likes;
            a.liked ? this.star.removeClass("unstarred") : this.star.addClass("unstarred");
            this.star.text = this.model.likes;
            this.star.show();
            this.description.text = a.short_description;
            this.icon.src = a.picture || a.pictures.large;
            this.icon.$.parent().removeClass("user");
            if (typeof a.added == "undefined") this.action.hide();
            else {
                if (a.added) {
                    this.action.label.text = _("Added");
                    this.action.addClass("disabled")
                } else {
                    this.action.label.text = _("Add");
                    this.action.removeClass("disabled")
                }
                this.action.show()
            }
            if (a.mandatory) {
                this.action.label.text = _("Added");
                this.action.addClass("disabled")
            }
        }
    },
    showElement: function () {
        if (this.model.uuid) joli.doNothing();
        else if (this.model.actor || this.model.username) this.showActor();
        else if (this.model.category || this.model.install) this.showApp()
    },
    showActor: function () {
        this.model = this.model.actor ? this.model.actor[this.model.actor.type] : this.model;
        this.model.username !== undefined && this.trigger("showuser", [this.model.username])
    },
    showApp: function () {
        this.trigger("showapp", [this.model["package"]])
    }
});
launcher.locale.fr_FR = {
    Web: "Web",
    Untitled: "Sans titre",
    "This Month": "Ce mois-ci",
    "Name:": "Nom :",
    "Logging out... Please wait.": "D\u00e9connexion en cours... Veuillez patienter.",
    Calculator: "Calculatrice",
    "Get Jolicloud for Chrome": "Jolicloud pour Chrome",
    "Image must be less than 2MB. It will not be synchronized with Jolicloud.": "L'image doit peser moins de 2MB. Elle ne sera pas synchronis\u00e9e avec Jolicloud.",
    Following: "Abonnements",
    "1 update": "1 mise \u00e0 jour",
    today: "aujourd'hui",
    "There's nothing in your Dashboard!": "Il n'y a rien sur votre Dashboard !",
    Item: "\u00c9l\u00e9ment",
    "No results.": "Aucun r\u00e9sultat.",
    "Press ALT+F2 to open the application launcher": "Appuyez sur ALT+F2 pour ouvrir le lanceur d'applications",
    "This device is shared with %{n} other users.": "Cette machine est partag\u00e9e avec %{n} autres utilisateurs.",
    "Add New App": "Ajouter une nouvelle app",
    February: "F\u00e9vrier",
    May: "Mai",
    Page: "Page",
    "System updating...": "Mise \u00e0 jour du syst\u00e8me en cours...",
    "New Friend!": "nouvel ami !",
    "Please choose a name for your device.": "Veuillez choisir un nom pour votre machine.",
    "Is your Web app listed below?": "Votre Web app est-elle list\u00e9e ci-dessous ?",
    "For direct support, contact the application publisher or join a community support group.": "Pour le support, veuillez contacter l'\u00e9diteur de l'application ou rejoignez un groupe de support communautaire.",
    "Full Name": "Nom complet",
    yesterday: "hier",
    apps: "apps",
    "about a minute ago": "il y a une minute",
    History: "Historique",
    Start: "D\u00e9marrer",
    "Complete the Web app creation": "Terminer la cr\u00e9ation de la Web app",
    "Jolicloud Chrome App": "Jolicloud Chrome App",
    Info: "Infos",
    "Options on your background:": "Options pour votre fond d'\u00e9cran :",
    "Are you sure you want to quit your session?": "\u00cates-vous s\u00fbr de vouloir quitter votre session ?",
    "%{n} days ago": "il y a %{n} jours",
    August: "Ao\u00fbt",
    "Your system is synchronized.": "Votre syst\u00e8me est synchronis\u00e9.",
    Users: "Utilisateurs",
    "Log Out": "Se d\u00e9connecter",
    Associate: "Associer",
    "Input Methods": "M\u00e9thodes de saisie",
    "Add a Local App": "Ajouter une app locale",
    Load: "Charger",
    Updates: "Mises \u00e0 jour",
    "Time and Date": "Date et Heure",
    Sound: "Son",
    Size: "Taille",
    Open: "Ouvrir",
    "Thank you.": "Merci.",
    Remove: "Supprimer",
    Keyboard: "Clavier",
    "Support info": "Informations de support",
    "Edit Settings": "\u00c9diter les param\u00e8tres",
    Retry: "R\u00e9essayer",
    Communication: "Communication",
    Video: "Vid\u00e9o",
    Username: "Nom d'utilisateur",
    "Log Off This Account": "Se d\u00e9connecter de ce compte",
    "Thank You": "Merci",
    "Please fill the fields.": "Veuillez remplir tous les champs.",
    Overview: "Aper\u00e7u",
    Launch: "Lancer",
    "If it still happen, please contact us for help by clicking the Contact button.": "Si cela se produit toujours, veuillez cliquer sur le bouton nous contacter afin que nous vous aidions.",
    "My Jolibook": "Mon Jolibook",
    "Get Joli OS 1.2": "Joli OS 1.2",
    January: "Janvier",
    "We have found a configuration problem. Please enter your password to fix it. Your computer will then reboot. Thank you! - The Jolicloud Team": "Nous avons trouv\u00e9 un probl\u00e8me de configuration. Veuillez entre votre mot de passe pour le r\u00e9soudre. Votre ordinateur va ensuite red\u00e9marrer. Merci ! L'\u00e9quipe Jolicloud",
    Badges: "Badges",
    Close: "Fermer",
    Name: "Nom",
    " of ": " sur ",
    "All Apps": "Toutes les apps",
    "You are helping us making Jolicloud better.": "Vous nous aidez \u00e0 am\u00e9liorer Jolicloud.",
    Selection: "S\u00e9lection",
    Graphics: "Graphisme",
    Items: "\u00c9l\u00e9ments",
    "Friends\u2019 Picks": "S\u00e9lection des amis",
    Publishing: "Publication",
    Details: "D\u00e9tails",
    Used: "Utilis\u00e9",
    Gender: "Sexe",
    "Enable automatic login on this device.": "Activer la connexion automatique sur cette machine.",
    "More details": "Plus de d\u00e9tails",
    Select: "Choisir",
    Configuration: "Configuration",
    "Allow a guest to login to this device (Your network connection will restart).": "Autoriser un invit\u00e9 \u00e0 se connecter sur cette machine (votre connexion r\u00e9seau va red\u00e9marrer).",
    Install: "Installer",
    " on disk": " sur le disque",
    "Select a category": "Choisissez une cat\u00e9gorie",
    "Remember you can edit your Web app by going to your Jolicloud settings under the \u201cMy Apps\u201d section.": "Vous pouvez \u00e9diter votre Web app en allant sur les param\u00e8tres Jolicloud dans la rubriques \u201cMes apps\u201d.",
    Preview: "Aper\u00e7u",
    "Please select a PNG or JPG image.": "Veuillez s\u00e9lectionner une image PNG ou JPG.",
    "about an hour ago": "il y a une heure",
    "Thank you for your purchase. Now give a name to your Jolibook. It will help you identify it if you are associating more than one device to your account.": "Merci pour votre achat. Maintenant, choisissez un nom pour votre Jolibook. Cela vous aidera \u00e0 l'identifier si vous associez plus d'une machine \u00e0 votre compte.",
    "Joli OS 1.2": "Joli OS 1.2",
    "Associate this computer": "Associer cet ordinateur",
    "Restarting... Please wait.": "Red\u00e9marrage en cours... Veuillez patienter.",
    "Legacy Apps": "Anciennes apps",
    "You are running an old version of Joli OS": "Vous utilisez une ancienne version de Joli OS",
    "Welcome to your new desktop! Joli OS 1.1 is coming very soon. You'll be notified when the upgrade is available.": "Bienvenur sur votre nouveau bureau ! Joli OS 1.1 arrive bient\u00f4t. Vous serez notifi\u00e9 lorsque la mise \u00e0 jour sera disponible.",
    "Use the Menu key to open the old application menu": "Utiliser la touche Menu pour ouvrir l'ancien menu d'applications",
    Language: "Langue",
    "Create a new Web app": "Cr\u00e9er une nouvelle Web app",
    Icon: "Ic\u00f4ne",
    Games: "Jeux",
    Contact: "Nous contacter",
    "You're offline and logged out from Jolicloud": "Vous \u00eates hors ligne et d\u00e9connect\u00e9 de Jolicloud",
    "Other Device": "Autre machine",
    Productivity: "Productivit\u00e9",
    Back: "Retour",
    Friends: "Amis",
    "All Time": "Depuis toujours",
    Browsers: "Navigateurs",
    "Configuring your computer... Please wait, it can take several minutes. Your computer will then reboot. Thank you! - The Jolicloud Team": "Configuration de votre ordinateur en cours... Veuillez patienter, ceci peut prendre quelques minutes. Votre ordinateur va ensuite red\u00e9marrer. Merci ! - L'\u00e9quipe Jolicloud",
    Category: "Cat\u00e9gorie",
    Jolicloud: "Jolicloud",
    Email: "Email",
    Proxy: "Proxy",
    "Going to sleep... Please wait.": "Mise en veille... Veuillez patienter.",
    "Start Synchronization": "Commencer la sync",
    "New Update": "Nouvelle mise \u00e0 jour",
    "Device Name:": "Nom de la machine :",
    Joliclouding: "Joliclouding",
    app: "app",
    "Name your computer": "Nommez votre ordinateur",
    "New Updates": "Nouvelles mises \u00e0 jour",
    Activities: "Activit\u00e9s",
    Country: "Pays",
    "An error occured, please retry.": "Une erreur est survenue, veuillez r\u00e9essayer.",
    "You are using Joli OS as a guest. Your local changes will not be saved.": "Vous utilisez Joli OS en mode invit\u00e9. Vos changements locaux ne seront pas sauvegard\u00e9s.",
    Type: "Type",
    "Native Apps": "Apps natives",
    "Apps to Sync": "Apps \u00e0 synchroniser",
    Model: "Mod\u00e8le",
    "Select an app in the list": "Choisissez une app dans la liste",
    "Virtual Machine, Tablet, etc...": "Machine virtuelle, tablette, etc.",
    "Update your system before quitting.": "Mettre \u00e0 jour le syst\u00e8me avant de quitter.",
    "Tell us more about your": "D\u00eetes en plus \u00e0 propos de votre",
    "Most Shared": "Plus partag\u00e9es",
    "Your device has less than 5% free space. Please free up some disk space.": "Votre machine a moins de 5% d'espace libre. Veuillez lib\u00e9rer de l'espace disque.",
    "Just click on the button to associate this device to your account. We will take care of the rest.": "Cliquez sur le bouton pour associer cette machine \u00e0 votre compte. Nous nous occupons du reste.",
    Next: "Suivant",
    Finish: "Terminer",
    Search: "Recherche",
    "Define other:": "D\u00e9finir autre :",
    Check: "V\u00e9rifier",
    item: "\u00e9l\u00e9ment",
    Unfollow: "Se d\u00e9sabonner",
    "Thanks for your input. Your information will help the team improve Jolicloud.": "Merci. Ces informations aideront l'\u00e9quipe \u00e0 am\u00e9liorer Jolicloud.",
    "Sorry, something is wrong with your computer configuration. Please contact us for help.": "D\u00e9sol\u00e9, il y a un probl\u00e8me dans la configuration de votre ordinateur. Veuillez nous contacter pour r\u00e9soudre le probl\u00e8me.",
    "KB free": "Ko libres",
    "We just added your new Web app to your Dashboard. If you want to make it public, just share it and your friends will see it!": "Nous avons ajout\u00e9 votre nouvelle Web app \u00e0 votre Dashboard. Si vous souhaitez la mettre publique, partagez l\u00e0 et vos amis pourront la voir !",
    "Stretch to fill screen.": "\u00c9tendre pour remplir l'\u00e9cran.",
    "Once you log out, all your local data will be erased.": "Une fois d\u00e9connect\u00e9, toutes vos donn\u00e9es locales seront effac\u00e9es.",
    Restart: "Red\u00e9marrer",
    "Activity Monitor": "Moniteur d'activit\u00e9",
    "Local Apps": "Apps locales",
    "Your settings will be synced automatically.": "Vos param\u00e8tres seront synchronis\u00e9s automatiquement.",
    "Please select an image less than 600kb.": "Veuillez s\u00e9lectionner une image de moins de 600Ko.",
    "None of your friends shared it yet.": "Aucun de vos amis ne l'a partag\u00e9e pour l'instant.",
    Education: "\u00c9ducation",
    "Define your model": "D\u00e9finissez votre mod\u00e8le",
    "Add-ons": "Add-ons",
    Support: "Support",
    Dashboard: "Dashboard",
    "MB free": "Mo libres",
    "Please connect to the Internet and log into Jolicloud. While offline, you can still:": "Veuillez vous connecter \u00e0 Internet et \u00e0 Jolicloud. Lorsque vous \u00eates hors ligne, vous pouvez encore :",
    Clear: "Effacer",
    "Default Language": "Langue par d\u00e9faut",
    KB: "Ko",
    "Keyboard issue?": "Probl\u00e8me de clavier ?",
    Add: "Ajouter",
    Devices: "Machines",
    "Jolicloud Wallpapers": "Fonds d'\u00e9cran Jolicloud",
    Dictionary: "Dictionnaire",
    "Apps Sync": "Synchronisation des apps",
    Followers: "Abonn\u00e9s",
    "Install Joli OS now.": "Installer Joli OS maintenant.",
    "Social Networks": "R\u00e9seaux sociaux",
    "New Friends!": "nouveaux amis !",
    October: "Octobre",
    "You can update now or get the new version the next time your restart.": "Vous pouvez mettre \u00e0 jour maintenant ou r\u00e9cup\u00e9rer la nouvelle version lors du prochain red\u00e9marrage.",
    "Movie Player": "Lecteur vid\u00e9o",
    "Jolicloud Launcher has been updated.": "Jolicloud Launcher a \u00e9t\u00e9 mis \u00e0 jour.",
    items: "\u00e9l\u00e9ments",
    Website: "Site Web",
    "Sound Recorder": "Enregistreur de son",
    Files: "Fichiers",
    Drives: "Disques",
    Music: "Musique",
    Laptop: "Portable",
    "click here to update your system": "cliquez ici pour mettre \u00e0 jour votre syst\u00e8me",
    "Start Update": "Commencer la mise \u00e0 jour",
    Network: "R\u00e9seau",
    "Guest Mode": "Mode Invit\u00e9",
    "Add some Apps!": "Ajoutez quelques apps !",
    "Please give a name to your Jolibook.": "Veuillez donner un nom \u00e0 votre Jolibook.",
    "This Device": "Cette machine",
    Stream: "Stream",
    September: "Septembre",
    Available: "Disponible",
    "Instantly launch Jolicloud from your Chrome browser.": "Lancez instantan\u00e9ment Jolicloud depuis votre navigateur Chrome.",
    Update: "Mise \u00e0 jour",
    "Shut Down": "\u00c9teindre",
    "Auto-Login": "Connexion automatique",
    "Shared Apps": "Apps partag\u00e9es",
    Female: "Femme",
    "My Jolicloud": "Mon Jolicloud",
    "Describe your device": "D\u00e9crivez votre machine",
    "Edit Connection": "\u00c9diter la connexion",
    "You are running Joli OS in demo mode so your changes will not be saved.": "Vous utilisez Joli OS en mode d\u00e9mo, vos changements ne seront pas sauvegard\u00e9s.",
    "Web Apps": "Web Apps",
    Power: "Gestion d'\u00e9nergie",
    "Please describe the device you're using.": "Veuillez d\u00e9crire la machine que vous utilisez.",
    Loading: "Chargement",
    Previous: "Pr\u00e9c\u00e9dent",
    "%{n} minutes ago": "il y a %{n} minutes",
    "Sync Ready": "Sync pr\u00eate",
    "Go to": "Naviguer vers",
    "Enter your URL here": "Entrez votre URL ici",
    "Search apps and friends": "Chercher des apps et des amis",
    Office: "Bureautique",
    "Have fun!": "Amusez-vous bien !",
    Added: "Ajout\u00e9",
    Apps: "Apps",
    "GB free": "Go libres",
    "Your Wallpapers": "Vos fonds d'\u00e9cran",
    "Take Screenshot": "Capture d'\u00e9cran",
    Settings: "Param\u00e8tres",
    "Please confirm your email address.": "Veuillez confirmer votre adresse email.",
    Brand: "Marque",
    Netbook: "Netbook",
    "Back to Dashboard": "Retour au Dashboard",
    "Breathe new life into any computer up to 10 years old.": "Redonnez la vie \u00e0 n'importe quel ordinateur jusqu'\u00e0 10 ans d'\u00e2ge.",
    "Loading...": "Chargement...",
    Monitors: "Moniteurs",
    April: "Avril",
    " items": " \u00e9l\u00e9ments",
    Folders: "Dossiers",
    Media: "M\u00e9dias",
    "Report this app": "Signaler cette app",
    "Top Members": "Top membres",
    Male: "Homme",
    Enterprise: "Entreprise",
    "No, Continue": "Non, continuer",
    GB: "Go",
    "Creation complete!": "Cr\u00e9ation termin\u00e9e !",
    "Welcome!": "Bienvenue !",
    "Text Editor": "\u00c9diteur de texte",
    "Featured Apps": "Apps \u00e0 la une",
    "My Joli Computer": "Ma Joli Machine",
    Cancel: "Annuler",
    "We will take care of the apps updates.": "Nous allons prendre en charge les mises \u00e0 jour d'applications.",
    "Unable to preview.": "\u00c9chec de la pr\u00e9visualisation.",
    Desktop: "Desktop",
    July: "Juillet",
    "about %{n} hours ago": "il y a %{n} heures",
    "Your URL is invalid.": "Votre URL n'est pas valide.",
    "We will take care of the system updates.": "Nous allons prendre en charge les mises \u00e0 jour syst\u00e8me.",
    December: "D\u00e9cembre",
    "Local Settings": "Param\u00e8tres locaux",
    "Get Started": "D\u00e9marrer",
    "App to Sync": "Apps \u00e0 synchroniser",
    Storage: "Stockage",
    Modified: "Modifi\u00e9",
    "Open in Folder": "Ouvrir le r\u00e9pertoire",
    "More Apps": "Plus d'apps",
    "less than a minute ago": "il y a moins d'une minute",
    "Syncing...": "Sync en cours...",
    Publisher: "\u00c9diteur",
    Developers: "D\u00e9veloppeurs",
    Searching: "Recherche en cours",
    "Top UK Apps": "Top apps UK",
    "Shutting down... Please wait.": "Extinction en cours... Veuillez patienter.",
    "Link to my": "Lier \u00e0 mon",
    "Search on Jolicloud": "Rechercher sur Jolicloud",
    Account: "Compte",
    June: "Juin",
    "My Apps": "Mes apps",
    "This device is shared with 1 other user.": "Cette machine est partag\u00e9e avec 1 autre utilisateur.",
    "Social Media": "M\u00e9dias sociaux",
    MB: "Mo",
    "Search on Google": "Rechercher sur Google",
    More: "Plus",
    "Travel & Lifestyle": "Voyage & Mode de vie",
    "There is an error in listing the models, press F5 to retry.": "Il y a une erreur dans l'affichage des mod\u00e8les, pressez F5 pour r\u00e9essayer.",
    Capacity: "Capacit\u00e9",
    "Most Recent": "Plus r\u00e9centes",
    You: "Vous",
    "Use an image online:": "Utiliser une image en ligne :",
    Birthday: "Anniversaire",
    "Choose a name for this device. It will help you identify it if you are associating more than one device to your account.": "Veuillez choisir un nom pour cette machine. Cela vous aidera \u00e0 l'identifier si vous associez plus d'un machine \u00e0 votre compte.",
    "Your apps are synchronized.": "Vos applications sont synchronis\u00e9es.",
    "Use a local image:": "Utiliser une image locale :",
    Since: "Depuis",
    "Sign In": "Se connecter",
    "Select the brand and the model of your device. If it's not in the list, that's okay, just select \u201cOther\u201d in the list and give us the details.": "Choisissez la marque et le mod\u00e8le de votre machine. Si elle n'est pas pr\u00e9sente, ce n'est pas grave, choisissez \u201cOther\u201d dans la liste et donnez-nous des d\u00e9tails.",
    Example: "Exemple",
    March: "Mars",
    Description: "Description",
    "Friends who shared it": "Amis ayant partag\u00e9 cette app",
    "To use Jolicloud you need to associate this device to your account:": "Pour utiliser Jolicloud, vous devez associer cette machine \u00e0 votre compte :",
    "Web Browser": "Navigateur Web",
    URL: "URL",
    "1 day ago": "il y a 1 jour",
    "You are running Joli OS as a guest. Your local changes will not be saved.": "Vous utilisez Joli OS en mode invit\u00e9. Vos changements locaux ne seront pas sauvegard\u00e9s.",
    Shutdown: "Extinction",
    November: "Novembre",
    "Please tell us the brand and/or model you're using.": "Veuillez indiquer la marque et le mod\u00e8le de votre machine.",
    System: "Syst\u00e8me",
    "Sorry, it seems there is something wrong with your device configuration. You can retry the activation process by clicking on the Retry button.": "D\u00e9sol\u00e9, il y a un soucis avec la configuration de votre machine. Vous pouvez r\u00e9essayer la proc\u00e9dure d'activation en cliquant sur le bouton R\u00e9essayer.",
    Follow: "S'abonner",
    Sleep: "Mettre en veille",
    "User Created Web App": "Web app utilisateur",
    "Sorry, no results.": "D\u00e9sol\u00e9, aucun r\u00e9sultat.",
    Continue: "Continuer",
    "Please select one of the options below.": "Veuillez choisir l'une des options ci-dessous.",
    Mouse: "Souris",
    Creating: "Cr\u00e9ation en cours",
    "We've detected that you're using Jolicloud on the device": "Nous avons detect\u00e9 que vous utilisez Jolicloud sur la machine",
    "Upgrade to 1.1": "Mise \u00e0 jour vers Jolicloud 1.1",
    "Other Settings": "Autres param\u00e8tres",
    "Jolicloud provides these links only for information purposes and is not providing support for this application.": "Jolicloud donne ces liens uniquement \u00e0 titre d'information et ne propose pas de support pour cette application."
};
launcher.ui.files.extend("Details", joli.ui.Widget, {
    initWidget: function () {
        this.preview.click(function () {
            if (this.model.service == "dropbox" && this.model.mime_type) joli.cloud.dropbox.get(joli.getFileAttribute(this.model, "path"), function (d) {
                var g = this.model.path;
                joli.ui.root.previewbox.show(g.split("/")[g.split("/").length - 1], d.url, this.model.mime_type, undefined, 0, 0, this.model)
            }, this);
            else if (this.model.service == "googledocs" && this.model.preview) {
                var a = this.model.path,
                    b = this.model.preview,
                    c = this.model.open.indexOf("leaf") == -1 ? "iframe" : this.model.mime_type;
                joli.ui.root.previewbox.show(a.split("/")[a.split("/").length - 1], b, c, undefined, 0, 0, this.model)
            } else if (this.model.service != "dropbox" && this.isPreviewSupported(this.model.mime_type)) {
                a = this.model.path;
                joli.ui.root.previewbox.show(a.split("/")[a.split("/").length - 1], "http://" + joli.config.systemUri + "/get_file.rpy?root=" + encodeURIComponent(this.model.root) + "&path=" + encodeURIComponent(this.model.path), this.model.mime_type, undefined, 0, 0, this.model)
            }
        }, this)
    },
    onModelChanged: function (a) {
        this.saveas.hide();
        if (a.path) {
            var b = a.path.split("/");
            this.name.text = b[b.length - 1];
            if (a.modified) {
                this.modified.value.text = joli.getFilesReadableDate(a.modified);
                this.modified.show()
            } else this.modified.hide();
            if (a.items != undefined) {
                this.items.value.text = a.items + _(" items");
                this.items.show()
            } else this.items.hide();
            if (a.thumb != "folder" && a.bytes && a.bytes != 0) {
                this.size.value.text = joli.getFilesReadableSize(a.bytes) + _(" on disk");
                this.size.show()
            } else this.size.hide();
            if (a.thumb) if (a.thumb == "folder") {
                this.thumbnail.src = "data:image/png;base64,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";
                this.thumbnail.show()
            } else if (a.thumb == "file") {
                this.thumbnail.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABUxJREFUeNrsW19PE0EQv5ZSaYsJlVShirHGxCg8AR9An3jiM+hH008in8DwYEh8wqCEQGLoH+w/CrjT7DTDdG5vr7d3h3KbTO5ub3u785uZ38zeQe7m5sa7zy3v3fOWAZABkAGQAZABkAFwj1vBdmAul7t1fXBwcINFlN/R715Q8bW2tuZVq9WPhULhswslTfMVojy41Wp5g8HglnLX19dTivI+FOiXFler1eDwaTQaea5AcA4AeAQsEAHwU47K1dXVVB88A8cjUPhMNUfsIMzMAfl8fgwCHLnMzc1NhF4rRSaCY+fn58eC96Hv9PR0Aoz2hA93zgPQC2DBkgdAP45BC4OSeJ/2gwAIeI33tPVj9YRCFA9AL8AFc5FIFMKA/gZBxJDBe8gZcYNQiGp99AAOApIf9wTKzNTaCAIFIAkQnISApBANA3qP3qdhQL0B++jv4wLBmQdAwxhH69NzGv/cUygQ2DBjYJjFBUI+AgA/isXiVAZAKyP7+2UKOp5mCgyFy8vLscIABK0jXGeHKB7wQy34BcYrrxR5GKASNoQJDRXFZyA4eM+VJ0QKARqznPQkPuCx70eY0DccDsdK0vBBEEBcgeC0DqDK+wFhS5gAABxBSeiDshvCAcYtLy97EH4uQIhUB9AcztMcKkMVoyCYCBNK4YuLC+/k5MQ7Pj72Dg8PvV6vN5Z+vz/mB2gbGxve+vq6t7W1BaDMBELO9rU4j/Gjo6MvakHvOp3OpI+SlbT5MW2SKBDtdttrNpsThbvd7uQcgUAQsC0tLXk7Ozt7u7u77xPbDaIn4ATc2hLp2RAmtFKpNMU34DW00QyxubnpNRqNdEth7jG2pEdDiO4NcB5UHMfj3ADA6urqOAzq9foUsImQICxOIjoOBAfFRJjgzrh9xnoABM/L5fL4N5VK5VZ6TRQANVmTWkSKea48t7ZEmGhxfMbCwoLIE7zC1B7TTLIS3Mf9Oy2GqBK0VsAxUsXoV0mGqTABAHXcT7QQoq7HLU8JkoeAS8JMLQSkSSUgpD4TYUrXNhXmLMo7L4Ul4uN7fBvC5JnDpsLEUEgcAG5lrgx3dZeEKYVQKiHA3Z1bXnJtabwpVfplmyjx7zQEJAKk6YsCFYYwTdaW+CaVEPBbkMQJsxCmFFoSsKkBILk5DQNp4UGEaQJBCiesDZLkgD2cVIppKWbDECYltSDChHMoymBNiXoAd3U/IEzu7oIw/cIs1UJIcmUTAYYlTKkKTJwDeCr0Iz0bjwhLmFLmSDwNUivNgr5LwpylCnQWAtzVwyrvgjBT+TTGy0/K2iaXNhGmDQFKhJlKJei3XTURoI2SQXEvEWaqHGBaSFxASGkw6RDYh0mhAMEPmSY+COKJIEuaCBMLsrOzs2+hDTnrdwHwxna7fQUfMeh7uqC/EOObmqBx/E2Q9BwwArwgXVlZWVTdf5L6LlC24YIgQG0MEESYZB54M1pUMow7BGCSkrQlDgNEUNyH4Qk9R1nr9BseHycAVQ2C75bYBIRrwiRreKbklxIIhU5cADxUAi/r66Z6wER4rgmTAPBcKw6h0FMycv1dAMbXNMIv+TsBXh3ybwZ+4+l7/zC/FzZBFSWvNQC1ODwAHvpAT7LkV4WZ8nVYnrAhTALUopZTDUJLSdeVB8ADHyt5pOQVoM0zgMkjuJWDxtt6C9sEVbRsa+M+dekBDQ3CWyTA4XB4XiwWq6Z8a9MX9lqqEfr9/jmuSx8bmhCXdVaIXAht61NA9Y0G4642cPuvmhA7SsfvLgBYU4cn3r/VBkp+Kh2bkQH4X1v2P0MZABkAGQD3uv0VYAChgy0UHXXGjAAAAABJRU5ErkJggg==";
                this.thumbnail.show()
            } else if (a.thumb == "googledocs") {
                this.thumbnail.src = a.thumb_path;
                this.thumbnail.show()
            } else if (a.thumb == "dropbox") {
                this.thumbnail.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABUxJREFUeNrsW19PE0EQv5ZSaYsJlVShirHGxCg8AR9An3jiM+hH008in8DwYEh8wqCEQGLoH+w/CrjT7DTDdG5vr7d3h3KbTO5ub3u785uZ38zeQe7m5sa7zy3v3fOWAZABkAGQAZABkAFwj1vBdmAul7t1fXBwcINFlN/R715Q8bW2tuZVq9WPhULhswslTfMVojy41Wp5g8HglnLX19dTivI+FOiXFler1eDwaTQaea5AcA4AeAQsEAHwU47K1dXVVB88A8cjUPhMNUfsIMzMAfl8fgwCHLnMzc1NhF4rRSaCY+fn58eC96Hv9PR0Aoz2hA93zgPQC2DBkgdAP45BC4OSeJ/2gwAIeI33tPVj9YRCFA9AL8AFc5FIFMKA/gZBxJDBe8gZcYNQiGp99AAOApIf9wTKzNTaCAIFIAkQnISApBANA3qP3qdhQL0B++jv4wLBmQdAwxhH69NzGv/cUygQ2DBjYJjFBUI+AgA/isXiVAZAKyP7+2UKOp5mCgyFy8vLscIABK0jXGeHKB7wQy34BcYrrxR5GKASNoQJDRXFZyA4eM+VJ0QKARqznPQkPuCx70eY0DccDsdK0vBBEEBcgeC0DqDK+wFhS5gAABxBSeiDshvCAcYtLy97EH4uQIhUB9AcztMcKkMVoyCYCBNK4YuLC+/k5MQ7Pj72Dg8PvV6vN5Z+vz/mB2gbGxve+vq6t7W1BaDMBELO9rU4j/Gjo6MvakHvOp3OpI+SlbT5MW2SKBDtdttrNpsThbvd7uQcgUAQsC0tLXk7Ozt7u7u77xPbDaIn4ATc2hLp2RAmtFKpNMU34DW00QyxubnpNRqNdEth7jG2pEdDiO4NcB5UHMfj3ADA6urqOAzq9foUsImQICxOIjoOBAfFRJjgzrh9xnoABM/L5fL4N5VK5VZ6TRQANVmTWkSKea48t7ZEmGhxfMbCwoLIE7zC1B7TTLIS3Mf9Oy2GqBK0VsAxUsXoV0mGqTABAHXcT7QQoq7HLU8JkoeAS8JMLQSkSSUgpD4TYUrXNhXmLMo7L4Ul4uN7fBvC5JnDpsLEUEgcAG5lrgx3dZeEKYVQKiHA3Z1bXnJtabwpVfplmyjx7zQEJAKk6YsCFYYwTdaW+CaVEPBbkMQJsxCmFFoSsKkBILk5DQNp4UGEaQJBCiesDZLkgD2cVIppKWbDECYltSDChHMoymBNiXoAd3U/IEzu7oIw/cIs1UJIcmUTAYYlTKkKTJwDeCr0Iz0bjwhLmFLmSDwNUivNgr5LwpylCnQWAtzVwyrvgjBT+TTGy0/K2iaXNhGmDQFKhJlKJei3XTURoI2SQXEvEWaqHGBaSFxASGkw6RDYh0mhAMEPmSY+COKJIEuaCBMLsrOzs2+hDTnrdwHwxna7fQUfMeh7uqC/EOObmqBx/E2Q9BwwArwgXVlZWVTdf5L6LlC24YIgQG0MEESYZB54M1pUMow7BGCSkrQlDgNEUNyH4Qk9R1nr9BseHycAVQ2C75bYBIRrwiRreKbklxIIhU5cADxUAi/r66Z6wER4rgmTAPBcKw6h0FMycv1dAMbXNMIv+TsBXh3ybwZ+4+l7/zC/FzZBFSWvNQC1ODwAHvpAT7LkV4WZ8nVYnrAhTALUopZTDUJLSdeVB8ADHyt5pOQVoM0zgMkjuJWDxtt6C9sEVbRsa+M+dekBDQ3CWyTA4XB4XiwWq6Z8a9MX9lqqEfr9/jmuSx8bmhCXdVaIXAht61NA9Y0G4642cPuvmhA7SsfvLgBYU4cn3r/VBkp+Kh2bkQH4X1v2P0MZABkAGQD3uv0VYAChgy0UHXXGjAAAAABJRU5ErkJggg==";
                this.thumbnail.show();
                joli.cloud.dropbox.thumbnail(a.path, function (g) {
                    if (navigator.userAgent.toLowerCase().indexOf("firefox") != -1 || navigator.userAgent.toLowerCase().indexOf("chrome") != -1) {
                        var f = $("<img/>");
                        f.attr("src", g.url);
                        f.bind("load", joli.bind(function () {
                            this.thumbnail.src = f.attr("src")
                        }, this))
                    } else this.thumbnail.src = g.url
                }, this)
            } else {
                this.thumbnail.src = a.thumb;
                this.thumbnail.show()
            } else {
                this.thumbnail.src = "";
                this.thumbnail.hide()
            }
            if (a.desc) this.desc.text = a.desc;
            this.desc.hide();
            if (a.quota) {
                this.fillPie(a.quota);
                this.setTotalReadableSize(a.quota.total, a.quota.total - a.quota.used, a.quota.used);
                this.diskspace.show();
                this.capacity.show();
                this.available.show();
                this.used.show();
                this.open.hide();
                this.openfolder.hide();
                this.open._element.childNodes[1].removeAttribute("href");
                this.open._element.childNodes[1].removeAttribute("target");
                this.open.unbind("click");
                if (a.service == "dropbox") {
                    this.open._element.childNodes[1].setAttribute("href", "https://www.dropbox.com/home#:::");
                    this.open._element.childNodes[1].setAttribute("target", "_blank");
                    this.open.show()
                }
                if (a.service == "googledocs") {
                    this.open._element.childNodes[1].setAttribute("href", "https://docs.google.com");
                    this.open._element.childNodes[1].setAttribute("target", "_blank");
                    this.open.show()
                }
            } else {
                this.diskspace.hide();
                this.capacity.hide();
                this.available.hide();
                this.used.hide();
                this.open.hide();
                this.open._element.childNodes[1].removeAttribute("href");
                this.open._element.childNodes[1].removeAttribute("target");
                this.open.unbind("click");
                if (a.service == "dropbox") if (a.thumb != "folder") {
                    this.open._element.childNodes[1].setAttribute("href", joli.cloud.dropbox.server.options.baseUrl + "files/dropbox/redirect?path=" + a.path);
                    this.open._element.childNodes[1].setAttribute("target", "_blank");
                    this.open.unbind("click");
                    this.open.show();
                    if (navigator.userAgent.toLowerCase().indexOf("ipad") == -1) {
                        this.saveas._element.children[0].setAttribute("href", joli.cloud.dropbox.server.options.baseUrl + "files/dropbox/redirect?path=" + a.path);
                        this.saveas._element.children[0].setAttribute("target", "_blank");
                        this.saveas.show()
                    }
                } else {
                    var c = this.model.path;
                    if (c == "/") c = "";
                    c = c.split("/");
                    var d = "";
                    joli.each(c, function (g, f) {
                        if (f < c.length) d += "/" + g
                    });
                    d = d.replace("//", "/");
                    this.open._element.childNodes[1].setAttribute("href", "https://www.dropbox.com/home#" + d + ":::");
                    this.open._element.childNodes[1].setAttribute("target", "_blank");
                    this.open.unbind("click");
                    this.open.show()
                } else if (a.service == "googledocs") if (a.thumb != "folder") {
                    this.open._element.childNodes[1].setAttribute("href", a.open);
                    this.open._element.childNodes[1].setAttribute("target", "_blank");
                    this.open.unbind("click");
                    this.open.show()
                } else this.open.hide();
                else {
                    this.open._element.childNodes[1].removeAttribute("href");
                    this.open._element.childNodes[1].removeAttribute("target");
                    this.open.unbind("click");
                    this.open.click(function () {
                        a.service != "dropbox" && joli.system.filesystem.open(a.path, a.root)
                    }, this);
                    this.open.show()
                }
                if (a.thumb != "folder") if (this.model.service != "dropbox" && this.model.service != "googledocs") {
                    this.openfolder._element.childNodes[1].removeAttribute("href");
                    this.openfolder._element.childNodes[1].removeAttribute("target");
                    this.openfolder.unbind("click");
                    this.openfolder.click(function () {
                        var g = this.model.path;
                        if (g == "/") g = "";
                        else {
                            pathsplit = this.model.path.split("/");
                            g = "";
                            joli.each(pathsplit, function (f, h) {
                                if (h > 0 && h < pathsplit.length - 1) g += "/" + f
                            }, this)
                        }
                        joli.system.filesystem.open(g, this.model.root)
                    }, this);
                    this.openfolder.show()
                } else {
                    if (this.model.service != "googledocs") {
                        c = this.model.path;
                        if (c == "/") c = "";
                        c = c.split("/");
                        d = "";
                        joli.each(c, function (g, f) {
                            if (f < c.length - 1) d += "/" + g
                        });
                        d = d.replace("//", "/");
                        this.openfolder._element.childNodes[1].setAttribute("href", "https://www.dropbox.com/home#" + d + ":::");
                        this.openfolder._element.childNodes[1].setAttribute("target", "_blank");
                        this.openfolder.unbind("click");
                        this.openfolder.show()
                    }
                } else {
                    this.openfolder._element.childNodes[1].removeAttribute("href");
                    this.openfolder._element.childNodes[1].removeAttribute("target");
                    this.openfolder.unbind("click");
                    this.openfolder.hide()
                }
            }
            this.isPreviewSupported(a) ? this.preview.show() : this.preview.hide();
            this.removeClass("hide")
        }
    },
    isPreviewSupported: function (a) {
        var b = ["image/png", "image/jpg", "image/jpeg", "audio/mpeg", "video/"],
            c = false;
        a.mime_type && joli.each(b, function (d) {
            if (a.mime_type.indexOf(d) != -1) c = true
        }, this);
        if (this.model.service == "googledocs" && this.model.preview) c = true;
        return c
    },
    fillPie: function (a) {
        a = a.used / a.total;
        if (a == 1) a += 1.00010001E-4;
        var b = this.diskspace._element,
            c = b.getContext("2d"),
            d = [b.width, b.height],
            g = Math.min(d[0], d[1]) / 2,
            f = [d[0] / 2, d[1] / 2];
        c.clearRect(0, 0, b.width, b.height);
        b = c.createLinearGradient(0, 0, 0, d[1]);
        b.addColorStop(0, "#FEFEFE");
        b.addColorStop(1, "#757880");
        d = c.createLinearGradient(0, 0, 0, d[1]);
        d.addColorStop(0, "#363943");
        d.addColorStop(1, "#17181D");
        d = [b, d];
        c.beginPath();
        c.moveTo(f[0], f[1]);
        c.arc(f[0], f[1], g - 10, 0 * Math.PI, 2 * Math.PI, false);
        c.lineTo(f[0], f[1]);
        c.closePath();
        c.fillStyle = d[1];
        c.shadowOffsetX = 0;
        c.shadowOffsetY = 0;
        c.shadowBlur = 2;
        c.shadowColor = "#000";
        c.fill();
        c.beginPath();
        c.moveTo(f[0], f[1]);
        c.arc(f[0], f[1], g - 10, Math.PI * -0.5, Math.PI * (-0.5 + 2 * (0 + a)), false);
        c.lineTo(f[0], f[1]);
        c.closePath();
        c.fillStyle = d[0];
        c.fill()
    },
    setTotalReadableSize: function (a, b) {
        var c = a / 1024,
            d = c / 1024,
            g = d / 1024,
            f = "",
            h = 0;
        if (g > 1) {
            h = parseFloat(g).toFixed(1);
            f = _("GB")
        } else if (d > 1) {
            h = Math.floor(d).toFixed(1);
            f = _("MB")
        } else {
            h = c > 1 ? Math.floor(c).toFixed(1) : parseFloat(c).toFixed(2);
            f = _("KB")
        }
        console.log(h, f);
        c = b / 1024;
        d = c / 1024;
        g = d / 1024;
        var i = 0;
        i = f == _("GB") ? parseFloat(g).toFixed(1) : f == _("MB") ? parseFloat(d).toFixed(1) : f == _("KB") ? parseFloat(c).toFixed(1) : parseFloat(c).toFixed(2);
        console.log(i, f);
        c = (h - i).toFixed(1);
        h += "";
        if (h.indexOf(".0") == h.length - 2) h = h.replace(".0", "");
        if (h == "0.00") h = "0";
        i += "";
        if (i.indexOf(".0") == i.length - 2) i = i.replace(".0", "");
        if (i == "0.00") i = "0";
        c += "";
        if (c.indexOf(".0") == c.length - 2) c = c.replace(".0", "");
        if (c == "0.00") c = "0";
        this.capacity.value.text = h + " " + f;
        this.available.value.text = i + " " + f;
        this.used.value.text = c + f
    }
});
launcher.ui.files.extend("Breadcrumb", joli.ui.Widget, {
    initWidget: function () {
        this.action.click(function () {
            this.trigger("getfiles", [joli.getFileAttribute(this.model, "path"), joli.getFileAttribute(this.model, "service"), joli.getFileAttribute(this.model, "root"), joli.getFileAttribute(this.model, "docs_path"), joli.getFileAttribute(this.model, "ids_docs_path")])
        }, this)
    },
    onModelChanged: function (a) {
        this.action.name.text = a.name.charAt(0).toUpperCase() + a.name.slice(1)
    }
});
launcher.ui.files.extend("Files", joli.ui.Widget, {
    defaultSort: "name_asc",
    sortValues: {},
    data: {},
    loaded: {
        jolicloud: false,
        drives: false,
        dropbox: false,
        googledocs: false
    },
    selectedItem: null,
    events: {
        sidebar: function (a, b) {
            var c = joli.bind(function () {
                this.showChild(b)
            }, this);
            if (b == "local|oldfolders") this.getFolders(c);
            else if (b == "local|olddrives") this.getDrives(c);
            else if (b == "local|jolicloud" && !this.loaded.jolicloud) this.getFolders(c);
            else if (b == "web|dropbox" && !this.loaded.dropbox) this.getDropbox(c);
            else if (b == "web|googledocs" && !this.loaded.googledocs) this.getGoogledocs(c);
            else {
                var d = b.replace("local|", ""),
                    g = true;
                joli.each(this.drives, function (f) {
                    if (g && f.udi == d) {
                        g = false;
                        this.getAccountInfo("drive", d);
                        joli.system.filesystem.list("", f.properties.DeviceMountPaths[0], function (h) {
                            this.showFiles(h, "drive");
                            c()
                        }, this)
                    }
                }, this);
                g && c()
            }
            a.preventDefault()
        },
        local_reclick: function (a, b) {
            if (b == "jolicloud") this.getFolders();
            else {
                var c = true;
                joli.each(this.drives, function (d) {
                    if (c && d.udi == b) {
                        c = false;
                        this.getAccountInfo("drive", b);
                        joli.system.filesystem.list("", d.properties.DeviceMountPaths[0], function (g) {
                            this.showFiles(g, "drive")
                        }, this)
                    }
                }, this)
            }
        },
        web_reclick: function (a, b) {
            var c = joli.bind(function () {
                this.showChild("web|" + b)
            }, this);
            b == "dropbox" && this.getDropbox(c);
            b == "googledocs" && this.getGoogledocs(c)
        },
        details: function (a, b, c) {
            b && c && this.setDetails(b, c)
        },
        getfiles: function (a, b, c, d, g, f) {
            b && c && this.getFiles(b, c, d, g, f)
        }
    },
    folders: [],
    drives: [],
    systemConnectionChanged: function (a, b) {
        if (b) {
            this.sidebar.getItem("local").show();
            joli.ui.root.menu.getItem("files").enabled = true;
            this.getDrives()
        } else {
            this.sidebar.getItem("local").hide();
            joli.each(this.drives, function (c) {
                try {
                    this.sidebar.getItem("local").removeItem(this.sidebar.getItem("local|" + c.udi))
                } catch (d) {}
            }, this);
            this.drives = []
        }
    },
    connectionChanged: function (a, b) {
        if (b) {
            this.sidebar.getItem("web").show();
            joli.ui.root.menu.getItem("files").enabled = true;
            this.sidebar.getItem("connections").show()
        } else {
            if (!joli.computer || joli.computer && !joli.computer.version) {
                if (joli.ui.root.content.current && joli.ui.root.content.current._varname == "files") {
                    joli.ui.root.events.menu(null, "dashboard");
                    joli.ui.root.content.showChild("dashboard")
                }
                joli.ui.root.menu.getItem("files").enabled = false
            }
            this.sidebar.getItem("web").hide();
            this.sidebar.getItem("connections").hide()
        }
    },
    onAttached: function () {
        this.bindMethod("onDriveAdded");
        this.bindMethod("onDriveRemoved");
        this.bindMethod("onDriveChanged");
        joli.cloud.joliserver.bind_connection_changed(this.connectionChanged.bind(this));
        joli.system.websocketserver.bind_connection_changed(this.systemConnectionChanged.bind(this));
        this.sidebar.getItem("connections").items[0].unbind("click");
        var a = this.sidebar.getItem("connections").items[0]._element.children[0];
        a.setAttribute("href", "/settings/connections");
        a.setAttribute("target", "_blank");
        var b = this;
        a = function (c) {
            if (b.stack.content.dropboxconnect.label.text == _("Refresh")) {
                b.getDropbox(joli.bind(function () {
                    b.showChild("web|dropbox")
                }, b));
                c.stopPropagation();
                return false
            } else {
                b.stack.content.dropboxconnect.label.text = _("Refresh");
                return true
            }
        };
        $(this.stack.content.dropboxconnect._element.children[0]).bind("click", a);
        $(this.stack.content.dropboxconnect._element.children[1].children[0]).bind("click", a);
        a = function (c) {
            if (b.stack.content.googledocsconnect.label.text == _("Refresh")) {
                b.getGoogledocs(joli.bind(function () {
                    b.showChild("web|googledocs")
                }, b));
                c.stopPropagation();
                return false
            } else {
                b.stack.content.googledocsconnect.label.text = _("Refresh");
                return true
            }
        };
        $(this.stack.content.googledocsconnect._element.children[0]).bind("click", a);
        $(this.stack.content.googledocsconnect._element.children[1].children[0]).bind("click", a);
        joli.each(["jolicloud", "drive", "dropbox", "googledocs"], function (c) {
            this.stack.content[c].sort_name.click(function () {
                this.sortValues[c] = this.sortValues[c] == "name_asc" ? "name_desc" : "name_asc";
                this.setVisualSort(c);
                this.showFiles(this.data[c], c)
            }, this);
            this.stack.content[c].sort_size.click(function () {
                this.sortValues[c] = this.sortValues[c] == "size_asc" ? "size_desc" : "size_asc";
                this.setVisualSort(c);
                this.showFiles(this.data[c], c)
            }, this);
            this.stack.content[c].sort_date.click(function () {
                this.sortValues[c] = this.sortValues[c] == "date_asc" ? "date_desc" : "date_asc";
                this.setVisualSort(c);
                this.showFiles(this.data[c], c)
            }, this)
        }, this)
    },
    setVisualSort: function (a) {
        var b = this.sortValues[a];
        this.stack.content[a].sort_name.text = _("Name");
        this.stack.content[a].sort_size.text = _("Size");
        this.stack.content[a].sort_date.text = _("Modified");
        if (b.indexOf("desc") != -1) if (b.indexOf("name") != -1) this.stack.content[a].sort_name.text = _("Name") + " \u25bc";
        else if (b.indexOf("size") != -1) this.stack.content[a].sort_size.text = _("Size") + " \u25bc";
        else {
            if (b.indexOf("date") != -1) this.stack.content[a].sort_date.text = _("Modified") + " \u25bc"
        } else if (b.indexOf("asc") != -1) if (b.indexOf("name") != -1) this.stack.content[a].sort_name.text = _("Name") + " \u25b2";
        else if (b.indexOf("size") != -1) this.stack.content[a].sort_size.text = _("Size") + " \u25b2";
        else if (b.indexOf("date") != -1) this.stack.content[a].sort_date.text = _("Modified") + " \u25b2"
    },
    sortFunction: function (a, b, c, d) {
        if (d == "name_desc" || d == "name_asc") {
            var g = -1,
                f = 1;
            if (d == "name_asc") {
                g = 1;
                f = -1
            }
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(a, "path", c).toLowerCase() == "/other") return g;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "path", c).toLowerCase() == "/other") return f;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") != -1) return f;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") != -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1) return g;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(a, "path", c).toLowerCase() < joli.getFileAttribute(b, "path", c).toLowerCase()) return f;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(a, "path", c).toLowerCase() < joli.getFileAttribute(b, "path", c).toLowerCase()) return g;
            if (joli.getFileAttribute(a, "is_dir", c) != joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "is_dir", c) == true) return f;
            if (joli.getFileAttribute(a, "is_dir", c) != joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(b, "is_dir", c) == true) return g;
            if (joli.getFileAttribute(a, "is_dir", c) == joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "path", c).toLowerCase() < joli.getFileAttribute(b, "path", c).toLowerCase()) return f;
            if (joli.getFileAttribute(a, "is_dir", c) == joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "path", c).toLowerCase() > joli.getFileAttribute(b, "path", c).toLowerCase()) return g;
            return 0
        } else if (d == "date_desc" || d == "date_asc") {
            g = 1;
            f = -1;
            if (d == "date_asc") {
                g = -1;
                f = 1
            }
            d = joli.getFileAttribute(a, "modified", c) == "" ? "Thu, 01 Jan 1970 01:00:01 -0000" : joli.getFileAttribute(a, "modified", c);
            var h = joli.getFileAttribute(b, "modified", c) == "" ? "Thu, 01 Jan 1970 01:00:01 -0000" : joli.getFileAttribute(b, "modified", c);
            if (new Date(d) > new Date(h)) return f;
            if (new Date(d) < new Date(h)) return g;
            if (joli.getFileAttribute(a, "is_dir", c) != joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "is_dir", c) == true) return f;
            if (joli.getFileAttribute(a, "is_dir", c) != joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(b, "is_dir", c) == true) return g;
            if (joli.getFileAttribute(a, "is_dir", c) == joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "path", c).toLowerCase() < joli.getFileAttribute(b, "path", c).toLowerCase()) return f;
            if (joli.getFileAttribute(a, "is_dir", c) == joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "path", c).toLowerCase() > joli.getFileAttribute(b, "path", c).toLowerCase()) return g;
            return 0
        } else if (d == "size_desc" || d == "size_asc") {
            g = 1;
            f = -1;
            if (d == "size_asc") {
                g = -1;
                f = 1
            }
            d = joli.getFileAttribute(a, "is_dir", c) ? "0" : joli.getFileAttribute(a, "bytes", c);
            h = joli.getFileAttribute(b, "is_dir", c) ? "0" : joli.getFileAttribute(b, "bytes", c);
            if (parseInt(d) > parseInt(h)) return f;
            if (parseInt(d) < parseInt(h)) return g;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(a, "path", c).toLowerCase() == "/other") return g;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "path", c).toLowerCase() == "/other") return f;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") != -1) return f;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") != -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1) return g;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(a, "path", c).toLowerCase() < joli.getFileAttribute(b, "path", c).toLowerCase()) return f;
            if (joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(b, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(b, "docs_path").indexOf(":") == -1 && joli.getFileAttribute(a, "path", c).toLowerCase() < joli.getFileAttribute(b, "path", c).toLowerCase()) return g;
            if (joli.getFileAttribute(a, "is_dir", c) != joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "is_dir", c) == true) return g;
            if (joli.getFileAttribute(a, "is_dir", c) != joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(b, "is_dir", c) == true) return f;
            if (joli.getFileAttribute(a, "is_dir", c) == joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "path", c).toLowerCase() < joli.getFileAttribute(b, "path", c).toLowerCase()) return f;
            if (joli.getFileAttribute(a, "is_dir", c) == joli.getFileAttribute(b, "is_dir", c) && joli.getFileAttribute(a, "path", c).toLowerCase() > joli.getFileAttribute(b, "path", c).toLowerCase()) return g;
            return 0
        }
    },
    showChild: function (a, b) {
        var c = joli.bind(function () {
            this.sidebar.activate(a, true);
            this.stack.popToBottom();
            (b || joli.doNothing)()
        }, this),
            d = a.replace("local|", ""),
            g = true;
        joli.each(this.drives, function (f) {
            if (g && f.udi == d) {
                g = false;
                this.stack.content.showChild("drive", c)
            }
        }, this);
        g && this.stack.content.showChild(a.split("|")[1], c)
    },
    setDetails: function (a, b) {
        this.stack.content[b].details.setModel(a)
    },
    showFiles: function (a, b) {
        console.log("showFiles", a, b);
        if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
            this.stack.content.dropbox.list._element.style.webkitTransition = "";
            this.stack.content.dropbox.list._element.style.webkitTransform = "translate3d(0, 0, 0)"
        }
        if (joli.getFileAttribute(a, "contents")) {
            this.data[b] = a;
            if (!this.sortValues[b]) this.sortValues[b] = this.defaultSort;
            var c = joli.getFileAttribute(a, "contents").slice(0),
                d = this;
            c.sort(function (f, h) {
                return d.sortFunction(f, h, a.mapper, d.sortValues[b])
            });
            var g = joli.getFileAttribute(a, "path");
            this.setBreadcrumb(g, b, joli.getFileAttribute(a, "root"), joli.getFileAttribute(a, "ids_docs_path"));
            g != "/" && g != "" ? this.setDetails({
                service: b,
                path: g,
                docs_path: joli.getFileAttribute(a, "docs_path"),
                modified: joli.getFileAttribute(a, "modified"),
                bytes: joli.getFileAttribute(a, "bytes"),
                root: joli.getFileAttribute(a, "root"),
                items: c.length,
                thumb: "folder"
            }, b) : this.getAccountInfo(b, joli.getFileAttribute(a, "root"));
            this.stack.content[b].list.clear();
            joli.each(c, function (f) {
                if (a.mapper) f.mapper = a.mapper;
                f.service = b;
                this.stack.content[b].list.addItem().setModel(f)
            }, this);
            joli.getFileAttribute(a, "next") && joli.getFileAttribute(a, "next") != "" && joli.cloud.googledocs.list(joli.getFileAttribute(a, "path"), joli.getFileAttribute(a, "docs_path"), joli.getFileAttribute(a, "ids_docs_path"), joli.getFileAttribute(a, "next"), {
                success: function (f) {
                    f.contents = joli.getFileAttribute(a, "contents").concat(f.contents);
                    this.showFiles(f, "googledocs");
                    this.stack.content.googledocsconnect.label.text = _("Link to my") + " Google Docs"
                },
                error: function (f, h) {
                    console.log("getGoogledocs error", f, h);
                    this.loaded.googledocs = false;
                    this.stack.content.googledocsconnect.label.text = _("Link to my") + " Google Docs";
                    this.stack.content.showChild("googledocsconnect")
                }
            }, this)
        }
    },
    getAccountInfo: function (a, b) {
        a == "dropbox" && joli.cloud.dropbox.account({
            success: function (c) {
                this.setDetails({
                    service: a,
                    path: joli.getFileAttribute(c, "name"),
                    desc: "Dropbox",
                    quota: joli.getFileAttribute(c, "quota")
                }, a)
            },
            error: function (c) {
                console.log("getAccountInfo error", c)
            }
        }, this);
        a == "googledocs" && joli.cloud.googledocs.account({
            success: function (c) {
                this.setDetails({
                    service: a,
                    path: joli.getFileAttribute(c, "name"),
                    desc: "Google Docs",
                    quota: joli.getFileAttribute(c, "quota")
                }, a)
            },
            error: function (c) {
                console.log("getAccountInfo error", c)
            }
        }, this);
        if (b) {
            console.log("getAccountInfo", b, this.drives);
            joli.each(this.drives, function (c) {
                var d = "";
                if (c.properties.DriveModel && c.properties.DriveVendor) d = c.properties.DriveModel + " - " + c.properties.DriveVendor;
                else if (c.properties.DriveModel) d = c.properties.DriveModel;
                else if (c.properties.DriveVendor) d = c.properties.DriveVendor;
                var g = {
                    total: c.properties["volume.size"],
                    used: c.properties["volume.size"] - c.properties["volume.size_free"]
                };
                if (b == "home" && c.properties.DeviceMountPaths[0] == "/") joli.system.filesystem.account(b, function (f) {
                    this.setDetails({
                        service: a,
                        path: "Joli OS",
                        root: b,
                        desc: d,
                        quota: f.quota
                    }, a)
                }, this);
                else b == c.properties.DeviceMountPaths[0] && this.setDetails({
                    service: a,
                    path: c.properties.DisplayName,
                    root: b,
                    desc: d,
                    quota: g
                }, a)
            }, this)
        }
    },
    setBreadcrumb: function (a, b, c, d) {
        this.stack.content[b].breadcrumb.clear();
        if (a == "/") a = "";
        if (d == "/") d = "";
        var g = a.split("/"),
            f = d ? d.split("/") : [];
        console.log("breadcrumbs", g);
        console.log("ids_docs_breadcrumbs", f);
        joli.each(g, function (h, i) {
            var j = "",
                l = "";
            for (k = 0; k < i + 1; k++) if (j == "/") {
                j += g[k];
                if (d) l += f[k]
            } else {
                j += "/" + g[k];
                if (d) l += "/" + f[k]
            }
            if (j == "/") h = "Home";
            docs_path = "";
            if (d) docs_path = f[i];
            j = {
                service: b,
                name: h,
                path: j,
                root: c,
                docs_path: docs_path,
                ids_docs_path: l
            };
            l = this.stack.content[b].breadcrumb.addItem();
            console.log(j);
            l.setModel(j)
        }, this);
        this.stack.content[b].breadcrumb._element.parentNode.scrollLeft = this.stack.content[b].breadcrumb._element.parentNode.scrollWidth
    },
    prepareToShow: function (a) {
        if (joli.system.websocketserver.connected) {
            this.sidebar.getItem("local").show();
            if (this.hasShown) a();
            else {
                this.hasShown = true;
                this.getFolders(joli.bind(function () {
                    this.showChild("local|jolicloud", a)
                }, this));
                this.getDrives()
            }
        } else {
            this.sidebar.getItem("local").hide();
            if (this.hasShown) a();
            else {
                this.hasShown = true;
                this.getDropbox(joli.bind(function () {
                    this.showChild("web|dropbox", a)
                }, this));
                if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
                    this.startTouchY = this.contentOffsetY = 0;
                    this.startMoveTime = new Date;
                    this.endTouchY = 0;
                    this.endMoveTime = new Date;
                    var b = this.stack.content.dropbox.list;
                    this.stack.content.dropbox.list._element.parentNode.addEventListener("touchstart", joli.bind(function (d) {
                        if ($(this.stack.content.dropbox.list._element.parentNode).height() < b._element.scrollHeight) {
                            this.startTouchY = d.touches[0].pageY;
                            this.startMoveTime = new Date;
                            this.contentStartOffsetY = this.contentOffsetY
                        }
                    }, this), false);
                    this.stack.content.dropbox.list._element.parentNode.addEventListener("touchmove", joli.bind(function (d) {
                        d.preventDefault();
                        if ($(this.stack.content.dropbox.list._element.parentNode).height() < b._element.scrollHeight) {
                            this.endTouchY = d = d.touches[0].clientY;
                            this.endMoveTime = new Date;
                            this.animateTo(b, d - this.startTouchY + this.contentStartOffsetY)
                        }
                    }, this), false);
                    this.stack.content.dropbox.list._element.parentNode.addEventListener("touchend", joli.bind(function () {
                        $(this.stack.content.dropbox.list._element.parentNode).height() < b._element.scrollHeight && this.outOfBounds(b, $(this.stack.content.dropbox.list._element.parentNode).height()) && this.snapToBounds(b, $(this.stack.content.dropbox.list._element.parentNode).height())
                    }, this), false);
                    var c = this.stack.content.googledocs.list;
                    this.stack.content.googledocs.list._element.parentNode.addEventListener("touchstart", joli.bind(function (d) {
                        if ($(this.stack.content.googledocs.list._element.parentNode).height() < c._element.scrollHeight) {
                            this.startTouchY = d.touches[0].pageY;
                            this.startMoveTime = new Date;
                            this.contentStartOffsetY = this.contentOffsetY
                        }
                    }, this), false);
                    this.stack.content.googledocs.list._element.parentNode.addEventListener("touchmove", joli.bind(function (d) {
                        d.preventDefault();
                        if ($(this.stack.content.googledocs.list._element.parentNode).height() < c._element.scrollHeight) {
                            this.endTouchY = d = d.touches[0].clientY;
                            this.endMoveTime = new Date;
                            this.animateTo(c, d - this.startTouchY + this.contentStartOffsetY)
                        }
                    }, this), false);
                    this.stack.content.googledocs.list._element.parentNode.addEventListener("touchend", joli.bind(function () {
                        $(this.stack.content.googledocs.list._element.parentNode).height() < c._element.scrollHeight && this.outOfBounds(c, $(this.stack.content.googledocs.list._element.parentNode).height()) && this.snapToBounds(c, $(this.stack.content.googledocs.list._element.parentNode).height())
                    }, this), false)
                }
            }
        }
    },
    getFiles: function (a, b, c, d, g) {
        b == "dropbox" && joli.cloud.dropbox.list(a, {
            success: function (f) {
                this.showFiles(f, b)
            },
            error: function (f) {
                console.log("getFiles error", f)
            }
        }, this);
        b == "googledocs" && joli.cloud.googledocs.list(a, d, g, "", {
            success: function (f) {
                this.showFiles(f, b)
            },
            error: function (f) {
                console.log("getFiles error", f)
            }
        }, this);
        b == "jolicloud" && joli.system.filesystem.list(a, "home", function (f) {
            this.showFiles(f, b)
        }, this);
        b == "drive" && joli.system.filesystem.list(a, c, function (f) {
            this.showFiles(f, b)
        }, this)
    },
    getFolders: function (a) {
        if (joli.computer && joli.computer.version) if (joli.versionCompare("1.1.15", joli.computer.version)) {
            this.sidebar.getItem("local|oldfolders").hide();
            this.sidebar.getItem("local|jolicloud").show();
            this.loaded.folders = true;
            this.stack.content.jolicloud.details.addClass("hide");
            this.getAccountInfo("jolicloud", "home");
            joli.system.filesystem.list("", "home", function (b) {
                this.showFiles(b, "jolicloud");
                a && a()
            }, this)
        } else {
            this.sidebar.getItem("local|jolicloud").hide();
            this.sidebar.getItem("local|oldfolders").show();
            this.folders = [];
            joli.system.folders.favorites(function (b) {
                joli.each(b, function (c) {
                    c.uri && c.name && this.folders.push(c)
                }, this);
                this.folders.sort(function (c, d) {
                    if (c.name < d.name) return -1;
                    if (c.name > d.name) return 1;
                    return 0
                });
                this.displayFolders();
                if (typeof a == "function") {
                    a();
                    this.showChild("local|oldfolders")
                }
            }, this)
        }
    },
    getDropbox: function (a) {
        this.loaded.dropbox = true;
        this.stack.content.dropbox.details.addClass("hide");
        this.getAccountInfo("dropbox");
        joli.cloud.dropbox.list("", {
            success: function (b) {
                this.showFiles(b, "dropbox");
                a && a();
                this.stack.content.dropboxconnect.label.text = _("Link to my") + " Dropbox"
            },
            error: function (b, c) {
                console.log("getDropbox error", b, c);
                this.loaded.dropbox = false;
                a && a();
                this.stack.content.dropboxconnect.label.text = _("Link to my") + " Dropbox";
                this.stack.content.showChild("dropboxconnect")
            }
        }, this)
    },
    getGoogledocs: function (a) {
        this.loaded.googledocs = true;
        this.stack.content.googledocs.details.addClass("hide");
        this.getAccountInfo("googledocs");
        joli.cloud.googledocs.list("", "", "", "", {
            success: function (b) {
                this.showFiles(b, "googledocs");
                a && a();
                this.stack.content.googledocsconnect.label.text = _("Link to my") + " Google Docs"
            },
            error: function (b, c) {
                console.log("getGoogledocs error", b, c);
                this.loaded.googledocs = false;
                a && a();
                this.stack.content.googledocsconnect.label.text = _("Link to my") + " Google Docs";
                this.stack.content.showChild("googledocsconnect")
            }
        }, this)
    },
    getDrives: function (a) {
        joli.each(this.drives, function (c) {
            try {
                this.sidebar.getItem("local").removeItem(this.sidebar.getItem("local|" + c.udi))
            } catch (d) {}
        }, this);
        this.drives = [];
        if (joli.computer && joli.computer.version) {
            this.sidebar.getItem("local").show();
            var b = a;
            if (joli.versionCompare("1.1.15", joli.computer.version)) {
                this.sidebar.getItem("local|olddrives").hide();
                this.sidebar.getItem("local|oldfolders").hide()
            } else {
                this.sidebar.getItem("local|olddrives").show();
                this.sidebar.getItem("local|oldfolders").show();
                if (typeof a == "function") b = function () {
                    a();
                    this.showChild("local|olddrives")
                }
            }
            this.loaded.drives = true;
            this.drives = [];
            joli.system.devices.volumes(function (c) {
                c.sort(function (d, g) {
                    var f = g.properties && g.properties.DeviceMountPaths[0] && g.properties.DeviceMountPaths[0] == "/host" ? true : false,
                        h = d.properties.DriveIsMediaEjectable == 1 || d.properties.DriveCanDetach == 1 ? true : false,
                        i = g.properties.DriveIsMediaEjectable == 1 || g.properties.DriveCanDetach == 1 ? true : false;
                    if (d.properties && d.properties.DeviceMountPaths[0] && d.properties.DeviceMountPaths[0] == "/host" || f) return 1;
                    if (h && !i) return 1;
                    if (!h && i) return -1;
                    return 0
                });
                joli.each(c, function (d) {
                    this.onDriveAdded(d);
                    this.onDriveChanged(d)
                }, this);
                typeof b == "function" && b()
            }, this)
        }
    },
    onDriveAdded: function (a) {
        if (joli.computer && joli.computer.version) if (joli.versionCompare("1.1.15", joli.computer.version)) {
            this.sidebar.getItem("local|oldfolders").hide();
            this.sidebar.getItem("local|olddrives").hide();
            this.sidebar.getItem("local").show();
            if (a && a.udi && a.properties) if (a.properties.DeviceMountPaths[0] && a.properties.DeviceMountPaths[0] == "/") {
                console.log("skipping /");
                a.added = true;
                this.drives.push(a)
            } else if (a.properties.DeviceMountPaths[0] && a.properties.DeviceMountPaths[0] == "/host") {
                var b = {
                    text: a.properties.DisplayName,
                    value: a.udi
                };
                if (a.properties.DeviceIsMounted == 1) {
                    b = this.sidebar.getItem("local").addItem(b).addClass("windows");
                    a.added = true;
                    this.drives.push(a)
                }
            } else {
                b = {
                    text: a.properties.DisplayName,
                    value: a.udi
                };
                var c = a.properties.DriveIsMediaEjectable == 1 || a.properties.DriveCanDetach == 1 || a.properties.DeviceIsSystemInternal == 0;
                if (c) b.extra = "unmountable";
                if (a.properties.DeviceIsMounted == 1) {
                    b = this.sidebar.getItem("local").addItem(b);
                    if (c) {
                        b.addClass("key").addClass("unmountable");
                        b.extra.click(function () {
                            this.unmountdevice(a.udi)
                        }, this);
                        b.extra.show()
                    } else b.addClass("drive");
                    a.added = true;
                    this.drives.push(a)
                }
            }
        } else if (a && a.udi && a.properties && a.properties["volume.mount_point"] != "/host") {
            if (!a.properties["volume.mount_point"]) a.added = true;
            this.drives.push(a);
            this.displayDrives()
        }
    },
    onDriveRemoved: function (a) {
        if (joli.computer && joli.computer.version) if (joli.versionCompare("1.1.15", joli.computer.version)) {
            this.sidebar.getItem("local|oldfolders").hide();
            this.sidebar.getItem("local|olddrives").hide();
            this.sidebar.getItem("local").show();
            var b = [];
            joli.each(this.drives, function (c) {
                if (c.udi == a.udi) {
                    this.sidebar.getItem("local").activeValue == a.udi && this.getFolders(joli.bind(function () {
                        this.showChild("local|jolicloud")
                    }, this));
                    try {
                        this.sidebar.getItem("local").removeItem(this.sidebar.getItem("local|" + a.udi))
                    } catch (d) {}
                } else b.push(c)
            }, this);
            this.drives = b
        } else if (a && a.udi) {
            joli.each(this.drives, function (c, d) {
                a.udi == c.udi && this.drives.splice(d, 1)
            }, this);
            this.displayDrives()
        }
    },
    onDriveChanged: function (a) {
        if (joli.computer && joli.computer.version) if (joli.versionCompare("1.1.15", joli.computer.version)) {
            this.sidebar.getItem("local|oldfolders").hide();
            this.sidebar.getItem("local|olddrives").hide();
            this.sidebar.getItem("local").show();
            var b = true;
            if (a && a.udi && a.properties) {
                joli.each(this.drives, function (c) {
                    if (c.udi == a.udi) b = false
                }, this);
                if (b) this.onDriveAdded(a);
                if (!b && a.properties.DeviceIsMounted == 0) this.onDriveRemoved(a);
                else joli.each(this.drives, function (c, d) {
                    if (a.udi == c.udi) this.drives[d] = a
                }, this)
            }
        } else if (a && a.udi) {
            joli.each(this.drives, function (c, d) {
                if (a.udi == c.udi) this.drives[d] = a
            }, this);
            this.displayDrives()
        }
    },
    unmountdevice: function (a) {
        console.log("unmount", a);
        var b = true;
        joli.each(this.drives, function (c) {
            if (b && c.udi == a) {
                b = false;
                c.properties.DriveIsMediaEjectable == 1 ? this.eject(a) : this.unmount(a)
            }
        }, this)
    },
    unmount: function (a) {
        joli.system.devices.unmount(a, {
            complete: function () {
                try {
                    this.sidebar.getItem("local").removeItem(this.sidebar.getItem("local|" + a))
                } catch (b) {}
                this.getFolders(joli.bind(function () {
                    this.showChild("local|jolicloud")
                }, this));
                var c = [];
                joli.each(this.drives, function (d, g) {
                    if (d.udi != a) {
                        console.log(d.udi, a, d.udi == a, g);
                        c.push(d)
                    }
                }, this);
                this.drives = c
            }
        }, this)
    },
    eject: function (a) {
        joli.system.devices.eject(a, {
            complete: function () {
                try {
                    this.sidebar.getItem("local").removeItem(this.sidebar.getItem("local|" + a))
                } catch (b) {}
                this.getFolders(joli.bind(function () {
                    this.showChild("local|jolicloud")
                }, this));
                var c = [];
                joli.each(this.drives, function (d, g) {
                    if (d.udi != a) {
                        console.log(d.udi, a, d.udi == a, g);
                        c.push(d)
                    }
                }, this);
                this.drives = c
            }
        }, this)
    },
    displayFolders: function () {
        this.stack.content.oldfolders.list.clear();
        joli.each(this.folders, function (a) {
            this.stack.content.oldfolders.list.addItem().setModel(a)
        }, this)
    },
    displayDrives: function () {
        this.stack.content.olddrives.list.clear();
        joli.each(this.drives, function (a) {
            a.properties["volume.mount_point"] == "/" && this.stack.content.olddrives.list.addItem().setModel(a)
        }, this);
        joli.each(this.drives, function (a) {
            a.properties["volume.mount_point"] != "/" && this.stack.content.olddrives.list.addItem().setModel(a)
        }, this)
    },
    outOfBounds: function (a, b) {
        if (this.contentOffsetY * -1 < 0) return true;
        if (this.contentOffsetY * -1 > a._element.scrollHeight - b) return true;
        return false
    },
    snapToBounds: function (a, b) {
        var c = false;
        if (this.contentOffsetY * -1 < 0) {
            this.contentOffsetY = 0;
            c = true
        } else if (this.contentOffsetY * -1 > a._element.scrollHeight - b) {
            this.contentOffsetY = (a._element.scrollHeight - b) * -1;
            c = true
        }
        if (c) {
            this.animateTo(a, this.contentOffsetY);
            a._element.style.webkitTransition = "-webkit-transform 0.2s ease-out";
            a._element.style.webkitTransform = "translate3d(0, " + this.contentOffsetY + "px, 0)"
        }
    },
    animateTo: function (a, b) {
        this.contentOffsetY = b;
        a._element.style.webkitTransition = "";
        a._element.style.webkitTransform = "translate3d(0, " + b + "px, 0)"
    }
});
launcher.ui.files.extend("Drive", joli.ui.Widget, {
    events: {
        uninstall: function () {
            this.model.properties["volume.is_disc"] == 1 ? this.eject() : this.unmount()
        }
    },
    icons: {
        generic: "data:image/png;base64,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",
        disk: "data:image/png;base64,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",
        stick: "data:image/png;base64,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"
    },
    initWidget: function () {
        this.appli.icon.src = this.icons.stick;
        this.appli.icon.click(this.launch, this);
        this.appli.name.click(this.launch, this);
        this.appli.icon.bind("load", this.onIconLoaded.bind(this))
    },
    setModel: function (a) {
        var b = false;
        if (a.added) {
            a.added = false;
            b = true
        }
        this._super(a);
        b && this.mount()
    },
    onModelChanged: function (a) {
        this.appli.name.text = a.properties["volume.label"] ? a.properties["volume.label"] : a["info.product"] ? a.properties["info.product"] : a.properties["volume.mount_point"] == "/" ? "Jolicloud" : _("Untitled");
        if (a.properties["volume.mount_point"]) if (a.properties["volume.mount_point"] == "/") {
            this.removeClass("unlaunchable");
            this.appli.icon.src = this.icons.generic;
            this.addClass("nobar")
        } else {
            this.removeClass("unlaunchable");
            this.appli.icon.src = this.icons.stick;
            this.editbar.likeability.hide();
            this.editbar.information.hide()
        } else {
            this.addClass("unlaunchable");
            this.addClass("nobar")
        }
        if (a.properties["volume.mount_point"] && a.properties["volume.size"] && a.properties["volume.size_free"]) if (a.properties["volume.size_free"] != "unknown") {
            var b = a.properties["volume.size_free"] / a.properties["volume.size"],
                c = 0,
                d = [1 - b, b],
                g = this.extra.space._element,
                f = g.getContext("2d"),
                h = [g.width, g.height];
            g = Math.min(h[0], h[1]) / 2;
            var i = [h[0] / 2, h[1] / 2],
                j = f.createRadialGradient(i[0], i[1], 0, i[0], i[1], h[0]);
            if (b > 0.5) {
                j.addColorStop(0, "#85cd34");
                j.addColorStop(1, "#439c36")
            } else if (b > 0.1) {
                j.addColorStop(0, "#FFE523");
                j.addColorStop(1, "#FA5603")
            } else {
                j.addColorStop(0, "#DE3D00");
                j.addColorStop(1, "#BC3603")
            }
            b = f.createRadialGradient(i[0], i[1], 0, i[0], i[1], h[0]);
            b.addColorStop(0, "#2d303b");
            b.addColorStop(1, "#363946");
            b = [j, b];
            for (var l in d) {
                j = d[l] / 1;
                f.beginPath();
                f.moveTo(i[0], i[1]);
                f.arc(i[0], i[1], g, Math.PI * (-0.5 + 2 * c), Math.PI * (-0.5 + 2 * (c + j)), false);
                f.lineTo(i[0], i[1]);
                f.closePath();
                f.fillStyle = b[l];
                f.fill();
                c += j
            }
            a = a.properties["volume.size_free"] / 1024;
            c = a / 1024;
            d = c / 1024;
            f = "";
            f = d > 1 ? parseFloat(d).toFixed(2) + _("GB free") : c > 1 ? Math.floor(c) + _("MB free") : a > 1 ? Math.floor(a) + _("KB free") : parseFloat(a).toFixed(2) + _("KB free");
            this.extra.info.text = f;
            this.extra.css("visibility", "visible")
        } else this.extra.css("visibility", "hidden");
        else this.extra.css("visibility", "hidden")
    },
    onIconLoaded: function () {
        if (!this.isIconLoaded) {
            this.isIconLoaded = true;
            this.model.properties["volume.mount_point"] || this.appli.icon.convertToGrayscale()
        }
    },
    onChanged: function (a) {
        this.setModel(a)
    },
    launch: function (a) {
        if (this.model.state != "mounting" && this.model.state != "unmounting") if (this.model.properties["volume.mount_point"]) {
            this.addClass("launching");
            this.bind("webkitAnimationEnd", joli.bind(function () {
                this.removeClass("launching")
            }, this));
            this.model.properties["volume.mount_point"] == "/" ? joli.system.folders.open("~") : joli.system.folders.open(this.model.properties["volume.mount_point"])
        } else a !== true && this.mount(joli.bind(function () {
            this.launch(true)
        }, this))
    },
    mount: function (a) {
        cb = a || joli.doNothing;
        this.model.state = "mounting";
        this.addClass("installing");
        joli.system.devices.mount(this.model.udi, {
            success: function (b) {
                this.onChanged(b)
            },
            complete: function () {
                this.model.state = "";
                this.removeClass("installing");
                cb()
            }
        }, this)
    },
    unmount: function (a) {
        cb = a || joli.doNothing;
        this.model.state = "unmounting";
        this.addClass("installing");
        joli.system.devices.unmount(this.model.udi, {
            complete: function () {
                this.model.state = "";
                this.removeClass("installing");
                cb()
            }
        }, this)
    },
    eject: function (a) {
        cb = a || joli.doNothing;
        this.model.state = "unmounting";
        this.addClass("installing");
        joli.system.devices.eject(this.model.udi, {
            complete: function () {
                this.model.state = "";
                this.removeClass("installing");
                cb()
            }
        }, this)
    }
});
launcher.ui.stream.extend("Stream", joli.ui.Widget, {
    streamPage: 1,
    streamPerPage: 20,
    streamDate: null,
    loadingStream: false,
    initWidget: function () {
        joli.Events.subscribe("resize", joli.bind(function () {
            joli.ui.root.menu.getItem("stream").active && this.resizeList()
        }, this))
    },
    resizeList: function () {
        if (joli.ui.root.menu.getItem("stream").active) {
            var a = joli.ui.root.content.current.outerHeight() - 20 - 35 - 50,
                b, c;
            if (this.sidebar.getItem("jolicloud").active) {
                if (this.stack.content.jolicloud.tabs.getItem("following").active) {
                    b = parseInt(a / 70, 10) * 2;
                    c = this.stack.content.jolicloud.swap.following.pager
                }
                if (this.stack.content.jolicloud.tabs.getItem("followers").active) {
                    b = parseInt(a / 70, 10) * 2;
                    c = this.stack.content.jolicloud.swap.followers.pager
                }
                if (this.stack.content.jolicloud.tabs.getItem("top").active) {
                    b = parseInt(a / 70, 10) * 2;
                    c = this.stack.content.jolicloud.swap.top.pager
                }
                if (this.stack.content.jolicloud.tabs.getItem("newfriends").active) {
                    b = parseInt(a / 70, 10) * 2;
                    c = this.stack.content.jolicloud.swap.newfriends.pager
                }
            }
            if (this.sidebar.getItem("you").active) if (this.stack.content.you.tabs.getItem("history").active) {
                b = parseInt(a / 85, 10);
                c = this.stack.content.you.swap.history.pager
            }
            if (b && c) if (c.options.perPage != b && b > 0) {
                c.pageData = undefined;
                c.page = 0;
                c.options.perPage = b;
                c.redisplay();
                this.stack.popToBottom()
            }
        }
    },
    events: {
        jolicloudtabs: function (a, b) {
            if (b == "publicpage") window.open("http://my.jolicloud.com/" + joli.username, "_blank", "", false);
            else {
                var c = joli.ui.root.content.current.outerHeight() - 20 - 35 - 50,
                    d, g;
                if (b == "stream") {
                    this.stack.content.jolicloud.swap.stream.list.clear();
                    this.getStream(true)
                }
                if (b == "following") {
                    d = parseInt(c / 70, 10) * 2;
                    g = this.stack.content.jolicloud.swap.following.pager
                }
                if (b == "followers") {
                    d = parseInt(c / 70, 10) * 2;
                    g = this.stack.content.jolicloud.swap.followers.pager
                }
                if (b == "top") {
                    d = parseInt(c / 70, 10) * 2;
                    g = this.stack.content.jolicloud.swap.top.pager
                }
                if (b == "newfriends") {
                    d = parseInt(c / 70, 10) * 2;
                    g = this.stack.content.jolicloud.swap.newfriends.pager
                }
                if (d && g) if (g.options.perPage != d && d > 0) {
                    c = g.pageData;
                    g.pageData = undefined;
                    g.page = 0;
                    g.options.perPage = d;
                    if (c) {
                        g.redisplay();
                        this.stack.popToBottom()
                    }
                }
                this.stack.content.jolicloud.swap.showChild(b, joli.bind(function () {
                    this.stack.content.jolicloud.tabs.activate(b, true);
                    this.resizeList()
                }, this))
            }
            a.preventDefault()
        },
        refreshContent: function () {
            if (this.stack.content.current === this.stack.content.jolicloud) {
                this.getStream(true);
                this.stack.content.jolicloud.swap.following.redisplay();
                this.stack.content.jolicloud.swap.followers.redisplay();
                this.stack.content.jolicloud.swap.top.redisplay();
                this.stack.content.jolicloud.swap.newfriends.redisplay(joli.bind(function () {
                    if (this.stack.content.jolicloud.swap.newfriends.pager.dataLength === 1) this.stack.content.jolicloud.tabs.getItem("newfriends").label.text = "1 " + _("New Facebook Friend!");
                    else this.stack.content.jolicloud.tabs.getItem("newfriends").label.text = this.stack.content.jolicloud.swap.newfriends.pager.dataLength + " " + _("New Facebook Friends!")
                }, this));
                joli.cloud.joliserver.bind_requests_end(joli.bind(function () {
                    if (this.stack.content.jolicloud.swap.newfriends.pager.dataLength === 0) {
                        this.stack.content.jolicloud.tabs.getItem("newfriends").hide();
                        if (this.stack.content.current.swap.current === this.stack.content.jolicloud.swap.newfriends) {
                            this.stack.content.jolicloud.tabs.activate("stream", true);
                            this.stack.content.jolicloud.swap.showChild("stream")
                        }
                    } else this.stack.content.jolicloud.tabs.getItem("newfriends").show()
                }, this))
            } else this.stack.content.current.swap.current.redisplay()
        },
        showuser: function (a, b) {
            this.stack.pushChild({
                type: "user",
                username: b
            })
        },
        showapp: function (a, b) {
            this.stack.pushChild({
                type: "app",
                "package": b
            })
        },
        sidebar: function (a, b) {
            var c = joli.bind(function () {
                this.sidebar.activate(b, true);
                this.resizeList();
                this.stack.popToBottom()
            }, this);
            this.stack.content.showChild(b.split("|")[1], c);
            a.preventDefault()
        },
        activities_reclick: function (a) {
            if (a.target.activeValue === "jolicloud") {
                this.stack.content.jolicloud.swap.following.pager.page !== 0 ? this.stack.content.jolicloud.swap.following.pager.setMethodParams({
                    page: 0
                }, true, joli.bind(function () {
                    this.stack.popToBottom()
                }, this)) : this.stack.popToBottom();
                this.stack.content.jolicloud.swap.followers.pager.page !== 0 ? this.stack.content.jolicloud.swap.followers.pager.setMethodParams({
                    page: 0
                }, true, joli.bind(function () {
                    this.stack.popToBottom()
                }, this)) : this.stack.popToBottom();
                this.stack.content.jolicloud.swap.newfriends.pager.page !== 0 ? this.stack.content.jolicloud.swap.newfriends.pager.setMethodParams({
                    page: 0
                }, true, joli.bind(function () {
                    this.stack.popToBottom()
                }, this)) : this.stack.popToBottom();
                this.stack.content.jolicloud.swap.top.pager.page !== 0 ? this.stack.content.jolicloud.swap.top.pager.setMethodParams({
                    page: 0
                }, true, joli.bind(function () {
                    this.stack.popToBottom()
                }, this)) : this.stack.popToBottom()
            } else if (a.target.activeValue === "you") this.stack.content.you.swap.history.pager.page !== 0 ? this.stack.content.you.swap.history.pager.setMethodParams({
                page: 0
            }, true, joli.bind(function () {
                this.stack.popToBottom()
            }, this)) : this.stack.popToBottom();
            else this.stack.popToBottom()
        },
        more: function () {
            this.getStream(false)
        },
        jolios: function () {
            window.open("http://www.jolicloud.com/download", "Joli OS");
            return false
        },
        chromeapp: function () {
            window.open("https://chrome.google.com/webstore/detail/nfakdllpdfjjbfommlcnfkedmbigkfdo", "Jolicloud for Chrome");
            return false
        }
    },
    showChild: function (a, b) {
        var c = joli.bind(function () {
            this.sidebar.activate(a, true);
            this.stack.popToBottom();
            (b || joli.doNothing)()
        }, this);
        this.stack.content.showChild(a.split("|")[1], c)
    },
    getStream: function (a) {
        this.loadingStream = true;
        this.stack.content.jolicloud.swap.stream.more.addClass("disabled");
        this.stack.content.jolicloud.swap.stream.more.label.text = _("Loading...");
        if (a) {
            this.streamPage = 1;
            this.streamDate = null
        } else this.streamPage += 1;
        joli.cloud.user.stream(this.streamPage, this.streamPerPage, function (b) {
            a && this.stack.content.jolicloud.swap.stream.list.clear();
            this.loadingStream = false;
            this.stack.content.jolicloud.swap.stream.more.removeClass("disabled");
            this.stack.content.jolicloud.swap.stream.more.label.text = _("More");
            var c, d = true;
            joli.each(b, function (f) {
                if ((f.actor.type == "user" || f.actor.type == "group") && f.object.app && !joli.model.apps.instances[f.object.app["package"]]) joli.model.update("app", f.object.app)
            }, this);
            joli.each(b, function (f) {
                if (c && (f.actor.user && f.actor.user.username == c.name || f.actor.group && f.actor.group.name == c.name)) if (joli.relativeDay(c.time) != joli.relativeDay(f.time)) {
                    if (!this.streamDate || this.streamDate != joli.relativeDay(c.time)) {
                        this.stack.content.jolicloud.swap.stream.listbuffer.addItem().setModel({
                            literalDate: joli.relativeDay(c.time)
                        });
                        this.streamDate = joli.relativeDay(c.time)
                    }
                    this.stack.content.jolicloud.swap.stream.listbuffer.addItem().setModel(c);
                    c = f;
                    c.name = f.actor.user ? f.actor.user.username : f.actor.group.name;
                    c.apps = [f.object.app];
                    d = false
                } else {
                    for (var h = false, i = 0; i < c.apps.length; i++) if (f.object.app["package"] == c.apps[i]["package"]) h = true;
                    if (!h) {
                        c.apps.push(f.object.app);
                        d = false
                    }
                } else {
                    if (c) {
                        if (!this.streamDate || this.streamDate != joli.relativeDay(c.time)) {
                            this.stack.content.jolicloud.swap.stream.listbuffer.addItem().setModel({
                                literalDate: joli.relativeDay(c.time)
                            });
                            this.streamDate = joli.relativeDay(c.time)
                        }
                        this.stack.content.jolicloud.swap.stream.listbuffer.addItem().setModel(c)
                    }
                    c = f;
                    c.name = f.actor.user ? f.actor.user.username : f.actor.group.name;
                    c.apps = [f.object.app];
                    d = false
                }
            }, this);
            if (c && !d) {
                if (!this.streamDate || this.streamDate != joli.relativeDay(c.time)) {
                    this.stack.content.jolicloud.swap.stream.listbuffer.addItem().setModel({
                        literalDate: joli.relativeDay(c.time)
                    });
                    this.streamDate = joli.relativeDay(c.time)
                }
                this.stack.content.jolicloud.swap.stream.listbuffer.addItem().setModel(c)
            }
            b = document.createDocumentFragment();
            for (var g = 0; g < this.stack.content.jolicloud.swap.stream.listbuffer.items.length; g++) b.appendChild(this.stack.content.jolicloud.swap.stream.listbuffer.items[g]._element);
            this.stack.content.jolicloud.swap.stream.list._element.appendChild(b);
            this.stack.content.jolicloud.swap.stream.listbuffer.clear()
        }, this)
    },
    prepareToShow: function (a) {
        var b = joli.bind(function () {
            a();
            this.resizeList()
        }, this);
        if (this.hasShown) b();
        else {
            this.hasShown = true;
            var c = joli.ui.root.content.current.outerHeight() - 20 - 35 - 50,
                d = parseInt(c / 70, 10) * 2;
            console.log("newfriends elements", d, c);
            if (this.stack.content.jolicloud.swap.newfriends.pager.options.perPage != d && d > 0) {
                this.stack.content.jolicloud.swap.newfriends.pager.pageData = undefined;
                this.stack.content.jolicloud.swap.newfriends.pager.page = 0;
                this.stack.content.jolicloud.swap.newfriends.pager.options.perPage = d
            }
            d = parseInt(c / 70, 10) * 2;
            console.log("following elements", d, c);
            if (this.stack.content.jolicloud.swap.following.pager.options.perPage != d && d > 0) {
                this.stack.content.jolicloud.swap.following.pager.pageData = undefined;
                this.stack.content.jolicloud.swap.following.pager.page = 0;
                this.stack.content.jolicloud.swap.following.pager.options.perPage = d
            }
            console.log("followers elements", d, c);
            if (this.stack.content.jolicloud.swap.followers.pager.options.perPage != d && d > 0) {
                this.stack.content.jolicloud.swap.followers.pager.pageData = undefined;
                this.stack.content.jolicloud.swap.followers.pager.page = 0;
                this.stack.content.jolicloud.swap.followers.pager.options.perPage = d
            }
            console.log("top users elements", d, c);
            if (this.stack.content.jolicloud.swap.top.pager.options.perPage != d && d > 0) {
                this.stack.content.jolicloud.swap.top.pager.pageData = undefined;
                this.stack.content.jolicloud.swap.top.pager.page = 0;
                this.stack.content.jolicloud.swap.top.pager.options.perPage = d
            }
            d = parseInt(c / 85, 10);
            console.log("history elements", d, c);
            if (this.stack.content.you.swap.history.pager.options.perPage != d && d > 0) {
                this.stack.content.you.swap.history.pager.pageData = undefined;
                this.stack.content.you.swap.history.pager.page = 0;
                this.stack.content.you.swap.history.pager.options.perPage = d
            }
            this.getStream(true);
            joli.cloud.apps.promotedapps(function (f) {
                this.stack.content.jolicloud.swap.stream.friendapps.clear();
                joli.each(f, function (h) {
                    this.stack.content.jolicloud.swap.stream.friendapps.addItem().setModel(h)
                }, this)
            }, this);
            joli.browser().browser.toLowerCase() == "firefox" ? document.querySelector(".stream-container").addEventListener("scroll", joli.bind(function (f) {
                if (!this.loadingStream && this.sidebar.getItem("jolicloud").active && this.stack.content.jolicloud.tabs.getItem("stream").active) {
                    var h = f.srcElement;
                    if (f.target) h = f.target;
                    if (h.scrollTop >= this.stack.content.jolicloud.swap.stream.list.height() - h.offsetHeight + 40 - 100) {
                        this.loadingStream = true;
                        this.events.more()
                    }
                }
            }, this), false) : document.querySelector(".stream-container-content").addEventListener("scroll", joli.bind(function (f) {
                if (!this.loadingStream && this.sidebar.getItem("jolicloud").active && this.stack.content.jolicloud.tabs.getItem("stream").active) {
                    var h = f.srcElement;
                    if (f.target) h = f.target;
                    if (h.scrollTop >= this.stack.content.jolicloud.swap.stream.list.height() - h.offsetHeight + 40 - 100) {
                        this.loadingStream = true;
                        this.events.more()
                    }
                }
            }, this), false);
            if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
                this.startTouchY = this.contentOffsetY = 0;
                this.startMoveTime = new Date;
                this.endTouchY = 0;
                this.endMoveTime = new Date;
                var g = this.stack.content.jolicloud.swap.stream.list;
                this.stack.content.jolicloud.swap.stream.list._element.parentNode.addEventListener("touchstart", joli.bind(function (f) {
                    if (this.sidebar.getItem("jolicloud").active && this.stack.content.jolicloud.tabs.getItem("stream").active) {
                        this.startTouchY = f.touches[0].pageY;
                        this.startMoveTime = new Date;
                        this.contentStartOffsetY = this.contentOffsetY
                    }
                }, this), false);
                this.stack.content.jolicloud.swap.stream.list._element.parentNode.addEventListener("touchmove", joli.bind(function (f) {
                    f.preventDefault();
                    if (this.sidebar.getItem("jolicloud").active && this.stack.content.jolicloud.tabs.getItem("stream").active) {
                        this.endTouchY = f = f.touches[0].clientY;
                        this.endMoveTime = new Date;
                        this.animateTo(g, f - this.startTouchY + this.contentStartOffsetY)
                    }
                }, this), false);
                this.stack.content.jolicloud.swap.stream.list._element.parentNode.addEventListener("touchend", joli.bind(function () {
                    this.sidebar.getItem("jolicloud").active && this.stack.content.jolicloud.tabs.getItem("stream").active && this.outOfBounds(g) && this.snapToBounds(g)
                }, this), false)
            }
            this.stack.content.jolicloud.tabs.activate("stream");
            this.stack.content.jolicloud.tabs.getItem("newfriends").hide();
            joli.cloud.joliserver.bind_requests_end(joli.bind(function () {
                this.showChild("activities|jolicloud", b);
                this.stack.content.you.tabs.activate("history");
                this.stack.content.jolicloud.swap.newfriends.redisplay(joli.bind(function () {
                    if (this.stack.content.jolicloud.swap.newfriends.pager.dataLength === 1) {
                        this.stack.content.jolicloud.tabs.getItem("newfriends").label.text = "1 " + _("New Facebook Friend!");
                        this.stack.content.jolicloud.tabs.getItem("newfriends").show()
                    } else if (this.stack.content.jolicloud.swap.newfriends.pager.dataLength === 0) this.stack.content.jolicloud.tabs.getItem("newfriends").hide();
                    else {
                        this.stack.content.jolicloud.tabs.getItem("newfriends").label.text = this.stack.content.jolicloud.swap.newfriends.pager.dataLength + " " + _("New Facebook Friends!");
                        this.stack.content.jolicloud.tabs.getItem("newfriends").show()
                    }
                }, this));
                setTimeout(joli.bind(function () {
                    if (!this.loadingStream && this.sidebar.getItem("jolicloud").active && this.stack.content.jolicloud.tabs.getItem("stream").active) if (this.stack.content.jolicloud.swap.stream.height() < this.stack.content.jolicloud.swap._element.scrollHeight) {
                        this.loadingStream = true;
                        this.events.more()
                    }
                }, this), 200)
            }, this))
        }
    },
    outOfBounds: function (a) {
        if (this.contentOffsetY * -1 < 0) return true;
        if (this.contentOffsetY * -1 > a.height() - this.stack.content.jolicloud.swap.stream.list.parent.height()) return true;
        return false
    },
    snapToBounds: function (a) {
        var b = false;
        if (this.contentOffsetY * -1 < 0) {
            this.contentOffsetY = 0;
            b = true
        }
        if (this.contentOffsetY * -1 > a.height() - this.stack.content.jolicloud.swap.stream.list.parent.height()) {
            this.contentOffsetY = (a.height() - this.stack.content.jolicloud.swap.stream.list.parent.height()) * -1;
            b = true;
            if (!this.loadingStream) {
                this.loadingStream = true;
                this.events.more()
            }
        }
        if (b) {
            this.animateTo(a, this.contentOffsetY);
            a._element.style.webkitTransition = "-webkit-transform 0.2s ease-out";
            a._element.style.webkitTransform = "translate3d(0, " + this.contentOffsetY + "px, 0)"
        }
    },
    animateTo: function (a, b) {
        this.contentOffsetY = b;
        a._element.style.webkitTransition = "";
        a._element.style.webkitTransform = "translate3d(0, " + b + "px, 0)"
    }
});
launcher.ui.files.extend("Folder", joli.ui.Widget, {
    icons: {
        generic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAACb1JREFUeNrtWt1vHUcV/53Z+2XHN25s4iSGxE0dTFOEhAJSJAR9QSAhhCqeaF8QIF76hvgHeO8jQuKNByR4BAmpEmqBRkqkSoG2TkIimjoQ1/kgbmLf9d69+z2Hh/2a2Z291zESDekdydmdu7O7c37nd878zmyAaZu2aZu2aZu2aZu2aZu2aZu2aZu2T1yjJ32COzdeP2H15i+Kzuzq49wnw9GtxLe/tvDCt++PG9d60gGwevMXk8BZde9fRRI44CQa71GrDavbR2/h9KrVm78I4Mz/NQCxN1h1760DAG5ubgMA1laWGsdzEiEe7WA42sGh5S9OZM0TDcDu+2+85X10s+hfevcWTp04gms378Ie+ji22MeXP78Ce+ih12nh0ru3YA89vPq9FwEAwe5tHBiARzde/53Vmf3uxwlAErpIgmHRtx0PvZUlXLt/r+ifOrGAP739D3z13CoePHJwbLEPP4zQ67QhIw+DjbeYk3jryOe+ceqxkuDu+29wYN9F4jsfGwAycsEyKfp+GCEIY3Q7LWw/Suf1IDt+YW0ZvU679gzRmcXs0lksnP0WPRYD3PvXEXuDJyokOgLo9NIpf+ZoXzsCgIzrCVLGNoZ33nv8EAid7U0AK4/s0f/USNGeydMZqD0DEi1QZxYgAQbAzNlVgBlgfwCMcdTi/CxkHD4+ADIObwNYQW8Rv3/2hxAECCA9EmV9Kn8Xad+iNK6srE8EWPm4/E/tAzg608bKXBeL3RYSZkhmJJLL86xvOo8ZICJQ9kyLULxzeOHnkLENAPYBAEjpNNh9iO3jES7c30OLUgNbIj1aRGjlR2HuW4TafXm/37bwg7VjWJnrFsYi82yxrBX/FAflnLETRLCDuHxX9o7jszMY7DzE/BEAwPpBGDAAANsOEAc+OAzARJAESJF6lrI+EUGKFPmEAFB6PR2UXgcBJDJ6EGF5rotXzx5Fmxie5xUAyMzzGhOgeh+QLIt+4EUIwxIAmQEQCIJtO5D97sGWQde21wG8NNgNEY1cSM+FzAzJAagaylQaCAEw5X8pUPmx27bw/VOfQjRyEeRUR26cYiwzWDISllo4pGOARDK8IIKnAGBlALgyxmB3D26/czAAnEGaWHYHMSJ3COm5mXeBRDE0UQBQgWCRGQwFAJEy5DufPY7QHcKXqeGSkRqmxLaEhJTp76wCojCBmTEKInhRAlEFII7gOA6cgQUAFw4OgA1I14b0/DTZKJTO/1g1XDnKbFJMgAWABeG5wz0sWzGGe05GbZTUR2lgDoZEzgQUTClDBRiFMbwoZYCgMu+4oYfI9+EMogMz4AKAn4VeF13nIaRHBgAywwEgS3ppP2WAIEqXK0KaO4iwdrQLx3FSAxVjpAqGQvNaHyo4OQCJAkC6uvQcH743gjNw9wfA5tu/Pt6bW7gsrPZJZLYBwDcVsUhN+pHyA5klZk2Dhfuo0gl7oxCXbo3gxSiZwel5DoAXxvDjNAQE0hAQAHwRwXdHGKbL4OQQsKzWiwBO+oM7CPYegJNykjkYRGTW0crvk8ZWfzeaLyxY3T4OHT6BLy0L/PG6DZnFf8GKjD1ulMCLZaEpcgAOtST80QjOBDVbACCTOEniAKOdDw2Oo2x9Zt3e/IS5GMsTxnIxllMw2FTSxohHu0j8PSwuPY+vr3VxZXMP9+wIoyApvM/MCGIJP05qQiiabSP0Rojb0f53hLYu/5bd7Q8ATmreUgdSae1Yj3PlRm0sm9hhkMatLjrznwZZSqHD/F/J7aVzr5AxCSbhaIOEdUZGcTY/qU2qMFKaKN0wlsuxTAQwg6vGFuzQn8sAksiD93CjKgGbtkPG1xmtHjr9Yx80rgJJ6P0d1Doj5UhhNynASwOltUgoEqEEKx6HAhyVU6Vy4rWxPCapTjC0djVnjLCQRP7VRgCiYPRPyARSyhodi4mzOmnKJq2/UvV+CVJuodRmWjxXvYXUjMK1OZjzKE9GQ0rIyL/VCEAceG+SoJ8yy8JQymdGXDyNSAeDK1QuAGEFpMr8dPBYA0NlgQZINpa5GQxuPgHLBMz+m40AuJ73105LgJgL60yU1D1eN5I1ccBa9VZjhwpo/gBpTo5sBLkydtwOUxyChHhnrES5/JuffNgS4iTVvMV6koO+9nONpmx8jSlRUqXeLdkxZqzywCKpsjoHNoXK5upLrz07VgonUbxltVsnue5EA3VRo69KPFJjmVDQV5GONeDS90nD+ww5BijYqoeKnvuUcLk9sRYIgvhS2xJf0WJd43f5m4o8mTI6U9VZGnjM1VAwgKdsgenX0xOpgqSMNekPcF0S1xkgk/U4SSAEaWt4CYaSG5jTtb2yhsM0FqyBRzWWqM9gsJH+qMS9vrJwk/4oJ3xlMgCJfCcMY3Q7lmIMa+t9ynqqeZxzt3CT/mclWeWmygZ5rQooBU4uc05zguY6eAzEUq7v67vAn3/5473ZXqtfS3hcjUWTTCbD0zPDuVR4zXHNjYUTGZMqTyi+isfaL7zyi2f2tR8QR9ENbovzZYCXoMqGNZgU7zcCkhdJtcKo4tHqdcX1XKvDNKIX4WaQ7Vf2vSESxcl1yfJ8nsSKbFpQnQ1x37ACZJlO1QZUGQtNR3CtYCq9yMb3ac9jBTwFUGa5fwDCKL4SxwksEkWMczUU1AJH8VKpeGl89h8ndLii4JTYM8e9SjFprGOEoPV9A8DMf4uiBNRGReGpqMKoxMpqX137m5bDCqCKdK7lCW05JM0LddleX5JlYv420Kgc//Day3z4UEeZCI1NeGTKvA1vMuXJqpAiZZtNX07rs6ZMUanqszqHcz/6VQ9AsN9N0Y4fRhtzM+0zFT2iswB60UIm/a9R1qT/84GyJq+r4DLI8FueL1jPQaq4C+MNAHPZZiTvB4D+YM/bWuj3zpBRUZH+2aq6FHG9ONEozazXD9WyoZZ1K55VN1VY34Ei5f78HQ92hpsKAM4kAA4BmN/6yN4+feKwnqVNsahkWzZUZeXeIKkpTTNc2yFTszeoXpVWY7haB2ShwMo8Nu8N7gA4DSAB4Jb1phmARQArG1u7d8+eXECv04IQ9b04AhXJSEdepYwuatJ1nTSQuCaoKkJCsYQqcc9giGqaIV0yMzOu/evhXQDLAAYZALtNADwDYB7Acxev3tk6//xSQEJ085jLvSgKz1PxQqG8nRQYBJWWkqDyewqXAyjPH8TZtxZKr2c7vERUaAQS6XuEwn/1Ow3y+4vahv2/vLe1DWAGwGoGwBBAZFoF1gCcyujytLZL2f8XuJd90NKaBeDfALafQsNDAPmOsGjSAX0AxwC0n2IGOAAe5CEwbdM2bdM2bZ/k9h/ps4NzJstwQgAAAABJRU5ErkJggg==",
        windows: "data:image/png;base64,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"
    },
    initWidget: function () {
        this.appli.icon.src = this.icons.generic;
        this.appli.icon.click(this.launch, this);
        this.appli.name.click(this.launch, this);
        this.addClass("nobar")
    },
    onModelChanged: function (a) {
        this.appli.name.text = a.name;
        this.appli.icon.src = a.uri == "file:///host" || a.uri == "/host" ? this.icons.windows : this.icons.generic
    },
    launch: function () {
        joli.system.folders.open(this.model.uri);
        this.addClass("launching");
        this.bind("webkitAnimationEnd", joli.bind(function () {
            this.removeClass("launching")
        }, this))
    }
});
launcher.ui.stream.extend("InfiniteItem", joli.ui.Widget, {
    initWidget: function () {
        this.picture.click(function () {
            if (this.model.object.type == "app") this.trigger("showapp", [this.model.object[this.model.object.type]["package"]]);
            else this.model.object.type == "user" && this.trigger("showuser", [this.model.object[this.model.object.type].username])
        }, this);
        this.message.actor.click(function () {
            this.model.actor.type == "user" && this.trigger("showuser", [this.model.actor[this.model.actor.type].username])
        }, this);
        this.message.object.click(function () {
            this.model.object.type != "app" && this.model.object.type == "user" && this.trigger("showuser", [this.model.object[this.model.object.type].username])
        }, this)
    },
    onModelChanged: function (a) {
        this.list.clear();
        if (a && a.literalDate) {
            this.addClass("dateEntry");
            this.message.desc.text = a.literalDate
        } else {
            this.removeClass("dateEntry");
            if (a && a.description) {
                this.list.show();
                var b = a.description;
                b = b.replace("<actor>" + a.actor[a.actor.type].name + "</actor>", "");
                if (a.object.type == "app") if (a.apps) {
                    var c = document.createDocumentFragment();
                    joli.each(a.apps, function (g, f) {
                        joli.model.apps.instances[g["package"]] && this.list.addItem().setModel(joli.model.apps.instances[g["package"]]);
                        var h = ", ";
                        if (a.apps.length - 1 == f) h = " and ";
                        if (f == 0) {
                            var i = document.createElement("span");
                            i.innerHTML = g.name;
                            i.onclick = joli.bind(function () {
                                this.trigger("showapp", [g["package"]])
                            }, this)
                        } else {
                            i = document.createElement("span");
                            i.innerHTML = g.name;
                            i.onclick = joli.bind(function () {
                                this.trigger("showapp", [g["package"]])
                            }, this);
                            h = document.createTextNode(h);
                            c.appendChild(h)
                        }
                        c.appendChild(i)
                    }, this);
                    b = b.replace("&amp;", "&").replace("<object>" + a.object[a.object.type].name + "</object>", "");
                    this.message.object._element.appendChild(c)
                } else {
                    b = b.replace("&amp;", "&").replace("<object>" + a.object[a.object.type].name + "</object>", "");
                    object_name = a.object[a.object.type].name;
                    if (joli.model.apps.instances[a.object.app["package"]]) {
                        console.log("item found in instances array");
                        this.list.addItem().setModel(joli.model.apps.instances[a.object.app["package"]])
                    }
                    var d = document.createElement("span");
                    d.innerHTML = object_name;
                    d.onclick = joli.bind(function () {
                        this.trigger("showapp", [a.object.app["package"]])
                    }, this);
                    this.message.object._element.appendChild(d)
                } else {
                    if (a.object.type == "user") {
                        b = b.replace("<object>" + a.object[a.object.type].name + "</object>", "");
                        object_name = a.object[a.object.type].name;
                        this.list.addItem().setModel(a.object.user)
                    } else {
                        b = b.replace("<object>", "");
                        b = b.replace("</object>", "");
                        object_name = ""
                    }
                    this.message.object.text = object_name
                }
                this.picture.src = a.actor[a.actor.type].pictures.large;
                this.message.actor.text = a.actor[a.actor.type].first_name || a.actor[a.actor.type].name;
                this.message.desc.text = b;
                b.indexOf("liked") != -1 ? this.message.addClass("liked") : this.message.removeClass("liked")
            }
            if (a && a.post) {
                this.list.hide();
                this.picture.src = a.actor[a.actor.type].pictures.large;
                this.message.actor.text = a.actor[a.actor.type].name;
                this.message.desc.innerHTML = " said " + a.post;
                this.message.object.text = ""
            }
        }
    }
});
launcher.ui.files.extend("Item", joli.ui.Widget, {
    initWidget: function () {
        this.click(function () {
            var a = {
                service: joli.getFileAttribute(this.model, "service"),
                path: joli.getFileAttribute(this.model, "path"),
                docs_path: joli.getFileAttribute(this.model, "docs_path"),
                root: joli.getFileAttribute(this.model, "root"),
                modified: joli.getFileAttribute(this.model, "modified"),
                bytes: joli.getFileAttribute(this.model, "bytes"),
                mime_type: joli.getFileAttribute(this.model, "mime_type"),
                thumb: this.getThumbnail(),
                thumb_path: joli.getFileAttribute(this.model, "thumb_path"),
                open: joli.getFileAttribute(this.model, "open"),
                preview: joli.getFileAttribute(this.model, "preview")
            };
            launcher.ui.files.selectedItem && launcher.ui.files.selectedItem.removeClass("selected");
            launcher.ui.files.selectedItem = this;
            this.addClass("selected");
            this.trigger("details", [a, joli.getFileAttribute(this.model, "service")])
        }, this);
        this.name.click(function () {
            if (joli.getFileAttribute(this.model, "is_dir") == true) this.trigger("getfiles", [joli.getFileAttribute(this.model, "path"), joli.getFileAttribute(this.model, "service"), joli.getFileAttribute(this.model, "root"), joli.getFileAttribute(this.model, "docs_path"), joli.getFileAttribute(this.model, "ids_docs_path")]);
            else {
                this.trigger("details", [{
                    service: joli.getFileAttribute(this.model, "service"),
                    path: joli.getFileAttribute(this.model, "path"),
                    docs_path: joli.getFileAttribute(this.model, "docs_path"),
                    root: joli.getFileAttribute(this.model, "root"),
                    modified: joli.getFileAttribute(this.model, "modified"),
                    bytes: joli.getFileAttribute(this.model, "bytes"),
                    mime_type: joli.getFileAttribute(this.model, "mime_type"),
                    thumb: this.getThumbnail(),
                    thumb_path: joli.getFileAttribute(this.model, "thumb_path"),
                    open: joli.getFileAttribute(this.model, "open"),
                    preview: joli.getFileAttribute(this.model, "preview")
                },
                joli.getFileAttribute(this.model, "service")]);
                if (joli.getFileAttribute(this.model, "service") == "googledocs" && joli.getFileAttribute(this.model, "preview")) {
                    var a = joli.getFileAttribute(this.model, "path"),
                        b = joli.getFileAttribute(this.model, "preview"),
                        c = joli.getFileAttribute(this.model, "open").indexOf("leaf") == -1 ? "iframe" : joli.getFileAttribute(this.model, "mime_type");
                    joli.ui.root.previewbox.show(a.split("/")[a.split("/").length - 1], b, c, undefined, 0, 0, this.model)
                } else if (joli.getFileAttribute(this.model, "service") != "googledocs") if (joli.getFileAttribute(this.model, "service") == "dropbox" && this.isPreviewSupported(joli.getFileAttribute(this.model, "mime_type"))) joli.cloud.dropbox.get(joli.getFileAttribute(this.model, "path"), function (d) {
                    var g = joli.getFileAttribute(this.model, "path");
                    joli.ui.root.previewbox.show(g.split("/")[g.split("/").length - 1], d.url, joli.getFileAttribute(this.model, "mime_type"), undefined, 0, 0, this.model)
                }, this);
                else if (joli.getFileAttribute(this.model, "service") != "dropbox") if (this.isPreviewSupported(joli.getFileAttribute(this.model, "mime_type"))) {
                    a = joli.getFileAttribute(this.model, "path");
                    joli.ui.root.previewbox.show(a.split("/")[a.split("/").length - 1], "http://" + joli.config.systemUri + "/get_file.rpy?root=" + encodeURIComponent(joli.getFileAttribute(this.model, "root")) + "&path=" + encodeURIComponent(joli.getFileAttribute(this.model, "path")), joli.getFileAttribute(this.model, "mime_type"), undefined, 0, 0, this.model)
                } else joli.system.filesystem.open(joli.getFileAttribute(this.model, "path"), joli.getFileAttribute(this.model, "root"))
            }
        }, this)
    },
    isPreviewSupported: function (a) {
        var b = ["image/png", "image/jpg", "image/jpeg", "audio/mpeg", "video/"],
            c = false;
        a && joli.each(b, function (d) {
            if (a.indexOf(d) != -1) c = true
        }, this);
        if (joli.getFileAttribute(this.model, "service") == "googledocs") c = true;
        return c
    },
    onModelChanged: function (a) {
        joli.getFileAttribute(a, "is_dir") == true ? this.addClass("folder") : this.addClass("file");
        var b = joli.getFileAttribute(a, "path");
        this.name.text = b.split("/")[b.split("/").length - 1];
        this.size.text = joli.getFileAttribute(a, "is_dir") == true || joli.getFileAttribute(this.model, "service") == "googledocs" && joli.getFileAttribute(a, "bytes") == 0 ? "--" : joli.getFilesReadableSize(joli.getFileAttribute(a, "bytes"));
        this.date.text = joli.getFileAttribute(a, "modified") != "" ? joli.getFilesReadableDate(joli.getFileAttribute(a, "modified")) : "--";
        joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") == -1 && this.addClass(joli.getFileAttribute(a, "docs_path"));
        joli.getFileAttribute(a, "is_dir") == false && joli.getFileAttribute(a, "docs_path") && joli.getFileAttribute(a, "docs_path").indexOf(":") != -1 && this.addClass(joli.getFileAttribute(a, "docs_path").split(":")[0])
    },
    getThumbnail: function () {
        return joli.getFileAttribute(this.model, "thumbnail") == true ? joli.getFileAttribute(this.model, "service") == "dropbox" ? "dropbox" : joli.getFileAttribute(this.model, "service") == "googledocs" ? "googledocs" : "http://" + joli.config.systemUri + "/get_thumbnail.rpy?root=" + encodeURIComponent(joli.getFileAttribute(this.model, "root")) + "&path=" + encodeURIComponent(joli.getFileAttribute(this.model, "path")) : joli.getFileAttribute(this.model, "is_dir") == true ? "folder" : "file"
    }
});
launcher.ui.settings.extend("Extra", joli.ui.Widget, {
    initWidget: function () {
        this.icon.click(this.launch, this);
        this.main.name.click(this.launch, this);
        this.main.menu.hide();
        this.main.removeClass("hasmenu")
    },
    launch: function () {
        this.addClass("launching");
        this.bind("webkitAnimationEnd", joli.bind(function () {
            this.removeClass("launching")
        }, this))
    }
});
launcher.ui.settings.extend("History", joli.ui.Widget, {
    initWidget: function () {
        this.message.actor.click(function () {
            this.model.actor.type == "user" && this.trigger("showuser", [this.model.actor[this.model.actor.type].username])
        }, this);
        this.message.object.click(function () {
            if (this.model.object.type == "app") this.trigger("showapp", [this.model.object[this.model.object.type]["package"]]);
            else this.model.object.type == "user" && this.trigger("showuser", [this.model.object[this.model.object.type].username])
        }, this)
    },
    onModelChanged: function (a) {
        if (a && a.description) {
            var b = a.description;
            b = b.replace("<actor>" + a.actor[a.actor.type].name + "</actor>", "");
            if (a.object.type == "app") {
                b = b.replace("<object>" + a.object[a.object.type].name + "</object>", "");
                object_name = a.object[a.object.type].name
            } else if (a.object.type == "user") {
                b = b.replace("<object>" + a.object[a.object.type].name + "</object>", "");
                object_name = a.object[a.object.type].name
            } else {
                b = b.replace("<object>", "");
                b = b.replace("</object>", "");
                object_name = ""
            }
            var c = joli.relativeTime(a.time),
                d = joli.convertForTimeElement(a.time);
            this.message.time.text = c;
            this.message.time.$.attr("datetime", d);
            this.message.actor.text = a.actor[a.actor.type].first_name || a.actor[a.actor.type].name;
            this.message.desc.text = b;
            this.message.object.text = object_name
        }
    }
});
launcher.ui.settings.extend("Paginator", joli.ui.Paginator, {
    options: {
        startPage: 0,
        perPage: 10,
        pageRadius: 2
    },
    onOptionsChanged: function (a) {
        this._super(a);
        this.model = a.method ?
        function (b, c, d, g) {
            var f = a.method,
                h = a.method.lastIndexOf("."),
                i = eval(f.substring(0, h));
            f = f.substring(h + 1);
            var j = joli.bind(function () {
                var l = this.data.slice(b, b + c);
                d.call(g, l)
            }, this);
            if (this.data) j();
            else i[f](g.methodParams, joli.bind(function (l) {
                this.data = l;
                this.lastPage = Math.ceil(l.length / this.options.perPage) - 1;
                j()
            }, this))
        } : function (b, c, d, g) {
            var f = joli.bind(function () {
                var h = this.data.slice(b, b + c);
                d.call(g, h)
            }, this);
            if (this.data) {
                this.lastPage = Math.ceil(this.data.length / this.options.perPage) - 1;
                f()
            }
        }
    }
});
launcher.ui.settings.extend("Update", joli.ui.Widget, {
    onModelChanged: function (a) {
        this.title.text = a.name;
        this.description.text = a.summary.charAt(0).toUpperCase() + a.summary.slice(1);
        if (this.description.text.charAt(this.description.text.length) != ".") this.description.text += "."
    }
});
launcher.ui.settings.extend("Membership", joli.ui.Widget, {
    onModelChanged: function (a) {
        this.badge.addClass(a.key);
        this.badge.text = a.title;
        this.title.text = a.title;
        this.description.text = a.description
    }
});
launcher.ui.settings.extend("Settings", joli.ui.Widget, {
    capabilities: [],
    initWidget: function () {
        joli.Events.subscribe("resize", joli.bind(function () {
            joli.ui.root.menu.getItem("settings").active && this.resizeList()
        }, this))
    },
    resizeList: function () {
        var a = joli.ui.root.outerHeight() - 49 - 82 - 36 - 20 - 50,
            b, c;
        if (this.sidebar.getItem("account").active) {
            if (this.stack.content.content.account.tabs.getItem("history").active) {
                b = parseInt(a / 29, 10);
                c = this.stack.content.content.account.content.history.pager
            }
            if (this.stack.content.content.account.tabs.getItem("apps").active) {
                b = parseInt(a / 70, 10) * 2;
                c = this.stack.content.content.account.content.apps.pager
            }
            if (this.stack.content.content.account.tabs.getItem("devices").active) {
                b = parseInt(a / 70, 10) * 2;
                c = this.stack.content.content.account.content.devices.pager
            }
            if (b && c) if (c.options.perPage != b && b > 0) {
                c.page = 0;
                c.options.perPage = b;
                if (this.stack.content.content.account.tabs.getItem("devices").active) this.refreshDevices();
                else {
                    c.pageData = undefined;
                    c.redisplay()
                }
                this.stack.popToBottom()
            }
        }
    },
    connectionChanged: function (a, b) {
        var c = this.stack.content.content.account;
        if (b) {
            c.tabs.getItem("history").show();
            c.tabs.getItem("apps").show();
            c.tabs.getItem("settings").show();
            c.tabs.getItem("logout").show();
            this.stack.content.content.device.tabs.getItem("updates").show();
            this.stack.content.content.device.tabs.getItem("appssync").show()
        } else {
            c.tabs.getItem("history").hide();
            c.tabs.getItem("apps").hide();
            c.tabs.getItem("settings").hide();
            c.tabs.getItem("logout").hide();
            this.stack.content.content.device.tabs.getItem("updates").hide();
            this.stack.content.content.device.tabs.getItem("appssync").hide()
        }
    },
    prepareToShow: function (a) {
        var b = joli.bind(function () {
            a();
            this.resizeList()
        }, this);
        joli.system.websocketserver.connected ? this.sidebar.getItem("myjolicloud|device").show() : this.sidebar.getItem("myjolicloud|device").hide();
        if (this.hasShown) b();
        else {
            this.hasShown = true;
            this.stack.content.profile.show();
            this.stack.content.device.hide();
            this.stack.content.content.account.tabs.activate("info");
            this.sidebar.getItem("myjolicloud|device").hide();
            this.stack.content.content.device.tabs.activate("info");
            this.stack.content.content.device.tabs.getItem("extra").hide();
            joli.cloud.joliserver.bind_connection_changed(this.connectionChanged.bind(this));
            joli.cloud.user.me(function (c) {
                var d = [_("January"), _("February"), _("March"), _("April"), _("May"), _("June"), _("July"), _("August"), _("September"), _("October"), _("November"), _("December")];
                this.stack.content.profile.icon.setOption("offline", true);
                this.stack.content.profile.setModel(c);
                var g = new Date(c.created);
                this.stack.content.profile.description.text = c.about;
                var f = this.stack.content.content.account.content.info;
                f.account.publicpage.innerHTML = '<a style="font-weight:bold" href="http://my.jolicloud.com/' + c.username + '" target="_blank">my.jolicloud.com/' + c.username + "</a>";
                joli.username = c.username;
                f.account.username.text = c.username;
                f.account.language.text = c.language ? c.language.name : _("Default Language");
                f.account.email.text = c.email == "" || c.email == null ? _("Please confirm your email address.") : c.email;
                f.details.fullname.text = c.name;
                var h = "&nbsp;";
                if (c.gender) h = c.gender === "M" ? _("Male") : _("Female");
                f.details.gender.innerHTML = h;
                if (c.birthday) {
                    h = new Date(c.birthday);
                    h = new Date(h.getTime() + 36E5 + h.getTimezoneOffset() * 6E4);
                    f.details.birthday.text = d[h.getMonth()] + " " + h.getDate() + ", " + h.getFullYear()
                } else f.details.birthday.innerHTML = "&nbsp;";
                h = "&nbsp;";
                if (c.country) h = c.country.country.english_name;
                f.details.country.innerHTML = h;
                f.details.join.text = _("Since") + " " + d[g.getMonth()] + " " + g.getFullYear()
            }, this);
            this.stack.content.device.setModel({
                model: "computer",
                name: "",
                description: "Jolicloud Guest"
            });
            this.stack.content.content.device.content.info.clear();
            this.stack.content.content.device.content.info.addItem("Warning", _("You are using Joli OS as a guest. Your local changes will not be saved."));
            joli.cloud.user.computers(function (c) {
                joli.each(c, function (d) {
                    joli.computer && d.uuid == joli.computer.uuid && this.setComputerInfo(d)
                }, this);
                this.stack.content.content.account.content.devices.pager.redisplay()
            }, this);
            joli.cloud.user.badges(function (c) {
                joli.each(c, function (d) {
                    this.stack.content.content.account.content.membership.addItem().setModel(d)
                }, this)
            }, this);
            joli.cloud.joliserver.bind("requests_end", joli.bind(function () {
                this.sidebar.activate("myjolicloud|account");
                b()
            }, this));
            this.extra()
        }
    },
    events: {
        showuser: function (a, b) {
            this.stack.pushChild({
                type: "user",
                username: b
            })
        },
        showapp: function (a, b) {
            this.stack.pushChild({
                type: "app",
                "package": b
            })
        },
        sidebar: function (a, b) {
            var c = b.split("|");
            if (c[1] == "account") {
                this.stack.content.profile.show();
                this.stack.content.device.hide();
                this.showChild(c[1])
            } else if (joli.system.websocketserver.connected) {
                this.stack.content.profile.hide();
                this.stack.content.device.show();
                this.showChild(c[1])
            }
            this.resizeList();
            a && a.preventDefault()
        },
        tabs: function (a, b) {
            if (b == "settings") window.open("/settings", "_blank", "", false);
            else if (b == "logout") document.location.href = document.location.protocol + "//" + document.location.hostname + "/logout";
            else {
                var c = joli.ui.root.outerHeight() - 49 - 82 - 35 - 20 - 50,
                    d, g;
                if (b == "history") {
                    d = parseInt(c / 29, 10);
                    g = this.stack.content.content.account.content.history.pager
                }
                if (b == "apps") {
                    d = parseInt(c / 70, 10) * 2;
                    g = this.stack.content.content.account.content.apps.pager
                }
                if (b == "devices") {
                    d = parseInt(c / 70, 10) * 2;
                    g = this.stack.content.content.account.content.devices.pager
                }
                if (d && g) if (g.options.perPage != d && d > 0) {
                    c = g.pageData;
                    g.pageData = undefined;
                    g.page = 0;
                    g.options.perPage = d;
                    if (c) {
                        b == "devices" ? this.refreshDevices() : g.redisplay();
                        this.stack.popToBottom()
                    }
                }
                this.stack.content.content.account.content.showChild(b, joli.bind(function () {
                    this.stack.content.content.account.tabs.activate(b, true);
                    this.resizeList()
                }, this))
            }
            a.preventDefault()
        },
        myjolicloud_reclick: function () {
            this.stack.popToBottom()
        },
        refreshDevices: function () {
            this.refreshDevices()
        },
        update: function () {
            this.upgrading(true);
            joli.ui.root.sync.sync(true);
            joli.ui.root.sync.events.start()
        },
        appssync: function () {
            joli.ui.root.sync.sync(false);
            joli.ui.root.sync.events.start()
        },
        checkupdate: function () {
            joli.ui.root.checkUpdates()
        }
    },
    setComputerInfo: function (a) {
        this.sidebar.getItem("myjolicloud|device").show();
        this.stack.content.content.device.tabs.activate("info");
        joli.computer.version && joli.computer.version.indexOf("1.0") == 0 && this.stack.content.content.device.tabs.getItem("extra").show();
        this.stack.content.device.setModel({
            model: "computer",
            name: a.name,
            description: a.model.name
        });
        var b = this.stack.content.content.device.content.info;
        b.clear();
        b.addItem(_("Name"), a.name);
        if (a.users_count > 1) if (a.users_count == 2) b.addItem(_("Users"), _("This device is shared with 1 other user."));
        else a.users_count > 2 && b.addItem(_("Users"), _("This device is shared with %{n} other users.").replace("%{n}", a.users_count - 1));
        var c = {
            autologin: {
                title: _("Auto-Login"),
                description: _("Enable automatic login on this device.")
            },
            guestmode: {
                title: _("Guest Mode"),
                description: _("Allow a guest to login to this device (Your network connection will restart).")
            }
        };
        joli.system.preferences.capabilities(function (d) {
            this.capabilities = d;
            joli.each(d, function (g) {
                if (c[g]) {
                    var f = b.addItem(c[g].title, "&nbsp;");
                    joli.system.preferences[g]("status", function (h) {
                        f.innerHTML = '<input type="checkbox" ' + (h == "enabled" ? 'checked="checked"' : "") + ' id="' + g + 'checkbox" /> ' + c[g].description;
                        jQuery("#" + g + "checkbox").bind("change", function (i) {
                            joli.system.preferences[g](i.target.checked ? "enable" : "disable")
                        })
                    }, this)
                }
            }, this)
        }, this)
    },
    showChild: function (a, b) {
        this.stack.content.content.showChild(a, joli.bind(function () {
            this.sidebar.activate(a, true);
            this.stack.popToBottom();
            (b || joli.doNothing)()
        }, this))
    },
    refreshDevices: function () {
        joli.cloud.user.computers(function (a) {
            joli.each(a, function (b) {
                joli.computer && b.uuid == joli.computer.uuid && this.setComputerInfo(b)
            }, this);
            this.stack.content.content.account.content.devices.pager.data = undefined;
            this.stack.content.content.account.content.devices.pager.redisplay()
        }, this)
    },
    syncing: function (a) {
        if (a) {
            var b = this.stack.content.content.device.content.appssync;
            b.appssync.list.clear();
            a = joli.ui.root.sync.syncedPackages.slice(0);
            joli.each(a, function (c) {
                c["package"] != "systemupdate" && b.appssync.list.addItem().setModel(c)
            }, this);
            b.appssyncstatus.hide();
            b.startappssync.hide();
            b.appssync.show()
        } else this.sync()
    },
    sync: function () {
        var a = this.stack.content.content.device.content.appssync,
            b = joli.packages_to_sync.slice(0);
        joli.each(b, function (c, d) {
            c == "systemupdate" && b.splice(d, 1)
        }, this);
        if (b && b.length > 0) {
            this.stack.content.content.device.tabs.getItem("appssync").label.text = b.length + " " + (b.length == 1 ? _("App to Sync") : _("Apps to Sync"));
            a.appssync.list.clear();
            joli.each(b, function (c) {
                c != "systemupdate" && a.appssync.list.addItem().setModel(c)
            }, this);
            a.appssyncstatus.hide();
            a.startappssync.show();
            a.appssync.show()
        } else {
            a.startappssync.hide();
            this.stack.content.content.device.tabs.getItem("appssync").label.text = _("Apps Sync");
            a.appssync.hide();
            a.appssyncstatus.show()
        }
    },
    upgrading: function (a) {
        if (a) {
            a = this.stack.content.content.device.content.updates;
            a.updates.hide();
            a.startupdate.hide();
            a.syncstatus.status.removeClass("no");
            a.syncstatus.status.addClass("upgrading");
            a.syncstatus.status.text = _("System updating...");
            a.syncstatus.show()
        } else this.update()
    },
    update: function () {
        var a = this.stack.content.content.device.content.updates;
        if (joli.packages_to_update && joli.packages_to_update.length > 0) {
            this.stack.content.content.device.tabs.getItem("updates").label.text = joli.packages_to_update.length + " " + (joli.packages_to_update.length == 1 ? _("New Update") : _("New Updates"));
            a.updates.list.clear();
            joli.each(joli.packages_to_update, function (b) {
                a.updates.list.addItem().setModel(b)
            }, this);
            a.syncstatus.hide();
            a.startupdate.show();
            a.updates.show()
        } else {
            a.syncstatus.status.removeClass("upgrading");
            a.syncstatus.status.addClass("no");
            a.syncstatus.status.text = _("Your system is synchronized.");
            this.stack.content.content.device.tabs.getItem("updates").label.text = _("Updates");
            a.updates.hide();
            a.startupdate.hide();
            a.syncstatus.show()
        }
    },
    guestSession: function () {
        this.stack.content.content.device.tabs.getItem("updates").hide();
        this.stack.content.content.device.tabs.getItem("appssync").hide()
    },
    disableSyncButtons: function () {
        this.stack.content.content.device.content.updates.startupdate.update.addClass("disabled");
        this.stack.content.content.device.content.appssync.startappssync.appssyncbutton.addClass("disabled")
    },
    enableSyncButtons: function () {
        this.stack.content.content.device.content.updates.startupdate.update.removeClass("disabled");
        this.stack.content.content.device.content.appssync.startappssync.appssyncbutton.removeClass("disabled")
    },
    extra: function () {
        var a = [{
            name: _("Local Settings"),
            exec: function () {
                joli.system.apps.launchSettings()
            },
            className: "localsettings",
            type: "localsettings"
        }, {
            name: _("Calculator"),
            exec: function () {
                joli.system.apps.launch("gcalctool")
            },
            className: "calculator",
            type: "localsettings"
        }, {
            name: _("Dictionary"),
            exec: function () {
                joli.system.apps.launch("gnome-dictionary")
            },
            className: "dictionary",
            type: "localsettings"
        }, {
            name: _("Movie Player"),
            exec: function () {
                joli.system.apps.launch("totem")
            },
            className: "movie",
            type: "localsettings"
        }, {
            name: _("Sound Recorder"),
            exec: function () {
                joli.system.apps.launch("gnome-sound-recorder")
            },
            className: "sound",
            type: "localsettings"
        }, {
            name: _("Take Screenshot"),
            exec: function () {
                joli.system.apps.launch("gnome-screenshot --interactive")
            },
            className: "screenshot",
            type: "localsettings"
        }, {
            name: _("Text Editor"),
            exec: function () {
                joli.system.apps.launch("gedit")
            },
            className: "texteditor",
            type: "localsettings"
        }, {
            name: _("Local Apps"),
            exec: function () {
                joli.system.folders.open("/usr/share/applications")
            },
            className: "localapps",
            type: "localsettings"
        }];
        joli.each(a, function (b) {
            var c = this.stack.content.content.device.content.extra.list.addItem();
            c.appli.name.text = b.name;
            c.appli.icon.src = this.images[b.className];
            c.model = b
        }, this)
    },
    images: {
        calculator: "data:image/png;base64,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",
        screenshot: "data:image/png;base64,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",
        texteditor: "data:image/png;base64,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",
        photo: "data:image/png;base64,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",
        dictionary: "data:image/png;base64,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",
        movie: "data:image/png;base64,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",
        sound: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAADUlJREFUeNrtWmuME9cZvbtLXiTEDoQ8SAgGAglEsA4kqvLcXRCo0NBdWlW0UqP1tkIgSNmlkFStIh6t+ieRmo2C1D9tMQhV8CsGVCkCAaYoBYSA3Si8IevlzfLIGtiX7Rn3nPHc8Z3x2N4XrFftlT7dmfHM2Od8z/tdF4v/8VH8fwIG6di0adPEXbt2le3bt6/swIEDZY2NjWPuKQG3Plns+f6zpdXRv9auv/OPFXva/vm7ZNvm3yfvbvqo6fbffrsnum7Z6u//sqT0XgH+9NNPR2zcuPFXmzdv/te2bduSw4YNOxWLxcKapoU5QyLHjh37/syZM19GIpHqfiPg2kfve1o+DqzXY4nWZEIPJuN6QI9p5Vp7XOjtMaF3JHxJnOsJfU0yrjXc+OOvm1r+UF3Zj9hLvvjiiw9HjBjRNGTIkL8nk8m5iURCFBcXG1JUVCRw3TjWdd0LQqogQRDRdP78+eo+EXB58c8qATwCYIFkTBfJroTQOwG8IwVeuxtLkYBryS5ci2kC9/lwf+jKsp9/iec9fUG+Y8eOafX19d8A4CcANQzgDcCUBx54QJSUlFizJIHCgXMfpuC1a9f2QDw9JuDC+5XVOoBAu16I0AlQBd8GaZcSFxqvd4IgkmQQoVWBvPCFX1b2mITLly97YMbrofXDHo9nMjSb/sEmSJJhat2YSQDJoAwdOlQ8+OCD4pFHHuEj5bin4dKlS6XdJiCy4EfVukZz11KAOlNCkAbYthQB+l1zNlzBJIckmSRA/HhPGO/rEQnRaDR48eLFAPxaTJ48WTz88MOWucshjwlcWoUkSFoISYrH4wIu48NxGKR68hJw7ic/LNW1ZDCp6QJ+bRIQTwM0ta4bFtCVmttS53pHLE1CLCGMd2g6SQh2F/zKlStHHDp0aDrBw+wNMC+//LJl2gTlNuR1zuqxnPEeLywhnJcAnYEu9cNTBFBiivYleEV06QYUMxYYz+EdJpFVZ348u1uBEdr+84ULF0bDb6k5Q2gBkyZNsrmBBEqSONMVKBI0Nc8hSSShuOY/ceLE6qwEnJwzs9rUmAWAovGY7hBLWYNBRkfMIsQ4l8DjCnHKOyD13dD+xEcffXQRj7/77jtx+/ZtAwBJeOihh8SYMWNsoCkMgDzn4H0E2tHRYcxtbW0GETxvb28XnZ2dvF539OhRjysB0FZVUgWf0OwCErS4JMMU41oKuOa83yTBfKfv+OyKnHXCk08++bE0dQI7deoU44FlCY899pgYPXq0RQKFoDgTKC2A93GWLsTr8l7zmKmyzpUAmmoKvGbXoqlVCZCANfPcso64QpD6rEkESUAdUZUr38NUq6Q25Q8+e/asoUFJwuOPPy6ee+4543Np8rwuTb2rq8vQNp8lOfyMsxkMpVUEMgj45p23y9Ka121al6ANLcdNchTQBnBL4+lnVCswPyvPhn7VqlUzoP1hapQnOAI6ffq0BYrCNPfss88agPg5wfNzeQ+vETRnCq2BsyQB5769e/eW2gjAj/NlaN6UlFZNkKbJa3Hl2CREU8jQbDHAIsObjQDk7Hf4A9XITXegK9ACaAkqCYgV4vnnnzesQF4zfdwyex7zPdIdVJcAEX47AZrus2k+oWrWDG5xu8lLQizwKnBJRFxTYoruz0YAgIx3pjiZxwmS4BgYZYDjdeZ6kkCiJEjOvJdkUet37961rkmC+BlrA4cFZGpdk/7vAlZTCJIgNQcZ9ndpVrR2G6jcRqkBUCHGiu4EgxRpI4HPjBw50gqI0hpkIJSzvCbdALPXSUBYmrnm9P+EQ/vOjKDECN1hMY5YEM5GwJQpU7yy5HUSpQY7pkZUiUYwIzAKSRg7dqwRN6TvkyR1JnBqXpKBd9kJQJSOaI6on6FVReMSvBZP32MLljYSrXdG3MDDtCunT5/ur6iosJW5qkvILEAwt27dEk1NTZZ5S/NndqBbqMFPmr2clYAYsRHwg2NHm/GDI5n+r6dnK+orQTGhnMftccNyI/M86WIB27dv96DqqyeoF198UZAEGQBZ56vxQAYxCi2AMeHOnTs2ElgnYAFlZQNaD2eZKtX6IKMOiGtFIdxn5Xh7fldBObKAlf/VjJAGnsA1XGpFHAw5CYAmAyDA19LSIm7cuCHGjRtnkSBzu2oVMiZQaN5Y84vW1lZL45SnnnqKRZUtCMpqUN4DAsIZBMSSJfUdWonohMS0Yv5o48c705zucAvdkR75TCKB9AMyu/Aevq9LKwm9faYxqn7fnDlzSnfu3FlP8FKuX79ulLzl5eWuCxtJgIzqBEV3oAWpOd/r9Qqfz2fVEkoNINcNDRkEzDp3pLlLL1nToQ8RHVpaOk1SCKZLKzKA2aXIuJ76PHUviZTv6dSGtMaTJXXqd73xxhserPfDrOx2794tuPhRSaApkwR1GSyzhCySZGUn3YHvUC2BtQLdinFBjQMAH6qpqYm6rgbnRQ6tBYCGDj0Nop1EGOcpQKnztLRr6c+s+/T0eVeyODC36ZBN+8jfYfT1vPRXmjAanOLq1atCtQYGNWkJUvvOIf2ZwOgOaIXZTJ3g2VMg0SSM5LFllrMhEk8Wl0NrDSkQaU1aRJiktCtktOO6dW4JXEkvCfy0+eBW9f2VlZXs9vilaVPbN2/eFPv372c3yEYC/bmsrCzr2p+BknWDCcyII1jyGulSxgoOLqeZKlFvhD/44IOtOQn4xYX/RGMmCe0mEAuoZncPV9HT4PGuDeq7586dW4vCJaCCoWmPHz/eyO9ff/21MTtJmD9/vmHSaldIaXZYq0Ce0yVIAtpgVvSnvPDCC2LevHnhbvUEA5f2RWsu//vVGGOCAqpDyyShXXO6SUkDAqo/cHmfDTyiexnA1MtKT83z8hhtK4FevzGrJBDkrFmzjF6f0wVU8LI9xuvNzc0CrXKrr/DEE0+0Dh8+PNijtviiq+G1CGA+BDdkiCGRtMmbZq+n/b1TLwkBeNXiq+FXF10JN6rvee2118aMGjUq5AQgIz1/LH2Xx7QArNYMf2Zgk0KQs2fPNvoCTktwNkwloQR//PhxceXKlSBijh8xp7nHGyO/ubareVnLruW1LbvGkgxYRXmXXlzHjBHTi6t4js+Kll3bPR/3bnU+jyrPA/8LYRnrzQaejQ/1h1Prhw8fNkxZtQSS8N577wlo0vYdqhuo10gISP/TggULaqCA5j5vja28vqMZsvfD6zs/h6xdeX3nVp7negYRvx7M+93AM/hR5LlKAi2B7oBtL1uaZNaYMWOGmDhxYoYLycUUgyMIjwD8jLq6ulUDtjc4c+bM1ajKAk7gEjy17wSunrOSY2BEp5hmbCNh2rRp4s0337QAS42jfxiBudchaPpXrFixZ8A2R1HsVCKXr3FrYdPfqWGn5t3IYAFz8OBB1wzBWgFpVQBwCIDX0M+XL18+dsmSJZ8vXLgwOmC7w1OnTi2F3wfVBY0crNYY4OizuQhQhfceOXJEfPXVV4bVKFVjmNtgADy/trZ27dKlSxsHfHsca3sP/DMIU/Q6TZpAWLvnA++2yUFhybtlyxaSEYIb+N96662KCRMmNBfU/wOwmAnS/7Ks/a101xvhwBI4uG7duvnV1dWNff2t/U4Aip3PkKJc298sbrh+7y14k4AAav6agvyHCCJyNdrVdc6Ib/zPAGnMLd11R+MO8BsK8i8yiPiliMj1akNTDgJn9HbGg15ofkN/W2y/EPDSSy95nn766ZAMeuqgv7OT2wfwrdzjR+TfcC/iVb8QgDYWc7DPDTx3ddTNzFxEOJe6GAZ4xI69BfsvMazV12OVlbHlxTTHoKeCzydyRadqHimzUdzD0ScC3n333WqYfsDtM2qejcheBjz268qRMu8p+D4RgOVtKRqPQbegR82rud5tHZBD7hv4XhMAn/c888wzYe7SOmt8Bjy2pdz+ttId8FjQlJ87dy4q7tPoMQFoNXvQvgoj6Hnd0h3zfS/Bs1VVjl3g+wa+VwSgzK1H0PM71+Gs8Gj63Yn2Lr4fBPCK+w2+xwS8/vrrtShzA85tbDYhuX+fz9/drhM8VoY1YoBGtwl45ZVXyljpOZe3THP8L49sPzsB58n7Awq+2wSgnTyGPT3nZiVBnzx50rXQybacVUvbgQbfLQIA3oNNhRD+q5cR9OTfVtza2/nqeoDfIApg5CUAuzZGO9llV9doOWfbsRkM4PMSgBXeaixvq5wguQcnc30+U3eWtoUEPicB6OVXoszNaGgSODcxcwU7l/a3BL9XFNhwJcDv95dC8xkNTW5bs6Xl1uXNZgVyRYd40SgKcLgSgJ3boDPoMdfT9N2A5/D/BkjBgs9KAMC3OsHLdOdm6tnAU/Oo6wsWfFYCsE8XUtf1Kng383chRYKPigIfrgTA1IMgoTUX+Bz9+zDNHrGi4MHnIiCKPF//7bffGoVOtuES/IJ4rgIyKMDnTIMIXGvxH5uGfC9QwWM1WCMG2chXCZab/pyPhCC6toMOfF4C6AqQV3G4xsznbqNfd2oKcjUIgGvZDILUQcIO8BvEIB7d7geY1vA5pAJSZMqgBs/xX1V8OIA+Zc/fAAAAAElFTkSuQmCC",
        localsettings: "data:image/png;base64,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",
        localapps: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAACb1JREFUeNrtWt1vHUcV/53Z+2XHN25s4iSGxE0dTFOEhAJSJAR9QSAhhCqeaF8QIF76hvgHeO8jQuKNByR4BAmpEmqBRkqkSoG2TkIimjoQ1/kgbmLf9d69+z2Hh/2a2Z291zESDekdydmdu7O7c37nd878zmyAaZu2aZu2aZu2aZu2aZu2aZu2aZu2T1yjJ32COzdeP2H15i+Kzuzq49wnw9GtxLe/tvDCt++PG9d60gGwevMXk8BZde9fRRI44CQa71GrDavbR2/h9KrVm78I4Mz/NQCxN1h1760DAG5ubgMA1laWGsdzEiEe7WA42sGh5S9OZM0TDcDu+2+85X10s+hfevcWTp04gms378Ie+ji22MeXP78Ce+ih12nh0ru3YA89vPq9FwEAwe5tHBiARzde/53Vmf3uxwlAErpIgmHRtx0PvZUlXLt/r+ifOrGAP739D3z13CoePHJwbLEPP4zQ67QhIw+DjbeYk3jryOe+ceqxkuDu+29wYN9F4jsfGwAycsEyKfp+GCEIY3Q7LWw/Suf1IDt+YW0ZvU679gzRmcXs0lksnP0WPRYD3PvXEXuDJyokOgLo9NIpf+ZoXzsCgIzrCVLGNoZ33nv8EAid7U0AK4/s0f/USNGeydMZqD0DEi1QZxYgAQbAzNlVgBlgfwCMcdTi/CxkHD4+ADIObwNYQW8Rv3/2hxAECCA9EmV9Kn8Xad+iNK6srE8EWPm4/E/tAzg608bKXBeL3RYSZkhmJJLL86xvOo8ZICJQ9kyLULxzeOHnkLENAPYBAEjpNNh9iO3jES7c30OLUgNbIj1aRGjlR2HuW4TafXm/37bwg7VjWJnrFsYi82yxrBX/FAflnLETRLCDuHxX9o7jszMY7DzE/BEAwPpBGDAAANsOEAc+OAzARJAESJF6lrI+EUGKFPmEAFB6PR2UXgcBJDJ6EGF5rotXzx5Fmxie5xUAyMzzGhOgeh+QLIt+4EUIwxIAmQEQCIJtO5D97sGWQde21wG8NNgNEY1cSM+FzAzJAagaylQaCAEw5X8pUPmx27bw/VOfQjRyEeRUR26cYiwzWDISllo4pGOARDK8IIKnAGBlALgyxmB3D26/czAAnEGaWHYHMSJ3COm5mXeBRDE0UQBQgWCRGQwFAJEy5DufPY7QHcKXqeGSkRqmxLaEhJTp76wCojCBmTEKInhRAlEFII7gOA6cgQUAFw4OgA1I14b0/DTZKJTO/1g1XDnKbFJMgAWABeG5wz0sWzGGe05GbZTUR2lgDoZEzgQUTClDBRiFMbwoZYCgMu+4oYfI9+EMogMz4AKAn4VeF13nIaRHBgAywwEgS3ppP2WAIEqXK0KaO4iwdrQLx3FSAxVjpAqGQvNaHyo4OQCJAkC6uvQcH743gjNw9wfA5tu/Pt6bW7gsrPZJZLYBwDcVsUhN+pHyA5klZk2Dhfuo0gl7oxCXbo3gxSiZwel5DoAXxvDjNAQE0hAQAHwRwXdHGKbL4OQQsKzWiwBO+oM7CPYegJNykjkYRGTW0crvk8ZWfzeaLyxY3T4OHT6BLy0L/PG6DZnFf8GKjD1ulMCLZaEpcgAOtST80QjOBDVbACCTOEniAKOdDw2Oo2x9Zt3e/IS5GMsTxnIxllMw2FTSxohHu0j8PSwuPY+vr3VxZXMP9+wIoyApvM/MCGIJP05qQiiabSP0Rojb0f53hLYu/5bd7Q8ATmreUgdSae1Yj3PlRm0sm9hhkMatLjrznwZZSqHD/F/J7aVzr5AxCSbhaIOEdUZGcTY/qU2qMFKaKN0wlsuxTAQwg6vGFuzQn8sAksiD93CjKgGbtkPG1xmtHjr9Yx80rgJJ6P0d1Doj5UhhNynASwOltUgoEqEEKx6HAhyVU6Vy4rWxPCapTjC0djVnjLCQRP7VRgCiYPRPyARSyhodi4mzOmnKJq2/UvV+CVJuodRmWjxXvYXUjMK1OZjzKE9GQ0rIyL/VCEAceG+SoJ8yy8JQymdGXDyNSAeDK1QuAGEFpMr8dPBYA0NlgQZINpa5GQxuPgHLBMz+m40AuJ73105LgJgL60yU1D1eN5I1ccBa9VZjhwpo/gBpTo5sBLkydtwOUxyChHhnrES5/JuffNgS4iTVvMV6koO+9nONpmx8jSlRUqXeLdkxZqzywCKpsjoHNoXK5upLrz07VgonUbxltVsnue5EA3VRo69KPFJjmVDQV5GONeDS90nD+ww5BijYqoeKnvuUcLk9sRYIgvhS2xJf0WJd43f5m4o8mTI6U9VZGnjM1VAwgKdsgenX0xOpgqSMNekPcF0S1xkgk/U4SSAEaWt4CYaSG5jTtb2yhsM0FqyBRzWWqM9gsJH+qMS9vrJwk/4oJ3xlMgCJfCcMY3Q7lmIMa+t9ynqqeZxzt3CT/mclWeWmygZ5rQooBU4uc05zguY6eAzEUq7v67vAn3/5473ZXqtfS3hcjUWTTCbD0zPDuVR4zXHNjYUTGZMqTyi+isfaL7zyi2f2tR8QR9ENbovzZYCXoMqGNZgU7zcCkhdJtcKo4tHqdcX1XKvDNKIX4WaQ7Vf2vSESxcl1yfJ8nsSKbFpQnQ1x37ACZJlO1QZUGQtNR3CtYCq9yMb3ac9jBTwFUGa5fwDCKL4SxwksEkWMczUU1AJH8VKpeGl89h8ndLii4JTYM8e9SjFprGOEoPV9A8DMf4uiBNRGReGpqMKoxMpqX137m5bDCqCKdK7lCW05JM0LddleX5JlYv420Kgc//Day3z4UEeZCI1NeGTKvA1vMuXJqpAiZZtNX07rs6ZMUanqszqHcz/6VQ9AsN9N0Y4fRhtzM+0zFT2iswB60UIm/a9R1qT/84GyJq+r4DLI8FueL1jPQaq4C+MNAHPZZiTvB4D+YM/bWuj3zpBRUZH+2aq6FHG9ONEozazXD9WyoZZ1K55VN1VY34Ei5f78HQ92hpsKAM4kAA4BmN/6yN4+feKwnqVNsahkWzZUZeXeIKkpTTNc2yFTszeoXpVWY7haB2ShwMo8Nu8N7gA4DSAB4Jb1phmARQArG1u7d8+eXECv04IQ9b04AhXJSEdepYwuatJ1nTSQuCaoKkJCsYQqcc9giGqaIV0yMzOu/evhXQDLAAYZALtNADwDYB7Acxev3tk6//xSQEJ085jLvSgKz1PxQqG8nRQYBJWWkqDyewqXAyjPH8TZtxZKr2c7vERUaAQS6XuEwn/1Ow3y+4vahv2/vLe1DWAGwGoGwBBAZFoF1gCcyujytLZL2f8XuJd90NKaBeDfALafQsNDAPmOsGjSAX0AxwC0n2IGOAAe5CEwbdM2bdM2bZ/k9h/ps4NzJstwQgAAAABJRU5ErkJggg=="
    }
});
launcher.ui.settings.extend("AppsSync", joli.ui.Widget, {
    initWidget: function () {
        this.title.click(function () {
            this.trigger("showapp", [this.model["package"] || this.model])
        }, this)
    },
    events: {
        install: function () {
            if (this.model.state) {
                if (joli.model.apps.instances) if (joli.model.apps.instances[this.model["package"]]) {
                    joli.model.apps.instances[this.model["package"]].install(false);
                    this.action.hide()
                } else joli.cloud.apps.id(this.model["package"], function () {
                    joli.model.apps.instances[this.model["package"]].install(false);
                    this.action.hide()
                }, this)
            } else if (joli.model.apps.instances) if (joli.model.apps.instances[this.model]) {
                joli.model.apps.instances[this.model].install(false);
                this.action.hide()
            } else joli.cloud.apps.id(this.model, function () {
                joli.model.apps.instances[this.model].install(false);
                this.action.hide()
            }, this)
        }
    },
    onModelChanged: function (a) {
        this.title.text = "";
        this.state.text = "";
        this.state.show();
        this.action.hide();
        console.log("AppsSync onModelChanged", a);
        if (a.state) {
            this.title.text = a.name || a["package"];
            this.state.text = a.state;
            this.action.hide()
        } else if (joli.model.apps.instances) if (joli.model.apps.instances[a]) {
            this.title.text = joli.model.apps.instances[a].name;
            this.state.text = "";
            this.state.hide();
            this.action.show()
        } else joli.cloud.apps.id(a, function () {
            this.title.text = joli.model.apps.instances[a].name;
            this.state.text = "";
            this.state.hide();
            this.action.show()
        }, this);
        else {
            this.title.text = a;
            this.state.text = "preparing";
            this.action.hide()
        }
    }
});
launcher.ui.dashboard.extend("Item", joli.ui.Widget, {
    events: {
        uninstall: function () {
            if (!(joli.ui.root.sync.active && joli.packages_to_install.indexOf(this.model["package"]) != -1)) {
                this.addClass("installing");
                this.addClass("unlaunchable");
                this.addClass("nobar");
                this.model.remove()
            }
        },
        getinformation: function () {
            this.trigger("showapp", [this.model["package"]])
        },
        likeability: function () {
            this.model.liked ? joli.cloud.apps.unlike(this.model["package"], joli.bind(function () {
                this.model.liked = false;
                this.model.likes -= 1;
                joli.clearLocalRegExp(this.model["package"]);
                joli.clearLocalRegExp("apps/favorites?")
            }, this)) : joli.cloud.apps.like(this.model["package"], joli.bind(function () {
                this.model.liked = true;
                this.model.likes += 1;
                joli.clearLocalRegExp(this.model["package"]);
                joli.clearLocalRegExp("apps/favorites?")
            }, this))
        }
    },
    launch: function () {
        joli.cloud.joliserver.connected && joli.cloud.stats.report("launch", "app", this.model["package"]);
        if (!this.model.installing && !this.model.removing && joli.system.websocketserver.connected && this.model.state != "failed" && this.model["package"] != "localapps" && this.model["package"] != "localsettings") {
            if (!joli.packages_to_install || joli.packages_to_install.indexOf(this.model["package"]) == -1) {
                if (joli.cloud.joliserver.connected && this.model.type != "native" || this.model.exec || !joli.cloud.joliserver.connected && this.model.type == "web") if (this.model.exec) {
                    var a = this.model.exec;
                    if (this.model.exec == "/usr/bin/nickel-browser" && joli.live) a += " --incognito";
                    joli.system.apps.launch(a)
                } else this.model.type == "web" && joli.versionCompare("1.1.15", joli.computer.version) ? joli.system.apps.launchWebapp(this.model["package"], this.model.url, window.location.protocol + "//" + window.location.hostname + (this.model.picture || this.model.pictures.large)) : joli.system.apps.launchPackage(this.model["package"]);
                joli.cloud.joliserver.connected && this.model.type == "native" && !this.model.exec && this.trigger("showapp", [this.model["package"]])
            }
        } else if (joli.cloud.joliserver.connected && !joli.system.websocketserver.connected && this.model.type != "native" && this.model["package"] != "localapps" && this.model["package"] != "localsettings" || !joli.cloud.joliserver.connected && this.model.type == "web") window.open(this.model.url);
        else if ((this.model["package"] == "localapps" || this.model["package"] == "localsettings") && joli.system.websocketserver.connected && joli.versionCompare("1.1.11.6", joli.computer.version)) {
            this.model["package"] == "localapps" && joli.ui.root.content.dashboard.showLocalApps();
            this.model["package"] == "localsettings" && !joli.guest && joli.ui.root.content.dashboard.showLocalSettings()
        } else if (!joli.system.websocketserver.connected && (this.model["package"] == "skype" || this.model["package"] == "spotify")) window.location.href = this.model["package"] + "://";
        else!this.model.installing && !this.model.removing && joli.cloud.joliserver.connected && this.model.type == "native" && !this.model.exec && this.trigger("showapp", [this.model["package"]])
    },
    initWidget: function () {
        if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1 || navigator.userAgent.toLowerCase().indexOf("iphone") != -1) this.appli._element.addEventListener("touchend", joli.bind(function () {
            if (this.hoverTouch) {
                window.open(this.model.url);
                this.hoverTouch = false
            } else this.hoverTouch = true
        }, this), false);
        else {
            this.makeDraggable();
            this.appli.click(this.launch, this)
        }
        this.appli.icon.bind("load", this.onIconLoaded.bind(this))
    },
    onIconLoaded: function () {
        if (!this.isIconLoaded && this.model) this.isIconLoaded = true
    },
    onModelChanged: function (a) {
        try {
            this.isIconLoaded = false;
            if (this.model.id == "localapps") {
                this.appli.name.text = _("Local Apps");
                this.appli.icon.src = "data:image/png;base64,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";
                !joli.system.websocketserver.connected || !joli.versionCompare("1.1.11.6", joli.computer.version) ? this.addClass("unlaunchable") : this.removeClass("unlaunchable");
                this.addClass("nobar");
                this.removeClass("installing")
            } else if (this.model.id == "localsettings") {
                this.appli.name.text = _("Local Settings");
                this.appli.icon.src = "data:image/png;base64,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";
                !joli.system.websocketserver.connected || !joli.versionCompare("1.1.11.6", joli.computer.version) || joli.guest ? this.addClass("unlaunchable") : this.removeClass("unlaunchable");
                this.addClass("nobar");
                this.removeClass("installing")
            } else {
                this.appli.name.text = a.name;
                this.appli.icon.src = a.picture || a.pictures.large;
                if (this.model && this.model.type == "native" && !this.model.exec && !joli.cloud.joliserver.connected || !joli.system.websocketserver.connected && this.model && this.model.type == "native" && this.model.exec) this.model["package"] != "skype" && this.model["package"] != "spotify" && this.addClass("unlaunchable");
                else this.removeClass("unlaunchable");
                joli.cloud.joliserver.connected ? this.removeClass("nobar") : this.addClass("nobar");
                this.removeClass("installing");
                if ((this.model.type == "native" || joli.computer && joli.computer.version && this.model.type == "web" && !joli.versionCompare("1.1.15", joli.computer.version)) && (a.installing || a.state && (a.state == "preparing" || a.state == "installing" || a.state == "downloading"))) {
                    this.addClass("installing");
                    this.addClass("unlaunchable");
                    this.addClass("nobar")
                }
                if (a.removing) {
                    this.addClass("installing");
                    this.addClass("unlaunchable");
                    this.addClass("nobar")
                }
                if (joli.packages_to_install && (a.type == "native" || joli.computer && joli.computer.version && this.model.type == "web" && !joli.versionCompare("1.1.15", joli.computer.version)) && joli.packages_to_install.indexOf(a["package"]) != -1 && a.state != "installed" || joli.system.websocketserver.connected && a.state == "failed") this.addClass("unlaunchable");
                if (this.model.url && this.model.type == "web" && (navigator.userAgent.toLowerCase().indexOf("ipad") != -1 || navigator.userAgent.toLowerCase().indexOf("iphone") != -1)) {
                    this.appli._element.href = this.model.url;
                    this.appli._element.target = "_blank"
                } else {
                    this.appli._element.removeAttribute("href");
                    this.appli._element.removeAttribute("target")
                }
                this.editbar.remov.show();
                this.editbar.likeability.show();
                this.editbar.information.show();
                var b = this.editbar.likeability;
                if (this.model.liked) {
                    b.addClass("liked");
                    b.removeClass("notliked")
                } else {
                    b.addClass("notliked");
                    b.removeClass("liked")
                }
                this.model.mandatory ? this.editbar.remov.hide() : this.editbar.remov.show();
                joli.packages_to_install && joli.packages_to_install.indexOf(this.model["package"]);
                this.removeClass("userapp");
                this.model.user_generated && this.addClass("userapp")
            }
        } catch (c) {}
    }
});
launcher.ui.settings.extend("Extra", joli.ui.Widget, {
    initWidget: function () {
        this.appli.click(this.launch, this);
        this.editbar.remov.show();
        this.editbar.likeability.hide();
        this.editbar.information.hide()
    },
    events: {
        uninstall: function () {
            this.model.exec != "/usr/share/applications" && joli.ui.root.content.dashboard.removeLocalApp(this.model.exec)
        }
    },
    launch: function () {
        console.log("launching extra item ", this);
        var a = this.model.exec;
        if (this.model.type && this.model.type == "localsettings") {
            this.model.exec();
            a = "localsettings"
        } else if (this.model.className) joli.system.folders.open(this.model.exec);
        else this.model.exec.indexOf(".desktop") != -1 ? joli.system.apps.launchDesktop(this.model.exec) : joli.system.apps.launch(this.model.exec);
        joli.cloud.joliserver.connected && joli.cloud.stats.report("launch_via_local", "local", a)
    },
    onModelChanged: function () {
        this.editbar.remov.show();
        this.editbar.likeability.hide();
        this.editbar.information.hide()
    }
});
launcher.ui.dashboard.extend("Paginator", joli.ui.Paginator, {
    options: {
        startPage: 0,
        perPage: 14,
        pageRadius: 2
    },
    onOptionsChanged: function (a) {
        this._super(a);
        if (a.method) this.model = function (b, c, d, g) {
            var f = joli.bind(function () {
                if (this.data && this.data[0] !== undefined) {
                    this.parent.noresults.hide();
                    d.call(g, this.data[Math.floor(b / c)])
                } else {
                    if (joli.cloud.joliserver.connected) this.parent.noresults.show();
                    else joli.showOffline = setTimeout(joli.bind(function () {
                        joli.ui.root.offlinebox.title.text = _("You're offline and logged out from Jolicloud");
                        joli.ui.root.offlinebox.show()
                    }), 5E3);
                    d.call(g, [])
                }
            }, this);
            if (this.data) f();
            else {
                var h = this.options.method,
                    i = this.options.method.lastIndexOf("."),
                    j = eval(h.substring(0, i));
                h = h.substring(i + 1);
                j[h](g.methodParams, {
                    success: function (l) {
                        this.setDashboard(l);
                        this.preloadImages();
                        var o = joli.localJson("dirtyDashboard_meta");
                        if (joli.ui.root.content.dashboard.dirtyDashboard === undefined && this.data) joli.ui.root.content.dashboard.dirtyDashboard = joli.localJson("dirtyDashboard");
                        console.log("checking", o, joli.ui.root.content.dashboard.dirtyDashboard, joli.cloud.joliserver.connected);
                        if (o && joli.ui.root.content.dashboard.dirtyDashboard && joli.cloud.joliserver.connected) {
                            console.log("dirty and connected, time to push the dashboard");
                            joli.cloud.user.lastDashboardUpdate(function (n) {
                                console.log("lastDashboardUpdate", n.updated < o.timestamp);
                                if (n.updated < o.timestamp) joli.ui.root.content.dashboard.saveDashboard();
                                else {
                                    joli.ui.root.content.dashboard.dirtyDashboard = false;
                                    console.log("dirtyDashboard", joli.ui.root.content.dashboard.dirtyDashboard);
                                    joli.saveLocal("dirtyDashboard", {}, joli.ui.root.content.dashboard.dirtyDashboard);
                                    this.data = undefined;
                                    this.redisplay()
                                }
                            }, this)
                        }
                        f()
                    },
                    error: function () {
                        f()
                    }
                }, this)
            }
        }
    },
    setDashboard: function (a) {
        this.data = a;
        this.lastPage = a.length - 1;
        joli.ui.root.content.dashboard.checkLocalsIcons()
    },
    preloadImages: function () {
        this.eachApp(function (a) {
            joli.ui(this.target.options.item).setModel(a)
        }, this)
    },
    eachApp: function (a, b) {
        joli.each(this.data, function (c) {
            joli.each(c, a, b)
        }, this)
    },
    createEmptyPage: function () {
        this.data.push([]);
        this.setDashboard(this.data);
        this.displayPaginator(this.page)
    },
    removeEmptyPage: function () {
        joli.each(this.data, function (a, b) {
            if (!a.length) {
                this.data.splice(b, 1);
                this.page -= this.page > b ? 1 : 0
            }
        }, this);
        this.setDashboard(this.data);
        this.displayPaginator(this.page)
    },
    dragStart: function () {
        if (!this.data) return false;
        if (this.data[this.page].length > 1) this.createEmptyPage();
        else this.data.length != this.page + 1 && this.createEmptyPage()
    },
    dragEnd: function () {
        this.removeEmptyPage();
        this.redisplay()
    }
});
launcher.ui.dashboard.extend("Dashboard", joli.ui.Widget, {
    localapps: undefined,
    localIconPathFromDesktop: "http://" + joli.config.systemUri + "/cgi-bin/get_icon.py?desktop=",
    loadlocals: function () {
        this.localIconPathFromDesktop = "http://" + joli.config.systemUri + "/cgi-bin/get_icon.py?desktop=";
        this.localpanels.localapps.buttonpanel.back.click(function () {
            this.cursor = undefined;
            joli.localapps = 0;
            joli.ui.root.content.dashboard.localpanels.localapps.style.opacity = "0";
            setTimeout(joli.bind(function () {
                this.settings.show();
                joli.ui.root.content.dashboard.localpanels.hide();
                joli.ui.root.content.dashboard.localpanels.localapps.style.display = "none"
            }, this), 100)
        }, this);
        this.localpanels.localapps.buttonpanel.add.click(function () {
            joli.addappsbox = true;
            this.localpanels.addappsbox.show()
        }, this);
        this.loadLocalApps();
        this.localpanels.localsettings.buttonpanel.back.click(function () {
            this.cursor = undefined;
            joli.localsettings = 0;
            joli.ui.root.content.dashboard.localpanels.localsettings.style.opacity = "0";
            setTimeout(joli.bind(function () {
                this.settings.show();
                joli.ui.root.content.dashboard.localpanels.hide();
                joli.ui.root.content.dashboard.localpanels.localsettings.style.display = "none"
            }, this), 100)
        }, this);
        this.localpanels.localsettings.gallery.list.clear();
        var a = [{
            name: _("Activity Monitor"),
            exec: "/usr/share/applications/gnome-system-monitor.desktop"
        }, {
            name: _("Input Methods"),
            exec: "/usr/share/applications/ibus-setup.desktop"
        }, {
            name: _("Keyboard"),
            exec: "/usr/share/applications/keyboard.desktop"
        }, {
            name: _("Monitors"),
            exec: "/usr/share/applications/display-properties.desktop"
        }, {
            name: _("Mouse"),
            exec: "/usr/share/applications/gnome-settings-mouse.desktop"
        }, {
            name: _("Network"),
            exec: "/usr/share/applications/nm-connection-editor.desktop"
        }, {
            name: _("Power"),
            exec: "/usr/share/applications/gnome-power-preferences.desktop"
        }, {
            name: _("Proxy"),
            exec: "/usr/share/applications/gnome-network-properties.desktop"
        }, {
            name: _("Sound"),
            exec: "/usr/share/applications/gnome-volume-control.desktop"
        }, {
            name: _("Time and Date"),
            exec: "/usr/share/applications/time.desktop"
        }, {
            name: _("Users"),
            exec: "/usr/share/applications/users.desktop"
        }, {
            name: _("Other Settings"),
            exec: function () {
                joli.system.apps.launchSettings()
            },
            className: "localsettings",
            type: "localsettings"
        }];
        joli.each(a, function (b) {
            var c = this.localpanels.localsettings.gallery.list.addItem();
            c.appli.name.text = b.name;
            if (b.className) c.appli.icon.src = this.images[b.className];
            else {
                c.appli.icon.src = this.localIconPathFromDesktop + b.exec;
                b.icon = c.appli.icon.src
            }
            c.model = b;
            c.addClass("nobar")
        }, this)
    },
    loadLocalAppsFromDaemon: function () {
        this.localIconPathFromDesktop = "http://" + joli.config.systemUri + "/cgi-bin/get_icon.py?desktop=";
        joli.system.apps.localApps(joli.bind(function (a) {
            var b = [];
            joli.each(a, function (d) {
                var g = false;
                d["package"] && this.traverse(function (f) {
                    if (joli.trim(f["package"].toLowerCase()) == joli.trim(d["package"].toLowerCase())) {
                        g = true;
                        return false
                    }
                    if (joli.trim(d["package"].toLowerCase()) == "dropbox" && joli.trim(f["package"].toLowerCase()) == "nautilus-dropbox" || joli.trim(d["package"].toLowerCase()) == "opera" && joli.trim(f["package"].toLowerCase()) == "opera-jolicloud" || joli.trim(d["package"].toLowerCase()) == "firefox-branding" && joli.trim(f["package"].toLowerCase()) == "firefox") {
                        g = true;
                        return false
                    }
                });
                joli.each(this.localapps, function (f) {
                    if (joli.trim(f.exec.toLowerCase()) == joli.trim(d.desktop.toLowerCase())) {
                        g = true;
                        return false
                    }
                }, this);
                g || b.push(d)
            }, this);
            b = b.sort(function (d, g) {
                if (d.name.toLowerCase() < g.name.toLowerCase()) return -1;
                if (d.name.toLowerCase() > g.name.toLowerCase()) return 1;
                return 0
            });
            var c = [];
            joli.each(b, function (d) {
                d.desktop.indexOf("jolicloud-webapp-") == -1 && c.push({
                    text: d.name,
                    value: d.name,
                    icon: this.localIconPathFromDesktop + encodeURIComponent(d.desktop),
                    hiddenvalue: d.desktop
                })
            }, this);
            this.localpanels.addappsbox.description.apps.setDataSource([{
                heading: "",
                value: "",
                items: c
            }])
        }, this))
    },
    loadLocalApps: function () {
        if (this.localapps) {
            this.localpanels.localapps.gallery.list.clear();
            joli.each(this.localapps, function (a) {
                var b = this.localpanels.localapps.gallery.list.addItem();
                b.model = a;
                b.appli.name.text = a.name;
                b.appli.icon.src = a.className ? this.images[a.className] : a.icon ? a.icon : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABUxJREFUeNrsW19PE0EQv5ZSaYsJlVShirHGxCg8AR9An3jiM+hH008in8DwYEh8wqCEQGLoH+w/CrjT7DTDdG5vr7d3h3KbTO5ub3u785uZ38zeQe7m5sa7zy3v3fOWAZABkAGQAZABkAFwj1vBdmAul7t1fXBwcINFlN/R715Q8bW2tuZVq9WPhULhswslTfMVojy41Wp5g8HglnLX19dTivI+FOiXFler1eDwaTQaea5AcA4AeAQsEAHwU47K1dXVVB88A8cjUPhMNUfsIMzMAfl8fgwCHLnMzc1NhF4rRSaCY+fn58eC96Hv9PR0Aoz2hA93zgPQC2DBkgdAP45BC4OSeJ/2gwAIeI33tPVj9YRCFA9AL8AFc5FIFMKA/gZBxJDBe8gZcYNQiGp99AAOApIf9wTKzNTaCAIFIAkQnISApBANA3qP3qdhQL0B++jv4wLBmQdAwxhH69NzGv/cUygQ2DBjYJjFBUI+AgA/isXiVAZAKyP7+2UKOp5mCgyFy8vLscIABK0jXGeHKB7wQy34BcYrrxR5GKASNoQJDRXFZyA4eM+VJ0QKARqznPQkPuCx70eY0DccDsdK0vBBEEBcgeC0DqDK+wFhS5gAABxBSeiDshvCAcYtLy97EH4uQIhUB9AcztMcKkMVoyCYCBNK4YuLC+/k5MQ7Pj72Dg8PvV6vN5Z+vz/mB2gbGxve+vq6t7W1BaDMBELO9rU4j/Gjo6MvakHvOp3OpI+SlbT5MW2SKBDtdttrNpsThbvd7uQcgUAQsC0tLXk7Ozt7u7u77xPbDaIn4ATc2hLp2RAmtFKpNMU34DW00QyxubnpNRqNdEth7jG2pEdDiO4NcB5UHMfj3ADA6urqOAzq9foUsImQICxOIjoOBAfFRJjgzrh9xnoABM/L5fL4N5VK5VZ6TRQANVmTWkSKea48t7ZEmGhxfMbCwoLIE7zC1B7TTLIS3Mf9Oy2GqBK0VsAxUsXoV0mGqTABAHXcT7QQoq7HLU8JkoeAS8JMLQSkSSUgpD4TYUrXNhXmLMo7L4Ul4uN7fBvC5JnDpsLEUEgcAG5lrgx3dZeEKYVQKiHA3Z1bXnJtabwpVfplmyjx7zQEJAKk6YsCFYYwTdaW+CaVEPBbkMQJsxCmFFoSsKkBILk5DQNp4UGEaQJBCiesDZLkgD2cVIppKWbDECYltSDChHMoymBNiXoAd3U/IEzu7oIw/cIs1UJIcmUTAYYlTKkKTJwDeCr0Iz0bjwhLmFLmSDwNUivNgr5LwpylCnQWAtzVwyrvgjBT+TTGy0/K2iaXNhGmDQFKhJlKJei3XTURoI2SQXEvEWaqHGBaSFxASGkw6RDYh0mhAMEPmSY+COKJIEuaCBMLsrOzs2+hDTnrdwHwxna7fQUfMeh7uqC/EOObmqBx/E2Q9BwwArwgXVlZWVTdf5L6LlC24YIgQG0MEESYZB54M1pUMow7BGCSkrQlDgNEUNyH4Qk9R1nr9BseHycAVQ2C75bYBIRrwiRreKbklxIIhU5cADxUAi/r66Z6wER4rgmTAPBcKw6h0FMycv1dAMbXNMIv+TsBXh3ybwZ+4+l7/zC/FzZBFSWvNQC1ODwAHvpAT7LkV4WZ8nVYnrAhTALUopZTDUJLSdeVB8ADHyt5pOQVoM0zgMkjuJWDxtt6C9sEVbRsa+M+dekBDQ3CWyTA4XB4XiwWq6Z8a9MX9lqqEfr9/jmuSx8bmhCXdVaIXAht61NA9Y0G4642cPuvmhA7SsfvLgBYU4cn3r/VBkp+Kh2bkQH4X1v2P0MZABkAGQD3uv0VYAChgy0UHXXGjAAAAABJRU5ErkJggg==";
                a.className == "localapps" && b.addClass("nobar")
            }, this)
        }
    },
    addLocalApp: function () {
        var a = this.localpanels.addappsbox.description.apps.input.val();
        if (a != "") {
            var b = undefined;
            try {
                a = this.localpanels.addappsbox.description.apps.choices.getItem(a);
                b = {
                    icon: a.options.icon,
                    name: a.options.text,
                    exec: a.options.hiddenvalue
                }
            } catch (c) {
                b = {
                    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABUxJREFUeNrsW19PE0EQv5ZSaYsJlVShirHGxCg8AR9An3jiM+hH008in8DwYEh8wqCEQGLoH+w/CrjT7DTDdG5vr7d3h3KbTO5ub3u785uZ38zeQe7m5sa7zy3v3fOWAZABkAGQAZABkAFwj1vBdmAul7t1fXBwcINFlN/R715Q8bW2tuZVq9WPhULhswslTfMVojy41Wp5g8HglnLX19dTivI+FOiXFler1eDwaTQaea5AcA4AeAQsEAHwU47K1dXVVB88A8cjUPhMNUfsIMzMAfl8fgwCHLnMzc1NhF4rRSaCY+fn58eC96Hv9PR0Aoz2hA93zgPQC2DBkgdAP45BC4OSeJ/2gwAIeI33tPVj9YRCFA9AL8AFc5FIFMKA/gZBxJDBe8gZcYNQiGp99AAOApIf9wTKzNTaCAIFIAkQnISApBANA3qP3qdhQL0B++jv4wLBmQdAwxhH69NzGv/cUygQ2DBjYJjFBUI+AgA/isXiVAZAKyP7+2UKOp5mCgyFy8vLscIABK0jXGeHKB7wQy34BcYrrxR5GKASNoQJDRXFZyA4eM+VJ0QKARqznPQkPuCx70eY0DccDsdK0vBBEEBcgeC0DqDK+wFhS5gAABxBSeiDshvCAcYtLy97EH4uQIhUB9AcztMcKkMVoyCYCBNK4YuLC+/k5MQ7Pj72Dg8PvV6vN5Z+vz/mB2gbGxve+vq6t7W1BaDMBELO9rU4j/Gjo6MvakHvOp3OpI+SlbT5MW2SKBDtdttrNpsThbvd7uQcgUAQsC0tLXk7Ozt7u7u77xPbDaIn4ATc2hLp2RAmtFKpNMU34DW00QyxubnpNRqNdEth7jG2pEdDiO4NcB5UHMfj3ADA6urqOAzq9foUsImQICxOIjoOBAfFRJjgzrh9xnoABM/L5fL4N5VK5VZ6TRQANVmTWkSKea48t7ZEmGhxfMbCwoLIE7zC1B7TTLIS3Mf9Oy2GqBK0VsAxUsXoV0mGqTABAHXcT7QQoq7HLU8JkoeAS8JMLQSkSSUgpD4TYUrXNhXmLMo7L4Ul4uN7fBvC5JnDpsLEUEgcAG5lrgx3dZeEKYVQKiHA3Z1bXnJtabwpVfplmyjx7zQEJAKk6YsCFYYwTdaW+CaVEPBbkMQJsxCmFFoSsKkBILk5DQNp4UGEaQJBCiesDZLkgD2cVIppKWbDECYltSDChHMoymBNiXoAd3U/IEzu7oIw/cIs1UJIcmUTAYYlTKkKTJwDeCr0Iz0bjwhLmFLmSDwNUivNgr5LwpylCnQWAtzVwyrvgjBT+TTGy0/K2iaXNhGmDQFKhJlKJei3XTURoI2SQXEvEWaqHGBaSFxASGkw6RDYh0mhAMEPmSY+COKJIEuaCBMLsrOzs2+hDTnrdwHwxna7fQUfMeh7uqC/EOObmqBx/E2Q9BwwArwgXVlZWVTdf5L6LlC24YIgQG0MEESYZB54M1pUMow7BGCSkrQlDgNEUNyH4Qk9R1nr9BseHycAVQ2C75bYBIRrwiRreKbklxIIhU5cADxUAi/r66Z6wER4rgmTAPBcKw6h0FMycv1dAMbXNMIv+TsBXh3ybwZ+4+l7/zC/FzZBFSWvNQC1ODwAHvpAT7LkV4WZ8nVYnrAhTALUopZTDUJLSdeVB8ADHyt5pOQVoM0zgMkjuJWDxtt6C9sEVbRsa+M+dekBDQ3CWyTA4XB4XiwWq6Z8a9MX9lqqEfr9/jmuSx8bmhCXdVaIXAht61NA9Y0G4642cPuvmhA7SsfvLgBYU4cn3r/VBkp+Kh2bkQH4X1v2P0MZABkAGQD3uv0VYAChgy0UHXXGjAAAAABJRU5ErkJggg==",
                    name: a.split("/")[a.split("/").length - 1],
                    exec: a
                }
            }
            b && this.localapps.push(b);
            this.localapps = this.localapps.sort(function (d, g) {
                if (d.name.toLowerCase() == _("More Apps").toLowerCase()) return 1;
                if (g.name.toLowerCase() == _("More Apps").toLowerCase()) return -1;
                if (d.name.toLowerCase() < g.name.toLowerCase()) return -1;
                if (d.name.toLowerCase() > g.name.toLowerCase()) return 1;
                return 0
            });
            joli.system.localstorage.setItem("localapps", JSON.stringify(this.localapps));
            joli.saveLocal("localapps", {}, this.localapps);
            this.loadLocalApps();
            this.localpanels.addappsbox.description.apps.reset();
            this.localpanels.addappsbox.hide();
            joli.addappsbox = false;
            this.loadLocalAppsFromDaemon()
        }
    },
    removeLocalApp: function (a) {
        if (a != "") {
            joli.each(this.localapps, function (b, c) {
                b.exec == a && this.localapps.splice(c, 1)
            }, this);
            this.localapps = this.localapps.sort(function (b, c) {
                if (b.name == _("More Apps")) return 1;
                if (c.name == _("More Apps")) return -1;
                if (b.name.toLowerCase() < c.name.toLowerCase()) return -1;
                if (b.name.toLowerCase() > c.name.toLowerCase()) return 1;
                return 0
            });
            joli.system.localstorage.setItem("localapps", JSON.stringify(this.localapps));
            joli.saveLocal("localapps", {}, this.localapps);
            this.loadLocalApps();
            this.localpanels.addappsbox.description.apps.reset();
            this.localpanels.addappsbox.hide();
            joli.addappsbox = false;
            this.loadLocalAppsFromDaemon()
        }
    },
    showLocalSettings: function () {
        this.cursor = undefined;
        joli.localsettings = 1;
        this.settings.hide();
        this.localpanels.show();
        this.localpanels.localsettings.style.display = "-webkit-box";
        setTimeout(joli.bind(function () {
            this.localpanels.localsettings.style.opacity = "1"
        }, this), 10)
    },
    showLocalApps: function () {
        joli.live && this.localpanels.localapps.buttonpanel.add.hide();
        this.localIconPathFromDesktop = "http://" + joli.config.systemUri + "/cgi-bin/get_icon.py?desktop=";
        this.cursor = undefined;
        joli.localapps = 1;
        joli.system.localstorage.getItem("localapps", function (a) {
            if (a != "") this.localapps = a = JSON.parse(a);
            else this.localapps = [{
                name: _("Calculator"),
                exec: "/usr/share/applications/gcalctool.desktop",
                icon: this.localIconPathFromDesktop + encodeURIComponent("/usr/share/applications/gcalctool.desktop")
            }, {
                name: _("Dictionary"),
                exec: "/usr/share/applications/gnome-dictionary.desktop",
                icon: this.localIconPathFromDesktop + encodeURIComponent("/usr/share/applications/gnome-dictionary.desktop")
            }, {
                name: _("Text Editor"),
                exec: "/usr/share/applications/gedit.desktop",
                icon: this.localIconPathFromDesktop + encodeURIComponent("/usr/share/applications/gedit.desktop")
            }, {
                name: _("Movie Player"),
                exec: "/usr/share/applications/totem.desktop",
                icon: this.localIconPathFromDesktop + encodeURIComponent("/usr/share/applications/totem.desktop")
            }, {
                name: _("Sound Recorder"),
                exec: "/usr/share/applications/gnome-sound-recorder.desktop",
                icon: this.localIconPathFromDesktop + encodeURIComponent("/usr/share/applications/gnome-sound-recorder.desktop")
            }, {
                name: _("Take Screenshot"),
                exec: "/usr/share/applications/gnome-screenshot.desktop",
                icon: this.localIconPathFromDesktop + encodeURIComponent("/usr/share/applications/gnome-screenshot.desktop")
            }, {
                name: _("More Apps"),
                exec: "/usr/share/applications",
                className: "localapps"
            }];
            joli.saveLocal("localapps", {}, this.localapps);
            this.loadLocalApps()
        }, this);
        this.loadLocalAppsFromDaemon();
        this.settings.hide();
        this.localpanels.show();
        this.localpanels.localapps.style.display = "-webkit-box";
        setTimeout(joli.bind(function () {
            this.localpanels.localapps.style.opacity = "1"
        }, this), 10)
    },
    checkLocalsIcons: function () {
        if (this.pager && this.pager.data && joli.computer && joli.computer.version) {
            var a = false,
                b = false;
            joli.each(this.pager.data, function (d) {
                joli.each(d, function (g) {
                    if (g["package"] == "localapps") a = true;
                    if (g["package"] == "localsettings") b = true
                }, this)
            }, this);
            if (!a) {
                console.log("adding local apps");
                var c = joli.model.apps.get("localapps");
                joli.model.apps.updateProperties(c, {
                    "package": "localapps"
                })
            }
            if (!b) {
                console.log("adding local settings");
                c = joli.model.apps.get("localsettings");
                joli.model.apps.updateProperties(c, {
                    "package": "localsettings"
                })
            }
            if (!a || !b) this.saveDashboard()
        }
    },
    initWidget: function () {
        joli.cloud.joliserver.bind_connection_changed(this.connectionChanged.bind(this));
        joli.dashboard = this;
        this.dirtyDashboard = false;
        this.background = joli.localJson("background") || {};
        var a = 0;
        joli.each(this.backgrounds, function (d) {
            var g = document.createElement("div"),
                f = document.createElement("div"),
                h = document.createElement("figure"),
                i = document.createElement("span");
            f.className = "image-div";
            h.className = "inner-div";
            i.className = "inset-light";
            g.id = "background-" + a;
            g.className = "backthumbnail";
            g.setAttribute("data-url", d.url);
            if (this.background.data && d.url == this.background.uri) g.className = "backthumbnail selected";
            else if (this.background == {} && d.url == "") g.className = "backthumbnail selected";
            var j = document.createElement("img");
            j.src = d.data;
            j.onclick = joli.bind(function (l) {
                l = l.target.parentNode.id;
                if (d.url == "") this.removeBackground();
                else if (this.background.uri != d.url) {
                    joli.cloud.backgrounds.getData(d.url, joli.bind(function (o) {
                        if (o.data) {
                            o.options = {};
                            if (this.background.options && this.background.options.stretch) o.options.stretch = this.background.options.stretch;
                            this.setBackground(o)
                        }
                    }, this));
                    joli.each(document.querySelectorAll(".backthumbnail"), function (o) {
                        o.className = "backthumbnail"
                    }, this);
                    if (document.getElementById(l)) document.getElementById(l).className = "backthumbnail selected"
                }
            }, this);
            h.appendChild(i);
            h.appendChild(j);
            f.appendChild(h);
            g.appendChild(f);
            if (d.author) {
                f = document.createElement("p");
                f.className = "background-author";
                f.innerHTML = '<a target="_blank" href="' + d.original + '" title="' + d.author + '">' + d.author + "</a>"
            } else {
                f = document.createElement("p");
                f.className = "background-author";
                f.innerHTML = '<a target="_blank">&nbsp;</a>'
            }
            g.appendChild(f);
            this.settingspanel.content.jolicloud.gallery._element.appendChild(g);
            a += 1
        }, this);
        this.notice.hide();
        this.list = this.stack.content.list;
        this.listoffscreen = this.stack.content.listoffscreen;
        this.pager = this.stack.content.pager;
        this.animationEnd = this.animationEnd.bind(this);
        this.bindMethod("dragend");
        joli.model.apps.bind_newinstance(this.onNewApp.bind(this));
        for (var b in joli.model.apps.instances) this.onNewApp(null, joli.model.apps.instances[b]);
        $(document.documentElement).keyup(joli.bind(function (d) {
            if (joli.ui.root.menu.getItem("dashboard").active && (joli.localapps || joli.localsettings) && !joli.ui.root.search.input.isFocused && !joli.activation && !joli.upgrade && !joli.backgroundsettings && !joli.addappsbox) {
                var g = undefined,
                    f = undefined;
                if (joli.localapps && !joli.addappsbox) {
                    g = this.localpanels.localapps.gallery.list.items;
                    f = this.localpanels.localapps.gallery
                } else if (joli.localsettings) {
                    g = this.localpanels.localsettings.gallery.list.items;
                    f = this.localpanels.localsettings.gallery
                }
                if (!d.ctrlKey && !d.altKey && g && f) if (d.keyCode == 13) {
                    joli.each(g, function (h) {
                        h.removeClass("active")
                    }, this);
                    this.cursor && g[this.cursor - 1] && g[this.cursor - 1].launch()
                } else if (d.keyCode == 37) {
                    joli.each(g, function (h) {
                        h.removeClass("active")
                    }, this);
                    if (this.cursor) {
                        g[this.cursor - 1].removeClass("active");
                        this.cursor -= 1;
                        if (this.cursor <= 0) this.cursor = g.length
                    } else this.cursor = g.length;
                    g[this.cursor - 1].addClass("active");
                    d = g[this.cursor - 1].offset().top - f.list.offset().top;
                    f._element.scrollTop = d - f.height() / 2 + 20
                } else if (d.keyCode == 39) {
                    joli.each(g, function (h) {
                        h.removeClass("active")
                    }, this);
                    if (this.cursor) {
                        g[this.cursor - 1].removeClass("active");
                        this.cursor += 1;
                        if (this.cursor > g.length) this.cursor = 1
                    } else this.cursor = 1;
                    g[this.cursor - 1].addClass("active");
                    d = g[this.cursor - 1].offset().top - f.list.offset().top;
                    f._element.scrollTop = d - f.height() / 2 + 20
                }
            } else if (joli.ui.root.menu.getItem("dashboard").active && !joli.ui.root.search.input.isFocused && !joli.activation && !joli.upgrade && !joli.backgroundsettings && !joli.addappsbox) if (d.ctrlKey) if (d.keyCode == 37) {
                joli.each(this.list.items, function (h) {
                    h.removeClass("active")
                }, this);
                this.cursor && this.list.items[this.cursor - 1] && this.list.items[this.cursor - 1].removeClass("active");
                this.cursor = undefined;
                this.stack.content.pager.events.prevpage()
            } else {
                if (d.keyCode == 39) {
                    joli.each(this.list.items, function (h) {
                        h.removeClass("active")
                    }, this);
                    this.cursor && this.list.items[this.cursor - 1] && this.list.items[this.cursor - 1].removeClass("active");
                    this.cursor = undefined;
                    this.stack.content.pager.events.nextpage()
                }
            } else if (d.altKey == false && !this.isPageTurning) if (d.keyCode == 13) {
                joli.each(this.list.items, function (h) {
                    h.removeClass("active")
                }, this);
                this.cursor && this.list.items[this.cursor - 1] && this.list.items[this.cursor - 1].launch()
            } else if (d.keyCode == 37) {
                joli.each(this.list.items, function (h) {
                    h.removeClass("active")
                }, this);
                if (this.cursor) {
                    this.list.items[this.cursor - 1].removeClass("active");
                    this.cursor -= 1;
                    if (this.cursor <= 0) {
                        this.previouspage = this.stack.content.pager.page;
                        this.cursor = undefined;
                        this.stack.content.pager.display(this.stack.content.pager.page - 1, undefined, joli.bind(function () {
                            if (this.stack.content.pager.page != this.previouspage) {
                                this.cursor = this.stack.content.pager.pageData.length;
                                this.listoffscreen.items[this.cursor - 1].addClass("active")
                            }
                        }, this))
                    } else this.list.items[this.cursor - 1].addClass("active")
                } else {
                    this.cursor = this.stack.content.pager.pageData.length;
                    this.list.items[this.cursor - 1].addClass("active")
                }
            } else if (d.keyCode == 39) {
                joli.each(this.list.items, function (h) {
                    h.removeClass("active")
                }, this);
                if (this.cursor) {
                    this.list.items[this.cursor - 1].removeClass("active");
                    this.cursor += 1;
                    if (this.cursor > this.stack.content.pager.pageData.length) {
                        this.previouspage = this.stack.content.pager.page;
                        this.cursor = undefined;
                        this.stack.content.pager.display(this.stack.content.pager.page + 1, undefined, joli.bind(function () {
                            if (this.stack.content.pager.page != this.previouspage) {
                                this.cursor = 1;
                                this.listoffscreen.items[this.cursor - 1].addClass("active")
                            }
                        }, this))
                    } else this.list.items[this.cursor - 1].addClass("active")
                } else {
                    this.cursor = 1;
                    this.list.items[this.cursor - 1].addClass("active")
                }
            } else if (d.keyCode == 38) {
                joli.each(this.list.items, function (h) {
                    h.removeClass("active")
                }, this);
                if (this.cursor) {
                    f = this.stack.content.pager.options.perPage;
                    if (this.cursor > f / 2 && this.cursor <= f) {
                        this.list.items[this.cursor - 1].removeClass("active");
                        this.cursor -= f / 2;
                        this.list.items[this.cursor - 1].addClass("active")
                    }
                }
            } else if (d.keyCode == 40) {
                joli.each(this.list.items, function (h) {
                    h.removeClass("active")
                }, this);
                if (this.cursor) {
                    f = this.stack.content.pager.options.perPage;
                    if (this.stack.content.pager.pageData.length > f / 2) if (this.cursor > 0 && this.cursor <= f / 2) {
                        this.list.items[this.cursor - 1].removeClass("active");
                        this.cursor += f / 2;
                        if (this.cursor > this.stack.content.pager.pageData.length) this.cursor = this.stack.content.pager.pageData.length;
                        this.list.items[this.cursor - 1].addClass("active")
                    }
                }
            }
        }, this));
        joli.Events.subscribe("resize", joli.bind(function () {
            this.stack.popToBottom()
        }, this));
        joli.backgroundsettings = 0;
        this.settings.click(function () {
            this.stack.popToBottom();
            joli.backgroundsettings = 1;
            this.settingspanel.addClass("visible");
            setTimeout(joli.bind(function () {
                $(this.settingspanel._element.childNodes[1]).addClass("visible")
            }, this), 50)
        }, this);
        this.settingspanel.close.click(function () {
            this.saveBackground();
            $(this.settingspanel._element.childNodes[1]).removeClass("visible");
            setTimeout(joli.bind(function () {
                this.settingspanel.removeClass("visible");
                joli.backgroundsettings = 0
            }, this), 300)
        }, this);
        this.settingspanel.click(function (d, g) {
            if (g.target.className == "settingspanel visible") {
                this.saveBackground();
                $(this.settingspanel._element.childNodes[1]).removeClass("visible");
                setTimeout(joli.bind(function () {
                    this.settingspanel.removeClass("visible");
                    joli.backgroundsettings = 0
                }, this), 300)
            }
        }, this);
        if (typeof FileReader != "undefined") this.settingspanel.content.users.file._element.onchange = joli.bind(function () {
            var d = this.settingspanel.content.users.file._element.files[0];
            if (d && d.size <= 2097152) if (d.type.match("image.*")) {
                var g = this,
                    f = new FileReader;
                f.onload = function () {
                    return function (h) {
                        var i = {
                            stretch: false
                        };
                        if (g.settingspanel.content.config.stretch._element.checked) i.stretch = true;
                        g.setBackground({
                            uri: "local",
                            data: h.target.result,
                            options: i
                        });
                        joli.each(document.querySelectorAll(".backthumbnail"), function (j) {
                            j.className = "backthumbnail"
                        }, this)
                    }
                }(d);
                f.readAsDataURL(d)
            }
        }, this);
        else this.settingspanel.content.users.file.$.parent().parent().parent().hide();
        this.settingspanel.content.users.loadurl.click(function () {
            this.background.uri != this.settingspanel.content.users.url.val() && this.settingspanel.content.users.url.val() != "" && joli.cloud.backgrounds.getData(this.settingspanel.content.users.url.val(), joli.bind(function (d) {
                if (d.data) {
                    this.setBackground(d);
                    joli.each(document.querySelectorAll(".backthumbnail"), function (g) {
                        g.className = "backthumbnail"
                    }, this)
                }
            }, this))
        }, this);
        this.settingspanel.content.config.stretch._element.onchange = joli.bind(function () {
            if (!this.background.options) this.background.options = {};
            this.background.options.stretch = this.settingspanel.content.config.stretch._element.checked ? true : false;
            this.setBackground(this.background)
        }, this);
        if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
            this.stack.content._element.addEventListener("touchstart", joli.bind(function (d) {
                this.touchStart(d)
            }, this), false);
            this.stack.content._element.addEventListener("touchend", joli.bind(function (d) {
                this.touchEnd(d)
            }, this), false);
            this.stack.content._element.addEventListener("touchmove", joli.bind(function (d) {
                this.touchMove(d)
            }, this), false);
            this.stack.content._element.addEventListener("touchcancel", joli.bind(function (d) {
                this.touchCancel(d)
            }, this), false);
            this.startTouchY = this.contentOffsetY = 0;
            this.startMoveTime = new Date;
            this.endTouchY = 0;
            this.endMoveTime = new Date;
            var c = this.settingspanel.content.jolicloud.gallery;
            this.settingspanel.content.jolicloud._element.addEventListener("touchstart", joli.bind(function (d) {
                this.startTouchY = d.touches[0].pageY;
                this.startMoveTime = new Date;
                this.contentStartOffsetY = this.contentOffsetY
            }, this), false);
            this.settingspanel.content.jolicloud._element.addEventListener("touchmove", joli.bind(function (d) {
                d.preventDefault();
                this.endTouchY = d = d.touches[0].clientY;
                this.endMoveTime = new Date;
                this.animateTo(c, d - this.startTouchY + this.contentStartOffsetY)
            }, this), false);
            this.settingspanel.content.jolicloud._element.addEventListener("touchend", joli.bind(function () {
                this.outOfBounds(c, 110) && this.snapToBounds(c, 110)
            }, this), false);
            this.displayNotice(_("You're using Jolicloud on an iPad. Please keep in mind that this is still an experiment!"))
        }
    },
    onAttached: function () {
        this.background.data && this.setBackground(this.background);
        this.settingspanel.tabs.activate("jolicloud")
    },
    prepareToShow: function (a) {
        this.loadlocals();
        a()
    },
    saveBackground: function () {
        if (this.background) {
            var a = "none";
            if (this.background.uri) a = this.background.uri;
            if (!this.background.options) this.background.options = {};
            console.log("saving to the web background ", this.background.uri, this.background.options.stretch);
            joli.saveLocal("background", {}, this.background);
            joli.cloud.user.setBackground(a, this.background.options)
        }
    },
    setBackground: function (a) {
        if (a.data == "" && a.uri == "local" || a.data) {
            if (a.data == "" && a.uri == "local") {
                document.getElementById("backgroundImg") && joli.ui.root.background._element.removeChild(document.getElementById("backgroundImg"));
                this.settingspanel.content.config.stretch._element.checked = a.options && a.options.stretch ? true : false
            } else {
                if (document.getElementById("backgroundImg")) document.getElementById("backgroundImg").src = a.data;
                else {
                    var b = joli.ui.root.background._element,
                        c = document.createElement("img");
                    c.id = "backgroundImg";
                    c.src = a.data;
                    c.style.width = "100%";
                    b.appendChild(c)
                }
                if (a.options && a.options.stretch) {
                    document.getElementById("backgroundImg").style.height = "100%";
                    this.settingspanel.content.config.stretch._element.checked = true
                } else {
                    document.getElementById("backgroundImg").style.height = "";
                    this.settingspanel.content.config.stretch._element.checked = false
                }
            }
            this.background = a;
            joli.each(document.querySelectorAll(".backthumbnail"), function (d) {
                d.className = d.getAttribute("data-url") == a.uri ? "backthumbnail selected" : "backthumbnail"
            }, this)
        }
    },
    removeBackground: function () {
        document.getElementById("backgroundImg") && joli.ui.root.background._element.removeChild(document.getElementById("backgroundImg"));
        this.background = {};
        joli.saveLocal("background", {}, this.background);
        this.settingspanel.content.config.stretch._element.checked = false;
        joli.each(document.querySelectorAll(".backthumbnail"), function (a) {
            a.className = a.getAttribute("data-url") == "" ? "backthumbnail selected" : "backthumbnail"
        }, this)
    },
    onNewApp: function (a, b) {
        b.bind_change(this.onAppChanged.bind(this))
    },
    onAppChanged: function (a) {
        var b = a.target;
        if (this.pager.data) {
            var c = false;
            if (b.added || b["package"] == "localapps" || b["package"] == "localsettings") {
                var d = false,
                    g = false;
                this.traverse(function (f) {
                    if (f["package"] === b["package"]) {
                        g = true;
                        return false
                    }
                });
                if (g) return;
                joli.each(this.pager.data, function (f) {
                    if (f.length < this.itemsPerPage) {
                        f.push(b);
                        c = d = true;
                        return false
                    }
                }, this);
                if (!d) {
                    this.pager.data.push([b]);
                    c = true
                }
            } else this.traverse(function (f, h, i) {
                if (f["package"] === b["package"]) {
                    i.splice(h, 1);
                    c = true
                }
            });
            if (c) {
                this.pager.removeEmptyPage();
                this.pager.redisplay();
                this.saveDashboard()
            }
        }
    },
    connectionChanged: function (a, b) {
        if (this.dirtyDashboard === undefined && this.pager && this.pager.data) {
            this.dirtyDashboard = joli.localJson("dirtyDashboard");
            console.log("get dirty", this.dirtyDashboard)
        }
        if (b && this.dirtyDashboard) {
            var c = joli.localJson("dirtyDashboard_meta");
            console.log("checking", c, this.dirtyDashboard, joli.cloud.joliserver.connected);
            if (c) {
                console.log("dirty and connected, time to push the dashboard");
                joli.cloud.user.lastDashboardUpdate(function (d) {
                    console.log("lastDashboardUpdate", d.updated < c.timestamp);
                    if (d.updated < c.timestamp) this.saveDashboard();
                    else {
                        this.dirtyDashboard = false;
                        console.log("dirtyDashboard", this.dirtyDashboard);
                        joli.saveLocal("dirtyDashboard", {}, this.dirtyDashboard);
                        this.pager.data = undefined;
                        this.pager.redisplay()
                    }
                }, this)
            }
        }
        if (b) {
            this.checkLocalsIcons();
            this.settings.show();
            joli.cloud.user.getBackground(joli.bind(function (d) {
                try {
                    d.options = JSON.parse(d.options)
                } catch (g) {
                    d.options = {}
                }
                console.log(d);
                console.log(this.background);
                if (this.background.uri != d.uri && d.uri != "" && d.uri != "local") joli.cloud.backgrounds.getData(d.uri, joli.bind(function (f) {
                    if (f.data) {
                        f.options = d.options;
                        this.setBackground(f);
                        joli.saveLocal("background", {}, f)
                    }
                }, this));
                else if (this.background.uri != d.uri && d.uri == "") this.removeBackground();
                else if (this.background.uri == d.uri && d.uri != "local") {
                    this.background.options = d.options;
                    this.setBackground(this.background);
                    joli.saveLocal("background", {}, this.background)
                } else if (this.background.uri != d.uri && d.uri == "local") {
                    d.data = "";
                    console.log("setting pseudo local background");
                    this.setBackground(d)
                }
            }, this))
        } else {
            $(this.settingspanel._element.childNodes[1]).removeClass("visible");
            setTimeout(joli.bind(function () {
                this.settingspanel.removeClass("visible");
                joli.backgroundsettings = 0
            }, this), 300);
            this.settings.hide()
        }
    },
    installEnded: function () {
        this.pager.removeEmptyPage();
        this.pager.redisplay();
        this.saveDashboard()
    },
    onAddRemove: function (a) {
        if (this.pager.data) {
            if (a.item.added) {
                var b = false,
                    c = false;
                this.traverse(function (d) {
                    if (d["package"] === a.item["package"]) {
                        c = true;
                        return false
                    }
                });
                if (c) return;
                joli.each(this.pager.data, function (d) {
                    if (d.length < this.itemsPerPage) {
                        d.push(a.item);
                        b = true;
                        return false
                    }
                }, this);
                b || this.pager.data.push([a.item])
            } else this.traverse(function (d, g, f) {
                d["package"] === a.item["package"] && f.splice(g, 1)
            });
            this.pager.removeEmptyPage();
            this.pager.redisplay();
            this.saveDashboard()
        }
    },
    displayNotice: function (a) {
        if (a) {
            this.notice.message.innerHTML = a;
            this.notice.$.removeClass("hiding");
            this.notice.$.addClass("showing");
            this.notice.$.show()
        } else this.notice.$.addClass("hiding").removeClass("showing")
    },
    getSearchResults: function (a) {
        a = function (d) {
            if (!arguments.callee.sRE) arguments.callee.sRE = RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\)", "g");
            return d.replace(arguments.callee.sRE, "\\$1")
        }(a.toLowerCase()).split(" ");
        var b = [];
        joli.each(a, function (d) {
            b.push(RegExp("^" + d))
        });
        var c = [];
        this.traverse(function (d) {
            var g = [];
            if (d["package"] != "localapps" && d["package"] != "localsettings") g = d.name.toLowerCase().split(" ");
            var f = true;
            joli.each(b, function (h) {
                var i = false;
                joli.each(g, function (j) {
                    if (h.test(j)) i = true
                });
                if (!i) return f = false
            });
            if (f && !(d.type == "native" && !d.exec) && (joli.system.websocketserver.connected || !joli.system.websocketserver.connected && d.type != "native")) if (!(joli.packages_to_install && joli.packages_to_install.indexOf(d["package"]) != -1 && d.state != "installed" || joli.system.websocketserver.connected && d.state == "failed") && !(!joli.cloud.joliserver.connected && d.type == "web" && !this.model.offline)) c.push({
                text: d.name,
                icon: d.picture || d.pictures.large,
                action: function () {
                    joli.cloud.joliserver.connected && joli.cloud.stats.report("launch_via_search", "app", d["package"]);
                    if (joli.system.websocketserver.connected) if (d.exec) joli.system.apps.launch(d.exec);
                    else d.type == "web" && joli.versionCompare("1.1.15", joli.computer.version) ? joli.system.apps.launchWebapp(d["package"], d.url, window.location.protocol + "//" + window.location.hostname + (d.picture || d.pictures.large)) : joli.system.apps.launchPackage(d["package"]);
                    else window.open(d.url)
                },
                value: d["package"]
            })
        });
        this.localapps && joli.each(this.localapps, function (d) {
            if (d.name != _("More Apps")) {
                var g = [];
                g = d.name.toLowerCase().split(" ");
                var f = true;
                joli.each(b, function (i) {
                    var j = false;
                    joli.each(g, function (l) {
                        if (i.test(l)) j = true
                    });
                    if (!j) return f = false
                });
                if (f && joli.system.websocketserver.connected) {
                    var h = undefined;
                    h = d.className ? {
                        text: d.name,
                        icon: this.images[d.className],
                        action: function () {
                            joli.system.websocketserver.connected && joli.system.folders.open(d.exec)
                        },
                        value: d.exec
                    } : d.icon ? {
                        text: d.name,
                        icon: d.icon,
                        action: function () {
                            joli.system.websocketserver.connected && joli.system.apps.launchDesktop(d.exec)
                        },
                        value: d.exec
                    } : {
                        text: d.name,
                        icon: "",
                        action: function () {
                            joli.system.websocketserver.connected && joli.system.apps.launch(d.exec)
                        },
                        value: d.exec
                    };
                    c.push(h)
                }
            }
        }, this);
        return c
    },
    traverse: function (a) {
        joli.each(this.pager.data, function (b, c) {
            return joli.each(b, function (d, g) {
                return a.call(this, d, g, b, c)
            }, this)
        }, this)
    },
    saveDashboard: function () {
        this.pager.dragEnd();
        this.dirtyDashboard = true;
        joli.saveLocal("dirtyDashboard", {}, this.dirtyDashboard);
        var a = [];
        this.checkLocalsIcons();
        joli.each(this.pager.data, function (b) {
            var c = [];
            joli.each(b, function (d) {
                d = d.properties;
                delete d.state;
                delete d.progress;
                delete d.installing;
                delete d.removing;
                c.push(d)
            }, this);
            c.length > 0 && a.push(c)
        }, this);
        joli.saveLocal(joli.cloud.user.getDashboard.url, {}, JSON.stringify(a));
        joli.cloud.user.setDashboard(a, joli.bind(function () {
            this.dirtyDashboard = false;
            joli.saveLocal("dirtyDashboard", {}, this.dirtyDashboard);
            console.log("dirtyDashboard", this.dirtyDashboard)
        }, this))
    },
    itemsPerPage: 14,
    isPageTurning: false,
    pageTurnZone: 100,
    events: {
        addappsbox: function (a, b) {
            ({
                cancel: function () {
                    this.localpanels.addappsbox.hide();
                    joli.addappsbox = false
                },
                add: function () {
                    this.addLocalApp()
                }
            })[b].call(this, a);
            a.preventDefault()
        },
        dashboard_draganddrop: function (a) {
            var b = this.pager.data,
                c = b[a.fromPage],
                d = c[a.fromIndex];
            c.splice(a.fromIndex, 1);
            c = b[a.toPage];
            c.splice(a.toIndex, 0, d);
            for (var g = a.toPage; c.length > this.pager.options.perPage;) {
                (d = b[++g]) || b.push(d = []);
                d.unshift(c.pop());
                c = d
            }
            console.log("dashboard_draganddrop", a);
            this.saveDashboard()
        },
        prePageTurn: function (a) {
            if (a.target === this.pager) if (this.isPageTurning) a.preventDefault();
            else {
                this.isPageTurning = true;
                console.log("pageturn start");
                this.cursor = undefined;
                this.pager.target = this.listoffscreen;
                this.pageTurnEvent = a;
                this.animationStart()
            }
        },
        dragstart: function (a) {
            a.preventDefault();
            if (!joli.backgroundsettings) {
                this.cursor && this.list.items[this.cursor - 1].removeClass("active");
                this.cursor = undefined;
                if (!this.isDragging) if (this.pager.dragStart() !== false) {
                    this.dragDist = this.list.items[1].model ? this.list.items[1].position().left - this.list.items[0].position().left : this.list.items[0].width();
                    var b = this.getItemUnderMouse(a);
                    if (b) {
                        this.dragIndex = joli.indexOf(this.list.items, b);
                        console.log("dragIndex: " + this.dragIndex);
                        this.dragPage = this.pager.page;
                        this.dragModel = b.model;
                        console.log("dragstart");
                        this.dragItem = b;
                        this.isDragging = true;
                        b.addClass("isdragging");
                        b.removeClass("active");
                        b = joli.createElement("img", {
                            src: b.appli.icon.$.attr("src"),
                            "class": "dragproxy"
                        });
                        this.dragProxy = jQuery(b);
                        this._element.appendChild(b);
                        this.dragProxyOffset = {
                            x: -this.dragProxy.width() / 2,
                            y: -this.dragProxy.height() / 2
                        };
                        this.updateDragProxy(a)
                    } else console.log("ERROR No drag item under mouse")
                }
            }
        },
        mousemove: function (a) {
            if (this.isDragging) {
                if (!a) {
                    a = this.lastMouseMove;
                    console.log("mousemove recoup event")
                }
                this.lastMouseMove = a;
                this.updateDragProxy(a);
                if (!this.isPageTurning) {
                    var b = this.getPoint(a);
                    a = this.getItemUnderMouse(a);
                    if (a != this.dragoverItem) {
                        if (this.dragoverItem && this.dragItem !== this.dragoverItem) {
                            this.dragoverItem.removeClass("isdragover");
                            this.dragoverItem.addClass("isdragover2");
                            this.dragoverItem.css({
                                left: "",
                                "border-left": "",
                                "border-right": ""
                            })
                        }
                        if ((this.dragoverItem = a) && this.dragItem !== this.dragoverItem) {
                            var c = joli.indexOf(this.list.items, this.dragoverItem);
                            c = this.dragPage === this.pager.page && this.dragIndex < c ? 1 : -1;
                            this.dragoverItem.addClass("isdragover");
                            var d = c > 0 ? "right" : "left";
                            this.dragoverItem.css("left", -c * 20 + "px");
                            this.dragoverItem.css("border-" + d, "2px solid transparent");
                            joli.data(this.dragoverItem, "origin", this.dragoverItem.offset())
                        }
                    }
                    if (!a) {
                        joli.bind(function (f) {
                            if (f.options.value === this.dragPage) return false;
                            return this.pager.data[f.options.value].length === this.pager.options.perPage
                        }, this);
                        var g = false;
                        joli.each(this.pager.items, function (f) {
                            var h = f.offset();
                            if (b.x >= h.left && b.x < h.left + f.width() && b.y >= h.top && b.y < h.top + f.height()) {
                                g = true;
                                if (f != this.pagerItem) {
                                    this.pagerItem = f;
                                    f.addClass("hover")
                                }
                            } else f.removeClass("hover")
                        }, this);
                        if (!g && this.pagerItem) {
                            this.pagerItem = null;
                            clearTimeout(this.pagerItemTimeout);
                            this.pagerItemTimeout = null
                        }
                        if (g && !this.pagerItemTimeout) this.pagerItemTimeout = setTimeout(joli.bind(function () {
                            this.pagerItemTimeout = null;
                            if (this.pagerItem.options.value !== this.pager.page) {
                                this.pager.display(this.pagerItem.options.value);
                                this.pagerItem = null
                            }
                        }, this), 1E3)
                    }
                    if (b.x < this.pageTurnZone || b.x > window.innerWidth - this.pageTurnZone) {
                        if (!this.pageTurnZoneTimeout) this.pageTurnZoneTimeout = setTimeout(joli.bind(function () {
                            this.dragturn = true;
                            if (!(b.x < this.pageTurnZone ? this.pager.events.prevpage.call(this.pager) : this.pager.events.nextpage.call(this.pager))) {
                                this.pageTurnZoneTimeout = undefined;
                                this.dragturn = false
                            }
                        }, this), 1E3)
                    } else if (this.pageTurnZoneTimeout) {
                        clearTimeout(this.pageTurnZoneTimeout);
                        this.pageTurnZoneTimeout = null
                    }
                }
            }
        },
        mouseup: function (a) {
            if (this.isDragging) if (this.isPageTurning) this.dropWaiting = true;
            else {
                this.isDragging = false;
                this.pagerItem ? this.dropOnPage(this.pagerItem.options.value) : this.drop(a)
            }
        },
        showuser: function (a, b) {
            this.stack.pushChild({
                type: "user",
                username: b
            })
        },
        showapp: function (a, b) {
            this.stack.pushChild({
                type: "app",
                "package": b
            })
        }
    },
    animationStart: function () {
        var a = this.pageTurnEvent,
            b = a.from < a.to ? 1 : -1;
        this.listoffscreen.$.show();
        var c = this.list.position();
        this.listoffscreen.$.css({
            "-webkit-transform": "translate3d(" + b * this.list.$.width() + "px, 0, 0)",
            "-moz-transform": "translate(" + b * this.list.$.width() + "px, 0)",
            top: c.top + "px",
            width: this.list.$.width() + "px"
        });
        if (joli.browser().browser.toLowerCase() == "firefox") {
            console.log("pos top", c.top);
            this.listoffscreen.$.css({
                top: c.top + 49 + "px"
            })
        }
        this.listoffscreen.$.css("-webkit-transition-duration");
        c = this.dragturn;
        this.dragturn = false;
        var d = this.list.$.position().left;
        if (c) {
            this.list.show();
            this.listoffscreen.show();
            this.list.addClass("listslide");
            this.listoffscreen.addClass("listslide");
            this.listoffscreen.$.css("-webkit-transition-duration");
            this.list.$.css("-webkit-transform", "translate3d(" + -b * this.list.$.width() + "px, 0, 0)");
            this.listoffscreen.$.css("-webkit-transform", "translate3d(" + d + "px, 0, 0)");
            this.list.$.css("-moz-transform", "translate(" + -b * this.list.$.width() + "px, 0)")
        } else {
            this.list.addClass("listfadeout");
            this.listoffscreen.addClass("listfadein");
            this.listoffscreen.$.css("-webkit-transform", "translate3d(" + d + "px, 0, 0)")
        }
        this.listoffscreen.$.css("-moz-transform", "translate(" + d + "px, 0)");
        if (this.isDragging && this.dragPage === a.to) {
            this.dragItem = this.listoffscreen.items[this.dragIndex];
            console.log("adding class isdragging");
            this.dragItem.addClass("isdragging")
        }
        this.list.$.find("li").removeClass("isdragover isdragover2");
        this.animatedItem = c ? this.list : this.list.items[0].model ? this.list.items[0] : this.listoffscreen.items[0];
        window.setTimeout(this.animationEnd, 500)
    },
    animationEnd: function () {
        var a = this.pageTurnEvent;
        console.log("animationEnd");
        this.animatedItem.unbind("webkitTransitionEnd");
        this.animatedItem.unbind("webkitAnimationEnd");
        this.animatedItem.unbind("transitionend");
        this.animatedItem = null;
        this.pageIsFull = true;
        if (!this.isDragging || this.dragPage === a.to) this.pageIsFull = false;
        else {
            joli.each(this.listoffscreen.items, function (c) {
                if (!c.model) return this.pageIsFull = false
            }, this);
            this.isDragging && this.pageIsFull && console.log("PAGE IS FULL")
        }
        this.list.$.hide();
        this.list.$.unbind("webkitTransitionEnd");
        this.list.$.unbind("transitionend");
        this.listoffscreen.removeClass("listoffscreen listslide listfadein");
        this.listoffscreen.addClass("list");
        this.list.removeClass("list listslide listfadeout");
        this.list.addClass("listoffscreen");
        var b = {
            top: "",
            width: "",
            left: "",
            "-webkit-transform": "",
            "-moz-transform": ""
        };
        this.listoffscreen.$.css(b);
        this.list.$.css(b);
        joli.assert(this.list !== this.listoffscreen, "Big problems");
        if (this.isDragging && a.from === this.dragPage) {
            this.dragItem.removeClass("isdragging");
            this.dragItem = null
        }
        a = this.listoffscreen;
        this.listoffscreen = this.list;
        this.list = a;
        this.pagerItemTimeout = this.pageTurnZoneTimeout = undefined;
        this.isPageTurning = false;
        console.log("pageturn finish");
        this.events.mousemove.call(this);
        if (this.dropWaiting) {
            this.isDragging = false;
            this.drop()
        }
    },
    dragend: function () {
        console.log("dragend");
        this.dragItem && this.dragItem.removeClass("isdragging");
        this.dragProxy && this._element.removeChild(this.dragProxy[0]);
        if (this.dragoverItem) {
            this.dragoverItem.removeClass("isdragover");
            this.dragoverItem.css({
                left: "",
                "border-left": "",
                "border-right": ""
            })
        }
        joli.each(this.list.items, function (a) {
            a.removeClass("isdragover2")
        });
        this.dragoverItem = this.dragProxy = this.dragItem = null;
        if (this.pageTurnZoneTimeout) {
            clearTimeout(this.pageTurnZoneTimeout);
            this.pageTurnZoneTimeout = null
        }
        this.pagerItem = null;
        this.pager.dragEnd()
    },
    dropOnPage: function (a) {
        clearInterval(this.pagerItemTimeout);
        this.pagerItemTimeout = null;
        if (a === this.pager.page) this.drop();
        else {
            this.dragProxy.addClass("dragproxydrop-dot");
            window.setTimeout(joli.bind(function () {
                var d = this.pager.data[a].length;
                if (d >= this.pager.options.perPage) d = 0;
                d = {
                    type: "dashboard_draganddrop",
                    fromPage: this.dragPage,
                    fromIndex: this.dragIndex,
                    toPage: a,
                    toIndex: d
                };
                this.trigger(d);
                this.dragend(d)
            }, this), 800);
            if (this.pager.page === this.dragPage) {
                this.dragItem.setModel(null);
                this.dragItem.addClass("joli-paginator-hidden");
                var b = this.dragIndex,
                    c = this.pager.data[this.dragPage].length - 1;
                b !== c && this.animateItemShift(b, c)
            }
        }
    },
    drop: function (a) {
        this.dropWaiting = false;
        var b, c = this.dragPage !== this.pager.page;
        if (c) joli.each(this.list.items, function (i, j) {
            if (!i.model) {
                this.dragItem = i;
                i.setModel(this.dragModel);
                i.addClass("isdragging");
                i.removeClass("joli-paginator-hidden");
                b = j;
                return false
            }
        }, this);
        else b = this.dragIndex;
        this.dragoverItem && this.dragoverItem.removeClass("isdragover isdragover2");
        var d = this.dragoverItem;
        if (!d) {
            if (!this.lastMouseMove) this.lastMouseMove = a;
            if (this.dragItem && this.getItemUnderMouse(this.lastMouseMove, true)) {
                console.log("We are somewhat in the right area. Put it at the end.");
                this.dragoverItem = this.dragItem;
                d = true
            }
        }
        var g = false;
        if (!d && this.pagerItem) {
            a = this.pager.data[this.pagerItem.options.value].length % this.pager.options.perPage;
            console.log("to::::::: " + a);
            d = true
        } else {
            a = d ? joli.indexOf(this.list.items, this.dragoverItem) : undefined;
            var f = this.getPoint(this.lastMouseMove),
                h = -1;
            joli.each(this.list.items, function (i, j) {
                if (this.isUnderPoint(i, f, j, true)) {
                    h = j;
                    return false
                }
            }, this);
            if (joli.indexOf(this.list.items, this.dragoverItem) != h && d === true) {
                console.log("Setting the item at the end of page.");
                a = this.pager.data[this.pager.page].length;
                if (this.dragPage == this.pager.page) a -= 1;
                g = true
            }
        }
        if (!d || b === a || !this.animateItemShift(b, a, this.dragend)) {
            jQuery(this.dragProxy).bind("webkitTransitionEnd", this.dragend);
            jQuery(this.dragProxy).bind("transitionend", this.dragend)
        }
        this.dragProxy.addClass("dragproxydrop");
        if (this.dragItem && (!c || d)) {
            console.log("animating proxy...");
            c = this.dragItem.appli.icon.offset();
            if (d === true && g === true) {
                console.log("Move to the last position.");
                c = this.list.items[a].appli.icon.offset()
            }
            this.dragProxy.css({
                left: c.left + "px",
                top: c.top + "px"
            })
        } else this.dragProxy.css("opacity", "0");
        if (d) {
            a = {
                type: "dashboard_draganddrop",
                fromPage: this.dragPage,
                fromIndex: this.dragIndex,
                toPage: this.pager.page,
                toIndex: a
            };
            if (a.fromPage != a.toPage || a.fromIndex != a.toIndex) this.trigger(a)
        }
    },
    animateItemShift: function (a, b, c) {
        var d = a === undefined;
        if (d) {
            this.dragItem = this.list.addItem();
            this.dragItem.addClass("isdragging");
            this.dragItem.setModel(this.dragModel);
            a = this.pager.options.perPage - 1
        }
        var g = a < b ? 1 : -1,
            f = this.list.items;
        if (b < f.length - 1) {
            var h = f[b + (g > 0 ? 1 : 0)];
            this.list.removeItem(this.dragItem);
            this.list.insertItem(this.dragItem, h);
            d && this.list.removeItem(joli.last(this.list.items))
        } else {
            this.list.removeItem(this.dragItem);
            this.list.addItem(this.dragItem)
        }
        if (a === b) return false;
        var i = g > 0 ? 0 : 1,
            j, l = a < b ? a : b,
            o = a < b ? b : a;
        for (a = l + i; a < o + i; ++a) {
            j = j || this.list.items[a];
            f[a].removeClass("isdragover2").css("left", g * this.dragDist);
            f[a].css("-webkit-transition-duration");
            f[a].addClass("lemming").css("left", "")
        }
        j.bind("webkitTransitionEnd", joli.bind(function (n) {
            console.log("ref.bind('webkitTransitionEnd'", n);
            if (n.originalEvent.propertyName === "left") {
                j.unbind("webkitTransitionEnd");
                j.unbind("transitionend");
                for (n = l + i; n < o + i; ++n) f[n].removeClass("lemming").css("left", "");
                (c || joli.doNothing)()
            }
        }, this));
        joli.browser().browser.toLowerCase() == "firefox" && setTimeout(joli.bind(function () {
            console.log("setimeout end");
            for (var n = l + i; n < o + i; ++n) f[n].removeClass("lemming").css("left", "");
            (c || joli.doNothing)()
        }, this), 200);
        return true
    },
    dragItem: null,
    dragIndex: -1,
    dragoverItem: null,
    dragProxy: null,
    isDragging: false,
    dragProxyOffset: null,
    updateDragProxy: function (a) {
        this.dragProxy.css({
            left: a.clientX + this.dragProxyOffset.x + "px",
            top: a.clientY + this.dragProxyOffset.y + "px"
        })
    },
    isItem: function (a) {
        for (; a; a = a.parent) if (a instanceof launcher.ui.dashboard.Item) return a;
        return false
    },
    getPoint: function (a) {
        return {
            x: a.clientX,
            y: a.clientY
        }
    },
    getItemUnderMouse: function (a, b) {
        var c, d = this.getPoint(a);
        joli.each(this.list.items, function (g, f) {
            if (this.isUnderPoint(g, d, f, b)) {
                c = g;
                return false
            }
        }, this);
        return c
    },
    isUnderPoint: function (a, b, c, d) {
        if (!a.model && !d) return false;
        d = a.offset();
        if (a.hasClass("isdragover") || a.hasClass("isdragover2")) d = joli.data(a, "origin") || d;
        if (this.isDragging) d = {
            left: d.left + (this.dragPage === this.pager.page && this.dragIndex < c ? 1 : -1) * this.dragDist / 2,
            top: d.top
        };
        return b.x >= d.left && b.x < d.left + this.dragDist && b.y >= d.top - 20 && b.y < d.top + a.height()
    },
    fingerCount: 0,
    startX: 0,
    startY: 0,
    curX: 0,
    curY: 0,
    deltaX: 0,
    deltaY: 0,
    horzDiff: 0,
    vertDiff: 0,
    minLength: 72,
    swipeLength: 0,
    swipeAngle: null,
    swipeDirection: null,
    touchStart: function (a) {
        console.log("touchStart");
        this.fingerCount = a.touches.length;
        if (this.fingerCount == 1) {
            this.startX = a.touches[0].pageX;
            this.startY = a.touches[0].pageY
        } else {
            a.preventDefault();
            this.touchCancel(a)
        }
    },
    touchMove: function (a) {
        console.log("touchMove");
        a.preventDefault();
        if (a.touches.length == 1) {
            this.curX = a.touches[0].pageX;
            this.curY = a.touches[0].pageY;
            this.stack.content.list._element.scrollTop += (this.curY - this.startY) * -1 / 2;
            this.stack.content.listoffscreen._element.scrollTop += (this.curY - this.startY) * -1 / 2
        } else this.touchCancel(a)
    },
    touchEnd: function (a) {
        console.log("touchEnd");
        if (this.fingerCount == 1 && this.curX != 0) {
            this.swipeLength = Math.round(Math.sqrt(Math.pow(this.curX - this.startX, 2) + Math.pow(this.curY - this.startY, 2)));
            if (this.swipeLength >= this.minLength) {
                a.preventDefault();
                this.caluculateAngle();
                this.determineSwipeDirection();
                this.processingRoutine()
            }
        } else a.preventDefault();
        this.touchCancel(a)
    },
    touchCancel: function () {
        console.log("touchCancel");
        this.swipeLength = this.vertDiff = this.horzDiff = this.deltaY = this.deltaX = this.curY = this.curX = this.startY = this.startX = this.fingerCount = 0;
        this.swipeDirection = this.swipeAngle = null
    },
    caluculateAngle: function () {
        this.swipeAngle = Math.round(Math.atan2(this.curY - this.startY, this.startX - this.curX) * 180 / Math.PI);
        if (this.swipeAngle < 0) this.swipeAngle = 360 - Math.abs(this.swipeAngle)
    },
    determineSwipeDirection: function () {
        this.swipeDirection = this.swipeAngle <= 45 && this.swipeAngle >= 0 ? "left" : this.swipeAngle <= 360 && this.swipeAngle >= 315 ? "left" : this.swipeAngle >= 135 && this.swipeAngle <= 225 ? "right" : this.swipeAngle > 45 && this.swipeAngle < 135 ? "down" : "up"
    },
    processingRoutine: function () {
        if (this.swipeDirection == "left") {
            this.dragturn = true;
            this.stack.content.list._element.scrollTop = 0;
            this.stack.content.listoffscreen._element.scrollTop = 0;
            this.stack.content.pager.events.nextpage()
        } else if (this.swipeDirection == "right") {
            this.dragturn = true;
            this.stack.content.list._element.scrollTop = 0;
            this.stack.content.listoffscreen._element.scrollTop = 0;
            this.stack.content.pager.events.prevpage()
        }
    },
    outOfBounds: function (a, b) {
        if (this.contentOffsetY * -1 < 0) return true;
        if (this.contentOffsetY * -1 > a._element.scrollHeight - b) return true;
        return false
    },
    snapToBounds: function (a, b) {
        var c = false;
        if (this.contentOffsetY * -1 < 0) {
            this.contentOffsetY = 0;
            c = true
        }
        if (this.contentOffsetY * -1 > a._element.scrollHeight - b) {
            this.contentOffsetY = (a._element.scrollHeight - b) * -1;
            c = true
        }
        if (c) {
            this.animateTo(a, this.contentOffsetY);
            a._element.style.webkitTransition = "-webkit-transform 0.2s ease-out";
            a._element.style.webkitTransform = "translate3d(0, " + this.contentOffsetY + "px, 0)"
        }
    },
    animateTo: function (a, b) {
        this.contentOffsetY = b;
        a._element.style.webkitTransition = "";
        a._element.style.webkitTransform = "translate3d(0, " + b + "px, 0)"
    },
    images: {
        localsettings: "data:image/png;base64,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",
        localapps: "data:image/png;base64,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"
    },
    backgrounds: [{
        author: "",
        original: "",
        url: "",
        data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAMAAAAPkIrYAAAABlBMVEU2OUZeYWulrmHlAAAAmUlEQVR42u3XMQ6AMAwEQfL/T1NuidAUae662KuVQCQxz7Isy7+c42z9b1koE4HOhDkVxLIQlgWwrDbLarKsFstqsKwyyyqyrBLLKrCsJctauMxVGVyVI5XLUrkslQZU4OJn9Hfv34SrUOZ7yPe2nzl+FvoZ7Sq/hljmd63PAD6b+MzEKh8LfVx1KMqxGAMjQAb/VsuyLPfyAubPAQ1YiFy5AAAAAElFTkSuQmCC"
    }, {
        author: "",
        original: "",
        data: "http://farm6.static.flickr.com/5166/5237256027_f7da2cf1c4_s.jpg",
        url: "http://farm6.static.flickr.com/5166/5237256027_d6f49d863b_o.jpg"
    }, {
        author: "Patrick Smith",
        original: "http://www.flickr.com/photos/patrick-smith-photography/3372340759/",
        data: "http://farm4.static.flickr.com/3591/3372340759_9a2ee24072_s.jpg",
        url: "http://farm4.static.flickr.com/3591/3372340759_feee4a75e9_o.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/1378841612/",
        data: "http://farm2.static.flickr.com/1409/1378841612_7ec4bd62d9_s.jpg",
        url: "http://farm2.static.flickr.com/1409/1378841612_7ec4bd62d9_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/3064180284/",
        data: "http://farm4.static.flickr.com/3181/3064180284_c6dc48a9f5_s.jpg",
        url: "http://farm4.static.flickr.com/3181/3064180284_c6dc48a9f5_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/3102303628/",
        data: "http://farm4.static.flickr.com/3108/3102303628_f5c2eda0c4_s.jpg",
        url: "http://farm4.static.flickr.com/3108/3102303628_f5c2eda0c4_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/2658844631/",
        data: "http://farm4.static.flickr.com/3142/2658844631_012361894f_s.jpg",
        url: "http://farm4.static.flickr.com/3142/2658844631_012361894f_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/1432428633/",
        data: "http://farm2.static.flickr.com/1331/1432428633_7834f73cc6_s.jpg",
        url: "http://farm2.static.flickr.com/1331/1432428633_7834f73cc6_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/2751024173/",
        data: "http://farm4.static.flickr.com/3175/2751024173_d5b345bafd_s.jpg",
        url: "http://farm4.static.flickr.com/3175/2751024173_d5b345bafd_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/1240576741/",
        data: "http://farm2.static.flickr.com/1133/1240576741_2e91f5e88f_s.jpg",
        url: "http://farm2.static.flickr.com/1133/1240576741_2e91f5e88f_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/698027551/",
        data: "http://farm2.static.flickr.com/1048/698027551_f1f76f59fb_s.jpg",
        url: "http://farm2.static.flickr.com/1048/698027551_f1f76f59fb_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/3174151460/",
        data: "http://farm4.static.flickr.com/3116/3174151460_67cf8d2097_s.jpg",
        url: "http://farm4.static.flickr.com/3116/3174151460_67cf8d2097_b.jpg"
    }, {
        author: "Joi Ito",
        original: "http://www.flickr.com/photos/joi/3133013224/",
        data: "http://farm4.static.flickr.com/3214/3133013224_21a1d5785b_s.jpg",
        url: "http://farm4.static.flickr.com/3214/3133013224_21a1d5785b_b.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4694475502/",
        data: "http://farm5.static.flickr.com/4007/4694475502_1f1b4f2f54_s.jpg",
        url: "http://farm5.static.flickr.com/4007/4694475502_254ab68236_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4670313582/",
        data: "http://farm5.static.flickr.com/4048/4670313582_dabae2ccff_s.jpg",
        url: "http://farm5.static.flickr.com/4048/4670313582_dc0221840b_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4561757684/",
        data: "http://farm4.static.flickr.com/3321/4561757684_34af243a46_s.jpg",
        url: "http://farm4.static.flickr.com/3321/4561757684_f0c5fc1b50_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4562090077/",
        data: "http://farm4.static.flickr.com/3466/4562090077_5bdbc61fe8_s.jpg",
        url: "http://farm4.static.flickr.com/3466/4562090077_10e9fd097c_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4542116070/",
        data: "http://farm5.static.flickr.com/4069/4542116070_654640eef5_s.jpg",
        url: "http://farm5.static.flickr.com/4069/4542116070_759e68b770_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4542114830/",
        data: "http://farm5.static.flickr.com/4048/4542114830_c5c700657c_s.jpg",
        url: "http://farm5.static.flickr.com/4048/4542114830_08fb372831_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4481053488/",
        data: "http://farm5.static.flickr.com/4012/4481053488_a83f6038d0_s.jpg",
        url: "http://farm5.static.flickr.com/4012/4481053488_d44db3a457_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4380504303/",
        data: "http://farm5.static.flickr.com/4023/4380504303_f92b8148db_s.jpg",
        url: "http://farm5.static.flickr.com/4023/4380504303_59c8fd711f_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4280485954/",
        data: "http://farm5.static.flickr.com/4005/4280485954_7e717b647d_s.jpg",
        url: "http://farm5.static.flickr.com/4005/4280485954_c36450f5ef_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4279770427/",
        data: "http://farm5.static.flickr.com/4015/4279770427_3573ededc6_s.jpg",
        url: "http://farm5.static.flickr.com/4015/4279770427_01cc81ee67_o.jpg"
    }, {
        author: "Martin Varsavsky",
        original: "http://www.flickr.com/photos/martinvars/4893479188/",
        data: "http://farm5.static.flickr.com/4100/4893479188_d23df7fa16_s.jpg",
        url: "http://farm5.static.flickr.com/4100/4893479188_26b15daaae_o.jpg"
    }, {
        author: "David Sifry",
        original: "http://www.flickr.com/photos/dsifry/3167932520/",
        data: "http://farm2.static.flickr.com/1164/3167932520_86be86f51a_s.jpg",
        url: "http://farm2.static.flickr.com/1164/3167932520_86be86f51a_b.jpg"
    }, {
        author: "David Sifry",
        original: "http://www.flickr.com/photos/dsifry/2042474189/",
        data: "http://farm3.static.flickr.com/2362/2042474189_f4bb2bd9fe_s.jpg",
        url: "http://farm3.static.flickr.com/2362/2042474189_f4bb2bd9fe_b.jpg"
    }, {
        author: "David Sifry",
        original: "http://www.flickr.com/photos/dsifry/487513917/",
        data: "http://farm1.static.flickr.com/194/487513917_23fb12dbc2_s.jpg",
        url: "http://farm1.static.flickr.com/194/487513917_23fb12dbc2_b.jpg"
    }, {
        author: "David Sifry",
        original: "http://www.flickr.com/photos/dsifry/487516295/",
        data: "http://farm1.static.flickr.com/173/487516295_67a68848b3_s.jpg",
        url: "http://farm1.static.flickr.com/173/487516295_67a68848b3_b.jpg"
    }, {
        author: "David Sifry",
        original: "http://www.flickr.com/photos/dsifry/469411280/",
        data: "http://farm1.static.flickr.com/177/469411280_cf99248ccf_s.jpg",
        url: "http://farm1.static.flickr.com/177/469411280_cf99248ccf_b.jpg"
    }, {
        author: "David Sifry",
        original: "http://www.flickr.com/photos/dsifry/435407411/",
        data: "http://farm1.static.flickr.com/179/435407411_58f1d29cd5_s.jpg",
        url: "http://farm1.static.flickr.com/179/435407411_58f1d29cd5_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/5126577039/",
        data: "http://farm5.static.flickr.com/4041/5126577039_08b862f7ff_s.jpg",
        url: "http://farm5.static.flickr.com/4041/5126577039_08b862f7ff_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4863745599/",
        data: "http://farm5.static.flickr.com/4093/4863745599_c3424176e8_s.jpg",
        url: "http://farm5.static.flickr.com/4093/4863745599_c3424176e8_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4762166108/",
        data: "http://farm5.static.flickr.com/4134/4762166108_407fbdf9d6_s.jpg",
        url: "http://farm5.static.flickr.com/4134/4762166108_407fbdf9d6_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4718468953/",
        data: "http://farm5.static.flickr.com/4062/4718468953_ecd5c63328_s.jpg",
        url: "http://farm5.static.flickr.com/4062/4718468953_ecd5c63328_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4314928062/",
        data: "http://farm3.static.flickr.com/2803/4314928062_daf846d3e0_s.jpg",
        url: "http://farm3.static.flickr.com/2803/4314928062_daf846d3e0_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4278750783/",
        data: "http://farm3.static.flickr.com/2784/4278750783_470b4c2c6e_s.jpg",
        url: "http://farm3.static.flickr.com/2784/4278750783_470b4c2c6e_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4278741835/",
        data: "http://farm5.static.flickr.com/4014/4278741835_fed515123a_s.jpg",
        url: "http://farm5.static.flickr.com/4014/4278741835_fed515123a_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4269855463/",
        data: "http://farm5.static.flickr.com/4008/4269855463_f8695f9711_s.jpg",
        url: "http://farm5.static.flickr.com/4008/4269855463_f8695f9711_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4270499308/",
        data: "http://farm3.static.flickr.com/2762/4270499308_469b8c918e_s.jpg",
        url: "http://farm3.static.flickr.com/2762/4270499308_469b8c918e_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/4080427280/",
        data: "http://farm4.static.flickr.com/3495/4080427280_b16289c305_s.jpg",
        url: "http://farm4.static.flickr.com/3495/4080427280_b16289c305_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/3393241228/",
        data: "http://farm4.static.flickr.com/3459/3393241228_2f8ce0c1fc_s.jpg",
        url: "http://farm4.static.flickr.com/3459/3393241228_2f8ce0c1fc_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/3267453733/",
        data: "http://farm4.static.flickr.com/3392/3267453733_715e2c0d41_s.jpg",
        url: "http://farm4.static.flickr.com/3392/3267453733_715e2c0d41_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/2916772266/",
        data: "http://farm4.static.flickr.com/3292/2916772266_e14b076b7c_s.jpg",
        url: "http://farm4.static.flickr.com/3292/2916772266_e14b076b7c_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/2815587546/",
        data: "http://farm4.static.flickr.com/3156/2815587546_9fc6ae51bf_s.jpg",
        url: "http://farm4.static.flickr.com/3156/2815587546_9fc6ae51bf_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/2814797458/",
        data: "http://farm4.static.flickr.com/3049/2814797458_b797471e11_s.jpg",
        url: "http://farm4.static.flickr.com/3049/2814797458_b797471e11_b.jpg"
    }, {
        author: "Rodrigo Sep\u00falveda Schulz",
        original: "http://www.flickr.com/photos/rsepulveda/2686063414/",
        data: "http://farm4.static.flickr.com/3119/2686063414_8a0fbd7697_s.jpg",
        url: "http://farm4.static.flickr.com/3119/2686063414_8a0fbd7697_b.jpg"
    }, {
        author: "iPad Wallpapers",
        original: "http://www.ipad-wallpapers.us/blackboard-ipad-background/",
        data: "http://farm6.static.flickr.com/5140/5468027674_c2dcc72bc6_s.jpg",
        url: "http://farm6.static.flickr.com/5140/5468027674_dc882269f2_o.jpg"
    }, {
        author: "Halfthelaw",
        original: "http://halfthelaw.deviantart.com/art/Dark-Brushed-Metal-23583522",
        data: "http://farm6.static.flickr.com/5251/5467723503_7e93225743_s.jpg",
        url: "http://farm6.static.flickr.com/5251/5467723503_8420f84cb4_o.jpg"
    }, {
        author: "Ebin",
        original: "http://ebin.wordpress.com/2007/03/11/free-carbon-fiber-wallpaper/",
        data: "http://farm6.static.flickr.com/5299/5468028260_0eb082127f_s.jpg",
        url: "http://farm6.static.flickr.com/5299/5468028260_429097322e_o.png"
    }, {
        author: "Ebin",
        original: "http://ebin.wordpress.com/2007/03/11/free-carbon-fiber-wallpaper/",
        data: "http://farm6.static.flickr.com/5299/5468028374_190230abe3_s.jpg",
        url: "http://farm6.static.flickr.com/5299/5468028374_b9da654278_o.png"
    }, {
        author: "Wood",
        original: "http://www.flickr.com/photos/jolicloud/5467431429/",
        data: "http://farm6.static.flickr.com/5175/5467431429_e63dd6b50d_s.jpg",
        url: "http://farm6.static.flickr.com/5175/5467431429_ce92de47d2_o.jpg"
    }, {
        author: "Jaqx-Textures",
        original: "http://jaqx-textures.deviantart.com/art/Fabric-linen-50772818",
        data: "http://farm6.static.flickr.com/5017/5468028940_eccf95eb47_s.jpg",
        url: "http://farm6.static.flickr.com/5017/5468028940_dd4100fec4_o.jpg"
    }]
});
launcher.ui.directory.extend("Directory", joli.ui.Widget, {
    categories: [],
    initWidget: function () {
        joli.Events.subscribe("resize", joli.bind(function () {
            joli.ui.root.add.active && this.resizeList()
        }, this))
    },
    resizeList: function () {
        console.log("resize list", this.stack.content.pager.pageData);
        if (this.stack.content.pager.pageData) {
            var a = joli.ui.root.content.current.outerHeight() - 20 - 35 - 50;
            a = parseInt(a / 70, 10) * 2;
            if (this.stack.content.pager.options.perPage != a && a > 0) {
                this.stack.content.pager.pageData = undefined;
                this.stack.content.pager.page = 0;
                this.stack.content.pager.options.perPage = a;
                this.stack.content.pager.redisplay();
                this.stack.popToBottom()
            }
        }
    },
    prepareToShow: function (a) {
        var b = joli.bind(function () {
            a();
            this.resizeList()
        }, this);
        if (this.hasShown) b();
        else {
            this.hasShown = true;
            this.addwebappbox.hide();
            var c = this;
            document.addEventListener("keydown", function (h) {
                if (h.keyCode === 27) {
                    h.preventDefault();
                    c.trigger("addownappbox", ["cancel"])
                }
            }, false);
            joli.getPlatform() != "jolicloud" && this.sidebar.getItem("os").hide();
            var d = this.sidebar.getItem("web");
            joli.cloud.apps.categories(function (h) {
                d.addItem({
                    text: _("All Apps"),
                    value: "all",
                    bubble: 0
                });
                h.sort(function (o, n) {
                    function r(p) {
                        p = p.replace(/[\u00e0\u00e2\u00e4]/gi, "a");
                        p = p.replace(/[\u00e9\u00e8\u00ea\u00eb]/gi, "e");
                        p = p.replace(/[\u00ee\u00ef]/gi, "i");
                        p = p.replace(/[\u00f4\u00f6]/gi, "o");
                        return p = p.replace(/[\u00f9\u00fb\u00fc]/gi, "u")
                    }
                    var m = r(_(o.name).toLowerCase()),
                        q = r(_(n.name).toLowerCase());
                    if (m < q) return -1;
                    if (m > q) return 1;
                    return 0
                });
                for (var i = 0; i < h.length; i++) {
                    var j = h[i];
                    if (j.label != "add-ons" && j.label != "browsers") {
                        var l = {
                            text: _(j.name),
                            value: j.label,
                            bubble: 0
                        };
                        d.addItem(l).addClass("category");
                        this.categories.push(j)
                    }
                }
            }, this);
            var g = joli.ui.root.content.current.outerHeight() - 20 - 35 - 50;
            g = parseInt(g / 70, 10) * 2;
            if (this.stack.content.pager.options.perPage != g && g > 0) {
                this.stack.content.pager.pageData = undefined;
                this.stack.content.pager.page = 0;
                this.stack.content.pager.options.perPage = g
            }
            this.stack.content.sortfriends.hide();
            this.sidebar.activate("selection|featured", true);
            joli.computer && joli.computer.oem && this.stack.content.sort.addItem({
                text: _("Top UK Apps"),
                value: "oemvye"
            });
            if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
                this.startTouchY = this.contentOffsetY = 0;
                this.startMoveTime = new Date;
                this.endTouchY = 0;
                this.endMoveTime = new Date;
                var f = this.sidebar.getItem("web").container;
                this.sidebar.getItem("web")._element.addEventListener("touchstart", joli.bind(function (h) {
                    this.startTouchY = h.touches[0].pageY;
                    this.startMoveTime = new Date;
                    this.contentStartOffsetY = this.contentOffsetY
                }, this), false);
                this.sidebar.getItem("web")._element.addEventListener("touchmove", joli.bind(function (h) {
                    h.preventDefault();
                    this.endTouchY = h = h.touches[0].clientY;
                    this.endMoveTime = new Date;
                    this.animateTo(f, h - this.startTouchY + this.contentStartOffsetY)
                }, this), false);
                this.sidebar.getItem("web")._element.addEventListener("touchend", joli.bind(function () {
                    this.outOfBounds(f, this.sidebar.getItem("web").container.height()) && this.snapToBounds(f, this.sidebar.getItem("web").container.height())
                }, this), false)
            }
            this.stack.content.sort.activate("popularity", true);
            this.stack.content.sortfriends.activate("all", true);
            this.stack.content.pager.setMethodParams({
                featured: true,
                sort: "popularity",
                category: undefined,
                friends: undefined
            }, true, b)
        }
    },
    switchSort: function (a) {
        if (a == "picks") {
            this.stack.content.sort.hide();
            this.stack.content.sortfriends.show()
        } else {
            if (a == "featured" && this.stack.content.sort.itemsByValue.oemvye) this.stack.content.sort.getItem("oemvye").show();
            else if (this.stack.content.sort.itemsByValue.oemvye) {
                this.stack.content.sort.getItem("oemvye").hide();
                if (this.stack.content.sort.value == "oemvye") {
                    this.stack.content.pager.setMethodParams({
                        sort: "popularity"
                    }, false);
                    this.stack.content.sort.activate("popularity", true)
                }
            }
            this.stack.content.sort.show();
            this.stack.content.sortfriends.hide()
        }
    },
    events: {
        addownappbox: function (a, b) {
            ({
                cancel: function () {
                    this.addwebappbox.hide()
                }
            })[b].call(this, a);
            a.preventDefault()
        },
        cancel: function () {
            this.addwebappbox.hide()
        },
        back: function () {
            this.addwebappbox.content.swap.step1.docontinue.label.text = _("Continue");
            this.addwebappbox.content.swap.step1.docontinue.removeClass("disabled");
            this.addwebappbox.content.swap.step3.finish.label.text = _("Finish");
            this.addwebappbox.content.swap.step3.finish.removeClass("disabled");
            this.addwebappbox.content.swap.step3.description.appdesc.val("");
            this.addwebappbox.content.swap.step2.description.name.text = "";
            this.addwebappbox.content.swap.step2.description.url.text = "";
            this.addwebappbox.content.swap.step3.description.name.text = "";
            this.addwebappbox.content.swap.step3.description.url.text = "";
            this.addwebappbox.content.swap.step3.description.help.hide();
            this.addwebappbox.content.swap.step3.description.help.text = "";
            this.addwebappbox.content.swap.step3.description.categories._element.options.length = 0;
            this.addwebappbox.content.swap.step3.description.categories._element.options.add(new Option(_("Select a category"), ""));
            for (var a = 0; a < this.categories.length; a++) {
                var b = this.categories[a];
                this.addwebappbox.content.swap.step3.description.categories._element.options.add(new Option(_(b.name), b.label))
            }
            this.addwebappbox.content.swap.step3.description.iconuploader._element.innerHTML = this.addwebappbox.content.swap.step3.description.iconuploader._element.innerHTML;
            this.addwebappbox.content.swap.showChild("step1")
        },
        docontinue: function () {
            if (this.addwebappbox.content.swap.step1.description.name.val() != "" && this.addwebappbox.content.swap.step1.description.url.val() != "http://" && this.addwebappbox.content.swap.step1.description.url.val() != "") {
                this.addwebappbox.content.swap.step1.docontinue.label.text = _("Searching");
                this.addwebappbox.content.swap.step1.docontinue.addClass("disabled");
                joli.cloud.apps.searchwebapps(this.addwebappbox.content.swap.step1.description.name.val(), "web", "addwebapp", this.addwebappbox.content.swap.step1.description.url.val(), function (a) {
                    if (a.length > 0) {
                        this.addwebappbox.content.swap.step2.description.list.clear();
                        joli.each(a, function (b) {
                            this.addwebappbox.content.swap.step2.description.list.addItem().setModel(b)
                        }, this);
                        this.addwebappbox.content.swap.step2.description.name.text = this.addwebappbox.content.swap.step1.description.name.val();
                        this.addwebappbox.content.swap.step2.description.url.text = this.addwebappbox.content.swap.step1.description.url.val();
                        this.addwebappbox.content.swap.step3.description.name.text = this.addwebappbox.content.swap.step1.description.name.val();
                        this.addwebappbox.content.swap.step3.description.url.text = this.addwebappbox.content.swap.step1.description.url.val();
                        this.addwebappbox.content.swap.showChild("step2")
                    } else {
                        this.addwebappbox.content.swap.step3.description.name.text = this.addwebappbox.content.swap.step1.description.name.val();
                        this.addwebappbox.content.swap.step3.description.url.text = this.addwebappbox.content.swap.step1.description.url.val();
                        this.addwebappbox.content.swap.showChild("step3")
                    }
                }, this)
            }
        },
        nocontinue: function () {
            this.addwebappbox.content.swap.showChild("step3")
        },
        finish: function () {
            this.addwebappbox.content.swap.step3.description.help.hide();
            this.addwebappbox.content.swap.step3.description.help.text = "";
            var a = this.addwebappbox.content.swap.step1.description.name.val(),
                b = this.addwebappbox.content.swap.step1.description.url.val(),
                c = this.addwebappbox.content.swap.step3.description.appdesc.val(),
                d = this.addwebappbox.content.swap.step3.description.categories._element.options[this.addwebappbox.content.swap.step3.description.categories._element.selectedIndex].value;
            if (d == "" || c == "") {
                this.addwebappbox.content.swap.step3.description.help.text = _("Please fill the fields.");
                this.addwebappbox.content.swap.step3.description.help.show()
            } else {
                var g = this.addwebappbox.content.swap.step3.description.iconuploader._element.childNodes[1].files[0];
                if (g) if (g.size <= 614400) {
                    var f = g.type;
                    console.log(f);
                    if (f == "image/png" || f == "image/jpeg") {
                        var h = this,
                            i = new FileReader;
                        i.onload = function () {
                            return function (j) {
                                j = j.target.result;
                                h.addwebappbox.content.swap.step3.finish.label.text = _("Creating");
                                h.addwebappbox.content.swap.step3.finish.addClass("disabled");
                                joli.cloud.apps.addwebapp(a, b, c, d, j, f, {
                                    success: function (l) {
                                        l.install(false);
                                        h.addwebappbox.content.swap.step4.description.list.clear();
                                        h.addwebappbox.content.swap.step4.description.list.addItem().setModel(l);
                                        h.addwebappbox.content.swap.showChild("step4")
                                    },
                                    error: function (l, o, n, r) {
                                        h.addwebappbox.content.swap.step3.finish.label.text = _("Finish");
                                        h.addwebappbox.content.swap.step3.finish.removeClass("disabled");
                                        r = JSON.parse(o.responseText);
                                        h.addwebappbox.content.swap.step3.description.help.text = r.error.code == "FIELDS_EMPTY" ? _("Please fill the fields.") : r.error.code == "INVALID_URL" ? _("Your URL is invalid.") : _("An error occured, please retry.");
                                        h.addwebappbox.content.swap.step3.description.help.show()
                                    }
                                })
                            }
                        }(g);
                        i.readAsDataURL(g)
                    } else {
                        this.addwebappbox.content.swap.step3.description.help.text = _("Please select a PNG or JPG image.");
                        this.addwebappbox.content.swap.step3.description.help.show()
                    }
                } else {
                    this.addwebappbox.content.swap.step3.description.help.text = _("Please select an image less than 600kb.");
                    this.addwebappbox.content.swap.step3.description.help.show()
                } else {
                    this.addwebappbox.content.swap.step3.finish.label.text = _("Creating");
                    this.addwebappbox.content.swap.step3.finish.addClass("disabled");
                    joli.cloud.apps.addwebapp(a, b, c, d, "", "", {
                        success: function (j) {
                            j.install(false);
                            this.addwebappbox.content.swap.step4.description.list.clear();
                            this.addwebappbox.content.swap.step4.description.list.addItem().setModel(j);
                            this.addwebappbox.content.swap.showChild("step4")
                        },
                        error: function (j, l, o, n) {
                            this.addwebappbox.content.swap.step3.finish.label.text = _("Finish");
                            this.addwebappbox.content.swap.step3.finish.removeClass("disabled");
                            n = JSON.parse(l.responseText);
                            this.addwebappbox.content.swap.step3.description.help.text = n.error.code == "FIELDS_EMPTY" ? _("Please fill the fields.") : n.error.code == "INVALID_URL" ? _("Your URL is invalid.") : _("An error occured, please retry.");
                            this.addwebappbox.content.swap.step3.description.help.show()
                        }
                    }, this)
                }
            }
        },
        close: function () {
            this.addwebappbox.hide()
        },
        addownapp: function () {
            this.addwebappbox.content.swap.step1.docontinue.label.text = _("Continue");
            this.addwebappbox.content.swap.step1.docontinue.removeClass("disabled");
            this.addwebappbox.content.swap.step3.finish.label.text = _("Finish");
            this.addwebappbox.content.swap.step3.finish.removeClass("disabled");
            this.addwebappbox.content.swap.step3.description.iconuploader.show();
            this.addwebappbox.content.swap.step3.description.iconexample.show();
            if (navigator.userAgent.toLowerCase().indexOf("safari") != -1 && navigator.userAgent.toLowerCase().indexOf("chrome") == -1) {
                this.addwebappbox.content.swap.step3.description.iconuploader.hide();
                this.addwebappbox.content.swap.step3.description.iconexample.hide()
            }
            this.addwebappbox.content.swap.step1.description.name.val("");
            this.addwebappbox.content.swap.step1.description.url.val("http://");
            this.addwebappbox.content.swap.step3.description.appdesc.val("");
            this.addwebappbox.content.swap.step2.description.name.text = "";
            this.addwebappbox.content.swap.step2.description.url.text = "";
            this.addwebappbox.content.swap.step3.description.name.text = "";
            this.addwebappbox.content.swap.step3.description.url.text = "";
            this.addwebappbox.content.swap.step3.description.help.hide();
            this.addwebappbox.content.swap.step3.description.help.text = "";
            this.addwebappbox.content.swap.step3.description.categories._element.options.length = 0;
            this.addwebappbox.content.swap.step3.description.categories._element.options.add(new Option(_("Select a category"), ""));
            for (var a = 0; a < this.categories.length; a++) {
                var b = this.categories[a];
                this.addwebappbox.content.swap.step3.description.categories._element.options.add(new Option(_(b.name), b.label))
            }
            this.addwebappbox.content.swap.step3.description.iconuploader._element.innerHTML = this.addwebappbox.content.swap.step3.description.iconuploader._element.innerHTML;
            this.addwebappbox.content.swap.showChild("step1");
            this.addwebappbox.content.style.opacity = 1;
            this.addwebappbox.show()
        },
        categories: function (a, b) {
            var c = b.split("|")[1],
                d = {
                    sort: this.stack.content[c == "friends" ? "sortfriends" : "sort"].value,
                    featured: undefined,
                    type: undefined,
                    category: undefined,
                    friends: undefined
                };
            if (c == "featured") d.featured = true;
            else {
                if (this.stack.content.sort.value == "oemvye") d.sort = "popularity";
                if (c == "picks") d.friends = true;
                else if (c == "native-apps") d.type = "native";
                else if (c == "add-ons") {
                    d.type = "native";
                    d.category = "add-ons"
                } else if (c == "all") d.type = "web";
                else {
                    d.type = "web";
                    d.category = c
                }
            }
            this.stack.content.pager.setMethodParams(d, true, joli.bind(function () {
                this.switchSort(c);
                this.sidebar.activate(b, true);
                this.stack.popToBottom()
            }, this));
            a.preventDefault()
        },
        sort: function (a, b) {
            this.stack.content.pager.setMethodParams({
                sort: b
            }, true, joli.bind(function () {
                this.sidebar.value == "selection|picks" ? this.stack.content.sortfriends.activate(b, true) : this.stack.content.sort.activate(b, true)
            }, this));
            a.preventDefault()
        },
        showuser: function (a, b) {
            this.stack.pushChild({
                type: "user",
                username: b
            })
        },
        showapp: function (a) {
            var b = this.stack.content.pager;
            a = this.stack.content.list.getIndex(a.target);
            this.stack.pushCursor(b.getCursor(a, "app"))
        },
        os_reclick: function () {
            this.stack.content.pager.page != 0 ? this.stack.content.pager.setMethodParams({
                page: 0
            }, true, joli.bind(function () {
                this.stack.popToBottom()
            }, this)) : this.stack.popToBottom()
        },
        web_reclick: function () {
            this.stack.content.pager.page != 0 ? this.stack.content.pager.setMethodParams({
                page: 0
            }, true, joli.bind(function () {
                this.stack.popToBottom()
            }, this)) : this.stack.popToBottom()
        },
        selection_reclick: function () {
            console.log("selection_reclick");
            this.stack.content.pager.page != 0 ? this.stack.content.pager.setMethodParams({
                page: 0
            }, true, joli.bind(function () {
                this.stack.popToBottom()
            }, this)) : this.stack.popToBottom()
        }
    },
    showAppDetails: function () {},
    outOfBounds: function (a, b) {
        if (this.contentOffsetY * -1 < 0) return true;
        if (this.contentOffsetY * -1 > a._element.scrollHeight - b) return true;
        return false
    },
    snapToBounds: function (a, b) {
        var c = false;
        if (this.contentOffsetY * -1 < 0) {
            this.contentOffsetY = 0;
            c = true
        }
        if (this.contentOffsetY * -1 > a._element.scrollHeight - b) {
            this.contentOffsetY = (a._element.scrollHeight - b) * -1;
            c = true
        }
        if (c) {
            this.animateTo(a, this.contentOffsetY);
            a._element.style.webkitTransition = "-webkit-transform 0.2s ease-out";
            a._element.style.webkitTransform = "translate3d(0, " + this.contentOffsetY + "px, 0)"
        }
    },
    animateTo: function (a, b) {
        this.contentOffsetY = b;
        a._element.style.webkitTransition = "";
        a._element.style.webkitTransform = "translate3d(0, " + b + "px, 0)"
    }
});
launcher.ui.search.extend("Search", joli.ui.Widget, {
    events: {
        showuser: function (a, b) {
            this.stack.pushChild({
                type: "user",
                username: b
            })
        },
        showapp: function (a, b) {
            this.stack.pushChild({
                type: "app",
                "package": b
            })
        },
        showappdetails: function (a) {
            this.showDetails(a, "app")
        },
        showuserdetails: function (a) {
            this.showDetails(a, "user")
        },
        categories: function (a, b) {
            var c = b.split("|")[0],
                d = b.split("|")[1],
                g = joli.ui.root.content.current.outerHeight() - 50,
                f, h;
            if (d == "apps") {
                f = parseInt(g / 70, 10) * 2;
                h = this.stack.content.apps.pager
            }
            if (d == "users") {
                f = parseInt(g / 70, 10) * 2;
                h = this.stack.content.users.pager
            }
            if (f && h) if (h.options.perPage != f && f > 0) {
                g = h.pageData;
                h.pageData = undefined;
                h.page = 0;
                h.options.perPage = f;
                if (g) {
                    h.redisplay();
                    this.stack.popToBottom()
                }
            }
            if (c == "jolicloud") d == "apps" ? this.activateAndShow("jolicloud|apps") : this.activateAndShow("jolicloud|users");
            else if (c == "web") window.open({
                google: "http://www.google.com/search?q=",
                bing: "http://www.bing.com/search?q=",
                yahoo: "http://search.yahoo.com/search?p="
            }[d] + this.query, d.charAt(0).toUpperCase() + d.slice(1));
            else c == "social" && window.open({
                facebook: "http://www.facebook.com/srch.php?nm=",
                twitter: "http://twitter.com/#search?q="
            }[d] + this.query, d.charAt(0).toUpperCase() + d.slice(1));
            a.preventDefault()
        },
        jolicloud_reclick: function (a) {
            if (a.target.activeValue === "apps") this.stack.content.apps.pager.page != 0 ? this.stack.content.apps.pager.setMethodParams({
                page: 0
            }, true, joli.bind(function () {
                this.stack.popToBottom()
            }, this)) : this.stack.popToBottom();
            if (a.target.activeValue === "users") this.stack.content.users.pager.page != 0 ? this.stack.content.users.pager.setMethodParams({
                page: 0
            }, true, joli.bind(function () {
                this.stack.popToBottom()
            }, this)) : this.stack.popToBottom()
        }
    },
    showDetails: function (a, b) {
        var c = this[b + "s"],
            d = c.list.getIndex(a.target);
        this.stack.pushCursor(c.pager.getCursor(d, b))
    },
    initWidget: function () {
        this.apps = this.stack.content.apps;
        this.users = this.stack.content.users;
        this.bindMethod("appsLoaded");
        this.bindMethod("usersLoaded");
        joli.Events.subscribe("resize", joli.bind(function () {
            !joli.ui.root.add.active && !joli.ui.root.menu.getItem("dashboard").active && !joli.ui.root.menu.getItem("stream").active && !joli.ui.root.menu.getItem("files").active && !joli.ui.root.menu.getItem("settings").active && this.resizeList()
        }, this))
    },
    resizeList: function () {
        var a = joli.ui.root.content.current.outerHeight() - 50,
            b, c;
        if (this.categories.getItem("apps").active) {
            b = parseInt(a / 70, 10) * 2;
            c = this.stack.content.apps.pager
        }
        if (this.categories.getItem("users").active) {
            b = parseInt(a / 70, 10) * 2;
            c = this.stack.content.users.pager
        }
        if (b && c) if (c.options.perPage != b && b > 0) {
            c.pageData = undefined;
            c.page = 0;
            c.options.perPage = b;
            c.redisplay();
            this.stack.popToBottom()
        }
    },
    setQuery: function (a) {
        this.stack.popToBottom();
        this.query = a;
        joli.ui.root.search.input.val(this.query);
        this.apps.pager.setMethodParam("q", a);
        this.users.pager.setMethodParam("q", a);
        a = joli.ui.root.content.current.outerHeight() - 50;
        var b;
        b = parseInt(a / 70, 10) * 2;
        console.log("search apps elements", b, a);
        if (this.stack.content.apps.pager.options.perPage != b && b > 0) {
            this.stack.content.apps.pager.pageData = undefined;
            this.stack.content.apps.pager.page = 0;
            this.stack.content.apps.pager.options.perPage = b
        }
        b = parseInt(a / 70, 10) * 2;
        console.log("search users elements", b, a);
        if (this.stack.content.users.pager.options.perPage != b && b > 0) {
            this.stack.content.users.pager.pageData = undefined;
            this.stack.content.users.pager.page = 0;
            this.stack.content.users.pager.options.perPage = b
        }
        this.activateAndShow("jolicloud|apps", this.appsLoaded)
    },
    appsLoaded: function () {
        this.apps.pager.isEmpty() ? this.activateAndShow("jolicloud|users", this.usersLoaded) : this.showCallback()
    },
    usersLoaded: function () {
        this.showCallback();
        this.users.pager.isEmpty() && this.activateAndShow("jolicloud|apps")
    },
    activateAndShow: function (a, b) {
        name = a.split("|")[1];
        this[name].refreshIfDirty(joli.bind(function () {
            this.categories.activate(a, true);
            this.resizeList();
            this.stack.content.showChild(name, null, true);
            (b || joli.doNothing)()
        }, this))
    },
    prepareToShow: function (a) {
        this.showCallback = a
    }
});
launcher.ui.search.extend("Item", joli.ui.Widget, {
    showApp: function () {
        this.trigger("showappdetails", [this.model["package"]])
    },
    showUser: function () {
        this.trigger("showuserdetails", [this.model.username])
    },
    initWidget: function () {
        this.action.click(function () {
            if (this.model.first_name !== undefined) {
                this.model.subscribed ? joli.cloud.user.unfollow("user", this.model.username, joli.bind(function () {
                    joli.clearLocalRegExp(this.model.username);
                    joli.clearLocalRegExp("actions?");
                    joli.clearLocalRegExp("subscriptions?");
                    joli.clearLocalRegExp("subscribers?");
                    joli.clearLocalRegExp("friends_likes?");
                    joli.clearLocalRegExp("myself");
                    this.action.label.text = _("Follow");
                    this.trigger("refreshContent");
                    this.model.subscribed = false
                }, this)) : joli.cloud.user.follow("user", this.model.username, joli.bind(function () {
                    joli.clearLocalRegExp(this.model.username);
                    joli.clearLocalRegExp("actions?");
                    joli.clearLocalRegExp("subscriptions?");
                    joli.clearLocalRegExp("subscribers?");
                    joli.clearLocalRegExp("friends_likes?");
                    joli.clearLocalRegExp("myself");
                    this.action.label.text = _("Unfollow");
                    this.trigger("refreshContent");
                    this.model.subscribed = true
                }, this));
                return false
            } else this.model.install(false)
        }, this);
        this.name.click(function () {
            this.model.first_name !== undefined ? this.showUser() : this.showApp()
        }, this);
        this.icon.click(function () {
            this.model.first_name !== undefined ? this.showUser() : this.showApp()
        }, this)
    },
    onModelChanged: function (a) {
        if (a.first_name !== undefined) {
            this.name.text = a.name + " (" + a.username + ")";
            this.description.text = a.about;
            this.icon.src = a.pictures.large;
            this.icon.$.parent().addClass("user");
            if (a.subscribed) {
                this.addClass("added");
                this.action.label.text = _("Unfollow")
            } else {
                this.removeClass("added");
                this.action.label.text = _("Follow");
                this.action.removeClass("disabled")
            }
            a.me ? this.action.hide() : this.action.show();
            this.likes.text = a.devices;
            this.likes.addClass("devices");
            a.badges && joli.each(a.badges, function (b) {
                b.key == "founding_member" && this.likes.addClass("founder")
            }, this)
        } else {
            this.icon.$.parent().removeClass("user");
            this.removeClass("web").removeClass("native").addClass(a.type);
            this.name.text = a.name;
            this.likes.text = a.likes;
            this.description.text = a.short_description;
            this.icon.src = a.pictures.large;
            if (a.added) {
                this.addClass("added");
                this.action.label.text = _("Added");
                this.action.addClass("disabled")
            } else {
                this.removeClass("added");
                this.action.label.text = _("Add");
                this.action.removeClass("disabled")
            }
            if (a.mandatory) {
                this.addClass("added");
                this.action.label.text = _("Added");
                this.action.addClass("disabled")
            }
        }
        this.badges.hide()
    }
});
launcher.ui.stream.extend("Item", joli.ui.Widget, {
    initWidget: function () {
        this.picture.click(function () {
            if (this.model.object.type == "app") this.trigger("showapp", [this.model.object[this.model.object.type]["package"]]);
            else this.model.object.type == "user" && this.trigger("showuser", [this.model.object[this.model.object.type].username])
        }, this);
        this.message.actor.click(function () {
            this.model.actor.type == "user" && this.trigger("showuser", [this.model.actor[this.model.actor.type].username])
        }, this);
        this.message.object.click(function () {
            if (this.model.object.type == "app") this.trigger("showapp", [this.model.object[this.model.object.type]["package"]]);
            else this.model.object.type == "user" && this.trigger("showuser", [this.model.object[this.model.object.type].username])
        }, this)
    },
    onModelChanged: function (a) {
        if (a && a.description) {
            this.attachment.show();
            var b = a.description;
            b = b.replace("<actor>" + a.actor[a.actor.type].name + "</actor>", "");
            if (a.object.type == "app") {
                b = b.replace("&amp;", "&").replace("<object>" + a.object[a.object.type].name + "</object>", "");
                object_name = a.object[a.object.type].name;
                if (joli.model.apps.instances[a.object.app["package"]]) {
                    console.log(a.object.app["package"], joli.model.apps.instances[a.object.app["package"]]);
                    this.attachment.setModel(joli.model.apps.instances[a.object.app["package"]])
                } else {
                    this.attachment.setModel(null);
                    this.attachment.addClass("loading-element");
                    joli.cloud.apps.id(a.object.app["package"], function (c) {
                        this.attachment.setModel(joli.model.apps.instances[c["package"]]);
                        this.attachment.removeClass("loading-element")
                    }, this)
                }
            } else if (a.object.type == "user") {
                b = b.replace("<object>" + a.object[a.object.type].name + "</object>", "");
                object_name = a.object[a.object.type].name;
                this.attachment.setModel(a.object.user)
            } else {
                b = b.replace("<object>", "");
                b = b.replace("</object>", "");
                object_name = ""
            }
            this.picture.src = a.actor[a.actor.type].pictures.large;
            this.message.actor.text = a.actor[a.actor.type].first_name || a.actor[a.actor.type].name;
            this.message.desc.text = b;
            b.indexOf("liked") != -1 ? this.message.addClass("liked") : this.message.removeClass("liked");
            this.message.object.text = object_name
        }
        if (a && a.post) {
            this.attachment.hide();
            this.picture.src = a.actor[a.actor.type].pictures.large;
            this.message.actor.text = a.actor[a.actor.type].name;
            this.message.desc.innerHTML = " said " + a.post;
            this.message.object.text = ""
        }
    }
});
joli.ui.templates["launcher/appdetails"] = '<div class="joli-main-second"> <div class="joli-content joli-content-with-navigationbar"> <div data-var="profile" data-ui="launcher/profile"></div> <ul data-var="tabs" data-target="content" data-ui="joli/tabview"> <li data-value="info">_("Overview")</li> <li data-value="support">_("Support")</li> </ul> <div data-var="content" data-ui="joli/swapcontainer" class="padding-container"> <div data-var="info" data-ui="joli/tableview"></div> <div data-var="support"> <ul data-class="joli.widget" class="joli-app-support" data-var="list"></ul> <p class="about-support"><span>_("Support info") </span>_("Jolicloud provides these links only for information purposes and is not providing support for this application.")<br>_("For direct support, contact the application publisher or join a community support group.")</p> </div> </div> </div> </div>';
joli.ui.templates["launcher/profile"] = '<div> <div> <figure> <span class="inset-light"></span> <img data-var="icon"> </figure> </div> <div> <ul class="informations"> <li class="name"> <a data-var="name"></a> <a data-var="star"></a> <span data-var="devices"></span> </li> <li> <ul data-var="badges" data-item="badge" data-class="joli.list"> <li data-template="badge" data-css="badge"></li> </ul> </li> <li data-var="description"></li> </ul> </div> <div> <div data-ui="joli/button" data-var="action">Action</div> <a data-var="report">_("Report this app")</a> </div> </div>';
joli.ui.templates["launcher/application"] = '<div> <div id="background" data-var="background" data-class="joli.widget" class="background"></div> <header id="toolbar" class="joli-header"> <nav id="menu"> <div data-event="directory" data-var="add" data-ui="joli/button" class="joli-button-add"></div> <ul data-var="menu" data-ui="joli/toolbar" data-options="event: menu; target: content;"> <li data-value="dashboard">_("Dashboard")</li> <li data-value="stream">_("Stream")</li> <li data-value="files">_("Files")</li> <li data-value="settings">_("Settings")</li> </ul> </nav> <nav id="options"> <div id="offline" data-var="offline"></div> <div id="loader" data-var="loader" class="joli-gif-loader"><div class="joli-gif-loader-dots"></div></div> <div id="sync" data-var="sync" data-ui="launcher/sync"></div> <ul data-var="power" data-ui="joli/toolbar" data-options="event: power;"> <li data-value="shutdown">_("Shutdown")</li> </ul> </nav> <div id="search" data-ui="joli/searchfield" data-var="search"></div> </header> <div class="joli-container" data-var="content" data-ui="joli/swapcontainer"> <div data-var="directory" data-ui="launcher/directory"></div> <div data-var="dashboard" data-ui="launcher/dashboard"></div> <div data-var="stream" data-ui="launcher/stream"></div> <div data-var="files" data-ui="launcher/files"></div> <div data-var="friends" data-ui="launcher/friends"></div> <div data-var="settings" data-ui="launcher/settings"></div> <div data-var="search" data-ui="launcher/search"></div> </div> <div data-var="iframebox" data-ui="launcher/iframe"></div> <div data-var="previewbox" data-ui="launcher/preview"></div> <div data-var="upgrade" data-ui="launcher/upgrade"></div> <div data-var="activation" data-ui="launcher/activation"></div> <div data-var="shutdownbox" data-ui="joli/modalbox"> <p data-var="description"></p> <div data-var="form" class="performupdates"> <div data-var="updatetext"><input id="checkboxupdates" type="checkbox" data-var="checkboxupdates" checked="checked"> <label for="checkboxupdates">_("Update your system before quitting.")</label></div> <div data-var="progress" data-ui="joli/progressbar" data-options="width: 564; height: 4; val: 0; max: 1;"></div> </div> <ul data-var="buttons" data-ui="joli/chooser" data-options="event: modalbox; item: joli/button"> <li data-value="cancel" class="cancel">_("Cancel")</li> <li data-value="logout">_("Log Out")</li> <li data-value="sleep">_("Sleep")</li> <li data-value="restart">_("Restart")</li> <li data-value="shutdown">_("Shut Down")</li> </ul> </div> <div data-var="processingbox" data-ui="joli/modalbox"> <p data-var="description"></p> </div> <div data-var="preloader" class="joli-application-loading joli-loader active joli-gif-loader"> <div class="joli-gif-loader-dots"></div> </div> <div data-var="updatebox" data-ui="joli/modalbox"> <p data-var="description"></p> <ul data-var="buttons" data-ui="joli/chooser" data-options="event: updatebox; item: joli/button"> <li data-value="cancel">_("Cancel")</li> <li data-value="update">_("Update")</li> </ul> </div> <div data-var="offlinebox" data-ui="joli/modalbox"> <div data-var="description"> <p>_("Please connect to the Internet and log into Jolicloud. While offline, you can still:")</p> <ol data-var="offlinetips"> <li>_("Use the Menu key to open the old application menu")</li> <li>_("Press ALT+F2 to open the application launcher")</li> </ol> </div> <ul data-var="buttons" data-ui="joli/chooser" data-options="event: offlinebox; item: joli/button"> <li data-value="connect">_("Sign In")</li> </ul> </div> </div>';
joli.ui.templates["launcher/sync"] = '<div> <a id="notification-icon" data-var="icon"> <div class="notification-inset"> <div data-var="status"></div> <div data-var="progress" data-ui="joli/progressbar" data-options="width: 114; height: 2; val: 0; max: 1;"></div> </div> </a> <div id="notification-panel" data-var="panel"> <div data-var="item"> <div data-var="title"></div> <div data-var="desc"><span data-var="apps">&nbsp;</span><span data-var="and"> & </span><span data-var="updates">&nbsp;</span></div> <div data-var="current">&nbsp;</div> </div> <div data-var="action"> <div data-var="start" data-event="start" data-ui="joli/button">_("Start")</div> </div> </div> </div>';
joli.ui.templates["launcher/iframe"] = '<div class="joli-modalbox iframebox"> <div data-var="content" class="content"> <div class="inset-light"> <div data-var="description"> <iframe data-var="iframe"></iframe> </div> <ul class="buttons"> <li data-var="closeiframe" data-ui="joli/button">_("Close")</li> </ul> </div> </div> </div>';
joli.ui.templates["launcher/userdetails"] = '<div class="joli-content joli-content-with-navigationbar"> <div data-var="profile" data-ui="launcher/profile"></div> <ul data-var="tabs" data-ui="joli/tabview" data-options="target: content; activate: false;" data-event="userdetailstabs"> <li data-value="apps">_("Shared Apps")</li> <li data-value="following">_("Following")</li> <li data-value="followers">_("Followers")</li> <li data-value="publicpage">_("Public Page")</li> </ul> <div data-var="content" data-ui="joli/swapcontainer" class="padding-container"> <div data-var="apps" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 12; pageRadius: -1; method: joli.cloud.apps.favorites;"></div> <div data-var="following" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 6; pageRadius: -1; method: joli.cloud.user.followings;"></div> <div data-var="followers" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 6; pageRadius: -1; method: joli.cloud.user.followers;"></div> </div> </div>';
joli.ui.templates["launcher/element"] = '<div> <a class="picture"> <figure> <span class="inset-light"></span> <img data-var="icon" /> </figure> </a> <div data-var="action" data-ui="joli/button">Action</div> <p class="main"> <a data-var="name"></a> <a data-var="star"></a> <span data-var="devices"></span> <span data-var="shared"></span> <span data-var="badges"></span> </p> <p data-var="description"></p> </div>';
joli.ui.templates["launcher/upgrade"] = '<div class="joli-modalbox upgrade" data-class="launcher.upgrade"> <div class="wrapper"> <div data-var="content" class="content"> <h1 data-var="title">Upgrade to Jolicloud 1.1</h1> <div data-var="swap" data-ui="joli/swapcontainer"> <div class="step" data-var="step1"> <p data-var="description">Congratulations, you are ready to upgrade to Jolicloud 1.1! Make sure your device is plugged in to power, that you have enough space left on your hard drive and that you are connected to the Internet via WiFi or Ethernet.</p> <div class="types"> <div data-var="connection"><div class="tick"></div>Connection</div> <div data-var="battery"><div class="tick"></div>Battery</div> <div data-var="space"><div class="tick"></div>Space</div> </div> <div class="clear"></div> <div class="buttons"> <a data-var="cancelButton" data-event="cancel" data-ui="joli/button">Cancel</a> <a data-var="upgradeButton" data-event="upgrade" data-ui="joli/button">Upgrade</a> </div> </div> <div class="step" data-var="step2"> <p data-var="description">Your system is currently upgrading. The time will depend on your network connection. Grab a coffee. We take care of the rest.</p> </div> <div class="step" data-var="nospace"> <p data-var="description">There isn\'t enough space on your computer. Please check your hard drive, <br>make sure you have at least 1Gb available and try again.</p> <div class="buttons"> <a data-var="cancelButton" data-event="cancel" data-ui="joli/button">Close</a> </div> </div> <div class="step" data-var="nonetwork"> <p data-var="description">You need to connect to the Internet to perform the upgrade.<br>Please configure your connection.</p> <div class="buttons"> <a data-var="cancelButton" data-event="cancel" data-ui="joli/button">Close</a> </div> </div> <div class="step" data-var="error"> <p data-var="description">There was an error while upgrading.<br>Please contact the support team.</p> <div class="buttons"> <a data-var="cancelButton" data-event="cancel" data-ui="joli/button">Close</a> </div> </div> </div> </div> </div> </div> ';
joli.ui.templates["launcher/preview"] = '<div class="joli-modalbox preview"> <div data-var="content" class="content"> <div class="inset-light"> <h1 data-var="name"></h1> <div class="previewcontent"> <div data-var="tooltip">_("Loading")...</div> <audio data-var="audio" autobuffer="autobuffer" src=""></audio> <video data-var="video" autobuffer="autobuffer" src=""></video> <div class="player"> <div data-var="progress" data-ui="joli/progressbar" data-options="width: 480; height: 4; val: 0; max: 1;"></div> </div> <div data-var="body"></div> <div data-var="iframe"></div> </div> <ul class="buttons"> <li data-var="openpreviewinfolder" data-ui="joli/button">_("Open in Folder")</li> <li data-var="openpreview" data-ui="joli/button">_("Open")</li> <li data-var="closepreview" data-ui="joli/button">_("Close")</li> </ul> </div> </div> </div>';
joli.ui.templates["launcher/activation"] = '<div class="joli-modalbox activation" data-class="launcher.activation"> <div class="wrapper"> <div data-var="content" class="content"> <h1 data-var="title"></h1> <div data-var="activationprogress"> <span data-var="steps">&nbsp;</span> <div data-var="progressbar"> <div data-var="currentprogress"></div> </div> </div> <div data-var="swap" data-ui="joli/swapcontainer"> <div class="step" data-var="step0"> <p data-var="description">_("To use Jolicloud you need to associate this device to your account:")</p> <ul> <li>- _("Your settings will be synced automatically.")</li> <li>- _("We will take care of the system updates.")</li> <li>- _("We will take care of the apps updates.")</li> <li>- _("You are helping us making Jolicloud better.")</li> </ul> <div class="buttons"> <a data-var="button" data-event="begin" data-ui="joli/button">_("Start")</a> </div> </div> <div class="step" data-var="step1"> <p data-var="description"></p> <div class="types"> <div data-var="netbook"><div class="tick"></div>_("Netbook")</div> <div data-var="laptop"><div class="tick"></div>_("Laptop")</div> <div data-var="desktop"><div class="tick"></div>_("Desktop")</div> <div data-var="other"><div class="tick"></div>_("Other Device")</div> </div> <div data-var="otherfield">_("Define other:") <input type="text" data-var="othername" placeholder="_(\'Virtual Machine, Tablet, etc...\')" /></div> <div data-var="otherfieldhelp">_("Please describe the device you\'re using.")</div> <div class="buttons"> <a data-var="button" data-event="type" data-ui="joli/button">_("Next")</a> </div> </div> <div class="step" data-var="step2"> <p data-var="description">_("Select the brand and the model of your device. If it\'s not in the list, that\'s okay, just select \u201cOther\u201d in the list and give us the details.")</p> <div class="branding"> <div class="brands1"> <div>_("Brand")</div> <select data-var="brands" size="8"></select> </div> <div data-var="modelscontainer"> <div>_("Model")</div> <select data-var="models" size="8"></select> </div> </div> <div data-var="otherfield">_("Define other:") <input type="text" data-var="othermodel" /></div> <div data-var="otherfieldhelp">_("Please tell us the brand and/or model you\'re using.")</div> <div class="buttons"> <a data-var="button" data-event="start" data-ui="joli/button">_("Previous")</a> <a data-var="button" data-event="brandmodel" data-ui="joli/button">_("Next")</a> </div> </div> <div class="step" data-var="step3"> <p data-var="description">_("Choose a name for this device. It will help you identify it if you are associating more than one device to your account.")</p> <div class="name otherfield">_("Device Name:") <input type="text" data-var="devicename" value="_(\'My Joli Computer\')" /></div> <div data-var="otherfieldhelp">_("Please choose a name for your device.")</div> <div class="buttons"> <a data-var="button" data-event="type" data-ui="joli/button">_("Previous")</a> <a data-var="button" data-event="nameit" data-ui="joli/button">_("Next")</a> </div> </div> <div class="step" data-var="step4"> <p data-var="description">_("Thanks for your input. Your information will help the team improve Jolicloud.")</p> <div class="buttons"> <a data-var="button" data-event="close" data-ui="joli/button">_("Close")</a> </div> </div> <div class="step" data-var="step5"> <p data-var="description">_("To use Jolicloud you need to associate this device to your account:")</p> <ul> <li>- _("Your settings will be synced automatically.")</li> <li>- _("We will take care of the system updates.")</li> <li>- _("We will take care of the apps updates.")</li> <li>- _("You are helping us making Jolicloud better.")</li> </ul> <div class="buttons"> <a data-var="button" data-event="begin2" data-ui="joli/button">_("Start")</a> </div> </div> <div class="step" data-var="step6"> <p data-var="description">_("We\'ve detected that you\'re using Jolicloud on the device") <span data-var="devicename"></span>. _("Just click on the button to associate this device to your account. We will take care of the rest.")</p> <div class="buttons"> <a data-var="button" data-event="associate" data-ui="joli/button">_("Associate")</a> </div> </div> <div class="step" data-var="step7"> <p data-var="description">_("Thanks for your input. Your information will help the team improve Jolicloud.")</p> <div class="buttons"> <a data-var="button" data-event="close" data-ui="joli/button">_("Close")</a> </div> </div> <div class="step" data-var="error"> <p data-var="description">_("Sorry, it seems there is something wrong with your device configuration. You can retry the activation process by clicking on the Retry button.")<br/><br/> _("If it still happen, please contact us for help by clicking the Contact button.")<br/><br/> _("Thank you.")</p> <div class="buttons"> <a data-var="button" data-event="retry" data-ui="joli/button">_("Retry")</a> <a data-var="button" data-event="support" data-ui="joli/button">_("Contact")</a> </div> </div> <div class="step" data-var="oem"> <p data-var="description">_("Thank you for your purchase. Now give a name to your Jolibook. It will help you identify it if you are associating more than one device to your account.")</p> <div class="name otherfield">_("Name:") <input type="text" data-var="devicename" value="_(\'My Jolibook\')" /></div> <div data-var="otherfieldhelp">_("Please give a name to your Jolibook.")</div> <div class="buttons"> <a data-var="button" data-event="oemclose" data-ui="joli/button">_("Get Started")</a> </div> </div> </div> </div> </div> </div> ';
joli.ui.templates["launcher/files/details"] = '<div> <h1>_("Details")</h1> <section class="main"> <h1 data-var="name"></h1> <h2 data-var="desc"></h2> <figure> <img data-var="thumbnail"> </figure> <canvas data-var="diskspace" width="172" height="172"></canvas> </section> <section class="informations"> <table> <tr data-var="modified"> <td>_("Modified")</td> <td data-var="value"></td> </tr> <tr data-var="size"> <td>_("Size")</td> <td data-var="value"></td> </tr> <tr data-var="items"> <td>_("Items")</td> <td data-var="value"></td> </tr> <tr data-var="capacity"> <td>_("Capacity")</td> <td data-var="value"></td> <td></td> </tr> <tr data-var="available"> <td>_("Available")</td> <td data-var="value"></td> <td><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAANCAYAAACdKY9CAAAAoElEQVR42o3KQQqCUBRG4Qta9rIkTSyzMCQyMVIqsqSgiYOW1rLakTv4e7cF2D3wzQ7pSq3V8Ef7ew3D/FR1g/rx6sQPv2T2+qhujQi/ZFkDnC5PEX5JDW2Ux7sIv2SPHOyLqwi/NHZcZPlZhF+auD62aSHCL3nTGZJNLsIv+UGIeJ2K8EvBfIkwihGtkk788Eu77PAOFzEk+CUASvOE1BfqJ+9ff9b9swAAAABJRU5ErkJggg==" /></td> </tr> <tr data-var="used"> <td>_("Used")</td> <td data-var="value"></td> <td><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAANCAYAAACdKY9CAAAAqklEQVR42o3KoQrCUBiG4T8cGIchgwkLB1RUBhMMJm1egjYvRYxjMMRiEptJLFYtVg1mBbviDcwr+Nx3A/q/8LRXytISVPgaY5BlGf7Fh694nkVRfFT4iu9X8Hy9VfhKEIS43R8qfCWsRjhfrip8JYocDseTCl9xroHtbq/CV2r1NlbrjQpfabYS5POlCl+J4y5G4wmms/QnPnylPxgukk4PGnwFgC2FSvYLb7GWrAdLaFwAAAAASUVORK5CYII=" /></td> </tr> </table> <div class="action-buttons"> <div data-var="preview" data-ui="joli/button">_("Preview")</div> <div data-var="open" data-ui="joli/button">_("Open")</div> <div data-var="saveas"><a>_("Right Click to Save As")</a></div> <div data-var="openfolder" data-ui="joli/button">_("Open in Folder")</div> </div> </section> </div>';
joli.ui.templates["launcher/files/files"] = '<div class="joli-main"> <nav data-var="sidebar" data-ui="joli/sidebar" data-event="sidebar" data-options="activate: false;"> <section data-value="local" data-heading="_(\'This Device\')"> <a data-value="oldfolders">_("Folders")</a> <a data-value="jolicloud" class="folders">Joli OS</a> <a data-value="olddrives">_("Drives")</a> </section> <section data-value="web" data-heading="_(\'Web\')"> <a data-value="dropbox">Dropbox</a> <a data-value="googledocs">Google Docs</a> </section> <section data-value="connections" class="connections ownappbox"> <div data-var="openconnections" data-ui="joli/button">_("Connections")</div> </section> </nav> <div data-var="stack" data-ui="joli/stackcontainer"> <div data-var="content" data-ui="joli/swapcontainer" class="joli-content"> <section data-var="jolicloud" class="services"> <div class="breadcontainer"><ul data-var="breadcrumb" data-ui="joli/list" data-item="launcher/files/breadcrumb"></ul></div> <div class="table-rightsidebar-container"> <div class="table-container"> <div class="table-container-header"> <table class="filebrowser-header" cellpadding="0" cellspacing="0"> <thead> <tr class="header"> <th data-var="sort_name" class="sort_desc">_("Name") \u25b2</th> <th data-var="sort_size">_("Size")</th> <th data-var="sort_date">_("Modified")</th> <th></th> </tr> </thead> </table> </div> <div class="table-container-body"> <div class="table-row" data-var="list" data-ui="joli/list" data-item="launcher/files/item"></div> </div> </div> <div data-var="details" class="rightsidebar hide" data-ui="launcher/files/details"></div> </div> </section> <section data-var="oldfolders"> <ul data-var="list" data-item="folder"> <li data-template="folder" data-ui="launcher/dashboard/item" data-class="launcher.files.folder"></li> </ul> </section> <section data-var="drive" class="services"> <div class="breadcontainer"><ul data-var="breadcrumb" data-ui="joli/list" data-item="launcher/files/breadcrumb"></ul></div> <div class="table-rightsidebar-container"> <div class="table-container"> <div class="table-container-header"> <table class="filebrowser-header" cellpadding="0" cellspacing="0"> <thead> <tr class="header"> <th data-var="sort_name" class="sort_desc">_("Name") \u25b2</th> <th data-var="sort_size">_("Size")</th> <th data-var="sort_date">_("Modified")</th> <th></th> </tr> </thead> </table> </div> <div class="table-container-body"> <div class="table-row" data-var="list" data-ui="joli/list" data-item="launcher/files/item"></div> </div> </div> <div data-var="details" class="rightsidebar hide" data-ui="launcher/files/details"></div> </div> </section> <section data-var="olddrives"> <ul data-var="list" data-item="drive"> <li data-template="drive" data-ui="launcher/dashboard/item" data-class="launcher.files.drive"></li> </ul> </section> <section data-var="dropbox" class="services"> <div class="breadcontainer"><ul data-var="breadcrumb" data-ui="joli/list" data-item="launcher/files/breadcrumb"></ul></div> <div class="table-rightsidebar-container"> <div class="table-container"> <div class="table-container-header"> <table class="filebrowser-header" cellpadding="0" cellspacing="0"> <thead> <tr class="header"> <th data-var="sort_name" class="sort_desc">_("Name") \u25b2</th> <th data-var="sort_size">_("Size")</th> <th data-var="sort_date">_("Modified")</th> <th></th> </tr> </thead> </table> </div> <div class="table-container-body"> <div class="table-row" data-var="list" data-ui="joli/list" data-item="launcher/files/item"></div> </div> </div> <div data-var="details" class="rightsidebar hide" data-ui="launcher/files/details"></div> </div> </section> <section data-var="dropboxconnect" class="services padding-container"> <a href="/settings/connections?service=dropbox&connect=true" target="_blank"><div class="logo dropbox"></div></a> <div class="joli-button action"> <a href="/settings/connections?service=dropbox&connect=true" target="_blank"> <span class="icon"></span> <span data-var="label" class="label">_("Link to my") Dropbox</span> <span class="extra" style="display: none; "></span> </a> </div> </section> <section data-var="googledocs" class="services"> <div class="breadcontainer"><ul data-var="breadcrumb" data-ui="joli/list" data-item="launcher/files/breadcrumb"></ul></div> <div class="table-rightsidebar-container"> <div class="table-container"> <div class="table-container-header"> <table class="filebrowser-header" cellpadding="0" cellspacing="0"> <thead> <tr class="header"> <th data-var="sort_name" class="sort_desc">_("Name") \u25b2</th> <th data-var="sort_size">_("Size")</th> <th data-var="sort_date">_("Modified")</th> <th></th> </tr> </thead> </table> </div> <div class="table-container-body"> <div class="table-row" data-var="list" data-ui="joli/list" data-item="launcher/files/item"></div> </div> </div> <div data-var="details" class="rightsidebar hide" data-ui="launcher/files/details"></div> </div> </section> <section data-var="googledocsconnect" class="services padding-container"> <a href="/settings/connections?service=googledocs&connect=true" target="_blank"><div class="logo googledocs"></div></a> <div class="joli-button action"> <a href="/settings/connections?service=googledocs&connect=true" target="_blank"> <span class="icon"></span> <span data-var="label" class="label">_("Link to my") Google Docs</span> <span class="extra" style="display: none; "></span> </a> </div> </section> </div> </div> </div>';
joli.ui.templates["launcher/files/item"] = '<div> <div><a data-var="name"></a></div> <div data-var="size"></div> <div data-var="date"></div> </div>';
joli.ui.templates["launcher/files/breadcrumb"] = '<li><a data-var="action"><span data-var="name"></span></a></li>';
joli.ui.templates["launcher/stream/item"] = '<div> <div class="profile-pic"> <figure class="user"> <span class="inset-light"></span> <img data-var="picture" /> </figure> </div> <div class="stream-content"> <p data-var="message"> <a data-var="actor"></a> <span data-var="desc"></span> <a data-var="object"></a> </p> <div data-var="attachment" data-ui="launcher/element"></div> </div> </div>';
joli.ui.templates["launcher/stream/infiniteitem"] = '<div class="launcher-stream-item"> <div class="profile-pic"> <figure class="user"> <span class="inset-light"></span> <img data-var="picture" /> </figure> </div> <div class="stream-content"> <p data-var="message"> <a data-var="actor"></a> <span data-var="desc"></span> <a data-var="object"></a> </p> <ul data-var="list" data-item="launcher/element"></div> </div> </div>';
joli.ui.templates["launcher/stream/stream"] = '<div class="joli-main"> <nav data-var="sidebar" data-ui="joli/sidebar" data-event="sidebar" data-options="activate: false;"> <section data-value="activities" data-heading="_(\'Activities\')"> <a data-value="jolicloud">_("Friends")</a> <a data-value="you">_("You")</a> </section> </nav> <div data-var="stack" data-ui="joli/stackcontainer"> <div data-var="content" data-ui="joli/swapcontainer" class="joli-content"> <div data-var="jolicloud"> <ul data-var="tabs" data-ui="joli/tabview" data-options="activate: false; target: swap;" data-event="jolicloudtabs"> <li data-value="stream">_("Stream")</li> <li data-value="following">_("Following")</li> <li data-value="followers">_("Followers")</li> <li data-value="top">_("Top Members")</li> <li data-value="publicpage">_("Public Page")</li> <li data-value="newfriends">_("New Facebook Friends!")</li> </ul> <div data-var="swap" data-ui="joli/swapcontainer"> <div data-var="stream"> <div class="stream-container"> <div class="stream-container-content"> <ul data-var="list" class="feed" data-item="launcher/stream/infiniteitem"></ul> <ul data-var="listbuffer" style="display: none;" data-item="launcher/stream/infiniteitem"></ul> <div data-var="more" data-ui="joli/button" data-event="more">_("More")</div> </div> </div> <div class="rightsidebar"> <h1>_("Friends\u2019 Picks")</h1> <section class="apps"> <ul data-var="friendapps" data-item="launcher/element"></ul> </section> <h1>_("Joli OS 1.2")</h1> <section class="jolios"> <p>_("Breathe new life into any computer up to 10 years old.")</p> <img src="data:image/png;base64,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" /> <div data-event="jolios" data-var="jolios" data-ui="joli/button">_("Get Joli OS 1.2")</div> </section> <h1>_("Jolicloud Chrome App")</h1> <section class="chromeapp"> <p>_("Instantly launch Jolicloud from your Chrome browser.")</p> <img src="data:image/png;base64,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" /> <div data-event="chromeapp" data-var="chromeapp" data-ui="joli/button">_("Get Jolicloud for Chrome")</div> </section> </div> </div> <div data-var="following" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 10; pageRadius: -1; method: joli.cloud.user.followings;"></div> <div data-var="followers" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 10; pageRadius: -1; method: joli.cloud.user.followers;"></div> <div data-var="top" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 10; pageRadius: -1; method: joli.cloud.user.top;"></div> <div data-var="newfriends" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 10; pageRadius: -1; method: joli.cloud.user.facebookFriends;"></div> </div> </div> <div data-var="you"> <ul data-var="tabs" data-ui="joli/tabview" data-options="activate: false; target: swap;" data-event="youtabs"> <li data-value="history">_("Stream")</li> </ul> <div data-var="swap" data-ui="joli/swapcontainer" class="padding-container"> <div data-var="history" data-ui="joli/paginglist" data-options="item: launcher/stream/item; perPage: 5; pageRadius: -1; method: joli.cloud.user.myActions;"></div> </div> </div> </div> </div> </div>';
joli.ui.templates["launcher/settings/appssync"] = '<div> <span data-var="title"></span> <div data-var="action" data-ui="joli/button" data-event="install">_(\'Install\')</div> <span data-var="state"></span> </div>';
joli.ui.templates["launcher/settings/history"] = '<div> <p data-var="message"> <a data-var="actor"></a> <span data-var="desc"></span> <a data-var="object"></a> <time data-var="time"></time> </p> </div>';
joli.ui.templates["launcher/settings/update"] = '<div> <p><span data-var="title"></span> <span data-var="description"></span></p> </div>';
joli.ui.templates["launcher/settings/membership"] = '<div> <p data-var="badge"></p> <p data-var="title"></p> <p data-var="description"></p> </div>';
joli.ui.templates["launcher/settings/settings"] = '<div class="joli-main"> <nav data-var="sidebar" data-ui="joli/sidebar" data-event="sidebar" data-options="activate: false;"> <section data-value="myjolicloud" data-heading="_(\'My Jolicloud\')"> <a data-value="account">_("Account")</a> <a data-value="device">_("This Device")</a> </section> </nav> <div data-var="stack" data-ui="joli/stackcontainer"> <div data-var="content" class="joli-content"> <div data-var="profile" data-ui="launcher/profile"></div> <div data-var="device" data-ui="launcher/profile" class="profile"></div> <div data-var="content" data-ui="joli/swapcontainer"> <section data-var="account"> <ul data-var="tabs" data-ui="joli/tabview" data-target="content" data-event="tabs"> <li data-value="info">_("Info")</li> <li data-value="membership">_("Badges")</li> <li data-value="history">_("History")</li> <li data-value="apps">_("Shared Apps")</li> <li data-value="devices">_("Devices")</li> <li data-value="logout" title="_("Log Off This Account")">_("Log Off This Account")</li> <li data-value="settings" title="_("Edit Settings")">_("Edit Settings")</li> </ul> <div data-var="content" data-ui="joli/swapcontainer" class="padding-container"> <section data-var="info"> <div data-var="account"> <dl class="joli-tableview"> <dt>_("Public Page")</dt> <dd data-var="publicpage"></dd> <dt>_("Username")</dt> <dd data-var="username"></dd> <dt>_("Email")</dt> <dd data-var="email"></dd> <dt>_("Language")</dt> <dd data-var="language"></dd> </dl> </div> <div data-var="details"> <dl class="joli-tableview"> <dt>_("Full Name")</dt> <dd data-var="fullname"></dd> <dt>_("Gender")</dt> <dd data-var="gender"></dd> <dt>_("Birthday")</dt> <dd data-var="birthday"></dd> <dt>_("Country")</dt> <dd data-var="country"></dd> <dt>_("Joliclouding")</dt> <dd data-var="join"></dd> </dl> </div> </section> <ul data-var="membership" data-item="launcher/settings/membership"></ul> <div data-var="history" data-ui="joli/paginglist" data-options="item: launcher/settings/history; perPage: 11; pageRadius: -1; method: joli.cloud.user.history;"></div> <div data-var="apps" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 8; pageRadius: -1; method: joli.cloud.apps.favorites;" class="launcher-settings"></div> <section data-var="devices"> <ul data-item="launcher/element" data-var="list"></ul> <div data-options="perPage: 8; pageRadius: -1; target: list; method: joli.cloud.user.computers;" data-class="launcher.settings.paginator" data-ui="joli/paginator" data-var="pager"></div> </section> </div> </section> <section data-var="device" class="device-container"> <ul data-var="tabs" data-ui="joli/tabview" data-target="content" data-event="devicetabs"> <li data-value="info">_("Info")</li> <li data-value="updates">_("Updates")</li> <li data-value="appssync">_("Apps Sync")</li> <li data-value="extra">_("Legacy Apps")</li> </ul> <div data-var="content" data-ui="joli/swapcontainer" class="padding-container"> <div data-var="info" data-ui="joli/tableview"></div> <div data-var="updates"> <div class="sync-status" data-var="syncstatus"> <p><span data-var="status" class="no">_("Your system is synchronized.")</span> <div data-var="checkupdatebutton" data-event="checkupdate" data-ui="joli/button">_("Check")</div></p> </div> <div data-var="startupdate"> <div data-var="update" data-event="update" data-ui="joli/button">_("Start Update")</div> </div> <section data-var="updates" class="update-list"> <ul data-item="launcher/settings/update" data-var="list"></ul> </section> </div> <div data-var="appssync"> <div class="appssync-status" data-var="appssyncstatus"> <p><span data-var="status" class="no">_("Your apps are synchronized.")</span></p> </div> <div data-var="startappssync"> <div data-var="appssyncbutton" data-event="appssync" data-ui="joli/button">_("Start Synchronization")</div> </div> <section data-var="appssync" class="update-list"> <ul data-item="launcher/settings/appssync" data-var="list"></ul> </section> </div> <div data-var="extra"> <ul data-var="list" data-item="extra"> <li data-template="extra" data-ui="launcher/dashboard/item" data-class="launcher.settings.extra"></li> </ul> </div> </div> </section> </div> </div> </div> </div>';
joli.ui.templates["launcher/dashboard/item"] = '<div> <div class="appli-container"> <div class="editbar-container"> <div data-var="editbar"> <div class="inset-light-container"></div> <a data-var="remov" data-event="uninstall"><div class="inset-light-left"></div></a> <div class="inset-light-right"> <a data-var="likeability" data-event="likeability"></a> <a data-var="information" data-event="getinformation"></a> </div> </div> </div> <a data-var="appli"> <div class="inset-light"></div> <img draggable="false" data-offline="true" data-var="icon" /> <p data-var="name"></p> </a> </div> <div data-var="extra"> <canvas data-var="space" width="15" height="15"></canvas> <span data-var="info"></span> </div> </div>';
joli.ui.templates["launcher/dashboard/dashboard"] = '<div class="joli-main"> <div data-var="notice" class="joli-notice"><span><span data-var="message"></span><a data-var="notice-close" data-event="noticlose" data-class="joli.clickable">X</a></span></div> <div data-var="settingspanel"> <div class="tabscontainer"> <a data-var="close">_("Close")</a> <ul data-var="tabs" data-ui="joli/tabview" data-target="content" data-event="backgroundstabs"> <li data-value="jolicloud">_("Jolicloud Wallpapers")</li> <li data-value="users">_("Your Wallpapers")</li> <li data-value="config">_("Configuration")</li> </ul> <div data-var="content" data-ui="joli/swapcontainer"> <div data-var="jolicloud"> <div data-var="gallery"></div> </div> <div data-var="users"> <div class="column"> <h1>_("Use an image online:")</h1> <div class="uploadcontainer"> <input data-var="url" type="text" placeholder="_(\'Enter your URL here\')" /> <div data-ui="joli/button" data-var="loadurl">_("Load")</div> </div> </div> <div class="column"> <h1>_("Use a local image:")</h1> <div class="uploadcontainer"> <span class="desc">_("Image must be less than 2MB. It will not be synchronized with Jolicloud.")</span> <div class="fakebutton"><div data-ui="joli/button" class="select">_("Select")</div> <input data-var="file" type="file" /></div> </div> </div> </div> <div data-var="config"> <div class="column"> <h1>_("Options on your background:")</h1> <div class="uploadcontainer"><input type="checkbox" data-var="stretch" id="stretch"><label for="stretch">_("Stretch to fill screen.")</label></div> </div> </div> </div> </div> </div> <div data-var="localpanels"> <div data-var="addappsbox" data-ui="joli/modalbox"> <h1 data-var="title">_("Add a Local App")</h1> <div data-var="description"> <div data-ui="joli/combobox" data-var="apps" data-placeholder="_(\'Select an app in the list\')" data-options="alwaysshow:true;"> </div> </div> <ul data-var="buttons" data-ui="joli/chooser" data-options="event: addappsbox; item: joli/button"> <li data-value="cancel">_("Cancel")</li> <li data-value="add">_("Add")</li> </ul> </div> <div data-var="localapps" class="local"> <section data-class="joli.widget" class="joli-navigationbar buttonpanel" data-var="buttonpanel" style="display: block; position: absolute;"> <div class="joli-button back" data-class="joli.button" data-var="back"><a> <span data-var="icon" data-class="joli.widget" class="icon"></span> <span data-var="label" data-class="joli.widget" class="label">_("Back to Dashboard")</span></a></div> <div class="joli-button add" data-class="joli.button" data-var="add"><a><span class="label">_("Add a Local App")</span></a></div> </section> <div class="container"> <div data-var="gallery" class="joli-content-with-navigationbar"> <ul data-var="list" data-item="extra"> <li data-template="extra" data-ui="launcher/dashboard/item" data-class="launcher.settings.extra"></li> </ul> </div> </div> </div> <div data-var="localsettings" class="local"> <section data-class="joli.widget" class="joli-navigationbar buttonpanel" data-var="buttonpanel" style="display: block; position: absolute;"> <div class="joli-button back" data-class="joli.button" data-var="back"><a><span data-var="icon" data-class="joli.widget" class="icon"></span> <span data-var="label" data-class="joli.widget" class="label">_("Back to Dashboard")</span></a></div> </section> <div class="container"> <div data-var="gallery" class="joli-content-with-navigationbar"> <ul data-var="list" data-item="extra"> <li data-template="extra" data-ui="launcher/dashboard/item" data-class="launcher.settings.extra"></li> </ul> </div> </div> </div> </div> <div data-var="stack" data-ui="joli/stackcontainer" > <div data-var="content" id="launcher" class="joli-content"> <p data-var="noresults" data-class="joli.widget" class="noresults">_("There\'s nothing in your Dashboard!") <a data-var="gotodirectory" data-event="directory">_("Add some Apps!")</a></p> <ul data-item="launcher/dashboard/item" data-var="list" class="dashboardp"></ul> <ul data-item="launcher/dashboard/item" data-var="listoffscreen" class="dashboardp"></ul> <div data-options="animate:false;perPage:14;pageRadius:0;target:list;method:joli.cloud.user.getDashboard" data-class="launcher.dashboard.paginator" data-ui="joli/paginator-dots" data-var="pager"></div> </div> </div> <a data-var="settings"><span class="button"></span></a> </div> ';
joli.ui.templates["launcher/directory/directory"] = '<div class="joli-main"> <nav data-var="sidebar" data-ui="joli/sidebar" data-event="categories" data-options="activate: false;"> <section data-value="selection" data-heading="_(\'Selection\')"> <a data-value="featured">_("Featured Apps")</a> <a data-value="picks">_("Friends\u2019 Picks")</a> <a data-value="myapps" class="you">_("My Apps")</a> </section> <section data-value="os" data-heading="Joli OS"> <a data-value="native-apps" class="category">_("Native Apps")</a> <a data-value="add-ons" class="category">_("Add-ons")</a> </section> <section data-value="web" data-heading="_(\'Web Apps\')"></section> <section class="ownappbox"> <div data-event="addownapp" data-var="addownapp" data-ui="joli/button">_("Add New App")</div> </section> </nav> <div data-var="stack" data-ui="joli/stackcontainer"> <div data-var="content" class="joli-content"> <ul data-var="sort" data-ui="joli/tabview" data-event="sort" data-options="activate: false;"> <li data-value="popularity">_("Most Shared")</li> <li data-value="date">_("Most Recent")</li> </ul> <ul data-var="sortfriends" data-ui="joli/tabview" data-event="sort" data-options="activate: false;"> <li data-value="all">_("All Time")</li> <li data-value="month">_("This Month")</li> </ul> <div class="padding-container"> <ul data-var="list" data-item="launcher/element"></ul> <div data-var="pager" data-ui="joli/paginator" data-options="perPage: 12; pageRadius: -1; target: list; method: joli.cloud.apps.index;"></div> </div> </div> </div> <div data-var="addwebappbox" class="joli-modalbox"> <div class="wrapper"> <div data-var="content" class="content"> <div data-var="swap" data-ui="joli/swapcontainer"> <div data-var="step1"> <h1 data-var="title">_("Create a new Web app")</h1> <div data-var="description" class="descform"> <p class="formrow">_("Name"): <input type="text" data-var="name" /></p> <p class="formrow">_("URL"): <input type="text" data-var="url" value="http://"/></p> <p class="formrow example">_("Example"): http://www.website.com</p> </div> <div class="buttons"> <a data-var="cancel" data-event="cancel" data-ui="joli/button">_("Cancel")</a> <a data-var="docontinue" data-event="docontinue" data-ui="joli/button">_("Continue")</a> </div> </div> <div data-var="step2"> <h1 data-var="title">_("Is your Web app listed below?")</h1> <div data-var="description" class="descform"> <p class="formrow noinput">_("Name"): <span data-var="name"></span></p> <p class="formrow noinput">_("URL"): <span data-var="url"></span></p> <ul data-var="list" data-item="launcher/element"></ul> </div> <div class="buttons"> <a data-var="cancel" data-event="cancel" data-ui="joli/button">_("Cancel")</a> <a data-var="back" data-event="back" data-ui="joli/button">_("Back")</a> <a data-var="nocontinue" data-event="nocontinue" data-ui="joli/button">_("No, Continue")</a> </div> </div> <div data-var="step3"> <h1 data-var="title">_("Complete the Web app creation")</h1> <div data-var="description" class="descform"> <p class="formrow noinput">_("Name"): <span data-var="name"></span></p> <p class="formrow noinput">_("URL"): <span data-var="url"></span></p> <p class="formrow">_("Description"): <input type="text" data-var="appdesc" maxlength="75" /></p> <p class="formrow cat">_("Category"): <select data-var="categories" size="5"></select></p> <p class="formrow" data-var="iconuploader">_("Icon"): <input type="file" data-var="icon" /></p> <p class="formrow example" data-var="iconexample">_("Example"): image.png, image.jpg</p> <p data-var="help"></p> </div> <div class="buttons"> <a data-var="cancel" data-event="cancel" data-ui="joli/button">_("Cancel")</a> <a data-var="back" data-event="back" data-ui="joli/button">_("Back")</a> <a data-var="finish" data-event="finish" data-ui="joli/button">_("Finish")</a> </div> </div> <div data-var="step4"> <h1 data-var="title">_("Creation complete!")</h1> <div data-var="description" class="descform"> <ul data-var="list" data-item="launcher/element"></ul> <p class="formrow noinput">_("We just added your new Web app to your Dashboard. If you want to make it public, just share it and your friends will see it!")</p> <p class="formrow noinput">_("Remember you can edit your Web app by going to your Jolicloud settings under the \u201cMy Apps\u201d section.")</p> <p class="formrow noinput">_("Have fun!")</p> </div> <div class="buttons"> <a data-var="close" data-event="close" data-ui="joli/button">_("Close")</a> </div> </div> </div> </div> </div> </div> </div>';
joli.ui.templates["launcher/search/search"] = '<div class="joli-main"> <nav data-var="categories" data-ui="joli/sidebar" data-event="categories" data-options="activate: false;"> <section data-value="jolicloud" data-heading="Jolicloud"> <a data-value="apps">_("Apps")</a> <a data-value="users">_("Users")</a> </section> <section data-value="social" data-heading="_(\'Social Networks\')"> <a data-value="facebook">Facebook</a> <a data-value="twitter">Twitter</a> </section> <section data-value="web" data-heading="_(\'Web\')"> <a data-value="google">Google</a> <a data-value="bing">Bing</a> <a data-value="yahoo">Yahoo</a> </section> </nav> <div data-var="stack" data-ui="joli/stackcontainer" > <div data-var="content" data-ui="joli.swapcontainer" class="joli-content"> <div data-var="apps" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 12; pageRadius: -1; target: list; method: joli.cloud.apps.index;" class="padding-container"></div> <div data-var="users" data-ui="joli/paginglist" data-options="item: launcher/element; perPage: 12; pageRadius: -1; target: list; method: joli.cloud.user.index;" class="padding-container"></div> </div> </div> </div> ';
joli.ui.templates["launcher/search/item"] = '<div> <figure> <span class="inset-light"></span> <img data-var="icon" /> </figure> <div data-var="action" data-ui="joli/button">Action</div> <p class="main"> <span data-var="name"></span> <span data-var="likes"></span> <span data-var="badges"></span> </p> <p data-var="description"></p> </div>';