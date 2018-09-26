function popCall(callId) {
	
	var winId = "popCallWin";
	if (winAlready(winId))
	        return;
	popCallWin  = dhxWins.createWindow(winId, 80,80, 500, 520);
	popCallWin.center();
	popCallWin.setText("Dettagli Chiamata");
	popCallWin.denyResize();
	popCallWin.setModal(true);
	
    popCallLayout = new dhtmlXLayoutObject(popCallWin,"1C");
    popCallLayout.cells("a").hideHeader();
	popCallLayout.cells("a").attachURL("calldata.html?callId=" + callId);
	
}