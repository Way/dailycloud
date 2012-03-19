var joli = window.joli || {};
(function () {
    var a = false,
        b = /\b_super\b/;
    this.Class = function () {};
    this.Class.extend = function (c, d) {
        function e() {
            if (!a && this.init) return this.init.apply(this, arguments) || this
        }
        d && console.log("initClass found");
        var f = this.prototype;
        a = true;
        var g = new this;
        a = false;
        for (var h in c) g[h] = typeof c[h] == "function" && typeof f[h] == "function" && b.test(c[h]) ?
        function (k, j) {
            return function () {
                var l = this._super;
                this._super = f[k];
                var m = j.apply(this, arguments);
                this._super = l;
                return m
            }
        }(h, c[h]) : c[h];
        e.prototype = g;
        e.constructor = e;
        e.extend = arguments.callee;
        e.superClass = this;
        e.initClass = d;
        h = [];
        for (var i = e; i; i = i.superClass) h.push(i);
        for (i = h.length; i--;) h[i].initClass && h[i].initClass(e, g);
        return e
    }
}).call(joli);
joli = window.joli || {};
joli.Namespace = joli.Namespace || joli.Class.extend({
    init: function (a, b, c) {
        var d = this,
            e;
        if (b && b.__call__) {
            d = function () {
                return d.__call__.apply(d, arguments)
            };
            d.__proto__ = joli.Namespace.prototype
        }
        for (e in b || {}) d.declare(e, b[e]);
        c || (window[a] = d);
        d._name = (c ? c._name + "." : "") + a;
        d._parent = c;
        return d
    },
    declare: function (a, b) {
        return this[a] = b
    },
    resolve: function (a) {
        var b = this;
        joli.each(a.split("."), function (c) {
            b = b[c]
        });
        return b
    },
    namespace: function (a, b) {
        return this.declare(a, new joli.Namespace(a, b, this))
    },
    extend: function (a, b, c, d) {
        var e = b.extend ? b : this.resolve(b);
        if (!(e && e.extend)) throw "Could not find class definition: " + b;
        b = this.declare(a, e.extend(c, d));
        b._name = this._name + "." + a;
        b.prototype._className = this._name + "." + a;
        return b
    }
});
(function () {
    new joli.Namespace("joli", {
        Class: joli.Class,
        Namespace: joli.Namespace,
        Boot: joli.Boot,
        config: joli.config,
        version: "dev",
        rootWidget: null,
        components: {},
        expando: "__joli__",
        register: function (b, c) {
            if (this.components[b]) joli.log("The component " + b + " is already registered");
            else this.components[b] = c
        },
        getComponent: function (b) {
            if (this.components[b]) return this.components[b];
            else {
                joli.log("The component " + b + " is unavailable");
                return null
            }
        },
        data: function (b, c, d) {
            var e = b[joli.expando];
            if (arguments.length == 2) {
                if (e) d = e[c]
            } else if (d !== undefined)(e || (b[joli.expando] = {}))[c] = d;
            else e && delete e[c];
            return d
        },
        getData: function (b, c) {
            var d = undefined,
                e = b[joli.expando];
            if (e) d = e[c];
            return d
        },
        setData: function (b, c, d) {
            var e = b[joli.expando];
            e || (b[joli.expando] = e = {});
            return e[c] = d
        },
        removeData: function (b, c) {
            var d = b[joli.expando];
            d && delete d[c]
        },
        nodeFromHtml: function (b) {
            if (b.indexOf("<tr") == 0) {
                var c = document.createElement("table");
                c.innerHTML = b;
                return c.firstChild.tagName == "TBODY" ? c.firstChild.firstChild : c.firstChild
            } else {
                c = document.createElement("div");
                c.innerHTML = b;
                return c.firstChild
            }
        },
        copyAttributes: function (b, c, d) {
            for (var e = 0; e < d.length; ++e) {
                var f = b.getAttribute(d[e]);
                f && c.setAttribute(d[e], f)
            }
        },
        setAttributes: function (b, c) {
            for (key in c) b.setAttribute(key, c[key])
        },
        createElement: function (b, c, d) {
            b = document.createElement(b);
            c && this.setAttributes(b, c);
            if (d) b.innerHTML = d;
            return b
        },
        keys: function (b) {
            var c = [],
                d;
            for (d in b) c.push(d);
            return c
        },
        times: function (b, c, d) {
            for (var e = 0; e < b; ++e) c.call(d, e)
        },
        each: function (b, c, d) {
            for (var e = b.length, f = joli.copyArray(b), g = true, h = 0; h < e; ++h) if (c.call(d, f[h], h, b) === false) {
                g = false;
                break
            }
            return g
        },
        defProperty: function (b, c, d, e) {
            d && b.__defineGetter__(c, d);
            e && b.__defineSetter__(c, e)
        },
        defBoxProperty: function (b, c, d, e) {
            var f = c + "BoxProperty",
                g = function (k) {
                    joli.setData(this, f, k)
                },
                h, i;
            if (d) h = function () {
                return d.call(this, joli.getData(this, f))
            };
            if (e) i = function (k) {
                var j = joli.getData(this, f);
                return e.call(this, joli.bind(g, this), k, j)
            };
            joli.defProperty(b, c, h, i)
        },
        bind: function (b, c) {
            var d = joli.toArray(arguments);
            if (joli.isFunction(b)) {
                joli.assert(!b.fn, "double bind");
                d.splice(0, 2);
                var e = function () {
                        var g = d.concat(joli.toArray(arguments));
                        return b.apply(c, g)
                    };
                e.fn = b
            } else {
                e = {};
                for (var f in b) {
                    d[0] = b[f];
                    e[f] = joli.bind.apply(null, d)
                }
            }
            return e
        },
        wrap: function (b, c, d, e) {
            if (joli.isString(c)) {
                var f = b[c];
                b[c] = joli.bind(d, e, function (h) {
                    h = joli.toArray(h);
                    h.shift();
                    return f && f.apply(null, h)
                });
                joli.assert(b[c], "weird")
            } else {
                var g = c;
                e = d;
                d = null;
                for (c in g) joli.wrap(b, c, g[c], e)
            }
        },
        contains: function (b, c) {
            for (var d = b.length; d--;) if (b[d] === c) return true;
            return false
        },
        remove: function (b, c) {
            for (var d = 0, e = false; d < b.length;) if (b[d] === c) {
                b.splice(d, 1);
                e = true
            } else d++;
            return e
        },
        last: function (b) {
            return b[b.length - 1]
        },
        first: function (b) {
            for (var c in b) break;
            return c
        },
        indexOf: function (b, c) {
            for (var d = b.length; d--;) if (b[d] === c) return d;
            return -1
        },
        insert: function (b, c, d) {
            d = joli.indexOf(b, d);
            joli.assert(d >= 0, "Illegal insert. Could not find reference value in array.");
            b.splice(d, 0, c);
            return b
        },
        copyArray: function (b) {
            for (var c = [], d = b.length, e = 0; e < d; ++e) c.push(b[e]);
            return c
        },
        arrayToObject: function (b) {
            var c = {};
            joli.each(b, function (d) {
                c[d] = d
            });
            return c
        },
        eachQuery: function (b, c, d, e) {
            joli.each(b.querySelectorAll(c), d, e)
        },
        delegateProperty: function (b, c, d, e) {
            e = e || d;
            joli.defProperty(b, d, function () {
                return this[c][e]
            }, function (f) {
                return this[c][e] = f
            })
        },
        delegateProperties: function (b, c, d) {
            if (joli.isArray(d)) d = joli.arrayToObject(d);
            for (var e in d) this.delegateProperty(b, c, e, d[e])
        },
        delegateMethod: function (b, c, d, e) {
            e = e || d;
            b[d] = function () {
                var f = this[c],
                    g = f[e].apply(f, arguments);
                return g === f ? this : g
            }
        },
        delegateMethods: function (b, c, d) {
            if (joli.isArray(d)) d = joli.arrayToObject(d);
            for (var e in d) this.delegateMethod(b, c, e, d[e])
        },
        isArray: function (b) {
            return Object.prototype.toString.call(b) === "[object Array]"
        },
        isEmpty: function (b) {
            val = false;
            if (joli.isString(b)) val = b.replace(/\s/g, "").length == 0;
            else if (joli.isArray(b)) val = b.length == 0;
            else if (b === undefined || b === null) val = true;
            else if (b.constructor === Object) {
                val = true;
                for (var c in b) if (b.hasOwnProperty(c) && b[c] !== undefined) {
                    val = false;
                    break
                }
            }
            return val
        },
        isString: function (b) {
            return typeof b === "string" || b instanceof String
        },
        isFunction: function (b) {
            return typeof b === "function"
        },
        toArray: function (b) {
            var c = [];
            joli.each(b, function (d) {
                c.push(d)
            });
            return c
        },
        trim: function (b) {
            return b.replace(/^\s+|\s+$/g, "")
        },
        escapeRegexp: function (b) {
            var c = arguments.callee;
            if (!c.sRE) c.sRE = RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\)", "g");
            return b.replace(c.sRE, "\\$1")
        },
        map: function (b, c, d) {
            var e = [];
            joli.each(b, function (f) {
                e.push(c.call(d, f))
            });
            return e
        },
        filter: function (b, c) {
            var d = [];
            joli.each(b, function (e) {
                c(e) && d.push(e)
            });
            return d
        },
        some: function (b, c) {
            var d = false;
            joli.each(b, function (e) {
                if (d = c(e)) return false
            });
            return d
        },
        all: function (b, c) {
            return joli.none(b, joli.negate(c))
        },
        none: function (b, c) {
            return !joli.some(b, c)
        },
        negate: function (b) {
            return function () {
                return !b.apply(arguments)
            }
        },
        local: function (b, c) {
            if (arguments.length == 1) return localStorage[b];
            else if (c === undefined) {
                delete localStorage[b];
                return c
            } else try {
                return localStorage[b] = c
            } catch (d) {
                if (d.code == 22) {
                    regexp = /^http((?!_meta).)*$/;
                    var e = [],
                        f;
                    for (f in localStorage) if (regexp.test(f)) {
                        var g = JSON.parse(localStorage.getItem(f + "_meta")).timestamp;
                        f.indexOf("api/dashboard") < 0 && f.indexOf("api/users/show?type=myself") < 0 && f.indexOf("api/computers") < 0 && f.indexOf("api/users/badges") < 0 && e.push({
                            key: f,
                            date: g
                        })
                    }
                    e.sort(function (i, k) {
                        if (i.date < k.date) return -1;
                        if (i.date > k.date) return 1;
                        return 0
                    });
                    for (f = 0; f < parseInt(e.length / 2, 10); f++) {
                        localStorage.removeItem(e[f].key);
                        localStorage.removeItem(e[f].key + "_meta")
                    }
                    try {
                        return localStorage[b] = c
                    } catch (h) {
                        console.log("localStorage error", h);
                        console.log("trying to register", b)
                    }
                } else {
                    console.log("localStorage error", d);
                    console.log("trying to register", b)
                }
            }
        },
        localJson: function (b, c) {
            if (arguments.length == 1) {
                if (c = joli.local(b)) c = JSON.parse(c);
                return c
            } else {
                if (c) c = JSON.stringify(c);
                joli.local(b, c)
            }
        },
        localKey: function (b, c) {
            var d = b;
            if (c && !joli.isEmpty(c)) {
                d += "?";
                joli.each(joli.keys(c).sort(), function (e) {
                    if (e != "user_session") d += e + "=" + c[e] + "&"
                })
            }
            if (d.indexOf("?") == d.length - 1) d = d.slice(0, d.length - 1);
            return d
        },
        loadLocal: function (b, c, d) {
            b = joli.localKey(b, c);
            c = joli.localJson(b + "_meta");
            var e = undefined;
            if (c) if (joli.now() - c.timestamp < d * 1E3 || joli.localJson("dirtyDashboard")) e = joli.local(b);
            return e
        },
        saveLocal: function (b, c, d) {
            if (d === undefined) throw "Tried to save empty data";
            d = joli.isString(d) ? d : JSON.stringify(d);
            b = joli.localKey(b, c);
            joli.local(b, d);
            joli.localJson(b + "_meta", {
                timestamp: joli.now()
            })
        },
        clearLocal: function (b, c) {
            var d = joli.localKey(b, c);
            localStorage.removeItem(d);
            localStorage.removeItem(d + "_meta");
            console.log("Cleared local key " + d)
        },
        clearLocalRegExp: function (b) {
            b = RegExp(b);
            for (var c in localStorage) if (b.test(c)) {
                localStorage.removeItem(c);
                console.log("Cleared local key " + c)
            }
        },
        isCacheable: function (b) {
            return b.ttl && b.method.toUpperCase() === "GET"
        },
        request: function (b, c) {
            function d() {
                f.apply(e.context, arguments)
            }
            var e = jQuery.extend({
                ttl: 0,
                success: joli.doNothing,
                complete: joli.doNothing,
                method: "GET"
            }, c),
                f = e.success,
                g = e.complete,
                h;
            if (joli.isCacheable(e)) h = joli.loadLocal(b, e.data, e.ttl);
            if (h) {
                d(h);
                g()
            } else {
                e.success = function (i, k, j) {
                    e.ttl && joli.saveLocal(b, e.data, i);
                    d(i, k, j)
                };
                e.url = b;
                g = jQuery.ajax(e);
                joli.assert(g, "No xhr returned!");
                return g
            }
        },
        requestJson: function (b, c) {
            function d() {
                f.apply(e.context, arguments)
            }
            var e = jQuery.extend({
                ttl: 0,
                success: joli.doNothing,
                method: "GET"
            }, c),
                f = e.success,
                g = e.complete,
                h;
            if (joli.isCacheable(e)) h = joli.loadLocal(b, e.data, e.ttl);
            if (h) {
                h = joli.isString(h) ? JSON.parse(h) : h;
                joli.data(h, "cache", true);
                d(h);
                g()
            } else {
                e.success = function (i, k, j) {
                    e.ttl && joli.saveLocal(b, e.data, i);
                    i = joli.isString(i) ? JSON.parse(i) : i;
                    joli.data(i, "cache", false);
                    d(i, k, j)
                };
                e.url = b;
                g = jQuery.ajax(e);
                joli.assert(g, "No xhr returned!");
                return g
            }
        },
        now: function () {
            return +new Date
        },
        assert: function (b, c) {
            if (!b) throw c;
        },
        relativeTime: function (b) {
            var c;
            c = parseInt(b, 10) != NaN ? new Date(b) : Date.parse(b);
            c = parseInt(((arguments.length > 1 ? arguments[1] : new Date).getTime() - c) / 1E3, 10);
            return c < 60 ? _("less than a minute ago") : c < 120 ? _("about a minute ago") : c < 2700 ? _("%{n} minutes ago").replace("%{n}", parseInt(c / 60, 10).toString()) : c < 5400 ? _("about an hour ago") : c < 86400 ? _("about %{n} hours ago").replace("%{n}", parseInt(c / 3600, 10).toString()) : c < 172800 ? _("1 day ago") : _("%{n} days ago").replace("%{n}", parseInt(c / 86400, 10).toString())
        },
        relativeDay: function (b) {
            var c;
            c = parseInt(b, 10) != NaN ? new Date(b) : Date.parse(b);
            c = parseInt(((arguments.length > 1 ? arguments[1] : new Date).getTime() - c) / 1E3, 10);
            return c < 86400 ? _("today") : c < 172800 ? _("yesterday") : _("%{n} days ago").replace("%{n}", parseInt(c / 86400, 10).toString())
        },
        convertForTimeElement: function (b) {
            b = parseInt(b, 10) != NaN ? new Date(b) : Date.parse(b);
            var c = b.getMonth() + 1;
            if (c < 10) c = "0" + c;
            return b.getFullYear() + "-" + c + "-" + b.getDate()
        },
        AbstractMethodError: "joli.AbstractMethodError",
        doNothing: function () {},
        callOrNone: function (b) {
            return b && b()
        },
        containsClass: function (b, c) {
            if (!b || !b.className) return false;
            return b.className.match(RegExp("(^|\\s)" + c + "(\\s|$)"))
        },
        addClass: function (b, c) {
            if (!b) return false;
            this.containsClass(b, c) || (b.className += (b.className ? " " : "") + c)
        },
        removeClass: function (b, c) {
            if (!b || !b.className) return false;
            b.className = b.className.replace(RegExp("(^|\\s)" + c + "(\\s|$)", "g"), "$2")
        },
        toggleClass: function (b, c) {
            this.containsClass(b, c) ? this.removeClass(b, c) : this.addClass(b, c)
        },
        getPlatform: function () {
            var b = "web";
            if (navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf("jolicloud") != -1) b = "jolicloud";
            else if (window.chrome && chrome.app && chrome.app.isInstalled) b = "chrome";
            return b
        },
        RGBtoHex: function (b, c, d) {
            return this.toHex(b) + this.toHex(c) + this.toHex(d)
        },
        toHex: function (b) {
            if (b == null) return "00";
            b = parseInt(b);
            if (b == 0 || isNaN(b)) return "00";
            b = Math.max(0, b);
            b = Math.min(b, 255);
            b = Math.round(b);
            return "0123456789ABCDEF".charAt((b - b % 16) / 16) + "0123456789ABCDEF".charAt(b % 16)
        },
        getFilesReadableSize: function (b) {
            var c = b / 1024,
                d = c / 1024,
                e = d / 1024;
            b = "";
            var f = 0;
            if (e >= 1) {
                f = parseFloat(e).toFixed(1);
                b = _("GB")
            } else if (d >= 1) {
                f = parseFloat(d).toFixed(1);
                b = _("MB")
            } else {
                f = c >= 1 ? parseFloat(c).toFixed(1) : parseFloat(c).toFixed(2);
                b = _("KB")
            }
            c = f + "";
            if (c.indexOf(".0") == c.length - 2) c = c.replace(".0", "");
            if (c == "0.00") c = "0";
            return c + " " + b
        },
        getFilesReadableDate: function (b) {
            b = new Date(b);
            var c = b.getDate(),
                d = b.getMonth() + 1;
            return (c < 10 ? "0" + c : c) + "." + (d < 10 ? "0" + d : d) + "." + b.getFullYear()
        },
        getFileAttribute: function (b, c, d) {
            if (b.mapper && typeof b.mapper[c] !== "undefined") return b[b.mapper[c]];
            else if (d && typeof d[c] !== "undefined") return b[d[c]];
            else if (typeof b[c] !== "undefined") return b[c]
        },
        versionCompare: function (b, c) {
            c = "" + c;
            var d = function (e) {
                    e = /(\d+)\.?(\d+)?\.?(\d+)?\.?(\d+)?\.?(\d+)?/.exec(e);
                    return {
                        major: parseInt(e[1]) || 0,
                        minor: parseInt(e[2]) || 0,
                        patch: parseInt(e[3]) || 0,
                        andy: parseInt(e[4]) || 0,
                        madness: parseInt(e[5]) || 0
                    }
                };
            b = d("" + b);
            c = d(c);
            return b.major != c.major ? c.major > b.major : b.minor != c.minor ? c.minor > b.minor : b.patch != c.patch ? c.patch > b.patch : b.andy != c.andy ? c.andy > b.andy : b.madness != c.madness ? c.madness > b.madness : true
        },
        browser: function () {
            function b(e) {
                for (var f = 0; f < e.length; f++) {
                    var g = e[f].string,
                        h = e[f].prop;
                    versionSearchString = e[f].versionSearch || e[f].identity;
                    if (g) {
                        if (g.indexOf(e[f].subString) != -1) return e[f].identity
                    } else if (h) return e[f].identity
                }
            }
            var c = [{
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            }, {
                string: navigator.userAgent,
                subString: "iPad",
                identity: "iPad"
            }, {
                string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            }, {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            }, {
                prop: window.opera,
                identity: "Opera"
            }, {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            }, {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            }, {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            }, {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            }, {
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            }, {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            }, {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            }, {
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }],
                d = [{
                    string: navigator.platform,
                    subString: "Win",
                    identity: "Windows"
                }, {
                    string: navigator.platform,
                    subString: "Mac",
                    identity: "Mac"
                }, {
                    string: navigator.userAgent,
                    subString: "iPhone",
                    identity: "iPhone/iPod"
                }, {
                    string: navigator.platform,
                    subString: "Linux",
                    identity: "Linux"
                }];
            return function () {
                var e = {};
                e.browser = b(c) || "An unknown browser";
                var f;
                f = navigator.userAgent;
                var g = f.indexOf(versionSearchString);
                f = g == -1 ? void 0 : parseFloat(f.substring(g + versionSearchString.length + 1));
                e.version = f || "an unknown version";
                e.OS = b(d) || "an unknown OS";
                f = e.browser;
                g = "";
                if (f == "Chrome") f = "Chrome or Chromium";
                else g = " We're sorry but Jolicloud is not fully supported in this browser. Don't panic! We're working on it.";
                e.description = "You're using " + f + " " + e.version + " on " + e.OS + ".";
                if (g != "") e.description += g;
                return e
            }()
        },
        refreshDisabled: joli.config.disableRefresh
    });
    jQuery.isFunction = joli.isFunction;
    joli.userSession = function (b) {
        var c = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");
        b || (b = Math.floor(Math.random() * c.length));
        for (var d = "", e = 0; e < b; e++) d += c[Math.floor(Math.random() * c.length)];
        return d
    }(20);
    document.addEventListener("keydown", function (b) {
        if (joli.refreshDisabled) {
            if (!b) b = window.event;
            var c = b.keyCode;
            if (b.which) c = b.which;
            if (116 == c || 82 === c && b.ctrlKey) {
                if (b.preventDefault) {
                    b.preventDefault();
                    b.stopPropagation()
                }
                return false
            }
        }
    }, false);
    if (!joli.config.debug) {
        if (typeof window.console == "undefined") window.console = {};
        window.console._log = window.console.log;
        window.console.log = joli.doNothing;
        window.console.debug = joli.doNothing
    }
    var a = document.cookie.substr(document.cookie.indexOf("lang=")).substr(5);
    if (a.indexOf(";") > -1) a = a.substr(0, a.indexOf(";"));
    joli.lang = a;
    window._ = function (b) {
        return typeof launcher.locale[joli.lang] != "undefined" ? launcher.locale[joli.lang][b] || b : b
    }
})();
joli.extend("Obj", joli.Class, {
    init: function (a) {
        a && this.setOptions(a);
        this.onInit();
        this.__hash__ = this.__nextHash__++
    },
    __nextHash__: 0,
    onInit: function () {},
    options: {},
    setOptions: function (a) {
        this.options = jQuery.extend({}, this.options, a || {});
        this.onOptionsChanged(this.options)
    },
    setOption: function (a, b) {
        this.options[a] = b;
        this.onOptionsChanged(this.options, a)
    },
    onOptionsChanged: function () {},
    bindMethod: function (a) {
        this[a] = joli.bind(this[a], this)
    },
    __get__bindings: function () {
        if (!this.hasOwnProperty("_bindings")) this._bindings = {};
        return this._bindings
    },
    bind: function (a, b, c) {
        if (joli.isString(a)) {
            if (c) b = joli.bind(b, c);
            (this.bindings[a] || (this.bindings[a] = [])).push(b)
        } else {
            var d = a;
            c = b;
            for (a in d) this.bind(a, d[a], c)
        }
    },
    unbind: function (a, b) {
        if (b) joli.remove(this.bindings[a], b);
        else delete this.bindings[a]
    },
    trigger: function (a, b) {
        var c = [joli.isString(a) ? {
            type: a,
            target: this
        } : a].concat(b);
        joli.each(this.bindings[a] || [], function (d) {
            d.apply(null, c)
        })
    }
}, function (a, b) {
    for (var c in b) b.hasOwnProperty(c) && !b.__lookupGetter__(c) && typeof b[c] === "function" &&
    function (e, f) {
        if (!f.bind) f.bind = function () {
            var i = joli.toArray(arguments);
            i.unshift(f);
            return joli.bind.apply(null, i)
        };
        var g = !e.indexOf("__get__") ? "Getter" : !e.indexOf("__set__") ? "Setter" : "ordinary";
        if (g !== "ordinary") {
            var h = e.substring(7);
            b["__define" + g + "__"](h, f);
            delete b[e]
        }
    }(c, b[c]);
    if (b.hasOwnProperty("options")) b.options.__proto__ = a.superClass.prototype.options;
    if (b.hasOwnProperty("triggers")) for (var d in b.triggers) {
        b["trigger_" + d] = b["trigger_" + d] || b.triggers[d] ||
        function (e) {
            return function () {
                var f = joli.toArray(arguments);
                f.unshift(e);
                this.trigger.apply(this, f)
            }
        }(d);
        b["bind_" + d] = b["bind_" + d] ||
        function (e) {
            return function () {
                var f = joli.toArray(arguments);
                f.unshift(e);
                this.bind.apply(this, f)
            }
        }(d)
    }
});
joli.extend("Elem", joli.Obj, {
    init: function (a) {
        this._element = a
    },
    hoverClass: function (a) {
        var b = this;
        this.$.hover(function () {
            b.addClass(a)
        }, function () {
            b.removeClass(a)
        })
    },
    bind: function () {
        function a(g) {
            joli.assert(g, "Function undefined");
            return function () {
                var h = arguments[0];
                h.target = joli.ui(h.target);
                h.sender = c;
                g.apply(b, arguments)
            }
        }
        var b, c = this,
            d = arguments;
        if (joli.isString(d[0])) {
            var e = joli.isFunction(d[1]) ? 1 : 2;
            b = d[e + 1];
            d[e] = a(d[e]);
            return this.$.bind.apply(this.$, d)
        } else {
            b = d[1];
            d = d[0];
            var f = {};
            for (e in d) f[e] = a(d[e]);
            return this.$.bind(f)
        }
    },
    trigger: function (a, b) {
        var c = joli.isString(a),
            d = jQuery.Event(c ? a : a.type);
        if (!c) for (var e in a) d[e] = a[e];
        this.$.trigger(d, b);
        return d
    },
    click: function (a, b) {
        this.$.click(joli.bind(a, b, this))
    },
    __get__$: function () {
        return jQuery(this._element)
    }
});
joli.delegateProperties(joli.Elem.prototype, "_element", {
    innerHTML: "innerHTML",
    outerHTML: "outerHTML",
    style: "style",
    text: "textContent",
    innerText: "innerText"
});
joli.delegateMethods(joli.Elem.prototype, "_element", {
    getAttr: "getAttribute",
    setAttr: "setAttribute",
    removeAttr: "removeAttribute"
});
joli.delegateMethods(joli.Elem.prototype, "$", ["blur", "focus", "val", "find", "attr", "addClass", "removeClass", "hasClass", "removeClass", "width", "height", "outerWidth", "remove", "outerHeight", "offset", "position", "css", "show", "hide", "unbind", "animate"]);
(function () {
    joli.namespace("ui", {
        root: null,
        noTemplate: "__none__",
        templates: {},
        template: function (a) {
            return this.templates[a]
        },
        classRegistry: {},
        init: function () {
            function a(c, d) {
                var e, f;
                for (f in c) if (f != "constructor" && f != "_parent" && (e = c[f])) {
                    var g = d + "." + f.toLowerCase();
                    if (e === joli.ui.Widget || e.prototype instanceof joli.ui.Widget) joli.ui.classRegistry[g] = e;
                    else e instanceof joli.Namespace && a(e, g)
                }
            }
            this.initTemplates();
            joli.each(joli.config.modules, function (c) {
                window[c] && window[c].ui && a(window[c].ui, c)
            }, this);
            var b = document.body.querySelector(joli.config.rootSelector);
            b.getAttribute("data-ui") || b.setAttribute("data-ui", joli.config.rootTemplate);
            this.root = this.fromNode(b);
            this.root.attachedToDom()
        },
        parseGettext: function (a) {
            a = a.split(/(_\(["'].*?["']\))/g);
            for (var b = 0; b < a.length; b++) if (a[b].indexOf("_") == 0) a[b] = _(a[b].substr(3, a[b].length - 5));
            return a.join("")
        },
        initTemplates: function () {
            var a = {};
            for (key in this.templates) {
                var b = joli.nodeFromHtml(this.parseGettext(this.templates[key]));
                b.setAttribute("data-template", key);
                var c = b.querySelectorAll("[data-template]");
                joli.each(c, function (d) {
                    jQuery(d).remove()
                });
                joli.each(c, function (d) {
                    var e = key + "/" + d.getAttribute("data-template");
                    d.setAttribute("data-template", e);
                    a[e] = d.outerHTML ||
                    function (f) {
                        var g = document.createElement("div");
                        g.appendChild(f.cloneNode(true));
                        return g.innerHTML
                    }(d)
                }, this);
                a[key] = b.outerHTML ||
                function (d) {
                    var e = document.createElement("div");
                    e.appendChild(d.cloneNode(true));
                    return e.innerHTML
                }(b)
            }
            this.templates = a
        },
        cloneTemplate: function (a, b, c) {
            var d = joli.ui.templates[a];
            if (!d) {
                d = a.split("/");
                d.push(d[d.length - 1]);
                d = d.join("/");
                d = joli.ui.templates[d]
            }
            var e;
            if (d) {
                e = joli.nodeFromHtml(d);
                d = ["DIV", "SPAN"];
                b = b && joli.contains(d, e.tagName) ? b : e.tagName;
                var f = document.createElement(b);
                joli.each(e.attributes, function (g) {
                    f.setAttribute(g.nodeName, g.nodeValue)
                });
                if (e.innerHTML.length) f.innerHTML = e.innerHTML;
                e = f;
                b = e.getAttribute("class");
                c = c || e.getAttribute("data-css") || a.replace(/\//g, "-");
                e.setAttribute("class", (b ? b + " " : "") + c)
            } else a && !/container/.test(a) && console.log("WARNING: Template not found: " + a);
            return e
        },
        widgify: function (a, b) {
            var c = joli.getData(a, "widget");
            if (!c) {
                c = this.getChildren(a);
                var d = this.lookupClass(a.getAttribute("data-class"));
                if (!d) {
                    d = joli.ui.Widget;
                    a.setAttribute("data-class", "joli.widget")
                }
                c = new d(a, c, b)
            }
            return c
        },
        getChildren: function (a) {
            var b = {},
                c = 0;
            joli.eachQuery(a, "[data-ui], [data-class], [data-var]", function (d) {
                if (d.parentNode) {
                    varwidget = this.fromNode(d);
                    if (!varwidget.parent) {
                        d = d.getAttribute("data-var") || "_anonymous" + c++;
                        b[d] = varwidget
                    }
                }
            }, this);
            return b
        },
        getClassAliasForTemplate: function (a) {
            var b = a ? null : "joli.widget";
            if (!b) {
                a = a.split("/");
                b = a.length - 1;
                var c = a[b].indexOf("-");
                if (c > 0) a[b] = a[b].substring(0, c);
                b = a.join(".")
            }
            return b
        },
        lookupClass: function (a) {
            var b = this.classRegistry[a || "joli.widget"];
            b || console.log("WARNING: Class not found: " + a);
            return b
        },
        getClassAlias: function (a) {
            return a._name.toLowerCase().replace(".ui.", ".")
        },
        fromNode: function (a) {
            var b, c = a.getAttribute("data-ui");
            if (!c) {
                if (b = joli.getData(a, "widget")) return b;
                b = a.getAttribute("data-class") || {
                    A: "joli.clickable",
                    IMG: "joli.image",
                    UL: "joli.list"
                }[a.tagName] || "joli.widget";
                a.setAttribute("data-class", b)
            }
            b = b || a.getAttribute("data-class");
            var d = a.getAttribute("data-css");
            return b = this(c, a, b, d)
        },
        optionsFromString: function (a) {
            var b, c = ["ui", "value", "var", "class", "css"];
            if (a) {
                b = {};
                a = a.split(";");
                joli.each(a, function (d) {
                    if (!joli.isEmpty(d)) {
                        var e = d.split(":");
                        d = e[0].replace(/\s/g, "");
                        joli.assert(!joli.contains(c, d), "Protected option: " + d);
                        e = e[1].replace(/^\s*/, "").replace(/\s*$/, "");
                        e = e.length && isFinite(+e) ? +e : e;
                        b[d] = e === "false" ? false : e === "true" ? true : e
                    }
                })
            }
            return b
        },
        optionsToString: function (a) {
            var b;
            if (a) {
                b = "";
                for (var c in a) b += c + ":" + a[c] + ";"
            }
            return b
        },
        propagateAttributes: function (a, b) {
            joli.copyAttributes(a, b, ["id", "placeholder", "draggable"]);
            joli.each(a.attributes, function (e) {
                e = e.nodeName;
                e.indexOf("data-") == 0 && e != "data-ui" && b.setAttribute(e, a.getAttribute(e))
            });
            jQuery(b).addClass(a.getAttribute("class"));
            var c = this.optionsFromString(a.getAttribute("data-options")),
                d = this.optionsFromString(b.getAttribute("data-options"));
            c = jQuery.extend({}, d, c);
            joli.isEmpty(c) || b.setAttribute("data-options", this.optionsToString(c));
            a.parentNode && a.parentNode.replaceChild(b, a)
        },
        __call__: function (a, b, c, d) {
            if (a instanceof joli.ui.Widget) return a;
            if (a instanceof HTMLElement) return joli.ui.Widget.of(a);
            var e = a && this.cloneTemplate(a, b && b.tagName, d);
            a = e ? e.getAttribute("data-template") : a;
            if (e) {
                if (e.getAttribute("data-ui")) {
                    if (b instanceof HTMLElement) {
                        joli.each(b.childNodes, function (g) {
                            e.appendChild(g)
                        });
                        this.propagateAttributes(b, e)
                    } else {
                        if (b.text) {
                            e.textContent = b.text;
                            delete b.text
                        }
                        for (var f in b) e.setAttribute("data-" + f, b[f])
                    }
                    return this.fromNode(e)
                }
            } else {
                e = b;
                e.removeAttribute("data-ui")
            }
            if (c) e.setAttribute("data-class", c);
            else e.getAttribute("data-class") || e.setAttribute("data-class", this.getClassAliasForTemplate(a));
            b instanceof HTMLElement && this.propagateAttributes(b, e);
            return this.widgify(e, b)
        },
        createCssAccessor: function (a, b, c, d, e) {
            c = c || b;
            joli.defProperty(a.prototype, b, function () {
                targ = e ? this[e] : this;
                return d ? !this.hasClass(c) : this.hasClass(c)
            }, function (f) {
                targ = e ? this[e] : this;
                if (d) targ[f ? "removeClass" : "addClass"](c);
                else targ[f ? "addClass" : "removeClass"](c)
            });
            a.prototype["toggle" + b.substring(0, 1).toUpperCase() + b.substring(1)] = function () {
                this[b] = !this[b]
            }
        },
        createAttributeAccessor: function (a, b, c, d) {
            c = c || b;
            joli.defProperty(a.prototype, b, function () {
                return (d ? this[d] : this).getAttr(c)
            }, function (e) {
                (d ? this[d] : this).setAttr(c, e)
            })
        }
    });
    joli.Boot.onComplete = joli.bind(joli.ui.init, joli.ui)
})();
joli.ui.extend("Widget", joli.Elem, {
    init: function (a, b, c) {
        this._super(a);
        this._template = a.getAttribute("data-template");
        this._varname = this.parent = undefined;
        this._listeners = {};
        this.children = [];
        for (var d in b || {}) this.registerChild(b[d], d);
        this.initWidget();
        this.events = joli.bind(this.events, this);
        for (var e in this.events) this.bind(e, this.events[e]);
        this.options = jQuery.extend({}, this.options);
        joli.ui.templatesOptionsCache = joli.ui.templatesOptionsCache || {};
        d = a.outerHTML ||
        function (f) {
            var g = document.createElement("div");
            g.appendChild(f.cloneNode(true));
            return g.innerHTML
        }(a);
        if (d.indexOf("joli/sectionchooser") == -1 && joli.ui.templatesOptionsCache[d]) b = joli.ui.templatesOptionsCache[d];
        else {
            b = this.parseOptions(a);
            joli.ui.templatesOptionsCache[d] = b
        }
        if (c instanceof HTMLElement) {
            d = c.outerHTML ||
            function (f) {
                var g = document.createElement("div");
                g.appendChild(f.cloneNode(true));
                return g.innerHTML
            }(c);
            if (d.indexOf("joli/tabview") == -1 && joli.ui.templatesOptionsCache[d]) c = joli.ui.templatesOptionsCache[d];
            else {
                c = this.parseOptions(c, true);
                joli.ui.templatesOptionsCache[d] = c
            }
        }
        this.setOptions(jQuery.extend(b, c));
        joli.setData(a, "widget", this)
    },
    initWidget: function () {},
    setModel: function (a) {
        this.modelListener = this.modelListener || joli.bind(function () {
            this.onModelChanged(this.model)
        }, this);
        this.model && this.model.unbind && this.model.unbind("change", this.modelListener);
        if (this.model = a) this.onModelChanged(a);
        this.model && this.model.bind && this.model.bind_change(this.modelListener)
    },
    onModelChanged: function () {},
    onProtoChildren: function (a) {
        joli.each(a, function (b) {
            var c = joli.ui.fromNode(b),
                d = b.getAttribute("data-var");
            if (d) if (this[d]) this.replaceChild(d, c);
            else {
                this.$.append(b);
                this.registerChild(c, d)
            }
        }, this)
    },
    parseOptions: function (a, b) {
        var c = {};
        joli.each(a.attributes, function (e) {
            var f = e.nodeName;
            if (f.indexOf("data-") == 0) {
                f = f.substring(5);
                if (!joli.contains(["var", "ui", "options", "css", "class"], f)) c[f] = e.nodeValue
            }
        });
        var d = joli.ui.optionsFromString(a.getAttribute("data-options"));
        jQuery.extend(c, d);
        if (b && this._template && a.children.length) this.onProtoChildren(a.children, c);
        else c.text = a.textContent || a.innerText;
        return c
    },
    registerChild: function (a, b) {
        joli.assert(!this[b], "Property " + b + " already exists on class Widget.");
        this[b] = a;
        this.children.push(a);
        (function (c, d, e) {
            c.addClass(e);
            c.parent = d;
            if (e) {
                c._varname = e;
                c._varpath = d._varpath + "." + e;
                c.walkDecendants(function (f) {
                    f._varpath = f.parent._varpath + "." + f._varname
                })
            }
        })(a, this, b)
    },
    attachedToDom: function () {
        joli.each(this.children, function (a) {
            a.attachedToDom()
        }, this);
        this.attached = true;
        this.onAttached()
    },
    onAttached: function () {},
    replaceChild: function (a, b) {
        var c = this[a];
        if (c != b) {
            joli.remove(this.children, c);
            c._element.parentNode.replaceChild(b._element, c._element);
            b._element.setAttribute("data-var", a);
            b.addClass(c.getAttr("class"));
            delete this[a];
            this.registerChild(b, a)
        }
    },
    removeChild: function (a) {
        var b = this[a];
        b.remove();
        joli.remove(this.children, b);
        delete this[a]
    },
    toString: function () {
        return "[widget:/" + this._varpath + "]"
    },
    walkDecendants: function (a) {
        joli.each(this.children, function (b) {
            a(b);
            b.walkDecendants(a)
        })
    },
    walkAncestors: function (a) {
        for (var b = this.parent; b; b = b.parent) a(b)
    },
    events: {},
    subTemplate: function (a, b) {
        return joli.ui(this._template + "/" + a, b)
    },
    makeDraggable: function () {
        this.$.attr("draggable", "true")
    },
    __get__hasFocus: function () {
        return this.hasClass("hover")
    },
    __set__hasFocus: function (a) {
        this[a ? "addClass" : "removeClass"]("hover");
        this[a ? "focus" : "blur"]()
    }
});
joli.defBoxProperty(joli.ui.Widget.prototype, "_varpath", function (a) {
    return a || ""
}, function (a, b) {
    a(b)
});
joli.defProperty(joli.ui.Widget.prototype, "application", function () {
    return joli.Application
});
joli.ui.createCssAccessor(joli.ui.Widget, "enabled", "disabled", true);
joli.ui.createCssAccessor(joli.ui.Widget, "active");
joli.ui.Widget.of = function (a) {
    var b;
    if (a instanceof joli.ui.Widget) b = a;
    return b || joli.getData(a, "widget")
};
joli.ui.extend("Clickable", "Widget", {
    initWidget: function () {
        this.click(this.notifyClick, this)
    },
    notifyClick: function () {
        if (this.enabled) if (this.active) this.options && this.options.event && this.trigger(this.options.event + "_reclick");
        else this.options && this.options.event && this.trigger(this.options.event)
    },
    click: function (a, b) {
        var c = this;
        this.$.click(function () {
            c.enabled && a.call(b, c);
            return false
        })
    }
});
joli.ui.extend("List", "Widget", {
    options: {
        item: null,
        childtag: null
    },
    initWidget: function () {
        this.items = [];
        this.bindMethod("addItem")
    },
    onProtoChildren: function (a) {
        this.itemProtos = joli.copyArray(a)
    },
    onProtoChildrenImpl: function () {
        joli.each(this.itemProtos, this.addItem)
    },
    onOptionsChanged: function (a) {
        this._super(a);
        this.container = this.container || this[a.container] || this;
        this.options.childtag = this.options.childtag || this.getChildTag();
        a.items = a.items || []
    },
    getChildTag: function () {
        return {
            UL: "LI",
            OL: "LI",
            TABLE: "TR",
            TBODY: "TR"
        }[this.container._element.tagName]
    },
    onAttached: function () {
        this._super();
        this.resolveItem();
        var a = this.options.items;
        if (a && a.length) joli.each(a, this.addItem);
        else if (this.itemProtos && this.options.item) {
            this.onProtoChildrenImpl(this.itemProtos);
            delete this.itemProtos
        }
    },
    resolveItem: function () {
        var a = [];
        if (this.options.item && !joli.ui.template(this.options.item)) for (var b = this; b; b = b.parent) {
            var c = b._template + "/" + this.options.item;
            a.push(c);
            if (joli.ui.template(c)) {
                this.options.item = c;
                break
            }
        }
        if (this.options.item && !joli.ui.template(this.options.item)) throw 'ERROR: List item "' + this.options.item + '" does not exist. I tried ' + a;
    },
    addItem: function (a) {
        joli.assert(this.attached, "Not attached!");
        var b = false,
            c = a && joli.data(a, "widget");
        if (c) a = c;
        if (!(a instanceof joli.ui.Widget)) if (a instanceof HTMLElement) {
            if (!a.getAttribute("data-ui")) {
                a.setAttribute("data-ui", this.options.item);
                b = true
            }
            a = joli.ui.fromNode(a)
        } else {
            a = jQuery.extend({}, a);
            a.tagName = this.options.childtag;
            a = joli.ui(this.options.item, a);
            b = true
        }
        this.container._element.appendChild(this.wrapIfNeeded(a._element));
        joli.data(a, "listIndex", this.items.length);
        this.items.push(a);
        this.options.items.push(a.options);
        a.parent = this;
        this.attached && a.attachedToDom();
        if (b) this.onItemAdded(a);
        return a
    },
    wrapIfNeeded: function (a) {
        if (this.options.childtag && this.options.childtag !== a.tagName) {
            var b = joli.createElement(this.options.childtag);
            b.appendChild(a);
            a = b
        }
        return a
    },
    removeItem: function (a) {
        this.container._element.removeChild(a._element);
        joli.remove(this.items, a)
    },
    insertItem: function (a, b) {
        this.container._element.insertBefore(a._element, b._element);
        joli.insert(this.items, a, b)
    },
    clear: function () {
        this.container.innerHTML = "";
        this.items = [];
        this.options.items = [];
        return this
    },
    onItemAdded: function () {},
    getIndex: function (a) {
        return a.parent === this ? joli.data(a, "listIndex") : -1
    },
    isEmpty: function () {
        return this.items.length === 0
    }
});
joli.ui.extend("Chooser", "List", {
    options: {
        activate: false,
        item: "item"
    },
    triggers: {
        cursor_moved: null
    },
    SEPARATOR: "|",
    initWidget: function () {
        this._super();
        this.itemsByValue = {};
        this.clickListeners = []
    },
    onAttached: function () {
        this._super();
        if (this.options.target) {
            var a = this.options.target.split(".");
            for (this.target = this.parent; this.target && a.length;) this.target = this.target[a.shift()];
            joli.assert(this.target, "Could not find target " + this.options.target)
        }
        if ((a = this.options.activate) && !this.isEmpty()) {
            if (a !== true) this.activeValue = a;
            this.initialActivate()
        }
    },
    clear: function () {
        this._super();
        this.itemsByValue = {};
        this._cursor = undefined;
        this.active = false
    },
    onItemAdded: function (a) {
        var b = a.options.value;
        this.itemsByValue[b] = a;
        a.addClass(b);
        if (a instanceof joli.ui.Chooser) {
            b = b ? b + this.SEPARATOR : "";
            a.click(function (c) {
                return this.activate(b + c)
            }, this)
        } else {
            a.click(this.activate.bind(this, b, false));
            a.isLeaf = true
        }
    },
    split: function (a) {
        a = ("" + a).split(this.SEPARATOR);
        return {
            first: a.shift(),
            rest: a.join(this.SEPARATOR)
        }
    },
    enable: function () {
        for (var a in this.itemsByValue) this.itemsByValue[a].removeClass("disabled")
    },
    disable: function () {
        for (var a in this.itemsByValue) this.itemsByValue[a].addClass("disabled")
    },
    deactivate: function () {
        for (var a in this.itemsByValue) this.itemsByValue[a].active = false;
        this._active = false
    },
    initialActivate: function () {
        this.activeValue = this.activeValue || this.items[0].options.value;
        this.activate(this.activeValue)
    },
    notifyActivate: function (a) {
        var b = this.options.event;
        return b = (b = (b = b ? !this.trigger(b, [a]).isDefaultPrevented() : true) && this.onActivate(a) !== false) && this.notifyClick(a) !== false
    },
    activate: function (a, b) {
        if (a !== this.value) if (this.enabled && (b || this.notifyActivate(a))) {
            if (this.active) this.activeItem.active = false;
            var c = this.split(a);
            this.activeValue = c.first;
            if (c.rest) this.activeItem.activate(c.rest, true);
            else this.activeItem.active = true;
            this._active = true
        } else return false;
        else b || this.trigger(this.options.value + "_reclick", [a])
    },
    __get__value: function () {
        if (this.active) {
            var a = this.activeValue;
            if (this.activeItem instanceof joli.ui.Chooser) a += (a ? this.SEPARATOR : "") + this.activeItem.value;
            return a
        }
    },
    onActivate: function (a) {
        if (this.target) return this.target.showChild(a, joli.bind(function () {
            this.activate(a, true)
        }, this))
    },
    getItem: function (a, b) {
        var c = this.split(a),
            d = this.itemsByValue[c.first];
        d = d || joli.some(this.items, function (e) {
            return e.getItem && e.getItem(a)
        });
        joli.assert(b || d, "No item with value " + a);
        return c.rest ? d.getItem(c.rest) : d
    },
    __get__activeItem: function () {
        return this.getItem(this.activeValue)
    },
    notifyClick: function (a) {
        var b;
        joli.each(this.clickListeners, function (c) {
            if (c(a) === false) b = false
        });
        return b
    },
    click: function (a, b) {
        this.clickListeners.push(joli.bind(a, b))
    },
    getValue: function (a, b) {
        if (a.parent === this) return "" + a.options.value;
        var c;
        joli.each(this.items, function (d) {
            if (c = d.getValue && d.getValue(a, true)) {
                d = this.getValue(d);
                c = (d ? d + this.SEPARATOR : "") + c;
                return false
            }
        }, this);
        joli.assert(c || b, "Item was not found.");
        return c
    },
    __set__hasFocus: function (a) {
        if (this._hasFocus !== a) {
            this._hasFocus = a;
            if (this.cursor) {
                this.cursor.item().hasFocus = a;
                this.cursor.item()[a ? "focus" : "blur"]();
                a && console.log("focused on " + this.cursor.item().options.value)
            }
        }
    },
    __get__hasFocus: function () {
        return this._hasFocus
    },
    __get__hasLeaf: function () {
        return joli.some(this.items, function (a) {
            return a.isLeaf || a.cursor
        })
    },
    __get__cursor: function () {
        if (this._cursor || !this.hasLeaf) return this._cursor;
        var a, b = 0,
            c, d, e, f = {
                "-1": {
                    bound: "last",
                    test: "hasPrev",
                    get: "prev"
                },
                1: {
                    bound: "first",
                    test: "hasNext",
                    get: "next"
                }
            },
            g = joli.bind(function (h, i) {
                var k = f[h];
                if (d && d[k.test]()) return i || d[k.get]();
                for (var j, l = b + h, m; !j && l >= 0 && l < this.items.length;) {
                    m = this.items[l];
                    if (m.cursor) j = i || m.cursor[k.bound]();
                    if (m.isLeaf) j = m;
                    j || (l += h)
                }
                joli.assert(i || j, "No " + k.get + " item.");
                i || a.val(l);
                return j
            }, this);
        a = this._cursor = joli.bind({
            val: function (h) {
                if (arguments.length) {
                    if (h instanceof joli.ui.Widget) return a.val(this.getValue(h));
                    if (h !== e) {
                        if (c) this.hasFocus = false;
                        e = b = h;
                        if (joli.isString(h)) {
                            var i = this.split(h),
                                k = this.getItem(i.first);
                            b = this.getIndex(k);
                            if (b < 0) {
                                i.rest = i.first;
                                i.first = "";
                                joli.each(this.items, function (j, l) {
                                    if (j.getIndex(k) >= 0) {
                                        b = l;
                                        return false
                                    }
                                })
                            }
                        }
                        joli.assert(c = this.items[b], "Bad cursor index: " + b);
                        d = c.cursor;
                        i && i.rest && d.val(i.rest);
                        this.hasFocus = true;
                        this.trigger_cursor_moved([a.val()])
                    }
                } else {
                    i = this.getValue(c);
                    return i + (d ? (i ? this.SEPARATOR : "") + d.val() : "")
                }
            },
            first: function () {
                a.val(0);
                if (d) return d.first();
                if (c.isLeaf) return c;
                return a.next()
            },
            last: function () {
                a.val(this.items.length - 1);
                if (d) return d.last();
                if (c.isLeaf) return c;
                return a.prev()
            },
            hasNext: function () {
                return g(1, true)
            },
            hasPrev: function () {
                return g(-1, true)
            },
            next: function () {
                return g(1)
            },
            prev: function () {
                return g(-1)
            },
            item: function () {
                return c
            },
            debug: function () {
                return {
                    i: b,
                    item: c,
                    itemc: d
                }
            }
        }, this);
        a.first();
        return a
    },
    tryCursorNext: function () {
        return this.cursor && this.cursor.hasNext() && this.cursor.next()
    },
    tryCursorPrev: function () {
        return this.cursor && this.cursor.hasPrev() && this.cursor.prev()
    },
    tryCursorFirst: function () {
        return this.cursor && this.cursor.first()
    },
    tryCursorVal: function () {
        return this.cursor && this.cursor.val()
    },
    __get__active: function () {
        return this._active
    },
    __set__active: function (a) {
        if (this._active !== a) a ? this.initialActivate() : this.deactivate()
    }
});
joli.namespace("remote");
joli.remote.extend("Server", joli.Obj, {
    options: {
        Request: null,
        baseUrl: ""
    },
    triggers: {
        requests_start: null,
        requests_changed: null,
        requests_end: null,
        connect: null,
        disconnect: null,
        connection_changed: null
    },
    trigger_requests_end: function () {
        this.trigger("requests_end");
        delete this.bindings.requests_end
    },
    requestSuccess: function (a) {
        if (!joli.data(a, "cache")) this.connected = this._authenticated = true
    },
    requestError: function () {
        console.log("ERROR: Remote request failed. Arguments:", arguments)
    },
    requestComplete: function (a) {
        this.removeRequest(a.target)
    },
    onInit: function () {
        this.params = joli.bind(this.params, this)
    },
    onOptionsChanged: function (a) {
        this.nextRequestId = 0;
        this.requests = {};
        for (var b in a.methods) this.defineMethod(b, a.methods[b])
    },
    defineMethod: function (a, b) {
        b.url = b.url || a;
        this[a] = this.createMethod(b)
    },
    readArg: function (a) {
        return typeof a === "string" || typeof a === "number" || typeof a === "boolean" ? a : JSON.stringify(a)
    },
    params: {
        allOrNothing: function (a) {
            if (!joli.isFunction(a[0])) {
                var b = a.shift(),
                    c = {},
                    d;
                for (d in b) if (joli.isFunction(b[d])) {
                    c[d] = b[d];
                    delete b[d]
                }
                joli.isEmpty(c) || a.unshift(c);
                return b
            }
        },
        array: function (a) {
            var b = joli.map(a, function (c) {
                if (c.indexOf("=") > 0) {
                    c = c.split("=");
                    joli.assert(c.length === 2, "Param error");
                    return {
                        name: c[0],
                        defaultVal: c[1],
                        isOptional: true
                    }
                } else return {
                    name: c
                }
            });
            return joli.bind(function (c) {
                var d, e = {};
                joli.each(b, function (f) {
                    if (c[0] !== undefined && !joli.isFunction(c[0])) d = c.shift();
                    else {
                        joli.assert(f.isOptional, "Missing required param " + f.name);
                        d = f.defaultVal
                    }
                    e[f.name] = this.readArg(d)
                }, this);
                return e
            }, this)
        }
    },
    chooseParams: function (a) {
        var b = this.params.allOrNothing;
        if (a) if (joli.isFunction(a)) b = a;
        else {
            if (joli.isString(a)) a = a.split(",");
            if (joli.isArray(a)) b = this.params.array(a);
            else throw "Unknown params type: " + a;
        }
        return b
    },
    createMethod: function (a) {
        a.url = this.options.baseUrl + a.url;
        var b = this.chooseParams(a.params);
        delete a.params;
        var c = this.callMethod.bind(this, a, b);
        c.options = a;
        c.params = b;
        c.url = a.url;
        return c
    },
    callMethod: function (a, b) {
        var c = joli.toArray(arguments);
        c.splice(0, 2);
        a = jQuery.extend({}, a);
        a.data = b(c);
        var d = this.createRequest(a);
        this.readHandlers(c, d);
        this.addRequest(d);
        d.send();
        return d
    },
    createRequest: function (a) {
        return new this.options.Request(a)
    },
    readHandlers: function (a, b) {
        var c = a[0],
            d = a[1];
        if (c) if (joli.isFunction(c)) {
            c = d ? joli.bind(c, d) : c;
            b.bind("success", c)
        } else {
            c = joli.bind(c, d);
            b.bind(c)
        }
    },
    addRequest: function (a) {
        joli.isEmpty(this.requests) && this.trigger_requests_start();
        var b = a.options.url + "_" + this.nextRequestId++;
        this.requests[b] = a;
        a.id = b;
        joli.each(["Success", "Error", "Complete"], function (c) {
            a.bind(c.toLowerCase(), this["request" + c].bind(this))
        }, this);
        this.trigger_requests_changed()
    },
    removeRequest: function (a) {
        if (a.id.indexOf("events") == -1) {
            joli.assert(this.requests[a.id], "No request with id " + a.id);
            delete this.requests[a.id];
            this.trigger_requests_changed();
            joli.isEmpty(this.requests) && this.trigger_requests_end()
        }
    },
    bind: function (a, b) {
        var c = {
            type: a
        };
        if (a === "requests_end" && joli.isEmpty(this.requests)) b(c);
        else {
            a === "connection_changed" && this.connected !== undefined && this.authenticated !== undefined && b(c, this.connected && this.authenticated);
            return this._super.apply(this, arguments)
        }
    },
    __get__authenticated: function () {
        return this._authenticated
    },
    __set__authenticated: function (a) {
        if (a !== this._authenticated) {
            this._authenticated = a;
            this.trigger_connection_changed([a && this.connected])
        }
    },
    __get__connected: function () {
        return this._connected
    },
    __set__connected: function (a) {
        if (a !== this._connected) {
            this._connected = a;
            if (!a) this._authenticated = false;
            this.trigger_connection_changed([a && this.authenticated]);
            if (a) {
                this.trigger_connect();
                try {
                    applicationCache.update()
                } catch (b) {}
            } else this.trigger_disconnect()
        }
    }
});
joli.remote.extend("Request", joli.Obj, {
    options: {},
    triggers: {
        success: null,
        error: null,
        complete: null
    },
    trigger_success: function (a) {
        joli.each(this.bindings.success || [], function (b) {
            b(a)
        }, this)
    },
    id: null,
    send: function () {
        throw joli.AbstractMethodError;
    },
    abort: function () {
        throw joli.AbstractMethodError;
    },
    responseData: null
});
joli.remote.extend("Resource", joli.Class, {
    init: function (a, b, c) {
        this.path = b;
        this.server = a;
        for (var d in c) this.defineMethod(d, c[d])
    },
    defineMethod: function (a, b) {
        b.url = b.url || a;
        b.url = this.path + b.url;
        this[a] = this.server.createMethod(b)
    }
});
joli.namespace("cloud");
joli.cloud.extend("Request", joli.remote.Request, {
    options: {
        type: "GET",
        ttl: 0,
        offline: false
    },
    onOptionsChanged: function (a) {
        joli.wrap(a, {
            success: function (b, c) {
                b(arguments);
                var d = c;
                if (c.type && joli.isArray(c[c.type])) {
                    d = c[c.type];
                    if (a.model) d = joli.model.update(a.model, d);
                    d.count = c.total_entries
                } else if (a.model) d = joli.model.update(a.model, d);
                if (joli.data(c, "cache") || joli.data(c, "cache") == false) joli.data(d, "cache", joli.data(c, "cache"));
                this.responseData = d;
                this.trigger_success(d)
            },
            error: function (b, c, d, e) {
                var f;
                if (this.options.offline && (f = joli.loadLocal(this.options.url, this.options.data, Infinity))) {
                    f = joli.isString(f) ? JSON.parse(f) : f;
                    joli.data(f, "cache", true);
                    var g = f;
                    if (f.type && joli.isArray(f[f.type])) {
                        g = f[f.type];
                        if (a.model) g = joli.model.update(a.model, g);
                        g.count = f.total_entries
                    } else if (a.model) g = joli.model.update(a.model, g);
                    if (joli.data(f, "cache") || joli.data(f, "cache") == false) joli.data(g, "cache", joli.data(f, "cache"));
                    this.responseData = g;
                    this.trigger_success(this.responseData)
                } else {
                    b(arguments);
                    this.trigger_error([c, d, e])
                }
            },
            complete: function (b) {
                if (!this.complete) {
                    this.complete = true;
                    b(arguments);
                    this.trigger_complete()
                }
            }
        }, this)
    },
    send: function () {
        this.setTimeout();
        if (joli.userSession && this.options.data) this.options.data.user_session = joli.userSession;
        else if (joli.userSession) this.options.data = {
            user_session: joli.userSession
        };
        this.xhr = joli.requestJson(this.options.url, this.options)
    },
    setTimeout: function () {
        this.timeoutId = setTimeout(joli.bind(function () {
            if (!this.complete) {
                console.log("ERROR: request manually timed-out. Aborting, triggering error and complete.", this);
                this.abort();
                this.complete = true;
                this.trigger_error([{
                    status: 0
                }, "timeout"]);
                this.trigger_complete()
            }
        }, this), 6E4)
    },
    abort: function () {
        this.xhr.abort()
    }
});
joli.cloud.extend("JoliServer", joli.remote.Server, {
    requestError: function (a, b, c) {
        function d(g) {
            console.log("ERROR loading resource " + a.target.options.url + ". Reason: " + g)
        }
        console.log("Error XHR: ", b);
        if (b.status === 400) try {
            var e = JSON.parse(b.responseText).error.code;
            if (e === "NOT_LOGGED_IN") {
                this.authenticated = false;
                console.log("TODO: different behaviour if we loose authentication mid-session.");
                clearTimeout(joli.showOffline);
                window.location.href = "/welcome"
            } else if (e === "NOT_FOUND" && a.target.options.url.indexOf("/api/dashboard") != -1) window.location.href = "/settings";
            else d(e)
        } catch (f) {
            d("Could not parse error in content: " + b.responseText)
        } else if (c === "timeout") this.connected = false;
        else {
            this.connected = false;
            d("Unknown. Response content: " + b.responseText)
        }
    }
});
joli.cloud.joliserver = new joli.cloud.JoliServer({
    baseUrl: "//" + location.host + "/api/",
    Request: joli.cloud.Request,
    connected: false,
    methods: {
        ping: {
            url: "ping?" + +new Date,
            type: "POST",
            params: function () {
                return {
                    platform: joli.getPlatform(),
                    user_session: joli.userSession,
                    screen_size: window.screen.width + "x" + window.screen.height,
                    app_installed: window.chrome && chrome.app && chrome.app.isInstalled
                }
            }
        },
        computerManufacturers: {
            url: "computers/manufacturers?" + +new Date,
            ttl: 0
        },
        computerOemManufacturers: {
            url: "computers/oem_manufacturers?" + +new Date,
            ttl: 0
        }
    }
});
document.addEventListener("mousemove", function () {
    var a = joli.lastActivity || Date.now(),
        b = Date.now();
    if (joli.cloud.joliserver.connected && b - a > joli.config.inactivityDelayOnline * 1E3 || !joli.cloud.joliserver.connected && b - a > joli.config.inactivityDelayOffline * 1E3) joli.cloud.joliserver.ping();
    joli.lastActivity = b
}, false);
joli.cloud.joliserver.ping();
joli.namespace("system", {
    triggers: {
        connect: null,
        disconnect: null
    },
    detect: function () {
        return navigator.userAgent.toLowerCase().indexOf("jolicloud") != -1 ? "jolicloud" : "unknown"
    },
    isJolicloud: function () {
        return joli.system.detect() == "jolicloud"
    },
    isUnknown: function () {
        return joli.system.detect() == "unknown"
    },
    bindings: {},
    bind: joli.Obj.prototype.bind,
    unbind: joli.Obj.prototype.unbind,
    trigger: joli.Obj.prototype.trigger,
    bind_connect: function () {
        var a = joli.toArray(arguments);
        a.unshift("connect");
        this.bind.apply(this, a)
    },
    bind_disconnect: function () {
        var a = joli.toArray(arguments);
        a.unshift("disconnect");
        this.bind.apply(this, a)
    },
    trigger_connect: function () {
        var a = joli.toArray(arguments);
        a.unshift("connect");
        this.trigger.apply(this, a)
    },
    trigger_disconnect: function () {
        var a = joli.toArray(arguments);
        a.unshift("disconnect");
        this.trigger.apply(this, a)
    }
});
joli.system.extend("WebSocket", joli.Obj, {
    maxRetries: joli.config.websocketRetries,
    wsEvents: {
        error: function (a) {
            console.log("Error in WebSocket.", a)
        },
        open: function () {
            this.retriesLeft = this.maxRetries;
            this.state = "connected";
            this.trigger_connect();
            this.processQueue()
        },
        message: function (a) {
            this.trigger_data(a.data)
        },
        close: function () {
            this.state = "disconnected";
            this.trigger_disconnect();
            if (this.retriesLeft-- > 0) setTimeout(this.connect.bind(this), 1E3);
            else {
                var a = "Error: WebSocket failed to connect to " + this.url;
                a += " after " + this.maxRetries + " retries.";
                console.log(a)
            }
        }
    },
    triggers: {
        connect: null,
        disconnect: null,
        data: function (a) {
            joli.each(this.bindings.data, function (b) {
                b(a)
            })
        }
    },
    init: function (a) {
        this.url = a;
        this.wsEvents = joli.bind(this.wsEvents, this);
        this.queue = [];
        this.retriesLeft = this.maxRetries;
        this._state = "disconnected"
    },
    connect: function () {
        if (this.state === "disconnected") {
            this.state = "connecting";
            this.ws = new WebSocket(this.url);
            for (var a in this.wsEvents) this.ws["on" + a] = this.wsEvents[a]
        }
    },
    __get__state: function () {
        return this._state
    },
    __set__state: function (a) {
        if (a === "disconnected" || this._state === "disconnected" || this._state === "connecting") console.log("WebSocket is " + a);
        this._state = a
    },
    processQueue: function () {
        if (this.state === "disconnected" || this.state === "connecting") {
            console.log("WARNING: WebSocket not connected. Will retry.");
            this.connect()
        } else if (this.state !== "processing") {
            this.state = "processing";
            try {
                for (; this.queue.length;) {
                    this.sendImpl(this.queue[0]);
                    this.queue.shift()
                }
            } catch (a) {
                console.log("Error while sending in WebSocket", a)
            } finally {
                this.state = this.state === "processing" ? "connected" : this.state
            }
        }
    },
    sendImpl: function (a) {
        this.ws.send(a)
    },
    send: function (a) {
        this.queue.push(a);
        this.processQueue()
    }
});
joli.system.extend("WebsocketServer", joli.remote.Server, {
    wsEvents: {
        connect: function () {
            this.authenticated = this.connected = true
        },
        disconnect: function () {
            this.connected = false
        },
        data: function (a) {
            var b;
            try {
                b = JSON.parse(a)
            } catch (c) {}
            if (b && b.method) {
                b.method.indexOf("packages/list") == -1 || b.method.indexOf("packages/list_updates") != -1 ? console.log("Websocket received", b.method, b.params) : console.log("Websocket received", b.method);
                a = b.method.split("@");
                var d = this.requests[a[1]];
                if (d) a[0] === "meta" ? this.metaHandle(b.params, d) : d.trigger_success(b.params);
                else console.log("Req " + a[1] + " not found in list. ", this.requests)
            }
        }
    },
    metaHandle: function (a, b) {
        if (a.code >= 500 && a.code < 600) {
            b.trigger_error([a]);
            b.trigger_complete()
        } else if (a.code === 200) b.trigger_complete();
        else if (a.code !== 150) throw "Unknown event code: " + a.code;
    },
    onInit: function () {
        this._super();
        this.ws = new joli.system.WebSocket(this.options.wsUrl);
        this.wsEvents = joli.bind(this.wsEvents, this);
        this.ws.bind(this.wsEvents)
    },
    connect: function () {
        this.ws.connect()
    },
    sendRequest: function (a) {
        var b = {
            method: a.options.url,
            params: a.options.data,
            handler: "handler@" + a.id,
            meta_handler: "meta@" + a.id
        };
        joli.assert(this.requests[a.id] === a, "Unknown request. Was it added? Re-sent?");
        console.log("Websocket sending", a.id, b.params);
        this.ws.send(JSON.stringify(b))
    },
    createRequest: function (a) {
        a.server = this;
        return new joli.system.Request(a)
    }
});
joli.system.websocketserver = new joli.system.WebsocketServer({
    wsUrl: "ws://" + joli.config.systemUri + "/jolicloud/",
    Request: joli.system.Request,
    methods: {}
});
joli.system.websocketserverapt = new joli.system.WebsocketServer({
    wsUrl: "ws://" + (joli.config.systemAptUri || "") + "/jolicloud/",
    Request: joli.system.Request,
    methods: {}
});
(function () {
    joli.namespace("geo", {
        getCurrentPosition: function (a, b, c) {
            navigator.geolocation.getCurrentPosition(a, b, c)
        },
        getCurrentCoordinates: function () {
            joli.getCurrentPosition(function (a) {
                return [a.coords.latitude, a.coords.longitude]
            }, function (a) {
                return a.message
            })
        }
    })
})();
joli.Events = {
    handles: {},
    publish: function (a, b) {
        if (this.handles[a]) for (var c = 0; c < this.handles[a].length; c++) this.handles[a][c].apply(b || [])
    },
    subscribe: function (a, b) {
        this.handles[a] || (this.handles[a] = []);
        this.handles[a].push(b);
        return [a, b]
    },
    unsubscribe: function (a) {
        for (var b = a[0], c = 0; c < this.handles[b].length; c++) this.handles[b][c] == a[1] && cache[b].splice(c, 1)
    }
};
(function () {
    joli.namespace("done", {
        done: [],
        isUndoPossible: function () {
            return this.done.length > 0
        },
        push: function (a) {
            this.execute(null, a)
        },
        execute: function (a, b, c) {
            if (c == null) c = {};
            this.isFct(a) && c.async !== true && a()
        },
        undo: function () {
            var a = this.done && this.done.length > 0 ? this.done.pop() : null;
            if (this.isFct(a.wrappedUndo)) {
                a.wrappedUndo();
                this.fireEvents()
            }
        }
    })
})();
joli.system.preferences = new joli.remote.Resource(joli.system.websocketserver, "preferences/", {
    capabilities: {},
    autologin: {
        params: "action"
    },
    guestmode: {
        params: "action"
    },
    migrateConnections: {
        url: "migrate_connections",
        params: "action"
    }
});
joli.system.daemon = new joli.remote.Resource(joli.system.websocketserver, "daemon/", {
    upgrade: {},
    restart: {},
    stop: {},
    isLive: {
        url: "is_live"
    },
    isGuest: {
        url: "is_guest"
    },
    computer: {},
    killNickel: {
        url: "kill_nickel"
    },
    version: {}
});
joli.system.network = new joli.remote.Resource(joli.system.websocketserver, "network/", {
    onCellularNetwork: {
        url: "on_cellular_network"
    }
});
joli.system.extend("Request", joli.remote.Request, {
    triggers: {
        data: null
    },
    onOptionsChanged: function (a) {
        this.server = a.server
    },
    send: function () {
        this.server.sendRequest(this)
    },
    abort: function () {
        this.server.abortRequest(this)
    }
});
joli.system.localstorage = new joli.remote.Resource(joli.system.websocketserver, "local_storage/", {
    setItem: {
        url: "set_item",
        params: "key,value"
    },
    getItem: {
        url: "get_item",
        params: "key"
    }
});
joli.system.info = new joli.remote.Resource(joli.system.websocketserver, "info/", {
    all: {},
    disk: {}
});
joli.system.session = new joli.remote.Resource(joli.system.websocketserver, "session/", {
    logout: {},
    sleep: {},
    restart: {},
    shutdown: {},
    hibernate: {},
    onBattery: {
        url: "on_battery"
    },
    inhibitScreensaver: {
        url: "inhibit_screensaver",
        params: "reason"
    },
    properties: {}
});
joli.system.devices = new joli.remote.Resource(joli.system.websocketserver, "devices/", {
    volumes: {},
    mount: {
        params: "udi"
    },
    unmount: {
        params: "udi"
    },
    eject: {
        params: "udi"
    }
});
joli.system.apps = new joli.remote.Resource(joli.system.websocketserver, "apps/", {
    launch: {
        params: "command"
    },
    launchPackage: {
        url: "launch_package",
        params: "package"
    },
    launchDesktop: {
        url: "launch_desktop",
        params: "desktop"
    },
    launchSettings: {
        url: "launch_settings"
    },
    launchWebapp: {
        url: "launch_webapp",
        params: "package,url,icon_url"
    },
    install: {
        params: "package,icon_url"
    },
    installolddaemon: {
        url: "install",
        params: "package"
    },
    remove: {
        params: "package"
    },
    localApps: {
        url: "local_apps"
    }
});
joli.system.appsapt = new joli.remote.Resource(joli.system.websocketserverapt, "apps/", {
    install: {
        params: "package"
    },
    remove: {
        params: "package"
    }
});
joli.system.packages = new joli.remote.Resource(joli.system.websocketserver, "packages/", {
    list: {},
    query: {
        params: "packages"
    },
    checkUpdates: {
        url: "check_updates",
        params: "force_reload"
    },
    listUpdates: {
        url: "list_updates"
    },
    performUpdates: {
        url: "perform_updates"
    },
    startPrefetch: {
        url: "start_prefetch"
    }
});
joli.system.packagesapt = new joli.remote.Resource(joli.system.websocketserverapt, "packages/", {
    list: {},
    checkUpdates: {
        url: "check_updates",
        params: "force_reload"
    },
    listUpdates: {
        url: "list_updates"
    },
    performUpdates: {
        url: "perform_updates"
    }
});
joli.ui.extend("ComboBox", joli.ui.Widget, {
    options: {
        minchars: 0,
        delay: 0,
        showemptysection: false,
        alwaysshow: false
    },
    initWidget: function () {
        this.choices = this.scroll.choices;
        this.bindMethod("hideChoices");
        this.input.bind({
            blur: function () {
                !this.mouseIsOver && !this.options.alwaysshow && this.hideChoices()
            },
            focus: function () {
                this.options.alwaysshow || this.updateChoices()
            }
        }, this);
        this.input.attr("placeholder", this.attr("data-placeholder"));
        this.keydownHandlers = joli.bind(this.keydownHandlers, this);
        if (this.options.alwaysshow) {
            this.updateChoices();
            this.showChoices()
        } else this.hideChoices();
        this.noresults.hide();
        this.bindMethod("updateChoicesWith");
        this.dataSource = function () {
            return []
        }
    },
    val: function () {
        return this.input.val.apply(this.input, arguments)
    },
    reset: function () {
        this.input.val("").blur();
        this.value.val("");
        if (this.options.alwaysshow) {
            this.choices.items[0] && joli.each(this.choices.items[0].items, function (a) {
                a.removeClass("selected")
            }, this);
            this.updateChoices()
        } else this.hideChoices()
    },
    keydownHandlers: {
        38: function () {
            this.choices.tryCursorPrev() && this.scrollToCursor()
        },
        40: function () {
            this.choices.tryCursorNext() && this.scrollToCursor()
        },
        13: function () {
            if (this.choices.cursor) {
                this.input.val(this.choices.cursor.val());
                this.value.val(this.choices.cursor.val())
            }
            if (this.options.alwaysshow) {
                if (this.choices) {
                    joli.each(this.choices.items[0].items, function (a) {
                        a.removeClass("selected")
                    }, this);
                    this.choices.getItem(this.val()).addClass("selected")
                }
            } else this.hideChoices();
            this.trigger_change([this.val()])
        },
        27: function () {
            this.reset()
        }
    },
    events: {
        keydown: function (a) {
            var b = a.keyCode;
            if (b in this.keydownHandlers) {
                this.keydownHandlers[b]();
                a.preventDefault()
            }
        },
        keyup: function (a) {
            a.keyCode in this.keydownHandlers || this.updateChoices()
        },
        mouseover: function (a) {
            if (a = a.target) {
                if (a.parent.isLeaf) a = a.parent;
                a.isLeaf && this.choices.cursor.val(a);
                this.mouseIsOver = true
            }
        },
        mouseout: function () {
            this.mouseIsOver = false
        },
        choice: function (a, b) {
            this.input.val(b);
            this.value.val(b);
            this.input.focus();
            this.mouseIsOver = false;
            a.preventDefault();
            if (this.options.alwaysshow) {
                joli.each(this.choices.items[0].items, function (c) {
                    c.removeClass("selected")
                }, this);
                this.choices.getItem(b).addClass("selected")
            } else {
                this.hideChoices();
                this.trigger_change([b])
            }
        },
        cursor_moved: function () {}
    },
    triggers: {
        choices_shown: null,
        change: null
    },
    scrollToCursor: function () {
        this.scroll._element.scrollTop = this.choices.getItem(this.choices.cursor.val()).offset().top - this.choices.offset().top - this.scroll.height() / 2 + 20
    },
    setDataSource: function (a) {
        if (joli.isFunction(a)) this.dataSource = a;
        else if (!joli.isString(a)) this.dataSource = this.makeStaticDataSource(a);
        this.lastText = undefined;
        this.options.alwaysshow && this.updateChoices()
    },
    makeStaticDataSource: function (a) {
        return function (b, c) {
            function d(i) {
                return g(i.text)
            }
            var e = {},
                f, g = this.makeDataFilter(b),
                h;
            for (h in a) {
                f = e[h] = jQuery.extend({}, a[h]);
                f.items = joli.filter(f.items, d)
            }
            c(e)
        }
    },
    makeDataFilter: function (a) {
        a = joli.escapeRegexp(a.toLowerCase()).split(" ");
        var b = joli.map(a, function (c) {
            return RegExp("^" + c)
        });
        return function (c) {
            var d = c.toLowerCase().split(" "),
                e = true;
            joli.each(b, function (f) {
                if (joli.none(d, joli.bind(f.test, f))) return e = false
            });
            return e
        }
    },
    updateChoices: function () {
        var a = this.input.val();
        if (this.lastText === a) this.showChoices();
        else if (!(a.replace(/\s/g, "").length < this.options.minchars)) {
            this.trigger_change([a]);
            this.lastText = a;
            this.choices.clear();
            this.dataSource(a, this.updateChoicesWith)
        }
    },
    updateChoicesWith: function (a) {
        for (var b in a) if (this.options.showemptysection || !joli.isEmpty(a[b].items)) this.choices.addItem(a[b]);
        this.choices.tryCursorFirst();
        this.showChoices()
    },
    showChoices: function () {
        if (this.choices.isEmpty()) this.options.alwaysshow ? this.scroll.show() : this.scroll.hide();
        else {
            this.options.alwaysshow ? this.scroll.show() : this.scroll.show().css({
                left: this.input.position().left + 1 + "px",
                top: this.input.position().top + 28 + "px",
                width: this.input.width() + 52 + "px"
            });
            this.trigger_choices_shown()
        }
    },
    hideChoices: function () {
        this.options.alwaysshow || this.scroll.hide()
    }
});
joli.namespace("joli.ui");
joli.ui.extend("StackContainer", "Widget", {
    options: {
        prevnext: false
    },
    events: {
        navigate_back: function () {
            this.popChild()
        },
        navigate_next: function () {
            this.cursor.next(this._cursorMoved.bind(this))
        },
        navigate_prev: function () {
            this.cursor.prev(this._cursorMoved.bind(this))
        }
    },
    _cursorMoved: function (a) {
        var b = joli.last(this.stack);
        b.token = a;
        return this._showChild(b, 0, joli.bind(function (c, d) {
            b.token = d;
            c.$.remove()
        }, this))
    },
    _updatePrevNext: function () {
        this.prev.enabled = this.cursor.hasPrev();
        this.next.enabled = this.cursor.hasNext()
    },
    onOptionsChanged: function () {
        this.stack = [{
            token: this.children[1],
            cursor: null
        }];
        this.currentChild = this.stack[0].token;
        joli.assert(this.currentChild, "No child found");
        this.buttonpanel.hide();
        this.prev = this.buttonpanel.prev;
        this.next = this.buttonpanel.next
    },
    _showChild: function (a, b, c) {
        var d = this._getChild(a.token);
        this.waitingChild = d;
        var e = joli.bind(function () {
            if (this.waitingChild != this.currentChild) {
                var f = this.currentChild,
                    g = this.waitingChild;
                this.currentChild = this.waitingChild;
                var h = this.$.width() + "px";
                f.css("width", h).addClass("child-out");
                g.css("width", h).addClass("child-in").show();
                this.addClass("transition");
                b == 1 && this._showBack();
                if (a.cursor) {
                    this._showPrevNext();
                    this.cursor = a.cursor;
                    this._updatePrevNext()
                } else {
                    this._hidePrevNext();
                    this.cursor = null
                }
                var i = false;
                setTimeout(joli.bind(function () {
                    if (!i) {
                        i = true;
                        f.hide();
                        f.$.removeClass("child-out").css("width", "");
                        g.$.removeClass("child-in").css("width", "");
                        this.removeClass("transition");
                        (c || joli.doNothing)(f, g);
                        this.stack.length == 1 && this.buttonpanel.hide()
                    }
                }, this), 200)
            }
        }, this);
        if (d.prepareToShow) {
            d.prepareToShow(e);
            return false
        } else e()
    },
    _showPrevNext: function () {
        this.buttonpanel.addClass("prevnext")
    },
    _hidePrevNext: function () {
        this.buttonpanel.removeClass("prevnext")
    },
    _showBack: function () {
        this.$.removeClass("noback").addClass("hasback");
        this.buttonpanel.show()
    },
    _hideBack: function () {
        this.$.removeClass("hasback").addClass("noback")
    },
    _addChildToDom: function (a) {
        this._element.appendChild(a._element);
        a.parent = this;
        a.attachedToDom();
        a.hide()
    },
    _getChild: function (a) {
        var b = a instanceof joli.ui.Widget ? a : null;
        if (!b) {
            b = this.trigger("stack_child", [a]).stackChild;
            this._addChildToDom(b)
        }
        joli.assert(b, "No child for stack container");
        return b
    },
    pushChild: function (a, b, c) {
        var d = {
            token: a,
            cursor: b
        };
        return this._showChild(d, 1, joli.bind(function (e, f) {
            d.token = f;
            this.stack.push(d);
            (c || joli.doNothing)()
        }, this))
    },
    pushCursor: function (a, b) {
        return this.pushChild(a.current(), a, b)
    },
    popChild: function (a) {
        this.stack.length == 2 && this._hideBack();
        return this._showChild(this.stack[this.stack.length - 2], -1, joli.bind(function (b) {
            this.stack.pop();
            b.$.remove();
            (a || joli.doNothing)()
        }, this))
    },
    popToBottom: function (a) {
        this._hideBack();
        var b = this.stack[0];
        return this._showChild(b, -1, joli.bind(function () {
            this.stack.shift();
            joli.each(this.stack, function (c) {
                c.token instanceof joli.ui.Widget && c.token.$.remove()
            });
            this.stack = [b];
            (a || joli.doNothing)()
        }, this))
    }
});
joli.ui.extend("PagingList", joli.ui.Widget, {
    options: {
        noresults: "No results."
    },
    onOptionsChanged: function (a) {
        this.list.setOptions({
            item: a.item
        });
        delete a.item;
        this.noresults.text = _("No results.");
        this.pager.setOptions(a)
    },
    prepareToShow: function (a) {
        this.pager.refreshIfDirty(a)
    },
    events: {
        paginator_data: function () {
            if (this.pager.isEmpty()) {
                this.pager.hide();
                this.list.hide();
                this.noresults.show()
            } else {
                this.noresults.hide();
                this.pager.show();
                this.list.show()
            }
        }
    }
});
joli.delegateMethods(joli.ui.PagingList.prototype, "pager", ["setMethodParams", "redisplay", "clearLocal", "refreshIfDirty"]);
joli.ui.extend("TemplateViewer", "Widget", {
    init: function (a, b, c) {
        this._super(a, b, c);
        var d = this;
        this.allTemplatesBtn.click(function () {
            d.showAllTemplates()
        });
        d.showAllTemplates()
    },
    showAllTemplates: function () {
        function a(g) {
            for (var h = 0; h < g.length; ++h) {
                var i = d.subTemplate("item"),
                    k = g[h].getAttribute("data-template");
                if (k != "joli.templateviewer") try {
                    var j = joli.ui(k);
                    i.title.text = k;
                    i.templateView.addChild(j, "the_template");
                    c.addChild(i, "view_" + h)
                } catch (l) {}
            }
        }
        var b = joli.Application.modules,
            c = this.content;
        c.clear();
        for (var d = this, e = 0; e < b.length; ++e) {
            var f = document.body.querySelector("#templates-" + b[e]);
            a(f.querySelectorAll("[data-template]"))
        }
    }
});
joli.ui.extend("Button", "Clickable", {
    options: {
        hasLabel: true
    },
    onOptionsChanged: function (a) {
        this._super(a);
        this.extra && this.extra.hide();
        if (this.options.hasLabel && this.label && a.text) {
            this.label.show();
            this.label.text = a.text
        } else this.label && this.label.hide();
        this.icon && a.icon && this.icon.css("background-image", "url(" + a.icon + ")")
    }
});
joli.ui.extend("Paginator", "Chooser", {
    options: {
        activate: false,
        startPage: 0,
        perPage: 10,
        pageRadius: 2,
        animate: true,
        modeltype: ""
    },
    events: {
        prevpage: function (a) {
            this.display(this.page - 1);
            a && a.preventDefault()
        },
        nextpage: function (a) {
            this.display(this.page + 1);
            a && a.preventDefault()
        },
        page: function (a, b) {
            this.display(b);
            a && a.preventDefault()
        }
    },
    initWidget: function () {
        this._super();
        this.methodParams = {};
        this.requests = [];
        this.lastPage = 0
    },
    onOptionsChanged: function (a) {
        this._super(a);
        a.event = "page";
        a.startPage = a.startPage || 0;
        this.page = -1;
        if (a.method) this.model = function (b, c, d, e) {
            b = jQuery.extend({}, e.methodParams, {
                page: Math.floor(b / this.options.perPage) + 1,
                per_page: c
            });
            var f = this.options.method,
                g = this.options.method.lastIndexOf(".");
            c = eval(f.substring(0, g));
            f = f.substring(g + 1);
            this.requests.push([c[f].url, b]);
            c[f](b, function (h) {
                e.dataLength = h.count || h.length;
                e.lastPage = Math.ceil(e.dataLength / e.options.perPage) - 1;
                e.trigger("paginator_data", [h]);
                d.call(e, h)
            })
        };
        this.dirty = true
    },
    setMethodParams: function (a, b, c) {
        this.requests = [];
        jQuery.extend(this.methodParams, a);
        this.page = -1;
        for (var d in a) a[d] == undefined && delete this.methodParams[d];
        this.dirty = true;
        b && this.redisplay(c)
    },
    setMethodParam: function (a, b, c, d) {
        var e = {};
        e[a] = b;
        this.setMethodParams(e, c, d)
    },
    clearLocal: function () {
        joli.each(this.requests, function (a) {
            joli.clearLocal.apply(joli, a)
        })
    },
    redisplay: function (a) {
        this.page = this.page === -1 ? this.options.startPage : this.page;
        this.display(this.page, true, a)
    },
    refreshIfDirty: function (a) {
        this.dirty && !this.fetchingData ? this.redisplay(a) : a()
    },
    display: function (a, b, c) {
        if (!isFinite(a)) throw "Bad page";
        c = c || joli.doNothing;
        a = Math.min(a, this.lastPage || 0);
        a = Math.max(a, 0);
        if (a === this.page && !b) {
            console.log("page will not turn: already on this page");
            return false
        }
        if (!b && this.trigger({
            type: "prePageTurn",
            from: this.page,
            to: a
        }).isDefaultPrevented()) {
            console.log("page turn canceled by listener");
            return false
        }
        a = +a;
        b = this.options;
        this.fetchingData = true;
        this.model(a * b.perPage, b.perPage, function (d) {
            this.dirty = this.fetchingData = false;
            this.displayPaginator(a);
            this.displayContainer(a, d, c)
        }, this);
        return true
    },
    displayPaginator: function (a) {
        if (this.prev) {
            this.prev.enabled = a > 0;
            this.next.enabled = a < this.lastPage
        }
        this.clear();
        if (this.options.pageRadius != -1) {
            for (var b = this.computeRange(a), c = b[0]; c <= b[1]; ++c) this.addItem({
                value: c,
                text: c + 1
            }).active = c == a;
            if (this.current) {
                this.current.hide();
                this.container.show()
            }
        } else {
            this.container.hide();
            this.current.text = _("Page") + " " + (a + 1) + " / " + (this.lastPage + 1);
            this.current.show()
        }
    },
    displayContainer: function (a, b, c) {
        var d = joli.bind(function () {
            this.page = a;
            c()
        }, this);
        this.prepareItems();
        if (this.options.animate) this.startAnimation(b, d);
        else {
            this.setPageData(b);
            d()
        }
    },
    computeRange: function (a) {
        var b = this.options.pageRadius,
            c = 0,
            d = this.lastPage;
        if (b) {
            c = a - b;
            d = a + b;
            if (a - b < 0) {
                c = 0;
                d = Math.min(2 * b, this.lastPage)
            }
            if (a + b > this.lastPage) {
                d = this.lastPage;
                c = Math.max(this.lastPage - 2 * b, 0)
            }
        }
        return [c, d]
    },
    prepareItems: function () {
        for (this.target.items.length != this.options.perPage && this.target.clear(); this.target.items.length < this.options.perPage;) this.target.addItem().addClass("joli-paginator-hidden")
    },
    setPageData: function (a) {
        this.pageData = a;
        joli.times(this.options.perPage, function (b) {
            var c = this.target.items[b];
            if (b < a.length) c && c.removeClass("joli-paginator-hidden").setModel(a[b]);
            else c && c.addClass("joli-paginator-hidden").setModel(null)
        }, this)
    },
    startAnimation: function (a, b) {
        var c = this.target.items,
            d = c[0],
            e = joli.bind(function () {
                d.unbind("webkitTransitionEnd");
                d.unbind("transitionend");
                joli.each(c, function (g) {
                    g.removeClass("joli-paginator-fadeout").addClass("joli-paginator-fadein")
                });
                this.setPageData(a);
                b()
            }, this);
        joli.each(c, function (g) {
            g.removeClass("joli-paginator-fadein").addClass("joli-paginator-fadeout")
        });
        var f = joli.bind(function () {
            d.bind("webkitTransitionEnd", e);
            d.bind("transitionend", e)
        }, this);
        d.css("opacity") == 0 ? e() : f()
    },
    onActivate: joli.doNothing,
    isEmpty: function () {
        return this.lastPage === -1
    },
    initCursor: function () {
        var a = {
            next: function (c) {
                if (a.indexInPage < this.pageData.length - 1) {
                    ++a.indexInPage;
                    c(a.current())
                } else if (a.hasNext()) this.display(this.page + 1, null, function () {
                    a.indexInPage = 0;
                    c(a.current())
                });
                else throw "No next item";
            },
            prev: function (c) {
                if (a.indexInPage > 0) {
                    --a.indexInPage;
                    c(a.current())
                } else if (a.hasPrev()) this.display(this.page - 1, null, joli.bind(function () {
                    a.indexInPage = this.options.perPage - 1;
                    c(a.current())
                }, this));
                else throw "No prev item";
            },
            current: function () {
                var c = this.pageData[a.indexInPage];
                c.type = a.type;
                return c
            },
            hasNext: function () {
                return a.indexInData < this.dataLength - 1
            },
            hasPrev: function () {
                return a.indexInData > 0
            }
        },
            b;
        for (b in a) a[b] = joli.bind(a[b], this);
        a.indexInPage = 0;
        joli.defProperty(a, "indexInData", joli.bind(function () {
            return this.page * this.options.perPage + a.indexInPage
        }, this));
        this._cursor = a
    },
    getCursor: function (a, b) {
        this._cursor || this.initCursor();
        this._cursor.indexInPage = a;
        this._cursor.type = b;
        return this._cursor
    }
});
joli.ui.extend("TabView", "Chooser", {
    options: {
        activate: true
    }
});
joli.ui.extend("Toolbar", "Chooser", {
    onItemAdded: function (a) {
        this._super(a);
        a.setOption("hasLabel", false)
    }
});
joli.ui.extend("SectionChooser", "Chooser", {
    options: {
        activate: true,
        item: "section"
    },
    onItemAdded: function (a) {
        this._super(a);
        if (a.options.heading) a.heading.title.text = a.options.heading;
        else a.heading.hide()
    }
});
joli.ui.extend("Image", "Widget", {
    events: {
        load: function () {
            this.isLoaded = true;
            this.$.css("visibility", "");
            this.options.offline && this.saveToLocal()
        }
    },
    onOptionsChanged: function () {
        this.options.offline && this.isLoaded && this.saveToLocal()
    },
    saveToLocal: function () {
        if (!this.isSaved) if (this.src.indexOf("data:") != 0) try {
            joli.saveLocal(this.src, {}, this.getDataUrl());
            this.isSaved = true
        } catch (a) {
            console.log("Error saving image. Are you serving this image on the same domain?")
        } else throw "Cannot save data url of image.";
    },
    getDataUrl: function () {
        return joli.ui.Image.getDataUrl(this._element)
    },
    convertToGrayscale: function () {
        try {
            var a = document.createElement("canvas"),
                b = a.getContext("2d");
            a.width = 64;
            a.height = 64;
            var c = new Image;
            c.src = this.src;
            b.drawImage(c, 0, 0);
            var d = b.getImageData(0, 0, 64, 64);
            for (c = 0; c < 64; c++) for (var e = 0; e < 64; e++) {
                var f = c * 4 * d.width + e * 4,
                    g = (d.data[f] + d.data[f + 1] + d.data[f + 2]) / 3;
                d.data[f] = g;
                d.data[f + 1] = g;
                d.data[f + 2] = g
            }
            b.putImageData(d, 0, 0, 0, 0, d.width, d.height);
            this.src = a.toDataURL()
        } catch (h) {}
    }
});
joli.ui.Image.basePath = joli.config.baseImageUrl;
joli.ui.Image.getDataUrl = function (a) {
    var b = joli.createElement("canvas", {
        width: jQuery(a).width() || 64,
        height: jQuery(a).height() || 64
    });
    b.getContext("2d").drawImage(a, 0, 0);
    return b.toDataURL()
};
joli.defProperty(joli.ui.Image.prototype, "src", function () {
    return this.$.attr("src")
}, function (a) {
    if (a.indexOf("data:") === 0) {
        this.isLoaded = this.isSaved = true;
        this.$.attr("src", a);
        this.srcUrl = a
    } else {
        if (a.indexOf("http:") !== 0) a = joli.ui.Image.basePath + a;
        if (this.srcUrl != a) {
            this.srcUrl = a;
            var b = this.options.offline ? joli.loadLocal(a, {}, Infinity) : null;
            if (b) {
                joli.assert(b.indexOf("data:") === 0, "Bad image data");
                this.src = b
            } else {
                this.$.css("visibility", "hidden");
                this.isLoaded = this.isSaved = false;
                this.$.attr("src", a)
            }
        }
    }
});
joli.ui.createAttributeAccessor(joli.ui.Image, "alt");
joli.namespace("joli.ui");
joli.ui.extend("SwapContainer", "Widget", {
    registerChild: function (a, b) {
        this._super(a, b);
        a.style.display = "none";
        a.hide()
    },
    showChild: function (a, b, c) {
        b = b || joli.doNothing;
        if (a !== this.currentChild) {
            if (a && !this[a]) throw "No child named " + a;
            this.waitingChild = a;
            var d = joli.bind(function () {
                if (this.waitingChild == this.currentChild) return false;
                this.currentChild && this[this.currentChild].hide();
                this.current = (this.currentChild = this.waitingChild) && this[this.currentChild];
                this.currentChild && this[this.currentChild].show();
                b()
            }, this);
            if (!c && a && this[a].prepareToShow) {
                this[a].prepareToShow(d);
                return false
            } else return d()
        } else b()
    }
});
joli.ui.extend("Sidebar", "SectionChooser", {});
joli.ui.extend("Modalbox", "Widget", {
    height: "400px",
    onAttached: function () {
        this._super();
        this.hide(true);
        this.addClass("loaded");
        var a = this;
        document.addEventListener("keydown", function (b) {
            if (b.keyCode === 27) {
                b.preventDefault();
                a.trigger("modalbox", ["cancel"])
            }
        }, false)
    },
    onOptionsChanged: function (a) {
        this._super(a);
        if (a.title) this.title.text = a.title;
        if (a.decription) this.description.text = a.description
    },
    show: function () {
        var a = this._element.querySelector(".content");
        a.style.opacity = 1;
        this.height = document.defaultView.getComputedStyle(a, null).getPropertyValue("height") || this.height;
        this._super();
        this.removeClass("hiding");
        this.addClass("showing")
    },
    hide: function (a) {
        if (a) this._super();
        else {
            this.addClass("hiding");
            this.hide(true)
        }
        this.removeClass("showing")
    }
});
joli.ui.extend("TableView", joli.ui.Widget, {
    initWidget: function () {},
    addItem: function (a, b) {
        var c = document.createElement("dt"),
            d = document.createElement("dd");
        c.innerHTML = a;
        d.innerHTML = b;
        this._element.appendChild(c);
        this._element.appendChild(d);
        return d
    },
    clear: function () {
        this.innerHTML = ""
    }
});
joli.ui.extend("Progressbar", joli.ui.Widget, {
    options: {
        width: 100,
        height: 4
    },
    initWidget: function () {},
    onOptionsChanged: function (a) {
        this.setSize(a.height, a.width);
        if (a.max !== undefined && a.val !== undefined && a.max > 0 && a.val >= 0) {
            this.setMax(a.max);
            this.setValue(a.val)
        }
    },
    setSize: function (a, b) {
        this.$.css({
            width: b + "px",
            height: a + "px"
        });
        this.fill.$.css({
            height: a + "px"
        })
    },
    getMax: function () {
        return this.$.attr("max") || undefined
    },
    setMax: function (a) {
        this.$.attr("max", a)
    },
    setValue: function (a) {
        if (a == -999) this.hide();
        else {
            this.show();
            var b = this.getMax();
            this.$.attr("value", a);
            try {
                a = parseFloat(a);
                b = parseFloat(b)
            } catch (c) {
                a = 0;
                b = 1
            }
            if (a > 0) {
                if (a > b) a = b;
                a / b * this.width() <= this.height() ? this.fill.$.css({
                    width: this.height() + "px"
                }) : this.fill.$.css({
                    width: a / b * 100 + "%"
                })
            } else this.fill.$.css({
                width: "0%"
            })
        }
    }
});
joli.ui.extend("Searchfield", joli.ui.Widget, {
    initWidget: function () {
        this.input.bind({
            blur: joli.bind(function () {
                this.input.isFocused = false;
                this.hideSearchResults();
                this.input._element.value == "" && this.clearinput.hide()
            }, this),
            focus: joli.bind(function () {
                this.input.isFocused = true;
                this.showSearchResults()
            }, this)
        });
        this.results.bind({
            mousedown: function () {
                this.doSelectedAction()
            }
        }, this);
        this.hideSearchResults();
        this.clearinput.hide()
    },
    reset: function () {
        this.input._element.value = "";
        this.input.$.blur();
        this.hideSearchResults();
        this.clearinput.hide()
    },
    doSelectedAction: function () {
        this.selectedItem && this.selectedItem.action();
        this.more ? this.hideSearchResults() : this.reset()
    },
    searchCategories: ["apps", "users"],
    keyhandler: {
        38: function () {
            this.setSelectedIndex(this.selectedItem._index - 1)
        },
        40: function () {
            this.setSelectedIndex(this.selectedItem._index + 1)
        },
        13: function () {
            this.selectedItem && this.doSelectedAction()
        },
        27: function () {
            this.reset()
        }
    },
    events: {
        keydown: function (a) {
            var b = a.keyCode;
            if (b in this.keyhandler) {
                joli.bind(this.keyhandler[b], this)();
                a.preventDefault()
            }
        },
        keyup: function (a) {
            if (this.input._element.value.replace(/\s/g, "") == "") {
                this.hideSearchResults();
                this.input._element.value == "" && this.clearinput.hide()
            } else!(a.keyCode in this.keyhandler) && a.keyCode != 37 && a.keyCode != 39 && this.showSearchResults()
        },
        clear: function () {
            this.reset()
        }
    },
    selectedItem: null,
    items: [],
    onMouseOverItem: function (a) {
        this.setSelectedItem(a.sender)
    },
    setSelectedIndex: function (a) {
        if (a >= this.resultItems.length) a = 0;
        else if (a < 0) a = this.resultItems.length - 1;
        this.setSelectedItem(this.resultItems[a])
    },
    setSelectedItem: function (a) {
        if (a !== this.selectedItem) {
            this.selectedItem && this.selectedItem.removeClass("hover");
            (this.selectedItem = a) && this.selectedItem.addClass("hover")
        }
    },
    showSearchResults: function () {
        var a = this.input._element.value;
        if (a) {
            this.clearinput.show();
            var b = {
                apps: joli.ui.root.content.dashboard.getSearchResults(a)
            };
            this.results.clear();
            this.resultItems = [];
            var c;
            joli.each(this.searchCategories, function (h) {
                if ((c = b[h]) && c.length) {
                    var i = this.results.addItem({
                        heading: h == "apps" ? _("Launch") : h.charAt(0).toUpperCase() + h.slice(1)
                    }),
                        k = 0;
                    joli.each(c, function (j) {
                        var l = j.action;
                        delete j.action;
                        j = i.addItem(j);
                        j.action = l;
                        j._index = this.resultItems.length;
                        this.resultItems.push(j);
                        j.bind("mouseover", this.onMouseOverItem.bind(this));
                        return ++k != 5
                    }, this)
                }
            }, this);
            if (joli.cloud.joliserver.connected) {
                var d = this.results.addItem({
                    heading: "Search"
                });
                d.addClass("search-web");
                if (a.length > 2) {
                    var e = RegExp("(?:\\b[a-z\\d.-]+://[^<>\\s]+|\\b(?:(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5]))(?:[;/][^#?<>\\s]*)?(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?(?!\\w)|(?:mailto:)?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5]))(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?(?!\\w))", "ig"),
                        f = /^[a-z\d.-]+:\/\//i,
                        g = {
                            "'": "`",
                            ">": "<",
                            ")": "(",
                            "]": "[",
                            "}": "{",
                            "\u00c2\u00bb": "\u00c2\u00ab",
                            "\u00e2\u20ac\u00ba": "\u00e2\u20ac\u00b9"
                        };
                    if (matches = e.exec(a)) {
                        link = matches[0];
                        idx_last = e.lastIndex;
                        idx = idx_last - link.length;
                        if (!/[\/:]/.test(a.charAt(idx - 1))) {
                            do {
                                link_last = link;
                                quote_end = link.substr(-1);
                                if (quote_begin = g[quote_end]) {
                                    matches_begin = link.match(RegExp("\\" + quote_begin + "(?!$)", "g"));
                                    matches_end = link.match(RegExp("\\" + quote_end, "g"));
                                    if ((matches_begin ? matches_begin.length : 0) < (matches_end ? matches_end.length : 0)) {
                                        link = link.substr(0, link.length - 1);
                                        idx_last--
                                    }
                                }
                                if (options.punct_regexp) link = link.replace(options.punct_regexp, function (h) {
                                    idx_last -= h.length;
                                    return ""
                                })
                            } while (link.length && link !== link_last);
                            href = link;
                            f.test(href) || (href = (href.indexOf("@") !== -1 ? !href.indexOf("mailto:") ? "" : "mailto:" : !href.indexOf("irc.") ? "irc://" : !href.indexOf("ftp.") ? "ftp://" : "http://") + href);
                            e = d.addItem({
                                text: _("Go to") + " " + a,
                                icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA9JJREFUGBltwUlonFUAwPH/+773JZOZLJNlsrZuTeymTdIlra1BwUOLB4uttkix4kkQpXgrvbkcRKmgFryIVujBIkrBjRYVtYcGgwtk68Y0aZPMNHGaZTLL99733nMEkVL6+wnu4tBLR2W8pmbA873tOLcW53C4S9ZEQ1qr3z776B3DHQR3OPrWh/tvzufeCIv5DeVSAWsicA7heUgp8WUw5qw9fvrkiU+5jeA/k5lc8uSp0yfGLqUPJpNJee3KBFqFBNJHAEqFCCCoCgiCagScCVX4wg/ffLFMhaDi+Oc/JjpbGs+Oj/y1y/cl53/5lWRdgq6OFJgIAcggIJvJMDMzjZQSIQQyCH5c092z+8S7rxtJhfWr3vNiNbt6+zdzfSbLxr7N+KbMlfERosgQqRCspq+/n47OTkZHRgGHUvqJjra2N4Fj4v0zF7bKWGwYL6C5Pk5haZHM9HV+/v5bunvW0tXRhtUhN7MZMtNT3Lu6i9nsHMViEWMi6mrr1O49e3r9pw6/fMz5wYDBR/oeqYY4F0fHsV4Va3p66GpN0tXWTCJRS12yCYegv3cTsqqKpcVl8it5P5VqUbIuERu8VXYgQGmLiAdkZ6bR1kdFFuEJPCGIx2M00cwtZ3lm724iY7iavsF3Z8+Ry+Uel9q4dk944AlCY7AIGhoauHwlzXw2Sdw3hLUxEIK5uTmINL7v45xldVcrB/btZXo22+5Zx/+sdSwWFTt2bEM4w/TkVaambnAjM8fE+ASXJy7y6M4BYtUB/7LWgYCG+jrPU8ZmEA5nHZ6AhZUi9S2tHD60n9WdKfILN7k0NkqpWOK5g/sYHNhEGCqsdRhjMMbgcH/LlZI+H0/IXuNAAtKD+YVlulet4tkDT7O8lOeeVCPtrc00NdRSDhXGWLTWKKUxkSGybkh8PZzeenk+Pyx8icQR8yy2mGdl8RbdXSkGN68nHq9Ga4OOIqyxhFpRKJRZKRQJlXK5fOERQcXbXw19Ekj5oudBMTdPWFhhS08n23vX4fsezjlwDmMsKoool0OKpTKh0vied2pb/8bnJRU1Tr8mIr1JG7tldjLNAx1NDPStp1As4QsBQuCcwxiDUppQa3QUUV0V/LGqo+0VKjwqjuwfXKoW7slGaX9a13MfszMZhob/REofbQxhGFIqlSmVQ3QU4ZwjkMG5lqbknlRL4xIVgtt8ee6C11xf8+rScv7I6NjE/e2pJrb0biRRmyAMNc45lNYjWkUf7Nj68MfcRnAXYxfTCTzxWPra5M6p6zMtne1tVx/a8ODC8kphJAzV77sG+gx3+AfTfOfVZV2UgAAAAABJRU5ErkJggg=="
                            });
                            e.action = joli.bind(window.open, null, href, a);
                            e._index = this.resultItems.length;
                            this.resultItems.push(e);
                            e.bind("mouseover", this.onMouseOverItem.bind(this))
                        }
                    }
                }
                e = d.addItem({
                    text: _("Search on Jolicloud"),
                    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAV1JREFUOBG1wb1LVlEcAODnnPdohRZBa5NDQQhB1BIO9QekUzS1tDbVWEFb2NhUSx9Lf0ZTQVtCNDSEQ1sQxKv5kffe88vohUR8IZX7PCki9CHrSdaTrCdZT8qt98uO5GQyJydKcvroQGAyMzXI5yeyO4k5nMQweNdWT3529cNmJdlbMUZwc6PG041qyj+nMIPrwe3ES2MUIynRBBs1JK78Cq9EZHs7JnkufA3e2EMxktBG+NFUJaVHyGG8RMJicBmNXYq/Mq7VcGG1jYksLvk/FyOZxZJdSjDdRrxe62LetrAt7McMluyQU1LWu7iHeQc3bYeSWF5vlWFTbzicc0YGKfm2VX1cbZRhF8cdzkKEBzlpVtvOl7XOH2WlqZ9w1cGdDe5uVY+/b3UCCWWljYc1zCUmHNxiyxDPEgKlC283ayw0Ne7jDAb2L2MxmMULfE4RoQ9ZT7KeZD3JevIbXfSJnGgG0o8AAAAASUVORK5CYII="
                });
                e.action = joli.bind(function () {
                    this.more = true;
                    this.trigger("search", [a])
                }, this);
                e._index = this.resultItems.length;
                this.resultItems.push(e);
                e.bind("mouseover", this.onMouseOverItem.bind(this));
                d = d.addItem({
                    text: _("Search on Google"),
                    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADQklEQVQ4ja2SS2icVRiGn++c/5/MTCa3ySRNaGtbEzFUsmgjClVasdoWpCoo6kJpQFDBla6KBVctdiMIIkKrIi4aFUREEANGlF68QJXUEqMJNDa3mt4m6dz/c87nIkrsWt/Vu3p4eb5PVJX/I+af4jx6dnpWtwyPaLz/A33tk3Ma8NpYKeqp++7RCSOaWKtBRINYrRrR6yJ6E8g71Fo4/OEEM7VOwro7OPrFZS4sVki1tDD01nHyzVlsCIhYkABAIOIPuwozADYC7xzn/wyQayNYy0o1ZuSHGcCSHthKfce9OIRgPA6hoRYVh4Z/LdIAkUSsa09jGgFDHSOW8xcciEMs+JYsCRYbIFKDFU9DITEWgAhAzCp272CB078uEjV1EEIdYyICFlOHpYlJ5nsN11s6iBvQXSzRtZKQqF8DTV8s0ndLnuf29XPi5CyTl5ZpzQSGd21AEI6NvsPhvTVmb9uGlRTeBzKVhG3TVR49c5GtgKgqAwfe1yPDd/PYrgGK5YTPzs6zo6+Nvo0dHB09zqEf38T2tEFQfPCAQRJBTYyULOHgmIiq0v3kR5rUS2zfnOX+oR4OPb0TRPlm6id2v/sEob8bggEBacQAaOIQF4MTwsFvxQDkbYNcKs2ZqRqvn/idmaUyqpZb8+vp79sO9RomGIyPUBwSFCFGADWNtaslxStsyNR5+M4Cz+wboLjiUYGNnb2cfuoYewo70UqJoAJqCQIKBAWS1YWiqox8Na4PDg3S2WFwyxNcuzpFZWWB3v7HSee6SLzjkY9f5svFMTTVCt5ikkDwFjzoKydXHRHQ0pVxpr57gQ7OEcUVtG4oJQOs3/0prfk+JpfmuOu9A9zINrDOol4ITsCBvvq3o3oo89vY82yJvmdTV42e1iyF9iYKMsHSqZdQDLcXNtHT3A31BC9K8BC7GHGs/VFjeYmcmyMdt3Oj5BBnCR6ymTy+No8kZaqmmVqpDBJjXIogCV49GnRNdqZ9M01dD1C+5tBaFvUpIsnhq5am3v1oKsfnP4+ysLyIeIP4AFVDaAQIqTXZAK58VYvjbxAt/4JJKoQ4TVPPHuzgs0wuXOKht19kzlzGmGYCAupAY/TI13IT6L/mL1yjlbSa293rAAAAAElFTkSuQmCC"
                });
                d.action = joli.bind(window.open, null, "http://www.google.com/search?q=" + a, "Search");
                d._index = this.resultItems.length;
                this.resultItems.push(d);
                d.bind("mouseover", this.onMouseOverItem.bind(this))
            }
            this.results.$.show();
            this.results.$.css({
                left: this.input.$.offset().left + "px",
                width: this.input.$.width() + 52 + "px"
            });
            this.setSelectedItem(this.resultItems[0])
        }
    },
    hideSearchResults: function () {
        this.results.$.hide()
    }
});
joli.system.filesystem = new joli.remote.Resource(joli.system.websocketserver, "filesystem/", {
    list: {
        params: "path,root"
    },
    open: {
        params: "path,root"
    },
    account: {
        params: "root"
    }
});
joli.cloud.jolibackgroundserver = new joli.cloud.JoliServer({
    baseUrl: "http://backgrounds.jolicloud.com/",
    Request: joli.cloud.Request,
    connected: false
});
joli.cloud.backgrounds = new joli.remote.Resource(joli.cloud.jolibackgroundserver, "", {
    getData: {
        url: "getData",
        params: "uri",
        offline: false,
        ttl: 0
    }
});
joli.cloud.googledocs = new joli.remote.Resource(joli.cloud.joliserver, "files/googledocs/", {
    account: {
        url: "account_info",
        params: "",
        ttl: 300
    },
    list: {
        url: "list",
        params: "path,docs_path,ids_docs_path,next",
        ttl: 300
    }
});
joli.cloud.user = new joli.remote.Resource(joli.cloud.joliserver, "", {
    getDashboard: {
        url: "dashboard",
        ttl: 10,
        offline: true,
        model: "app"
    },
    lastDashboardUpdate: {
        url: "dashboard/updated_at"
    },
    setDashboard: {
        url: "dashboard/update",
        params: function (a) {
            return JSON.stringify({
                list: a.shift()
            })
        },
        contentType: "application/json",
        type: "PUT"
    },
    stream: {
        url: "actions",
        params: "page,per_page",
        ttl: 300
    },
    followings: {
        url: "subscriptions",
        ttl: 300
    },
    followers: {
        url: "users/subscribers",
        ttl: 300,
        model: "user"
    },
    follow: {
        url: "subscriptions/create",
        params: "type,actor",
        type: "POST"
    },
    unfollow: {
        url: "subscriptions/destroy",
        params: "type,actor",
        type: "POST"
    },
    me: {
        url: "users/show",
        params: "type=myself",
        ttl: 300,
        offline: true,
        model: "user"
    },
    id: {
        url: "users/show",
        params: "username",
        ttl: 300,
        model: "user"
    },
    userActions: {
        url: "actions/actor_timeline",
        ttl: 300
    },
    myActions: {
        url: "actions/actor_timeline",
        params: function (a) {
            a = a.shift();
            a.type = "myself";
            return a
        },
        ttl: 300
    },
    history: {
        url: "actions/history",
        ttl: 300
    },
    computers: {
        url: "computers",
        ttl: 300,
        offline: true
    },
    invitations: {
        url: "users/invitations",
        ttl: 300
    },
    sendInvitation: {
        url: "users/invitations",
        type: "POST"
    },
    badges: {
        url: "users/badges",
        ttl: 300,
        offline: true
    },
    index: {
        url: "users/",
        ttl: 300,
        model: "user"
    },
    updateLastActionRead: {
        url: "account/update_last_action_read",
        params: "read_time"
    },
    associateComputer: {
        url: "account/associate_computer",
        params: "uuid,version",
        type: "POST"
    },
    checkFacebook: {
        url: "account/check_facebook"
    },
    facebookFriends: {
        url: "account/facebook_friends"
    },
    top: {
        url: "account/top_users"
    },
    setBackground: {
        url: "dashboard/set_background",
        params: "uri,options",
        type: "PUT"
    },
    getBackground: {
        url: "dashboard/get_background"
    }
});
joli.cloud.stats = new joli.remote.Resource(joli.cloud.joliserver, "stats/", {
    report: {
        url: "add",
        params: "act,object_type,object_ref",
        type: "POST"
    }
});
joli.cloud.apps = new joli.remote.Resource(joli.cloud.joliserver, "apps/", {
    index: {
        url: "",
        ttl: 300,
        model: "app"
    },
    searchwebapps: {
        url: "index",
        model: "app",
        params: "name,type,sort,url"
    },
    addwebapp: {
        url: "addwebapp",
        model: "app",
        params: "name,url,description,category,icon,icontype",
        type: "POST"
    },
    promotedapps: {
        url: "promoted_apps",
        model: "app"
    },
    categories: {
        url: "categories",
        ttl: 300,
        params: function () {
            return {
                relevant: true
            }
        }
    },
    oemapps: {
        url: "oemapps",
        model: "app"
    },
    id: {
        url: "show",
        params: "package",
        ttl: 300,
        model: "app"
    },
    report: {
        url: "report",
        params: "package"
    },
    like: {
        url: "like",
        params: "package"
    },
    unlike: {
        url: "unlike",
        params: "package"
    },
    favorites: {
        url: "favorites",
        ttl: 300,
        model: "app"
    },
    friendsThatLike: {
        url: "friends_likes",
        params: "package",
        ttl: 300
    },
    add: {
        url: "notify_action",
        params: function (a) {
            return joli.computer && joli.computer.uuid && !joli.defaultoem ? {
                packages: a.shift(),
                notified_action: "install",
                computer_id: joli.computer.uuid
            } : {
                packages: a.shift(),
                notified_action: "install"
            }
        },
        type: "POST"
    },
    remove: {
        url: "notify_action",
        params: function (a) {
            return joli.computer ? {
                packages: a.shift(),
                notified_action: "remove",
                computer_id: joli.computer.uuid
            } : {
                packages: a.shift(),
                notified_action: "remove"
            }
        },
        type: "POST"
    },
    saveSystemUpdate: {
        url: "notify_action",
        params: function () {
            if (joli.computer) return {
                packages: "jolicloud-system-update",
                notified_action: "update",
                computer_id: joli.computer.uuid
            }
        },
        type: "POST"
    },
    sync: {
        url: "sync",
        params: function (a) {
            return joli.computer ? JSON.stringify({
                apps: a.shift(),
                computer_id: joli.computer.uuid
            }) : JSON.stringify({
                apps: a.shift()
            })
        },
        contentType: "application/json",
        type: "POST"
    },
    saveAppsSync: {
        url: "notify_action",
        params: function () {
            if (joli.computer) return {
                packages: "jolicloud-system-sync",
                notified_action: "sync",
                computer_id: joli.computer.uuid
            }
        },
        type: "POST"
    }
});
joli.cloud.dropbox = new joli.remote.Resource(joli.cloud.joliserver, "files/dropbox/", {
    account: {
        url: "account_info",
        params: "",
        ttl: 300
    },
    list: {
        url: "list",
        params: "path",
        ttl: 300
    },
    get: {
        url: "get",
        params: "path"
    },
    thumbnail: {
        url: "thumbnail",
        params: "path"
    }
});
joli.system.folders = new joli.remote.Resource(joli.system.websocketserver, "folders/", {
    open: {
        params: "uri"
    },
    list: {
        params: "uri"
    },
    isFile: {
        url: "is_file",
        params: "uri"
    },
    isFolder: {
        url: "is_folder",
        params: "uri"
    },
    favorites: {}
});
joli.system.events = new joli.remote.Resource(joli.system.websocketserver, "events/", {
    register: {
        params: "event"
    },
    unregister: {
        params: "event"
    },
    trigger: {
        params: "event, params="
    },
    events: {},
    handlers: {},
    unfilter: {},
    filter: {}
});
joli.namespace("model", {
    update: function (a, b) {
        return this.types[a].update(b)
    },
    types: {}
});
joli.model.extend("Model", joli.Obj, {
    triggers: {
        change: null
    },
    init: function (a, b) {
        this.modelType = a;
        this.id = b
    }
});
joli.model.extend("ModelType", joli.Obj, {
    triggers: {
        newinstance: null
    },
    init: function (a, b, c) {
        joli.model.types[a] = this;
        this.bindMethod("update");
        this.instances = {};
        this.properties = {};
        a = c.properties;
        delete c.properties;
        c.__get__properties = function () {
            var d = {},
                e;
            for (e in this.modelType.properties) d[e] = this[e];
            return d
        };
        this.instanceClass = joli.model.Model.extend(c);
        a && this.updateProperties(this.instanceClass.prototype, a);
        this.idproperty = b
    },
    createProperty: function (a) {
        var b = this.instanceClass.prototype;
        if (!b.__lookupGetter__(a)) {
            b.__defineGetter__(a, function () {
                return this["_" + a]
            });
            b.__defineSetter__(a, function (c) {
                if (this[a] !== c) {
                    this["_" + a] = c;
                    if (this.__bulkEdit) this.__dirty = true;
                    else this.trigger_change([a])
                }
            });
            this.properties[a] = undefined
        }
    },
    updateProperties: function (a, b) {
        a.__bulkEdit = true;
        for (p in b) {
            this.createProperty(p);
            a[p] = b[p]
        }
        delete a.__bulkEdit;
        if (a.__dirty) {
            delete a.__dirty;
            a !== this.instanceClass.prototype && a.trigger_change()
        }
    },
    update: function (a, b) {
        var c;
        if (joli.isArray(a)) c = joli.map(a, function (d) {
            return this.update(d, b)
        }, this);
        else {
            c = this.get(a[this.idproperty], b);
            this.updateProperties(c, a)
        }
        return c
    },
    get: function (a, b) {
        var c = this.instances[a];
        if (!c) {
            if (b) throw "No item found for id " + a;
            c = this.instances[a] = new this.instanceClass(this, a);
            this.trigger_newinstance([c])
        }
        return c
    }
});
joli.model.apps = new joli.model.ModelType("app", "package", {
    properties: {
        state: "unknown",
        progress: 0
    },
    install: function (a) {
        this.state = "preparing";
        this.installing = true;
        this.progress = 0;
        if (a) {
            console.log("launching synchronization", this);
            if (joli.system.websocketserver.connected) {
                a = this._package;
                var b = {
                    success: function (c) {
                        if (c.status === "finished") {
                            this.installing = false;
                            this.state = "installed";
                            this.progress = 1;
                            joli.packages_to_install && joli.packages_to_install.indexOf(this._package) != -1 && joli.each(joli.packages_to_install, function (e, f) {
                                e == this._package && joli.packages_to_install.splice(f, 1)
                            }, this)
                        } else {
                            var d = 0;
                            if (c.status === "download") {
                                this.state = "downloading";
                                d = c.progress;
                                if (d > 1) d = 1;
                                else if (d < 0) d = 0;
                                this.progress = d
                            }
                            if (c.status === "install") {
                                this.state = "installing";
                                d = c.progress;
                                if (d > 1) d = 1;
                                else if (d < 0) d = 0;
                                this.progress = d
                            }
                        }
                    },
                    error: function () {
                        this.installing = false;
                        this.state = "failed";
                        this.progress = 1;
                        joli.clearLocalRegExp("apps/index");
                        joli.clearLocalRegExp(this._package)
                    }
                };
                if (joli.versionCompare("1.1.15", joli.computer.version)) joli.system.apps.install(a, window.location.protocol + "//" + window.location.hostname + (this.picture || this.pictures.large), b, this);
                else joli.versionCompare("1.1.14", joli.computer.version) ? joli.system.apps.install(a, b, this) : joli.system.apps.installolddaemon(a, b, this);
                this.added = true;
                joli.clearLocalRegExp("apps/index");
                joli.clearLocalRegExp(this._package)
            }
        } else {
            console.log("launch install", this);
            joli.cloud.apps.add(this._package, joli.bind(function () {
                if (joli.system.websocketserver.connected) {
                    var c = this._package,
                        d = {
                            success: function (e) {
                                if (e.status === "finished") {
                                    this.installing = false;
                                    this.state = "installed";
                                    this.progress = 1;
                                    joli.packages_to_install && joli.packages_to_install.indexOf(this._package) != -1 && joli.each(joli.packages_to_install, function (g, h) {
                                        g == this._package && joli.packages_to_install.splice(h, 1)
                                    }, this);
                                    joli.ui.root.checkFreeSpace()
                                } else {
                                    var f = 0;
                                    if (e.status === "download") {
                                        this.state = "downloading";
                                        f = e.progress;
                                        if (f > 1) f = 1;
                                        else if (f < 0) f = 0;
                                        this.progress = f
                                    }
                                    if (e.status === "install") {
                                        this.state = "installing";
                                        f = e.progress;
                                        if (f > 1) f = 1;
                                        else if (f < 0) f = 0;
                                        this.progress = f
                                    }
                                }
                            },
                            error: function () {
                                this.installing = false;
                                this.state = "failed";
                                this.progress = 1;
                                joli.clearLocalRegExp("apps/index");
                                joli.clearLocalRegExp(this._package)
                            }
                        };
                    if (joli.versionCompare("1.1.15", joli.computer.version)) joli.system.apps.install(c, window.location.protocol + "//" + window.location.hostname + (this.picture || this.pictures.large), d, this);
                    else joli.versionCompare("1.1.14", joli.computer.version) ? joli.system.apps.install(c, d, this) : joli.system.apps.installolddaemon(c, d, this)
                } else {
                    this.installing = false;
                    this.state = "failed";
                    this.progress = 1
                }
                this.added = true;
                joli.clearLocalRegExp("apps/index");
                joli.clearLocalRegExp(this._package)
            }, this))
        }
    },
    remove: function () {
        console.log("launch remove", this);
        this.added = false;
        this.removing = true;
        this.state = "removing";
        this.progress = 0;
        joli.cloud.apps.remove(this._package, joli.bind(function () {
            if (joli.daemon_new_version && joli.system.websocketserver.connected) {
                joli.system.apps.remove(this._package, {
                    success: function (a) {
                        if (a.status === "finished") {
                            this.state = "removed";
                            this.removing = false;
                            this.progress = 1;
                            joli.packages_to_install && joli.packages_to_install.indexOf(this._package) != -1 && joli.each(joli.packages_to_install, function (b, c) {
                                b == this._package && joli.packages_to_install.splice(c, 1)
                            }, this);
                            joli.ui.root.checkFreeSpace()
                        } else {
                            this.state = "removing";
                            if (a.status === "remove") {
                                a = a.progress;
                                if (a > 1) a = 1;
                                else if (a < 0) a = 0;
                                this.progress = a
                            }
                        }
                    },
                    error: function () {
                        this.state = "failed";
                        this.removing = false;
                        this.progress = 1;
                        joli.clearLocalRegExp("apps/index");
                        joli.clearLocalRegExp(this._package)
                    }
                }, this);
                joli.clearLocalRegExp("apps/index");
                joli.clearLocalRegExp(this._package)
            } else {
                this.state = "removed";
                this.removing = false;
                this.progress = 1;
                joli.clearLocalRegExp("apps/index");
                joli.clearLocalRegExp(this._package);
                joli.packages_to_install && joli.packages_to_install.indexOf(this._package) != -1 && joli.each(joli.packages_to_install, function (a, b) {
                    a == this._package && joli.packages_to_install.splice(b, 1)
                }, this)
            }
        }, this))
    },
    update: function () {}
});
joli.model.users = new joli.model.ModelType("user", "username", {});
joli.cloud.computers = new joli.remote.Resource(joli.cloud.joliserver, "computers/", {
    dissociate: {
        url: "dissociate",
        params: "uuid"
    },
    show: {
        url: "show",
        params: "uuid,password"
    },
    associate: {
        url: "associate",
        params: "uuid,password,associate_token,version",
        type: "POST"
    },
    create: {
        url: "create",
        params: "uuid,password,name,model_id,devicetype,description,version",
        type: "POST"
    }
});
joli.ui.templates["joli/tabview"] = '<nav data-class="joli.chooser" data-item="joli/tabview/item" data-css="joli-tabview"> <ul data-var="container" data-class="joli.widget"> <li data-template="item" data-ui="joli/button" data-css="item joli-button"></li> </ul> </nav>';
joli.ui.templates["joli/searchfield"] = '<div> <input data-var="input" type="text" placeholder="_(\'Search apps and friends\')" /> <div data-var="clearinput"> <a data-var="clearlink" data-event="clear">_("Clear")</a> </div> <ul data-var="results" data-ui="joli/sectionchooser"></ul> </div> ';
joli.ui.templates["joli/chooser"] = "<ul></ul>";
joli.ui.templates["joli/sectionchooser"] = '<div data-item="joli/sectionchooser/section"> <div data-template="section" data-item="joli/sectionchooser/item" data-class="joli.chooser" data-css="section"> <h4 data-var="heading"><span data-var="title"></span></h4> <ul data-var="container"> <li data-template="item" data-ui="joli/button" data-css="item"></li> </ul> </div> </div>';
joli.ui.templates["joli/sidebar"] = '<nav data-css="joli-sidebar" data-ui="joli/sectionchooser"></nav> ';
joli.ui.templates["joli/progressbar"] = '<div> <span data-var="fill"></span> </div>';
joli.ui.templates["joli/tableview"] = "<dl></dl>";
joli.ui.templates["joli/modalbox"] = '<div> <div class="content"> <div class="inset-light"> <h1 data-var="title"></h1> <p data-var="description"></p> <div data-var="form"></div> <ul data-var="buttons"> <li data-template="item" data-ui="joli/button"></li> </ul> </div> </div> </div> ';
joli.ui.templates["joli/stackcontainer"] = '<div> <div data-var="buttonpanel" data-ui="joli/navigationbar"></div> </div>';
joli.ui.templates["joli/toolbar"] = '<ul> <a data-template="item" data-class="joli.clickable" data-css="item"> <span data-var="icon"></span> </a> </ul>';
joli.ui.templates["joli/combobox"] = '<div> <input data-var="input" type="text"> <input data-var="value" type="hidden"> <div data-var="scroll"> <ul data-event="choice" data-var="choices" data-ui="joli/sectionchooser" ></ul> </div> <p data-var="noresults">_("Sorry, no results.")</p> </div> ';
joli.ui.templates["joli/paginator-dots"] = '<div> <ul data-var="container" data-class="joli.widget"> <li data-template="item" data-ui="joli/button" data-css="item"></li> </ul> </div> ';
joli.ui.templates["joli/paginglist"] = '<div> <ul data-var="list"></ul> <p data-var="noresults"></p> <div data-target="list" data-ui="joli/paginator" data-var="pager"></div> </div>';
joli.ui.templates["joli/navigationbar"] = '<section data-class="joli.widget"> <div data-var="back" data-event="navigate_back" data-ui="joli/button">_("Back")</div> <div data-var="next" data-event="navigate_next" data-ui="joli/button">_("Next")</div> <div data-var="prev" data-event="navigate_prev" data-ui="joli/button">_("Previous")</div> </section>';
joli.ui.templates["joli/paginator"] = '<div> <div class="controls"> <span class="prev"> <a data-var="prev" data-event="prevpage"></a> </span> <ul data-var="container" data-class="joli.widget"> <li data-template="item" data-ui="joli/button" data-css="item"></li> </ul> <span data-var="current"></span> <span class="next"> <a data-var="next" data-event="nextpage"></a> </span> </div> </div> ';
joli.ui.templates["joli/loader"] = '<div> <span class="circle"></span> <span class="circle"></span> <span class="circle"></span> </div>';
joli.ui.templates["joli/button"] = '<div> <a> <span data-var="icon"></span> <span data-var="label"></span> <span data-var="extra"></span> </a> </div>';