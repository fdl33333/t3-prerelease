function dettEdit() {

	var dettId = 0;
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "dettWin";
    if (winAlready(winId))
            return;
    dettWin  = dhxWins.createWindow(winId, 0, 0, 760, 570);
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
    dettToolbar.setIconsPath("./assets/DHTMLX46/icons/");

    dettToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    dettToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 
    
        
    dettToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
		        dettId = 0;
		        dettForm.clear();
		        dettLayout.cells("a").showView("form");
                break;

            case "tDel" :
                alert('funzione disabilitata');
                // bamCatsDel();
                break;
        }
    });
        
    
    // GRID ////////////////////////////////////////////////////////////////////

    dettGrid = dettLayout.cells("a").attachGrid();
    dettGrid.setHeader("Cognome,Nome,Matricola,Lingua,Tipo Crimine");
    // dettGrid.setColumnIds("serial,pinOrig,pin,dtCreate,notes");
    dettGrid.attachHeader("#text_filter,#text_filter,#text_filter,#select_filter,#select_filter");
    dettGrid.setColSorting("str,str,str,str,str");

    dettGrid.setInitWidths("150,150,100,100,*");
    dettGrid.setColTypes("ro,ro,ro,ro,ro");
    // dettGrid.enableSmartRendering(true);
    dettGrid.init();
    dettGrid.load("./cn/dettGrid.php");

    dettGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        dettId = rId;
        dettForm.clear();
        dettForm.load("./cn/dettForm.php?id="+rId, function(id, response) {
			dettLayout.cells("a").showView("form");
        });        
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
			,connector:"./cn/ctypeList.php" }

   	,	{type:'label',     label:'Lingua',   	position:'absolute',    labelTop:181,     labelLeft: 5, labelWidth: 200}		
	,	{type:'select',  	name:'langCode',  	position:'absolute',    inputTop:183,    inputLeft: 110, inputWidth:200
			, connector:"./cn/langList.php"}

				
   	,	{type:'label',     label:'Chiamate',   position:'absolute',    labelTop:216,     labelLeft: 5, labelWidth: 200}		
	,	{type: "container", name: "cntCalls", position:"absolute", inputTop:218,	inputLeft:110,    inputWidth: 620, inputHeight: 210}   

   	,	{type:'label',     label:'Note',   	position:'absolute',    labelTop:436,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'notes',  	position:'absolute',    inputTop:438,    inputLeft: 110, inputWidth: 50
			, inputWidth:620, rows:3}
				
	,	{type:'button',   name:'btCancel',  value:'Anulla', position:'absolute',    inputTop:490,    inputLeft: 500
				,  width:100}

	,	{type:'button',   name:'btSave',  value:'Salva', position:'absolute',    inputTop:490,    inputLeft: 628
				,  width:100}

    ];



    
    dettLayout.cells("a").showView("form");
    dettForm = dettLayout.cells("a").attachForm(dettFormData);    

	
	var callsTabbar = new dhtmlXTabBar({
		parent:	dettForm.getContainer("cntCalls")    
	,	tabs: [
	        {id: "cImp", text: "Generali", active: true}
	    ,	{id: "cNrm", text: "Normali"}
	    ,	{id: "cAvv", text: "Avvocati"}
	    ,	{id: "cSup", text: "Supplem."}
	    ,	{id: "cStr", text: "Straord."}
	    ]
	});
	
	
//////////////////////////////////////////////////////////// GENERAL DETAILS ////////////////////////////////////////////////////////////////	

	var cImpFormData =  [
		{type:'label',     label:'Limite Massimo',   	position:'absolute',    labelTop:5,     labelLeft: 5, labelWidth: 200}		
	// ,	{type:'input',  	name:'limNrmNum',  	position:'absolute',    inputTop:7,    inputLeft: 110, inputWidth: 40, maxLength:3}
	,	{type:'select',  	name:'limNrmNum',  	position:'absolute',    inputTop:7,    inputLeft: 110, inputWidth:40}
		
		
	,	{type:'select',  	name:'limNrmFreq',  	position:'absolute',    inputTop:7,    inputLeft: 162, inputWidth:100
		, options:[{value:"W", text:"Settimana"}, {value:"M", text:"Mese"}] }
	];
	
	cNrmForm = callsTabbar.cells("cImp").attachForm(cImpFormData);
	var opts	= cNrmForm.getOptions('limNrmNum');
    for (i = 1; i <= 10; i++)
    	opts.add(new Option(i, i));
	
