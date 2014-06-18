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

var idlist = {};

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

chrome.storage.local.get(null, function(items) {
	for (var uid in items) {
		var keytext = items[uid];
		var desc = keytext.match(/^pgid-desc:\s+(.*)$/m);
		var dspname;
		if (desc !== null) {
			dspname = desc[1];
		} else {
			dspname = formatUid(uid);
		}
		idlist[uid] = { name: dspname, keytext: keytext, decrypted: false };
	}
});

function formatUid(uid) {
	return [
		uid.substring(0, 4),
		uid.substring(4, 8),
		uid.substring(8, 12),
		uid.substring(12, 16),
		uid.substring(16, 20),
		uid.substring(20, 24),
		uid.substring(24, 28),
		uid.substring(28, 32),
		uid.substring(32, 36),
		uid.substring(36, 40)
	].join('-')
}

function processID(uid, password) {
	var deferred = $.Deferred();
	// Extract PGID header
	var keytext = idlist[uid].keytext;
	var header = keytext.match(/-----BEGIN PGID HEADER-----(?:.|[\r|\n])*-----END PGID HEADER-----/gm);
	if (header === null) {
		deferred.reject('Invalid format: Cannot find header block');
		return deferred;
	}
	// Extract private key
	var seckey = keytext.match(/-----BEGIN RSA PRIVATE KEY-----(?:.|[\r|\n])*-----END RSA PRIVATE KEY-----/gm);
	if (seckey === null) {
		deferred.reject('Invalid format: Cannot find private key block');
		return deferred;
	}
	// Extract public key
	var pubkey = keytext.match(/-----BEGIN PUBLIC KEY-----(?:.|[\r|\n])*-----END PUBLIC KEY-----/gm);
	if (pubkey === null) {
		deferred.reject('Invalid format: Cannot find public key block');
		return deferred;
	}
	var pubkeytext =  header[0] + '\n' + pubkey[0];
	
	if (idlist[uid].decrypted) {
		deferred.resolve({ header: header[0], seckey: seckey[0], pubkey: pubkey[0], pubkeytext: pubkeytext });
	} else {
		decryptPrivateKey(seckey[0], password)
		.done(function(seckey) {
			var seckeywithheader = '-----BEGIN RSA PRIVATE KEY-----\n' +
				seckey +
				'-----END RSA PRIVATE KEY-----';
			keytext = header[0] + '\n' + seckeywithheader + '\n' + pubkey[0];
			idlist[uid].keytext = keytext;
			idlist[uid].decrypted = true;
			deferred.resolve({ header: header[0], seckey: seckeywithheader, pubkey: pubkey[0], pubkeytext: pubkeytext });
		})
		.fail(function(status) {
			deferred.reject(status);
		});
	}
	return deferred;
}

function decryptPrivateKey(seckey, password) {
	var deferred = $.Deferred();
	var regex = /-----BEGIN RSA PRIVATE KEY-----([^]*)-----END RSA PRIVATE KEY-----/m;
	var seckeycontent = regex.exec(seckey)[1];
	var seckeyarr = base64DecToArr(seckeycontent);
	var keyDerivationOp = {};
	keyDerivationOp.password = password;
	keyDerivationOp.onerror = function() {
		deferred.reject('Failed to derive the encryption key from the password');
	};
	keyDerivationOp.oncomplete = function(key) {
		var decryptionOp = {};
		decryptionOp.data = seckeyarr;
		decryptionOp.key = key;
		decryptionOp.onerror = function() {
			deferred.reject('Failed to decrypt the private key');
		};
		decryptionOp.oncomplete = function(unencryptedseckey) {
			if (unencryptedseckey.byteLength == 1192) {
				var unencryptedseckeyarr = new Uint8Array(unencryptedseckey);
				var unencryptedseckeybase64 = base64EncArr(unencryptedseckeyarr);
				var wrappedunencryptedseckey = wordwrap(unencryptedseckeybase64, 64);
				deferred.resolve(wrappedunencryptedseckey);
			} else {
				deferred.reject('Wrong master password');
			}
		}
		Encryption.AES.decrypt(decryptionOp);
	};
	Encryption.PBKDF2.deriveKey(keyDerivationOp);
	return deferred;
}

function wordwrap(string, width) {
	var ret = '';
	for (var i = 0; i < string.length; i += width) {
		ret += string.substr(i, width);
		ret += '\n';
	}
	return ret;
}

function doRegisterOrLogin(cmd, msg) {
	processID(msg.uid, msg.masterpw)
	.done(function(pgid) {
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
			console.log(JSON.stringify(reply));
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
	})
	.fail(function(status) {
		alert(status);
	});
}

function doUpdate(cmd, msg) {
	$.when(processID(msg.ouid), processID(msg.nuid))
	.done(function(opgid, npgid) {
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
	})
	.fail(function(status) {
		alert(status);
	});
}

function doUpdatePw(cmd, msg) {
	processID(msg.uid, msg.masterpw)
	.done(function(pgid) {
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
	})
	.fail(function(status) {
		alert(status);
	});
}
