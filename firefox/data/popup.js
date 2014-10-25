/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var headers = null, vault = null;

addon.port.on('autosize', function(params) {
	addon.port.emit('resize', { width: $(document).width() + 20, height: $(document).height() + 20 });
});

addon.port.on('init', function(params) {
	headers = params.headers
	vault = new PGIDVault(params.gdata);
	if (setup()) setup2();
});

function onOptionsClick(headers) {
	addon.port.emit('options');
	return false;
}

function onRegisterClick(headers) {
	headers.uid = $('#register_list option:selected').val();
	if (vault.size() === 1) headers.uid = vault.getFirst();
	addon.port.emit('pgid', {cmd: 'register', payload: headers, gdata: vault.data()});
}

function onLoginClick(headers) {
	headers.uid = $('#login_list option:selected').val();
	if (vault.size() === 1) headers.uid = vault.getFirst();
	addon.port.emit('pgid', {cmd: 'login', payload: headers, gdata: vault.data()});
}

function onUpdateClick(headers) {
	headers.ouid = $('#update_list1 option:selected').val();
	headers.nuid = $('#update_list2 option:selected').val();
	if (headers.ouid === headers.nuid) {
		$('#update_list2').css({ 'border': '2px solid red' });
	} else {
		addon.port.emit('pgid', {cmd: 'update', payload: headers, gdata: vault.data()});
	}
}
function onUpdatePwClick(headers) {
	headers.uid = $('#updatepw_list option:selected').val();
	if (vault.size() === 1) headers.uid = vault.getFirst();
	headers.password = $('#updatepw_password').val();
	if (headers.password.length == 0) {
		$('#updatepw_password').css({ 'border': '2px solid red' });
	} else {
		addon.port.emit('pgid', {cmd: 'updatepw', payload: headers, gdata: vault.data()});
	}
}