//////////////////////////////////////////////////////////// NORMAL CALLS ////////////////////////////////////////////////////////////////	
    
    WLNrmTb = callsTabbar.cells("cNrm").attachToolbar();
    WLNrmTb.setIconsPath("./assets/DHTMLX46/icons/");
    WLNrmTb.addButton("tNew",1,"Nuova","plus.ico","");   
    WLNrmTb.addButton("tDel",2,"Elimina","minus.ico","");

    WLNrmTb.attachEvent("onClick", function(id) {
        switch (id) {
			case "tNew" :
				newId = guid();
				WLNrmGrid.addRow(newId , ["",	1,	"W", 10, 3,1,""],0);
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
                        if (result) WLNrmGrid.deleteRow(id);
                    }
                });				
				break;
				
		}
	});
    	
    	
	WLNrmGrid = callsTabbar.cells("cNrm").attachGrid();
	WLNrmGrid.setImagePath("./assets/DHTMLX46/codebase/imgs/");   
	WLNrmGrid.setHeader("Utenza,Num,Frequenza,Durata,Recupero,Registra,,Nome Utenza");
	WLNrmGrid.setInitWidths("100,60,80,60,65,60,0,*");
	WLNrmGrid.setColTypes("ed,coro,coro,coro,coro,ch,dhxCalendar,ed");
    WLNrmGrid.setColAlign("left,center,left,center,center,center,center,left");
	WLNrmGrid.init();

	opt = WLNrmGrid.getCombo(1);
	for (i=1; i<=10; i++)
		opt.put(i,i);

	opt = WLNrmGrid.getCombo(2);
	opt.put("W","Settimana");
	opt.put("M","Mese");

	opt = WLNrmGrid.getCombo(3);
	for (i=5; i<=60; i+=5)
		opt.put(i,i);

	opt = WLNrmGrid.getCombo(4);
		for (i=0; i<=10; i++)
		opt.put(i,i);

	



	WLNrmGrid.attachEvent("onRowSelect",function(rowId,cellIndex) {
		//WLNrmGrid.selectCell(WLNrmGrid.getRowIndex(rowId),0,false,true,true);
	});

	
	
	
//////////////////////////////////////////////////////////// LAWYER CALLS ////////////////////////////////////////////////////////////////	
	
    WLAvvTb = callsTabbar.cells("cAvv").attachToolbar();
    WLAvvTb.setIconsPath("./assets/DHTMLX46/icons/");
    WLAvvTb.addButton("tNew",1,"Nuova","plus.ico","");   
    WLAvvTb.addButton("tDel",2,"Elimina","minus.ico","");

    WLAvvTb.attachEvent("onClick", function(id) {
        switch (id) {
			case "tNew" :
				newId = guid();
				WLAvvGrid.addRow(newId , ["",	1,	"W", 10, 3,0,""],0);
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
                        if (result) WLAvvGrid.deleteRow(id);
                    }
                });				
				break;
				
		}
	});
    	
    	
	WLAvvGrid = callsTabbar.cells("cAvv").attachGrid();
	WLAvvGrid.setImagePath("./assets/DHTMLX46/codebase/imgs/");   
	WLAvvGrid.setHeader("Utenza,Num,Frequenza,Durata,Recupero,Registra,Nome Utenza");
	WLAvvGrid.setInitWidths("100,60,80,60,65,0,*");
	WLAvvGrid.setColTypes("ed,coro,coro,coro,coro,ch,ed");
    WLAvvGrid.setColAlign("left,center,left,center,center,center,left");
	WLAvvGrid.init();

	opt = WLAvvGrid.getCombo(1);
	for (i=1; i<=10; i++)
		opt.put(i,i);

	opt = WLAvvGrid.getCombo(2);
	opt.put("W","Settimana");
	opt.put("M","Mese");

	opt = WLAvvGrid.getCombo(3);
	for (i=5; i<=60; i+=5)
		opt.put(i,i);

	opt = WLAvvGrid.getCombo(4);
		for (i=0; i<=10; i++)
		opt.put(i,i);

	
	// WLAvvGrid.addRow(1,["3332094333", 2, "W", 10,3, 1, "Cell Francesco" ],0);


	WLAvvGrid.attachEvent("onRowSelect",function(rowId,cellIndex) {
		//WLAvvGrid.selectCell(WLAvvGrid.getRowIndex(rowId),0,false,true,true);
	});

