/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var menuId = null, badgeId = null, gdata = { cryptkey: {}, cryptlist: {}, plainlist: {} };

var selfdata = require('sdk/self').data;
var tabs = require('sdk/tabs');
var sstore = require('sdk/simple-storage');
var {Cu} = require('chrome');

gdata.cryptlist = sstore.storage['idlist'];

exports.main = function(options, callbacks) {
	switch(options.loadReason) {
		case 'install':
		case 'enable':
		case 'startup':
		case 'upgrade':
		case 'downgrade':
			menuId = window.NativeWindow.menu.add({
				name: 'Pretty Good ID',
				callback: function() { showDoorHanger(); }
			});
			break;
	}
};

exports.onUnload = function(reason) {
	switch(reason) {
		case 'uninstall':
		case 'disable':
		case 'shutdown':
		case 'upgrade':
		case 'downgrade':
			window.NativeWindow.menu.remove(menuId);
			break;
	}
};

Cu.import('resource://gre/modules/Services.jsm');
var window = Services.wm.getMostRecentWindow('navigator:browser');

if (window.BrowserApp.deck) {
	addPageLoadListener();
} else {
	window.addEventListener('UIReady', function onUIReady(){
		window.removeEventListener('UIReady', onUIReady, false);
		addPageLoadListener();
	}, false);
}

function addPageLoadListener() {
	window.BrowserApp.deck.addEventListener('pagehide', function() { showBadge(false); }, false);
	window.BrowserApp.deck.addEventListener('TabSelect', function(evt) { checkBadge(tabs.activeTab.headers); }, false);
}

var pageMod = require('sdk/page-mod').PageMod({
	include: [ 'http://*', 'https://*' ],
	contentScriptFile: [
		selfdata.url('ext/jquery-2.1.1.min.js'),
		selfdata.url('ext/jsencrypt-2.1.0.min.js'),
		selfdata.url('ext/cryptojs-3.1.2/rollups/sha1.js'),
		selfdata.url('ext/cryptojs-3.1.2/rollups/aes.js'),
		selfdata.url('common/vault.js'),
		selfdata.url('common/utils.js'),
		selfdata.url('common/core.js'),
		selfdata.url('content.js')
	],
	attachTo: ['existing', 'top'],
	onAttach: function(worker) {
		worker.port.emit('set-popup-gdata', gdata);
		worker.port.on('refresh-gdata', function(newgdata) {
			gdata = newgdata;
		});
		worker.port.emit('get-headers');
		worker.port.on('headers', function(headers) {
			worker.tab.headers = headers;
			worker.tab.cscript = worker;
			checkBadge(headers);
		});
	}
});

// Badge
function checkBadge(headers) {
	showBadge(headers !== undefined &&
		(headers.register !== undefined || headers.login !== undefined || headers.update !== undefined || headers.updatepw !== undefined));
}

