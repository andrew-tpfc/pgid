"use strict";

$(document).ready(function() {
	var vault = chrome.extension.getBackgroundPage().vault;
	vault.init(function(reqPassword) {
		if (reqPassword || vault.size() == 0) {
			$('#register_panel').remove();
			$('#login_panel').remove();
			$('#update_panel').remove();
			$('#updatepw_panel').remove();
			$('[id=options_url]').on('click', function() { onOptionsClick(); });
			if (reqPassword) $('#error1_panel').remove(); else $('#error2_panel').remove();
			if (reqPassword) console.log('#1'); else console.log('#2');
		} else {
			// Update key lists
			var idlist = chrome.extension.getBackgroundPage().idlist;
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
		}
	});
});

function initPopup(msg) {
	console.log(msg);
	// Error messages should be hidden
	$('#error1_panel').remove();
	$('#error2_panel').remove();
	// Enable/disable register function
	if (msg === undefined || msg.register === undefined) {
		$('#register_panel').remove();
	} else {
		$('#register').bind('click', function() {
			onRegisterClick(msg);
		});
	}
	// Enable/disable login function
	if (msg === undefined || msg.login === undefined) {
		$('#login_panel').remove();
	}
	else {
		$('#login').bind('click', function() {
			onLoginClick(msg);
		});
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
	}
	// Bind all the options button
	$('[id=options]').bind('click', function() {
		onOptionsClick();
	});
}

function onOptionsClick() {
	var optionsUrl = chrome.extension.getURL('options.html');
	chrome.tabs.query({url: optionsUrl}, function(tabs) {
		if (tabs.length) chrome.tabs.update(tabs[0].id, {active: true}); else  chrome.tabs.create({url: optionsUrl});
    });
}

function onRegisterClick(msg) {
	msg.uid = $('#register_list option:selected').val();
	chrome.extension.sendMessage({cmd: 'register', payload: msg});
	hidePopup();
}

function onLoginClick(msg) {
	msg.uid = $('#login_list option:selected').val();
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
