
var stretcher;
var state = 0;
var nRun;

function loaded () {
	stretcher = new Stretcher(document.getElementById('front'), 130, 310, doScroll);
	state = 0;
        updatePrefixStats();
}

function waiting () {
    document.getElementById('content').innerHTML = '<br />&nbsp;<br /><center><span class="answerBody">Waiting for Prefix WhoIs...</span><br />&nbsp;<br /></center>';
}

// Update one of the widget's status elements
function setMessage(element, message) {
    var stat_element = document.getElementById(element);
    stat_element.innerHTML = message;
}

function updatePrefixStats() {
        req = new XMLHttpRequest();
        url = "http://pwhois.org/simplequery.who?q=version&widget=1&stats=1";
        req.open("POST", url ,false);
        req.send(null);
        response = req.responseText;
        output = req.responseText;
        beginAnswerEn = output.lastIndexOf("<!-- Begin Result -->");
        endAnswerEn = output.indexOf("<!-- End Result -->");
        output = output.substring(beginAnswerEn,endAnswerEn);
        setMessage("pcountOutput",output);
}

function processRequest(searchTerm) {        
	req = new XMLHttpRequest();    
	url = "http://pwhois.org/simplequery.who?widget=1&q=" + searchTerm;    
	req.open("POST", url ,false);    
	req.send(null);        
	response = req.responseText;		
	output = req.responseText; 
	beginAnswerEn = output.lastIndexOf("<!-- Begin Result -->");    
	endAnswerEn = output.indexOf("<!-- End Result -->");    
	output = output.substring(beginAnswerEn,endAnswerEn);
        document.getElementById('content').innerHTML = output;    
}

function mangleStr(strToMangle) {
    strToMangle = strToMangle.replace(/ /g, "");
    strToMangle = strToMangle.replace("-", " -");
    document.getElementById('searchInput').value = strToMangle;
    processRequest(strToMangle);
    doScroll();
}

function doScroll() {
	// toggleDebug();  // uncomment this line for debug output
	scrollerInit(document.getElementById("myScrollBar"), document.getElementById("myScrollTrack"), document.getElementById("myScrollThumb"));
	calculateAndShowThumb(document.getElementById('content'));

}

function onHide () {
	
}

function onShow() {
        // Update prefix count
        updatePrefixStats();
}

function onRemove() {
        if (widget.window) {
                setPreferenceForKey(null,uniqueKey("someVar"));
        }
}

function onBlur() {
	if ( nRun == 1 && state == 1) {
                stretcher.stretch(event);
                document.getElementById('searchInput').value = "";
                state = 0;    
	}
}

function visitPwhois () {
	widget.openURL('http://pwhois.org/');
}

if (window.widget) {
        widget.onhide = onHide();
        widget.onshow = onShow();
     	widget.onremove = onRemove();
	window.onblur = onBlur(); 
}

