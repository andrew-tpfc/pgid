/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
"use strict";

var gdata = { cryptkey: {}, cryptlist: {}, plainlist: {} };
var selfdata = require('sdk/self').data;
var sstore = require("sdk/simple-storage");
var tabs = require('sdk/tabs');
var content = null, popup = null, badge = null, optionsButton = null;

gdata.cryptlist = sstore.storage['idlist'];

exports.main = function(options, callbacks) {
	switch(options.loadReason) {
		case 'install':
		case 'enable':
		case 'startup':
		case 'upgrade':
		case 'downgrade':
			onLoad();
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
			onUnload();
			break;
	}
};

function onLoad() {
	// Button for displaying options page
	optionsButton = require('sdk/ui/button/action').ActionButton({
		id: 'options',
		label: 'PGID Vault',
		icon: {
			'32': './images/icon-32.png',
			'64': './images/icon-64.png',
			'128': './images/icon-128.png'
		},
		onClick: onOptionsButtonClick
	});

	// PGID badge for qualifying pages
	popup = require('sdk/panel').Panel({
		contentURL: selfdata.url('@popup.html'),
		onShow: function() { this.port.emit('autosize'); }
	});
	popup.port.on('resize', function(msg) {
		popup.resize(msg.width, msg.height);
	});
	popup.port.on('options', function() {
		popup.hide();
		onOptionsButtonClick();
	});
	popup.port.on('pgid', function(msg) {
		popup.hide();
		content.port.emit('pgid', msg);
	});
	badge = require('barbutton').BarButton({
		id: 'badge',
		image: selfdata.url('./images/icon-16.png'),
		panel: popup
	});
	showBadge(false);
}

function onUnload() {
}

function onOptionsButtonClick() {
	// pagemod will not apply, so clear badge ourselves
	showBadge(false);
	// Find existing options page and use it if found
	for each (var tab in tabs) {
		if (tab.url === selfdata.url('@options.html')) {
			return tab.activate();
		}
	}
	// Otherwise open a new options page
	tabs.open({
		url: selfdata.url('@options.html'),
		onReady: function(tab) {
			tab.attach({
				contentScriptFile: [
					selfdata.url('ext/jquery-2.1.1.min.js'),
					selfdata.url('ext/bootstrap-3.2.0/js/bootstrap.min.js'),
					selfdata.url('ext/jsencrypt-2.1.0.min.js'),
					selfdata.url('ext/cryptojs-3.1.2/rollups/sha1.js'),
					selfdata.url('ext/cryptojs-3.1.2/rollups/aes.js'),
					selfdata.url('ext/load-image.all.min.js'),
					selfdata.url('ext/qrencoder.min.js'),
					selfdata.url('ext/qrdecoder.min.js'),
					selfdata.url('ext/pako.min.js'),
					selfdata.url('common/utils.js'),
					selfdata.url('common/vault.js'),
					selfdata.url('common/desktop/options.js'),
					selfdata.url('options.js')
				],
				contentScriptOptions: { gdata: gdata },
				onMessage: function(msg) {
					if (msg.id === 'refresh') {
						gdata = msg.gdata;
					} else if (msg.id === 'save') {
						gdata = msg.gdata;
						sstore.storage['idlist'] = gdata.cryptlist;
					}
				}
			});
		}
	});
}

// Remove badge immediately before content is fully loaded
var pageMod = require("sdk/page-mod").PageMod({
	include: "*",
	contentScriptFile: selfdata.url('content.js'),
	contentScriptWhen: 'start',
	attachTo: ["existing", "top"],
	onAttach: function(worker) {
		worker.port.emit('reset');
		worker.port.on('clear_badge', function() {
			showBadge(false);
		});
	}	
});

// Attach content script when tab content changes
tabs.on('pageshow', onTabChanged);
tabs.on('activate', onTabChanged);

function onTabChanged(tab) {
	if (tab.url.indexOf('http://') === 0 || tab.url.indexOf('https://') === 0) {
		content = tab.attach({
			contentScriptFile: [
				selfdata.url('ext/jquery-2.1.1.min.js'),
				selfdata.url('ext/jsencrypt-2.1.0.min.js'),
				selfdata.url('common/vault.js'),
				selfdata.url('common/core.js'),
				selfdata.url('content.js')
			]
		});
		content.port.emit('get-headers');
		content.port.on('headers', function(headers) {
			showBadge(headers.register !== undefined || headers.login !== undefined || headers.update !== undefined || headers.updatepw !== undefined);
			if (badge.getStatus() === 'false') popup.port.emit('init', { headers: headers, gdata: gdata });
		});
	}
}

// Supporting functions

function showBadge(visible) {
	badge.collapsed(visible === false);
}
