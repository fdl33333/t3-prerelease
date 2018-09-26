function dettEdit(winpos) {

	var dettId = 0;
	var wlId = 0;
	var cpChanged = false;
		

	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "dettWin";
    if (winAlready(winId))
            return;

	var wp = winpos || null;	
    if (wp==null)
    	dettWin  = dhxWins.createWindow(winId, 0, 0, 860, 610);
    else
    	dettWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);
    
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

    dettToolbar.addButton("tMod",1,"Modifica","Notes.ico","");   
    dettToolbar.addButton("tNew",2,"Nuovo Detenuto","plus.ico","");   
    dettToolbar.addButton("tDel",3,"Elimina","minus.ico",""); 
    
        
    dettToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tMod" :
			dettId = dettGrid.getSelectedRowId();
			if (dettId==null) {
				dhtmlx.alert("Nessun Detenuto Selezionato");
				return;
			}
			
			dettWin.setText(dettGrid.cells(dettId,0).getValue() + " " + dettGrid.cells(dettId,1).getValue());
			dettForm.clear();
			dettForm.load("../cn/dettForm.php?id="+dettId, function(id, response) {
			mainTabbar.tabs("cAna").setActive();
			    dettLayout.cells("a").showView("tabs");		
				var ret = AGP(wsURL, {action:"GET_DETT_CREDIT", dettId:dettId});
				if (ret.status==0)
					dettForm.setItemLabel('saldo',ret.credit.replace(".",","));
				wlGrid.clearAndLoad("../cn/wlGrid.php?dettId=" + dettId);
			});
		    break;     	
            
            
            case "tNew" :
		        dettId = 0;
		        dettForm.clear();
				wlGrid.clearAll();
		        dettLayout.cells("a").showView("form");
		        dettWin.setText("Nuovo Detenuto");
				mainTabbar.tabs("cAna").setActive();
				// callsTabbar.tabs("cNrm").setActive();
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
    dettGrid.setHeader("Cognome,Nome,Saldo,Matricola,Tessera,Lingua,Tipo Crimine");
    // dettGrid.setColumnIds("serial,pinOrig,pin,dtCreate,notes");
    dettGrid.attachHeader("#text_filter,#text_filter,#numeric_filter,#text_filter,#text_filter,#select_filter,#select_filter");
    dettGrid.setColSorting("str,str,int,str,str,str,str");
	dettGrid.setColAlign("left,left,right,left,left,left,left");
    dettGrid.setInitWidths("120,120,80,100,60,100,*");
    dettGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro");
    dettGrid.enableSmartRendering(true);
    dettGrid.init();


    dettGrid.load("../cn/dettGrid.php");

    dettGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        dettId = rId;
		dettWin.setText(dettGrid.cells(rId,0).getValue() + " " + dettGrid.cells(rId,1).getValue());
        dettForm.clear();
 		dettForm.load("../cn/dettForm.php?id="+rId, function(id, response) {
		mainTabbar.tabs("cAna").setActive();
        	dettLayout.cells("a").showView("tabs");		
			wlGrid.clearAndLoad("../cn/wlGrid.php?dettId=" + dettId);
			var ret = AGP(wsURL, {action:"GET_DETT_CREDIT", dettId:rId});
			if (ret.status==0)
				dettForm.setItemLabel('saldo',ret.credit.replace(".",","));
		});
		
    });      
    
	dettLayout.cells("a").showView("tabs");
	
	mainTabbar = dettLayout.cells("a").attachTabbar({
		tabs: [
	        {id: "cAna", text: "Anagrafica", active: true}
	    ,	{id: "cCalls", text: "Numeri"}
	    ,	{id: "cHist", text: "Storico"}
	    ]
	});
	mainTabbar.setArrowsMode('auto');

	mainTabbar.attachEvent("onTabClick", function(id, lastId){
    	switch(id) {
			case 'cHist' :
				histGrid.clearAndLoad("../cn/dettCallsGrid.php?dettId=" + dettGrid.getSelectedRowId(),  function(){
					histGrid.sortRows(0,"str","des");
				});
			break;
			
    	}
    	// your code here
	});
	//wlEdit(0,0);
	//return;
    
    // FORM ////////////////////////////////////////////////////////////////////
    
    var dettFormData = [
   		{type:'label',     label:'Cognome',   	position:'absolute',    labelTop:5,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'lname',  	position:'absolute',    inputTop:7,    inputLeft: 110, inputWidth:200, maxLength:50, validate:"NotEmpty"}
	
	,	{type:'image',  url:'picHandler.php', name:'pic1',  position:'absolute',    inputTop:7,    inputLeft: 320
				,  inputWidth: 200,	inputHeight: 200}
	
	,	{type:'button',   	name:'btDelPic1',  value:'X', position:'absolute',    inputTop:182,    inputLeft: 507,  width:10}

	
	
	,	{type:'image',  url:'picHandler.php', name:'pic2',  position:'absolute',    inputTop:7,    inputLeft: 530
				,  inputWidth: 200,	inputHeight: 200}

	,	{type:'button',   	name:'btDelPic2',  value:'X', position:'absolute',    inputTop:182,    inputLeft: 717,  width:10}

	

   	,	{type:'label',     label:'Nome',   	position:'absolute',    labelTop:40,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'fname',  	position:'absolute',    inputTop:42,    inputLeft: 110, inputWidth:200,maxLength:50,validate:"NotEmpty"}
	
   	,	{type:'label',     label:'Data di Nascita',   	position:'absolute',    labelTop:75,     labelLeft: 5, labelWidth: 200}		
	,	{type:'calendar',  	name:'bdate',  	position:'absolute',    inputTop:77,    inputLeft: 110, inputWidth:80
			,dateFormat: '%d/%m/%Y',serverDateFormat:'%Y-%m-%d', validate:'over18'}
	
   	,	{type:'label',     label:'Matricola',   	position:'absolute',    labelTop:111,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'matr',  	position:'absolute',    inputTop:113,    inputLeft: 110, inputWidth:80, maxLength:20}

   	,	{type:'label',     label:'Tipo Crimine',   	position:'absolute',    labelTop:146,     labelLeft: 5, labelWidth: 200}		
	,	{type:'select',  	name:'ctypeId',  	position:'absolute',    inputTop:148,    inputLeft: 110, inputWidth:200, connector:"../cn/cTypeList.php" }

   	,	{type:'label',     label:'Lingua',   	position:'absolute',    labelTop:181,     labelLeft: 5, labelWidth: 200}		
	,	{type:'select',  	name:'langCode',  	position:'absolute',    inputTop:183,    inputLeft: 110, inputWidth:200
			, connector:"../cn/langList.php"}

				

   	,	{type:'label',     label:'Note',   	position:'absolute',    labelTop:216,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'notes',  	position:'absolute',    inputTop:218,    inputLeft: 110, inputWidth: 50
			, inputWidth:620, rows:6, inputHeight:80}

/***************************************************************************/
	,	{type:'label',     label:'Limiti Globali per Chiamate',   	position:'absolute',    labelTop:320,     labelLeft: 5, labelWidth: 100}		


	,	{type:'label',     label:'Normali',   	position:'absolute',    labelTop:320,     labelLeft: 110, labelWidth: 300}		
	,	{type:'select',  	name:'limNrmNum',  	position:'absolute',    inputTop:322,    inputLeft: 215, inputWidth:40}
	,	{type:'select',  	name:'limNrmFreq',  	position:'absolute',    inputTop:322,    inputLeft: 267, inputWidth:100
		, options:[{value:"D", text:"Giorno"},{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }
	
	
	,	{type:'label',     label:'Avvocati',   	position:'absolute',    labelTop:320,     labelLeft:410, labelWidth: 300}		
	,	{type:'select',  	name:'limAvvNum',  	position:'absolute',    inputTop:322,    inputLeft: 515, inputWidth:40}
	,	{type:'select',  	name:'limAvvFreq',  	position:'absolute',    inputTop:322,    inputLeft: 567, inputWidth:100
		, options:[{value:"D", text:"Giorno"},{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }

	
	,	{type:'label',     label:'Supplementari',   	position:'absolute',    labelTop:355,     labelLeft: 110, labelWidth: 300}		
	,	{type:'select',  	name:'limSupNum',  	position:'absolute',    inputTop:357,    inputLeft: 215, inputWidth:40}
	,	{type:'select',  	name:'limSupFreq',  	position:'absolute',    inputTop:357,    inputLeft: 267, inputWidth:100
		, options:[{value:"D", text:"Giorno"},{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }
	
	,	{type:'hidden', name:'limStrNum'}
	,	{type:'hidden', name:'limStrFreq'}
/*****	
	,	{type:'label',     label:'Straordinarie',   	position:'absolute',    labelTop:355,     labelLeft: 410, labelWidth: 300}		
	,	{type:'select',  	name:'limStrNum',  	position:'absolute',    inputTop:357,    inputLeft: 515, inputWidth:40}
	,	{type:'select',  	name:'limStrFreq',  	position:'absolute',    inputTop:357,    inputLeft: 567, inputWidth:100
		, options:[{value:"D", text:"Giorno"},{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }
***/	
	,	{type:'label',     label:'Tessera',   	position:'absolute',    labelTop:400,     labelLeft: 5, labelWidth: 300}		
	,	{type:'input',  	name:'card',  	position:'absolute',    inputTop:402,    inputLeft: 110, inputWidth:60, readonly: true}
	,	{type:'button',   	name:'btCard',  value:'...', position:'absolute',    inputTop:401,    inputLeft: 170,  width:40}
	,	{type:'button',   	name:'btNocard',  value:'Togli', position:'absolute',    inputTop:401,    inputLeft: 215,  width:60}
	
	,	{type:'label',     label:'PIN',   	position:'absolute',    labelTop:435,     labelLeft: 5, labelWidth: 300}		
	,	{type:'input',  	name:'pin',  	position:'absolute',    inputTop:437,    inputLeft: 110, inputWidth:60, maxLength:4}

	,	{type:'label',     label:'Saldo',   	position:'absolute',    labelTop:400,     labelLeft: 410, labelWidth: 100}		
	,	{type:'label',     label:'0,00',   	name:'saldo', position:'absolute',    labelTop:400,     labelLeft: 515, labelWidth: 100}		

				
	,	{type:'button',   name:'btCancel',  value:'Anulla', position:'absolute',    inputTop:460,    inputLeft: 500
				,  width:100}

	,	{type:'button',   name:'btSave',  value:'Salva', position:'absolute',    inputTop:460,    inputLeft: 628
				,  width:100}

    ];

    var dettForm = mainTabbar.cells("cAna").attachForm(dettFormData);


	
	var optN	= dettForm.getOptions('limNrmNum');
	var optA	= dettForm.getOptions('limAvvNum');
	var optS	= dettForm.getOptions('limSupNum');
//	var optX	= dettForm.getOptions('limStrNum');
    for (i = 1; i <= 10; i++) {
    	optN.add(new Option(i, i));
		optA.add(new Option(i, i));
    	optS.add(new Option(i, i));
//    	optX.add(new Option(i, i));
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
			
			case "btDelPic1" : 
				dettForm.setItemValue("pic1","");
				break;

			case "btDelPic2" : 
				dettForm.setItemValue("pic2","");
				break;
				
			
			case "btCard" :
				pickCard(dettForm);
				break;
				
			case "btNocard" :
				removeCard(dettForm);
				break;
			
			case "btSave" : 
		        if(dettForm.validate()) {
					if (dettId==0) dpf.sendData();
	            	else       dettForm.save(); //saves the made changes            
	            	dettWin.setText("Anagrafica Detenuti");
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
	            				dettWin.setText("Anagrafica Detenuti");
							}
	                    }
	                });				
				} else {
					dettLayout.cells("a").showView("def");
					dettWin.setText("Anagrafica Detenuti");
				}
				break;
			
			
		}
	});    

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if(action=="inserted"){
            dettGrid.addRow(tid,
                [ 	
                	dettForm.getItemValue("lname")
                ,	dettForm.getItemValue("fname")
                ,	0
                ,	dettForm.getItemValue("matr")
                ,	dettForm.getItemValue("card")
                ,	getOptionText(dettForm,"langCode")
                ,	getOptionText(dettForm,"ctypeId")
                ]
            ,0);
            dettGrid.selectRowById(tid,false,false,true);
        } else {
            dettGrid.cells(sid,0).setValue(dettForm.getItemValue("lname"));
            dettGrid.cells(sid,1).setValue(dettForm.getItemValue("fname"));
            dettGrid.cells(sid,3).setValue(dettForm.getItemValue("matr"));
            dettGrid.cells(sid,4).setValue(dettForm.getItemValue("card"));
            dettGrid.cells(sid,5).setValue(getOptionText(dettForm,"langCode"));
            dettGrid.cells(sid,6).setValue(getOptionText(dettForm,"ctypeId"));
        }
        dettLayout.cells("a").showView("def");
    });	
	

	    	
	//////////////////////////////////////////////////////////// WHITE LIST  ////////////////////////////////////////////////////////////////	
	

	
	// mainTabbar.cells("cCalls").

    wlTb = mainTabbar.cells("cCalls").attachToolbar();
    wlTb.setIconsPath("../assets/DHTMLX46/icons/");
    wlTb.addButton("tEdit",1,"Modifica","Wrench.ico","");   
    wlTb.addButton("tNew",2,"Nuova","plus.ico","");   
    wlTb.addButton("tDel",3,"Elimina","minus.ico","");
    wlTb.attachEvent("onClick", function(id) {
        switch (id) {
			
			case "tEdit" :
				wlId = wlGrid.getSelectedRowId();
				if (wlId == null) {
					dhtmlx.alert("Prego selezionare una riga da modificare");
					return;
				}
				wlEdit(dettGrid.getSelectedRowId(), wlId);
				break;


			case "tNew" :
				wlId = 0;
				wlEdit(dettGrid.getSelectedRowId(), 0)
				break;
				
			case "tDel" :
				id = wlGrid.getSelectedRowId();
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
                    		var ret = AGP(wsURL,{action:"WL_DELETE", wlId:id});
                    		if (ret.status!=0)
                    			dhtmlx.alert(ret.errMsg);
                    		else
                    			wlGrid.deleteRow(id);
						}
                    }
                });				
				break;
				
		}
	});
    	
    	
	wlGrid = mainTabbar.cells("cCalls").attachGrid();
	wlGrid.setImagePath("../assets/DHTMLX46/codebase/imgs/");   
	wlGrid.setHeader("Numeri,Tipo,Frequenza,Recupero,Registra,Scadenza,Descrizione");
	wlGrid.setInitWidths("210,100,80,100,60,80,*");
	wlGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro");
    wlGrid.setColAlign("left,left,left,left,left,left,left");
    wlGrid.setColSorting("str,str,str,str,str,str,str");
    wlGrid.attachHeader("#text_filter,#select_filter,#select_filter,#select_filter,#select_filter,#select_filter,#text_filter");
	wlGrid.init();

    
    	
    wlGrid.attachEvent("onRowDblClicked", function(rId,cInd){
    	wlId = rId;
    	wlEdit(dettGrid.getSelectedRowId(), rId);
	});

	wlGrid.attachEvent("onRowSelect",function(rowId,cellIndex) {
		//////////////////////////////////////////////////////////////// TO DO!!!!
		
		//wlGrid.selectCell(wlGrid.getRowIndex(rowId),0,false,true,true);
	});

	
	
	///////////////////////////////////////// HISTORY...
	
	// mainTabbar.cells("cCalls").


    	
	histGrid = mainTabbar.cells("cHist").attachGrid();
	histGrid.setImagePath("../assets/DHTMLX46/codebase/imgs/");   
	histGrid.setHeader("Data/Ora,Numero,Tipo,Ric,Sec,Costo,Descr,Esito");
	histGrid.setInitWidths("120,90,60,40,40,50,140,*");
	histGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
    histGrid.setColAlign("left,left,left,center,right,right,left,left");
    histGrid.setColSorting("str,str,str,str,str,num,num,str");
    histGrid.attachHeader("#text_filter,#text_filter,#select_filter,#select_filter,#text_filter,#text_filter,#select_filter,#select_filter");
	histGrid.init();

    
    	
    histGrid.attachEvent("onRowDblClicked", function(rId,cInd){
    	popCall(rId);
	});

		


	///////////////////////////////////////// FINALLY ..
	
	dettLayout.cells("a").showView("def");
    
    function removeCard(frm) {
		var card = frm.getItemValue("card");
		if (card=="")	return;
		
		dhtmlx.confirm({
			title:"Togliere Scheda a Detenuto"
			,   ok:"Si", cancel:"No"
			,   text:"Sicuro di voler togliere la scheda " + card + " A questo detenuto?"
			,	callback:function(result){
				if (result) {
					var ret = AGP(wsURL, {action:"FREE_CARD", serial:card});							
					if (ret.status != 0) {
						dhtmlx.alert(ret.errMsg);
						return(false);
					}
					frm.setItemValue("card","");		
				} else {
					return(false);
				}
			}
		});		
		
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
	            dhtmlx.alert("Tessera selezionata e' gia' assegnata");
	            return;
/**
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
***/	            
			} else {
				frm.setItemValue("card",card);		
				cselWin.close();

			}
    	}
    
    
    }

	function wlEdit(_dettId,wlId) {
		dettId = _dettId;
	    var wlWinId = "wlWin";
	    wlWin = dhxWins.createWindow(winId, 150, 150, 560, 420);
	    wlWin.center();
		wlWin.setModal(true);
	    wlWin.setText("Dettaglio Abilitazione Chiamata");
        wlWin.button("park").hide();
        wlWin.button("minmax").hide();
        wlWin.button("close").hide();

        
        
	    wlWin.denyResize();
    	wlLayout = new dhtmlXLayoutObject(wlWin,"1C");
    	wlLayout.cells("a").hideHeader();
		
		wlFormData = [
			{type:'hidden', 	name:'dettId',	value:dettId}
   		
   		,	{type:'label',     label:'Numeri',   	position:'absolute',    labelTop:10,     labelLeft: 5, labelWidth: 100}		
		,	{type:'input',  	name:'num',  	position:'absolute',    inputTop:12,    inputLeft: 110, inputWidth:320,maxLength:255,validate:"NotEmpty"}
		
		
		,	{type:'label',     label:'Descrizione',   	position:'absolute',    labelTop:50,     labelLeft: 5, labelWidth: 100}		
		,	{type:'input',  	name:'descr',  	position:'absolute',    inputTop:52,    inputLeft: 110, inputWidth:320, maxLength:100}
   		
   		

		,	{type:'label',     label:'Tipo',   	position:'absolute',    labelTop:90,     labelLeft:5, labelWidth: 200}		
		,	{type:'select',  	name:'tip', id:'tip',  	position:'absolute',    inputTop:92,    inputLeft: 110, inputWidth:120
				, options: [	
					{text:"Normali", value:"N"}
				, 	{text:"Avvocati", value:"A"}
				,	{text:"Supplementari", value:"S"}
				,	{text:"Straordinarie", value:"X"}
				,	{text:"Normali da PO", value:"O"}
				, 	{text:"Avvocati da PO", value:"P"}
				] }

   		,	{type:'label',     label:'Durata',   	position:'absolute',    labelTop:90,     labelLeft: 255, labelWidth: 200}		
		,	{type:'select',  	name:'duration',  	position:'absolute',    inputTop:92,    inputLeft: 310, inputWidth:120
				, options: durations }


   		,	{type:'label',     label:'Quantita\'',   	name:'callsQtaLb',  	position:'absolute',    labelTop:130,     labelLeft: 5, labelWidth: 200}		
		,	{type:'select',  	name:'callsQta',  	position:'absolute',    inputTop:132,    inputLeft: 112, inputWidth:120
				, options: [{text:"1",value:1},{text:"2",value:2},{text:"3",value:3},{text:"4",value:4},{text:"5",value:5},{text:"6",value:6}] }
   		
   		,	{type:'label',  name:'callsFreqLb',   label:'Ogni',   	position:'absolute',    	labelTop:130,     labelLeft: 255, labelWidth: 200}		
		,	{type:'select', id:'vlFreq', name:'callsFreq',  	position:'absolute',    inputTop:132,    inputLeft: 310, inputWidth:120
				, options: [{value:"D", text:"Giorno"},{text:"Settimana",value:'W'},{text:"Mese",value:'M'}] }
   		
   		
   		
   		,	{type:'label',     label:'Recuperi Max',   	position:'absolute',    labelTop:170,     labelLeft: 5, labelWidth: 200}		
		,	{type:'select',  	name:'attNum',  	position:'absolute',    inputTop:172,    inputLeft: 110, inputWidth:50
				, options: [{text:"0",value:0},{text:"1",value:1},{text:"2",value:2},{text:"3",value:3},{text:"4",value:4},{text:"5",value:5},{text:"6",value:6}] }
   		
   		,	{type:'label',     label:'Entro',   	position:'absolute',    	labelTop:170,     labelLeft: 255, labelWidth: 200}		
		,	{type:'select',  	name:'attWithin',  	position:'absolute',    inputTop:172,    inputLeft: 310, inputWidth:120
				, options: [{text:"30 min",value:30},{text:"1 Ora",value:60},{text:"2 ore ",value:120},{text:"6 Ore",value:360},{text:"Fine giornata",value:999}] }
   								

   		,	{type:'label',     label:'Registra',   name:'recordLb',	position:'absolute',    labelTop:210,     labelLeft: 5, labelWidth: 200}		
		,	{type:'select',  	name:'record',  	position:'absolute',    inputTop:212,    inputLeft: 110, inputWidth:50
				, options: [{text:"SI",value:1},{text:"NO",value:0}] }
		
		
   		,	{type:'label',     label:'Scadenza', name:'expireLb',   	position:'absolute',    labelTop:250,     labelLeft: 5, labelWidth: 200}		
		,	{type:'calendar',  	name:'expire',  	position:'absolute',    inputTop:252,    inputLeft: 110, inputWidth:80
				,dateFormat: '%d/%m/%Y',serverDateFormat:'%Y-%m-%d'	}
		

		,	{type:'button',   name:'btCancel',  value:'Anulla', position:'absolute',    inputTop:290,    inputLeft: 110
				,  width:120}

		,	{type:'button',   name:'btSave',  value:'Salva', position:'absolute',    inputTop:290,    inputLeft: 310
				,  width:120}		
		
		];
		
		wlForm = wlLayout.cells("a").attachForm(wlFormData);

	    var dpw = new dataProcessor("../cn/wlForm.php");
    	dpw.init(wlForm);
		

	    dpw.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
	        
	        if(action=="inserted"){
	            wlGrid.addRow(tid,
	                [ 	
                		wlForm.getItemValue("num")
	                ,	getOptionText(wlForm,"tip")
	                ,	(wlForm.getItemValue("tip")=="X") ? "Unica" : wlForm.getItemValue("callsQta") + " x " +  getOptionText(wlForm,"callsFreq")
	                ,	wlForm.getItemValue("callsQta") + " entro " +  getOptionText(wlForm,"attWithin")
	                ,	(wlForm.getItemValue("tip")=="A") ? "-" : getOptionText(wlForm,"record")
	                ,	(wlForm.getItemValue("tip")=="N" 
		                  || wlForm.getItemValue("tip")=="A" 
		                  || wlForm.getItemValue("tip")=="O" 
		                  || wlForm.getItemValue("tip")=="P" 
	                	  ) ? "" : dateFormat(wlForm.getItemValue("expire"),"yyyy-mm-dd")
	                ,	wlForm.getItemValue("descr")
	                ]
	            ,0);
	            wlGrid.selectRowById(tid,false,false,true);
	        } else {
				wlGrid.cells(sid,0).setValue(wlForm.getItemValue("num"));
				wlGrid.cells(sid,1).setValue(getOptionText(wlForm,"tip"));
				wlGrid.cells(sid,2).setValue((wlForm.getItemValue("tip")=="X") ? "Unica" : wlForm.getItemValue("callsQta") + " x " +  getOptionText(wlForm,"callsFreq"));
				wlGrid.cells(sid,3).setValue(wlForm.getItemValue("callsQta") + " entro " +  getOptionText(wlForm,"attWithin"));
				wlGrid.cells(sid,4).setValue((wlForm.getItemValue("tip")=="A") ? "-" : getOptionText(wlForm,"record"));
				wlGrid.cells(sid,5).setValue((wlForm.getItemValue("tip")=="N" || wlForm.getItemValue("tip")=="A" ) ? "" : dateFormat(wlForm.getItemValue("expire"),"yyyy-mm-dd"));
				wlGrid.cells(sid,6).setValue(wlForm.getItemValue("descr"));
	        }
	        wlLayout.cells("a").showView("def");
	    
	    	wlWin.close();
	    
	    });	
		
		wlForm.clear();
 		if (wlId!=0) {
 			wlForm.load("../cn/wlForm.php?id="+wlId, function(id, response) {
 				 setWLForm();
			});
		}
		
		
		
		
		wlForm.attachEvent("onButtonClick", function(cmd) {
			switch(cmd) {
				case "btCancel" :  					wlWin.close(); 					break;
				
			case "btSave" : 
				wlForm.setItemValue("dettId", dettId);
				
				var dupErr = false;
				wlGrid.forEachRow(function(id){
					if(wlId!=id) {
						var numList = wlGrid.cells(id,0).getValue().trim();
						var numThis = wlForm.getItemValue("num").trim();
						if (numList == numThis) {
							dupErr = true;
						}
					}	
				});

				/**
                if (dupErr && false) {
					dhtmlx.alert("Questo numero esiste gia' nella lista");
					return;
				}
                **/
				var tip = wlForm.getItemValue('tip');
				var num = wlForm.getItemValue('num').trim();
				if(num=="") {
					dhtmlx.alert("Manca Numero");
					return;
				}
				/***
				if (isNaN(num) || num.length < 6) { 
					dhtmlx.alert("Numero Non valido"); 
					return;
				}
				**/
				if (tip=='N' || tip=='A' || tip=='O' || tip=='P') 		
					wlForm.setItemValue('scad', new Date(3000,11,31));
				
				var callsFreq = (tip=='X') ? 'X' : wlForm.getItemValue('callsFreq');
				var record = (tip=='A') ? 0 : wlForm.getItemValue('record');

				if (dettId==0) dpw.sendData();
		        else       		wlForm.save(); //saves the made changes            
				break;
			}
		});		
		wlForm.hideItem('expire');          	wlForm.hideItem('expireLb');
		
		wlForm.attachEvent("onChange", function (id, value){
			if(id=='tip') {
				setWLForm();
				
			}
				
		});
	}    
	
	function setWLForm() {
		
		tip = wlForm.getItemValue("tip");
		
		switch(tip) {
			case 'N' :
				wlForm.showItem('callsQta');			wlForm.showItem('callsQtaLb');
				wlForm.showItem('callsFreq');			wlForm.showItem('callsFreqLb');
				wlForm.hideItem('expire');          	wlForm.hideItem('expireLb');
				wlForm.showItem('record');				wlForm.showItem('recordLb');		
				break;

			case 'O' :
				wlForm.showItem('callsQta');			wlForm.showItem('callsQtaLb');
				wlForm.showItem('callsFreq');			wlForm.showItem('callsFreqLb');
				wlForm.hideItem('expire');          	wlForm.hideItem('expireLb');
				wlForm.showItem('record');				wlForm.showItem('recordLb');		
				break;

			case 'P' :
				wlForm.showItem('callsQta');			wlForm.showItem('callsQtaLb');
				wlForm.showItem('callsFreq');			wlForm.showItem('callsFreqLb');
				wlForm.hideItem('expire');          	wlForm.hideItem('expireLb');
				wlForm.hideItem('record');				wlForm.hideItem('recordLb');		
				break;
				
				
			case 'A' :
				wlForm.showItem('callsQta');			wlForm.showItem('callsQtaLb');
				wlForm.showItem('callsFreq');			wlForm.showItem('callsFreqLb');
				wlForm.hideItem('expire');          	wlForm.hideItem('expireLb');
				wlForm.hideItem('record');				wlForm.hideItem('recordLb');		
				break;
			
			case 'S' :
				wlForm.showItem('callsQta');			wlForm.showItem('callsQtaLb');
				wlForm.showItem('callsFreq');			wlForm.showItem('callsFreqLb');
				wlForm.showItem('expire');          	wlForm.showItem('expireLb');
				wlForm.showItem('record');				wlForm.showItem('recordLb');		
				break;
			
			case 'X' :
				wlForm.hideItem('callsQta');			wlForm.hideItem('callsQtaLb');
				wlForm.hideItem('callsFreq');			wlForm.hideItem('callsFreqLb');
				wlForm.showItem('expire');          	wlForm.showItem('expireLb');
				wlForm.showItem('record');				wlForm.showItem('recordLb');		
				// var dt = new Date();
				// var exp = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(),0,0,0);								
				// wlForm.setItemValue('expire',exp);
				break;
		}
	}
	
	
	function popCall(callId) {
		
	    var winId = "popCallWin";
	    if (winAlready(winId))
	            return;
	    popCallWin  = dhxWins.createWindow(winId, 80,80, 500, 520);
	    popCallWin.center();
	    popCallWin.setText("Dettagli Chiamata");
	    popCallWin.denyResize();
	    popCallWin.setModal(true);
		
    	popCallLayout = new dhtmlXLayoutObject(popCallWin,"1C");
    	popCallLayout.cells("a").hideHeader();
		popCallLayout.cells("a").attachURL("calldata.html?callId=" + callId);
		
	}
}


function over18 (data) {
	var dtNow = new Date();
	var days18 = Math.floor(18 * 365.25);
	var timeDiff = Math.abs(dtNow.getTime() - data.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return(diffDays > days18);		
}