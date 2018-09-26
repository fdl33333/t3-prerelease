/*
Product Name: dhtmlxVault 
Version: 2.4.1 
Edition: Standard 
License: content of this file is covered by GPL. Usage outside GPL terms is prohibited. To obtain Commercial or Enterprise license contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/* dhtmlx.com */

if (typeof(window.dhx4) == "undefined") {
	
	window.dhx4 = {
		
		version: "4.5.1",
		
		skin: null, // allow to be set by user
		
		skinDetect: function(comp) {
			return {10:"dhx_skyblue",20:"dhx_web",30:"dhx_terrace"}[this.readFromCss(comp+"_skin_detect")]||null;
		},
		
		// read value from css
		readFromCss: function(className, property) {
			var t = document.createElement("DIV");
			t.className = className;
			if (document.body.firstChild != null) document.body.insertBefore(t, document.body.firstChild); else document.body.appendChild(t);
			var w = t[property||"offsetWidth"];
			t.parentNode.removeChild(t);
			t = null;
			return w;
		},
		
		// id manager
		lastId: 1,
		newId: function() {
			return this.lastId++;
		},
		
		// z-index manager
		zim: {
			data: {},
			step: 5,
			first: function() {
				return 100;
			},
			last: function() {
				var t = this.first();
				for (var a in this.data) t = Math.max(t, this.data[a]);
				return t;
			},
			reserve: function(id) {
				this.data[id] = this.last()+this.step;
				return this.data[id];
			},
			clear: function(id) {
				if (this.data[id] != null) {
					this.data[id] = null;
					delete this.data[id];
				}
			}
		},
		
		// string to boolean
		s2b: function(r) {
			if (typeof(r) == "string") r = r.toLowerCase();
			return (r == true || r == 1 || r == "true" || r == "1" || r == "yes" || r == "y" || r == "on");
		},
		
		// string to json
		s2j: function(s) {
			var obj = null;
			dhx4.temp = null;
			try { eval("dhx4.temp="+s); } catch(e) { dhx4.temp = null; }
			obj = dhx4.temp;
			dhx4.temp = null;
			return obj;
		},
		
		// absolute top/left position on screen
		absLeft: function(obj) {
			if (typeof(obj) == "string") obj = document.getElementById(obj);
			return this.getOffset(obj).left;
		},
		absTop: function(obj) {
			if (typeof(obj) == "string") obj = document.getElementById(obj);
			return this.getOffset(obj).top;
		},
		_aOfs: function(elem) {
			var top = 0, left = 0;
			while (elem) {
				top = top + parseInt(elem.offsetTop);
				left = left + parseInt(elem.offsetLeft);
				elem = elem.offsetParent;
			}
			return {top: top, left: left};
		},
		_aOfsRect: function(elem) {
			var box = elem.getBoundingClientRect();
			var body = document.body;
			var docElem = document.documentElement;
			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
			var clientTop = docElem.clientTop || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;
			var top  = box.top +  scrollTop - clientTop;
			var left = box.left + scrollLeft - clientLeft;
			return { top: Math.round(top), left: Math.round(left) };
		},
		getOffset: function(elem) {
			if (elem.getBoundingClientRect) {
				return this._aOfsRect(elem);
			} else {
				return this._aOfs(elem);
			}
		},
		
		// copy obj
		_isObj: function(k) {
			return (k != null && typeof(k) == "object" && typeof(k.length) == "undefined");
		},
		_copyObj: function(r) {
			if (this._isObj(r)) {
				var t = {};
				for (var a in r) {
					if (typeof(r[a]) == "object" && r[a] != null) t[a] = this._copyObj(r[a]); else t[a] = r[a];
				}
			} else {
				var t = [];
				for (var a=0; a<r.length; a++) {
					if (typeof(r[a]) == "object" && r[a] != null) t[a] = this._copyObj(r[a]); else t[a] = r[a];
				}
			}
			return t;
		},
		
		// screen dim
		screenDim: function() {
			var isIE = (navigator.userAgent.indexOf("MSIE") >= 0);
			var dim = {};
			dim.left = document.body.scrollLeft;
			dim.right = dim.left+(window.innerWidth||document.body.clientWidth);
			dim.top = Math.max((isIE?document.documentElement:document.getElementsByTagName("html")[0]).scrollTop, document.body.scrollTop);
			dim.bottom = dim.top+(isIE?Math.max(document.documentElement.clientHeight||0,document.documentElement.offsetHeight||0):window.innerHeight);
			return dim;
		},
		
		// input/textarea range selection
		selectTextRange: function(inp, start, end) {
			
			inp = (typeof(inp)=="string"?document.getElementById(inp):inp);
			
			var len = inp.value.length;
			start = Math.max(Math.min(start, len), 0);
			end = Math.min(end, len);
			
			if (inp.setSelectionRange) {
				try {inp.setSelectionRange(start, end);} catch(e){}; // combo in grid under IE requires try/catch
			} else if (inp.createTextRange) {
				var range = inp.createTextRange();
				range.moveStart("character", start);
				range.moveEnd("character", end-len);
				try {range.select();} catch(e){};
			}
		},
		// transition
		transData: null,
		transDetect: function() {
			
			if (this.transData == null) {
				
				this.transData = {transProp: false, transEv: null};
				
				// transition, MozTransition, WebkitTransition, msTransition, OTransition
				var k = {
					"MozTransition": "transitionend",
					"WebkitTransition": "webkitTransitionEnd",
					"OTransition": "oTransitionEnd",
					"msTransition": "transitionend",
					"transition": "transitionend"
				};
				
				for (var a in k) {
					if (this.transData.transProp == false && document.documentElement.style[a] != null) {
						this.transData.transProp = a;
						this.transData.transEv = k[a];
					}
				}
				k = null;
			}
			
			return this.transData;
			
		},
		
		// xml parser
		_xmlNodeValue: function(node) {
			var value = "";
			for (var q=0; q<node.childNodes.length; q++) {
				value += (node.childNodes[q].nodeValue!=null?node.childNodes[q].nodeValue.toString().replace(/^[\n\r\s]{0,}/,"").replace(/[\n\r\s]{0,}$/,""):"");
			}
			return value;
		}
		
	};
	
	// browser
	window.dhx4.isIE = (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0);
	window.dhx4.isIE6 = (window.XMLHttpRequest == null && navigator.userAgent.indexOf("MSIE") >= 0);
	window.dhx4.isIE7 = (navigator.userAgent.indexOf("MSIE 7.0") >= 0 && navigator.userAgent.indexOf("Trident") < 0);
	window.dhx4.isIE8 = (navigator.userAgent.indexOf("MSIE 8.0") >= 0 && navigator.userAgent.indexOf("Trident") >= 0);
	window.dhx4.isIE9 = (navigator.userAgent.indexOf("MSIE 9.0") >= 0 && navigator.userAgent.indexOf("Trident") >= 0);
	window.dhx4.isIE10 = (navigator.userAgent.indexOf("MSIE 10.0") >= 0 && navigator.userAgent.indexOf("Trident") >= 0 && window.navigator.pointerEnabled != true);
	window.dhx4.isIE11 = (navigator.userAgent.indexOf("Trident") >= 0 && window.navigator.pointerEnabled == true);
	window.dhx4.isEdge = (navigator.userAgent.indexOf("Edge") >= 0);
	window.dhx4.isOpera = (navigator.userAgent.indexOf("Opera") >= 0);
	window.dhx4.isChrome = (navigator.userAgent.indexOf("Chrome") >= 0) && !window.dhx4.isEdge;
	window.dhx4.isKHTML = (navigator.userAgent.indexOf("Safari") >= 0 || navigator.userAgent.indexOf("Konqueror") >= 0) && !window.dhx4.isEdge;
	window.dhx4.isFF = (navigator.userAgent.indexOf("Firefox") >= 0);
	window.dhx4.isIPad = (navigator.userAgent.search(/iPad/gi) >= 0);
	
	// dnd data
	window.dhx4.dnd = {
		evs: {},
		p_en: ((window.dhx4.isIE || window.dhx4.isEdge) && (window.navigator.pointerEnabled || window.navigator.msPointerEnabled)), // touch/pointer
		_mTouch: function(e) {
			// mouse touch type in ie10/11/Edge
			return (window.dhx4.isIE10 && e.pointerType == e.MSPOINTER_TYPE_MOUSE || window.dhx4.isIE11 && e.pointerType == "mouse" || window.dhx4.isEdge && e.pointerType == "mouse");
		},
		_touchOn: function(obj) {
			if (obj == null) obj = document.body;
			obj.style.touchAction = obj.style.msTouchAction = "";
			obj = null;
		},
		_touchOff: function(obj) {
			if (obj == null) obj = document.body;
			obj.style.touchAction = obj.style.msTouchAction = "none";
			obj = null;
		}
	};
	
	// dnd events
	if (window.navigator.pointerEnabled == true) { // edge/ie11
		window.dhx4.dnd.evs = {start: "pointerdown", move: "pointermove", end: "pointerup"};
	} else if (window.navigator.msPointerEnabled == true) { // ie10-
		window.dhx4.dnd.evs = {start: "MSPointerDown", move: "MSPointerMove", end: "MSPointerUp"};
	} else if (typeof(window.addEventListener) != "undefined") { // rest touch devices
		window.dhx4.dnd.evs = {start: "touchstart", move: "touchmove", end: "touchend"};
	};
	
};

