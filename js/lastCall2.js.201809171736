function lastCall2(winpos) {

	var dettId = 0;
		

	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "lastCallWin2";
    if (winAlready(winId))
            return;

	var wp = winpos || null;	
    if (wp==null)
    	lc2Win  = dhxWins.createWindow(winId, 0, 0, 900, 700);
    else
    	lc2Win  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);
    
    lc2Win.setText("Ultime Chiamate Detenuti");
    // lc2Win.denyResize();
    lc2Win.attachEvent("onClose", function(win){
        
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    lc2Layout = new dhtmlXLayoutObject(lc2Win,"1C");
    lc2Layout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////
    
    lc2Toolbar = lc2Layout.cells("a").attachToolbar();
    lc2Toolbar.setIconsPath("../assets/DHTMLX46/icons/");

    lc2Toolbar.addButton("tRef",1,"Aggiorna","reload.png","");
    lc2Toolbar.addButton("tDet",2,"Chiamate","List.ico","");
	lc2Toolbar.addSeparator("sep1",3);
    lc2Toolbar.addButton("tL90",4,"90 gg","reload.png","pdf.png");
    lc2Toolbar.addButton("tL60",5,"60 gg","reload.png","pdf.png");
    lc2Toolbar.addButton("tL30",6,"30 gg","reload.png","pdf.png");
    lc2Toolbar.addButton("tLXX",7,"Mai","reload.png","pdf.png");
	lc2Toolbar.addSeparator("sep1",8);
	lc2Toolbar.addButton("tXLS",9,"Esporta in Excel","Table.ico","");   
	lc2Toolbar.addButton("tPDF",10,"Esporta in PDF","pdf.png","");   


        
    lc2Toolbar.attachEvent("onClick", function(id) {
        switch (id) {

			case "tL30" :
			case "tL60" :
			case "tL90" :
			case "tLXX" :
				lc2Toolbar.enableItem("tL30");
				lc2Toolbar.enableItem("tL60");
				lc2Toolbar.enableItem("tL90");
				lc2Toolbar.enableItem("tLXX");
				lc2Toolbar.disableItem(id);
		 		lc2Grid.clearAndLoad("../cn/lastCallGrid.php?limit=" + id.substr(2,2));
				break;


			case "tRef" : 
				lc2Grid.clearAndLoad("../cn/lastCallGrid.php?limit=90");
				break;
				
			case "tDet" :
				lc2Layout.cells("a").showView("hist");
				histGrid.clearAndLoad("../cn/dettCallsGrid.php?dettId=" + lc2Grid.getSelectedRowId(),  function(){
                    histGrid.sortRows(0,"str","des");
                });
                break;
			
			case "tXLS" :
				lc2Grid.toExcel('../assets/DHTMLX46/codebase/grid-excel-php/generate.php');
				break;
			
			case "tPDF" :
				lc2Grid.toPDF('../assets/DHTMLX46/codebase/grid-pdf-php/generate.php','color',true);
				break;
			
        }

    });
        

    
    // GRID ////////////////////////////////////////////////////////////////////
    lc2Layout.cells("a").showView("def");
    lc2Grid = lc2Layout.cells("a").attachGrid();
    lc2Grid.setHeader("Report Ultime Chiamate,#cspan,#cspan,#cspan,Numero Chiamate,#cspan,#cspan");
    lc2Grid.attachHeader("Cognome,Nome,Ultima,gg,Oggi,Sett.,Mese");
    lc2Grid.attachHeader("#text_filter,#text_filter,#text_filter,#numeric_filter,#text_filter,#text_filter,#text_filter");
    lc2Grid.setColSorting("str,str,str,int,str,str,str");
	lc2Grid.setColAlign("left,left,left,right,right,right,right");
    lc2Grid.setInitWidths("150,150,150,80,80,80,80");
    lc2Grid.setColTypes("ro,ro,ro,ro,ro,ro,ro");
    lc2Grid.enableSmartRendering(true);
    lc2Grid.init();


    lc2Grid.attachEvent("onRowDblclicked", function(rId,cInd){
		lc2Layout.cells("a").showView("hist");
		histGrid.clearAndLoad("../cn/dettCallsGrid.php?dettId=" + rId,  function(){
        	histGrid.sortRows(0,"str","des");
        });        
    });      

	
    lc2Grid.clearAndLoad("../cn/lastCallGrid.php?limit=90");
	

	
	
	
    lc2Layout.cells("a").showView("hist");

    histTb = lc2Layout.cells("a").attachToolbar();
    histTb.setIconsPath("../assets/DHTMLX46/icons/");
    histTb.addButton("tRef",1,"Aggiorna","reload.png","");
	histTb.addButton("tXLS",2,"Esporta in Excel","Table.ico","");   
	histTb.addButton("tPDF",3,"Esporta in PDF","pdf.png","");   
    histTb.addButton("tRet",4,"Torna a Lista","User group.ico","");
    
    
    histTb.attachEvent("onClick", function(id) {
        switch (id) {
            
            case "tRef" :
                histGrid.clearAndLoad("../cn/dettCallsGrid.php?dettId=" + lc2Grid.getSelectedRowId(),  function(){
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
				lc2Layout.cells("a").showView("def");
                break;
        }
    });
    
	histGrid = lc2Layout.cells("a").attachGrid();
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
	
	lc2Layout.cells("a").showView("def");

	

	
}
