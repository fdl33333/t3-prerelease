function fileDrop() {

    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "dropWin";
    if (winAlready(winId))
            return;
    dropWin  = dhxWins.createWindow(winId, 40, 40, 628, 480);
    dropWin.setText("Anagrafica Tessere");
    dropWin.denyResize();
    dropWin.attachEvent("onClose", function(win){
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    dropLayout = new dhtmlXLayoutObject(dropWin,"1C");
    dropLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////
    
    
    
    var dropFormData = [
   		{type:'label',     label:'Nome',   	position:'absolute',    labelTop:5,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'fname',  	position:'absolute',    inputTop:7,    inputLeft: 110, inputWidth:200, maxLength:50}
	
   	,	{type:'label',     label:'Cognome',   	position:'absolute',    labelTop:35,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'lname',  	position:'absolute',    inputTop:37,    inputLeft: 110, inputWidth:200,maxLength:50}
	
   	,	{type:'label',     label:'Data di Nascita',   	position:'absolute',    labelTop:65,     labelLeft: 5, labelWidth: 200}		
	,	{type:'calendar',  	name:'bdate',  	position:'absolute',    inputTop:67,    inputLeft: 110, inputWidth:80
			,dateFormat: '%d/%m/%Y',serverDateFormat:'%Y-%m%-%d'	}
	
   	,	{type:'label',     label:'Matricola',   	position:'absolute',    labelTop:95,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'matr',  	position:'absolute',    inputTop:97,    inputLeft: 110, inputWidth:80, maxLength:20}

   	,	{type:'label',     label:'Tipo Crimine',   	position:'absolute',    labelTop:125,     labelLeft: 5, labelWidth: 200}		
	,	{type:'select',  	name:'cTypeId',  	position:'absolute',    inputTop:127,    inputLeft: 110, inputWidth:200
				, options:[{value: "0", text:"NO"},{value: "1", text:"SI"} ]}

   	,	{type:'label',     label:'Lingua',   	position:'absolute',    labelTop:155,     labelLeft: 5, labelWidth: 200}		
	,	{type:'select',  	name:'langCode',  	position:'absolute',    inputTop:157,    inputLeft: 110, inputWidth:200
			, options:[{value: "0", text:"NO"},{value: "1", text:"SI"} ]
	}

   	,	{type:'label',     label:'Registrazione',   	position:'absolute',    labelTop:185,     labelLeft: 5, labelWidth: 200}		
	,	{type:'select',  	name:'canRec',  	position:'absolute',    inputTop:187,    inputLeft: 110, inputWidth: 50
			, options:[{value: "0", text:"NO"},{value: "1", text:"SI"} ] }

   	,	{type:'label',     label:'Note',   	position:'absolute',    labelTop:245,     labelLeft: 5, labelWidth: 200}		
	,	{type:'input',  	name:'notes',  	position:'absolute',    inputTop:247,    inputLeft: 110, inputWidth: 50
			, inputWidth:490, rows:8}

								
	,	{type:'image',  url:'picHandler.php', name:'pic',  position:'absolute',    inputTop:7,    inputLeft: 400
				,  inputWidth: 200,	inputHeight: 200}
				

	,	{type:'button',   name:'btCancel',  value:'Anulla', position:'absolute',    inputTop:400,    inputLeft: 300
				,  width:100}

	,	{type:'button',   name:'btSave',  value:'Salva', position:'absolute',    inputTop:400,    inputLeft: 498
				,  width:100}
    ];
    
    dropLayout.cells("a").showView("form");
    dropForm = dropLayout.cells("a").attachForm(dropFormData);    

	dropForm.attachEvent("onButtonClick", function(cmd) {
		switch(cmd) {
			case "btSave" : 
				var vals = {};
				dropForm.forEachItem(function(name) {
					if (name.substr(0,6) != 'dhxId_') {
						try {
							var val = dropForm.getItemValue(name);							
							try {
								var dt = dtJavaToMy(val);	
								vals[name] = dt;
							} catch(err) {
								vals[name] = val;
							}
								
						} catch(err) {
							// vals[name] = "***ERROR";
						}
						
					}
				});
				alert(JSON.stringify(vals));
			break;
			
			
			case "btCancel" :
			break;
			
			
		}
	});    
    
}
