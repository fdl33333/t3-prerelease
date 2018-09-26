function sectEdit(winpos) {

    var isNew = false;
    var currVisuserId = 0;
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "sectWin";
    if (winAlready(winId))
            return;
    
	var wp = winpos || null;	
    if (wp==null)
    	sectWin  = dhxWins.createWindow(winId, 10, 10, 550, 400);
    else
    	sectWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);        
    
    sectWin.setText("Gestione Sezioni");
    sectWin.attachEvent("onClose", function(win){
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    sectLayout = new dhtmlXLayoutObject(sectWin,"1C");
    sectLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////

    sectToolbar = sectLayout.cells("a").attachToolbar();
    sectToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    sectToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    sectToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    sectToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
		        isNew = true;
		        sectForm.clear();
		        sectLayout.cells("a").showView("form");
                break;

            case "tDel" :
                alert('funzione disabilitata');
                // bamCatsDel();
                break;
        }
    });
                
    
    // GRID ///////////////////////////////////////////////////////////////

    sectGrid = sectLayout.cells("a").attachGrid();
    sectGrid.setHeader("Sezione,Periodo 1,Periodo 2,Periodo 3,Descrizione");
    sectGrid.setColumnIds("sectName,p1Per,p2Per,p3Per,sectDescr");
    sectGrid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
    sectGrid.setColSorting("str,str,str,str,str");

    sectGrid.setInitWidths("100,80,80,80,*");
    sectGrid.setColTypes("ro,ro,ro,ro,ro");
    // sectGrid.enableSmartRendering(true);
    sectGrid.init();
    sectGrid.load("../cn/sectGrid.php");

    sectGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        isNew = false;
        sectForm.clear();
		sectLayout.cells("a").showView("form");
        sectForm.load("../cn/sectForm.php?id="+rId, function(id, response) {
        	setPer();
        });        
    });  
    
    // FORM ///////////////////////////////////////////////////////////////
    
    var sectFormData = [

    ,	{type:'label',     label:'Sezione',   		position:'absolute',    labelTop:5,		labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'sectName',     		position:'absolute',    inputTop:7,     inputLeft: 110,    	inputWidth:100, maxLength:10}

	,	{type:'hidden',     name:'p1'}
	,	{type:'hidden',     name:'p2'}
	,	{type:'hidden',     name:'p3'}
	
	,	{type:'label',     label:'Periodo 1',   position:'absolute',    labelTop:45,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'select',     name:'p1FrHH',     	position:'absolute',    inputTop:47,    inputLeft: 110,    	inputWidth:40}
	,	{type:'label',     label:':',   		position:'absolute',    labelTop:45,    labelLeft: 148, 	labelWidth: 20}
	,	{type:'select',     name:'p1FrMM',     	position:'absolute',    inputTop:47,    inputLeft: 158,    	inputWidth:40}
	,	{type:'label',     label:'-',   		position:'absolute',    labelTop:45,    labelLeft: 200, 	labelWidth: 20}
	,	{type:'select',     name:'p1ToHH',     	position:'absolute',    inputTop:47,    inputLeft: 216,    	inputWidth:40}
	,	{type:'label',     label:':',   		position:'absolute',    labelTop:45,    labelLeft: 254, 	labelWidth: 20}
	,	{type:'select',     name:'p1ToMM',     	position:'absolute',    inputTop:47,    inputLeft: 264,    	inputWidth:40}
	
	,	{type:'label',     label:'Periodo 2',   position:'absolute',    labelTop:85,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'select',     name:'p2FrHH',     	position:'absolute',    inputTop:87,    inputLeft: 110,    	inputWidth:40}
	,	{type:'label',     label:':',   		position:'absolute',    labelTop:85,    labelLeft: 148, 	labelWidth: 20}
	,	{type:'select',     name:'p2FrMM',     	position:'absolute',    inputTop:87,    inputLeft: 158,    	inputWidth:40}
	,	{type:'label',     label:'-',   		position:'absolute',    labelTop:85,    labelLeft: 200, 	labelWidth: 20}
	,	{type:'select',     name:'p2ToHH',     	position:'absolute',    inputTop:87,    inputLeft: 216,    	inputWidth:40}
	,	{type:'label',     label:':',   		position:'absolute',    labelTop:85,    labelLeft: 254, 	labelWidth: 20}
	,	{type:'select',     name:'p2ToMM',     	position:'absolute',    inputTop:87,    inputLeft: 264,    	inputWidth:40}
	
	,	{type:'label',     label:'Periodo 3',   position:'absolute',    labelTop:125,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'select',     name:'p3FrHH',     	position:'absolute',    inputTop:127,    inputLeft: 110,    	inputWidth:40}
	,	{type:'label',     label:':',   		position:'absolute',    labelTop:125,    labelLeft: 148, 	labelWidth: 20}
	,	{type:'select',     name:'p3FrMM',     	position:'absolute',    inputTop:127,    inputLeft: 158,    	inputWidth:40}
	,	{type:'label',     label:'-',   		position:'absolute',    labelTop:125,    labelLeft: 200, 	labelWidth: 20}
	,	{type:'select',     name:'p3ToHH',     	position:'absolute',    inputTop:127,    inputLeft: 216,    	inputWidth:40}
	,	{type:'label',     label:':',   		position:'absolute',    labelTop:125,    labelLeft: 254, 	labelWidth: 20}
	,	{type:'select',     name:'p3ToMM',     	position:'absolute',    inputTop:127,    inputLeft: 264,    	inputWidth:40}
	
	,	{type:'label',     label:'Descrizione',   	position:'absolute',    labelTop:165,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'sectDescr',     	position:'absolute',    inputTop:167,    inputLeft: 110,    inputWidth:400, maxLength:255}
	
        
    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',    position:'absolute',    inputTop:240,     inputLeft: 110,    inputWidth: 55}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:240,     inputLeft: 238,    inputWidth: 55}

    ];

    
    sectLayout.cells("a").showView("form");
    sectForm = sectLayout.cells("a").attachForm(sectFormData);    
    
    var opts1 = sectForm.getOptions('p1FrHH');
    var opts2 = sectForm.getOptions('p2FrHH');
    var opts3 = sectForm.getOptions('p3FrHH');
    var opts4 = sectForm.getOptions('p1ToHH');
    var opts5 = sectForm.getOptions('p2ToHH');
    var opts6 = sectForm.getOptions('p3ToHH');
    for (i=0; i<24; i++) {
		if (i<10)	var s = "0" + i;
		else		var s = "" + i;
		if (i==0) opts1.add(new Option("-","-"));				opts1.add(new Option(s,s));
		if (i==0) opts2.add(new Option("-","-"));       		opts2.add(new Option(s,s));
		if (i==0) opts3.add(new Option("-","-"));       		opts3.add(new Option(s,s));
		if (i==0) opts4.add(new Option("-","-"));				opts4.add(new Option(s,s));
		if (i==0) opts5.add(new Option("-","-"));       		opts5.add(new Option(s,s));
		if (i==0) opts6.add(new Option("-","-"));       		opts6.add(new Option(s,s));
    }
    
    var opts1 = sectForm.getOptions('p1FrMM');
    var opts2 = sectForm.getOptions('p2FrMM');
    var opts3 = sectForm.getOptions('p3FrMM');
    var opts4 = sectForm.getOptions('p1ToMM');
    var opts5 = sectForm.getOptions('p2ToMM');
    var opts6 = sectForm.getOptions('p3ToMM');
    for (i=0; i<60; i+=15) {
		if (i<10)	var s = "0" + i;
		else		var s = "" + i;
		if (i==0) opts1.add(new Option("-","-"));				opts1.add(new Option(s,s));
		if (i==0) opts2.add(new Option("-","-"));       		opts2.add(new Option(s,s));
		if (i==0) opts3.add(new Option("-","-"));       		opts3.add(new Option(s,s));
		if (i==0) opts4.add(new Option("-","-"));				opts4.add(new Option(s,s));
		if (i==0) opts5.add(new Option("-","-"));       		opts5.add(new Option(s,s));
		if (i==0) opts6.add(new Option("-","-"));       		opts6.add(new Option(s,s));
    }
    


    
    function setPer() {
		for (p=1; p<4; p++) {
			per = sectForm.getItemValue("p" + p);
			if (per!="") {
				sectForm.setItemValue("p" + p + "FrHH", per.substr(0,2));
				sectForm.setItemValue("p" + p + "FrMM", per.substr(3,2));
				sectForm.setItemValue("p" + p + "ToHH", per.substr(6,2));
				sectForm.setItemValue("p" + p + "ToMM", per.substr(9,2));
			}
		}
    }
    
    function getPer() {
    	var periods = {};
		for (p = 1; p<4; p++) {
			var temp = "";
			var frHH = sectForm.getItemValue("p" + p + "FrHH");
			var frMM = sectForm.getItemValue("p" + p + "FrMM");
			var toHH = sectForm.getItemValue("p" + p + "ToHH");
			var toMM = sectForm.getItemValue("p" + p + "ToMM");

			if (	(frHH=='-' && (frMM!='-' || toHH!='-' || toMM !='-'))
				||	(frMM=='-' && (frHH!='-' || toHH!='-' || toMM !='-'))
				||	(toHH=='-' && (frHH!='-' || frMM!='-' || toMM !='-'))
				||	(toMM=='-' && (frHH!='-' || frMM!='-' || toHH !='-'))) {
						dhtmlx.alert("Incongruita' periodo " + p );
						return (false);
				}
			
			if (frHH=="-") 
				temp = "";
			else {
				var fr = frHH + ":"  + frMM;
				var to = toHH + ":"  + toMM;
				if (fr >= to) {
					dhtmlx.alert("Periodo " + p + " : 'Inizio' SUCCESSIVO a 'Fine'");
					return(false);
				}
			}
        
        if (frHH!="-") 
			periods[p] =  {fr : frHH + ":" + frMM, to : toHH + ":" + toMM};
		else
			periods[p] =  {fr : "", to : ""};

		}
		var lastEnd = "";
		for (p=1; p<4; p++)	{
			if (periods[p].fr !="") {
				if (periods[p].fr < lastEnd) {
					dhtmlx.alert("Periodo " + p + " inizia Prima di fine Periodo " + (p-1));
					return(false);
				}
				lastEnd = periods[p].to;
				sectForm.setItemValue("p" + p, periods[p].fr + "-" + periods[p].to);
			} else {
				sectForm.setItemValue("p" + p, "");
			}
		}
		
		
     	return(true);
     	
     	
	}
    
    sectLayout.cells("a").showView("def");
    

    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////

    var dpf = new dataProcessor("../cn/sectForm.php");
    dpf.init(sectForm);

    sectForm.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save':
        	   	if (!getPer())	return;
	            if (isNew) dpf.sendData();
	            else       sectForm.save(); //saves the made changes            
	            break;
	            
			case 'canc':
	            sectLayout.cells("a").showView("def");
	            break;
        }
        
	});

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if (action=='error') {
			dhtmlx.alert("Errore Salvando interno. Possibile duplicato?");
			return;
        }
        
        if(action=="inserted"){
            sectGrid.addRow(tid,
                [ 	sectForm.getItemValue("sectName")
            	,	sectForm.getItemValue("p1")
            	,	sectForm.getItemValue("p2")
            	,	sectForm.getItemValue("p3")
            	,	sectForm.getItemValue("sectDescr")
                ]
            ,0);
            sectGrid.selectRowById(tid,false,false,true);
        } else {
            sectGrid.cells(sid,0).setValue(sectForm.getItemValue("sectName"));
            sectGrid.cells(sid,1).setValue(sectForm.getItemValue("p1"));
            sectGrid.cells(sid,2).setValue(sectForm.getItemValue("p2"));
            sectGrid.cells(sid,3).setValue(sectForm.getItemValue("p3"));
            sectGrid.cells(sid,4).setValue(sectForm.getItemValue("sectDescr"));
        }
        sectLayout.cells("a").showView("def");
    });

    
}
