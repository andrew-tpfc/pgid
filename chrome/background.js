/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var vault = null, pgid = null, gdata = { cryptkey: {}, cryptlist: {}, plainlist: {} };
vault = new PGIDVault(gdata)
vault.save = function() { chrome.storage.local.set({'idlist': this.data().cryptlist}) }
chrome.storage.local.get('idlist', function(val) { gdata.cryptlist = val['idlist']; });
pgid = new PGIDCore(vault);

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
	if (change.status === 'complete') chrome.tabs.sendMessage(tabId, { tabId: tabId, cmd: 'get-headers' }, onTabUpdated);
});

chrome.tabs.onActivated.addListener(function(info) {
	chrome.tabs.sendMessage(info.tabId, { tabId: info.tabId, cmd: 'get-headers' }, onTabUpdated);
});

function onTabUpdated(msg) {
	// Decide whether we want to show page action icon when tab is activated or updated based on declarations in HTML content
	if (msg !== undefined && (msg.register !== undefined || msg.login !== undefined || msg.update !== undefined || msg.updatepw !== undefined)) {
		chrome.pageAction.show(msg.tabId);
	}
}

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	switch(msg.cmd) {
		case 'login':
		case 'register':
			pgid.registerOrLogin(msg.cmd, msg.payload, showLoaderFunc, responseCallback);
			break;
		case 'update':
			pgid.update(msg.cmd, msg.payload, showLoaderFunc, responseCallback);
			break;
		case 'updatepw':
			pgid.updatePw(msg.cmd, msg.payload, showLoaderFunc, responseCallback);
			break;
	}
});

function showLoaderFunc(show) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { cmd: 'show-loader', status: show });
	});
}

function responseCallback(msg) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, msg);
	});
}
