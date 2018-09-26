function lastCall(winpos) {

	var dettId = 0;
		

	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "lastCallWin";
    if (winAlready(winId))
            return;

	var wp = winpos || null;	
    if (wp==null)
    	lcWin  = dhxWins.createWindow(winId, 0, 0, 900, 700);
    else
    	lcWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);
    
    lcWin.setText("Ultime Chiamate Detenuti");
    // lcWin.denyResize();
    lcWin.attachEvent("onClose", function(win){
        
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    lcLayout = new dhtmlXLayoutObject(lcWin,"1C");
    lcLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////
    lcToolbar = lcLayout.cells("a").attachToolbar();
    lcToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    lcToolbar.addButton("tRef",1,"Aggiorna","reload.png","");
    lcToolbar.addButton("tDet",2,"Chiamate","List.ico","");
	lcToolbar.addButton("tXLS",3,"Esporta in Excel","Table.ico","");   
	lcToolbar.addButton("tPDF",3,"Esporta in Excel","pdf.png","");   
    
        
    lcToolbar.attachEvent("onClick", function(id) {
        switch (id) {
			case "tRef" : 
				lcGrid.clearAndLoad("../cn/lastCallGrid.php");
				break;
				
			case "tDet" :
				lcLayout.cells("a").showView("hist");
				histGrid.clearAndLoad("../cn/dettCallsGrid.php?dettId=" + lcGrid.getSelectedRowId(),  function(){
                    histGrid.sortRows(0,"str","des");
                });
                break;
			
			case "tXLS" :
				lcGrid.toExcel('../assets/DHTMLX46/codebase/grid-excel-php/generate.php');
				break;
			
			case "tPDF" :
				lcGrid.toPDF('../assets/DHTMLX46/codebase/grid-pdf-php/generate.php','color',true);
				break;
			
        }

    });
        
    
    // GRID ////////////////////////////////////////////////////////////////////
    lcLayout.cells("a").showView("def");
    lcGrid = lcLayout.cells("a").attachGrid();
    lcGrid.setHeader("Cognome,Nome,Ultima,gg,Oggi,Sett.,Mese");
    // lcGrid.setColumnIds("serial,pinOrig,pin,dtCreate,notes");
    lcGrid.attachHeader("#text_filter,#text_filter,#text_filter,#numeric_filter,#text_filter,#text_filter,#text_filter");
    lcGrid.setColSorting("str,str,str,int,str,str,str");
	lcGrid.setColAlign("left,left,left,right,right,right,right");
    lcGrid.setInitWidths("150,150,150,80,80,80,80");
    lcGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro");
    lcGrid.enableSmartRendering(true);
    lcGrid.init();



    lcGrid.attachEvent("onRowDblClicked", function(rId,cInd){
		lcLayout.cells("a").showView("hist");
		histGrid.clearAndLoad("../cn/dettCallsGrid.php?dettId=" + rId,  function(){
        	histGrid.sortRows(0,"str","des");
        });        
    });      

	
    lcGrid.clearAndLoad("../cn/lastCallGrid.php");
	

    lcLayout.cells("a").showView("hist");

    histTb = lcLayout.cells("a").attachToolbar();
    histTb.setIconsPath("../assets/DHTMLX46/icons/");
    histTb.addButton("tRef",1,"Aggiorna","reload.png","");
	histTb.addButton("tXLS",2,"Esporta in Excel","Table.ico","");   
	histTb.addButton("tPDF",3,"Esporta in PDF","pdf.png","");   
    histTb.addButton("tRet",4,"Torna a Lista","User group.ico","");
    
    
    histTb.attachEvent("onClick", function(id) {
        switch (id) {
            
            case "tRef" :
                histGrid.clearAndLoad("../cn/dettCallsGrid.php?dettId=" + lcGrid.getSelectedRowId(),  function(){
                    histGrid.sortRows(0,"str","des");
                });
                break;
                
			case "tXLS" :
				histGrid.toExcel('../assets/DHTMLX46/codebase/grid-excel-php/generate.php');
				break;
			
			case "tPDF" :
				histGrid.toPDF('../assets/DHTMLX46/codebase/grid-pdf-php/generate.php','color',true);
				break;

            	
            case "tRet" :
				lcLayout.cells("a").showView("def");
                break;
        }
    });
    
	histGrid = lcLayout.cells("a").attachGrid();
	histGrid.setImagePath("../assets/DHTMLX46/codebase/imgs/");   
	histGrid.setHeader("Data/Ora,Numero,Tipo,Ric,Sec,Costo,Descr,Esito");
	histGrid.setInitWidths("140,90,60,40,40,50,140,*");
	histGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
    histGrid.setColAlign("left,left,left,center,right,right,left,left");
    histGrid.setColSorting("str,str,str,str,str,num,num,str");
    histGrid.attachHeader("#text_filter,#text_filter,#select_filter,#select_filter,#text_filter,#text_filter,#select_filter,#select_filter");
	histGrid.init();

    
    	
    histGrid.attachEvent("onRowDblClicked", function(rId,cInd){
    	popCall(rId);
	});

		


	///////////////////////////////////////// FINALLY ..
	
	lcLayout.cells("a").showView("def");

	

	
}
