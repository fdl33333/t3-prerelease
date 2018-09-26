function getOptionText(form, select) {
	var opts = form.getOptions(select);
	return(opts[opts.selectedIndex].text);
}


function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function number_format(number, decimals, dec_point, thousands_sep) {
    // http://kevin.vanzonneveld.net
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     bugfix by: Michael White (http://getsprink.com)
    // +     bugfix by: Benjamin Lupton
    // +     bugfix by: Allan Jensen (http://www.winternet.no)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +     bugfix by: Howard Yeend
    // +    revised by: Luke Smith (http://lucassmith.name)
    // +     bugfix by: Diogo Resende
    // +     bugfix by: Rival
    // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
    // +   improved by: davook
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Jay Klehr
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Amir Habibi (http://www.residence-mixte.com/)
    // +     bugfix by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Drew Noakes
    // *     example 1: number_format(1234.56);
    // *     returns 1: '1,235'
    // *     example 2: number_format(1234.56, 2, ',', ' ');
    // *     returns 2: '1 234,56'
    // *     example 3: number_format(1234.5678, 2, '.', '');
    // *     returns 3: '1234.57'
    // *     example 4: number_format(67, 2, ',', '.');
    // *     returns 4: '67,00'
    // *     example 5: number_format(1000);
    // *     returns 5: '1,000'
    // *     example 6: number_format(67.311, 2);
    // *     returns 6: '67.31'
    // *     example 7: number_format(1000.55, 1);
    // *     returns 7: '1,000.6'
    // *     example 8: number_format(67000, 5, ',', '.');
    // *     returns 8: '67.000,00000'
    // *     example 9: number_format(0.9, 0);
    // *     returns 9: '1'
    // *    example 10: number_format('1.20', 2);
    // *    returns 10: '1.20'
    // *    example 11: number_format('1.20', 4);
    // *    returns 11: '1.2000'
    // *    example 12: number_format('1.2000', 3);
    // *    returns 12: '1.200'
    var n = !isFinite(+number) ? 0 : +number, 
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        toFixedFix = function (n, prec) {
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            var k = Math.pow(10, prec);
            return Math.round(n * k) / k;
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

/// dynamically create K->v array;
/****
par = Array();


epForm.forEachItem(function(name){
    if(epForm.getItemType(name)!="label") {
        var obj ={};
        obj[name] = epForm.getItemValue(name);
        par.push(obj);
    }
});

json = JSON.stringify(par);
**********/        

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

function getUrlPars() { 
 	var urlPars = {};
	var temp = location.search;
	if (temp!="") {
		temp = temp.substr(1);
		// alert(temp);
		pars = temp.split("&");
		pars.forEach(function (p) {
			var kv = p.split("=");
			var k=kv[0];
			if (kv.length > 1) var v = kv[1];
			else               var v = "";
			urlPars[k] = v;
		});
	}
	return(urlPars);
}

function checkDateInput (bt)	{
	var s = bt.value;
	var v='';

	// trim it!
	s = s.trim();


	if (s.indexOf('-')!=-1) {
		alert('Errore Formato Data:' + bt.value + '\r\nDate format must be gg/mm/yyyy');
		bt.focus();
		return(false);
	}

	if (s=='')		return;

	if (s=='0')		s='+0';

	
	var p = s.indexOf('+')
	
	if (p!=-1)
		v=s.substr(p);
	else 	{
		p = s.indexOf('-')
		if (p!=-1)
			v=s.substr(p);
	}

	
	if (p!=-1)		var dp=s.substr(0,p)
	else			dp=s;
	
	
	date = new Date();
	
	var pp=dp.split('/');
	

	if (pp.length > 0 && pp[0]!='') 	date.setDate(1);
	
	
	if (pp.length > 2) 		{
		yy=eval(pp[2]);

		if (yy < 1900) 	{
			if (yy > 30) 	yy += 1900;
			else			yy += 2000; 
//			alert('year less than 1900! - set to:' + yy);
		}
		date.setYear(yy);
	}

	if (pp.length > 1)		date.setMonth(eval(pp[1])-1);
	
	if (pp.length > 0) 	{
		if (pp[0]!='')
			date.setDate(eval(pp[0]));	
	}
	
	if (v!='')		date.setDate(date.getDate() + eval(v))
	
//	bt.value=fmtDate(date);
	bt.value=dtJavaToGen(date);

	return(true);
}
 
function currentPath() {
	var url = window.location.href;
	var pos = url.lastIndexOf("/");
	return(url.substring(0,pos));
}
 
function roundToTwo(num) {    
	var ret = (Math.round(num + "e+2")  + "e-2");
	return(Number(ret).toFixed(2));
}

function dump(arr,level) {
    var dumped_text = "";
    if(!level) level = 0;
    
    //The padding given at the beginning of the line.
    var level_padding = "";
    for(var j=0;j<level+1;j++) level_padding += "--";
    
    if(typeof(arr) == 'object') { //Array/Hashes/Objects 
        for(var item in arr) {
            var value = arr[item];
            
            if(typeof(value) == 'object') { //If it is an array,
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += dump(value,level+1);
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
            }
        }
    } else { //Stings/Chars/Numbers etc.
        dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
    }
    return dumped_text;
}
  
function print_r( obj, max, sep, level ) {
    level = level || 0;
    max = max || 10;
    sep = sep || ' ';

    if( level > max ) return "[WARNING: Too much recursion]\n";

    var i, result = '', tab = '', t = typeof obj;

    if( obj === null ) {
        result += "(null)\n";
    } else if( t == 'object' ) {
        level++;

        for( i = 0; i < level; i++ ) { tab += sep; }
        if( obj && obj.length ) { t = 'array'; }

        result += '(' + t + ") :\n";
        for( i in obj ) {
            try {
                result += tab + '[' + i + '] : ' + print_r( obj[i], max, sep, (level + 1) );
            } catch( error ) {
                return "[ERROR: " + error + "]\n";
            }
        }
    } else {
        if( t == 'string' ) {
            if( obj == '' )    obj = '(empty)';
        }
        result += '(' + t + ') ' + obj + "\n";
    }
    return result;
}; 

function rgbToHex(a){
  a=a.replace(/[^\d,]/g,"").split(","); 
  return"#"+((1<<24)+(+a[0]<<16)+(+a[1]<<8)+ +a[2]).toString(16).slice(1)
}

 // GET parameter from url from js!!! usually only from server side (php) with $_GET
function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
  
function getViewportSize() {
            
    if (typeof window.innerWidth != 'undefined') {
        viewportHeight  = window.innerHeight;
        viewportWidth   = window.innerWidth; 
    } else {
        viewportHeight  = document.documentElement.clientHeight;
        viewportWidth   = document.documentElement.clientHeight;
    }
    
    if ((viewportHeight > document.body.parentNode.scrollHeight) && (viewportHeight > document.body.parentNode.clientHeight)) {
        vpHeight = viewportHeight;
    } else {
        if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
            vpHeight = document.body.parentNode.clientHeight;
        } else {
            vpHeight = document.body.parentNode.scrollHeight;
        }
    }
    if ((viewportWidth > document.body.parentNode.scrollWidth) && (viewportWidth > document.body.parentNode.clientWidth)) {
        vpWidth = viewportWidth;
    } else {
        if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
           vpWidth = document.body.parentNode.clientWidth;
        } else {
            vpWidth = document.body.parentNode.scrollWidth;
        }
    }

    return ({width:vpWidth, height:vpHeight});
}
 
var dateFormat = function () {
    var    token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };
         
    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var    _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),                                                       
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getFormValues(formId) {
	// returns object with k:v pairs of all elements in form. no need for names, just elements id
	// *** NEED TO IMPLEMENT CHECKBOX!!!	

	var obj ={};

    var elements = document.getElementById(formId).elements;
    for(var i = 0 ; i < elements.length ; i++){
        if (elements[i].type=="radio") {
        	if (elements[i].checked) {
				obj[elements[i].id] = elements[i].value;
			} else {
				 if(!(elements[i].id in obj))
				 obj[elements[i].id] = "";
			}
        } else
        	obj[elements[i].id] = elements[i].value;
    }

    
    return(obj);
}

function selFillJson(selId, rows) {
	// fills select box selId with k, v pairs ...
	var sel = document.getElementById(selId);
	rows.forEach(function(r) {
		var opt = new Option(r.v, r.k);
		sel.options[sel.options.length] = opt;
	});
	
}

function asyncFillLb(url, data, lb) {
    
    // data calls a webservice, i.e. action:GET_COUNTRIES, sql MUST respond k/v pairs...
    
    method = 'POST';
    
    async = true;

    if (data!=null) {
	    if (data.constructor  === Object) {
	        var query = [];
	        for (var key in data) {
	            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
	        }
	        req = query.join('&');
	    } else {
	        req = data;
	    }
	}
    
    if (window.XMLHttpRequest)  var xhReq = new XMLHttpRequest();
    else                        var xhReq = new ActiveXObject("Microsoft.XMLHTTP");

    xhReq.onreadystatechange = function() {
  		if (this.readyState == 4 && this.status == 200) {
    		ret = JSON.parse(xhReq.responseText);	
			if (ret.status!=0)		alert("ErrMsg:" + ret.errMsg);
			else 					selFillJson(lb, ret.rows);
  		}
	};
    
    xhReq.open(method, url, async);
    xhReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhReq.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhReq.send(req);
	
}

function AGP(url, data, method) {
    method = typeof method !== 'undefined' ? method : 'POST';
    
    async = false;

    if (data!=null) {
	    if (data.constructor  === Object) {
	        var query = [];
	        for (var key in data) {
	            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
	        }
	        req = query.join('&');
	    } else {
	        req = data;
	    }
	}
    // alert(req);
    
    if (window.XMLHttpRequest)  var xhReq = new XMLHttpRequest();
    else                        var xhReq = new ActiveXObject("Microsoft.XMLHTTP");

    if (method == 'POST') {
        xhReq.open(method, url, async);
        xhReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhReq.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhReq.send(req);
    }  else {
        if(typeof data !== 'undefined' && data !== null) 
            url = url+'?' + req;
        xhReq.open(method, url, async);
        xhReq.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhReq.send(null);
    }
  
    // alert(xhReq.responseText);
    try {
    	ret = JSON.parse(xhReq.responseText)
    	return(ret);
	} catch (e) {
		return({
			status:9
		,	errMsg:xhReq.responseText 
		});
	}
}
         
function winAlready(winId)  {
	var found = false;
	dhxWins.forEachWindow(function(win) {
		if (win.getId()== winId)
			found = true;
	});

	if (found) {
		dhxWins.window(winId).bringToTop();
	}
	return(found);
}

// console.log(padLeft(23,5));       //=> '00023'
function padLeft(nr, n, str) {
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}


/***
EXAMPLE


var sql = "SELECT * FROM test1 ORDER BY opName LIMIT 5";
var jsonData = sql2json(sql);
if (jsonData[0].error!=undefined)
	alert(jsonData[0].error)
else {
	var txt = "";
	for (i=0; i<jsonData.length; i++)
		txt += jsonData[i].opName + " - " + jsonData[i].monteOre + "\n";
	
	alert(txt);
}

OR EVEN

alert ( sql2json("SELECT name FROM table WHERE id = 1")[0].name );

**/

function postJSON(url, reqArr) {
    req=getXMLObj();
    if(req==null) return(null);
    var data = JSON.stringify(reqArr);

    req.open("POST", url, false);    
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    // req.send(data);    
    req.send(reqArr);
    var ret = req.responseText;  
    var json = JSON.parse(ret);
    return (json);
}

/**
* put your comment there...
* 
xhr = new XMLHttpRequest();
var url = "url";
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-type", "application/json");
xhr.onreadystatechange = function () { 
    if (xhr.readyState == 4 && xhr.status == 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json.email + ", " + json.password)
    }
}
var data = JSON.stringify({"email":"hey@mail.com","password":"101010"});
xhr.send(data);

* 
* @param sql
*/

function sql2json(sql) {
	return(getJSON("../sql2json.php?sql=" + encodeURI(sql)));
}

function getJSON (url) {
	req=getXMLObj();
	if(req==null) return(null);
	req.open("POST", url, false);    
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");    
	req.send("");    
	var ret = req.responseText;  
	var json = JSON.parse(ret);
    return (json);
}

function getHTML(url) {  
	req=getXMLObj();
	if(req==null) return(null);
	req.open("POST", url, false);    
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");    
	req.send("");    
	return req.responseText;                                           
}

function getXMLObj() {	
	if(window.XMLHttpRequest) { //For Firefox, Safari, Oper
		return(new XMLHttpRequest());
	} else if(window.ActiveXObject) {  //For IE 5
			return(new ActiveXObject("Microsoft.XMLHTTP"));
	} else if(window.ActiveXObject) { //For IE 6+
		return(new ActiveXObject("Msxml2.XMLHTTP"));
	} else  //Error for an old browser
		return(null);
}


function replaceAll2(str, find, rep) {
    return str.replace(new RegExp(find, 'g'), rep);
}


function replaceAll(str, find, replace)      {
    while( str.indexOf(find) > -1)       {
        str = str.replace(find, replace);
    }
    return str;
}



function dtMyToGen(dtStr) {
	return(dtJavaToGen(dtMyToJava(dtStr)));
}

function dtGenToJava(dtStr) {  
	var pp=dtStr.split('/');
	var dt = new Date( eval(pp[2]),eval(pp[1])-1,eval(pp[0]),0,0,0);
	return(dt);
}

function dtMyToJava(dtStr) {
	// remember dtStr COULD contain the hour part, therefore first split on a ' '
	var dttm=dtStr.split(' ');
	var pp=dttm[0].split('-');
	var dt = new Date( eval(pp[0]),eval(pp[1])-1,eval(pp[2]),0,0,0);
	return(dt);
}

function dtJavaToGen(dt) {
	return(padLeftZero(dt.getDate() +'',2) 
		+ '/' + padLeftZero((dt.getMonth()+1 ) + '',2) 
		+ '/' + padLeftZero(dt.getFullYear() + '',4))
}


function dtJavaToMy(dt) {
	return(padLeftZero(dt.getFullYear() +'',4) 
		+ '-' + padLeftZero((dt.getMonth()+1 ) + '',2) 
		+ '-' + padLeftZero(dt.getDate() + '',2))
}

function dtGenToMy(dtStr) {
	return(dtJavaToMy(dtGenToJava(dtStr)));
}

function dtShift(dt,n) {
	var d2=new Date();
	d2.setDate(1);
	d2.setYear(dt.getFullYear());
	d2.setMonth(dt.getMonth());
	d2.setDate(dt.getDate() + n);
	return(d2);
}

function padLeftZero(s,n) {
	var l=s.length;
	if (l>=n) 	return (s);
	for (var i=l; i<n; i++) 	s = '0' + s;
	return(s);
}

var print_r2 = function (obj, t) {

    // define tab spacing
    var tab = t || '';

    // check if it's array
    var isArr = Object.prototype.toString.call(obj) === '[object Array]';
	
    // use {} for object, [] for array
    var str = isArr ? ('Array\n' + tab + '[\n') : ('Object\n' + tab + '{\n');

    // walk through it's properties
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            var val1 = obj[prop];
            var val2 = '';
            var type = Object.prototype.toString.call(val1);
            switch (type) {
                
                // recursive if object/array
                case '[object Array]':
                case '[object Object]':
                    val2 = print_r2(val1, (tab + '\t'));
                    break;
					
                case '[object String]':
                    val2 = '\'' + val1 + '\'';
                    break;
					
                default:
                    val2 = val1;
            }
            str += tab + '\t' + prop + ' => ' + val2 + ',\n';
        }
    }
	
    // remove extra comma for last property
    str = str.substring(0, str.length - 2) + '\n' + tab;
	
    return isArr ? (str + ']') : (str + '}');
};