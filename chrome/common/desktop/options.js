/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

function setup() {
	// dlg-getpassword
	$('#btn-getpassword').bind('click', onGetPasswordClick);
	$('#btn-getpassword-cancel').bind('click', onGetPasswordCancelClick);
	$('#fld-getpassword').keypress(function(e) { if (e.which == '13') onGetPasswordClick(); });
	$('#dlg-getpassword').on('shown.bs.modal', function(){ $('#fld-getpassword').focus(); });
	// dlg-setpassword
	$('#btn-setpassword').bind('click', onSetPasswordClick);
	$('#btn-setpassword2').bind('click', onSetPassword2Click);
	$('#fld-password1').keypress(function(e) { if (e.which == '13') onSetPassword2Click(); });
	$('#fld-password2').keypress(function(e) { if (e.which == '13') onSetPassword2Click(); });
	$('#btn-setpassword2-cancel').bind('click', onSetPassword2CancelClick);
	$('#btn-clearpassword').bind('click', onClearPasswordClick);
	$('#btn-clearpassword-yes').bind('click', onClearPasswordYesClick);
	$('#btn-clearpassword-no').bind('click', onClearPasswordNoClick);
	$('#dlg-setpassword').on('shown.bs.modal', function(){ $('#fld-password1').focus();	});
	// dlg-getpin
	$('#btn-getpin').bind('click', onGetPinClick);
	$('#btn-getpin-cancel').bind('click', onGetPinCancelClick);
	$('#fld-getpin').keypress(function(e) { if (e.which == '13') onGetPinClick(); });
	$('#dlg-getpin').on('shown.bs.modal', function(){ $('#fld-getpin').focus(); });
	// dlg-generate
	$('#btn-generate').bind('click', onGenerateClick);
	$('#btn-generate2').bind('click', onGenerate2Click);
	$('#btn-generate2-cancel').bind('click', function() { onGenerate2CancelClick();	});
	$('#dlg-generate').on('shown.bs.modal', function(){	$('#fld-desc').focus(); });
	// Load from QRCode
	$('#btn-loadfile').bind('click', function() { $('#fileloader').val(''); $('#fileloader').click(); });
	$('#fileloader').bind('change', function(evt) {	onLoadFileChange(evt); });
	// Delete
	$('#btn-delete').bind('click', onDeleteClick);
	$('#btn-delete2').bind('click', onDelete2Click);
	$('#btn-delete2-cancel').bind('click', onDelete2CancelClick);
	// Vault
	$('#sel-vault').bind('dblclick', onVaultDoubleClick);
	// Prompt for decryption password if necessary
	if (vault.init()) $('#dlg-getpassword').modal('show'); else refreshVaultView();
}

function refreshVaultView(suid) {
	$('#sel-vault').children().remove();

	var idlist = vault.list(), uids = vault.getSorted();
	uids.forEach(function(uid) {
		$('#sel-vault').append($('<option />').val(uid).text(idlist[uid].name));
	});

	if (suid !== undefined) $('#sel-vault').val(suid).attr('selected', true);
	
	notifyVaultChange();
}

function onVaultDoubleClick() {
	var idlist = vault.list();
	var pgid = idlist[$('#sel-vault option:selected').val()];
	if (pgid === undefined) return;
	
	$('#fld-desc').val(pgid.desc);
	$('#fld-fullname').val(pgid.fullname);
	$('#fld-shortname').val(pgid.shortname);
	$('#fld-email').val(pgid.email);
	$('#fld-keytext').text(pgid.keytext);
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

	$('#dlg-qrcode').modal('show');
}

function onGetPasswordClick() {
	var password = $('#fld-getpassword').val();
	if (password.length < 8 || !vault.decrypt(password)) {
		$('#grp-getpassword').addClass('has-error');
		$('#fld-getpassword').attr('placeholder', 'Incorrect password!');
		$('#fld-getpassword').val('');
		return;
	}
	$('#dlg-getpassword').modal('hide');
	refreshVaultView();
}

function onGetPasswordCancelClick() {
	$('#dlg-getpassword').modal('hide');
}

function onGenerateClick() {
	$('#fld-desc').val('');
	$('#fld-fullname').val('');
	$('#fld-shortname').val('');
	$('#fld-email').val('');
	$('#dlg-generate').modal('show');
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
		$('#grp-desc').addClass('has-error');
		$('#fld-desc').attr('placeholder', 'Name already exists');
		$('#fld-desc').val('');
		return;
	}

	// Show progress bar
	$('#dlg-generate').modal('hide');
	$('#dlg-progress').modal('show');

	// Generate new PGID
	vault.generate(fields, function(pgid) {
		var dspname = (fields.desc == '' ? formatUid(fields.uid) : fields.desc);
		$('#dlg-progress').modal('hide');
		vault.add(pgid.uid, dspname, pgid.keytext);
		refreshVaultView(pgid.uid);
	});
}

