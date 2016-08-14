/**
 * Dragonqiu's codes, common function.
 * A js tools.
 * @version 1.0.10
 */

(function namespace(exports) {
    'use strict';

    var _d = document,
        _w = window,
        // 请求seq ID
        _cnums = 0,
        _callbacks = {};

    function _setData(opts, obj) {
        for (var k in obj.settings) {
            var defaultOp = obj.settings[k];
            obj.settings[k] = 
                (typeof opts[k] !== "undefined")? opts[k]:defaultOp;
        }
    }

    // 公共使用小工具类
    function Tools(){
        this.version = "1.0.10";
    };

    Tools.prototype = {
        // 判断是否为数组
        isArray: function(value) {
            if (typeof Array.isArray === "function") {
                return Array.isArray(value);
            }else{
                return Object.prototype.toString.call(value) === "[object Array]";
            }
        },
        // 判断是否为百分数字符串
        isPercent: function(value) {
            if (typeof value !== "string") return false;
            return /^1{0,1}\d{1,2}%$/.test(value);
        },
        // 判断字符是否为中文
        isChinese: function (text){ 
            var re = /[^\u4e00-\u9fa5]/; 
            if(re.test(text)) return false; 
            return true; 
        },
        // 获取URL指定参数方法
        getUrlParameters: function(staticURL, decode){
            var currLocation = (staticURL.length)? staticURL : window.location.href,
                parArr_0 = currLocation.split("?"),
                data = {};
   
            if(parArr_0.length > 1){
                var parArr = parArr_0[1].split("&");
                for(var i = 0; i < parArr.length; i++){
                    var parr = parArr[i].split("=");
                    if(parr.length > 1){
                        var value = (decode) ? decodeURIComponent(parr[1]) : parr[1];
                        data[parr[0]] = value;
                    }
                }
            }
   
            return data;
        },
        // 获取cookie
        getCookie : function (name){
            var nameEQ = name + "=";
            var ca = _d.cookie.split(';');
            for (var i =0; i< ca.length ; i++){
                var c = ca[i];
                while(c.charAt(0) == ' '){
                    c = c.substring(1,c.length);
                }
                if (c.indexOf(nameEQ) == 0){
                    return unescape(c.substring(nameEQ.length,c.length));
                }
            }
            return null;
        },
        // 禁用浏览器操作
        unBrowersCtrl: function() {
            _d.addEventListener("keydown", function (event) {
                var acEl = document.activeElement;
                if (acEl.nodeName.toLowerCase() != "input" && acEl.nodeName.toLowerCase != "textarea") {
                    event.preventDefault();
                } else {
                    if (acEl.readOnly) {
                        event.preventDefault();
                    }
                }
            }, false);

            _w.addEventListener('mousewheel', function (event) {
                if (event.ctrlKey == true) {
                    event.preventDefault();
                }
            });
        },
        // 简易模板
        template: function (tpl, data) {
            return tpl.replace(/\{\{\s*([\w\.]+)\s*\}\}/g, function(){
                var keys = arguments[1].split('.');
                var newData = data;
                for (var k = 0,l=keys.length;k < l;++k)
                newData = newData[keys[k]]
                return newData;
            })
        },
        // html转义
        escapeHtml: function(s){
            this.REGX_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g; 
            return (typeof s != "string") ? s :
                s.replace(this.REGX_HTML_ENCODE,
                    function($0){
                        var c = $0.charCodeAt(0), r = ["&#"];
                        c = (c == 0x20) ? 0xA0 : c;
                        r.push(c); r.push(";");
                        return r.join("");
                    })
        },
        // 格式化时间
        dateFormat: function(date, format){
             var o = {
                 "M+" : date.getMonth()+1, //month
                 "d+" : date.getDate(),    //day
                 "h+" : date.getHours(),   //hour
                 "m+" : date.getMinutes(), //minute
                 "s+" : date.getSeconds(), //second
                 "q+" : Math.floor((date.getMonth()+3)/3),  //quarter
                 "S" : date.getMilliseconds() //millisecond
             }

             if (/(y+)/.test(format)) format=format.replace(RegExp.$1,
             (date.getFullYear()+"").substr(4 - RegExp.$1.length));
             for (var k in o) if(new RegExp("("+ k +")").test(format))
             format = format.replace(RegExp.$1,
             RegExp.$1.length==1 ? o[k] :
             ("00"+ o[k]).substr((""+ o[k]).length));
             return format;
        },
        // 字符串中插入集合数据
        insertData: function(str, tuple) {
            var r     = new RegExp(tuple.map(function(s) { return '(' + s + ')'; }).join(''), 'g'),
                s     = tuple.join('');
            return s.replace(r, str);
        },
        // 设置Stylesheet
        setStyle: function(value) {
            var styleSheet;
            if (document.styleSheets.length > 0) {
                styleSheet = document.styleSheets[0];
            }else{
                var styleEl = document.createElement('style');
                document.head.appendChild(styleEl);
                styleSheet = styleEl.sheet;
            };

            styleSheet.insertRule(value, styleSheet.cssRules? styleSheet.cssRules.length:0);
        },
        // 给url加参数
        makeUrlParams: function(url, params) {
            if (typeof url == "undefined") {
                url = '';
            }
            if (Object.keys(params).length > 0) {
                url += '?';
                parr = [];
                for (var p in params) {
                    parr.push([p, params[p]].join('='));
                }
                url += parr.join('&');
            }
            return url;
        },
        /** 获得js文件数据
         * @param {string} url - 获取js文档的地址
         * @param {function} 
         * @param {function}
         * @param {string} varName 获取js文档的数据变量名
         */
        getJSFileData: function(url, callback, error, varName) {
            var req = new Req();

            var head = document.getElementsByTagName('head')[0];
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.charset = "UTF-8";
            s.src = url;
            s.async = true;

            var addListener = function(){}; // Default to no-op function
            var removeListener = function(){}; // Default to no-op function

            if (s.addEventListener) {
                addListener = function(listener) {
                    s.addEventListener("load", listener);
                };
                removeListener = function(listener) {
                    s.removeEventListener("load", listener);
                };
            } else if (s.attachEvent) {
                addListener = function(listener) {
                    // attachEvent wants 'oneventType' instead of 'eventType'
                    s.attachEvent('onreadystatechange', listener, true);
                };
                removeListener = function(listener) {
                    s.detachEvent("load", listener);
                };
            }

            function jsOnloaded() {
                if(/loaded|complete|undefined/.test(s.readyState)) {
                    if (!req.jsFileloaded) {
                        req.jsFileloaded = true;
                        var data = varName? eval(varName):{};
                        callback(data);
                        removeListener(jsOnloaded);
                        head.removeChild(s);
                    }
                }
            }

            // Now you can add listeners with a browser-agnostic function call!
            addListener(jsOnloaded);

            s.ontimeout = s.onerror = function() {
                error.call(this);
                s.onerror = null;
            };

            // TODO这里需要考虑js文件加载失败的情况。
            head.appendChild(s);
        },
        checkJsExecTime: function(fun) {
            var start = new Date().getTime();
                fun();
            var end   = new Date().getTime();

            console.log(start - end);
        }
    }

    var tools = new Tools;

    // 请求类
    function Req(opts){
        this.settings = {
            uri: "",
            mimeType: "application/json",
            format: "json",
            mode: "XHR",
            content: "",
            data: null,
        };
        opts && _setData(opts, this);
    };

    Req.prototype = {
        // 请求获取数据
        get: function(opts) {
            opts && _setData(opts, this);

            var settings = this.settings;
            
            switch(settings.mode) {
                case 'XHR':
                    var xhr = this.xhr   = new XMLHttpRequest();
                    xhr.overrideMimeType = this.mimeType;
                    xhr.open('GET', settings.uri, true);
                    xhr.send(settings.data);
                    break;
                case 'SRC':
                    var head       = document.head,
                    script         = document.createElement('script');
                    script.type    = 'text/javascript';
                    script.charset = "UTF-8";
                    script.src     = settings.uri;
                    script.async   = true;
                    script.setAttribute("data-content", settings.content);
                    head.appendChild(script);
                    break;
                case 'CALLLUA':
                    var data = settings.data;
                    data.seq = ++_cnums;
                    var json = JSON.stringify(data);
                    _w.external.callcpp(settings.uri, json);
                    break;
                default:
                    break;
            }

            return new Promise(function(resolve, reject) {
                switch(settings.mode) {
                    case "XHR":
                        xhr.onreadystatechange = function() {
                            if (xhr.readyState === 4) {
                                if (xhr.status >=  200 && xhr.status < 300) {
                                    var data   =   xhr.responseText;
                                    resolve(data);
                                } else {
                                    reject(new Error(xhr.statusText));
                                }
                            }
                        }
    
                        xhr.onerror = function() {
                            reject(error);
                        }
                        break;
                    case "SRC":
                        function _jsOnLoaded() {
                            var content = script.getAttribute("data-content");
                            var data = content? eval(content):{};
                            script.removeEventListener('load', _jsOnLoaded);
                            resolve(data);
                        }
                        function _failed(err) {
                            reject(data);
                        }
                        script.addEventListener('load', _jsOnLoaded, false);
                        script.addEventListener('error', _failed, false);
                        break;
                    // TODO 该支持需要变更，目前客户端的支持不规范
                    case 'CALLLUA':
                        var seq = "seq_" + data.seq;
                        if (!_callbacks[seq]) {
                            var obj = _callbacks[seq] = {};
                            obj.oncallback = function(data) {
                                resolve(data);
                            };

                            obj.onerror = function(error) {
                                reject(error);
                            };

                            var fun = "fun_" + settings.uri.replace("jc_", "");
                            var obj_new = _callbacks[fun] = {};
                            obj_new.oncallback = function(data) {
                                resolve(data);
                            };

                            obj_new.onerror = function(error) {
                                reject(error);
                            };
                        }
                        break;
                    default:
                        break;
                }
            });
        },
        // 监听获取数据
        on: function(eventname, callback) {
            var settings = this.settings;

            switch(settings.mode) {
                case 'CALLLUA':
                    var ev = "fun_" + eventname;
                    if (!_callbacks[ev]) {
                        var obj = _callbacks[ev] = {};
                        obj.oncallback = callback;
                        obj.onerror = function() {};
                    }
                    break;
                default:
                    break;
            }
        }
    };
    
    var Report = function() {
        var self = this;
        this.jsFileLoaded = false;
        this.url = "http://pingjs.qq.com/tcss.ping.js",
            tools.getJSFileData(this.url, function() {
                self.jsFileLoaded = true;
            }, function() {}, "");
    };

    Report.prototype = {
        /**
         * param 为空的话，默认统计的数据不区分?后面的参数，否则为k-v格式参数.具体参数表示：
         *  senseParam:"**", //适用于区分?参数的统计
         *  virtualURL:"**", //虚拟URL地址的统计
         *  ... 其他参数详见tcss js上报指引   (上面)
         */
        visited: function(param) {
            var self = this;
            try {
                self.jsFileLoaded ? pgvMain(param) : tools.getJSFileData(url, function() {
                    (typeof pgvMain === "function") && pgvMain(param);
                }, function() {}, "");
            } catch (e) {}
        },

        /**
         * 点击流统计，参数为tag分类。TCSS规定为4级分类。
         * path_of_tag just like : "PLS.".
         */
        clicked: function(path_of_tag) {
            var self = this;
            try {
                self.jsFileLoaded ? pgvSendClick({
                    hottag: path_of_tag
                }) : tools.getJSFileData(url, function() {
                    (typeof pgvSendClick === "function") && (pgvSendClick({
                        hottag: path_of_tag
                    }));
                }, function() {}, "");
            } catch (e) {}
        }
    };


    /**
     * 滚动加载组件
     *
     */
    function ScrollLoad(opts) {
        this.settings = {
            container: "div",
            specified: -1,
            onScrollToSpecified: function() {
                console.log("[ScrollLoad] 滚动到位置" + this.position);
            },
            onScrollToBottom: function() {
                console.log("[ScrollLoad] 滚动到底部啦...");
            },
            // 滚动中事件处理
            onScroll: null
        };
        opts && _setData(opts, this);
        this.init();
    }

    Object.defineProperties(ScrollLoad.prototype, {
        "init": {
            value: function() {
                var _errorCodeList = {
                    paramError: "参数配置错误：{{ param }}"
                }

                this.scrollCon = _d.querySelector(
                    this.settings.container);

                var self = this;
                function _scrollBottom() {
                    var settings = self.settings,
                        con      = self.scrollCon;

                    settings.onScroll && settings.onScroll.call(self);

                    if (settings.specified !== -1) {
                        if (settings.specified >= 0 
                            || tools.isPercent(settings.specified)) {
                            if (settings.specified >= 0) {
                                if (con.scrollTop >= specified)
                                    settings.onScrollToSpecified.call(self);
                            } else if (tools.isPercent(settings.specified)) {
                                if (con.scrollTop * 100 / (con.scrollHeight - con.clientHeight)
                                    >= parseInt(settings.specified))
                                    settings.onScrollToSpecified.call(self);
                            }

                            return;
                        }else{
                            //TODO 报错处理有问题
                            //throw (
                                //new Error(
                                    //tools.template(_errorCodeList["paramError"],
                                        //{ param: "specified" }));
                        }
                    }

                    if (con.scrollTop + 
                        con.clientHeight === con.scrollHeight) {
                        settings.onScrollToBottom.call(self);
                    }
                }

                this.scrollCon.addEventListener("scroll", _scrollBottom, false);
            }
        },
        "position": {
            get: function() {
                return this.scrollCon.scrollTop;
            }
        }
    });

    /**
     * 滚动广告组件
     *
     */
    function RollAds(opts) {
        this.settings = {
            rollList: "ul",
            needPlay: true,
            speed: 20
        };
        opts && _setData(opts, this);
        this.init();
    }

    Object.defineProperties(RollAds.prototype, {
        "init": {
            value: function() {
                var self     = this,
                    settings = this.settings;
                
                this.ticker = null;
                this.roll   = _d.querySelector(settings.rollList);

                this.list = this.roll.querySelector('ul');
                this.height = this.list.offsetHeight;
                var copy  = this.list.cloneNode(true);
                this.roll.appendChild(copy);
                this.roll.addEventListener("mouseenter", function() {
                    self.pause();
                }, false);
                this.roll.addEventListener("mouseleave", function() {
                    self.play();
                }, false);

                this.ticker = setInterval(function() {
                    self.rolling();
                }, 100);
            }
        },
        "rolling": {
            value: function() {
                var self = this,
                    currTop = parseInt(self.roll.scrollTop);

                if (currTop < this.height) {
                    currTop += 4;
                }else{
                    currTop  =  0;
                }

                self.roll.scrollTop = currTop;
            }
        },
        "updateSettings": {
            value: function(opts) {
                opts && _setData(opts, this);
            }
        },
        "play": {
            value: function() {
                var self = this;
                if (this.settings.needPlay) {
                    this.ticker = setInterval(function() {
                        self.rolling();
                    }, 100);
                }
            }
        },
        "pause": {
            value: function() {
                if (this.settings.needPlay) {
                    clearInterval(this.ticker);
                }
            }
        }
    });

    // 组件绑定
    tools.Req = Req;
    tools.Report = Report;
    tools.ScrollLoad = ScrollLoad;
    tools.RollAds = RollAds;

    // 添加lua call js 监听
    _w.on_hostapp_callback = function (callback_name, json_param) {
        if (json_param) {
            try {
                var data = JSON.parse(json_param);
                if (data.seq) {
                    var seq = "seq_" + data.seq;
                    var obj = _callbacks[seq];
                    if(obj && typeof obj.oncallback == 'function'){
                        obj.oncallback(data);
                        delete _callbacks[seq];
                        return;
                    }

                    if (obj && typeof obj.oncallback == 'function') {
                        obj.onerror({ message: "获取lua数据失败..." });
                    }
                    delete _callbacks[seq];
                    return;
                }else{
                    var fun = "fun_" + callback_name.replace("cj_", "");
                    var obj = _callbacks[fun];
                    if (obj && typeof obj.oncallback == 'function'){
                        obj.oncallback(data);
                        delete _callbacks[fun];
                        return;
                    }
                    
                    if (obj && typeof obj.onerror == 'function') {
                        obj.onerror({ message: "获取lua数据失败..." });
                    }
                    delete _callbacks[fun];
                    return;
                }
            }catch(e) {
            }
        }
    }

    // 模块定义
    if (typeof(module) === 'object' && module.exports === exports) {
        module.exports = tools;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            'use strict';
            return tools;
        });
    } else {
        exports.tools = tools;
    }
})(this)