if (typeof(window.dhx4.template) == "undefined") {
	
	// trim
	window.dhx4.trim = function(t) {
		return String(t).replace(/^\s{1,}/,"").replace(/\s{1,}$/,"");
	};
	
	// template parsing
	window.dhx4.template = function(tpl, data, trim) {
		
		// tpl - template text, #value|func:param0:param1:paramX#
		// data - object with key-value
		// trim - true/false, trim values
		return tpl.replace(/#([a-z0-9_-]{1,})(\|([^#]*))?#/gi, function(){
			
			var key = arguments[1];
			
			var t = window.dhx4.trim(arguments[3]);
			var func = null;
			var args = [data[key]];
			
			if (t.length > 0) {
				
				t = t.split(":");
				var k = [];
				
				// check escaped colon
				for (var q=0; q<t.length; q++) {
					if (q > 0 && k[k.length-1].match(/\\$/) != null) {
						k[k.length-1] = k[k.length-1].replace(/\\$/,"")+":"+t[q];
					} else {
						k.push(t[q]);
					}
				}
				
				func = k[0];
				for (var q=1; q<k.length; q++) args.push(k[q]);
				
			}
			
			// via inner function
			if (typeof(func) == "string" && typeof(window.dhx4.template[func]) == "function") {
				return window.dhx4.template[func].apply(window.dhx4.template, args);
			}
			
			// value only
			if (key.length > 0 && typeof(data[key]) != "undefined") {
				if (trim == true) return window.dhx4.trim(data[key]);
				return String(data[key]);
			}
			
			// key not found
			return "";
			
		});
		
	};
	
	window.dhx4.template.date = function(value, format) {
		// Date obj + format	=> convert to string
		// timestamp + format	=> convert to string
		// string		=> no convert
		// any other value	=> empty string
		if (value != null) {
			if (value instanceof Date) {
				return window.dhx4.date2str(value, format);
			} else {
				value = value.toString();
				if (value.match(/^\d*$/) != null) return window.dhx4.date2str(new Date(parseInt(value)), format);
				return value;
			}
		}
		return "";
	};
	
	window.dhx4.template.maxlength = function(value, limit) {
		return String(value).substr(0, limit);
	};
	
	window.dhx4.template.number_format = function(value, format, group_sep, dec_sep) {
		var fmt = window.dhx4.template._parseFmt(format, group_sep, dec_sep);
		if (fmt == false) return value;
		return window.dhx4.template._getFmtValue(value, fmt);
	};
	
	window.dhx4.template.lowercase = function(value) {
		if (typeof(value) == "undefined" || value == null) value = "";
		return String(value).toLowerCase();
	};
	window.dhx4.template.uppercase = function(value) {
		if (typeof(value) == "undefined" || value == null) value = "";
		return String(value).toUpperCase();
	};
	
	// number format helpers
	window.dhx4.template._parseFmt = function(format, group_sep, dec_sep) {
		
		var t = format.match(/^([^\.\,0-9]*)([0\.\,]*)([^\.\,0-9]*)/);
		if (t == null || t.length != 4) return false; // invalid format
		
		var fmt = {
			// int group
			i_len: false,
			i_sep: (typeof(group_sep)=="string"?group_sep:","),
			// decimal
			d_len: false,
			d_sep: (typeof(dec_sep)=="string"?dec_sep:"."),
			// chars before and after
			s_bef: (typeof(t[1])=="string"?t[1]:""),
			s_aft: (typeof(t[3])=="string"?t[3]:"")
		};
		
		var f = t[2].split(".");
		if (f[1] != null) fmt.d_len = f[1].length;
		
		var r = f[0].split(",");
		if (r.length > 1) fmt.i_len = r[r.length-1].length;
		
		return fmt;
		
	};
	
	window.dhx4.template._getFmtValue = function(value, fmt) {
		
		var r = String(value).match(/^(-)?([0-9]{1,})(\.([0-9]{1,}))?$/); // r = [complete value, minus sign, integer, full decimal, decimal]
		
		if (r != null && r.length == 5) {
			var v0 = "";
			// minus sign
			if (r[1] != null) v0 += r[1];
			// chars before
			v0 += fmt.s_bef;
			// int part
			if (fmt.i_len !== false) {
				var i = 0; var v1 = "";
				for (var q=r[2].length-1; q>=0; q--) {
					v1 = ""+r[2].charAt(q)+v1;
					if (++i == fmt.i_len && q > 0) { v1=fmt.i_sep+v1; i=0; }
				}
				v0 += v1;
			} else {
				v0 += r[2];
			}
			// dec part
			if (fmt.d_len !== false) {
				if (r[4] == null) r[4] = "";
				while (r[4].length < fmt.d_len) r[4] += "0";
				eval("dhx4.temp = new RegExp(/\\d{"+fmt.d_len+"}/);");
				var t1 = (r[4]).match(dhx4.temp);
				if (t1 != null) v0 += fmt.d_sep+t1;
				dhx4.temp = t1 = null;
			}
			// chars after
			v0 += fmt.s_aft;
			
			return v0;
		}
		
		return value;
	};
	
};

