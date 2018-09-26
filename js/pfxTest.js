function pfxTest(winpos) {
		
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var isNew = false;
    var currVisuserId = 0;
    var winId = "pfxCheck"
    if (winAlready(winId))
            return;

	var wp = winpos || null;	
    if (wp==null)
    	pfxWin  = dhxWins.createWindow(winId, 10, 10, 440, 200);
    else
    	pfxWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);        

    
    pfxWin.setText("Controllo Destinazioni Telefoniche");
    pfxWin.attachEvent("onClose", function(win){
        return(true);
    });
    
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    pfxLayout = new dhtmlXLayoutObject(pfxWin,"1C");
    pfxLayout.cells("a").hideHeader();
    pfxLayout.cells("a").attachURL("../cn/pfxtest.html");

}
