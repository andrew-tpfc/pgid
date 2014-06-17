"use strict";

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.cmd) {
		switch(msg.cmd) {
			case 'init':
				sendResponse({
					tabId	 : msg.tabId,
					register : $('link[rel=pgid-register]').eq(0).attr('href'),
					login	 : $('link[rel=pgid-login]').eq(0).attr('href'),
					update	 : $('link[rel=pgid-update]').eq(0).attr('href'),
					updatepw : $('link[rel=pgid-updatepw]').eq(0).attr('href')
				});
				break;
			case 'login':
			case 'register':
				var linkname = 'link[rel=pgid-' + msg.cmd + ']';
				var formhtml = '<form id="pgidform" method="post" action="' + $(linkname).eq(0).attr('href') + '">';
				formhtml += '<input type="hidden" name="cmd" value="' + msg.cmd + '" />';
				formhtml += '<input type="hidden" name="pgid" value="' + msg.pgid + '" />';
				formhtml += '<input type="hidden" name="token" value="' + msg.token + '" />';
				formhtml += '</form>';
				document.body.innerHTML += formhtml;
				$('#pgidform').submit();
				break;
			case 'update':
				var linkname = 'link[rel=pgid-' + msg.cmd + ']';
				var formhtml = '<form id="pgidform" method="post" action="' + $(linkname).eq(0).attr('href') + '">';
				formhtml += '<input type="hidden" name="cmd" value="' + msg.cmd + '" />';
				formhtml += '<input type="hidden" name="opgid" value="' + msg.opgid + '" />';
				formhtml += '<input type="hidden" name="npgid" value="' + msg.npgid + '" />';
				formhtml += '<input type="hidden" name="otoken" value="' + msg.otoken + '" />';
				formhtml += '<input type="hidden" name="ntoken" value="' + msg.ntoken + '" />';
				formhtml += '</form>';
				document.body.innerHTML += formhtml;
				$('#pgidform').submit();
				break;
			case 'updatepw':
				var linkname = 'link[rel=pgid-' + msg.cmd + ']';
				var formhtml = '<form id="pgidform" method="post" action="' + $(linkname).eq(0).attr('href') + '">';
				formhtml += '<input type="hidden" name="cmd" value="' + msg.cmd + '" />';
				formhtml += '<input type="hidden" name="password" value="' + msg.password + '" />';
				formhtml += '<input type="hidden" name="npgid" value="' + msg.npgid + '" />';
				formhtml += '<input type="hidden" name="token" value="' + msg.token + '" />';
				formhtml += '</form>';
				document.body.innerHTML += formhtml;
				$('#pgidform').submit();
				break;
		}
	}
});
