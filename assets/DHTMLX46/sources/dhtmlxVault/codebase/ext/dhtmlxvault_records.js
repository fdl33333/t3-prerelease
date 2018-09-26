/*
Product Name: dhtmlxVault 
Version: 2.4.1 
Edition: Standard 
License: content of this file is covered by GPL. Usage outside GPL terms is prohibited. To obtain Commercial or Enterprise license contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXVaultObject.prototype.load = function(url, callback) { // load list of early uploaded files from server
	
	if (this.conf.dataload_inited != true) {
		
		this.conf.dataload_inited = true;
		
		// check if not set - enable by the default
		if (typeof(this.conf.dataload_progress) == "undefined") this.conf.dataload_progress = true;
		
		// progress events
		this.attachEvent("onXLS", this._progressOn);
		this.attachEvent("onXLE", this._progressOff);
		
		// use common data loading functionality,
		// it will override current function after first call
		window.dhx4._enableDataLoading(this, "_initObj", "_xmlToObj", "files", {data:true});
		
		this.load.apply(this, arguments);
	}
	
};

dhtmlXVaultObject.prototype.addFileRecord = function(file, status) { // add custom file record to list
	
	if (status == null || {added: true, uploaded: true}[status] != true) return;
	
	var id = window.dhx4.newId();
	if (typeof(file.name) == "undefined" || file.name == null) file.name = "New File Record";
	if (typeof(file.size) == "undefined" || file.size == null) file.size = false; // not set
	
	this.file_data[id] = {file:{}};
	
	this._addFileToList(id, file.name, file.size, status, 0);
	
	if (status == "uploaded") {
		if (typeof(file.serverName) == "undefined" && file.serverName == null) file.serverName = file.name;
		this.conf.uploaded_files[id] = { realName: file.name, serverName: file.serverName };
		if (this.conf.download_url.length > 0) this.list.updateFileNameSize(id, {download: true});
	};
	
	this.file_data[id] = {
		name: file.name,
		size: file.size,
		state: status, // "added", "uploaded"
		file: {},
		custom: true,  // required for custom record
		fileData: file // will go to server
	};
	
	this.list.updateFileState(id, {state: status, str_done: this.strings.done});
	
	if (this.conf.auto_start && !this.conf.uploading) this._uploadStart(true);
};

// uploading
dhtmlXVaultObject.prototype._cfOnUpload = function() {
	
	if (this.cf_loader_id == null) return;
	var id = this.cf_loader_id;
	this.cf_loader_id = null;
	
	dhx4.temp = null;
	try {eval("dhx4.temp="+this.cf_loader.responseText);} catch(e){};
	var r = dhx4.temp;
	dhx4.temp = null;
	
	try {
		this.cf_loader.onreadystatechange = null;
		this.cf_loader = null;
	} catch(e){};
	
	try {
		delete this.cf_loader.onreadystatechange;
		delete this.cf_loader;
	} catch(e){};
	
	if (r != null && typeof(r) == "object" && typeof(r.state) != "undefined" && r.state == true) {
		if (this.file_data[id].custom == true && typeof(r.size) != "undefined") this._cfUpdateSize(id, r.size);
		this._onUploadSuccess(id, r.name, undefined, r.extra);
	} else {
		this._onUploadFail(id, (r!=null&&r.extra!=null?r.extra:null));
	}
	
	r = null;
	
};

dhtmlXVaultObject.prototype._cfUpdateSize = function(id, size) {
	
	this.file_data[id].size = size;
	var nameSizeData = {
		name: this.file_data[id].name,
		size: this.file_data[id].size,
		readableSize: this.readableSize(this.file_data[id].size||0)
	};
	var t = this;
	window.setTimeout(function(){
		t.list.updateFileNameSize(id, nameSizeData);
		t = nameSizeData = null;
	},100);
	
};

dhtmlXVaultObject.prototype._cfUploadStart = function(id) {
	
	var postData = ["mode=custom"];
	for (var a in this.file_data[id].fileData) postData.push(encodeURIComponent(a)+"="+encodeURIComponent(this.file_data[id].fileData[a]));
	postData = postData.join("&");
	
	var that = this;
	
	this.cf_loader = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
	this.cf_loader.onreadystatechange = function() {
		if (that.cf_loader.readyState == 4) {
			if (that.cf_loader.status == 200) {
				that._cfOnUpload();
			} else if (that.cf_loader.status == 404) {
				that._onUploadFail(that.cf_loader_id);
			}
			that = null;
		}
	}
	
	if (window.dhx4.ajax.cache != true) postData += (postData.length>0?"&":"")+"dhxr"+new Date().getTime();
	
	this.cf_loader_id = id;
	
	this.cf_loader.open("POST", this.conf.url, true);
	this.cf_loader.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	this.cf_loader.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	this.cf_loader.send(postData);
	
};

dhtmlXVaultObject.prototype._cfUploadStop = function() {
	var id = this.cf_loader_id;
	this.cf_loader_id = null;
	this.cf_loader.abort();
	this._onUploadAbort(id);
};

// data loading
dhtmlXVaultObject.prototype._initObj = function(data) {
	for (var q=0; q<data.length; q++) this.addFileRecord(data[q], "uploaded");
};


dhtmlXVaultObject.prototype._xmlToObj = function(doc) {
	
	var f = [];
	
	if (!this.conf.xml_attrs) this.conf.xml_attrs = {name: "name", size: "size", serverName: "serverName"}; // xml_name:json_name
	
	var t = doc.getElementsByTagName("files")[0];
	for (var q=0; q<t.childNodes.length; q++) {
		if (t.childNodes[q].tagName != null && String(t.childNodes[q].tagName).toLowerCase() == "file") {
			var i = t.childNodes[q];
			var r = {};
			for (var a in this.conf.xml_attrs) {
				if (i.getAttribute(a) != null) {
					r[this.conf.xml_attrs[a]] = i.getAttribute(a);
				}
			}
			f.push(r);
			i = r = null;
		}
	}
	
	return f;
};

// progress
dhtmlXVaultObject.prototype._progressOn = function() {
	
	if (this.conf.dataload_progress == true) {
		
		if (this.conf.progress_tm != null) window.clearTimeout(this.conf.progress_tm);
		
		if (this.p_progress == null) {
		
			this.p_progress = document.createElement("DIV");
			this.p_progress.className = "dhx_vault_f_pr";
			this.base.appendChild(this.p_progress);
			
			// set sizes event
			if (typeof(this.conf.progress_event) == "undefined") this.conf.progress_event = this.attachEvent("_onSetSizes", this._progressAdjust);
			
			this._progressAdjust();
		}
		
	}
};

dhtmlXVaultObject.prototype._progressOff = function() {
	var t = this;
	if (this.conf.progress_tm != null) window.clearTimeout(this.conf.progress_tm);
	this.conf.progress_tm = window.setTimeout(function(){
		if (t.p_progress != null) {
			t.p_progress.parentNode.removeChild(t.p_progress);
			t.p_progress = null;
		};
		t = null;
	}, 200);
};

dhtmlXVaultObject.prototype._progressAdjust = function() {
	if (this.p_progress != null) {
		this.p_progress.style.left = this.p_files.style.left;
		this.p_progress.style.top = this.p_files.style.top;
		this.p_progress.style.width = this.p_files.style.width;
		this.p_progress.style.height = this.p_files.style.height;
	}
};


