function dettAcc(winpos) {

    var isNew = false;
    var currVisuserId = 0;
	
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "dettAccWin";
    if (winAlready(winId))
            return;
	
	var wp = winpos || null;	
    if (wp==null)
    	dettAccWin  = dhxWins.createWindow(winId, 100, 100,600, 420);
    else
    	dettAccWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);

    
    
    dettAccWin.setText("Interrogazione Conti");
    dettAccWin.attachEvent("onClose", function(win){
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    layMain = new dhtmlXLayoutObject(dettAccWin,"1C");
    layMain.cells("a").hideHeader();

   
    // MAIN GRID ///////////////////////////////////////////////////////////////

    mainGrid = layMain.cells("a").attachGrid();
    mainGrid.setHeader("Cognome,Nome,Matricola,Ricariche,Chiamate,Saldo");
    mainGrid.attachHeader("#text_filter,#text_filter,#text_filter,#numeric_filter,#numeric_filter,#numeric_filter");
    mainGrid.setColSorting("str,str,str,int,int,int");
	mainGrid.setColAlign("left,left,left,right,right,right");

    mainGrid.setInitWidths("120,120,70,70,70,*");
    mainGrid.setColTypes("ro,ro,ro,ro,ro,ro");
    // mainGrid.enableSmartRendering(true);
    mainGrid.init();
    mainGrid.load("../cn/accGridMain.php");

    mainGrid.attachEvent("onRowDblClicked", function(rId,cInd){
    	layMain.cells("a").showView("sub");
    	
		if ((ret = getBalance())!=null)	var bal=ret.credit;
		else							var bal="***";
		dettAccWin.setText(getName() + " - Saldo Conto: " + bal);
    	
    	subGrid.clearAndLoad("../cn/accGridSub.php?dettId=" + rId ,function() {
			subGrid.sortRows(0,"str","des");
    	});
    });  
    
    // DETAILS GRID ///////////////////////////////////////////////////////////////

    layMain.cells("a").showView("sub");
    tbs = layMain.cells("a").attachToolbar();
    tbs.setIconsPath("../assets/DHTMLX46/icons/");

	tbs.addButton("tRet",1,"Ritorna A lista","Rewind.ico","");   
	tbs.addButton("tAdd",2,"Aggiungi Credito","plus.ico","");   
	// tbs.addButton("tDel",3,"Elimina Credito","minus.ico","");    
    
	tbs.attachEvent("onClick", function(id) {
        switch (id) {
			case "tRet" :
   				dettAccWin.setText("Interrogazione Conti");
				if ((ret = getBalance())!=null) {
					mainGrid.cells(ret.id, 3).setValue(ret.ric);					
					mainGrid.cells(ret.id, 4).setValue(ret.tel);					
					mainGrid.cells(ret.id, 5).setValue(ret.credit);					
				}
   				layMain.cells("a").showView("def");
   				break;

			case "tAdd" : 
				isNew = true;
				form.clear();
				form.setItemValue("dettId", mainGrid.getSelectedRowId());
				form.setItemValue("usrId", userId);
   				layMain.cells("a").showView("form");
				break;				  
				
			case "tDel" :
				dettId = mainGrid.getSelectedRowId();
				id = subGrid.getSelectedRowId();
				if (id == null) {
					dhtmlx.alert("Nessuna Riga Selezionata per la cancellazione!");
					return;
				}
    			if (id.substr(0,1)!='R') {
					dhtmlx.alert("Non si possono modificare chiamate!");
					return;
    			}
    	
                dhtmlx.confirm({
                    title:"Eliminazione Ricarica"
                ,    ok:"Yes", cancel:"No"
                ,    text:"Sicuro di voler eliminare la ricarica selezionata?"
                ,    callback:function(result){
                        if (result) {
                        	var ret = AGP(wsURL, {action:"DEL_RIC",	rechargeId:id.substr(1), dettId:dettId});
                        	if  (ret.status!=0) {
								dhtmlx.alert(ret.errMsg);
								return;
                        	}
                        	subGrid.deleteRow(id);
       						mainGrid.cells(dettId,0).setValue(ret.data.lname);
            				mainGrid.cells(dettId,1).setValue(ret.data.fname);
            				mainGrid.cells(dettId,2).setValue(ret.data.matr);
            				mainGrid.cells(dettId,3).setValue(ret.data.totCR);
            				mainGrid.cells(dettId,4).setValue(ret.data.totDB);
            				mainGrid.cells(dettId,5).setValue(ret.data.bal);
							dettAccWin.setText(getName() + " - Saldo Conto: " + getBalance());

                        }
                    }
                });    	
    	        break;
		}
	});	
    
    subGrid = layMain.cells("a").attachGrid();
    subGrid.setHeader("Data/Ora,Ricarica,Chiamata,Descrizione");
    subGrid.attachHeader("#text_filter,#numeric_filter,#numeric_filter,#text_filter");
    subGrid.setColSorting("str,int,int,str");
	subGrid.setColAlign("left,right,right,left");
    subGrid.setInitWidths("140,80,80,*");
    subGrid.setColTypes("ro,ro,ro,ro");
    subGrid.init();
    
    
    subGrid.attachEvent("onRowDblClicked", function(rId,cInd){
    	return;
    	isNew = false;
    	form.clear();
    	if (rId.substr(0,1)!='R') {
			dhtmlx.alert("Non si possono modificare chiamate!");
			return;
    	}
    	form.load("../cn/recForm.php?id=" + rId.substr(1));
    	layMain.cells("a").showView("form");
    });  
    
    
    // FORM ///////////////////////////////////////////////////////////////
    layMain.cells("a").showView("form");
   	var formData = [
   	
	,	{type:'hidden',  	name:'dettId'}    
	,	{type:'hidden',  	name:'usrId'}    

    ,	{type:'label',     label:'Data',    	position:'absolute',    labelTop:20,     labelLeft: 5, labelWidth:200}
	,	{type:'calendar',  name:'dttm',     	position:'absolute' , dateFormat :"%Y-%m-%d %H:%i:%s"
		    	,	enableTodayButton:true 
		    	, 	enableTime:true
		    	,   inputTop:22,     inputLeft: 180,    	inputWidth: 120,     maxLength:10}

	, 	{type:'button', id:'btNow', name:'now', value:'Addesso',    position:'absolute',    inputTop:21,     inputLeft: 310,    width: 60}
		    	
    ,	{type:'label',     label:'Importo',    	position:'absolute',    labelTop:60,     labelLeft: 5, labelWidth:200}
    ,	{type:'input',     name:'credamt',     	position:'absolute',    inputTop:62,     inputLeft: 180,    inputWidth: 80}

    ,	{type:'label',     label:'Causale',    	position:'absolute',    labelTop:100,     labelLeft: 5, labelWidth:200}
    ,	{type:'input',     name:'descr',     		position:'absolute',    inputTop:102,     inputLeft: 180,    inputWidth: 250, maxLen:255}

    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',    position:'absolute',    inputTop:160,     inputLeft: 180,    width: 100}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:160,     inputLeft: 300,    width: 100}
    ];
    
  
    form = layMain.cells("a").attachForm(formData);    
	
	form.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'now' :
        		var dtNow = dateFormat(new Date(),'yyyy-mm-dd HH:MM:ss');
        		form.setItemValue('dttm',dtNow);
        		break;
        	
        	
        	case 'canc'	:
        		layMain.cells("a").showView("sub");
        		break;

     	
        	case 'save' :
				var dttm = form.getItemValue("dttm");
				if (!dttm) {
					dhtmlx.alert("Data errata o mancante");
					return;
				}
				
				var imp = "" +  form.getItemValue("credamt");
				imp = imp.replace(new RegExp(',', 'g'),'.');
				if (isNaN(imp)) {
					dhtmlx.alert("Importo non valido");
					return;
				}
				imp = Math.floor(imp * 100)/ 100;
				form.setItemValue("credamt", imp);

	            if (isNew) dpf.sendData();
	            else       form.save(); //saves the made changes            

				var dettId = form.getItemValue("dettId");
	            var ret = AGP(wsURL, {action:"GET_BAL_LINE", dettId :dettId });
	            if (ret.status!=0)
	            	alert(ret.errMsg);
	            else {
       				mainGrid.cells(dettId,0).setValue(ret.data.lname);
            		mainGrid.cells(dettId,1).setValue(ret.data.fname);
            		mainGrid.cells(dettId,2).setValue(ret.data.matr);
            		mainGrid.cells(dettId,3).setValue(ret.data.totCR);
            		mainGrid.cells(dettId,4).setValue(ret.data.totDB);
            		mainGrid.cells(dettId,5).setValue(ret.data.bal);
	            }
	            
				break;
		}
	});     	        


    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////

    var dpf = new dataProcessor("../cn/recForm.php");
    dpf.init(form);

    form.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save':
	            if (isNew) dpf.sendData();
	            else       form.save(); //saves the made changes            
				if ((ret = getBalance())!=null)	var bal=ret.credit;
				else							var bal="***";
				dettAccWin.setText(getName() + " - Saldo Conto: " + bal);

	            break;
	            
			case 'canc':
	            layMain.cells("a").showView("sub");
	            break;
        }
        
	});

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        sid = "R" + sid;
        
        if (action=='error') {
			dhtmlx.alert("Errore Salvando Movimento");
			return;
        }
        
        var dttm = dateFormat(form.getItemValue("dttm"),'yyyy-mm-dd HH:MM:ss');
        amt = number_format(form.getItemValue("credamt"), 2, ".", ",");
        
        if(action=="inserted"){
            subGrid.addRow(tid,
                [ 	dttm
            	,	amt
            	,	""
            	,	form.getItemValue("descr")
                ]
            ,0);
            subGrid.selectRowById(tid,false,false,true);
        } else {
            subGrid.cells(sid,0).setValue(dttm);
            subGrid.cells(sid,1).setValue(amt);
            subGrid.cells(sid,2).setValue("");
            subGrid.cells(sid,3).setValue(form.getItemValue("descr"));
        }
        layMain.cells("a").showView("sub");
        
    });

    
    
    /// FINALLY ////////////
    layMain.cells("a").showView("def");
    
    
    function getName() {
		var id = mainGrid.getSelectedRowId();
		if (id!=null)
			return(mainGrid.cells(id,0).getValue() + ", " + mainGrid.cells(id,1).getValue());
		else
			return("");
		
    }
    
    function getBalance() {
		var id = mainGrid.getSelectedRowId();
		if (id==null) {
			dhtmlx.alert("no id asking for credit");
			return(null);
		}
			
		var ret = AGP(wsURL, {action: "GET_DETT_CREDIT", dettId:id});
		if (ret.status==9) {
			dhtmlx.alert("getting credit: " + ret.errMsg );
			return(null);
		} else {
			ret["id"] = id;
			return(ret);
		}
    }
    
}
