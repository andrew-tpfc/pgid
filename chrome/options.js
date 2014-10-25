/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var vault = null, qrtext = null;

$(document).ready(function() {
	chrome.runtime.getBackgroundPage(function(bg) {
		vault = bg.vault;
		setup();
	});
});

function notifyVaultChange() {
	// Not required for Chrome
}