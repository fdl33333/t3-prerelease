function dashboard(winpos) {
	
	var wp = winpos || null;
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var isNew = false;
    var currentdashboardId = 0;
    var winId = "dashboardWin";
    if (winAlready(winId))
            return;
	if (winpos!=null)
    	dashboardWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);
	else
		dashboardWin  = dhxWins.createWindow(winId, 0, 0, 760, 500);
	
    dashboardWin.setText("Panoramica Sistema");
    dashboardWin.attachEvent("onClose", function(win){
        return(true);
    });
    
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    dashboardLayout = new dhtmlXLayoutObject(dashboardWin,"1C");
    dashboardLayout.cells("a").hideHeader();
	dashboardLayout.cells("a").attachURL("../dashboard.html");
	
    
}
