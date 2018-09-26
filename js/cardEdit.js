function cardEdit(winpos) {

    var cardId = 0;
    var currVisuserId = 0;
	
    // WINDOW ///////////////////////////////////////////////////////////////
    
    var winId = "cardWin";
    if (winAlready(winId))
            return;
    
	var wp = winpos || null;	
    if (wp==null)
    	cardWin  = dhxWins.createWindow(winId, 40, 40, 780, 480);
    else
    	cardWin  = dhxWins.createWindow(winId, wp.l, wp.t, wp.w, wp.h);            
    
   
    cardWin.setText("Anagrafica Tessere");
    cardWin.attachEvent("onClose", function(win){
        return(true);
    });
    	
    // LAYOUT ///////////////////////////////////////////////////////////////
    
    cardLayout = new dhtmlXLayoutObject(cardWin,"1C");
    cardLayout.cells("a").hideHeader();

    // TOOLBAR ///////////////////////////////////////////////////////////////

    cardToolbar = cardLayout.cells("a").attachToolbar();
    cardToolbar.setIconsPath("../assets/DHTMLX46/icons/");

    cardToolbar.addButton("tNew",1,"Nuova","plus.ico","");   
    cardToolbar.addButton("tDel",2,"Elimina","minus.ico",""); 

    cardToolbar.attachEvent("onClick", function(id) {
        switch (id) {
            case "tNew" :
		        cardId = 0;
		        cardForm.clear();
		        cardLayout.cells("a").showView("form");
                break;

            case "tDel" :
                var cardId = cardGrid.getSelectedRowId();
                if (cardId==null)
                	dhtmlx.alert("Nessuna Tessera selezionata");
                
				var card = cardGrid.cells(cardId,0).getValue();
                
				dhtmlx.confirm({
	                    title:"Eliminazione Tessera"
	                ,    ok:"Si", cancel:"No"
	                ,    text:"Sicuro di voler eliminare questa tessera?"
	                ,    callback:function(result){
                    		if (result) {
                    			var ret = AGP(wsURL, {action:"CARD_DELETE", card:card});
                    			if (ret.status!=0) {
									dhtmlx.alert(ret.errMsg);
									return;
                    			}
                    			cardGrid.deleteRow(cardId);
							}
	                    }
	                });	
                
                // bamCatsDel();
                break;
        }
    });
                
    
    // GRID ///////////////////////////////////////////////////////////////

    cardGrid = cardLayout.cells("a").attachGrid();
    cardGrid.setHeader("Seriale,Abilitata,Cod.Orig,Cod.Breve,Data Creazione,Associata a,Note");
    cardGrid.setColumnIds("serial,enabled,pinOrig,pin,dtCreate,dettName,notes");
    cardGrid.attachHeader("#text_filter,#select_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
    cardGrid.setColSorting("str,str,str,str,str,str,str");

    cardGrid.setInitWidths("50,60,100,80,140,150,*");
    cardGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro");
    // cardGrid.enableSmartRendering(true);
    cardGrid.init();
    cardGrid.load("../cn/cardGrid.php");

    cardGrid.attachEvent("onRowDblClicked", function(rId,cInd){
        cardId = rId;
        cardForm.clear();
		cardLayout.cells("a").showView("form");
        cardForm.load("../cn/cardForm.php?id="+rId, function(id, response) {
        });        
    });  
    
    // FORM ///////////////////////////////////////////////////////////////
    
    var cardFormData = [

	,	{type:'label',     label:'Seriale',   			position:'absolute',    labelTop:5,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'serial',     			position:'absolute',    inputTop:7,    inputLeft: 110,    	inputWidth:80, maxLength:10}
    
    ,	{type:'label',     label:'Abilitata',    	position:'absolute',    labelTop:45,    labelLeft: 5, 		labelWidth: 200}
    ,   {type: 'checkbox',  name: 'enabled',			position:'absolute',    inputTop:47,    inputLeft: 110}
    
    
    ,	{type:'label',     label:'Cod. Orig.',   		position:'absolute',    labelTop:85,		labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'pinOrig',     			position:'absolute',    inputTop:87,     inputLeft: 110,    	inputWidth:140, maxLength:20}
    
	,	{type:'label',     label:'Cod. Compatto',   	position:'absolute',    labelTop:125,	labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'pin',     				position:'absolute',    inputTop:127,    inputLeft: 110,    	inputWidth:80, maxLength:10, readonly:true, className:"inputRO" }

	
	,	{type:'label',     label:'Data Crea',   		position:'absolute',    labelTop:165,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'dtCreate',     		position:'absolute',    inputTop:167,    inputLeft: 110,    	inputWidth:140, maxLength:20, readonly:true, className:"inputRO"}


    ,	{type:'label',     label:'Note',    			position:'absolute',    labelTop:205,    labelLeft: 5, 		labelWidth: 200}
	,	{type:'input',     name:'notes',     			position:'absolute',    inputTop:207,    inputLeft: 110,    	inputWidth:500, maxLength:50, rows:5 }
    
        
    ,	{type:'button', id:'btCanc', name:'canc', value:'Annulla',  position:'absolute',    inputTop:320,     inputLeft: 110,    width: 100}
    ,	{type:'button', id:'btCont', name:'cont', value:'Continua', position:'absolute',    inputTop:320,     inputLeft: 400,    width: 100}
    ,	{type:'button', id:'btSave', name:'save', value:'Salva',    position:'absolute',    inputTop:320,     inputLeft: 508,    width: 100}

    ];

    
    cardLayout.cells("a").showView("form");
    cardForm = cardLayout.cells("a").attachForm(cardFormData);    
    document.getElementsByName("pin")[0].style.backgroundColor="#e0e0e0";
    document.getElementsByName("dtCreate")[0].style.backgroundColor="#e0e0e0";
    
    cardForm.attachEvent("onChange", function (name, value){
    	if (name=='pinOrig') 
    		compactPin(value);
	});

	function compactPin(pinOrig)	{
		var ret = AGP(wsURL, {action:"COMPACT_UID", uid:pinOrig});
		if (ret.status!=0)	{
			dhtmlx.alert(ret.errMsg);
			return;
		}
		cardForm.setItemValue("pin", ret.compact);
		return(ret.compact);
    }

    
    cardLayout.cells("a").showView("def");
    

    // SAVING AND UPDATING      ///////////////////////////////////////////////////////////////
    var dpf = new dataProcessor("../cn/cardForm.php");
    dpf.init(cardForm);

    cardForm.attachEvent("onButtonClick", function(cmd) {
        switch(cmd) {
        	case 'save' :
        	case 'cont' : 
				var pinOrig = cardForm.getItemValue("pinOrig");
				var	pin  = compactPin(pinOrig);
				var ret = AGP(wsURL, {
							action	:	"SAVE_CARD"
						,   cardId	:	cardId
						,	enabled	:	cardForm.getItemValue("enabled")
						,	pinOrig : 	pinOrig
						,	pin		:	pin
						,	serial	:	cardForm.getItemValue("serial")
						,	notes	:	cardForm.getItemValue("notes")
				});
				if (ret.status!=0)	{
					dhtmlx.alert(ret.errMsg);
					return;
				}
	            if(cmd=='save')
	            	cardLayout.cells("a").showView("def");
				
				if ( cardId==0) {
					cardGrid.addRow(ret.cardId,[ 	
						cardForm.getItemValue("serial")
					,	cardForm.getItemValue("enabled")== 1 ? "SI" : "NO"
					,	pinOrig
					,	pin
					,	ret.dtCreate
					,	''
					,	cardForm.getItemValue("notes")
                	],0)					
					cardGrid.selectRowById(ret.cardId,false,false,true);
				} else {
					cardGrid.cells(cardId,0).setValue(cardForm.getItemValue("serial"));
            		cardGrid.cells(cardId,1).setValue(cardForm.getItemValue("enabled")== 1 ? "SI" : "NO");
            		cardGrid.cells(cardId,2).setValue(pinOrig);
            		cardGrid.cells(cardId,3).setValue(pin);
            		cardGrid.cells(cardId,4).setValue(ret.dtCreate);
            		cardGrid.cells(cardId,6).setValue(cardForm.getItemValue("notes"));
				}
	            if(cmd=='save')
	            	cardLayout.cells("a").showView("def");
	            else {
					cardForm.clear();
	            }
	            break;
	            
			case 'canc':
	            cardLayout.cells("a").showView("def");
	            break;
        }
        
	});

    dpf.attachEvent("onAfterUpdate",function(sid,action,tid,xml_node){
        
        if (action=='error') {
			dhtmlx.alert("Errore Salvando. Possibile duplicato?");
			return;
        }
        
        
        if(action=="inserted"){
            cardGrid.addRow(tid,
                [ 	cardForm.getItemValue("card")
            	,	cardForm.getItemValue("descr")
            	,	tznDescr
                ]
            ,0);
            cardGrid.selectRowById(tid,false,false,true);
        } else {
            cardGrid.cells(sid,0).setValue(cardForm.getItemValue("card"));
            cardGrid.cells(sid,1).setValue(cardForm.getItemValue("descr"));
            cardGrid.cells(sid,2).setValue(tznDescr);
        }
        cardLayout.cells("a").showView("def");
    });

    
}
