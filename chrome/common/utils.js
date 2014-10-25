/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

function makePin() {
    var pin = '';
    for(var i=0; i<16; i++) pin += String.fromCharCode(48 + Math.floor(Math.random()*10));
    return pin;
}

function formatPin(pin) {
	return [
		pin.substring(0, 4),
		pin.substring(4, 8),
		pin.substring(8, 12),
		pin.substring(12, 16)
	].join('-');
}

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
	].join('-');
}

function arrayToHex(arr) {
	for (var result='', i=0; i<arr.length; i++) {
		var hex = arr[i].toString(16);
		result += ('0'+hex).slice(-2);
	}
	return result;
}

function hexToArray(str) {
	var i=0, result = new Uint8Array(str.length/2);
    while (str.length >= 2) { 
        result[i++] = parseInt(str.substring(0, 2), 16);
        str = str.substring(2, str.length);
    }
    return result;
}

function strToArray(str) {
	var result = new Uint8Array(str.length);
	for (var i=0; i<str.length; i++) result[i] = str.charCodeAt(i);
	return result;
}

function getUrlVars(url) {
	var vars = [], hash;
	var hashes = url.hash.substring(url.hash.lastIndexOf('?') + 1).split('&');
	for (var i=0; i<hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}
