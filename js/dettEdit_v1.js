function dettEdit() {

	var dettId = 0;
	var cpChanged = false;

    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "dettWin";
    if (winAlready(winId))
            return;
    dettWin  = dhxWins.createWindow(winId, 0, 0, 900, 520);
    dettWin.setText("Anagrafica Detenuti");
    dettWin.denyResize();
    dettWin.attachEvent("onClose", function(win){
        
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    dettLayout = new dhtmlXLayoutObject(dettWin,"1C");
    dettLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////
    dettToolbar = dettLayout.cells("a").attachToolbar();
    dettToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    dettToolbar.addButton("tNew",1,"Nuovo Detenuto","plus.ico","");   
    dettToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 
    
        
    dettToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
		        dettId = 0;
		        dettForm.clear();
				WLNrmGrid.clearAll();
				WLAvvGrid.clearAll();
				WLSupGrid.clearAll();
				WLStrGrid.clearAll();
		        dettLayout.cells("a").showView("form");
		        dettWin.setText("Nuovo Detenuto");
				mainTabbar.tabs("cAna").setActive();
				callsTabbar.tabs("cNrm").setActive();
				dettLayout.cells("a").showView("tabs");
                break;

            case "tDel" :
                alert('funzione disabilitata');
                // bamCatsDel();
                break;
        }
    });
        
    
    // GRID ////////////////////////////////////////////////////////////////////

    dettGrid = dettLayout.cells("a").attachGrid();
    dettGrid.setHeader("Cognome,Nome,Matricola,Tessera,Lingua,Tipo Crimine");
    // dettGrid.setColumnIds("serial,pinOrig,pin,dtCreate,notes");
    dettGrid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#select_filter,#select_filter");
    dettGrid.setColSorting("str,str,str,str,str,str");

    dettGrid.setInitWidths("120,120,100,60,100,*");
    dettGrid.setColTypes("ro,ro,ro,ro,ro,ro");
    dettGrid.enableSmartRendering(true);
    dettGrid.init();


    dettGrid.load("../cn/dettGrid.php");

    dettGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        dettId = rId;
        dettForm.clear();
		dettWin.setText(dettGrid.cells(rId,0).getValue() + " " + dettGrid.cells(rId,1).getValue());
		mainTabbar.tabs("cAna").setActive();
		callsTabbar.tabs("cNrm").setActive();
		WLNrmGrid.clearAll();
		WLAvvGrid.clearAll();
		WLSupGrid.clearAll();
		WLStrGrid.clearAll();
        dettForm.load("../cn/dettForm.php?id="+rId, function(id, response) {
			var ret = AGP(wsURL, {action:"LOAD_CALL_STRUCT", dettId:rId});
			if (ret.status!=0)	{
				dhtmlx.alert(ret.errMsg);
				return;
			}
			ret.callStruct.forEach(function (c) {
				var grid = null;
				switch (c.tip) {
					case	"N":	grid = WLNrmGrid;	break;	
					case	"A":	grid = WLAvvGrid;	break;	
					case	"S":	grid = WLSupGrid;	break;	
					case	"X":	grid = WLStrGrid;	break;	
				}
				grid.addRow(c.wlId , [	c.num, c.callsQta, c.callsFreq
											, c.duration, c.attNum, c.attWithin
											, c.record,dtMyToGen(c.expire), c.descr],0);

			});
			dettLayout.cells("a").showView("tabs");
        });        
    });      
    
	dettLayout.cells("a").showView("tabs");
	
	mainTabbar = dettLayout.cells("a").attachTabbar({
		tabs: [
	        {id: "cAna", text: "Anagrafica", active: true}
	    ,	{id: "cCalls", text: "Chiamate"}
	    ,	{id: "cHist", text: "Storico"}
	    ]
	});

	
    
    // FORM ////////////////////////////////////////////////////////////////////
    
    var dettFormData = [
   		{type:'label',     label:'Cognome',   	position:'absolute',    labelTop:5,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'lname',  	position:'absolute',    inputTop:7,    inputLeft: 110, inputWidth:200, maxLength:50, validate:"NotEmpty"}
	
	,	{type:'image',  url:'picHandler.php', name:'pic1',  position:'absolute',    inputTop:7,    inputLeft: 320
				,  inputWidth: 200,	inputHeight: 200}
	
	,	{type:'image',  url:'picHandler.php', name:'pic2',  position:'absolute',    inputTop:7,    inputLeft: 530
				,  inputWidth: 200,	inputHeight: 200}
	

   	,	{type:'label',     label:'Nome',   	position:'absolute',    labelTop:40,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'fname',  	position:'absolute',    inputTop:42,    inputLeft: 110, inputWidth:200,maxLength:50,validate:"NotEmpty"}
	
   	,	{type:'label',     label:'Data di Nascita',   	position:'absolute',    labelTop:75,     labelLeft: 5, labelWidth: 200}		
	,	{type:'calendar',  	name:'bdate',  	position:'absolute',    inputTop:77,    inputLeft: 110, inputWidth:80
			,dateFormat: '%d/%m/%Y',serverDateFormat:'%Y-%m-%d'	}
	
   	,	{type:'label',     label:'Matricola',   	position:'absolute',    labelTop:111,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'matr',  	position:'absolute',    inputTop:113,    inputLeft: 110, inputWidth:80, maxLength:20}

   	,	{type:'label',     label:'Tipo Crimine',   	position:'absolute',    labelTop:146,     labelLeft: 5, labelWidth: 200}		
	,	{type:'select',  	name:'ctypeId',  	position:'absolute',    inputTop:148,    inputLeft: 110, inputWidth:200
			,connector:"../cn/ctypeList.php" }

   	,	{type:'label',     label:'Lingua',   	position:'absolute',    labelTop:181,     labelLeft: 5, labelWidth: 200}		
	,	{type:'select',  	name:'langCode',  	position:'absolute',    inputTop:183,    inputLeft: 110, inputWidth:200
			, connector:"../cn/langList.php"}

				

   	,	{type:'label',     label:'Note',   	position:'absolute',    labelTop:216,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'notes',  	position:'absolute',    inputTop:218,    inputLeft: 110, inputWidth: 50
			, inputWidth:620, rows:6}

/***************************************************************************/
	,	{type:'label',     label:'Limiti Globali per Chiamate',   	position:'absolute',    labelTop:320,     labelLeft: 5, labelWidth: 100}		


	,	{type:'label',     label:'Normali',   	position:'absolute',    labelTop:320,     labelLeft: 110, labelWidth: 300}		
	,	{type:'select',  	name:'limNrmNum',  	position:'absolute',    inputTop:322,    inputLeft: 215, inputWidth:40}
	,	{type:'select',  	name:'limNrmFreq',  	position:'absolute',    inputTop:322,    inputLeft: 267, inputWidth:100
		, options:[{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }
	
	
	,	{type:'label',     label:'Avvocati',   	position:'absolute',    labelTop:320,     labelLeft:410, labelWidth: 300}		
	,	{type:'select',  	name:'limAvvNum',  	position:'absolute',    inputTop:322,    inputLeft: 515, inputWidth:40}
	,	{type:'select',  	name:'limAvvFreq',  	position:'absolute',    inputTop:322,    inputLeft: 567, inputWidth:100
		, options:[{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }

	
	,	{type:'label',     label:'Supplementari',   	position:'absolute',    labelTop:355,     labelLeft: 110, labelWidth: 300}		
	,	{type:'select',  	name:'limSupNum',  	position:'absolute',    inputTop:357,    inputLeft: 215, inputWidth:40}
	,	{type:'select',  	name:'limSupFreq',  	position:'absolute',    inputTop:357,    inputLeft: 267, inputWidth:100
		, options:[{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }
	
	
	,	{type:'label',     label:'Straordinarie',   	position:'absolute',    labelTop:355,     labelLeft: 410, labelWidth: 300}		
	,	{type:'select',  	name:'limStrNum',  	position:'absolute',    inputTop:357,    inputLeft: 515, inputWidth:40}
	,	{type:'select',  	name:'limStrFreq',  	position:'absolute',    inputTop:357,    inputLeft: 567, inputWidth:100
		, options:[{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }
	
	,	{type:'label',     label:'Tessera',   	position:'absolute',    labelTop:400,     labelLeft: 5, labelWidth: 300}		
	,	{type:'input',  	name:'card',  	position:'absolute',    inputTop:402,    inputLeft: 110, inputWidth:60, readonly: true}
	,	{type:'button',   	name:'btCard',  value:'...', position:'absolute',    inputTop:396,    inputLeft: 170,  width:40}
	
				
	,	{type:'button',   name:'btCancel',  value:'Anulla', position:'absolute',    inputTop:410,    inputLeft: 500
				,  width:100}

	,	{type:'button',   name:'btSave',  value:'Salva', position:'absolute',    inputTop:410,    inputLeft: 628
				,  width:100}

    ];

    var dettForm = mainTabbar.cells("cAna").attachForm(dettFormData);

	
	var optN	= dettForm.getOptions('limNrmNum');
	var optA	= dettForm.getOptions('limAvvNum');
	var optS	= dettForm.getOptions('limSupNum');
	var optX	= dettForm.getOptions('limStrNum');
    for (i = 1; i <= 10; i++) {
    	optN.add(new Option(i, i));
		optA.add(new Option(i, i));
    	optS.add(new Option(i, i));
    	optX.add(new Option(i, i));
	}
    
	dettForm.enableLiveValidation(true);
	dettForm.attachEvent("onValidateError", function (name, value, result){
    	if (!result) {
			dhtmlx.alert({
				title:"Impossibile salvare"
			,	type:"alert-error"
			,	text:"Controlla valore " + name
			});
    	}
	});

//////////////////////////////////////////////////////////////////////////////////////// SAVING	    
    
    var dpf = new dataProcessor("../cn/dettForm.php");
    dpf.init(dettForm);    


	dettForm.attachEvent("onButtonClick", function(cmd) {
		switch(cmd) {
			
			case "btCard" :
				pickCard(dettForm);
				break;
			
			case "btSave" : 
				if (checkCallStruct()) {
		            if(dettForm.validate()) {
						if (dettId==0) dpf.sendData();
	            		else       dettForm.save(); //saves the made changes            
	            		dettWin.setText("Anagrafica Detenuti");
					}
				}
				break;
			
			
			case "btCancel" :
				if(cpChanged) {				
	                dhtmlx.confirm({
	                    title:"Esistono Modifiche"
	                ,    ok:"Si", cancel:"No"
	                ,    text:"Sicuro di voler Annullare?\nSono state modificati Piani di chiamata"
	                ,    callback:function(result){
                    		if (result) {
								dettLayout.cells("a").showView("def");
							}
	                    }
	                });				
				} else
					dettLayout.cells("a").showView("def");
				break;
			
			
		}
	});    

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if(action=="inserted"){
        	var ret = saveCallStruct(tid);
            dettGrid.addRow(tid,
                [ 	
                	dettForm.getItemValue("lname")
                ,	dettForm.getItemValue("fname")
                ,	dettForm.getItemValue("matr")
                ,	dettForm.getItemValue("card")
                ,	getOptionText(dettForm,"langCode")
                ,	getOptionText(dettForm,"ctypeId")
                ]
            ,0);
            dettGrid.selectRowById(tid,false,false,true);
        } else {
        	var ret = saveCallStruct(sid);
            dettGrid.cells(sid,0).setValue(dettForm.getItemValue("lname"));
            dettGrid.cells(sid,1).setValue(dettForm.getItemValue("fname"));
            dettGrid.cells(sid,2).setValue(dettForm.getItemValue("matr"));
            dettGrid.cells(sid,3).setValue(dettForm.getItemValue("card"));
            dettGrid.cells(sid,4).setValue(getOptionText(dettForm,"langCode"));
            dettGrid.cells(sid,5).setValue(getOptionText(dettForm,"ctypeId"));
        }
        dettLayout.cells("a").showView("def");
    });	
	

	    	
	//////////////////////////////////////////////////////////// GENERAL DETAILS ////////////////////////////////////////////////////////////////	
	

	callsTabbar = mainTabbar.cells("cCalls").attachTabbar({
		tabs: [
	        // {id: "cImp", text: "Impostazioni", active: true}
	    	{id: "cNrm", text: "Normali", active: true}
	    ,	{id: "cAvv", text: "Avvocati"}
	    ,	{id: "cSup", text: "Supplementari"}
	    ,	{id: "cStr", text: "Straordinarie"}
	    ]
	});

   
    WLNrmTb = callsTabbar.cells("cNrm").attachToolbar();
    WLNrmTb.setIconsPath("../assets/DHTMLX46/icons/");
    WLNrmTb.addButton("tNew",1,"Nuova","plus.ico","");   
    WLNrmTb.addButton("tDel",2,"Elimina","minus.ico","");

    WLNrmTb.attachEvent("onClick", function(id) {
        switch (id) {
			case "tNew" :
				newId = "Z" + guid();
				cpChanged = true;
				WLNrmGrid.addRow(newId , ["",	1,	"W", 10, 3, 30, 1,"31/12/3000", ""],0);
				WLNrmGrid.selectRowById(newId,false,true,true);
				// WLNrmGrid.selectCell(WLNrmGrid.getRowIndex(newId),0,false,true,true);
				// WLNrmGrid.selectCell(WLNrmGrid.getRowIndex(newId),0,false,true,true);
				break;
				
			case "tDel" :
				id = WLNrmGrid.getSelectedRowId();
				if (id==null) {
					dhtmlx.alert("Nessun utenza selezionata!");
					break;
				}
                dhtmlx.confirm({
                    title:"Elimina Utenza"
                ,    ok:"Si", cancel:"No"
                ,    text:"Sicuro di voler eliminare utenza selezionata?"
                ,    callback:function(result){
                    	if (result) {
                    		cpChanged = true;
                    		WLNrmGrid.deleteRow(id);
						}
                    }
                });				
				break;
				
		}
	});
    	
    	
	WLNrmGrid = callsTabbar.cells("cNrm").attachGrid();
	WLNrmGrid.setImagePath("../assets/DHTMLX46/codebase/imgs/");   
	WLNrmGrid.setHeader("Utenza,Num,Freq.,Durata,Recuperi,Entro,Registra,Scadenza,Nome Utenza");
	WLNrmGrid.setInitWidths("100,40,50,50,65,60,60,0,*");
	WLNrmGrid.setColTypes("ed,coro,coro,coro,coro,coro,ch,ed,ed");
    WLNrmGrid.setColAlign("left,center,left,center,center,center,center,center,left");
	WLNrmGrid.init();

	WLNrmGrid.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
	    if (cInd==0 && stage==2) {
			if(! /^\d+$/.test(nValue)) {
				dhtmlx.alert("Utenza '" + nValue + "' Non e' un numero valido");
				return(false);
			}
	    }
	    return(true);
	});
	
	opt = WLNrmGrid.getCombo(1);
	for (i=1; i<=10; i++)
		opt.put(i,i);

	opt = WLNrmGrid.getCombo(2);
	opt.put("W","Sett.");
	opt.put("M","Mese");

	opt = WLNrmGrid.getCombo(3);
	for (i=5; i<=60; i+=5)
		opt.put(i,i);

	opt = WLNrmGrid.getCombo(4);
		for (i=0; i<=10; i++)
		opt.put(i,i);

	opt = WLNrmGrid.getCombo(5);
	opt.put("30","30min");
	opt.put("60","1 ora");
	opt.put("120","2 ore");
	opt.put("360","6 ore");
	opt.put("999","Fine gg");
	



	WLNrmGrid.attachEvent("onRowSelect",function(rowId,cellIndex) {
		//WLNrmGrid.selectCell(WLNrmGrid.getRowIndex(rowId),0,false,true,true);
	});

	
	
	
//////////////////////////////////////////////////////////// LAWYER CALLS ////////////////////////////////////////////////////////////////	
	
    WLAvvTb = callsTabbar.cells("cAvv").attachToolbar();
    WLAvvTb.setIconsPath("../assets/DHTMLX46/icons/");
    WLAvvTb.addButton("tNew",1,"Nuova","plus.ico","");   
    WLAvvTb.addButton("tDel",2,"Elimina","minus.ico","");

    WLAvvTb.attachEvent("onClick", function(id) {
        switch (id) {
			case "tNew" :
				newId = "Z" + guid();
				WLAvvGrid.addRow(newId , ["",	1,	"W", 10, 3, 30, 0,"31/12/3000", ""],0);
				cpChanged = true;
				WLAvvGrid.selectRowById(newId,false,true,true);
				// WLAvvGrid.selectCell(WLAvvGrid.getRowIndex(newId),0,false,true,true);
				// WLAvvGrid.selectCell(WLAvvGrid.getRowIndex(newId),0,false,true,true);
				break;
				
			case "tDel" :
				id = WLAvvGrid.getSelectedRowId();
				if (id==null) {
					dhtmlx.alert("Nessun utenza selezionata!");
					break;
				}
                dhtmlx.confirm({
                    title:"Elimina Utenza"
                ,    ok:"Si", cancel:"No"
                ,    text:"Sicuro di voler eliminare utenza selezionata?"
                ,    callback:function(result){
                        if (result) {
                        	WLAvvGrid.deleteRow(id);
                        	cpChanged = true;
						}
                    }
                });				
				break;
				
		}
	});
    	
    	
	WLAvvGrid = callsTabbar.cells("cAvv").attachGrid();
	WLAvvGrid.setImagePath("../assets/DHTMLX46/codebase/imgs/");   
	WLAvvGrid.setHeader("Utenza,Num,Freq.,Durata,Recuperi,Entro,Registra,Scadenza,Nome Utenza");
	WLAvvGrid.setInitWidths("100,40,50,50,65,60,0,0,*");
	WLAvvGrid.setColTypes("ed,coro,coro,coro,coro,coro,ch,ed,ed");
    WLAvvGrid.setColAlign("left,center,left,center,center,center,center,center,left");
	WLAvvGrid.init();

	WLAvvGrid.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
	    if (cInd==0 && stage==2) {
			if(! /^\d+$/.test(nValue)) {
				dhtmlx.alert("Utenza '" + nValue + "' Non e' un numero valido");
				return(false);
			}
	    }
	    return(true);
	});	
	
	opt = WLAvvGrid.getCombo(1);
	for (i=1; i<=10; i++)
		opt.put(i,i);

	opt = WLAvvGrid.getCombo(2);
	opt.put("W","Sett.");
	opt.put("M","Mese");

	opt = WLAvvGrid.getCombo(3);
	for (i=5; i<=60; i+=5)
		opt.put(i,i);

	opt = WLAvvGrid.getCombo(4);
		for (i=0; i<=10; i++)
		opt.put(i,i);

	opt = WLAvvGrid.getCombo(5);
	opt.put("30","30min");
	opt.put("60","1 ora");
	opt.put("120","2 ore");
	opt.put("360","6 ore");
	opt.put("999","Fine gg");
	



	WLAvvGrid.attachEvent("onRowSelect",function(rowId,cellIndex) {
		//WLAvvGrid.selectCell(WLAvvGrid.getRowIndex(rowId),0,false,true,true);
	});

	
//////////////////////////////////////////////////////////// SUPPLEMENTARI CALLS ////////////////////////////////////////////////////////////////	
	
   	WLSupTb = callsTabbar.cells("cSup").attachToolbar();
    WLSupTb.setIconsPath("../assets/DHTMLX46/icons/");
    WLSupTb.addButton("tNew",1,"Nuova","plus.ico","");   
    WLSupTb.addButton("tDel",2,"Elimina","minus.ico","");

    WLSupTb.attachEvent("onClick", function(id) {
        switch (id) {
			case "tNew" :
				newId = "Z" + guid();
                cpChanged = true;    
				WLSupGrid.addRow(newId , ["",	1,	"W", 10, 3, 30, 1,"", ""],0);
				WLSupGrid.selectRowById(newId,false,true,true);
				// WLSupGrid.selectCell(WLSupGrid.getRowIndex(newId),0,false,true,true);
				// WLSupGrid.selectCell(WLSupGrid.getRowIndex(newId),0,false,true,true);
				break;
				
			case "tDel" :
				id = WLSupGrid.getSelectedRowId();
				if (id==null) {
					dhtmlx.alert("Nessun utenza selezionata!");
					break;
				}
                dhtmlx.confirm({
                    title:"Elimina Utenza"
                ,    ok:"Si", cancel:"No"
                ,    text:"Sicuro di voler eliminare utenza selezionata?"
                ,    callback:function(result){
                        if (result) {
							cpChanged = true;    
                        	WLSupGrid.deleteRow(id);
						}
                    }
                });				
				break;
				
		}
	});
    	
    	
	WLSupGrid = callsTabbar.cells("cSup").attachGrid();
	WLSupGrid.setImagePath("../assets/DHTMLX46/codebase/imgs/");   
	WLSupGrid.setHeader("Utenza,Num,Freq.,Durata,Recuperi,Entro,Registra,Scadenza,Nome Utenza");
	WLSupGrid.setInitWidths("100,40,50,50,65,60,60,70,*");
	WLSupGrid.setColTypes("ed,coro,coro,coro,coro,coro,ch,dhxCalendar,ed");
    WLSupGrid.setColAlign("left,center,left,center,center,center,center,center,left");
	WLSupGrid.init();

	WLSupGrid.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
	    if (cInd==0 && stage==2) {
			if(! /^\d+$/.test(nValue)) {
				dhtmlx.alert("Utenza '" + nValue + "' Non e' un numero valido");
				return(false);
			}
	    }
	    return(true);
	});		
	
	opt = WLSupGrid.getCombo(1);
	for (i=1; i<=10; i++)
		opt.put(i,i);

	opt = WLSupGrid.getCombo(2);
	opt.put("W","Sett.");
	opt.put("M","Mese");

	opt = WLSupGrid.getCombo(3);
	for (i=5; i<=60; i+=5)
		opt.put(i,i);

	opt = WLSupGrid.getCombo(4);
		for (i=0; i<=10; i++)
		opt.put(i,i);

	opt = WLSupGrid.getCombo(5);
	opt.put("30","30min");
	opt.put("60","1 ora");
	opt.put("120","2 ore");
	opt.put("360","6 ore");
	opt.put("999","Fine gg");
	



	WLSupGrid.attachEvent("onRowSelect",function(rowId,cellIndex) {
		//WLSupGrid.selectCell(WLSupGrid.getRowIndex(rowId),0,false,true,true);
	});



