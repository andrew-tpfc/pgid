/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var vault = null, qrtext = null;

self.port.on('set-options-gdata', function(gdata) {
	vault = new PGIDVault(gdata);
	vault.save = function() { self.postMessage({ id: 'save', gdata: vault.data() }); };
	if (!vault.init()) {
		refreshVaultView();
		unsafeWindow.$(':mobile-pagecontainer').pagecontainer('change', '#home-page');
	}
});

$(document).ready(function() {
	$('#btn-generate').bind('click', onGenerateClick);
	$('#btn-generate2').bind('click', onGenerate2Click);
	$('#btn-delete2').bind('click', onDelete2Click);
	$('#btn-getpin').bind('click', onGetPinClick);
	$('#btn-getpassword').bind('click', onGetPasswordClick);
	$('#btn-setpassword').bind('click', onSetPasswordClick);
	$('#btn-setpassword2').bind('click', onSetPassword2Click);
	$('#btn-clearpassword').bind('click', onClearPasswordClick);
	$('#btn-loadfile').bind('click', function() { $('#fileloader').val(''); $('#fileloader').click();	});
	$('#fileloader').bind('change', function(evt) {	onLoadFileChange(evt); });
});

function refreshVaultView() {
	$('#vault').empty();
	$("#vault").append('<li data-role="list-divider">My Vault</li>');

	var idlist = vault.list(), uids = vault.getSorted();
	uids.forEach(function(uid) {
		$('#vault').append('<li><a id="uid-' + uid + '" data-val="' + uid + '" href="#details-page">' + idlist[uid].name + '</a></li>');
	});
	unsafeWindow.$('#vault').listview().listview('refresh');
	$('#vault a').click(function() { onDetailsClick($(this).data('val')); });
	
	self.postMessage({ id: 'refresh', gdata: vault.data() });
}

function onGetPasswordClick() {
	var password = $('#fld-getpassword').val();
	if (password.length < 8 || !vault.decrypt(password)) {
		$('#fld-getpassword').closest('div').addClass('has-error');
		$('#fld-getpassword').attr('placeholder', 'Incorrect password!');
		$('#fld-getpassword').val('');
		return;
	}
	refreshVaultView();
	unsafeWindow.$(':mobile-pagecontainer').pagecontainer('change', '#home-page');
}

function onGenerateClick() {
	$('#fld-desc').closest('div').removeClass('has-error');
	$('#fld-desc').val('');
	$('#fld-fullname').val('');
	$('#fld-shortname').val('');
	$('#fld-email').val('');
}

function onGenerate2Click() {
	// Grab the various header values from UI
	var fields = {
		desc: $('#fld-desc').val().trim(),
		fullname: $('#fld-fullname').val().trim(),
		shortname: $('#fld-shortname').val().trim(),
		email: $('#fld-email').val().trim()
	};
	if (vault.nameExists(fields.desc)) {
		$('#fld-desc').closest('div').addClass('has-error');
		$('#fld-desc').attr('placeholder', 'Name already exists');
		$('#fld-desc').val('');
		return;
	}
	
	// Show loader
	$('#gen-page').addClass('ui-disabled');
	unsafeWindow.loaderOpts = cloneInto({ text: 'Generating... This could take a few minutes...', textVisible: true, theme: 'b' }, unsafeWindow);
	unsafeWindow.$.mobile.loading('show', unsafeWindow.loaderOpts);

	// Generate PGID
	vault.generate(fields, function(pgid) {
		unsafeWindow.$.mobile.loading('hide');
		$('#gen-page').removeClass('ui-disabled');

		var dspname = (fields.desc == '' ? formatUid(pgid.uid) : fields.desc);
		vault.add(pgid.uid, dspname, pgid.keytext);
		refreshVaultView();

		history.go(-1);
	});
}

function onDetailsClick(uid) {
	var idlist = vault.list(), pgid = idlist[uid];

	$('#display-name').text(pgid.name);
	var pin = makePin(), pin64 = CryptoJS.SHA1(pin).toString(CryptoJS.enc.Base64);
	try {
		var compressed = pako.deflate(strToArray(pgid.keytext));
		var crypttext = CryptoJS.AES.encrypt(CryptoJS.enc.Hex.parse(arrayToHex(compressed)), pin64).toString();
	} catch(err) {
		console.error(err);
		return;
	}
	$('#unlock-pin').text(formatPin(pin));
	$('#fld-qrcode').attr('src', QRCode.generatePNG(crypttext));
	
	$('#btn-delete2').attr('data-val', uid);

	unsafeWindow.$(':mobile-pagecontainer').pagecontainer('change', '#details-page');
}

