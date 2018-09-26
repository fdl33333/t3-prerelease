function istEdit(winpos) {
		
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var isNew = false;
    var currentcstId = 0;
    var winId = "istWin";
    if (winAlready(winId))
            return;
    
    var wp = winpos || null;	
    if (wp==null)
    	cstWin  = dhxWins.createWindow(winId, 50, 50, 800, 480);
    else
    	cstWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);        
    
    
    
    cstWin.setText("Istituti di Pena");
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
    cstGrid.setHeader("Nome,Provincia,Numero,Note");
    cstGrid.setColumnIds("istName,istPRV,telnum,istNotes");
    cstGrid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter");
    cstGrid.setColSorting("str,str,str,str");
    cstGrid.setColAlign("left,left,left");
    cstGrid.setInitWidths("200,150,100,*");
    cstGrid.setColTypes("ed,ed,ed,ed");
    // cstGrid.enableSmartRendering(true);
    cstGrid.init();
    cstGrid.load("../cn/istGrid.php");

	cstDP = new dataProcessor("../cn/istGrid.php");
	cstDP.init(cstGrid);
    
    
}
