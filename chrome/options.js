"use strict";

$(document).ready(function() {
	$('#btn-generate').bind('click', function() {
		onGenerateClick();
	});
	
	$('#btn-generate2').bind('click', function() {
		onGenerate2Click();
	});
	
	$('#btn-generate2-cancel').bind('click', function() {
		onGenerate2CancelClick();
	});
	
	$('#btn-loadfile').bind('click', function() {
		$('#fileloader').click();
	});
	
	$('#fileloader').bind('change', function(evt) {
		onLoadFileChange(evt);
	});

	$('#btn-delete').bind('click', function() {
		onDeleteClick();
	});
	
	$('#btn-delete2').bind('click', function() {
		onDelete2Click();
	});

	$('#btn-delete2-cancel').bind('click', function() {
		onDelete2CancelClick();
	});

	$('#btn-getpassword').bind('click', function() {
		onGetPasswordClick();
	});

	$('#btn-getpassword-cancel').bind('click', function() {
		onGetPasswordCancelClick();
	});

	$('#btn-setpassword').bind('click', function() {
		onSetPasswordClick();
	});

	$('#btn-setpassword2').bind('click', function() {
		onSetPassword2Click();
	});

	$('#btn-setpassword2-cancel').bind('click', function() {
		onSetPassword2CancelClick();
	});
	
	$('#btn-clearpassword-yes').bind('click', function() {
		onClearPasswordYesClick();
	});

	$('#btn-clearpassword-no').bind('click', function() {
		onClearPasswordNoClick();
	});

	$('#dlg-generate').on('shown.bs.modal', function(){
		$('#fld-desc').focus();
	});

	$('#dlg-setpassword').on('shown.bs.modal', function(){
		$('#fld-password1').focus();
	});

	$('#dlg-getpassword').on('shown.bs.modal', function(){
		$('#fld-getpassword').focus();
	});

	$('#sel-vault').change(function() {
		onVaultSelect();
	});
	
	chrome.extension.getBackgroundPage().vault.init(function(reqPassword) {
		if (reqPassword) $('#dlg-getpassword').modal('show'); else refreshVault();
	});
});

function refreshVault(suid) {
	$('#sel-vault').children().remove()

	var idlist = chrome.extension.getBackgroundPage().idlist;
	var uids = chrome.extension.getBackgroundPage().vault.getSorted();
	for (var i in uids) {
		$('#sel-vault').append($('<option />').val(uids[i]).text(idlist[uids[i]].name));
	};

	if (suid !== undefined) $('#sel-vault').val(suid).attr('selected', true);
	onVaultSelect();
}

function onVaultSelect() {
	var idlist = chrome.extension.getBackgroundPage().idlist;
	var pgid = idlist[$('#sel-vault option:selected').val()];
	if (pgid !== undefined) {
		$('#fld-desc').val(pgid.desc);
		$('#fld-fullname').val(pgid.fullname);
		$('#fld-shortname').val(pgid.shortname);
		$('#fld-email').val(pgid.email);
		$('#fld-keytext').text(pgid.keytext);
		$('#displayname').text(pgid.name);
		$('#fld-qrcode').attr('src', QRCode.generatePNG(pgid.keytext));
		$('#details').show();
	} else {
		$('#details').hide();
	}
}

