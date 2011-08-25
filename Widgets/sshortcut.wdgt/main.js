/*
Copyright (c) 2009 Ralf Baumbach
sshortcut@ralfbaumbach.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, and/or sublicense copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

[In other words, feel free to use any portion, no matter how large or small, of the code below in your own projects.  You are also welcome to use any of the other files found within the sshortcut.wdgt bundle however you feel fit, provided they are not covered under their own licenses.  You don't need to ask me, or credit me unless you want to, but I am interested in hearing where the code is being used, just to satisfy my curiosity.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var tmpFile;
var gInfoButton, gDoneButton, gConnectButton;
var bookmarks;

function setup()
{
	// init shiny buttons
    gInfoButton = new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "black", "black", showPrefs);
	gDoneButton = new AppleGlassButton(document.getElementById("doneButton"), "Done", hidePrefs);
	gConnectButton = new AppleGlassButton(document.getElementById("connectButton"), "Connect", connectSSH);
	gResetButton = new AppleGlassButton(document.getElementById("resetButton"), "Reset", reset);
	gAddBookmarkButton = new AppleGlassButton(document.getElementById("addBookmarkButton"), "+", addBookmark);
	gRemoveBookmarkButton = new AppleGlassButton(document.getElementById("removeBookmarkButton"), "-", removeBookmark);
	
	// init bookmarks select
	bookmarks = new Bookmarks(getPref('bookmarks', ''));
	updateBookmarkSelect();
	document.getElementById('bookmarks').onchange = function() {
		if (this.value != -1) 	{ setUIValues(bookmarks.getObj(this.value)); }
		else 					{ setUIValues(null); }
	};
	
	// init the rest
	initPreferences();
	updateUI();
	document.getElementById('configuration-footer-link').onclick = function() {
		widget.openURL('http://sshortcut.ralfbaumbach.de');
	};
}

// update the user interface
function updateUI() {
	document.getElementById('keychainCheckbox').style.display = getPref('useKeychain') ? 'block' : 'none';
}

function setUIValues(obj) {
	if (obj !== null) {
		document.getElementById('account').value = obj.account;
		document.getElementById('server').value = obj.server;
		document.getElementById('port').value = obj.port;
	} else {
		document.getElementById('account').value = '';
		document.getElementById('server').value = '';
		document.getElementById('port').value = '';
	}
}

// make a SSH connection
// If the user selected ""
function connectSSH()
{
	
	account  = document.getElementById('account').value;
	server   = document.getElementById('server').value;
	port     = document.getElementById('port').value;
	password = document.getElementById('password').value;
	addToKeychain = document.getElementById('addToKeychain').checked;
	
	alreadyInKeychain = false;
	
	// if nothing given, do nothing
	if (account == '' || server == '') {
		return false;
	}
	
	// construct basic ssh connect command
	connectCommand = 'ssh ' + account + '@' + server;
	if (port != '') {
		connectCommand += ' -p ' + port;
	}
	
	// verify that the server is accessible
	if (!verifyNetworkAccess(server)) {
		widget.system(makeTerminalCommand(connectCommand), null);
		return false;
	}
	
	// check if we should try to use password from keychain
	if (getPref('useKeychain') && password == '') {
		command = '/usr/bin/security find-internet-password';
		command+= ' -ga ' + account;
		command+= ' -s ' + server;
		command+= ' -P ' + port;
		keychainObject = widget.system(command, null);
		
		// if we get a positive response from keychain we will set the password
		if (keychainObject.status == 0) {
			password = keychainObject.errorString
			password = password.replace(/"/g, '');
			password = password.replace(/\n/g, '');
			password = password.replace('password: ', '');
			alreadyInKeychain = true;
		}
	}
	
	// if we have a password we will use expect to communicate with the ssh connection
	if (password != '') {
		// construct expect script
		expectFile = '#!./expect -f\n';
		expectFile+= 'set timeout -1\n';
		// expectFile+= 'set env(TERM) "xterm"\n';
		expectFile+= 'spawn -noecho ' + connectCommand + '\n';
		expectFile+= 'expect "*?assword: "\n';
		expectFile+= 'send -- "' + password + '\r"\n';
		expectFile+= 'interact';
		// write the script into a temporary file
		tmpFile = getTempName();
		widget.system("echo '" + expectFile + "' > " + tmpFile, null);
		// construct the command for executing the expect script
		command ="/usr/bin/expect -f " + tmpFile;
	} else {
		// otherwise we will just attempt a normal connection and the user has to enter the passsword manually.
		command = connectCommand;
	}
	
	// let's do it
	result = widget.system(makeTerminalCommand(command), null);
	window.setTimeout("removeTempFile()", 10000);
	
	// shall we add a used password to the keychain?
	if (getPref('useKeychain') && addToKeychain && !alreadyInKeychain && password != '') {
		command = '/usr/bin/security add-internet-password';
		command+= ' -a ' + account;
		command+= ' -s ' + server;
		command+= ' -P ' + port;
		command+= ' -r ssh';
		command+= ' -w ' + password;
		keychainObject = widget.system(command, null);
	}
	
	return false;
}

// reset the input fields
function reset() {
	document.getElementById('account').value = '';
	document.getElementById('server').value = '';
	document.getElementById('port').value = '';
	document.getElementById('password').value = '';
	document.getElementById('bookmarks').value = -1;
}

// checks if network is accessible
// there is probably a better way to do this
function verifyNetworkAccess(server)
{
	command = '/sbin/ping -c 1 ' + server;
	result = widget.system(command, null);
	return result.status == 0;
}

function removeTempFile()
{
	widget.system('/bin/rm ' + tmpFile, null);
}

// create a temporary file as argument for the expect command
function getTempName()
{
	var date = new Date();
	return '/tmp/' + date.getTime() + '.exp';
}

function makeTerminalCommand(command)
{
	return 'osascript -e "tell application \\"Terminal\\" to do script \\"' + command + '\\"" -e "activate application \\"Terminal\\""';
}

function addBookmark() {
	account  = document.getElementById('account').value;
	server   = document.getElementById('server').value;
	port     = document.getElementById('port').value;
	index = bookmarks.add(account, server, port);
	setPref('bookmarks', bookmarks.getString());
	updateBookmarkSelect(index);
}

function removeBookmark() {
	bookmarks.remove(document.getElementById('bookmarks').value);
	setPref('bookmarks', bookmarks.getString());
	updateBookmarkSelect();
	setUIValues(null);
}

function updateBookmarkSelect(index) {
	document.getElementById('bookmarks').innerHTML = '<option value="-1">Bookmarks</option>';
	document.getElementById('bookmarks').innerHTML += bookmarks.toOptions();
	if (typeof index != 'undefined') {
		document.getElementById('bookmarks').value = index;
	}
}

// retrieve a preference
function getPref(key, defaultValue)
{
	value = widget.preferenceForKey(key);
	if (!value && typeof defaultValue != 'undefined')
		return defaultValue;
	if (value == 'true')
		return true;
	if (value == 'false')
		return false;
	return value;
}

// set a preference
function setPref(key, value)
{
	if (value === true)
		widget.setPreferenceForKey('true', key);
	else if (value === true)
		widget.setPreferenceForKey('false', key);
	else
		widget.setPreferenceForKey(value, key);
}

// init the options on the configuration pane
function initPreferences()
{
	document.getElementById('useKeychain').checked = getPref('useKeychain');
}

// save preferences and update user interface
function savePreferences()
{
	setPref('useKeychain', document.getElementById('useKeychain').checked);
	updateUI();
}

// show preference pane
function showPrefs()
{

    var front = document.getElementById("front");
    var back = document.getElementById("back");
 
	if (window.widget) {
		widget.prepareForTransition("ToBack");
 	}
		
    front.style.display="none";
    back.style.display="block";
 
    if (window.widget){
        setTimeout ('widget.performTransition();', 0);
		widget.setCloseBoxOffset(13,14);
    }
}

// hide preference pane
function hidePrefs()
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");
	
	if (window.widget) {
		widget.prepareForTransition("ToFront");
 	}

    back.style.display="none";
    front.style.display="block";
	
    if (window.widget) {
        setTimeout ('widget.performTransition();', 0);
		widget.setCloseBoxOffset(7,9);
	}
	
}

// bookmark object
Bookmarks = function(bookmarkString) {
	
	var me = this;
	
	me.list = new Array();
	me.string = bookmarkString;
	
	// get initial bookmark string
	if (me.string != '')
		me.list = me.string.split(';');
	
	me.getString = function() {
		me.string = me.list.join(';');
		return me.string;
	};
	
	me.makeString = function(obj) {
		return obj.account + '@' + obj.server + ':' + obj.port;
	};
	
	me.getObjFromString = function(str) {
		tmp = str.split('@');
		account = tmp[0];
		tmp = tmp[1].split(':');
		server = tmp[0];
		port = tmp[1];
		return me.makeObj(account, server, port);
	};
	
	me.makeObj = function(account, server, port) {
		return {'account': account, 'server': server, 'port': port};
	};
	
	me.has = function(account, server, port) {
		return me.string.indexOf(me.makeString(me.makeObj(account, server, port))) != -1;
	};
	
	me.add = function(account, server, port) {
		if (account == '' || server == '') return false;
		if (me.has(account, server, port)) return me.getIndex(me.makeObj(account, server, port));
		index = me.list.length;
		me.list[index] = me.makeString(me.makeObj(account, server, port));
		return index;
	};
	
	me.remove = function(i) {
		newlist = new Array();
		count = 0;
		for (j = 0; j < me.list.length; j++) {
			if (j != i) {
				newlist[count] = me.list[j];
				count++;
			}
		}
		me.list = newlist;
	};
	
	me.getIndex = function(obj) {
		for (i = 0; i < me.list.length; i++) {
			listItem = me.list[i];
			if (listItem == me.makeString(obj)) { return i; }
		}
		return -1;
	};
	
	me.getObj = function(i) {
		return me.getObjFromString(me.list[i])
	};
	
	me.toOptions = function() {
		options = '';
		
		if (me.list.length == 0 )
			return;
		
		me.sort();
		
		for (i = 0; i < me.list.length; i++) {
			options += '<option value=' + i + '>' + me.list[i] + '</option>';
		}
		return options;
	};
	
	me.sort = function() {
		sorting = true;
		objList = new Array();
		
		for (i = 0; i < me.list.length; i++) {
			objList[i] = me.getObjFromString(me.list[i]);
		}
		
		objList.sort(me.sortCallbackFunc);
		
		for (i = 0; i < objList.length; i++) {
			me.list[i] = me.makeString(objList[i]);
		}
	};
	
	me.sortCallbackFunc = function(a,b){

		if (a.server == b.server) {

			if(a.account == b.account)
				return 0;

			return (a.account < b.account) ? -1 : 1;
		}
		
		return (a.server < b.server) ? -1 : 1;
	};
}
