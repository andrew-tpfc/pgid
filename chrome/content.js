/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.cmd) {
		switch(msg.cmd) {
			case 'get-headers':
				sendResponse({
					tabId	 : msg.tabId,
					register : $('link[rel=pgid-register]').eq(0).attr('href'),
					login	 : $('link[rel=pgid-login]').eq(0).attr('href'),
					update	 : $('link[rel=pgid-update]').eq(0).attr('href'),
					updatepw : $('link[rel=pgid-updatepw]').eq(0).attr('href')
				});
				break;
			case 'show-loader':
				showLoader(msg.status);
				break;
			case 'register':
			case 'login':
			case 'update':
			case 'updatepw':
				var linkname = 'link[rel=pgid-' + msg.cmd + ']';
				var formhtml = '<form id="pgidform" method="post" action="' + $(linkname).eq(0).attr('href') + '">';
				Object.keys(msg).forEach(function(key) {
					formhtml += '<input type="hidden" name="' + key + '" value="' + msg[key] + '" />';
				});
				formhtml += '</form>';
				document.body.innerHTML += formhtml;
				$('#pgidform').submit();
				break;
		}
	}
});
