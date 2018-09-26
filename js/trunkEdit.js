function trunkEdit(winpos) {

    var isNew = false;
    var currVisuserId = 0;
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "trunkWin";
    if (winAlready(winId))
            return;

	var wp = winpos || null;	
    if (wp==null)
    	trunkWin  = dhxWins.createWindow(winId, 10, 10, 550, 400);
    else
    	trunkWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);            

    
    trunkWin.setText("Gestione Linee");
    trunkWin.attachEvent("onClose", function(win){
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    trunkLayout = new dhtmlXLayoutObject(trunkWin,"1C");
    trunkLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////

    trunkToolbar = trunkLayout.cells("a").attachToolbar();
    trunkToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    trunkToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    trunkToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    trunkToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
		        isNew = true;
		        trunkForm.clear();
		        trunkLayout.cells("a").showView("form");
                break;

            case "tDel" :
                alert('funzione disabilitata');
                // bamCatsDel();
                break;
        }
    });
                
    
    // GRID ///////////////////////////////////////////////////////////////

    trunkGrid = trunkLayout.cells("a").attachGrid();
    trunkGrid.setHeader("Linea,Tipo,Attiva,Configurazione");
    trunkGrid.setColumnIds("trunkDescr,trunkType,active,trunkStr");
    trunkGrid.attachHeader("#text_filter,#select_filter,#select_filter,#text_filter");
    trunkGrid.setColSorting("str,str,str,str");

    trunkGrid.setInitWidths("100,80,50,*");
    trunkGrid.setColTypes("ro,ro,ro,ro");
    // trunkGrid.enableSmartRendering(true);
    trunkGrid.init();
    trunkGrid.load("../cn/trunkGrid.php");

    trunkGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        isNew = false;
        trunkForm.clear();
		trunkLayout.cells("a").showView("form");
        trunkForm.load("../cn/trunkForm.php?id="+rId, function(id, response) {
        });        
    });  
    
    // FORM ///////////////////////////////////////////////////////////////
    
    var trunkFormData = [

    ,	{type:'label',     label:'Descrizione',   		position:'absolute',    labelTop:5,		labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'trunkDescr',     		position:'absolute',    inputTop:7,     inputLeft: 110,    	inputWidth:200, maxLength:255}
	
	,	{type:'label',     label:'Tipo',   	position:'absolute',    labelTop:45,    labelLeft: 5, 		labelWidth: 200}
    ,   {type: 'select',   name: 'trunkType',			position:'absolute',    inputTop:47,    inputLeft: 110,  	options:[{text:"Analogica",value:"A"},{text:"Digitale",value:"D"}]}
	
    ,	{type:'label',     label:'Attiva',   	position:'absolute',    labelTop:85,    labelLeft: 5, 		labelWidth: 200}
    ,   {type: 'select',   name: 'active',			position:'absolute',    inputTop:87,    inputLeft: 110,  	options:[{text:"SI",value:1},{text:"NO",value:0}]}
	
    ,	{type:'label',     label:'Configurazione',   		position:'absolute',    labelTop:125,		labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'trunkStr',     		position:'absolute',    inputTop:127,     inputLeft: 110,    	inputWidth:300, maxLength:255}
    
        
    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',    position:'absolute',    inputTop:240,     inputLeft: 110,    inputWidth: 55}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:240,     inputLeft: 238,    inputWidth: 55}

    ];

    
    trunkLayout.cells("a").showView("form");
    trunkForm = trunkLayout.cells("a").attachForm(trunkFormData);    
    trunkLayout.cells("a").showView("def");
    

    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////

    var dpf = new dataProcessor("../cn/trunkForm.php");
    dpf.init(trunkForm);

    trunkForm.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save':
	            if (isNew) dpf.sendData();
	            else       trunkForm.save(); //saves the made changes            
	            break;
	            
			case 'canc':
	            trunkLayout.cells("a").showView("def");
	            break;
        }
        
	});

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if (action=='error') {
			dhtmlx.alert("Errore Salvando interno. Possibile duplicato?");
			return;
        }
        
        
        if(action=="inserted"){
            trunkGrid.addRow(tid,
                [ 	trunkForm.getItemValue("trunkDescr")
            	,	trunkForm.getItemValue("trunkType")=="A" ? "Analogica" : "Digitale"
            	,	trunkForm.getItemValue("active")==1 ? "SI" : "NO"
            	,	trunkForm.getItemValue("trunkStr")
                ]
            ,0);
            trunkGrid.selectRowById(tid,false,false,true);
        } else {
            trunkGrid.cells(sid,0).setValue(trunkForm.getItemValue("trunkDescr"));
            trunkGrid.cells(sid,1).setValue(trunkForm.getItemValue("trunkType")=="A" ? "Analogica" : "Digitale");
            trunkGrid.cells(sid,2).setValue(trunkForm.getItemValue("active")==1 ? "SI" : "NO");
            trunkGrid.cells(sid,3).setValue(trunkForm.getItemValue("trunkStr"));
        }
        trunkLayout.cells("a").showView("def");
    });

    
}
