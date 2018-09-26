function callAna(winpos) {

	var dettId = 0;
		

	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "lastCallWin2";
    if (winAlready(winId))
            return;

	var wp = winpos || null;	
    if (wp==null)
    	caWin  = dhxWins.createWindow(winId, 0, 0, 900, 700);
    else
    	caWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);
    
    caWin.setText("Ultime Chiamate Detenuti");
    // caWin.denyResize();
    caWin.attachEvent("onClose", function(win){
        
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    caLayout = new dhtmlXLayoutObject(caWin,"1C");
    caLayout.cells("a").hideHeader();

    caToolbar = caLayout.cells("a").attachToolbar();
    caToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    caToolbar.addButton("tRef",1,"Aggiorna","reload.png","");
    
        
    caToolbar.attachEvent("onClick", function(id) {
        switch (id) {
			case "tRef" : 
				loadCalls();
				break;
		}
	});
    
    caLayout.cells("a").showView("def");
    caGrid = caLayout.cells("a").attachGrid();
    caGrid.setHeader("A_uuid,A_dir,A_name,A_state,B_uuid,B_dir,B_name,B_state");
	caGrid.setColAlign("left,left,left,left,left,left,left,,left");
    caGrid.setInitWidths("150,50,150,50,150,50,150,50");
    caGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
    caGrid.init();

	
	
	function loadCalls() {
		caGrid.clearAll();
		var ret = AGP(wsURL,{action:"GET_CALLS"});
		if (ret.status!=0)
			dhtmlx.alert(ret.errMsg);
		else {
			ret.calls.forEach(function (c) {
				caGrid.addRow(c.uuid,
					[
						c.uuid
					,	c.direction
					,	c.name
					,	c.state
					,	c.b_uuid
					,	c.b_direction
					,	c.b_name
					,	c.b_callstate
					]
				);
			});
		}
	}    

	loadCalls();
	
}
