function tznEdit(winpos) {
		
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var isNew = false;
    var currentTZNId = 0;
    var winId = "tznWin";
    if (winAlready(winId))
            return;
    
    var wp = winpos || null;	
    if (wp==null)
    	tznWin  = dhxWins.createWindow(winId, 50, 50, 800, 480);
    else
    	tznWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);        
    
    
    
    tznWin.setText("Gestione Zone Tariffarie");
    tznWin.attachEvent("onClose", function(win){
        return(true);
    });
    
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    tznLayout = new dhtmlXLayoutObject(tznWin,"1C");
    tznLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////

    tznToolbar = tznLayout.cells("a").attachToolbar();
    tznToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    tznToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    tznToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    tznToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
                tznAdd();
                break;

            case "tDel" :
                tznDel();
                break;
        }
    });
                
    
    // GRID ///////////////////////////////////////////////////////////////

    tznGrid = tznLayout.cells("a").attachGrid();
    tznGrid.setHeader("Zona,Descrizione,Graz,Norm,Dalle,Alle,Bassa,C/Risp,MinCred,SpesaMin");
    tznGrid.setColumnIds("tznCode,tznDescr,secsGrace,nrmPPM,nrmBeg,nrmEnd,lowPPM,drpCharge,minCredit,minCharge");
    tznGrid.attachHeader("#text_filter,#text_filter,#numeric_filter,#numeric_filter,#text_filter,#text_filter,#numeric_filter,#numeric_filter,#numeric_filter,#numeric_filter");
    tznGrid.setColSorting("str,str,int,int,str,str,int,int,int,int");
    tznGrid.setColAlign("str,str,right,right,right,right,right,right,right,right");

    tznGrid.setInitWidths("50,140,50,70,70,70,70,70,70,*");
    tznGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    // tznGrid.enableSmartRendering(true);
    tznGrid.init();
    tznGrid.load("../cn/tznGrid.php");

    tznGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        isNew = false;
        currentTZNId = rId;
        tznForm.clear();
		tznLayout.cells("a").showView("form");
        tznForm.load("../cn/tznForm.php?id="+rId, function(id, response) {
        	tarr = tznForm.getItemValue('nrmBeg').split(":");
        	tznForm.setItemValue('nrmBegHH', tarr[0]);
        	tznForm.setItemValue('nrmBegMM', tarr[1]);

        	tarr = tznForm.getItemValue('nrmEnd').split(":");
        	tznForm.setItemValue('nrmEndHH', tarr[0]);
        	tznForm.setItemValue('nrmEndMM', tarr[1]);

		});        
    });  
    
    
    function tznDel() {
		var tznId = tznGrid.getSelectedRowId();
		if (tznId==null) {
			dhtmlx.alert ("Nessuna Zona selezionata!");
			return;
		}
		var ret = AGP(wsURL, {action: "TZN_USED", tznId:tznId});
		if (ret.status!=0)	{
			dhtmlx.alert(ret.errMsg);
			return;
		}
		if (ret.useCount!="0") {
			dhtmlx.alert("Questa zona NON puo' venire eliminata: E' in uso da " + ret.useCount + " destinazioni!");
			return;
		}

		dhtmlx.confirm({
				title:"Conferma Cancellazione Zona"
			,	text:"Sicuro di voler eliminare questa Zona?"
			,	ok:"Si"
			, 	cancel:"No"
			,  	callback:function(result) {
				if (result) {
					ret = AGP(wsURL, {action: "TZN_USED", tznId:tznId});
					if (ret.status!=0)	dhtmlx.alert(ret.errMsg);
					else  {
							tznGrid.deleteRow(tznId);
							dhtmlx.alert("Zona cancellata!");
					}
				}
			}
		});
	
	}
    
    // FORM ///////////////////////////////////////////////////////////////
    // serverDateFormat: '%Y-%m-%d  %H:%i:%s', 
    
    var tznFormData = [

    ,	{type:'hidden', 	   name: 'nrmBeg'}
    ,	{type:'hidden', 	   name: 'nrmEnd'}
    
    ,	{type:'label',     label:'Zona',   	position:'absolute',    labelTop:5,     labelLeft: 5, labelWidth: 200}
	,	{type:'input',     name:'tznCode',     		position:'absolute',    inputTop:7,     inputLeft: 140,    inputWidth:50, maxLength:10}
	
	,	{type:'label',     label:'Descrizione',   	position:'absolute',    labelTop:35,     labelLeft: 5, labelWidth: 200}
	,	{type:'input',     name:'tznDescr',     		position:'absolute',    inputTop:37,     inputLeft: 140,    inputWidth:200, maxLength:50}

    ,	{type:'label',     label:'Periodo Grazia',    position:'absolute',    labelTop:65,     labelLeft: 5, labelWidth: 200}
    ,	{type:'input',     name:'secsGrace',     		position:'absolute',    inputTop:67,     inputLeft: 140,     validate:"ValidNumeric",  inputWidth:50, maxLength:10}
	
    ,	{type:'label',     label:'Tariffa Normale',    position:'absolute',    labelTop:95,     labelLeft: 5, labelWidth: 200}
    ,	{type:'input',     name:'nrmPPM',     		position:'absolute',    inputTop:97,     inputLeft: 140,     validate:"ValidNumeric",  inputWidth:50, maxLength:10}
    ,	{type:'label',     label:'Dalle',    position:'absolute',    labelTop:95,     labelLeft: 205, labelWidth: 200}
	,   {type: 'select',   name: 'nrmBegHH',			position:'absolute',    inputTop:97,    inputLeft: 250, inputWidth:40}
	,   {type: 'select',   name: 'nrmBegMM',			position:'absolute',    inputTop:97,    inputLeft: 290, inputWidth:40}

    ,	{type:'label',     label:'Tariffa Bassa',    position:'absolute',    labelTop:125,   labelLeft: 5, labelWidth: 200}
    ,	{type:'input',     name:'lowPPM',     		position:'absolute',    inputTop:127,     inputLeft: 140,     validate:"ValidNumeric",  inputWidth:50, maxLength:10}
    ,	{type:'label',     label:'Dalle',    position:'absolute',    labelTop:125,     labelLeft: 205, lbelWidth: 200}
	,   {type: 'select',   name: 'nrmEndHH',			position:'absolute',    inputTop:127,    inputLeft: 250, inputWidth:40}
	,   {type: 'select',   name: 'nrmEndMM',			position:'absolute',    inputTop:127,    inputLeft: 290, inputWidth:40}

    ,	{type:'label',     label:'Costo alla Risposta',    position:'absolute',    labelTop:185,     labelLeft: 5, labelWidth: 200}
    ,	{type:'input',     name:'drpCharge',     		position:'absolute',    inputTop:187,     inputLeft: 140,     validate:"ValidNumeric",  inputWidth:50, maxLength:10}

    ,	{type:'label',     label:'Credito Minimo',    position:'absolute',    labelTop:215,     labelLeft: 5, labelWidth: 200}
    ,	{type:'input',     name:'minCredit',     		position:'absolute',    inputTop:217,     inputLeft: 140,     validate:"ValidNumeric",  inputWidth:50, maxLength:10}
        
    ,    {type:'label',     label:'Spesa Minima',    position:'absolute',    labelTop:245,     labelLeft: 5, labelWidth: 200}
    ,    {type:'input',     name:'minCharge',           position:'absolute',    inputTop:247,     inputLeft: 140,     validate:"ValidNumeric",  inputWidth:50, maxLength:10}
        

    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',    position:'absolute',    inputTop:310,     inputLeft: 180,    inputWidth: 55}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:310,     inputLeft: 280,    inputWidth: 55}

    ];

    
    tznLayout.cells("a").showView("form");
    tznForm = tznLayout.cells("a").attachForm(tznFormData);    
    tznLayout.cells("a").showView("def");
        
    var nrmBegHH = tznForm.getOptions('nrmBegHH');
    var nrmEndHH = tznForm.getOptions('nrmEndHH');
    for (i=0; i<24;i++) {
		if (i<10) var txt = "0" + i;
		else txt= i;
		nrmBegHH.add(new Option(txt,txt));
		nrmEndHH.add(new Option(txt,txt));
    }
    
    var nrmBegMM = tznForm.getOptions('nrmBegMM');
    var nrmEndMM = tznForm.getOptions('nrmEndMM');
    for (i=0; i<60; i+=15) {
		if (i<10) var txt = "0" + i;
		else txt= i;
		nrmBegMM.add(new Option(txt,txt));
		nrmEndMM.add(new Option(txt,txt));
		
    }
    

    

    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////

    var dpf = new dataProcessor("../cn/tznForm.php");
    dpf.init(tznForm);

    tznForm.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save':
	            
	            // does this zone already exist in db??
	            var tznCode = tznForm.getItemValue('tznCode');
	            tznCode = tznCode.trim().toUpperCase();
	            tznForm.setItemValue('tznCode', tznCode);
	            
	            if (tznCode =="")	{ dhtmlx.alert("Manca codice zona"); return; }

	            var tznDescr = tznForm.getItemValue('tznDescr');
	            if (tznDescr =="")	{ dhtmlx.alert("Manca Descrizione zona"); return; }
	            
	            var ret = AGP(wsURL, {action:"TZN_EXIST",tznCode: tznCode});
	            if (ret.status!=0) { dhtmlx.alert(ret.errMsg); return; }
	            
	            if (ret.tznId != currentTZNId) { dhtmlx.alert("Questo codice e' gia' usato per:\n" + ret.tznDescr); return; }
	            
	            // set the time zones ...
	            var nrmBegHH = tznForm.getItemValue('nrmBegHH');
	            var nrmBegMM = tznForm.getItemValue('nrmBegMM');
		        var nrmBeg   = nrmBegHH + ":" + nrmBegMM + ":00";
	            
	            var nrmEndHH = tznForm.getItemValue('nrmEndHH');
	            var nrmEndMM = tznForm.getItemValue('nrmEndMM');
		        var nrmEnd   = nrmEndHH + ":" + nrmEndMM + ":00";
	            
	            if (nrmEnd <= nrmBeg) {
					dhtmlx.alert("Errori orari fascia normale. 'AL' deve essere SUPERIORE a 'DEL");
					return;
	            }
                
                tznForm.setItemValue('nrmPPM',replaceAll2(tznForm.getItemValue('nrmPPM'),",","."));
                tznForm.setItemValue('lowPPM',replaceAll2(tznForm.getItemValue('lowPPM'),",","."));
                tznForm.setItemValue('drpCharge',replaceAll2(tznForm.getItemValue('drpCharge'),",","."));
                tznForm.setItemValue('minCredit',replaceAll2(tznForm.getItemValue('minCredit'),",","."));
                tznForm.setItemValue('minCharge',replaceAll2(tznForm.getItemValue('minCharge'),",","."));
        
                	            
	            if(tznForm.getItemValue('nrmPPM')== "" || isNaN(tznForm.getItemValue('nrmPPM')))		{ dhtmlx.alert("Tariffa Normale deve essere un numero o ZERO"); 	return;}
	            if(tznForm.getItemValue('lowPPM')== "" || isNaN(tznForm.getItemValue('lowPPM')))		{ dhtmlx.alert("Tariffa Bassa deve essere un numero o ZERO"); 	return;}
	            if(tznForm.getItemValue('dropCharge')== "" || isNaN(tznForm.getItemValue('drpCharge')))	{ dhtmlx.alert("Costo alla Risposta deve essere un numero o ZERO"); 	return;}
	            if(tznForm.getItemValue('minCredit')== "" || isNaN(tznForm.getItemValue('minCredit')))	{ dhtmlx.alert("Credito minumo deve essere un numero o ZERO"); 	return;}
                if(tznForm.getItemValue('minCharge')== "" || isNaN(tznForm.getItemValue('minCharge')))    { dhtmlx.alert("Costo minumo deve essere un numero o ZERO");     return;}
	            
				tznForm.setItemValue("nrmBeg", nrmBeg);	           
				tznForm.setItemValue("nrmEnd", nrmEnd);	           
	            
	            if (isNew) dpf.sendData();
	            else       tznForm.save(); //saves the made changes            
	            break;
	            
			case 'canc':
	            tznLayout.cells("a").showView("def");
	            break;

        }
        
	});

	
    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if (action=='error') {
			dhtmlx.alert("Errore Salvando prefisso. Possibile duplicato?");
			return;
        }
        

        
        if(action=="inserted"){
            tznGrid.addRow(tid,
                [ 	tznForm.getItemValue("tznCode")
            	,	tznForm.getItemValue("tznDescr")
            	,	tznForm.getItemValue("secsGrace")
            	,	tznForm.getItemValue("nrmPPM")
            	,	tznForm.getItemValue("nrmBeg")
            	,	tznForm.getItemValue("nrmEnd")
            	,	tznForm.getItemValue("lowPPM")
            	,	tznForm.getItemValue("drpCharge")
            	,	tznForm.getItemValue("minCredit")
                ,    tznForm.getItemValue("minCharge")
                ]
            ,0);
            tznGrid.selectRowById(tid,false,false,true);
        } else {
        	tznGrid.cells(sid,0).setValue(tznForm.getItemValue("tznCode"))   ;
        	tznGrid.cells(sid,1).setValue(tznForm.getItemValue("tznDescr"))  ;
            tznGrid.cells(sid,2).setValue(tznForm.getItemValue("secsGrace"))   ;
            tznGrid.cells(sid,3).setValue(tznForm.getItemValue("nrmPPM"))   ;
            tznGrid.cells(sid,4).setValue(tznForm.getItemValue("nrmBeg"))   ;
            tznGrid.cells(sid,5).setValue(tznForm.getItemValue("nrmEnd"))   ;
            tznGrid.cells(sid,6).setValue(tznForm.getItemValue("lowPPM"))   ;
            tznGrid.cells(sid,7).setValue(tznForm.getItemValue("drpCharge"));
            tznGrid.cells(sid,8).setValue(tznForm.getItemValue("minCredit"));
            tznGrid.cells(sid,9).setValue(tznForm.getItemValue("minCharge"));
        
        }
        tznLayout.cells("a").showView("def");
        // alert("callback");
    });


    function tznAdd() {
        isNew = true;
        currentTZNId = 0;
        tznForm.clear();
        tznLayout.cells("a").showView("form");
    }
    
    
}
