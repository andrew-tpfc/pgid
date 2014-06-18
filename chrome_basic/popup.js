"use strict";

$(document).ready(function() {
	// Make sure at least one PGID has been loaded
	var idlist = chrome.extension.getBackgroundPage().idlist;
	if (Object.keys(idlist).length === 0) {
		alert('No PGID has been loaded yet. Please generate or load at least one PGID from the extension options page.');
		return;
	}

	// Update key lists
	var lists = [ $("#register_list"), $("#login_list"), $("#update_list1"), $("#update_list2"), $("#updatepw_list") ];
	$.each(lists, function() {
		var options = this;
		for (var uid in idlist) {
			options.append($("<option />").val(uid).text(shorten(idlist[uid].name, 25)));
		}
	});

	// Enable/disable relevent functions based on declarations in page HTML
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { tabId: tabs[0].id, cmd: 'init' }, initPopup);
	});
});

function initPopup(msg) {
	// Enable/disable register function
	if (msg === undefined || msg.register === undefined) {
		$('#register_panel').remove();
	} else {
		$('#register').bind('click', function() {
			onRegisterClick(msg);
		});
		$('#register_list').change(onActiveUidChange);
	}
	// Enable/disable login function
	if (msg === undefined || msg.login === undefined) {
		$('#login_panel').remove();
	} else {
		$('#login').bind('click', function() {
			onLoginClick(msg);
		});
		$('#login_list').change(onActiveUidChange);
	}
	// Enable/disable update function
	if (msg === undefined || msg.update === undefined) {
		$('#update_panel').remove();
	} else {
		$('#update').bind('click', function() {
			onUpdateClick(msg);
		});
	}
	// Enable/disable updatepw function
	if (msg === undefined || msg.updatepw === undefined) {
		$('#updatepw_panel').remove();
	} else {
		$('#updatepw').bind('click', function() {
			onUpdatePwClick(msg);
		});
		$('#updatepw_list').change(onActiveUidChange);
	}
	
	if (shouldShowMasterPasswordField()) {
		$('#masterpw_panel').show();
	}
}

function shouldShowMasterPasswordField() {
	var idlist = chrome.extension.getBackgroundPage().idlist;
	if ($('#login_list').length) {
		return !idlist[$('#login_list').val()].decrypted;
	} else if ($('#register_list').length) {
		return !idlist[$('#register_list').val()].decrypted;
	} else if ($('#updatepw_list').length) {
		return !idlist[$('#updatepw_list').val()].decrypted;
	} else {
		return false;
	}
}

function onActiveUidChange() {
	var idlist = chrome.extension.getBackgroundPage().idlist;
	if (idlist[$(this).val()].decrypted) {
		$('#masterpw_panel').slideUp();
	} else {
		$('#master_password').val('');
		$('#masterpw_panel').slideDown();
	}
}

function onRegisterClick(msg) {
	msg.uid = $('#register_list option:selected').val();
	msg.masterpw = $('#master_password').val();
	chrome.extension.sendMessage({cmd: 'register', payload: msg});
	hidePopup();
}

function onLoginClick(msg) {
	msg.uid = $('#login_list option:selected').val();
	msg.masterpw = $('#master_password').val();
	chrome.extension.sendMessage({cmd: 'login', payload: msg});
	hidePopup();
}

function onUpdateClick(msg) {
	msg.ouid = $('#update_list1 option:selected').val();
	msg.nuid = $('#update_list2 option:selected').val();
	if (msg.ouid === msg.nuid) {
		$('#update_list2').css({ 'border': '2px solid red' });
	} else {
		chrome.extension.sendMessage({cmd: 'update', payload: msg});
		hidePopup();
	}
}

function onUpdatePwClick(msg) {
	msg.uid = $('#updatepw_list option:selected').val();
	msg.masterpw = $('#master_password').val();
	msg.password = $('#updatepw_password').val();
	if (msg.password.length == 0) {
		$('#updatepw_password').css({ 'border': '2px solid red' });
	} else {
		chrome.extension.sendMessage({cmd: 'updatepw', payload: msg});
		hidePopup();
	}
}

function hidePopup() {
	window.close();
}

function shorten(str, len) {
	if (str.length <= len-1) return str;
	return str.substring(0, len-1) + '\u2026';
}
