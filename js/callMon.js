function callMon(winpos) {
	
	var wp = winpos || null;
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var isNew = false;
    var currentcmonId = 0;
    var winId = "callMonWin";
    if (winAlready(winId))
            return;
	if (winpos!=null)
    	cmonWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);
	else
		cmonWin  = dhxWins.createWindow(winId, 50, 50, 750, 400);
	
    cmonWin.setText("Call Monitor");
    cmonWin.attachEvent("onClose", function(win){
        return(true);
    });
    
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    cmonLayout = new dhtmlXLayoutObject(cmonWin,"1C");
    cmonLayout.cells("a").hideHeader();
	cmonLayout.cells("a").attachURL("../callmon4.html");
	
    
}
