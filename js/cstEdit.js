function cstEdit(winpos) {
		
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var isNew = false;
    var currentcstId = 0;
    var winId = "cstWin";
    if (winAlready(winId))
            return;
    
    var wp = winpos || null;	
    if (wp==null)
    	cstWin  = dhxWins.createWindow(winId, 50, 50, 600, 480);
    else
    	cstWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);        
    
    
    
    cstWin.setText("Parametri Sistema");
    cstWin.attachEvent("onClose", function(win){
        return(true);
    });
    
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    cstLayout = new dhtmlXLayoutObject(cstWin,"1C");
    cstLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////

/**
    cstToolbar = cstLayout.cells("a").attachToolbar();
    cstToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    cstToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    cstToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    cstToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
                cstAdd();
                break;

            case "tDel" :
                cstDel();
                break;
        }
    });
**/                
    
    // GRID ///////////////////////////////////////////////////////////////

    cstGrid = cstLayout.cells("a").attachGrid();
    cstGrid.setHeader("Parametro,Descrizione,Valore");
    cstGrid.setColumnIds("constName,constExp,constVal");
    cstGrid.setColSorting("str,str,str");
    cstGrid.setColAlign("left,left,left");
    cstGrid.setInitWidths("100,300,*");
    cstGrid.setColTypes("ro,ro,ed");
    // cstGrid.enableSmartRendering(true);
    cstGrid.init();
    cstGrid.load("../cn/cstGrid.php");

	cstDP = new dataProcessor("../cn/cstGrid.php");
	cstDP.init(cstGrid);
    
    
}
