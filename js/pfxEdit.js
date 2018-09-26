function pfxEdit(winpos) {

    var isNew = false;
    var currVisuserId = 0;
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "pfxWin";
    if (winAlready(winId))
            return;
    
    var wp = winpos || null;	
    if (wp==null)
    	pfxWin  = dhxWins.createWindow(winId, 10, 10, 600, 420);
    else
    	pfxWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);            
    
    
    pfxWin.setText("Gestione Prefissi");
    pfxWin.attachEvent("onClose", function(win){
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    pfxLayout = new dhtmlXLayoutObject(pfxWin,"1C");
    pfxLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////

    pfxToolbar = pfxLayout.cells("a").attachToolbar();
    pfxToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    pfxToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    pfxToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    pfxToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
		        isNew = true;
		        pfxForm.clear();
		        pfxLayout.cells("a").showView("form");
                break;

            case "tDel" :
                alert('funzione disabilitata');
                // bamCatsDel();
                break;
        }
    });
                
    
    // GRID ///////////////////////////////////////////////////////////////

    pfxGrid = pfxLayout.cells("a").attachGrid();
    pfxGrid.setHeader("Prefisso,Destinazione,Zona");
    pfxGrid.setColumnIds("pfx,name,tznDescr");
    pfxGrid.attachHeader("#text_filter,#text_filter,#select_filter");
    pfxGrid.setColSorting("str,str,str");

    pfxGrid.setInitWidths("100,250,*");
    pfxGrid.setColTypes("ro,ro,ro");
    // pfxGrid.enableSmartRendering(true);
    pfxGrid.init();
    pfxGrid.load("../cn/pfxGrid.php");

    pfxGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        isNew = false;
        pfxForm.clear();
		pfxLayout.cells("a").showView("form");
        pfxForm.load("../cn/pfxForm.php?id="+rId, function(id, response) {
        });        
    });  
    
    // FORM ///////////////////////////////////////////////////////////////
    
    var pfxFormData = [

    ,	{type:'label',     label:'Prefisso',   		position:'absolute',    labelTop:5,		labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'pfx',     			position:'absolute',    inputTop:7,     inputLeft: 110,    	inputWidth:100, maxLength:10}
	
	,	{type:'label',     label:'Descrizione',   	position:'absolute',    labelTop:45,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'descr',     		position:'absolute',    inputTop:47,    inputLeft: 110,    	inputWidth:200, maxLength:50}
	
    ,	{type:'label',     label:'Zona',    		position:'absolute',    labelTop:85,    labelLeft: 5, 		labelWidth: 200}
    ,   {type: 'select',   name: 'tznCode',			position:'absolute',    inputTop:87,    inputLeft: 110,  	connector:"../cn/tznList.php"}
    
        
    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',    position:'absolute',    inputTop:120,     inputLeft: 320,    inputWidth: 55}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:120,     inputLeft: 440,    inputWidth: 55}

    ];

    
    pfxLayout.cells("a").showView("form");
    pfxForm = pfxLayout.cells("a").attachForm(pfxFormData);    
    pfxLayout.cells("a").showView("def");
    

    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////

    var dpf = new dataProcessor("../cn/pfxForm.php");
    dpf.init(pfxForm);

    pfxForm.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save':
	            if (isNew) dpf.sendData();
	            else       pfxForm.save(); //saves the made changes            
	            break;
	            
			case 'canc':
	            pfxLayout.cells("a").showView("def");
	            break;
        }
        
	});

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if (action=='error') {
			dhtmlx.alert("Errore Salvando prefisso. Possibile duplicato?");
			return;
        }
        
        var opts = pfxForm.getOptions("tznCode");
		var tznDescr = (opts[opts.selectedIndex].text);	
        
        if(action=="inserted"){
            pfxGrid.addRow(tid,
                [ 	pfxForm.getItemValue("pfx")
            	,	pfxForm.getItemValue("descr")
            	,	tznDescr
                ]
            ,0);
            pfxGrid.selectRowById(tid,false,false,true);
        } else {
            pfxGrid.cells(sid,0).setValue(pfxForm.getItemValue("pfx"));
            pfxGrid.cells(sid,1).setValue(pfxForm.getItemValue("descr"));
            pfxGrid.cells(sid,2).setValue(tznDescr);
        }
        pfxLayout.cells("a").showView("def");
    });

    
}