function onGetPasswordClick() {
	var password = $('#fld-getpassword').val();
	if (password.length < 8 || !chrome.extension.getBackgroundPage().vault.decrypt(password)) {
		$('#grp-getpassword').addClass('has-error');
		$('#fld-getpassword').attr('placeholder', 'Incorrect password!');
		$('#fld-getpassword').val('');
		return;
	}
	$('#dlg-getpassword').modal('hide');
	refreshVault();
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
	$('#dlg-generate').modal('hide');
	$('#dlg-progress').modal('show');

	// Generate keypair
    var crypto = new JSEncrypt({default_key_size: 2048});
	crypto.getKey(function () {
		$('#dlg-progress').modal('hide');

		// Generate keypair in PEM format
		var seckey = crypto.getPrivateKey();
		var pubkey = crypto.getPublicKey();
		
		// UID is a SHA1 hash of the generated keypair
		var uid = CryptoJS.SHA1(seckey.replace(/(\r\n|\n|\r)/gm,''), true);

		// Grab the various header values from UI
		var desc = $('#fld-desc').val().trim();
		var fullname = $('#fld-fullname').val().trim();
		var shortname = $('#fld-shortname').val().trim();
		var email = $('#fld-email').val().trim();
		var dspname = (desc == '' ? formatUid(uid) : desc);
		
		// Prepend headers to keytext
		var keytext = '-----BEGIN PGID HEADER-----\n';
		keytext += 'pgid-uid: ' + uid + '\n';
		if (desc != '') keytext += 'pgid-desc: ' + desc + '\n';
		if (fullname != '') keytext += 'pgid-fullname: ' + fullname + '\n';
		if (shortname != '') keytext += 'pgid-shortname: ' + shortname + '\n';
		if (email != '') keytext += 'pgid-email: ' + email + '\n';
		keytext += '-----END PGID HEADER-----\n';
		keytext += seckey;
		keytext += '\n';
		keytext += pubkey;

		// Add generated ID to background page so that we can use it later
		chrome.extension.getBackgroundPage().vault.add(uid, dspname, keytext);
		refreshVault(uid);
	});
}

function onGenerate2CancelClick() {
	$('#dlg-generate').modal('hide');
}

function onLoadFileChange(evt) {
	var qrfile = evt.target.files[0];
	var reader = new FileReader();
	reader.onload = function(evt) {
		var img = new Image();
		img.onload = function() {
			// Draw image onto hidden canvas so that we can use getImageData() to decode the QR-code
			var canvas = document.getElementById("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			var qrdecoder = new QRCodeDecode();
			var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
			qrdecoder.setImageData(imagedata, canvas.width, canvas.height);
			qrdecoder.findImageBorders();
			var keytext = qrdecoder.decode();

			// Extract headers from keytext
			var uid = keytext.match(/^pgid-uid:\s+(.*)$/m);
			if (uid === null) {
				alert('Invalid format: Cannot find UID field from header!');
				return;
			}
			var desc = keytext.match(/^pgid-desc:\s+(.*)$/m);
			var fullname = keytext.match(/^pgid-fullname:\s+(.*)$/m);
			var shortname = keytext.match(/^pgid-shortname:\s+(.*)$/m);
			var email = keytext.match(/^pgid-email:\s+(.*)$/m);
			var dspname = '[Unknown]';
			
			// Display all decoded/extract values in the associated UI elements
			if (desc !== null) $('#fld-desc').val(desc[1]); else $('#fld-desc').val('');
			if (fullname !== null) $('#fld-fullname').val(fullname[1]); else $('#fld-fullname').val('');
			if (shortname !== null) $('#fld-shortname').val(shortname[1]); else $('#fld-shortname').val('');
			if (email !== null) $('#fld-email').val(email[1]); else $('#fld-email').val('');
			if (desc !== null) dspname = desc[1]; else if (uid !== null) dspname = formatUid(uid[1]);

			// Add generated ID to background page so that we can use it later
			chrome.extension.getBackgroundPage().vault.add(uid[1], dspname, keytext);
			refreshVault(uid);
		};
		img.src = evt.target.result
	};
	reader.readAsDataURL(qrfile);
}

function onDeleteClick() {
	$('#dlg-confirm').modal('show');
}

function onDelete2Click() {
	$('#dlg-confirm').modal('hide');
	var uid = $('#sel-vault option:selected').val();
	if (uid !== undefined) { 
		chrome.extension.getBackgroundPage().vault.remove(uid);
		refreshVault();
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
		if (chrome.extension.getBackgroundPage().cryptkey.length > 0) $('#dlg-clearpassword').modal('show');
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

	$('#dlg-setpassword').modal('hide');
	chrome.extension.getBackgroundPage().vault.setPassword(password1);
}

function onSetPassword2CancelClick() {
	$('#dlg-setpassword').modal('hide');
}

function onClearPasswordYesClick() {
	$('#dlg-clearpassword').modal('hide');
	chrome.extension.getBackgroundPage().vault.setPassword('');
}

function onClearPasswordNoClick() {
	$('#dlg-clearpassword').modal('hide');
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
	].join('-')
}
