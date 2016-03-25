/**
 * common function.
 * A js tools.
 * @version 1.1
 */

(function(exports) {
    'use strict';

    // 私有方法，配置对象参数
    function _setData(opts, obj) {
        for (var k in obj.settings) {
            var defaultOp = obj.settings[k];
            obj.settings[k] = opts[k] || defaultOp;
        }
    }

    // 公共使用小工具
    function Tools(){
        this.version = "1.1";
    };

    Tools.prototype = {
        // 生成模板
        template: function (tpl, data) {
            return tpl.replace(/\{\{\s*([\w\.]+)\s*\}\}/g, function(){
                var keys = arguments[1].split('.');
                var newData = data;
                for (var k = 0,l=keys.length;k < l;++k)
                newData = newData[keys[k]]
                return newData;
            })
        },
        // 判断是否为数组
        isArray: function(value) {
            if (typeof Array.isArray === "function") {
                return Array.isArray(value);
            }else{
                return Object.prototype.toString.call(value) === "[object Array]";
            }
        },
        // 禁用浏览器操作
        unBrowersCtrl: function() {
            document.addEventListener("keydown", function (event) {
                var acEl = document.activeElement;
                if (acEl.nodeName.toLowerCase() != "input" && acEl.nodeName.toLowerCase != "textarea") {
                    event.preventDefault();
                }
            }, false);

            window.addEventListener('mousewheel', function (event) {
                if (event.ctrlKey == true) {
                    event.preventDefault();
                }
            });
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
        // 判断字符是否为中文
        isChinese: function (text){ 
            var re = /[^\u4e00-\u9fa5]/; 
            if(re.test(text)) return false; 
            return true; 
        },
        // 格式化时间
        dateFormat: function(date,format){
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
        }
    }

    function Req(opts){
        this.settings = {
            uri: "",
            mimeType: "application/json",
            format: "json",
            mode: "XHR",
            data: null,
        };
        opts && _setData(opts, this);
    };

    Req.prototype = {
        get: function(opts) {
            opts && _setData(opts, this);

            var settings = this.settings;
            
            switch(settings.mode) {
                case 'XHR':
                    var xhr = this.xhr = new XMLHttpRequest();
                    xhr.overrideMimeType = this.mimeType;
                    xhr.open('GET', settings.uri, true);
                    xhr.send(settings.data);
                    break;
                default:
                    break;
            }

            return new Promise(function(resolve, reject) {
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            var data = xhr.responseText;
                            resolve(data);
                        } else {
                            reject(new Error(xhr.statusText));
                        }
                    }
                }

                xhr.onerror = function() {
                    console.log(arguments);
                }
            });
        }
    };
    
    /**
     * TCSS 统计上报. 目前支持page pv/uv 和点击流上报，点击流需要自己设置参数分类.
     *  详见 http://bs.oa.com/bbs/forum.php?mod=viewthread&tid=62&extra=page%3D1
     */
    var TCSS = function() {
        var self = this;
        this.jsFileLoaded = false;
        this.url = "http://pingjs.qq.com/tcss.ping.js",
        tools.getJSFileData(this.url, function() {
            self.jsFileLoaded = true;
        }, function() {}, "");
    };
    
    TCSS.prototype = {
        /**
         * param 为空的话，默认统计的数据不区分?后面的参数，否则为k-v格式参数.具体参数表示：
         *  senseParam:"**", //适用于区分?参数的统计
         *  virtualURL:"**", //虚拟URL地址的统计
         *  ... 其他参数详见tcss js上报指引   (上面)
         */
        visited: function(param) {
            var self = this;
            try {
                self.jsFileLoaded ? pgvMain(param) : self.ns.getJSFileData(url, function() {
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
                }) : self.ns.getJSFileData(url, function() {
                    (typeof pgvSendClick === "function") && (pgvSendClick({
                        hottag: path_of_tag
                    }));
                }, function() {}, "");
            } catch (e) {}
        }
    }

    exports.tools = new Tools;

    tools.Req = Req;

    tools.TCSS = TCSS;

    tools.TCSS.prototype.ns = tools;
})(window)
