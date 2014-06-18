"use strict";

$(document).ready(function() {
	$('#generate').bind('click', function() {
		onGenerateClick();
	});
	$('#loadfile').bind('click', function() {
		$('#aside').hide();
		$('#fileloader').click();
	});
	$('#fileloader').bind('change', function(evt) {
		onLoadFileChange(evt);
	});
});

function onGenerateClick() {
	$('#aside').hide();
	$('#generate').hide();
	$('#progress').show();
	$('#loadfile').attr('disabled','disabled');

	// Setup visual feedback while generating keypair
	var loaderText = 'Please wait. Generating >';
	$('#progress').text(loaderText);
	var progress = setInterval(function() {
		if ($('#progress').text().length <= 30) {
			$('#progress').append('>');
		} else {
			$('#progress').text(loaderText);
		}
    }, 500);

	// Generate keypair
    var crypto = new JSEncrypt({default_key_size: 2048});
	crypto.getKey(function () {
		clearInterval(progress);
		$('#generate').show();
		$('#progress').hide();

		// Generate keypair in PEM format
		var seckey = crypto.getPrivateKey();
		var pubkey = crypto.getPublicKey();
		
		// UID is a SHA1 hash of the generated keypair
		var uid = Sha1.hash(seckey.replace(/(\r\n|\n|\r)/gm,''), true);

		// Grab the various header values from UI
		var desc = $('#desc').val().trim();
		var fullname = $('#fullname').val().trim();
		var shortname = $('#shortname').val().trim();
		var email = $('#email').val().trim();
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

		// Update UI with generates values
		$('#loadfile').removeAttr('disabled');
		$('#keytext').text(keytext);
		$('#displayname').text(dspname);
		$('#qrcode').attr('src', QRCode.generatePNG(keytext));
		$('#aside').show();

		// Add generated ID to background page so that we can use it later
		var idlist = chrome.extension.getBackgroundPage().idlist;
		chrome.extension.getBackgroundPage().idlist[uid] = { name: dspname, keytext: keytext};
	});
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
			
			// Display all decoded/extract values in the associated UI elements
			if (desc !== null) $('#desc').val(desc[1]); else $('#desc').val('');
			if (fullname !== null) $('#fullname').val(fullname[1]); else $('#fullname').val('');
			if (shortname !== null) $('#shortname').val(shortname[1]); else $('#shortname').val('');
			if (email !== null) $('#email').val(email[1]); else $('#email').val('');
			$('#keytext').text(keytext);
			var dspname = '[Unknown]';
			if (desc !== null) dspname = desc[1]; else if (uid !== null) dspname = formatUid(uid[1]);
			$('#displayname').text(dspname);
			$('#qrcode').attr('src', evt.target.result);
			$('#aside').show();

			// Add generated ID to background page so that we can use it later
			var idlist = chrome.extension.getBackgroundPage().idlist;
			chrome.extension.getBackgroundPage().idlist[uid[1]] = { name: dspname, keytext: keytext};
		};
		img.src = evt.target.result
	};
	reader.readAsDataURL(qrfile);
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
