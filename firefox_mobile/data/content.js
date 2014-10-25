/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

self.port.on('set-popup-gdata', function(gdata) {
	var vault = new PGIDVault(gdata);
	vault.init();
	self.port.emit('refresh-gdata', vault.data());
});

self.port.on('get-headers', function(gdata) {
	var msg = {
		register : $('link[rel=pgid-register]').eq(0).attr('href'),
		login	 : $('link[rel=pgid-login]').eq(0).attr('href'),
		update	 : $('link[rel=pgid-update]').eq(0).attr('href'),
		updatepw : $('link[rel=pgid-updatepw]').eq(0).attr('href')
	};
	self.port.emit('headers', msg);
});

self.port.on('pgid', function(msg) {
	var pgid = new PGIDCore(new PGIDVault(msg.gdata));
	switch(msg.cmd) {
		case 'login':
		case 'register':
			pgid.registerOrLogin(msg.cmd, msg.payload, showLoader, responseCallback);
			break;
		case 'update':
			pgid.update(msg.cmd, msg.payload, showLoader, responseCallback);
			break;
		case 'updatepw':
			pgid.updatePw(msg.cmd, msg.payload, showLoader, responseCallback);
			break;
	}
});

function responseCallback(msg) {
	var linkname = 'link[rel=pgid-' + msg.cmd + ']';
	var formhtml = '<form id="pgidform" accept-charset="utf-8" method="post" action="' + $(linkname).eq(0).attr('href') + '">';
	Object.keys(msg).forEach(function(key) {
		formhtml += '<input type="hidden" name="' + key + '" value="' + msg[key] + '" />';
	});
	formhtml += '</form>';
	document.body.innerHTML += formhtml;
	$('#pgidform').submit();
}