function showBadge(visible) {
	if (visible) {
		if (badgeId !== null) return;
		badgeId = window.NativeWindow.pageactions.add({
			icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAGTklEQVR42uVXW1CVVRQ+MzlqOZXSWKSmzPTSQz041Vu9JGnaNGNOOs5ohDgSBTWmHAElxDCLaHKUoMTwgMglmLiOd24qcpGrFxBvKMhN7rcjlwN8rW+fs4/nmDX1Es10Zr7Z/7/3/tf61lrfXhsMAAxTCcOUExgfHzdMTk7+65iYmFDj1GdgxYoVhn379s3Iz8/vyM3Nxd9BXl6ewl+tOUJs258LCgpw7NixRplLVAQ8PT0f44b+/n4MDAxgcHBQMCDvffLebxv1vDM4r8Hvib6+PvT29qK7u1uhq6sLnZ2d6OjoULh3756aI5EjR47AkJCQUHH//n38k5/Uz46xsTGMjo7aMTQ0pEj09PQoOJIgSIDj8PAwIiMjYTh06FAjmYsgxOA4JsXBYH8Pckyh+CV0LTIOBKK3q1U5togzOtQkLBaLGmlMOxdRgwFpEiSgM0Dn7e3taGtrUxmMi4t7QEAbHRk240fj2zjgsxBZoa9hv5crIj55HQO9Xco491RUVKClpQUNDQ04ceKEcnz37l2YzWZER0cjLS1V3pvQ3NwszlqVYw1HArGxsTCYTKZG1nByckKRKC9Iw17P53E9cQ3qTO8h77s3sWftbORnRFuzYBlDeHg4AgICEBISAm9vb4SGhsLPzw+XLl2Cl5cXwsK+wrZtRgQHB8HDYx0qK6tURtra2u0ESFqCtxJQGRACLEOBOPrJxw1lUe4oi3wLmcGv4IePnkN2bIhaZ0SnT59Wij558qTKBkV89uxZFXFSUpJN+QXIyclGSkoyrl2rRU93pzhvezQBxww01Fdix8pn8Fvwq/g14CUkGV/Gl6vmoK6yUK0PDQ06CVKXhXpgCbQwtS5GR8fkVPSIBtqdyvCHDDA6s3kQ20Pfx6b1z2LH6rkI91iEnWtdseEDF3wd4YWRkRHZMyTi6kZjYyNu376NO3fuqJF64Hjz5k3cuHHDjuvXr8neJnHcoUrA6FtbW5UG7ATIkL/E5Ais2zgbxrAF2Og7HR4fzoCn9wxs3bkIqz2eRnrmAbWvpaUZZWVluHDhggKfS0tLFUpKShSKi4tx/vx5nDlzBhcvXlSR0zHFy1I5EaBAmAHj9nfw6dYF2OA7DT7+j8N763T4Brgg6qAnfP1flPXlkoUxlQGqvqmpSWWCWXDMxK1btxToiA7p2NE5v2XZHTLQKwQAY9ByePrMw6bNLvDyewIbP5slZGbB5wtXmV8A381vSG1HlQFGqCPV0RJFRUUKFCVJMHJHxwRJ2wmwDzAiiqegMB0r17iIs/nw+NjVCm9XRerdVU9JCWIwOmKRxtKhaqkNa+MPZ4Trjs4d16k7pxJQtWOjFlTXFCEu4RuYDu+GKX43YuPC5HkPSstyRblmaaudNnQ59XcqWx8xnW4dLR0/XCYSsDciloDt03qMHhwxlsX6ADlOFqdLhiBxtlm2XN3nHYkQfKZjktKZIAHactIAVVlfX6+OTmlpiTo+RElJMa5cuYza2loZryhj3HP16lVVa85zrKqqUmqvqalBdXW1Ak8Hbz1mgM1Kn5C6ujrnEpAAo0hOTkZWVhYCAwOli+Xg6NGjCAoKQmJiIlJTUxEfH68MsBOmp6fDaDRK309Te2JiYlQX5BUrN6z6JioqSu1h9P7+/ur2Y9p5dNmIVAmsIrRenSkpKUrRNFReXq420hCjKCwsVH9wkD2jZdR0dO7cOUWMbZn7Tp06pQgy4oyMDOWEGWC0DE4CVu3b6TLS1ybZUyQ0ToM6hXymU0Z//PhxBRKlwezsbDWfmZmpQOLMHoNhY2IW+c5AWBYSqaysfDQBnluK5PJla82pCdadtWWL5Rw/JhnuoTOC68wWHfJGZITMDOf5zG/YI7hGjWgNKAK7du3Kp6B4mRC8SNgTeMnwnSPBi4Vreo9+56gvHutdYVYnyvFZv7PujJzzDDQiIgIGNzc3w5YtW5TIKEKCGtBg6giWRwvsz8B1vZ/QNrRdloWgLwp38eLF8lfpg9/ngu8FewX7BVGCnwUxgliBSXBYcESQJEgWpDggybbGPXG2bw7abETZbO61+fhWsF55XbZsmWHp0qWGJUuWGNzd3R0xTTBT8KRgjmCuwFUwT/CCYKFgkQ0LbXPzbXu418X27UybLbtt+qJf4r/xr9lUwvC//+/4d7opTdrHY+0lAAAAAElFTkSuQmCC',
			title: 'My page action',
			clickCallback: function() { showDoorHanger(); }
		});
	} else {
		if (badgeId !== null) {
			window.NativeWindow.pageactions.remove(badgeId);
			badgeId = null;
		}
	}
}

// Door Hanger
function showDoorHanger() {
	let headers = tabs.activeTab.headers;
	let buttons = [];

	if (tabs.activeTab.headers !== undefined && tabs.activeTab.headers.login !== undefined && Object.keys(gdata.plainlist).length > 0) {
		buttons.push({ label: 'Login', callback: onLoginClicked });
	}
	if (tabs.activeTab.headers !== undefined && tabs.activeTab.headers.register !== undefined && Object.keys(gdata.plainlist).length > 0) {
		buttons.push({ label: 'Register', callback: onRegisterClicked });
	}
	if (tabs.activeTab.headers !== undefined && tabs.activeTab.headers.update !== undefined && Object.keys(gdata.plainlist).length > 1) {
		buttons.push({ label: 'Update', callback: onUpdateClicked });
	}
	if (tabs.activeTab.headers !== undefined && tabs.activeTab.headers.updatepw !== undefined && Object.keys(gdata.plainlist).length > 0) {
		buttons.push({ label: 'Update', callback: onUpdatePwClicked });
	}
	buttons.push({ label: 'Options', callback: function () { onOptionsClicked(); }});
	
	if (Object.keys(buttons).length < 2) return onOptionsClicked();
	
	window.NativeWindow.doorhanger.show('Pretty Good ID', 'pgid', buttons, window.BrowserApp.selectedTab.id, { persistence: 1 })
}

// Login
Cu.import('resource://gre/modules/Prompt.jsm');

function getSortedNames() {
	var sortedNames = new Array();
	for (var id in gdata.plainlist) sortedNames.push(gdata.plainlist[id].name);
	return sortedNames.sort();
}

