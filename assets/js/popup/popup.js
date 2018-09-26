 //////////////////////////////////////////////////////////////////////////////////////////////////////
/// POPUP  DIV
//////////////////////////////////////////////////////////////////////////////////////////////////////
var popWLast = 0;
var popHLast = 0;

function popupDo(title, content, popW, popH, popL, popT,hideX) {
    var shadowOffset = 8;

    // find the player divs by name
    var divPopOuter = document.getElementById("divPopOuter");
    var divPopShade = document.getElementById("divPopShade");
    var divPopBlank = document.getElementById('divPopBlank');
    var divPopTitle = document.getElementById('divPopTitle');
    var divPopStuff = document.getElementById('divPopStuff');
    
    if (typeof content !== 'undefined') {
        if (popWLast != 0) {
            // alert ('Pop Already Visible!');
            return;
        }
        popWLast = popW;        
        popHLast = popH;

        // Get actual usable screen dimensions
        vp = getViewportSize();
        
        // size the divPopBlank
        divPopBlank.style.height = vp.height + 'px';
        
        // size and place the popDiv

        // if left and top not specified then center it
        if ((typeof popL == 'undefined') || popL == -1) popL = vp.width/2  - (popW / 2);
        if ((typeof popT == 'undefined') || popT == -1) popT = vp.height/2 - (popH / 2);
		if (typeof hideX =='undefined') hideX=false;
        if (hideX)
        	document.getElementById("popupX").style.display = 'none'
        
        divPopOuter.style.left      = popL + 'px';       
        divPopOuter.style.top       = popT + 'px';
        divPopOuter.style.width     = popW + 'px';     
        divPopOuter.style.height    = popH + 'px';

        divPopShade.style.left      = (popL + shadowOffset) + 'px';
        divPopShade.style.top       = (popT + shadowOffset) + 'px';
        divPopShade.style.width     = popW + 'px';     
        divPopShade.style.height    = popH + 'px';
        
        
        // size and set the contents
        divPopStuff.style.height = (popH - 25) + "px";
        if (content!="") divPopStuff.innerHTML = content;
        divPopTitle.innerHTML = "&nbsp;"  + title;
        
        // show divPopBlank and popUp
        divPopBlank.style.display   = 'block';         
        divPopShade.style.display   = 'block';
        divPopOuter.style.display   = 'block';
    
    } else {

        if (popWLast == 0) {
            alert ('Cant unPop inexistant!');
            return;
        }
        popW = popWLast;                 popH = popHLast;
        popWLast = 0;                        
        popHLast = 0;
        
        divPopBlank.style.display   = 'none';
        divPopShade.style.display   = 'none';
        divPopOuter.style.display   = 'none';          
    }        
}

