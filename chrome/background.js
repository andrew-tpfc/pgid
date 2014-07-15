"use strict";

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
	if (change.status === 'complete') {
		chrome.tabs.sendMessage(tabId, { tabId: tabId, cmd: 'init' }, onTabUpdated);
	}
});

chrome.tabs.onActivated.addListener(function(info) {
	chrome.tabs.sendMessage(info.tabId, { tabId: info.tabId, cmd: 'init' }, onTabUpdated);
});

function onTabUpdated(msg) {
	// Decide whether we want to show page action icon when tab is activated or updated based on declarations in HTML content
	if (msg !== undefined && (msg.register !== undefined || msg.login !== undefined || msg.update !== undefined || msg.updatepw !== undefined)) {
		chrome.pageAction.show(msg.tabId);
	}
}

var cryptkey = '';
var idlist = {};
var vault = {
	// init() returns 'true' if password is required, 'false' if otherwise.
	init: function(callback) {
		if (Object.keys(idlist).length > 0) {
			callback(false);
			return;
		}
		try {
			chrome.storage.local.get(null, function(retval) {
				if (retval.idlist !== undefined) { 
					vault.tmplist = retval.idlist;
					for (var id in vault.tmplist) {
						if (!vault.tmplist[id].keytext.match(/^pgid-uid:\s+(.*)$/m)) {
							callback(true);
							return;
						}
					}
					idlist = vault.tmplist;
				}
				callback(false);
			});
		} catch(err) {
			console.log(err);
			callback(false);
		}
	},
	// decrypt returns 'true' if success, 'false' if failure.
	decrypt: function(password, callback) {
		var tmpkey = CryptoJS.SHA1(password).toString(CryptoJS.enc.Base64);
		var tmplist = $.extend(true, {}, vault.tmplist);
		for (var id in tmplist) {
			try {
				tmplist[id].keytext = CryptoJS.AES.decrypt(tmplist[id].keytext, tmpkey).toString(CryptoJS.enc.Utf8);
			} catch(err) {
				console.log(err);
				return false;
			}
			if (!tmplist[id].keytext.match(/^pgid-uid:\s+(.*)$/m)) return false;
		}
		cryptkey = tmpkey;
		idlist = tmplist;
		return true;
	},
	add: function(uid, dspname, keytext) {
		idlist[uid] = { name: dspname, keytext: keytext };
		persistStore();
	},
	remove: function(uid) {
		delete idlist[uid];
		persistStore();
	},
	// getSorted() returns array of uids sorted by display name order
	getSorted: function() {
		var names = new Array();
		var uids = {};
		for (var uid in idlist) {
			names.push(idlist[uid].name);
			uids[idlist[uid].name] = uid;
		}
		names.sort();
		var result = new Array();
		for (var i in names) result.push(uids[names[i]]);
		return result;
	},
	setPassword: function(password) {
		cryptkey = '';
		if (password.length > 0) cryptkey = CryptoJS.SHA1(password).toString(CryptoJS.enc.Base64);
		persistStore();
	},
	size: function() {
		return Object.keys(idlist).length;
	}
}

function persistStore() {
	var tmplist = $.extend(true, {}, idlist);
	if (cryptkey.length > 0) {
		for (var id in tmplist) {
			tmplist[id].keytext = CryptoJS.AES.encrypt(tmplist[id].keytext, cryptkey).toString();
		}
	}
	chrome.storage.local.set({'idlist': tmplist});
}

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	switch(msg.cmd) {
		case 'register':
		case 'login':
			doRegisterOrLogin(msg.cmd, msg.payload);
			break;
		case 'update':
			doUpdate(msg.cmd, msg.payload);
			break;
		case 'updatepw':
			doUpdatePw(msg.cmd, msg.payload);
			break;
	}
});