function onRegisterClicked() {
	var sortedNames = getSortedNames();
	if (Object.keys(gdata.plainlist).length == 1) return pgidRegister(sortedNames, 0);
	let prompt = new Prompt({ window: window, title: 'Register', buttons: ['Register', 'Cancel'] });
	prompt.addMenulist({ values: sortedNames });
	prompt.show(function(data) { if (data.button === 0) pgidRegister(sortedNames, data.menulist0); })
}

function onLoginClicked() {
	var sortedNames = getSortedNames();
	if (Object.keys(gdata.plainlist).length == 1) return pgidLogin(sortedNames, 0);
	let prompt = new Prompt({ window: window, title: 'Login', buttons: ['Login', 'Cancel'] });
	prompt.addMenulist({ values: sortedNames });
	prompt.show(function(data) { if (data.button === 0) pgidLogin(sortedNames, data.menulist0); })
}

function onUpdateClicked() {
	var fromList = getSortedNames();;
	let prompt = new Prompt({ window: window, title: 'Existing ID', buttons: ['Select', 'Cancel'] });
	prompt.addMenulist({ values: fromList });
	prompt.show(function(data) { 
		if (data.button !== 0) return;
		var fromId = data.menulist0;
		var toList = fromList.slice(0); toList.splice(fromId, 1);
		let prompt2 = new Prompt({ window: window, title: 'New ID', buttons: ['Update', 'Cancel'] });
		prompt2.addMenulist({ values: toList });
		prompt2.show(function(data2) { 
			if (data2.button !== 0) return;
			var toId = data2.menulist0;
			pgidUpdate(fromList, toList, fromId, toId);
		});
	});
}

function onUpdatePwClicked() {
	let prompt = new Prompt({ window: window, title: 'Current password', buttons: ['OK', 'Cancel'] });
	prompt.addPassword({ hint: 'Current password', autofocus: true });
	prompt.show(function(data) { 
		if (data.button !== 0) return;
		var password = data.password0;
		var toList = getSortedNames();;
		let prompt2 = new Prompt({ window: window, title: 'New ID', buttons: ['Update', 'Cancel'] });
		prompt2.addMenulist({ values: toList });
		prompt2.show(function(data2) { 
			if (data2.button !== 0) return;
			var toId = data2.menulist0;
			pgidUpdatePw(password, toList, toId);
		});
	});
}

function pgidRegister(sortedNames, id) {
	let headers = tabs.activeTab.headers;
	for (var uid in gdata.plainlist) { if (gdata.plainlist[uid].name === sortedNames[id]) { headers.uid = uid; break; } }
	tabs.activeTab.cscript.port.emit('pgid', {cmd: 'register', payload: headers, gdata: gdata});
}

function pgidLogin(sortedNames, id) {
	let headers = tabs.activeTab.headers;
	for (var uid in gdata.plainlist) { if (gdata.plainlist[uid].name === sortedNames[id]) { headers.uid = uid; break; } }
	tabs.activeTab.cscript.port.emit('pgid', {cmd: 'login', payload: headers, gdata: gdata});
}

function pgidUpdate(fromList, toList, fromId, toId) {
	let headers = tabs.activeTab.headers;
	for (var uid in gdata.plainlist) { if (gdata.plainlist[uid].name === fromList[fromId]) { headers.ouid = uid; break; } }
	for (var uid in gdata.plainlist) { if (gdata.plainlist[uid].name === toList[toId]) { headers.nuid = uid; break; } }
	tabs.activeTab.cscript.port.emit('pgid', {cmd: 'update', payload: headers, gdata: gdata});
}

function pgidUpdatePw(password, toList, toId) {
	let headers = tabs.activeTab.headers;
	headers.password = password;
	for (var uid in gdata.plainlist) { if (gdata.plainlist[uid].name === toList[toId]) { headers.uid = uid; break; } }
	tabs.activeTab.cscript.port.emit('pgid', {cmd: 'updatepw', payload: headers, gdata: gdata});
}

// Options
function onOptionsClicked() {
	for each (var tab in tabs) {
		if (tab.url === selfdata.url('options.html')) {
			return tab.activate();
		}
	}
	tabs.open({
		url: selfdata.url('options.html'),
		onReady: function(tab) {
			var worker = tab.attach({
				contentScriptFile: [
					selfdata.url('ext/jquery-2.1.1.min.js'),
					selfdata.url('ext/jsencrypt-2.1.0.min.js'),
					selfdata.url('ext/cryptojs-3.1.2/rollups/sha1.js'),
					selfdata.url('ext/cryptojs-3.1.2/rollups/aes.js'),
					selfdata.url('ext/load-image.all.min.js'),
					selfdata.url('ext/qrencoder.min.js'),
					selfdata.url('ext/qrdecoder.min.js'),
					selfdata.url('ext/pako.min.js'),
					selfdata.url('common/utils.js'),
					selfdata.url('common/vault.js'),
					selfdata.url('options.js')
				],
				onMessage: function(msg) {
					if (msg.id === 'refresh') {
						gdata = msg.gdata;
					} else if (msg.id === 'save') {
						gdata = msg.gdata;
						sstore.storage['idlist'] = gdata.cryptlist;
					}
				}
			});
			worker.port.emit('set-options-gdata', gdata);
		}
	});
}