//////////////////////////////////////////////////////////// SUPPLEMENTARI CALLS ////////////////////////////////////////////////////////////////	
	
    WLSupTb = callsTabbar.cells("cSup").attachToolbar();
    WLSupTb.setIconsPath("./assets/DHTMLX46/icons/");
    WLSupTb.addButton("tNew",1,"Nuova","plus.ico","");   
    WLSupTb.addButton("tDel",2,"Elimina","minus.ico","");

    WLSupTb.attachEvent("onClick", function(id) {
        switch (id) {
			case "tNew" :
				newId = guid();
				WLSupGrid.addRow(newId , ["",	1,	"W", 10, 3,0,""],0);
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
                        if (result) WLSupGrid.deleteRow(id);
                    }
                });				
				break;
				
		}
	});
    	
    	
	WLSupGrid = callsTabbar.cells("cSup").attachGrid();
	WLSupGrid.setImagePath("./assets/DHTMLX46/codebase/imgs/");   
	WLSupGrid.setHeader("Utenza,Num,Frequenza,Durata,Recupero,Registra,Nome Utenza");
	WLSupGrid.setInitWidths("100,60,80,60,65,0,*");
	WLSupGrid.setColTypes("ed,coro,coro,coro,coro,ch,ed");
    WLSupGrid.setColAlign("left,center,left,center,center,center,left");
	WLSupGrid.init();

	opt = WLSupGrid.getCombo(1);
	for (i=1; i<=10; i++)
		opt.put(i,i);

	opt = WLSupGrid.getCombo(2);
	opt.put("W","Settimana");
	opt.put("M","Mese");

	opt = WLSupGrid.getCombo(3);
	for (i=5; i<=60; i+=5)
		opt.put(i,i);

	opt = WLSupGrid.getCombo(4);
		for (i=0; i<=10; i++)
		opt.put(i,i);

	
	WLSupGrid.addRow(1,["3332094333", 2, "W", 10,3, 1, "Cell Francesco" ],0);


	WLSupGrid.attachEvent("onRowSelect",function(rowId,cellIndex) {
		//WLSupGrid.selectCell(WLSupGrid.getRowIndex(rowId),0,false,true,true);
	});
	
	///////////////////////////////////////////////////////// SAVING WHOLE LOT ///////////////////////////////////////////////////////////////////////////


	dettLayout.cells("a").showView("def");

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

    
    var dpf = new dataProcessor("./cn/dettForm.php");
    dpf.init(dettForm);    
	    

	dettForm.attachEvent("onButtonClick", function(cmd) {
		switch(cmd) {
			
			
			
			case "btSave" : 
	            if(dettForm.validate()) {
					if (dettId==0) dpf.sendData();
	            	else       dettForm.save(); //saves the made changes            
				}
				break;
			
			
			case "btCancel" :
				dettLayout.cells("a").showView("def");
				break;
			
			
		}
	});    

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        if(action=="inserted"){
            dettGrid.addRow(tid,
                [ 	
                	dettForm.getItemValue("lname")
                ,	dettForm.getItemValue("fname")
                ,	dettForm.getItemValue("matr")
                ,	getOptionText(dettForm,"langCode")
                ,	getOptionText(dettForm,"ctypeId")
                ]
            ,0);
            dettGrid.selectRowById(tid,false,false,true);
        } else {
            dettGrid.cells(sid,0).setValue(dettForm.getItemValue("lname"));
            dettGrid.cells(sid,1).setValue(dettForm.getItemValue("fname"));
            dettGrid.cells(sid,2).setValue(dettForm.getItemValue("matr"));
            dettGrid.cells(sid,3).setValue(getOptionText(dettForm,"langCode"));
            dettGrid.cells(sid,4).setValue(getOptionText(dettForm,"ctypeId"));
        }
        dettLayout.cells("a").showView("def");
    });	
	

}
