/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var headers = null, vault = null;

$(document).ready(function() {
	chrome.runtime.getBackgroundPage(function(bg) {
		vault = bg.vault;
		if (setup()) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { tabId: tabs[0].id, cmd: 'get-headers' }, getHeaders);
			});
		}
	});
});

function getHeaders(val) {
	headers = val;
	setup2();
}

function onOptionsClick(evt) {
	var optionsUrl = chrome.extension.getURL('@options.html');
	chrome.tabs.query({url: optionsUrl}, function(tabs) {
		if (tabs.length) chrome.tabs.update(tabs[0].id, {active: true});
		else  chrome.tabs.create({url: optionsUrl});
    });
}

function onRegisterClick(headers) {
	headers.uid = $('#register_list option:selected').val();
	if (vault.size() === 1) headers.uid = vault.getFirst();
	chrome.extension.sendMessage({cmd: 'register', payload: headers});
	hidePopup();
}

function onLoginClick(headers) {
	headers.uid = $('#login_list option:selected').val();
	if (vault.size() === 1) headers.uid = vault.getFirst();
	chrome.extension.sendMessage({cmd: 'login', payload: headers});
	hidePopup();
}

function onUpdateClick(headers) {
	headers.ouid = $('#update_list1 option:selected').val();
	headers.nuid = $('#update_list2 option:selected').val();
	if (headers.ouid === headers.nuid) {
		$('#update_list2').css({ 'border': '2px solid red' });
	} else {
		chrome.extension.sendMessage({cmd: 'update', payload: headers});
		hidePopup();
	}
}

function onUpdatePwClick(headers) {
	headers.uid = $('#updatepw_list option:selected').val();
	if (vault.size() === 1) headers.uid = vault.getFirst();
	headers.password = $('#updatepw_password').val();
	if (headers.password.length == 0) {
		$('#updatepw_password').css({ 'border': '2px solid red' });
	} else {
		chrome.extension.sendMessage({cmd: 'updatepw', payload: headers});
		hidePopup();
	}
}

function hidePopup() {
	window.close();
}
