function extEdit(winpos) {

    var isNew = false;
    var currVisuserId = 0;
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "extWin";
    if (winAlready(winId))
            return;
    
    var wp = winpos || null;	
    if (wp==null)
    	extWin  = dhxWins.createWindow(winId, 10, 10, 550, 400);
    else
    	extWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);        
    
    extWin.setText("Gestione Interni");
    extWin.attachEvent("onClose", function(win){
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    extLayout = new dhtmlXLayoutObject(extWin,"1C");
    extLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////

    extToolbar = extLayout.cells("a").attachToolbar();
    extToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    extToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    extToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    extToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
		        isNew = true;
		        extForm.clear();
		        extLayout.cells("a").showView("form");
                break;

            case "tDel" :
            	var extId = extGrid.getSelectedRowId();
   				if (extId==null) {
					dhtmlx.alert("Nessun Interno Selezionato!");
					return;
   				}
   				var extNum = extGrid.cells(extId,0).getValue();
   				
   				dhtmlx.confirm({
	                    title:"Eliminazione Interno"
	                ,    ok:"Si", cancel:"No"
	                ,    text:"Sicuro di voler eliminare interno extNum?"
	                ,    callback:function(result){
                    		if (result) {
								ret = AGP(wsURL,{action:"EXT_MOD", act:"D", ext:extNum});
								if (ret.status!=0) 
									dhtmlx.alert(ret.errMsg);
								else
									extGrid.deleteRow(extId);
							}
	                    }
	                });			

                
                // bamCatsDel();
                break;
        }
    });
                
    
    // GRID ///////////////////////////////////////////////////////////////

    extGrid = extLayout.cells("a").attachGrid();
    extGrid.setHeader("Interno,Abilitato,Sezione,Descrizione");
    extGrid.setColumnIds("ext,enabled,sectName,extDescr");
    extGrid.attachHeader("#text_filter,#select_filter,#select_filter,#text_filter");
    extGrid.setColSorting("str,str,str,str");

    extGrid.setInitWidths("100,80,150,*");
    extGrid.setColTypes("ro,ro,ro,ro");
    // extGrid.enableSmartRendering(true);
    extGrid.init();
    extGrid.load("../cn/extGrid.php");

    extGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        isNew = false;
        extForm.clear();
		extLayout.cells("a").showView("form");
        extForm.load("../cn/extForm.php?id="+rId, function(id, response) {
        });        
    });  
    
    // FORM ///////////////////////////////////////////////////////////////
    
    var extFormData = [

    ,	{type:'label',     label:'Interno',   		position:'absolute',    labelTop:5,		labelLeft: 5, 		labelWidth: 100}
	,	{type:'input',     name:'extNum',     		position:'absolute',    inputTop:7,     inputLeft: 110,    	inputWidth:100, maxLength:10}
	
	,	{type:'label',     label:'Descrizione',   	position:'absolute',    labelTop:45,    labelLeft: 5, 		labelWidth: 100}
	,	{type:'input',     name:'extDescr',     	position:'absolute',    inputTop:47,    inputLeft: 110,    	inputWidth:200, maxLength:50}
	
	,	{type:'label',     label:'Password',   		position:'absolute',    labelTop:85,    labelLeft: 5, 		labelWidth: 100}
	,	{type:'input',     name:'pwd',     			position:'absolute',    inputTop:87,    inputLeft: 110,    	inputWidth:200, maxLength:50}
    
    
    ,	{type:'label',     label:'Sezione',    		position:'absolute',    labelTop:125,    labelLeft: 5, 		labelWidth: 100}
    ,   {type: 'select',   name: 'sectId',			position:'absolute',    inputTop:127,    inputLeft: 110,  	connector:"../cn/sectList.php"}
    
    ,	{type:'label',     label:'Abilitato',    	position:'absolute',    labelTop:165,    labelLeft: 5, 		labelWidth: 100}
    ,   {type: 'checkbox',  name: 'enabled',			position:'absolute',    inputTop:167,    inputLeft: 110}
        
    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',    position:'absolute',    inputTop:200,     inputLeft: 320,    inputWidth: 55}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:200,     inputLeft: 400,    inputWidth: 55}

    ];

    
    extLayout.cells("a").showView("form");
    extForm = extLayout.cells("a").attachForm(extFormData);    
    extLayout.cells("a").showView("def");
    

    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////

    var dpf = new dataProcessor("../cn/extForm.php");
    dpf.init(extForm);

    extForm.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save':
	            if (isNew) dpf.sendData();
	            else       extForm.save(); //saves the made changes            
	            break;
	            
			case 'canc':
	            extLayout.cells("a").showView("def");
	            break;
        }
        
	});

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if (action=='error') {
			dhtmlx.alert("Errore Salvando interno. Possibile duplicato?");
			return;
        }
        
        var opts = extForm.getOptions("sectId");
		var sectDescr = (opts[opts.selectedIndex].text);	
        
        if(action=="inserted"){
            extGrid.addRow(tid,
                [ 	extForm.getItemValue("extNum")
            	,	extForm.getItemValue("enabled") == 1 ? "SI" : "NO"
            	,	sectDescr
            	,	extForm.getItemValue("extDescr")
                ]
            ,0);
            extGrid.selectRowById(tid,false,false,true);
        } else {
            extGrid.cells(sid,0).setValue(extForm.getItemValue("extNum"));
            extGrid.cells(sid,1).setValue(extForm.getItemValue("enabled")== 1 ? "SI" : "NO");
            extGrid.cells(sid,2).setValue(sectDescr);
            extGrid.cells(sid,3).setValue(extForm.getItemValue("extDescr"));
        }
        ret = AGP(wsURL,{action:"EXT_MOD", act:"A",  ext:extForm.getItemValue("extNum").trim(), pwd:extForm.getItemValue("pwd").trim()});
        if (ret.status!=0)
        	dhtmlx.alert(ret.errMsg);
        extLayout.cells("a").showView("def");
    });

    
}