function onDelete2Click() {
	var uid = $('#btn-delete2').attr('data-val');
	vault.remove(uid);
	refreshVaultView();
	history.go(-2);
}

function onLoadFileChange(evt) {
	$('#home-page').addClass('ui-disabled');
	unsafeWindow.$.mobile.loading('show');
	loadImage(evt.target.files[0], function(canvas) {
		var ctx = canvas.getContext("2d");
		var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
		
		var qrdecoder = new QRCodeDecode();
		qrdecoder.setImageData(imagedata, canvas.width, canvas.height);
		qrtext = qrdecoder.decode();

		unsafeWindow.$.mobile.loading('hide');
		$('#home-page').removeClass('ui-disabled');
		$('#fld-getpin').val('');
		$('#fld-getpin').closest('div').removeClass('has-error');
		$('#fld-getpin').attr('placeholder', 'PIN for QR-Code');
		unsafeWindow.$(':mobile-pagecontainer').pagecontainer('change', '#getpin-page');
	}, {maxWidth: 800, canvas: true});
}

function onGetPinClick() {
	var pin = $('#fld-getpin').val().replace(/-/g, '');
	var pin64 = CryptoJS.SHA1(pin).toString(CryptoJS.enc.Base64);
	var uid = null;
	try {
		var compressed = CryptoJS.AES.decrypt(qrtext, pin64).toString(CryptoJS.enc.Hex);
		var decomp = pako.inflate(hexToArray(compressed));
		var keytext = String.fromCharCode.apply(null, new Uint16Array(decomp));
		uid = keytext.match(/^pgid-uid:\s+(.*)$/m);
		if (uid === null) throw('Invalid PIN');

		var desc = keytext.match(/^pgid-desc:\s+(.*)$/m);
		var fullname = keytext.match(/^pgid-fullname:\s+(.*)$/m);
		var shortname = keytext.match(/^pgid-shortname:\s+(.*)$/m);
		var email = keytext.match(/^pgid-email:\s+(.*)$/m);
		var dspname = '[Unknown]';
		if (desc !== null) dspname = desc[1]; else if (uid !== null) dspname = formatUid(uid[1]);

		if (vault.nameExists(dspname)) throw('Name already exists');
	} catch(err) {
		$('#fld-getpin').val('');
		$('#fld-getpin').closest('div').addClass('has-error');
		$('#fld-getpin').attr('placeholder', err);
		return;
	}

	// Add generated ID to background page so that we can use it later
	vault.add(uid[1], dspname, keytext);
	refreshVaultView();
	
	history.go(-1);
}

function onSetPasswordClick() {
	$('#fld-password1').closest('div').removeClass('has-error');
	$('#fld-password2').closest('div').removeClass('has-error');
	$('#fld-password1').attr('placeholder', '');
	$('#fld-password2').attr('placeholder', '');
	$('#fld-password1').val('');
	$('#fld-password2').val('');
}

function onClearPasswordClick() {
	vault.setPassword('');
	history.go(-2);
}

function onSetPassword2Click() {
	$('#fld-password1').closest('div').removeClass('has-error');
	$('#fld-password2').closest('div').removeClass('has-error');

	var password1 = $('#fld-password1').val().trim();
	var password2 = $('#fld-password2').val().trim();

	if (password1.length < 8) {
		$('#fld-password1').closest('div').addClass('has-error');
		$('#fld-password1').attr('placeholder', 'Password < 8 characters');
		$('#fld-password1').val('');
		return;
	}

	if (password2.length < 8) {
		$('#fld-password2').closest('div').addClass('has-error');
		$('#fld-password2').attr('placeholder', 'Password < 8 characters');
		$('#fld-password2').val('');
		return;
	}

	if (password1 !== password2) {
		$('#fld-password2').closest('div').addClass('has-error');
		$('#fld-password2').attr('placeholder', 'Passwords do not match');
		$('#fld-password2').val('');
		return;
	}

	vault.setPassword(password1);
	history.go(-1);
}