//////////////////////////////////////////////////////////// EXTA CALLS ////////////////////////////////////////////////////////////////	
	
   	WLStrTb = callsTabbar.cells("cStr").attachToolbar();
    WLStrTb.setIconsPath("../assets/DHTMLX46/icons/");
    WLStrTb.addButton("tNew",1,"Nuova","plus.ico","");   
    WLStrTb.addButton("tDel",2,"Elimina","minus.ico","");

    WLStrTb.attachEvent("onClick", function(id) {
        switch (id) {
			case "tNew" :
				newId = "Z" + guid();
				WLStrGrid.addRow(newId , ["",	1,	"X", 10, 3, 30, 1,"", ""],0);
				WLStrGrid.selectRowById(newId,false,true,true);
		        cpChanged = true;    
				break;
				
			case "tDel" :
				id = WLStrGrid.getSelectedRowId();
				if (id==null) {
					dhtmlx.alert("Nessun utenza selezionata!");
					break;
				}
                dhtmlx.confirm({
                    title:"Elimina Utenza"
                ,    ok:"Si", cancel:"No"
                ,    text:"Sicuro di voler eliminare utenza selezionata?"
                ,    callback:function(result){
                        if (result) {
							cpChanged = true;    
                        	WLStrGrid.deleteRow(id);
						}
                    }
                });				
				break;
				
		}
	});
    	
    	
	WLStrGrid = callsTabbar.cells("cStr").attachGrid();
	WLStrGrid.setImagePath("../assets/DHTMLX46/codebase/imgs/");   
	WLStrGrid.setHeader("Utenza,Num,Freq.,Durata,Recuperi,Entro,Registra,Scadenza,Nome Utenza");
	WLStrGrid.setInitWidths("100,0,0,50,65,60,60,70,*");
	WLStrGrid.setColTypes("ed,coro,coro,coro,coro,coro,ch,dhxCalendar,ed");
    WLStrGrid.setColAlign("left,center,left,center,center,center,center,center,left");
	WLStrGrid.init();

	WLStrGrid.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
	    if (cInd==0 && stage==2) {
			if(! /^\d+$/.test(nValue)) {
				dhtmlx.alert("Utenza '" + nValue + "' Non e' un numero valido");
				return(false);
			}
	    }
	    return(true);
	});		
	
	opt = WLStrGrid.getCombo(1);
	for (i=1; i<=10; i++)
		opt.put(i,i);

	opt = WLStrGrid.getCombo(2);
	opt.put("W","Sett.");
	opt.put("M","Mese");

	opt = WLStrGrid.getCombo(3);
	for (i=5; i<=60; i+=5)
		opt.put(i,i);

	opt = WLStrGrid.getCombo(4);
		for (i=0; i<=10; i++)
		opt.put(i,i);

	opt = WLStrGrid.getCombo(5);
	opt.put("30","30min");
	opt.put("60","1 ora");
	opt.put("120","2 ore");
	opt.put("360","6 ore");
	opt.put("999","Fine gg");
	



	WLStrGrid.attachEvent("onRowSelect",function(rowId,cellIndex) {
		//WLStrGrid.selectCell(WLStrGrid.getRowIndex(rowId),0,false,true,true);
	});



	function checkCallStruct() {
		
		if (!checkCallGrid(WLNrmGrid, "Normali", "cNrm")) return(false);
		if (!checkCallGrid(WLAvvGrid, "Avvocati", "cAvv")) return(false);
		if (!checkCallGrid(WLSupGrid, "Supplementari", "cSup")) return(false);
		if (!checkCallGrid(WLStrGrid, "Straordinarie", "cStr")) return(false);
		return(true);
		
	}
	
	function checkCallGrid(grid, type, callTab) {
		var count = grid.getRowsNum();
		if (count==0)	return(true);
		
		for (i=0; i<count; i++) {
			var err = "";
			var id = grid.getRowId(i);
			
			if (err=="") {
				if ( grid.cells(id,0).getValue().trim() == "") 	err = "Manca Numero Utenza";
			}
				
			if (err=="") {
				if ( grid.cells(id,7).getValue()== "") 	err = "Manca Scadenza";
			}

			if (err=="") {
				if ( grid.cells(id,8).getValue().trim() == "") 	err = "Manca Nume Utenza";
			}

		}
		
		if (err!="") {
			msg = "Errore Chiamate " + type + "\n" + err;
			mainTabbar.tabs("cCalls").setActive();
			callsTabbar.tabs(callTab).setActive();
			grid.selectRowById(id,false,false,true);
			dhtmlx.alert(msg);
			return(false);
		}
		
		return(true);
	}

	function saveCallStruct(dettId) {
		var n=0;
		
		callStruct = {};
		
		
		WLNrmGrid.forEachRow(function(id) {
			callStruct[n++] = callGetRow(WLNrmGrid,"N",id);
		});
		
		WLAvvGrid.forEachRow(function(id) {
			callStruct[n++] = callGetRow(WLAvvGrid,"A",id);
		});

		WLSupGrid.forEachRow(function(id) {
			callStruct[n++] = callGetRow(WLSupGrid,"S",id);
		});

		WLStrGrid.forEachRow(function(id) {
			callStruct[n++] = callGetRow(WLStrGrid,"X",id);
		});
		
		var ret = AGP(wsURL,{action:"SAVE_CALL_STRUCT", dettId: dettId, callStruct:JSON.stringify(callStruct)});
		if (ret.status!=0)	{
			alert(ret.errMsg);
			return(false);
		} else 
			return(true);
		
	}

	function callGetRow(grid, tip, id) {
		return({
			tip			:	tip
		,	num			:	grid.cells(id,0).getValue()
		,	callsQta	:	grid.cells(id,1).getValue()
		,	callsFreq	:	grid.cells(id,2).getValue()
		,	duration	:	grid.cells(id,3).getValue()
		,	attNum		:	grid.cells(id,4).getValue()
		,	attWithin	:	grid.cells(id,5).getValue()
		,	record		:	grid.cells(id,6).getValue()
		,	expire		:	dtGenToMy(grid.cells(id,7).getValue())
		,	descr		:	grid.cells(id,8).getValue()	
		});
	}
	
	///////////////////////////////////////// FINALLY ..
	
	dettLayout.cells("a").showView("def");
    
    function WLEdit(grid, tip, id) {
		var winId = "WLWin";
	    if (winAlready(winId))
	            return;
	    WLWin  = dhxWins.createWindow(winId, 0, 0, 760, 520);
	    WLWin.setText("Permesso Chiamata");
	    WLWin.denyResize();
        WLWin.button("park").hide();
        WLWin.button("minmax").hide();
        WLWin.button("close").hide();
	    WLWin.setModal(true);
	    WLWin.attachEvent("onClose", function(win){
	        return(true);
	    });
    		
	    // LAYOUT ///////////////////////////////////////////////////////////////
	    
	    WLLayout = new dhtmlXLayoutObject(WLWin,"1C");
	    WLLayout.cells("a").hideHeader();
	    
    	
		
    }
    
    function pickCard (frm) {
		
		
	    var winId = "cselWin";
	    if (winAlready(winId))
	            return;
	    cselWin  = dhxWins.createWindow(winId, 80,80, 300, 400);
	    cselWin.setText("Seleziona Scheda");
	    cselWin.denyResize();
	    cselWin.setModal(true);
		
    	cselLayout = new dhtmlXLayoutObject(cselWin,"1C");
    	cselLayout.cells("a").hideHeader();

    	// TOOLBAR ///////////////////////////////////////////////////////////////
    	cselToolbar = cselLayout.cells("a").attachToolbar();
    	cselToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    	cselToolbar.addButton("tAss",1,"Seleziona","Blue pin.ico","");   
    	cselToolbar.addButton("tClose",2,"Chiudi","Exit.ico",""); 
    
        
	    cselGrid = cselLayout.cells("a").attachGrid();
	    cselGrid.setHeader("Tessera,Detenuto");
	    // cselGrid.setColumnIds("serial,pinOrig,pin,dtCreate,notes");
	    cselGrid.attachHeader("#text_filter,#text_filter");
	    cselGrid.setColSorting("str,str");
	    cselGrid.setInitWidths("70,*");
	    cselGrid.setColTypes("ro,ro");
	    cselGrid.enableSmartRendering(true);
	    cselGrid.init();
		cselGrid.clearAndLoad("../cn/cselGrid.php");

		cselGrid.attachEvent("onRowDblClicked", function(rId,cInd){
			assignCard(rId);
		});
    	
    	cselToolbar.attachEvent("onClick", function(id) {
	        switch (id) {
	            case "tAss" :
					assignCard(cselGrid.getSelectedRowId());
					break;
				
				case "tClose" :
					cselWin.close();
					break;
			}
		});
			
    	function assignCard(id) {
			if (id==null) {
				dhtmlx.alert("Nessuna tessera selezionata");
				return(false);
			}
			var card 	= cselGrid.cells(id,0).getValue();
			var owner 	= cselGrid.cells(id,1).getValue();
			
			if (card == frm.getItemValue("card")) {
				dhtmlx.alert("Questa tessera e' gia' assegnata a questo detenuto!");
				return;
			}
			if (owner!="") {
	            dhtmlx.confirm({
	                title:"Tessera gia' assegnata"
	            ,    ok:"Si", cancel:"No"
	            ,    text:"Questa tessera e' gia' assegnata a " + owner + "\nSicuro di volere riassegnarla a questo detenuto?"
	            ,    callback:function(result){
                    	if (result) {
							var ret = AGP(wsURL, {action:"FREE_CARD", serial:card});							
							if (ret.status != 0) {
								dhtmlx.alert(ret.errMsg);
								return(false);
							}
							frm.setItemValue("card",card);		
							cselWin.close();
						} else {
							return(false);
						}
	                }
	            });				
			} else {
				frm.setItemValue("card",card);		
				cselWin.close();

			}
    	}
    
    
    }
    
}
