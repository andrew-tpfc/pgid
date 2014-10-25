/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var vault = null, qrtext = null;

$(document).ready(function() {
	if (self.options === undefined || self.options.gdata === undefined) return;
	
	vault = new PGIDVault(self.options.gdata);
	vault.save = function() { self.postMessage({ id: 'save', gdata: vault.data() }); };
	
	setup();
});

function notifyVaultChange() {
	self.postMessage({ id: 'refresh', gdata: vault.data() });
}
