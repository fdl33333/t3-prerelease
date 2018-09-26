function usrEdit(winpos) {
		
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var isNew = false;
    var currentusrId = 0;
    var winId = "usrWin";
    if (winAlready(winId))
            return;
    
    var wp = winpos || null;	
    if (wp==null)
    	usrWin  = dhxWins.createWindow(winId, 50, 50, 800, 480);
    else
    	usrWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);        
    
    
    
    usrWin.setText("Gestione Utenti");
    usrWin.attachEvent("onClose", function(win){
        return(true);
    });
    
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    usrLayout = new dhtmlXLayoutObject(usrWin,"2U");
    usrLayout.cells("a").setText("Utenti");
    usrLayout.cells("b").setText("Abilitazione Menu'");

    // TOOLBAR ///////////////////////////////////////////////////////////////

    usrToolbar = usrLayout.cells("a").attachToolbar();
    usrToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    usrToolbar.addButton("tNew",1,"Nuovo","plus.ico","");   
    usrToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    usrToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
                menaGrid.clearAll();
                usrAdd();
                break;

            case "tDel" :
                usrDel();
                break;
        }
    });
                
    
    // GRID ///////////////////////////////////////////////////////////////

    usrGrid = usrLayout.cells("a").attachGrid();
    usrGrid.setHeader("Cognome,Nome");
    usrGrid.setColumnIds("lname,fname");
    usrGrid.attachHeader("#text_filter,#text_filter");
    usrGrid.setColSorting("str,str");
    usrGrid.setColAlign("left,left");

    usrGrid.setInitWidths("120,*");
    usrGrid.setColTypes("ro,ro");
    // usrGrid.enableSmartRendering(true);
    usrGrid.init();
    usrGrid.load("../cn/usrGrid.php");

    usrGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        isNew = false;
        currentusrId = rId;
        usrForm.clear();
		usrLayout.cells("a").showView("form");
        usrForm.load("../cn/usrForm.php?id="+rId, function(id, response) {
        	tarr = usrForm.getItemValue('nrmBeg').split(":");
        	usrForm.setItemValue('nrmBegHH', tarr[0]);
        	usrForm.setItemValue('nrmBegMM', tarr[1]);

        	tarr = usrForm.getItemValue('nrmEnd').split(":");
        	usrForm.setItemValue('nrmEndHH', tarr[0]);
        	usrForm.setItemValue('nrmEndMM', tarr[1]);

		});        
    });  
    
    usrGrid.attachEvent("onRowSelect", function(id,ind){
    	currentusrId = id;
    	menaGrid.clearAndLoad("../cn/mEnaGrid.php?userId=" + id);
	});
    
    function usrDel() {
    	return;
	}
    
    // mEna GRID //////////////////////////////////////////////////////////
    menaGrid= usrLayout.cells("b").attachGrid();
    menaGrid.setImagePath("../assets/skin/imgs/"); 
    menaGrid.setHeader("Voce Menu',Abilitato");
    menaGrid.setColumnIds("menuDescr,ck");
    // menaGrid.attachHeader("#text_filter,#select_filter");
    menaGrid.setColSorting("str,str");
    menaGrid.setColAlign("left,left");
    menaGrid.setInitWidths("280,*");
    menaGrid.setColTypes("ro,ch");
    // usrGrid.enableSmartRendering(true);
    menaGrid.init();

    
    menaGrid.attachEvent("onCheck", function(rId,cInd,state){
    	var en = "";
    	menaGrid.forEachRow(function(id){
			if(menaGrid.cells(id,1).getValue()==1) {
				if (en!="") en += ",";
				en += id;
			}
		});
		var ret = AGP(wsURL,{action:"ENA_SET", uid:currentusrId, ena:en});
		if (ret.status!=0) {
			dhtmlx.alert(ret.errMsg);
		}
    	
	});
    
    // FORM ///////////////////////////////////////////////////////////////
    // serverDateFormat: '%Y-%m-%d  %H:%i:%s', 
    
    var usrFormData = [

    ,	{type:'label',     label:'Cognome',   	position:'absolute',    labelTop:5,     labelLeft: 5, labelWidth: 200}
	,	{type:'input',     name:'lname',     		position:'absolute',    inputTop:7,     inputLeft: 140,    inputWidth:200,	maxLength:50}

    ,	{type:'label',     label:'Nome',   	position:'absolute',    labelTop:45,     labelLeft: 5, labelWidth: 200}
	,	{type:'input',     name:'fname',     		position:'absolute',    inputTop:47,     inputLeft: 140,    inputWidth:200,	maxLength:50}

    ,	{type:'label',     label:'Login',   	position:'absolute',    labelTop:85,     labelLeft: 5, labelWidth: 200}
	,	{type:'input',     name:'uid',     		position:'absolute',    inputTop:87,     inputLeft: 140,    inputWidth:200,	maxLength:50}

    ,	{type:'label',     label:'Password',   	position:'absolute',    labelTop:125,     labelLeft: 5, labelWidth: 200}
	,	{type:'input',     name:'pwd',     		position:'absolute',    inputTop:127,     inputLeft: 140,    inputWidth:200,	maxLength:50}
        

    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',    position:'absolute',    inputTop:170,     inputLeft: 180,    inputWidth: 55}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:170,     inputLeft: 280,    inputWidth: 55}

    ];

    
    usrLayout.cells("a").showView("form");
    usrForm = usrLayout.cells("a").attachForm(usrFormData);    
    usrLayout.cells("a").showView("def");


    

    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////

    var dpf = new dataProcessor("../cn/usrForm.php");
    dpf.init(usrForm);

    usrForm.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save':
	            
	            // does this zone already exist in db??
	            if (isNew) dpf.sendData();
	            else       usrForm.save(); //saves the made changes            
	            break;
	            
			case 'canc':
	            usrLayout.cells("a").showView("def");
	            break;

        }
        
	});

	
    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if (action=='error') {
			dhtmlx.alert("Errore Salvando utente. Possibile duplicato?");
			return;
        }
        

        
        if(action=="inserted"){
            usrGrid.addRow(tid,
                [ 	usrForm.getItemValue("lname")
            	,	usrForm.getItemValue("fname")
                ]
            ,0);
            usrGrid.selectRowById(tid,false,false,true);
        } else {
        	usrGrid.cells(sid,0).setValue(usrForm.getItemValue("lname"))   ;
        	usrGrid.cells(sid,1).setValue(usrForm.getItemValue("fname"))  ;
        }
        usrLayout.cells("a").showView("def");
        // alert("callback");
    });


    function usrAdd() {
        isNew = true;
        currentusrId = 0;
        usrForm.clear();
        usrLayout.cells("a").showView("form");
    }
    

    
}