if (typeof(window.dhx4.ajax) == "undefined") {
	
	window.dhx4.ajax = {
		
		// if false - dhxr param will added to prevent caching on client side (default),
		// if true - do not add extra params
		cache: false,
		
		// default method for load/loadStruct, post/get allowed
		// get - since 4.1.1, this should fix 412 error for macos safari
		method: "get",
		
		parse: function(data) {
			if (typeof data !== "string") return data;
			
			data = data.replace(/^[\s]+/,"");
			if (window.DOMParser && !dhx4.isIE) { // ff,ie9
				var obj = (new window.DOMParser()).parseFromString(data, "text/xml");
			} else if (window.ActiveXObject !== window.undefined) {
				var obj = new window.ActiveXObject("Microsoft.XMLDOM");
				obj.async = "false";
				obj.loadXML(data);
			}
			return obj;
		},
		xmltop: function(tagname, xhr, obj) {
			if (typeof xhr.status == "undefined" || xhr.status < 400) {
				xml = (!xhr.responseXML) ? dhx4.ajax.parse(xhr.responseText || xhr) : (xhr.responseXML || xhr);
				if (xml && xml.documentElement !== null) {
					try {
						if (!xml.getElementsByTagName("parsererror").length)
							return xml.getElementsByTagName(tagname)[0];
					} catch(e){}
				}
			}
			if (obj !== -1) dhx4.callEvent("onLoadXMLError",["Incorrect XML", arguments[1], obj]);
			return document.createElement("DIV");
		},
		xpath: function(xpathExp, docObj) {
			if (!docObj.nodeName) docObj = docObj.responseXML || docObj;
			if (dhx4.isIE) {
				try {
					return docObj.selectNodes(xpathExp)||[];
				} catch(e){ return []; }
			} else {
				var rows = [];
				var first;
				var col = (docObj.ownerDocument||docObj).evaluate(xpathExp, docObj, null, XPathResult.ANY_TYPE, null);
				while (first = col.iterateNext()) rows.push(first);
				return rows;
			}
		},
		query: function(config) {
			dhx4.ajax._call(
				(config.method || "GET"),
				config.url,
				config.data || "",
				(config.async || true),
				config.callback,
				null,
				config.headers
			);
		},
		get: function(url, onLoad) {
			return this._call("GET", url, null, true, onLoad);
		},
		getSync: function(url) {
			return this._call("GET", url, null, false);
		},
		put: function(url, postData, onLoad) {
			return this._call("PUT", url, postData, true, onLoad);
		},
		del: function(url, postData, onLoad) {
			return this._call("DELETE", url, postData, true, onLoad);
		},
		post: function(url, postData, onLoad) {
			if (arguments.length == 1) {
				postData = "";
			} else if (arguments.length == 2 && (typeof(postData) == "function" || typeof(window[postData]) == "function")) {
				onLoad = postData;
				postData = "";
			} else {
				postData = String(postData);
			}
			return this._call("POST", url, postData, true, onLoad);
		},
		postSync: function(url, postData) {
			postData = (postData == null ? "" : String(postData));
			return this._call("POST", url, postData, false);
		},
		getLong: function(url, onLoad) {
			this._call("GET", url, null, true, onLoad, {url:url});
		},
		postLong: function(url, postData, onLoad) {
			if (arguments.length == 2 && (typeof(postData) == "function" || typeof(window[postData]))) {
				onLoad = postData;
				postData = "";
			}
			this._call("POST", url, postData, true, onLoad, {url:url, postData:postData});
		},
		_call: function(method, url, postData, async, onLoad, longParams, headers) {
			
			var t = (window.XMLHttpRequest && !dhx4.isIE ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
			var isQt = (navigator.userAgent.match(/AppleWebKit/) != null && navigator.userAgent.match(/Qt/) != null && navigator.userAgent.match(/Safari/) != null);
			
			if (async == true) {
				t.onreadystatechange = function() {
					if ((t.readyState == 4) || (isQt == true && t.readyState == 3)) { // what for long response and status 404?
						if (t.status != 200 || t.responseText == "")
							if (!dhx4.callEvent("onAjaxError", [{xmlDoc:t, filePath:url, async:async}])) return;

						window.setTimeout(function(){
							if (typeof(onLoad) == "function") {
								onLoad.apply(window, [{xmlDoc:t, filePath:url, async:async}]); // dhtmlx-compat, response.xmlDoc.responseXML/responseText
							}
							if (longParams != null) {
								if (typeof(longParams.postData) != "undefined") {
									dhx4.ajax.postLong(longParams.url, longParams.postData, onLoad);
								} else {
									dhx4.ajax.getLong(longParams.url, onLoad);
								}
							}
							onLoad = null;
							t = null;
						},1);
					}
				}
			}
			
			if (method == "GET" && this.cache != true) {
				url += (url.indexOf("?")>=0?"&":"?")+"dhxr"+new Date().getTime()+"=1";
			}
			
			t.open(method, url, async);
			
			if (headers != null) {
				for (var key in headers) t.setRequestHeader(key, headers[key]);
			} else if (method == "POST" || method == "PUT" || method == "DELETE") {
				t.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			} else if (method == "GET") {
				postData = null;
			}
			
			t.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			
			t.send(postData);
			
			if (async != true) {
				if ((t.readyState == 4) || (isQt == true && t.readyState == 3)) {
					if (t.status != 200 || t.responseText == "") dhx4.callEvent("onAjaxError", [{xmlDoc:t, filePath:url, async:async}]);
				}
			}
			
			return {xmlDoc:t, filePath:url, async:async}; // dhtmlx-compat, response.xmlDoc.responseXML/responseText
			
		}
	};
	
};

if (typeof(window.dhx4._enableDataLoading) == "undefined") {
	
	window.dhx4._enableDataLoading = function(obj, initObj, xmlToJson, xmlRootTag, mode) {
		
		if (mode == "clear") {
			
			// clear attached functionality
			
			for (var a in obj._dhxdataload) {
				obj._dhxdataload[a] = null;
				delete obj._dhxdataload[a];
			};
			
			obj._loadData = null;
			obj._dhxdataload = null;
			obj.load = null;
			obj.loadStruct = null;
			
			obj = null;
			
			return;
			
		}
		
		obj._dhxdataload = { // move to obj.conf?
			initObj: initObj,
			xmlToJson: xmlToJson,
			xmlRootTag: xmlRootTag,
			onBeforeXLS: null
		};
		
		obj._loadData = function(data, loadParams, onLoad) {
			
			if (arguments.length == 2) {
				onLoad = loadParams;
				loadParams = null;
			}
			
			var obj = null;
			
			// deprecated from 4.0, compatability with version (url, type[json|xml], onLoad)
			if (arguments.length == 3) onLoad = arguments[2];
			
			if (typeof(data) == "string") {
				
				var k = data.replace(/^\s{1,}/,"").replace(/\s{1,}$/,"");
				
				var tag = new RegExp("^<"+this._dhxdataload.xmlRootTag);
				
				// xml
				if (tag.test(k.replace(/^<\?xml[^\?]*\?>\s*/, ""))) { // remove leading <?xml ...?> if any, \n can be also present
					obj = dhx4.ajax.parse(data);
					if (obj != null) obj = this[this._dhxdataload.xmlToJson].apply(this, [obj]); // xml to json
				}
				
				if (obj == null && (k.match(/^[\s\S]*{[.\s\S]*}[\s\S]*$/) != null || k.match(/^[\s\S]*\[[.\s\S]*\][\s\S]*$/) != null)) { // check for '{...}' or '[...]', cut leading/trailing \n\r with \s\S
					obj = dhx4.s2j(k);
				}
				
				if (obj == null) {
					
					this.callEvent("onXLS",[]);
					
					var params = [];
					
					// allow to modify url and add params
					if (typeof(this._dhxdataload.onBeforeXLS) == "function") {
						var k = this._dhxdataload.onBeforeXLS.apply(this,[data]);
						if (k != null && typeof(k) == "object") {
							if (k.url != null) data = k.url;
							if (k.params != null) { for (var a in k.params) params.push(a+"="+encodeURIComponent(k.params[a])); }
						}
					}
					
					var t = this;
					var callBack = function(r) {
						
						var obj = null;
						
						if ((r.xmlDoc.getResponseHeader("Content-Type")||"").search(/xml/gi) >= 0 || (r.xmlDoc.responseText.replace(/^\s{1,}/,"")).match(/^</) != null) {
							obj = t[t._dhxdataload.xmlToJson].apply(t,[r.xmlDoc.responseXML]);
						} else {
							obj = dhx4.s2j(r.xmlDoc.responseText);
						}
						
						// init
						if (obj != null) t[t._dhxdataload.initObj].apply(t,[obj,data]); // data => url
						
						t.callEvent("onXLE",[]);
						
						if (onLoad != null) {
							if (typeof(onLoad) == "function") {
								onLoad.apply(t,[]);
							} else if (typeof(window[onLoad]) == "function") {
								window[onLoad].apply(t,[]);
							}
						}
						
						callBack = onLoad = null;
						obj = r = t = null;
						
					};
					
					params = params.join("&")+(typeof(loadParams)=="string"?"&"+loadParams:"");
					
					if (dhx4.ajax.method == "post") {
						dhx4.ajax.post(data, params, callBack);
					} else if (dhx4.ajax.method == "get") {
						dhx4.ajax.get(data+(params.length>0?(data.indexOf("?")>0?"&":"?")+params:""), callBack);
					}
					
					return;
				}
				
			} else {
				if (typeof(data.documentElement) == "object" || (typeof(data.tagName) != "undefined" && typeof(data.getElementsByTagName) != "undefined" && data.getElementsByTagName(this._dhxdataload.xmlRootTag).length > 0)) { // xml
					obj = this[this._dhxdataload.xmlToJson].apply(this, [data]);
				} else { // json
					obj = window.dhx4._copyObj(data);
				}
				
			}
			
			// init
			if (obj != null) this[this._dhxdataload.initObj].apply(this,[obj]);
			
			if (onLoad != null) {
				if (typeof(onLoad) == "function") {
					onLoad.apply(this, []);
				} else if (typeof(window[onLoad]) == "function") {
					window[onLoad].apply(this, []);
				}
				onLoad = null;
			}
			
		};
		
		// loadStruct for hdr/conf
		// load for data
		if (mode != null) {
			var k = {struct: "loadStruct", data: "load"};
			for (var a in mode) {
				if (mode[a] == true) obj[k[a]] = function() {return this._loadData.apply(this, arguments);}
			}
		}
		
		obj = null;
		
	};
};

if (typeof(window.dhx4._eventable) == "undefined") {
	
	window.dhx4._eventable = function(obj, mode) {
		
		if (mode == "clear") {
			
			obj.detachAllEvents();
			
			obj.dhxevs = null;
			
			obj.attachEvent = null;
			obj.detachEvent = null;
			obj.checkEvent = null;
			obj.callEvent = null;
			obj.detachAllEvents = null;
			
			obj = null;
			
			return;
			
		}
		
		obj.dhxevs = { data: {} };
		
		obj.attachEvent = function(name, func) {
			name = String(name).toLowerCase();
			if (!this.dhxevs.data[name]) this.dhxevs.data[name] = {};
			var eventId = window.dhx4.newId();
			this.dhxevs.data[name][eventId] = func;
			return eventId;
		}
		
		obj.detachEvent = function(eventId) {
			for (var a in this.dhxevs.data) {
				var k = 0;
				for (var b in this.dhxevs.data[a]) {
					if (b == eventId) {
						this.dhxevs.data[a][b] = null;
						delete this.dhxevs.data[a][b];
					} else {
						k++;
					}
				}
				if (k == 0) {
					this.dhxevs.data[a] = null;
					delete this.dhxevs.data[a];
				}
			}
		}
		
		obj.checkEvent = function(name) {
			name = String(name).toLowerCase();
			return (this.dhxevs.data[name] != null);
		}
		
		obj.callEvent = function(name, params) {
			name = String(name).toLowerCase();
			if (this.dhxevs.data[name] == null) return true;
			var r = true;
			for (var a in this.dhxevs.data[name]) {
				r = this.dhxevs.data[name][a].apply(this, params) && r;
			}
			return r;
		}
		
		obj.detachAllEvents = function() {
			for (var a in this.dhxevs.data) {
				for (var b in this.dhxevs.data[a]) {
					this.dhxevs.data[a][b] = null;
					delete this.dhxevs.data[a][b];
				}
				this.dhxevs.data[a] = null;
				delete this.dhxevs.data[a];
			}
		}
		
		obj = null;
	};
	
	dhx4._eventable(dhx4);
	
};

function dhtmlXVaultObject(conf) {
	
	var that = this;
	
	this.conf = {
		version: "2.4.1",
		skin: (conf.skin||window.dhx4.skin||(typeof(dhtmlx)!="undefined"?dhtmlx.skin:null)||window.dhx4.skinDetect("dhxvault")||"dhx_skyblue"),
		param_name: (typeof(conf.paramName)!="undefined"?conf.paramName:"file"),
		engine: null,
		list: "list_default",
		url: conf.uploadUrl||"",
		download_url: (conf.downloadUrl||""), // added in 2.4
		// multiple files, html5/flash only
		multiple_files: (typeof(conf.multiple)!="undefined"?conf.multiple==true:true),
		// swf-file path
		swf_file: conf.swfPath||"",
		swf_url:  conf.swfUrl||"",
		swf_logs: conf.swfLogs||"no",
		// sl-data
		sl_xap:  conf.slXap,
		sl_url:  conf.slUrl,
		sl_logs: conf.slLogs,
		// common
		enabled: true,
		auto_start: (typeof(conf.autoStart)!="undefined"?conf.autoStart==true:true), // true by default
		auto_remove: (typeof(conf.autoRemove)!="undefined"?conf.autoRemove==true:false), // false by default
		files_added: 0,
		uploaded_count: 0,
		files_limit: (typeof(conf.filesLimit)!="undefined"?conf.filesLimit:0), // max files
		max_file_size: parseInt(conf.maxFileSize)||0,
		buttons: { // visible buttons
			upload: (typeof(conf.buttonUpload)!="undefined"?(conf.buttonUpload==true):false),
			clear: (typeof(conf.buttonClear)!="undefined"?(conf.buttonClear==true):true)
		},
		// offsets
		ofs: {
			dhx_skyblue: 5,
			dhx_web: 7,
			dhx_terrace: 10,
			bootstrap: 10
		},
		// data
		uploaded_state: {}, // save state tru/false for uploaded or failed
		uploaded_files: {}, // uploaded files data
		// progress mode
		progress_mode: "percent", // "percent","eta"
		// icons
		icon_def: "",
		icons: {} // generated
	}
	
	this.list = new this[this.conf.list]();
	
	// icons
	this.conf.icon_def = this.icon_def;
	for (var a in this.icons) {
		for (var q=0; q<this.icons[a].length; q++) this.conf.icons[this.icons[a][q]] = a;
	}
	
	// engine detect
	if (typeof(conf.mode) == "string" && typeof(this[conf.mode]) == "function") {
		this.conf.engine = conf.mode;
	} else {
		this.conf.engine = "html4";
		
		var k = null;
		if (typeof(window.FormData) != "undefined" && typeof(window.XMLHttpRequest) != "undefined") {
			k = new XMLHttpRequest();
			if (typeof(k.upload) == "undefined") k = null;
		}
		
		if (k != null) {
			// IE10, IE11, FF, Chrome, Opera
			this.conf.engine = "html5";
		} else if (typeof(window.swfobject) != "undefined" || k === false) {
			var k = swfobject.getFlashPlayerVersion();
			if (k.major >= 10) this.conf.engine = "flash";
		} else {
			// check if silverlight installed
			this.conf.sl_v = this.getSLVersion();
			if (this.conf.sl_v) this.conf.engine = "sl";
		}
		k = null;
	}
	
	var base = (typeof(conf.parent) != "undefined" ? conf.parent : conf.container);
	base = (typeof(base)=="string"?document.getElementById(base):base);
	conf.parent = conf.container = null;
	
	if (base._attach_mode == true) {
		this.base = base;
	} else {
		this.base = document.createElement("DIV");
		base.appendChild(this.base);
	}
	this.base.className += " dhx_vault_"+this.conf.skin;
	if (base._no_border == true) this.base.style.border = "0px solid white";
	
	base = conf = null;
	
	// buttons
	this.p_controls = document.createElement("DIV");
	this.p_controls.className = "dhx_vault_controls";
	this.base.appendChild(this.p_controls);
	this.p_controls.onselectstart = function(e){
		e = e||event;
		if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
		return false;
	}
	
	// files
	this.p_files = document.createElement("DIV");
	this.p_files.className = "dhx_vault_files";
	this.base.appendChild(this.p_files);
	
	this.p_files.ondragstart = function(e){
		e = e||event;
		var t = e.target||e.srcElement;
		if (t.tagName != null && t.tagName.toLowerCase() == "a") {
			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
			return false;
		}
	}
	
	this._doOnFilesClick = function(e) {
		e = e||event;
		var t = e.target||e.srcElement;
		var action = null;
		while (t != that.p_files && action == null) {
			if (action == null && t != null && t._action != null) {
				action = t._action;
			} else {
				t = t.parentNode;
			}
		}
		
		if (action == null) return;
		if (action.data == "delete_file" && that.conf.enabled == true) {
			that._removeFileFromQueue(action.id);
		}
		if (action.data == "download_file" && that.conf.enabled == true) {
			that._doDownloadFile(action.id);
		}
		action = null;
	}
	if (typeof(window.addEventListener) == "function") {
		this.p_files.addEventListener("click", this._doOnFilesClick, false);
	} else {
		this.p_files.attachEvent("onclick", this._doOnFilesClick);
	}
	
	this.file_data = {};
	
	this._initToolbar = function() {
		
		// add
		this.b_opts = {
			browse:	{ str: "btnAdd", onclick: null },
			upload:	{ str: "btnUpload", onclick: function() { if (!that.conf.enabled) return; if (!that.conf.uploading) { that._uploadStart(); } } },
			cancel:	{ str: "btnCancel", onclick: function() { if (!that.conf.enabled) return; that._uploadStop(); that._switchButton(false); } },
			clear:	{ str: "btnClean", onclick: function() { if (!that.conf.enabled) return; that.clear(); }, css: "float:right!important;"}
		};
		
		this.buttons = {};
		
		for (var a in this.b_opts) {
			var k = document.createElement("DIV");
			k.innerHTML = "<div class='dhxvault_button_icon dhx_vault_icon_"+a+"'></div>"+
					"<div class='dhxvault_button_text'>"+this.strings[this.b_opts[a].str]+"</div>";
			
			if (this.b_opts[a].css != null) k.style.cssText += this.b_opts[a].css;
			k.className = "dhx_vault_button";
			k._css = k.className;
			k._onclick = this.b_opts[a].onclick;
			k.onmouseover = function() {
				if (that.conf.enabled != true) return;
				if (this._hover == true) return;
				this._hover = true;
				this.className = this._css+" dhx_vault_button"+this._css_p+"_hover";
			}
			k.onmouseout = function() {
				if (that.conf.enabled != true) return;
				if (this._hover != true) return;
				this._hover = false;
				this.className = this._css;
			}
			k.onmousedown = function() {
				if (that.conf.enabled != true) return;
				if (this._hover != true) return;
				this._pressed = true;
				this.className = this._css+" dhx_vault_button"+this._css_p+"_pressed";
			}
			k.onmouseup = function(e) {
				if (that.conf.enabled != true) return;
				if (this._pressed != true) return;
				this._pressed = false;
				this.className = this._css+(this._hover?" dhx_vault_button"+this._css_p+"_hover":"");
				if (this._onclick != null) this._onclick();
			}
			if (this.b_opts[a].tooltip) k.title = this.b_opts[a].tooltip;
			this.p_controls.appendChild(k);
			this.buttons[a] = k;
			k = null;
			
			// visibile
			if (a == "upload" || a == "clear") this.buttons[a].style.display = (this.conf.buttons[a] == true?"":"none");
			
			this.b_opts[a].onclick = null;
			this.b_opts[a] = null;
			delete this.b_opts[a];
		}
		
		this.b_opts = null;
		delete this.b_opts;
		
		this.buttons.cancel.style.display = "none";
	}
	
	this._beforeAddFileToList = function(name, size, lastModifiedDate) {
		return (this.callEvent("onBeforeFileAdd", [{
			id: null,
			name: name,
			size: size,
			lastModifiedDate: lastModifiedDate,
			serverName: null,
			uploaded: false,
			error: false
		}])===true);
	}
	
	this._addFileToList = function(id, name, size, state, progress) {
		
		var ext = this.getFileExtension(name);
		var icon = (ext.length>0?(this.conf.icons[ext.toLowerCase()]||this.conf.icon_def):this.conf.icon_def);
		var error = false;
		
		// check filesize
		if (state == "added" && typeof(size) == "number" && size > 0 && this.conf.max_file_size > 0 && size > this.conf.max_file_size) {
			state = this.file_data[id].state = "size_exceeded";
			error = true;
		}
		
		// add div for new file
		this.list.addFileItem(id, this.p_files);
		
		// render file in list
		this.list.renderFileRecord(id, {name: name, icon: icon, size: size, readableSize: this.readableSize(size||0), state: state, progress: progress});
		
		// if filesize exceeded - update status
		if (state == "size_exceeded") {
			this.list.updateFileState(id, {state: state, str_size_exceeded: window.dhx4.template(this.strings.size_exceeded,{size:this.readableSize(this.conf.max_file_size)})});
		}
		
		this.callEvent("onFileAdd", [{
			id: id,
			name: name,
			size: size,
			lastModifiedDate: this.file_data[id].file.lastModifiedDate||null,
			serverName: null,
			uploaded: false,
			error: error
		}]);
		
	}
	
	this._removeFileFromList = function(id) {
		
		// remove div from list
		this.list.removeFileRecord(id);
		
		if (this.conf.uploaded_files[id] != null) {
			this.conf.uploaded_files[id] = null;
			delete this.conf.uploaded_files[id];
		}
		
		if (this.conf.uploaded_state[id] != null) {
			this.conf.uploaded_state[id] = null;
			delete this.conf.uploaded_state[id];
		}
		
	}
	
	this._updateFileInList = function(id, state, progress) {
		if (this.list.isFileItemExist(id) == false) return;
		if (state == "uploading" && this.conf.progress_mode == "eta" && this._etaStart != null) this._etaStart(id);
		// progress
		this._updateProgress(id, state, progress);
	}
	
	this._updateProgress = function(id, state, progress) {
		if (state == "added") {
			this.list.updateFileState(id, {state: state});
			if (this.conf.progress_mode == "eta" && this._etaEnd != null) this._etaEnd(id);
			return;
		}
		if (state == "fail") {
			this.list.updateFileState(id, {state: state, str_error: this.strings.error});
			if (this.conf.progress_mode == "eta" && this._etaEnd != null) this._etaEnd(id);
			return;
		}
		if (state == "uploaded") {
			if (this.conf.progress_mode == "eta" && this._etaEnd != null) this._etaEnd(id);
			var str_done = this.strings.done;
			var nameSizeData = (this.conf.engine != "html4" ? {} : {name: this.file_data[id].name, size: this.file_data[id].size, readableSize: this.readableSize(this.file_data[id].size||0)}); // for html4 mode - update size
			window.setTimeout(function(){
				if (that == null) return; // unloaded
				that.list.updateFileState(id, {state: "uploaded", str_done: str_done});
				nameSizeData.download = (that.conf.download_url.length > 0);
				that.list.updateFileNameSize(id, nameSizeData);
			}, 100); // for very little files or excellent internet connection
			return;
		}
		if (state == "uploading") {
			if ((progress < 100 && this.conf.progress_type == "loader") || this.file_data[id].custom == true) {
				/* html4 mode or custom record - no progress */
				this.list.updateFileState(id, {state: "uploading_html4"});
			} else if (this.conf.progress_mode == "eta") {
				var eta = (this._etaCheck!=null?this._etaCheck(id,progress):null);
				this.list.updateFileState(id, {state: "uploading", progress: progress, eta: (eta==null?null:"eta: "+eta)});
			} else if (this.conf.progress_mode == "percent") {
				this.list.updateFileState(id, {state: "uploading", progress: progress, eta: progress+"%"});
			}
		}
	}
	
	this._removeFilesByState = function(state) {
		for (var a in this.file_data) {
			if (state === true || this.file_data[a].state == state) {
				this._removeFileFromQueue(a);
			}
		}
	}
	
	this._switchButton = function(state) {
		
		if (state == true) {
			if (this.conf.buttons.upload == true) {
				this.buttons.upload.style.display = "none";
				this.buttons.cancel.style.display = "";
			}
		} else {
			var t = this.conf.uploaded_count;
			var f = [];
			for (var a in this.conf.uploaded_state) {
				f.push({
					id: a,
					name: this._fileName,
					size: (this.file_data[a]!=null?this.file_data[a].size:null),
					lastModifiedDate: (this.file_data[a]!=null?(this.file_data[a].file.lastModifiedDate||null):null),
					serverName: (this.conf.uploaded_files[a]?this.conf.uploaded_files[a].serverName:null),
					uploaded: this.conf.uploaded_state[a],
					error: !this.conf.uploaded_state[a]
				});
			}
			if (this.conf.buttons.upload == true) {
				this.buttons.upload.style.display = "";
				this.buttons.cancel.style.display = "none";
			}
			this.conf.uploaded_count = 0;
			this.conf.uploaded_state = {};
			if (t > 0) this.callEvent("onUploadComplete",[f]);
		}
	}
	
	this._uploadStart = function() {
		
		this._switchButton(true);
		
		// change status for prev fail auploads if any
		if (!this.conf.uploading) {
			for (var a in this.file_data) {
				if (this.file_data[a].state == "fail") {
					this.file_data[a].state = "added";
					this._updateFileInList(a, "added", 0);
				}
			}
		}
		
		this.conf.uploading = true;
		
		var t = false;
		
		for (var a in this.file_data) {
			if (!t && [this.file_data[a].state] == "added") {
				t = true;
				this.file_data[a].state = "uploading";
				this._updateFileInList(a, "uploading", 0);
				this._doUploadFile(a);
			}
		}
		if (!t) {
			this.conf.uploading = false;
			this._switchButton(false);
		}
		
	}
	
	this._onUploadSuccess = function(id, serverName, r, extra) {
		
		// flash mode
		if (typeof(r) != "undefined" && this.conf.engine == "flash") {
			var t = window.dhx4.s2j(r.data);
			if (t != null && t.state == true && t.name != null) {
				serverName = t.name;
				if (t.extra != null) extra = t.extra;
			} else {
				this._onUploadFail(id, (t!=null&&t.extra!=null?t.extra:null));
				return;
			}
		}
		//
		this.conf.uploaded_count++;
		this.conf.uploaded_files[id] = {realName: this.file_data[id].name, serverName: serverName};
		this.file_data[id].state = "uploaded";
		this.conf.uploaded_state[id] = true;
		this._updateFileInList(id, "uploaded", 100);
		this.callEvent("onUploadFile", [{
			id: id,
			name: this.file_data[id].name,
			size: this.file_data[id].size,
			lastModifiedDate: this.file_data[id].file.lastModifiedDate||null,
			serverName: serverName,
			uploaded: true,
			error: false
		}, extra]);
		if (this.conf.auto_remove) this._removeFileFromQueue(id);
		if (this.conf.uploading) this._uploadStart();
	}
	
	this._onUploadFail = function(id, extra) {
		this.file_data[id].state = "fail";
		this._updateFileInList(id, "fail", 0);
		this.conf.uploaded_state[id] = false;
		this.callEvent("onUploadFail", [{
			id: id,
			name: this.file_data[id].name,
			size: this.file_data[id].size,
			lastModifiedDate: this.file_data[id].file.lastModifiedDate||null,
			serverName: null,
			uploaded: false,
			error: true
		}, extra]);
		if (this.conf.uploading) this._uploadStart();
	}
	
	this._onUploadAbort = function(id) {
		this.conf.uploading = false;
		this.file_data[id].state = "added";
		this._updateFileInList(id, "added", 0);
		this.callEvent("onUploadCancel",[{
			id: id,
			name: this.file_data[id].name,
			size: this.file_data[id].size,
			lastModifiedDate: this.file_data[id].file.lastModifiedDate,
			serverName: null,
			uploaded: false,
			error: false
		}]);
	}
	
	this.unload = function() {
		
		this.callEvent = function(){return true;}; // some events while files will removed from list
		
		//
		if (typeof(window.addEventListener) == "function") {
			this.p_files.removeEventListener("click", this._doOnFilesClick, false);
		} else {
			this.p_files.detachEvent("onclick", this._doOnFilesClick);
		}
		
		// remove all files from queue/list
		this._removeFilesByState(true);
		this.conf.uploaded_files = null;
		this.file_data = null;
		
		// custom engine stuff
		this._unloadEngine();
		
		this.list.unload();
		this.list = null;
		this.icons = null;
		
		// buttons
		for (var a in this.buttons) {
			this.buttons[a].onclick = null;
			this.buttons[a].onmouseover = null;
			this.buttons[a].onmouseout = null;
			this.buttons[a].onmousedown = null;
			this.buttons[a].onmouseup = null;
			this.buttons[a]._onclick = null;
			this.buttons[a].parentNode.removeChild(this.buttons[a]);
			this.buttons[a] = null;
			delete this.buttons[a];
		}
		this.buttons = null;
		
		// buttons container
		this.p_controls.onselectstart = null;
		this.p_controls.parentNode.removeChild(this.p_controls);
		this.p_controls = null;
		
		// buttons container
		this.p_files.ondragstart = null;
		this.p_files.parentNode.removeChild(this.p_files);
		this.p_files = null;
		
		window.dhx4._eventable(this, "clear");
		this.callEvent = null;
		
		for (var a in this.conf) {
			this.conf[a] = null;
			delete this.conf[a];
		}
		this.conf = null;
		this.strings = null;
		
		for (var a in this) {
			if (typeof(this[a]) == "function") this[a] = null;
		}
		
		// main container
		if (this.base._attach_mode != true) this.base.parentNode.removeChild(this.base);
		this.base = null;
		
		that = a = null;
		
	}
	
	// init engine-relative funcs
	var e = new this[this.conf.engine]();
	for (var a in e) { this[a] = e[a]; e[a] = null; }
	a = e = p = null;
	
	// init app
	this._initToolbar();
	this._initEngine();
	this.setSkin(this.conf.skin);
	
	window.dhx4._eventable(this);
	
	// files limit
	this.attachEvent("onFileAdd", function(){
		this.conf.files_added++;
	});
	this.attachEvent("onBeforeFileAdd", function(){
		if (this.conf.files_limit == 0) return true;
		return (this.conf.files_added < this.conf.files_limit);
	});
	
	// IE7 size fix
	if (window.dhx4.isIE7 || navigator.userAgent.indexOf("MSIE 7.0")>=0) {
		var vault = this;
		window.setTimeout(function(){vault.setSizes();vault=null;},1);
	}
	
	// server settings if any
	var callBack = function(r) {
		var t = window.dhx4.s2j(r.xmlDoc.responseText);
		if (t != null && t.maxFileSize != null && that.conf.max_file_size == 0) {
			// update only if max file size was not set on init stage
			that.conf.max_file_size = (parseInt(t.maxFileSize)||0);
		}
		t = r = callBack = null;
	};
	if (window.dhx4.ajax.method == "post") {
		window.dhx4.ajax.post(this.conf.url, "mode=conf", callBack);
	} else {
		window.dhx4.ajax.get(this.conf.url+(this.conf.url.indexOf("?")>0?"&":"?")+"mode=conf", callBack);
	}
	
	return this;
	
};

dhtmlXVaultObject.prototype.readableSize = function(t) {
	var i = false;
	var b = ["b","Kb","Mb","Gb","Tb","Pb","Eb"];
	for (var q=0; q<b.length; q++) if (t > 1024) t = t / 1024; else if (i === false) i = q;
	if (i === false) i = b.length-1;
	return Math.round(t*100)/100+" "+b[i];
};

dhtmlXVaultObject.prototype.icon_def = "icon_def";
dhtmlXVaultObject.prototype.icons = {
	// css => list_of_extensions
	icon_image:	["jpg", "jpeg", "gif", "png", "bmp", "tiff", "pcx", "svg", "ico"],
	icon_psd:	["psd"],
	icon_video:	["avi", "mpg", "mpeg", "rm", "move", "mov", "mkv", "flv", "f4v", "mp4", "3gp"],
	icon_audio:	["wav", "aiff", "au", "mp3", "aac", "wma", "ogg", "flac", "ape", "wv", "m4a", "mid", "midi"],
	icon_arch:	["rar", "zip", "tar", "tgz", "arj", "gzip", "bzip2", "7z", "ace", "apk", "deb"],
	icon_text:	["txt", "nfo", "djvu", "xml"],
	icon_html:	["htm", "html"],
	icon_doc:	["doc", "docx", "rtf", "odt"],
	icon_xls:	["xls", "xlsx"],
	icon_pdf:	["pdf", "ps"],
	icon_exe:	["exe"],
	icon_dmg:	["dmg"]
};

dhtmlXVaultObject.prototype.upload = function() {
	if (!this.conf.uploading) this._uploadStart();
};

dhtmlXVaultObject.prototype.setAutoStart = function(state) {
	this.conf.auto_start = (state==true);
};

dhtmlXVaultObject.prototype.setAutoRemove = function(state) {
	this.conf.auto_remove = (state==true);
};

dhtmlXVaultObject.prototype.setURL = function(url) {
	this.conf.url = url;
};

// ability to donwload uploaded files, added in 2.4
dhtmlXVaultObject.prototype.setDownloadURL = function(url) {
	this.conf.download_url = url||"";
	for (var a in this.conf.uploaded_files) {
		this.list.updateFileNameSize(a, {download: (this.conf.download_url.length>0)});
	}
};

dhtmlXVaultObject.prototype._buildDownloadUrl = function(id) {
	var url = null;
	if (this.conf.download_url.length > 0 && this.conf.uploaded_files[id] != null) {
		var url = String(this.conf.download_url).replace(/\{serverName\}/g, encodeURIComponent(this.conf.uploaded_files[id].serverName));
		if (window.dhx4.ajax.cache != true) url += (url.indexOf("?")>=0?"&":"?")+"dhxr"+new Date().getTime()+"=1";
	}
	return url;
};

dhtmlXVaultObject.prototype._doDownloadFile = function(id) {
	
	if (!this._dframe) {
		this._dframe = document.createElement("IFRAME");
		this._dframe.className = "dhxvault_dframe";
		this._dframe.border = this._dframe.frameBorder = 0;
		this.conf.df_name = this._dframe.name = "dhxvault_dframe_"+window.dhx4.newId();
		document.body.appendChild(this._dframe);
	}
	
	var form = document.createElement("FORM");
	form.method = "POST";
	form.target = this.conf.df_name;
	form.action = this._buildDownloadUrl(id);
	document.body.appendChild(form);
	
	form.submit();
	window.setTimeout(function(){
		document.body.removeChild(form);
		form = null;
	},1);
};

//
dhtmlXVaultObject.prototype.enable = function() {
	if (this.conf.enabled == true) return;
	this.conf.enabled = true;
	this.base.className = String(this.base.className).replace(/\s{0,}dhx_vault_dis/gi,"");
	if (this.conf.engine == "flash") document.getElementById(this.conf.swf_obj_id).style.display = "";
};

dhtmlXVaultObject.prototype.disable = function() {
	if (this.conf.enabled != true) return;
	this.conf.enabled = false;
	this.base.className += " dhx_vault_dis";
	if (this.conf.engine == "flash") document.getElementById(this.conf.swf_obj_id).style.display = "none";
};

dhtmlXVaultObject.prototype.setWidth = function(w) { // set width of the control in pixels
	if (this.base._attach_mode == true) return;
	this.base.parentNode.style.width = w+"px";
	this.setSizes();
};

dhtmlXVaultObject.prototype.setHeight = function(h) { // set height of the control in pixels
	if (this.base._attach_mode == true) return;
	this.base.parentNode.style.height = h+"px";
	this.setSizes();
};

dhtmlXVaultObject.prototype.setFilesLimit = function(t) { // control the number of uploaded files
	this.conf.files_added = 0; // reset old settings
	this.conf.files_limit = t;
};

dhtmlXVaultObject.prototype.getStatus = function() {
	// 0 - filelist is empty
	// 1 - all files in filelist uploaded
	//-1 - not all files uploaded
	var t = 0;
	for (var a in this.file_data) {
		if (this.file_data[a].state != "uploaded") return -1;
		t = 1;
	}
	return t;
};

dhtmlXVaultObject.prototype.getData = function() {
	// return struct of uploaded files
	var t = [];
	for (var a in this.conf.uploaded_files) {
		t.push({
			id: a,
			name: this.file_data[a].name,
			size: this.file_data[a].size,
			serverName: this.conf.uploaded_files[a].serverName,
			uploaded: true,
			error: false
		});
	}
	return t;
};

dhtmlXVaultObject.prototype.clear = function() {
	if (this.callEvent("onBeforeClear", []) !== true) return;
	if (this.conf.uploading) this._uploadStop();
	this._switchButton(false);
	this._removeFilesByState(true);
	this.callEvent("onClear",[]);
};

dhtmlXVaultObject.prototype.setSkin = function(skin) {
	if (skin != this.conf.skin) {
		this.base.className = String(this.base.className).replace(new RegExp("\s{0,}dhx_vault_"+this.conf.skin)," dhx_vault_"+skin);
		this.conf.skin = skin;
	}
	
	// update buttons data
	this._updateBttonsSkin();
	
	
	var ofs = this.conf.ofs[this.conf.skin];
	
	this.buttons.browse.style.marginLeft = ofs+"px";
	this.buttons.upload.style.marginLeft = (skin=="dhx_terrace"?"-1px":ofs+"px");
	this.buttons.cancel.style.marginLeft = this.buttons.upload.style.marginLeft;
	this.buttons.clear.style.marginRight = ofs+"px";
	
	// border-radius
	var r = "";
	if (skin == "dhx_terrace") {
		r = (this.conf.buttons.upload == true) ? "0px":"3px";
	}
	
	this.buttons.browse.style.borderTopRightRadius = r;
	this.buttons.browse.style.borderBottomRightRadius = r;
	this.buttons.upload.style.borderTopLeftRadius = r;
	this.buttons.upload.style.borderBottomLeftRadius = r;
	this.buttons.cancel.style.borderTopLeftRadius = this.buttons.upload.style.borderTopLeftRadius;
	this.buttons.cancel.style.borderBottomLeftRadius = this.buttons.upload.style.borderBottomLeftRadius;
	
	this.setSizes();
};

dhtmlXVaultObject.prototype._updateBttonsSkin = function() {
	for (var a in this.buttons) {
		var css = "dhx_vault_button";
		var css_p = "";
		if (this.buttonCss != null && this.buttonCss[this.conf.skin] != null && this.buttonCss[this.conf.skin][a] != null) {
			css_p = this.buttonCss[this.conf.skin][a];
			css += css_p;
		}
		this.buttons[a]._css = this.buttons[a].className = css;
		this.buttons[a]._css_p = css_p;
	}
};

dhtmlXVaultObject.prototype.setSizes = function() {
	
	var w1 = this.base.offsetWidth-(this.base.clientWidth||this.base.scrollWidth);
	var h1 = this.base.offsetHeight-this.base.clientHeight;
	
	if (this.base._attach_mode != true) {
		this.base.style.width = Math.max(0, this.base.parentNode.clientWidth-w1)+"px";
		this.base.style.height = Math.max(0, this.base.parentNode.clientHeight-h1)+"px";
	}
	
	var ofs = this.conf.ofs[this.conf.skin];
	this.p_files.style.top = this.p_controls.offsetHeight+"px";
	this.p_files.style.left = ofs+"px";
	if (!this.conf.ofs_f) {
		this.p_files.style.width = "100px";
		this.p_files.style.height = "100px";
		this.conf.ofs_f = {
			w: this.p_files.offsetWidth-this.p_files.clientWidth,
			h: this.p_files.offsetHeight-this.p_files.clientHeight
		};
	}
	
	this.p_files.style.width = Math.max(this.base.clientWidth-ofs*2-this.conf.ofs_f.w,0)+"px";
	this.p_files.style.height = Math.max(this.base.clientHeight-this.p_controls.offsetHeight-ofs-this.conf.ofs_f.h,0)+"px";
	
	if (typeof(this.callEvent) == "function") {
		// dataload progress
		this.callEvent("_onSetSizes", []);
	}
	
};

dhtmlXVaultObject.prototype.getFileExtension = function(name) {
	var ext = "";
	var k = String(name).match(/\.([^\.\s]*)$/i); // "filename.jpg" -> [".jpg","jpg"]
	if (k != null) ext = k[1];
	return ext;
};

dhtmlXVaultObject.prototype.strings = {
	// labels
	done: "Done",
	error: "Error",
	size_exceeded: "Filesize exceeded (max #size#)", // #size# - readable size
	// buttons
	btnAdd: "Add files",
	btnUpload: "Upload",
	btnClean: "Clear all",
	btnCancel: "Cancel"
};

dhtmlXVaultObject.prototype.setStrings = function(data) {
	for (var a in data) this.strings[a] = data[a];
	// update files in list
	for (var a in this.file_data) {
		var state = this.file_data[a].state;
		if (state == "uploaded" || state == "fail" || state == "size_exceeded") {
			this.list.updateFileState(a, {
				state: state,
				str_error: this.strings.error,
				str_done: this.strings.done,
				str_size_exceeded: window.dhx4.template(this.strings.size_exceeded,{size:this.readableSize(this.conf.max_file_size)})
			});
		}
		if (state == "uploaded") {
			this.list.updateFileNameSize(a, {download: (this.conf.download_url.length>0)});
		}
	}
	// update buttons
	var t = {browse: "btnAdd", upload: "btnUpload", clear: "btnClean", cancel: "btnCancel"};
	for (var a in t) this.buttons[a].childNodes[1].innerHTML = this.strings[t[a]];
	
};

dhtmlXVaultObject.prototype.setMaxFileSize = function(t) { // added in 2.4
	this.conf.max_file_size = (parseInt(t)||0);
};
dhtmlXVaultObject.prototype.getMaxFileSize = function() {
	return this.conf.max_file_size;
};

/****************************************************************************************************************************************************************************************************************/
//	HTML 5

dhtmlXVaultObject.prototype.html5 = function(){};
dhtmlXVaultObject.prototype.html5.prototype = {
	
	_initEngine: function() {
		
		var that = this;
		this.buttons["browse"].onclick = function(){
			if (that.conf.enabled) that.f.click();
		}
		
		this.conf.progress_type = "percentage";
		this.conf.dnd_enabled = true;
		
		// Safari on Windows sometimes have problem with multiple file selections
		// file length set to zero, do not allow multiple file selecting
		// d-n-d seems works fine
		
		var k = window.navigator.userAgent;
		var mp = true;
		if (k.match(/Windows/gi) != null && k.match(/AppleWebKit/gi) != null && k.match(/Safari/gi) != null) {
			if (k.match(/Version\/5\.1\.5/gi)) this.conf.multiple_files = false;
			if (k.match(/Version\/5\.1[^\.\d{1,}]/gi)) this.conf.dnd_enabled = false;
			if (k.match(/Version\/5\.1\.1/gi)) {
				this.conf.multiple_files = false;
				this.conf.dnd_enabled = false;
			}
			if (k.match(/Version\/5\.1\.2/gi)) this.conf.dnd_enabled = false;
			if (k.match(/Version\/5\.1\.7/gi)) this.conf.multiple_files = false;
		}
		
		// "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-EN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8"	// ok, no dnd
		// "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-EN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5"	// ok, no dnd
		// "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-EN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4"	// ok, no dnd
		// "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-EN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27"	// ok, no dnd
		// "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-EN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"	// ok, no dnd
		// "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50"				// ok, dnd partialy fail, disabled
		// "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.52.7 (KHTML, like Gecko) Version/5.1.1 Safari/534.51.22"			// multiple files add - fail, dnd partialy fail, disabled
		// "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.52.7 (KHTML, like Gecko) Version/5.1.2 Safari/534.52.7"			// ok, dnd partialy fail, disabled
		// "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.54.16 (KHTML, like Gecko) Version/5.1.4 Safari/534.54.16"			// ok
		// "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.55.3 (KHTML, like Gecko) Version/5.1.5 Safari/534.55.3"			// multiple files add - fail
		// "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2"			// dnd - ok, multiselect - fail (Windows 8)
		
		// input
		this._addFileInput();
		
		// FF, Opera, Chrome, IE10, IE11
		if (this.conf.dnd_enabled && this._initDND != null) this._initDND();
		
	},
	
	_addFileInput: function() {
		
		// complete input reload, opera needs
		if (this.f != null) {
			this.f.onchange = null;
			this.f.parentNode.removeChild(this.f);
			this.f = null;
		}
		
		var that = this;
		
		this.f = document.createElement("INPUT");
		this.f.type = "file";
		
		if (this.conf.multiple_files) this.f.multiple = "1";
		this.f.className = "dhx_vault_input";
		this.p_controls.appendChild(this.f);
		
		this.f.onchange = function() {
			that._parseFilesInInput(this.files);
			if (window.dhx4.isOpera) that._addFileInput(); else this.value = "";
		}
	},
	
	_doUploadFile: function(id) {
		
		if (this.file_data[id].custom == true) {
			this._cfUploadStart(id);
			return;
		}
		
		var that = this;
		
		if (!this.loader) {
			
			this.loader = new XMLHttpRequest();
			this.loader.upload.onprogress = function(e) {
				if (that.file_data[this._idd].state == "uploading") that._updateFileInList(this._idd, "uploading", Math.round(e.loaded*100/e.total));
			}
			this.loader.onload = function(e) {
				var r = window.dhx4.s2j(this.responseText);
				if (r != null && typeof(r) == "object" && typeof(r.state) != "undefined" && r.state == true) {
					that._onUploadSuccess(this.upload._idd, r.name, null, r.extra);
				} else {
					that._onUploadFail(this.upload._idd, (r!=null&&r.extra!=null?r.extra:null));
				}
				r = null;
			}
			this.loader.onerror = function(e) {
				that._onUploadFail(this.upload._idd);
			}
			this.loader.onabort = function(e) {
				that._onUploadAbort(this.upload._idd);
			}
		}
		
		this.loader.upload._idd = id;
		
		var form = new FormData();
		form.append("mode", "html5");
		
		if (this.file_data[id].size == 0 && (navigator.userAgent.indexOf("MSIE") > 0 || navigator.userAgent.indexOf("Trident") > 0)) { // IE10, IE11 - zero_size file issue, upload filename only
			form.append("file_name", String(this.file_data[id].name));
			form.append("zero_size", "1");
		} else {
			form.append(this.conf.param_name, this.file_data[id].file);
		}
		
		if (window.dhx4.ajax.cache != true) form.append("dhxr"+new Date().getTime(), "");
		
		this.loader.open("POST", this.conf.url, true);
		this.loader.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		this.loader.send(form);
		
	},
	
	_uploadStop: function() {
		if (!this.conf.uploading) return;
		if (this.cf_loader_id != null) {
			this._cfUploadStop();
		} else if (this.loader != null) {
			this.loader.abort();
		}
	},
	
	_parseFilesInInput: function(f) {
		for (var q=0; q<f.length; q++) this._addFileToQueue(f[q]);
	},
	
	_addFileToQueue: function(f) {
		if (!this._beforeAddFileToList(f.name, f.size, f.lastModifiedDate)) return; // html5 mode, f.lastModifiedDate works in Chrome/Opera/Safari/FF/IE11
		var id = (f._idd||window.dhx4.newId());
		this.file_data[id] = {file: f, name: f.name, size: f.size, state: "added"};
		this._addFileToList(id, f.name, f.size, "added", 0);
		if (this.conf.auto_start && !this.conf.uploading) this._uploadStart(true);
	},
	
	_removeFileFromQueue: function(id) {
		
		if (!this.file_data[id]) return;
		
		var name = this.file_data[id].name;
		var serverName = (this.conf.uploaded_files!=null&&this.conf.uploaded_files[id]!=null?this.conf.uploaded_files[id].serverName:null);
		
		var fileData = {
			id: Number(id),
			name: name,
			size: this.file_data[id].size,
			serverName: serverName,
			uploaded: (this.file_data[id].state == "uploaded"),
			error: (this.file_data[id].state == "fail")
		};
		if (this.callEvent("onBeforeFileRemove",[fileData]) !== true) return;
		
		var k = false;
		if (this.cf_loader_id != null || (this.conf.uploading && this.loader != null && id == this.loader.upload._idd && this.file_data[id].state == "uploading")) {
			this._uploadStop();
			k = true;
		}
		
		this.file_data[id].file = null;
		this.file_data[id].name = null;
		this.file_data[id].size = null;
		this.file_data[id].state = null;
		this.file_data[id] = null;
		delete this.file_data[id];
		
		this._removeFileFromList(id);
		
		this.callEvent("onFileRemove",[fileData]);
		
		if (k) this._uploadStart();

	},
	
	_unloadEngine: function() {
		
		this.buttons["browse"].onclick = null;
		
		if (this.conf.dnd_enabled && this._unloadDND != null) this._unloadDND();
		
		this.f.onchange = null;
		this.f.parentNode.removeChild(this.f);
		this.f = null;
		
		if (this.loader) {
			this.loader.upload.onprogress = null;
			this.loader.onload = null;
			this.loader.onerror = null;
			this.loader.onabort = null;
			this.loader.upload._idd = null;
			this.loader = null;
		}
		
		this._initEngine = null;
		this._doUploadFile = null;
		this._uploadStop = null;
		this._parseFilesInInput = null;
		this._addFileToQueue = null;
		this._removeFileFromQueue = null;
		this._unloadEngine = null;
		
	}
	
};

/****************************************************************************************************************************************************************************************************************/
//	HTML 4

dhtmlXVaultObject.prototype.html4 = function(){};
dhtmlXVaultObject.prototype.html4.prototype = {
	
	_initEngine: function() {
		
		this._addForm();
		this.conf.progress_type = "loader";
		if (window.dhx4.isIE6||window.dhx4.isIE7) this.buttons.browse.style.filter = "";
	},
	
	_addForm: function() {
		
		var that = this;
		
		if (!this.k) {
			
			this.k = document.createElement("DIV");
			this.k.className = "dhx_vault_file_form_cont";
			this.buttons["browse"].appendChild(this.k);
			
			this.conf.fr_name = "dhx_vault_file_"+window.dhx4.newId();
			this.k.innerHTML = '<iframe name="'+this.conf.fr_name+'" style="height:0px;width:0px;" frameBorder="0"></iframe>';
			
			this.fr = this.k.firstChild;
			
			if (window.navigator.userAgent.indexOf("MSIE") >= 0) {
				this.fr.onreadystatechange = function() {
					if (this.readyState == "complete") that._onLoad();
				}
			} else {
				this.fr.onload = function() {
					that._onLoad();
				}
			}
			
		}
		
		var f = document.createElement("DIV");
		f.innerHTML = "<form method='POST' enctype='multipart/form-data' target='"+this.conf.fr_name+"' class='dhx_vault_file_form' name='dhx_vault_file_form_"+window.dhx4.newId()+"'>"+
				"<input type='hidden' name='mode' value='html4'>"+
				"<input type='hidden' name='uid' value=''>"+
				"<input type='file' name='"+this.conf.param_name+"' class='dhx_vault_file_input'>"+
				"</form>";
		this.k.appendChild(f);
		
		f.firstChild.lastChild.onchange = function() {
			
			var name = this.value.match(/[^\/\\]*$/)[0];
			
			this.previousSibling.value = this._idd = window.dhx4.newId();
			//
			var lastModifiedDate = null; // html4 mode, works in IE10/IE11/FF/Chrome/Opera/Safari
			var size = null;
			if (this.files != null && this.files[0] != null) {
				lastModifiedDate = this.files[0].lastModifiedDate||null;
				size = this.files[0].size||null;
			}
			//
			if (!that._beforeAddFileToList(name, size, lastModifiedDate)) return;
			that._addFileToQueue(this);
			this.onchange = null;
			this.parentNode.parentNode.style.display = "none";
			that._addForm();
		}
		
		f = null;
	},
	
	_onLoad: function() {
		
		if (this.conf.uploading && this.fr._idd != null) {
			var r = window.dhx4.s2j(this.fr.contentWindow.document.body.innerHTML);
			if (r != null) {
				if (typeof(r.state) != "undefined") {
					if (r.state == "cancelled") {
						this._onUploadAbort(this.fr._idd);
						this.fr.contentWindow.document.body.innerHTML = "";
						r = null;
						return;
					} else if (r.state == true) {
						if (typeof(r.size) != "undefined" && !isNaN(r.size)) this.file_data[this.fr._idd].size = r.size;
						this._onUploadSuccess(this.fr._idd, r.name, null, r.extra);
						r = null;
						return;
					}
				}
			}
			this._onUploadFail(this.fr._idd, (r!=null && r.extra != null ? r.extra:null));
		}
		
	},
	
	_addFileToQueue: function(t) {
		var v = t.value.match(/[^\\\/]*$/);
		if (v[0] != null) v = v[0]; else v = t.value;
		//
		var lastModifiedDate = null;
		var size = null;
		if (t.files != null && t.files[0] != null) {
			lastModifiedDate = t.files[0].lastModifiedDate||null;
			size = t.files[0].size||null;
		}
		//
		this.file_data[t._idd] = { file: {lastModifiedDate:lastModifiedDate}, name: v, size: size, form: t.parentNode, node: t.parentNode.parentNode, input: t, state: "added"};
		
		this._addFileToList(t._idd, v, (size||false), "added", 0);
		if (this.conf.auto_start && !this.conf.uploading) this._uploadStart(true);
	},
	
	_removeFileFromQueue: function(id) {
		
		var name = this.file_data[id].name;
		var serverName = (this.conf.uploaded_files!=null&&this.conf.uploaded_files[id]!=null?this.conf.uploaded_files[id].serverName:null);
		
		var fileData = {
			id: Number(id),
			name: name,
			size: this.file_data[id].size||null,
			serverName: serverName,
			uploaded: (this.file_data[id].state == "uploaded"),
			error: (this.file_data[id].state == "fail")
		};
		
		if (this.callEvent("onBeforeFileRemove",[fileData]) !== true) return;
		
		var k = false;
		if (this.file_data[id].custom == true) {
			if (this.cf_loader_id != null) {
				this._uploadStop();
				k = true;
			}
		} else {
			this.file_data[id].input.onchange = null;
			this.file_data[id].form.removeChild(this.file_data[id].input);
			this.file_data[id].node.removeChild(this.file_data[id].form);
			this.file_data[id].node.parentNode.removeChild(this.file_data[id].node);
			this.file_data[id].input = null;
			this.file_data[id].form = null;
			this.file_data[id].node = null;
		}
		
		this.file_data[id].name = null;
		this.file_data[id].size = null;
		this.file_data[id].state = null;
		this.file_data[id] = null;
		delete this.file_data[id];
		
		this._removeFileFromList(id);
		
		this.callEvent("onFileRemove",[fileData]);
		
		if (k) this._uploadStart();
	},
	
	_doUploadFile: function(id) {
		if (this.file_data[id].custom == true) {
			this._cfUploadStart(id);
		} else {
			this.fr._idd = id;
			this.file_data[id].form.action = this.conf.url;
			this.file_data[id].form.submit();
		}
	},
	
	_uploadStop: function() {
		if (!this.conf.uploading) return;
		if (this.cf_loader_id == null) {
			this._onUploadAbort(this.fr._idd);
			this.fr.contentWindow.location.href = (this.conf.url)+(this.conf.url.indexOf("?")<0?"?":"&")+"mode=html4&action=cancel&dhxr"+new Date().getTime();
		} else {
			this._cfUploadStop();
		}
	},
	
	_unloadEngine: function() {
		
		if (this.k) {
			
			this.conf.fr_name = null;
			this.fr.onreadystatechange = null;
			this.fr.onload = null;
			this.fr.parentNode.removeChild(this.fr);
			this.fr = null;
			
			// remove empty form
			this.k.firstChild.firstChild.lastChild.onchange = null;
			
			this.k.parentNode.removeChild(this.k);
			this.k = null;
			
		}
		
		this._initEngine = null;
		this._addForm = null;
		this._onLoad = null;
		this._addFileToQueue = null;
		this._removeFileFromQueue = null;
		this._doUploadFile = null;
		this._uploadStop = null;
		this._unloadEngine = null;
		
	}
	
};

/****************************************************************************************************************************************************************************************************************/
//	FLASH

dhtmlXVaultObject.prototype.flash = function(){};
dhtmlXVaultObject.prototype.flash.prototype = {
	
	_initEngine: function() {
		
		if (window.dhtmlXSWFObjectsPull == null) {
			window.dhtmlXSWFObjectsPull = {
				items: {},
				callEvent: function(id, name, params) {
					return window.dhtmlXSWFObjectsPull.items[id].uploader[name].apply(window.dhtmlXSWFObjectsPull.items[id].uploader,params);
				}
			};
		}
		
		var wmode = (window.dhx4.isIE6||window.dhx4.isIE7||navigator.userAgent.indexOf("MSIE 7.0")>=0?"opaque":"transparent");
		wnome = "transparent";
		
		this.conf.swf_obj_id = "dhxVaultSWFObject_"+window.dhx4.newId();
		this.conf.swf_file = this.conf.swf_file+(this.conf.swf_file.indexOf("?")>=0?"&":"?")+"dhxr"+new Date().getTime();
		if (window.dhx4.isIE) {
			// special for IE
			this.buttons.browse.innerHTML += "<div style='position:absolute;width:100%;height:100%;background-color:white;opacity:0;filter:alpha(opacity=0);left:0px;top:0px;'></div>";
			// IE6/IE7 gradient fix
			if (window.dhx4.isIE6 || window.dhx4.isIE7) this.buttons.browse.style.filter = "";
		}
		this.buttons.browse.innerHTML += "<div class='dhx_vault_flash_obj'><div id='"+this.conf.swf_obj_id+"'></div></div>";
		swfobject.embedSWF(this.conf.swf_file, this.conf.swf_obj_id, "100%", "100%", "9", null, {ID:this.conf.swf_obj_id,enableLogs:this.conf.swf_logs,paramName:this.conf.param_name,multiple:(this.conf.multiple_files?"Y":"")}, {wmode:wmode});
		
		// IE6/IE7 gradient fix in a window
		if ((window.dhx4.isIE6 || window.dhx4.isIE7) && this.conf.skin == "dhx_skyblue") {
			if (this.base.parentNode != null && this.base.parentNode.parentNode != null && this.base.parentNode.parentNode.className != null && this.base.parentNode.parentNode.className == "dhx_cell_wins") {
				this.base.parentNode.parentNode.style.filter = "none";
			}
		}
		
		var v = swfobject.getFlashPlayerVersion();
		
		this.conf.progress_type = "percentage";
		
		window.dhtmlXSWFObjectsPull.items[this.conf.swf_obj_id] = {id: this.conf.swf_obj_id, uploader: this};
	},
	
	_beforeAddFileToQueue: function(name, size, lastModifiedDate) {
		return (this.callEvent("onBeforeFileAdd", [{
			id: null,
			name: name,
			size: size,
			lastModifiedDate: lastModifiedDate,
			serverName: null,
			uploaded: false,
			error: false
		}])===true?1:0);
	},
	
	_addFileToQueue: function(id, name, size, lastModifiedDate) {
		if (window.dhx4.isIE) {
			// focus+hide fix for IE
			var k = document.createElement("INPUT");
			k.type = "TEXT";
			k.style.position = "absolute";
			k.style.left = "0px";
			k.style.top = window.dhx4.absTop(this.buttons["browse"])+"px";
			k.style.width = "10px";
			document.body.appendChild(k);
			k.focus();
			document.body.removeChild(k);
			k = null;
		}
		this.file_data[id] = {file: {lastModifiedDate:lastModifiedDate}, name: name, size: size, state: "added"};
		this._addFileToList(id, name, size, "added", 0);
		if (this.conf.auto_start && !this.conf.uploading) this._uploadStart(true);
	},
	
	_removeFileFromQueue: function(id) {
		
		if (!this.file_data[id]) return;
		
		var name = this.file_data[id].name;
		var serverName = (this.conf.uploaded_files!=null&&this.conf.uploaded_files[id]!=null?this.conf.uploaded_files[id].serverName:null);
		
		var fileData = {
			id: Number(id),
			name: name,
			size: this.file_data[id].size,
			serverName: serverName,
			uploaded: (this.file_data[id].state == "uploaded"),
			error: (this.file_data[id].state == "fail")
		};
		if (this.callEvent("onBeforeFileRemove",[fileData]) !== true) return;
		
		var k = false;
		if (this.conf.uploading && this.file_data[id].state == "uploading") {
			this._uploadStop();
			k = true;
		}
		
		swfobject.getObjectById(this.conf.swf_obj_id).removeFileById(id);
		
		this.file_data[id].name = null;
		this.file_data[id].size = null;
		this.file_data[id].state = null;
		this.file_data[id] = null;
		delete this.file_data[id];
		
		this._removeFileFromList(id);
		
		this.callEvent("onFileRemove",[fileData]);
		
		if (k) this._uploadStart();
		
	},
	
	_doUploadFile: function(id) {
		if (this.file_data[id].custom == true) {
			this._cfUploadStart(id);
		} else {
			swfobject.getObjectById(this.conf.swf_obj_id).upload(id, this.conf.swf_url);
		}
	},
	
	_uploadStop: function(id) {
		if (this.cf_loader_id != null) {
			this._cfUploadStop();
		} else {
			for (var a in this.file_data) if (this.file_data[a].state == "uploading") swfobject.getObjectById(this.conf.swf_obj_id).uploadStop(a);
		}
	},
	
	_getId: function() {
		return window.dhx4.newId();
	},
	
	_unloadEngine: function() {
		
		// remove instance from global storage
		
		if (window.dhtmlXSWFObjectsPull.items[this.conf.swf_obj_id]) {
			window.dhtmlXSWFObjectsPull.items[this.conf.swf_obj_id].id = null;
			window.dhtmlXSWFObjectsPull.items[this.conf.swf_obj_id].uploader = null;
			window.dhtmlXSWFObjectsPull.items[this.conf.swf_obj_id] = null
			delete window.dhtmlXSWFObjectsPull.items[this.conf.swf_obj_id];
		}
		
		this.conf.swf_obj_id = null;
		
		this._initEngine = null;
		this._addFileToQueue = null;
		this._removeFileFromQueue = null;
		this._doUploadFile = null;
		this._uploadStop = null;
		this._unloadEngine = null;
	}
	
};

dhtmlXVaultObject.prototype.setSWFURL = function(swf_url) {
	this.conf.swf_url = swf_url;
};

/****************************************************************************************************************************************************************************************************************/
//	SILVERLIGHT

dhtmlXVaultObject.prototype.sl = function(){};
dhtmlXVaultObject.prototype.sl.prototype = {
	
	_initEngine: function() {
		
		if (typeof(this.conf.sl_v) == "undefined") this.conf.sl_v = this.getSLVersion();
		
		if (!window.dhtmlXVaultSLObjects) {
			window.dhtmlXVaultSLObjects = {
				items: {},
				callEvent: function(id, name, params) {
					window.dhtmlXVaultSLObjects.items[id].uploader[name].apply(window.dhtmlXVaultSLObjects.items[id].uploader,params);
				}
			};
		}
		
		//var that = this;
		
		this.conf.sl_obj_id = "dhtmlXFileUploaderSLObject_"+window.dhx4.newId();
		
		if (this.conf.sl_v != false) {
			this.buttons["browse"].innerHTML += '<div style="width:100%;height:100%;left:0px;top:0px;position:absolute;">'+
									'<object data="data:application/x-silverlight-2," type="application/x-silverlight-2" width="100%" height="100%" id="'+this.conf.sl_obj_id+'">'+
										'<param name="source" value="'+this.conf.sl_xap+'"/>'+
										'<param name="background" value="Transparent"/>'+
										'<param name="windowless" value="true"/>'+
										'<param name="initParams" value="SLID='+this.conf.sl_obj_id+',LOGS='+this.conf.sl_logs+',GVAR=dhtmlXVaultSLObjects"/>'+
										'<param name="minRuntimeVersion" value="5.0"/>'+
									'</object>'+
								'</div>';
		} else {
			this.buttons["browse"].style.cursor = "wait";
			this.buttons["browse"].title = "";
		}
		
		this.conf.progress_type = "percentage";
		
		window.dhtmlXVaultSLObjects.items[this.conf.sl_obj_id] = {id: this.conf.sl_obj_id, uploader: this};
	},
	
	_addFileToQueue: function(id, name, size) {
		this.file_data[id] = {name: name, size: size, state: "added", file: {lastModifiedDate: null}};
		this._addFileToList(id, name, size, "added", 0);
		if (this.conf.auto_start && !this.conf.uploading) this._uploadStart(true);
	},
	
	_removeFileFromQueue: function(id) {
		if (!this.file_data[id]) return;
		
		var k = false;
		if (this.conf.uploading && this.file_data[id].state == "uploading") {
			this._uploadStop();
			k = true;
		}
		
		document.getElementById([this.conf.sl_obj_id]).Content.a.removeFileById(id);
		
		this.file_data[id].name = null;
		this.file_data[id].size = null;
		this.file_data[id].state = null;
		this.file_data[id].file = null;
		this.file_data[id] = null;
		delete this.file_data[id];
		
		this._removeFileFromList(id);
		
		if (k) this._uploadStart();
		
	},
	
	_doUploadFile: function(id) {
		// sl have inner url parser and params will cut,
		// sho should be passed via 3rd param
		var p = this.conf.sl_url.split("?");
		p = (p[1]!=null?"&"+p[1]:"");
		//
		document.getElementById(this.conf.sl_obj_id).Content.a.upload(id, this.conf.sl_url, p+"&mode=sl&dhxr"+new Date().getTime()); // leading "&" required!
	},
	
	_uploadStop: function(id) {
		this.conf.uploading = false;
		for (var a in this.file_data) if (this.file_data[a].state == "uploading") document.getElementById(this.conf.sl_obj_id).Content.a.uploadStop(a);
	},
	
	_unloadEngine: function() {
		
		// remove instance from global storage
		
		if (window.dhtmlXVaultSLObjects.items[this.conf.sl_obj_id]) {
			window.dhtmlXVaultSLObjects.items[this.conf.sl_obj_id].id = null;
			window.dhtmlXVaultSLObjects.items[this.conf.sl_obj_id].uploader = null;
			window.dhtmlXVaultSLObjects.items[this.conf.sl_obj_id] = null
			delete window.dhtmlXVaultSLObjects.items[this.conf.sl_obj_id];
		}
		
		this.conf.sl_obj_id = null;
		
		this._initEngine = null;
		this._addFileToQueue = null;
		this._removeFileFromQueue = null;
		this._doUploadFile = null;
		this._uploadStop = null;
		this._unloadEngine = null;
	}
	
};

dhtmlXVaultObject.prototype.setSLURL = function(url) {
	this.conf.sl_url = url;
};

dhtmlXVaultObject.prototype.getSLVersion = function() {
	var v = false;
	if (window.dhx4.isIE) {
		try {
			var t = new ActiveXObject('AgControl.AgControl');
			if (t != null) {
				// loop through [4-x, 0-9] until supported
				var k1 = 4, k2 = 0;
				while (t.isVersionSupported([k1,k2].join("."))) {
					v = [k1,k2];
					if (++k2 > 9) { k1++; k2=0; }
				}
			}
			t = null;
		} catch(e) {};
	} else {
		if (navigator.plugins["Silverlight Plug-In"] != null) {
			v = navigator.plugins["Silverlight Plug-In"].description.split(".");
		}
	}
	return v;
};

/****************************************************************************************************************************************************************************************************************/
// DEFAULT FILES VIEW

dhtmlXVaultObject.prototype.list_default = function() {
	
	this.t = {}; // items
	this.n = {}; // names
	
	this.addFileItem = function(id, fileList) {
		
		var item = document.createElement("DIV");
		item._idd = id;
		fileList.appendChild(item);
		
		this.t[id] = item;
		
		item = fileList = null;
	}
	
	this.isFileItemExist = function(id) {
		return (this.t[id] != null);
	}
	
	this.renderFileRecord = function(id, data) {
		
		var item = this.t[id];
		if (!item == null) return;
		
		item.className = "dhx_vault_file dhx_vault_file_"+data.state;
		item.innerHTML = "<div class='dhx_vault_file_param dhx_vault_file_name'>&nbsp;</div>"+
				"<div class='dhx_vault_file_param dhx_vault_file_progress'>&nbsp;</div>"+
				"<div class='dhx_vault_file_param dhx_vault_file_delete'>&nbsp;</div>"+
				"<div class='dhx_vault_file_icon dhx_vault_"+data.icon+"'><div class='dhx_vault_all_icons'></div></div>";
		
		item.childNodes[2]._action = {id: id, data: "delete_file"};
		
		this.updateFileNameSize(id, data);
		
		item = null;
	}
	
	this.removeFileRecord = function(id) {
		
		var item = this.t[id];
		if (item == null) return;
		
		item._idd = null;
		item.childNodes[2]._action = null;
		item.parentNode.removeChild(item);
		item = null;
		
		this.n[id] = this.t[id] = null;
		delete this.t[id];
		delete this.n[id];
		
	}
	
	this.updateFileNameSize = function(id, data) {
		
		var item = this.t[id];
		if (item == null) return;
		
		// name/size cache for quick update
		if (this.n[id] == null) this.n[id] = {};
		for (var a in {name: true, size: true, readableSize: true}) {
			if (data[a] != null) this.n[id][a] = data[a]; else data[a] = this.n[id][a];
		}
		
		var fileName = data.name+(!isNaN(data.size) && data.size !== false ? " ("+data.readableSize+")":"&nbsp;");
		if (data.download == true) fileName = "<a href='javascript:void(0);'>"+fileName+"</a>";
		
		item.childNodes[0].innerHTML = "<div class='dhx_vault_file_name_text'>"+fileName+"</div>";
		item.childNodes[0].title = data.name+(!isNaN(data.size) && data.size !== false ? " ("+data.readableSize+")" : "");
		
		if (data.download == true) item.childNodes[0].childNodes[0].childNodes[0]._action = {id: id, data: "download_file"};
		
		item = null;
		
	}
	
	this.updateFileState = function(id, data) {
		
		var item = this.t[id];
		if (item == null) return;
		
		var k = false;
		if (this.updateFileStateExtra != null) k = this.updateFileStateExtra(id, data);
		
		if (!k) {
			if (data.state == "added") {
				item.className = "dhx_vault_file dhx_vault_file_added";
				item.childNodes[1].className = "dhx_vault_file_param dhx_vault_file_progress";
				item.childNodes[1].innerHTML = "&nbsp;";
			}
			
			if (data.state == "fail") {
				item.className = "dhx_vault_file dhx_vault_file_fail";
				item.childNodes[1].className = "dhx_vault_file_param dhx_vault_file_progress";
				item.childNodes[1].innerHTML = data.str_error;
			}
			
			if (data.state == "size_exceeded") {
				item.className = "dhx_vault_file dhx_vault_file_size_exceeded";
				item.childNodes[1].className = "dhx_vault_file_param dhx_vault_file_progress";
				item.childNodes[1].innerHTML = data.str_size_exceeded;
			}
			
			if (data.state == "uploaded") {
				item.className = "dhx_vault_file dhx_vault_file_uploaded";
				item.childNodes[1].className = "dhx_vault_file_param dhx_vault_file_progress";
				item.childNodes[1].innerHTML = data.str_done;
			}
			
			if (data.state == "uploading_html4" || data.state == "uploading") {
				// gif
				item.className = "dhx_vault_file dhx_vault_file_uploading";
				item.childNodes[1].className = "dhx_vault_file_param dhx_vault_file_uploading";
				item.childNodes[1].innerHTML = "<div class='dhx_vault_progress'><div class='dhx_vault_progress_loader'>&nbsp;</div></div>";
			}
			
		}
		
		item = null;
	}
	
	this.updateStrings = function() {
		
	}
	
	this.unload = function() {
		this.t = null;
	}
	
};

// attach to container
if (typeof(window.dhtmlXCellObject) != "undefined" && typeof(dhtmlXCellObject.prototype.attachVault) == "undefined") {

	dhtmlXCellObject.prototype.attachVault = function(conf) {
		
		var obj = document.createElement("DIV");
		obj.style.position = "relative";
		obj.style.width = "100%";
		obj.style.height = "100%";
		obj.style.overflow = "hidden";
		this._attachObject(obj);
		
		obj._attach_mode = true;
		obj._no_border = true;
		
		// keep borders for windows
		if (typeof(window.dhtmlXWindowsCell) != "undefined" && this instanceof dhtmlXWindowsCell) {
			obj._no_border = false;
		}
		
		if (typeof(conf) != "object" || conf == null) conf = {};
		conf.parent = obj;
		if (typeof(conf.skin) == "undefined") conf.skin = this.conf.skin;
		
		this.dataType = "vault";
		this.dataObj = new dhtmlXVaultObject(conf);
		
		// sometimes layout broke vault's dimension
		if (typeof(window.dhtmlXLayoutCell) != "undefined" && this instanceof dhtmlXLayoutCell) {
			this.layout._getMainInst().attachEvent("onExpand", function(ids){
				for (var q=0; q<ids.length; q++) {
					var cell = this.cells(ids[q]);
					if (cell.dataType == "vault" && cell.dataObj != null) cell.dataObj.setSizes();
					cell = null;
				}
			});
		}
		
		conf.parent = null;
		conf = obj = null;
		
		return this.dataObj;
	};
	
};

// bootstrap skin buttons
dhtmlXVaultObject.prototype.buttonCss = {
	bootstrap: {
		browse: "_browse",
		upload: "_upload",
		cancel: "_cancel",
		clear: "_clear"
	}
};

// attach to popup
if (typeof(window.dhtmlXPopup) != "undefined" && typeof(dhtmlXPopup.prototype.attachVault) == "undefined") {
	dhtmlXPopup.prototype.attachVault = function(width, height, conf) {
		return this._attachNode("vault", {width: width||350, height: height||200, conf:conf||{}});
	};
	dhtmlXPopup.prototype._attach_init_vault = function(data) {
		data.conf.parent = this._nodeId;
		document.getElementById(this._nodeId)._no_border = true;
		if (typeof(data.conf.skin) == "undefined") data.conf.skin = this.conf.skin;
		this._nodeObj = new dhtmlXVaultObject(data.conf);
	};
};

