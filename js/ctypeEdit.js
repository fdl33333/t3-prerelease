function ctypeEdit(winpos) {

    var isNew = false;
    var currVisuserId = 0;
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "ctypeWin";
    if (winAlready(winId))
            return;
    ctypeWin  = dhxWins.createWindow(winId, 100, 100, 550, 400);
    ctypeWin.setText("Gestione Tipi Crimine");
    ctypeWin.attachEvent("onClose", function(win){
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    ctypeLayout = new dhtmlXLayoutObject(ctypeWin,"1C");
    ctypeLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////

    ctypeToolbar = ctypeLayout.cells("a").attachToolbar();
    ctypeToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    ctypeToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    ctypeToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    ctypeToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
		        isNew = true;
		        ctypeForm.clear();
		        ctypeLayout.cells("a").showView("form");
                break;

            case "tDel" :
                alert('funzione disabilitata');
                // bamCatsDel();
                break;
        }
    });
                
    
    // GRID ///////////////////////////////////////////////////////////////

    ctypeGrid = ctypeLayout.cells("a").attachGrid();
    ctypeGrid.setHeader("Tipo Crimine");
    ctypeGrid.setColumnIds("ctypeDescr");
    ctypeGrid.attachHeader("#text_filter");
    ctypeGrid.setColSorting("str");

    ctypeGrid.setInitWidths(",*");
    ctypeGrid.setColTypes("ro");
    // ctypeGrid.enableSmartRendering(true);
    ctypeGrid.init();
    ctypeGrid.load("../cn/ctypeGrid.php");

    ctypeGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        isNew = false;
        ctypeForm.clear();
		ctypeLayout.cells("a").showView("form");
        ctypeForm.load("../cn/ctypeForm.php?id="+rId, function(id, response) {
        });        
    });  
    
    // FORM ///////////////////////////////////////////////////////////////
    
    var ctypeFormData = [

	
	,	{type:'label',     label:'Descrizione',   	position:'absolute',    labelTop:45,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'ctypeDescr',     		position:'absolute',    inputTop:47,    inputLeft: 110,    	inputWidth:200, maxLength:50}
	
        
    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',    position:'absolute',    inputTop:120,     inputLeft: 320,    inputWidth: 55}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:120,     inputLeft: 440,    inputWidth: 55}

    ];

    
    ctypeLayout.cells("a").showView("form");
    ctypeForm = ctypeLayout.cells("a").attachForm(ctypeFormData);    
    ctypeLayout.cells("a").showView("def");
    

    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////

    var dpf = new dataProcessor("../cn/ctypeForm.php");
    dpf.init(ctypeForm);

    ctypeForm.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save':
	            if (isNew) dpf.sendData();
	            else       ctypeForm.save(); //saves the made changes            
	            break;
	            
			case 'canc':
	            ctypeLayout.cells("a").showView("def");
	            break;
        }
        
	});

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        
        
        if(action=="inserted"){
            ctypeGrid.addRow(tid,
                [ 	ctypeForm.getItemValue("ctypeDescr")
                ]
            ,0);
            ctypeGrid.selectRowById(tid,false,false,true);
        } else {
            ctypeGrid.cells(sid,0).setValue(ctypeForm.getItemValue("ctypeDescr"));
        }
        ctypeLayout.cells("a").showView("def");
    });

    
}