function onGenerate2CancelClick() {
	$('#dlg-generate').modal('hide');
}

function onLoadFileChange(evt) {
	loadImage(evt.target.files[0], function(canvas) {
		var ctx = canvas.getContext("2d");
		var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);

		var qrdecoder = new QRCodeDecode();
		qrdecoder.setImageData(imagedata, canvas.width, canvas.height);
		qrdecoder.findImageBorders();
		qrtext = qrdecoder.decode();

		$('#fld-getpin').val('');
		$('#dlg-getpin').modal('show'); 
	}, {maxWidth: 800, canvas: true});
}

function onGetPinClick() {
	var pin = $('#fld-getpin').val().trim().replace(/-/g, '');
	var pin64 = CryptoJS.SHA1(pin).toString(CryptoJS.enc.Base64);
	var compressed = CryptoJS.AES.decrypt(qrtext, pin64).toString(CryptoJS.enc.Hex);
	try {
		var decomp = pako.inflate(hexToArray(compressed));
		var keytext = String.fromCharCode.apply(null, new Uint16Array(decomp));
		var uid = keytext.match(/^pgid-uid:\s+(.*)$/m);
		if (uid === null) throw('Invalid PIN');

		var desc = keytext.match(/^pgid-desc:\s+(.*)$/m);
		var fullname = keytext.match(/^pgid-fullname:\s+(.*)$/m);
		var shortname = keytext.match(/^pgid-shortname:\s+(.*)$/m);
		var email = keytext.match(/^pgid-email:\s+(.*)$/m);
		var dspname = '[Unknown]';
		if (desc !== null) dspname = desc[1]; else if (uid !== null) dspname = formatUid(uid[1]);
		
		if (vault.nameExists(dspname)) throw('Name already exists');
	} catch(err) {
		$('#grp-getpin').addClass('has-error');
		$('#fld-getpin').attr('placeholder', err);
		$('#fld-getpin').val('');
		return;
	}
	$('#dlg-getpin').modal('hide');

	// Add generated ID to background page so that we can use it later
	vault.add(uid[1], dspname, keytext);
	refreshVaultView(uid);
}

function onGetPinCancelClick() {
	$('#dlg-getpin').modal('hide');
}

function onDeleteClick() {
	$('#dlg-confirm').modal('show');
}

function onDelete2Click() {
	$('#dlg-confirm').modal('hide');
	var uid = $('#sel-vault option:selected').val();
	if (uid !== undefined) { 
		vault.remove(uid);
		refreshVaultView();
	}
}

function onDelete2CancelClick() {
	$('#dlg-confirm').modal('hide');
}

function onSetPasswordClick() {
	$('#grp-password1').removeClass('has-error');
	$('#grp-password2').removeClass('has-error');
	$('#fld-password1').attr('placeholder', '');
	$('#fld-password2').attr('placeholder', '');
	$('#fld-password1').val('');
	$('#fld-password2').val('');
	$('#dlg-setpassword').modal('show');
}

function onSetPassword2Click() {
	$('#grp-password1').removeClass('has-error');
	$('#grp-password2').removeClass('has-error');
	$('#fld-password1').attr('placeholder', '');
	$('#fld-password2').attr('placeholder', '');

	var password1 = $('#fld-password1').val().trim();
	var password2 = $('#fld-password2').val().trim();

	if (password1.length === 0 && password2.length === 0) {
		$('#dlg-setpassword').modal('hide');
		if (vault.cryptkey().length > 0) $('#dlg-clearpassword').modal('show');
		return;
	}

	if (password1.length < 8) {
		$('#grp-password1').addClass('has-error');
		$('#fld-password1').attr('placeholder', 'Password must have at least 8 characters');
		$('#fld-password1').val('');
		return;
	}

	if (password1 !== password2) {
		$('#grp-password2').addClass('has-error');
		$('#fld-password2').attr('placeholder', 'Passwords do not match!');
		$('#fld-password2').val('');
		return;
	}

	vault.setPassword(password1);
	$('#dlg-setpassword').modal('hide');
}

function onSetPassword2CancelClick() {
	$('#dlg-setpassword').modal('hide');
}

function onClearPasswordClick() {
	$('#dlg-clearpassword').modal('show');
}

function onClearPasswordYesClick() {
	$('#dlg-clearpassword').modal('hide');
	vault.setPassword('');
}

function onClearPasswordNoClick() {
	$('#dlg-clearpassword').modal('hide');
}
