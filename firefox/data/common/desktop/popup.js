/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

function setup() {
	var reqPassword = vault.init();
	setHidden($('#register_panel'), reqPassword || vault.size() === 0);
	setHidden($('#login_panel'), reqPassword || vault.size() === 0);
	setHidden($('#update_panel'), reqPassword || vault.size() === 0);
	setHidden($('#register_panel'), reqPassword || vault.size() === 0);
	setHidden($('#updatepw_panel'), reqPassword || vault.size() === 0);
	setHidden($('#error1_panel'), reqPassword);
	setHidden($('#error2_panel'), !reqPassword);
	rebind($('[id=options_url]'), 'click', function() { onOptionsClick(); });
	if (reqPassword || vault.size() === 0) return false;

	var idlist = vault.list(), uids = vault.getSorted();
	var lists = [ $("#register_list"), $("#login_list"), $("#update_list1"), $("#update_list2"), $("#updatepw_list") ];
	$.each(lists, function() {
		var options = this;
		options.children().remove();
		uids.forEach(function(uid) { options.append($("<option />").val(uid).text(shorten(idlist[uid].name, 25))); });
	});
	return true;
}	

function setup2() {
	// Error messages should be hidden
	$('#error1_panel').hide();
	$('#error2_panel').hide();
	// Enable/disable register function
	rebindPanel(headers === undefined || headers.register === undefined,
		$('#register_panel'), $('#register'), 'click', function() { onRegisterClick(headers); });
	// Enable/disable login function
	rebindPanel(headers === undefined || headers.login === undefined,
		$('#login_panel'), $('#login'), 'click', function() { onLoginClick(headers); });
	// Enable/disable update function
	rebindPanel(headers === undefined || headers.update === undefined,
		$('#update_panel'), $('#update'), 'click', function() { onUpdateClick(headers); });
	// Enable/disable updatepw function
	rebindPanel(headers === undefined || headers.updatepw === undefined,
		$('#updatepw_panel'), $('#updatepw'), 'click', function() { onUpdatePwClick(headers); });
	// Bind all the options button
	rebind($('[id=options]'), 'click', function() { return onOptionsClick(); });
}

function rebind(elem, event, func) {
	elem.off(event);
	elem.on(event, func);
}

function rebindPanel(status, panel, elem, event, func) {
	if (status) {
		panel.hide();
	} else {
		panel.show();
		rebind(elem, event, func);
	}
}

function setHidden(elem, status) {
	if (status) elem.hide(); else elem.show();
}

function shorten(str, len) {
	if (str.length <= len-1) return str;
	return str.substring(0, len-1) + '\u2026';
}