function processID(keytext) {
	// Extract PGID header
	var keytext = keytext;
	var header = keytext.match(/(-----BEGIN PGID HEADER-----(.|[\r|\n])*-----END PGID HEADER-----)/gm);
	if (header === null) {
		alert('Invalid format: Cannot find header block');
		return false;
	}
	// Extract private key
	var seckey = keytext.match(/(-----BEGIN RSA PRIVATE KEY-----(.|[\r|\n])*-----END RSA PRIVATE KEY-----)/gm);
	if (seckey === null) {
		alert('Invalid format: Cannot find private key block');
		return false;
	}
	// Extract public key
	var pubkey = keytext.match(/(-----BEGIN PUBLIC KEY-----(.|[\r|\n])*-----END PUBLIC KEY-----)/gm);
	if (pubkey === null) {
		alert('Invalid format: Cannot find public key block');
		return false;
	}
	var pubkeytext =  header[0] + '\n' + pubkey[0];
	return { header: header[0], seckey: seckey[0], pubkey: pubkey[0], pubkeytext: pubkeytext };
}

function doRegisterOrLogin(cmd, msg) {
	var pgid = processID(idlist[msg.uid].keytext);
	if (pgid === false) return;

	// Get encrypted token (challenge) from server
	$.ajax({
		url: cmd == 'register' ? msg.register : msg.login,
		type: 'POST',
		data: { cmd: cmd, pgid: pgid.pubkeytext },
		dataType: 'json',
		cache: false,
		async: false
	})
	.done(function(reply) {
		if (reply && reply.error) {
			alert('Error: ' + reply.error);
		} else {
			// Decrypt token
			var crypto = new JSEncrypt();
			crypto.setPrivateKey(pgid.seckey);
			var token = crypto.decrypt(reply.token);
			
			// Pass decrypted token (response) to content script to submit to server
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { tabId: tabs[0].id, cmd: cmd, pgid: pgid.pubkeytext, token: token });
			});
		}
	})
	.fail(function(jqXHR, textStatus) {
		alert('Error: ' + textStatus);
	});
}

function doUpdate(cmd, msg) {
	var opgid = processID(idlist[msg.ouid].keytext);
	var npgid = processID(idlist[msg.nuid].keytext);
	if (opgid === false || npgid == false) return;

	// Get encrypted token (challenge) from server
	$.ajax({
		url: msg.update,
		type: 'POST',
		data: { cmd: cmd, opgid: opgid.pubkeytext, npgid: npgid.pubkeytext },
		dataType: 'json',
		cache: false,
		async: false
	})
	.done(function(reply) {
		if (reply && reply.error) {
			alert('Error: ' + reply.error);
		} else {
			var crypto = new JSEncrypt();

			// Decrypt otoken
			crypto.setPrivateKey(opgid.seckey);
			var otoken = crypto.decrypt(reply.otoken);
			
			// Decrypt ntoken
			crypto.setPrivateKey(npgid.seckey);
			var ntoken = crypto.decrypt(reply.ntoken);

			// Pass both decrypted tokens (response) to content script to submit to server
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {
					tabId: tabs[0].id,
					cmd: cmd,
					opgid: opgid.pubkeytext,
					npgid: npgid.pubkeytext,
					otoken: otoken,
					ntoken: ntoken });
			});
		}
	})
	.fail(function(jqXHR, textStatus) {
		alert('Error: ' + textStatus);
	});
}

function doUpdatePw(cmd, msg) {
	var pgid = processID(idlist[msg.uid].keytext);
	if (pgid === false) return;

	// Get encrypted token (challenge) from server
	$.ajax({
		url: msg.updatepw,
		type: 'POST',
		data: { cmd: cmd, password: msg.password, npgid: pgid.pubkeytext },
		dataType: 'json',
		cache: false,
		async: false
	})
	.done(function(reply) {
		if (reply && reply.error) {
			alert('Error: ' + reply.error);
		} else {
			// Decrypt token
			var crypto = new JSEncrypt();
			crypto.setPrivateKey(pgid.seckey);
			var token = crypto.decrypt(reply.token);
			
			// Pass decrypted token (response) to content script to submit to server
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { tabId: tabs[0].id, cmd: cmd, password: msg.password, npgid: pgid.pubkeytext, token: token });
			});
		}
	})
	.fail(function(jqXHR, textStatus) {
		alert('Error: ' + textStatus);
	});
}
