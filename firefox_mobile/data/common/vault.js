/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Handles access to PGID vault
// 
// Note: save() method needs to be dynamically replaced with browser-specific storage method 
// if changes to vault is to be persisted.

var PGIDVault = function(gdata) { return {

	// init() returns 'true' if password is required, 'false' if otherwise.
	init: function() {
		if (Object.keys(gdata.plainlist).length > 0) return false;
		if (gdata.cryptlist === undefined || Object.keys(gdata.cryptlist).length === 0) return false;
		try {
			for (var id in gdata.cryptlist) {
				if (!gdata.cryptlist[id].keytext.match(/^pgid-uid:\s+(.*)$/m)) return true;
			}
			gdata.plainlist = gdata.cryptlist;
			return false;
		} catch(err) {
			console.error(err);
			return false;
		}
	},

	// decrypt() returns 'true' if success, 'false' if failure.
	decrypt: function(password, callback) {
		var tmpkey = CryptoJS.SHA1(password).toString(CryptoJS.enc.Base64);
		var tmplist = $.extend(true, {}, gdata.cryptlist);
		for (var id in tmplist) {
			try {
				tmplist[id].keytext = CryptoJS.AES.decrypt(tmplist[id].keytext, tmpkey).toString(CryptoJS.enc.Utf8);
			} catch(err) {
				console.error(err);
				return false;
			}
			if (!tmplist[id].keytext.match(/^pgid-uid:\s+(.*)$/m)) return false;
		}
		gdata.cryptkey = tmpkey;
		gdata.plainlist = tmplist;
		return true;
	},

	generate: function(params, doneCallback) {
		var crypto = new JSEncrypt({default_key_size: 2048});
		crypto.getKey(function() {
			// Generate keypair in PEM format
			var seckey = crypto.getPrivateKey();
			var pubkey = crypto.getPublicKey();

			// Generate keytext with headers
			var uid = CryptoJS.SHA1(seckey.replace(/(\r\n|\n|\r)/gm,''), true).toString();
			var keytext = '-----BEGIN PGID HEADER-----\n';
			keytext += 'pgid-uid: ' + uid + '\n';
			if (params.desc != '') keytext += 'pgid-desc: ' + params.desc + '\n';
			if (params.fullname != '') keytext += 'pgid-fullname: ' + params.fullname + '\n';
			if (params.shortname != '') keytext += 'pgid-shortname: ' + params.shortname + '\n';
			if (params.email != '') keytext += 'pgid-email: ' + params.email + '\n';
			keytext += '-----END PGID HEADER-----\n';
			keytext += seckey;
			keytext += '\n';
			keytext += pubkey;

			// Callback when done
			doneCallback({ uid: uid, keytext: keytext });
		});
	},
	
	nameExists: function(dspname) {
		for (var uid in gdata.plainlist) if (dspname === gdata.plainlist[uid].name) return true;
		return false;
	},
	
	add: function(uid, dspname, keytext) {
		if (!this.nameExists(dspname)) {
			gdata.plainlist[uid] = { name: dspname, keytext: keytext };
			this.persist();
		}
	},
	
	remove: function(uid) {
		delete gdata.plainlist[uid];
		this.persist();
	},
	
	data: function() {
		return gdata;
	},
	
	list: function() {
		return gdata.plainlist;
	},
	
	getFirst: function() {
		return Object.keys(gdata.plainlist)[0];
	},

	cryptkey: function() {
		return gdata.cryptkey;
	},
	
	size: function() {
		return Object.keys(gdata.plainlist).length;
	},
	
	setPassword: function(password) {
		gdata.cryptkey = '';
		if (password.length > 0) gdata.cryptkey = CryptoJS.SHA1(password).toString(CryptoJS.enc.Base64);
		this.persist();
	},

	persist: function() {
		gdata.cryptlist = $.extend(true, {}, gdata.plainlist);
		if (gdata.cryptkey.length > 0) {
			for (var id in gdata.cryptlist) {
				gdata.cryptlist[id].keytext = CryptoJS.AES.encrypt(gdata.plainlist[id].keytext, gdata.cryptkey).toString();
			}
		}
		this.save();
	},
	
	save: function() {
	},

	// getSorted() returns array of uids sorted by display name order
	getSorted: function() {
		var names = new Array();
		var uids = {};
		for (var uid in gdata.plainlist) {
			names.push(gdata.plainlist[uid].name);
			uids[gdata.plainlist[uid].name] = uid;
		}
		names.sort();
		var result = new Array();
		names.forEach(function(name) { result.push(uids[name]); });
		return result;
	}
} };
