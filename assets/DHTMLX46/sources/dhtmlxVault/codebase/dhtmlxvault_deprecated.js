/*
Product Name: dhtmlxVault 
Version: 2.4.1 
Edition: Standard 
License: content of this file is covered by GPL. Usage outside GPL terms is prohibited. To obtain Commercial or Enterprise license contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/* deprecated */
dhtmlXVaultObject.prototype.setServerHandlers = function(uploadHandler) {
	// defines server-side handlers for vault
	// moved to init, only for html4/tml5
	this.conf.upload_url = uploadHandler;
};

dhtmlXVaultObject.prototype.setImagePath = function(imagePath) {
	// set relative path to the images folder
	// no longer needed
};

dhtmlXVaultObject.prototype.create = function(container) {
	// creates vault html control on page
	// no longer needed, created automaticaly from constructor
};

dhtmlXVaultObject.prototype.onAddFile = function(handler) {
	// called when user has selected a file for uploading
	this.attachEvent("onBeforeFileAdd", function(name,size){
		return handler.apply(this,[name]);
	});
};

dhtmlXVaultObject.prototype.onFileUploaded = function(handler) {
	// called after every file is uploaded
	this.attachEvent("onUploadFile", function(f){
		handler.apply(this,[f]);
	});
	this.attachEvent("onUploadFail", function(f){
		handler.apply(this,[f]);
	});
};

dhtmlXVaultObject.prototype.onUploadComplete = function(handler) {
	// called after all files are uploaded
	this.attachEvent("onUploadComplete", function(fs){
		handler.apply(this, fs);
	});
};

dhtmlXVaultObject.prototype.setFormField = function(name, value) {
	// adds custom fields to the form
	for (var a in {url:1, swf_url:1, sl_url:1}) {
		this.conf[a] += (String(this.conf[a]).indexOf("?")<0?"?":"&")+name+"="+encodeURIComponent(value);
	}
};

