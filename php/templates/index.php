<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title>Pretty Good Identity</title>
	<link rel="icon" href="images/favicon.png" />
	<link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
	<h1>Pretty Good ID (PGID)</h1>
	<p>PGID is a proposed authentication system to gradually replace the current password system that is used almost universally on all websites and services. It is able to co-exist with passwords, and can be added quite easily to existing systems.</p>
<h2>Problems with passwords</h2>
	<p>The problems with passwords should be apparent by now. Not a day goes by without yet another server being hacked, and whenever a server is compromised, we are asked to change our passwords. We are told never to use the same password on different servers, yet the passwords have to be almost random in order to be secure, making them impossible to humanly remember. The proliferating number of web services in our lives have increased dramatically the number of passwords we need to handle, and password managers are at best a crude workaround. Worse, due to the inherent insecurity of passwords, some services have adapted two-factor authentication, where a PIN is sent to your mobile phone, or generated on a security token or app. This means yet more externalities to handle, and even with two-factor authentication, you still need to change your password when a server is compromised! The situation has become worse with each passing day, with no relief in sight.</p>
	<h2>Why passwords?</h2>
	<p>Password, however, is not without its advantages. It is easy to implement. It is very informal. It is easy to generate. You don't need any central authority (unlike, for example, SSL certificates). It is anonymous. For any system to have the hope of replacing passwords, it needs to have these advantages. In addition, it must be able to co-exist with passwords, since passwords are not about to go away any time soon.</p>
	<h2>What is PGID?</h2>
	<p>PGID is an informal authentication system based on public-key cryptography. Public-key crytography has been discovered since the 1970s, so it has been around for a long time. Essentially a private key and a public key (known as a key-pair) are generated. Your public key can be passed to anyone who wishes to encrypt stuff for your eyes only. Your private key must be guarded closely and is the only means by which content encrypted using your public key can be decrypted.</p>
	<p>A very famous implementation of public key cryptography is PGP (Pretty Good Privacy) for encrypting emails. The name I have chosen, PGID, is a tribute to PGP, one of the earliest open-source implementation of public key cryptography.</p>
	<p>A PGID is simply a 2048-bit RSA key-pair in OpenSSL's PEM format. I have chosen OpenSSL because it is very popular and has been ported to many languages and platforms, such as C, C++, C#, PHP and Javascript. This removes a barrier to adding PGID to existing systems, regardless of language or platform.
	<h2>What are the advantages of PGID?</h2>
	<p>Like passwords, PGID is easy to implement, informal, easy to generate, decentralized and anonymous. It is very secure because only the public key is ever meant to be stored on the server. If a server ever gets compromised, there is no need to change anything, since the attacker will only have your public key, which is meant to be public anyway. Therefore, there is no need to have a different PGID for each web service. In fact, for most people, having 1 or 2 PGIDs will probably suffice for all the web services they register with. making it a far more manageable situation than passwords.</p>
	<h2>How does it work?</h2>
	<p>A picture is worth a thousand words. For now, I have prepared a demo site that allow users to interact with using either password or PGID, with the technical protocol explained depending on what you are trying to do. The demo site basically supports a few fundamental functions: 1) registration, 2) login, and 3) change password. PGID have defined protocols for all 3 functions, plus 1 additional function to upgrade from password to PGID.</p>
	<p>In order to use PGID, you need to install a Chrome extension. Download <a href="downloads/pgid_chrome.zip">pgid_chrome.zip</a> and unzip. Under Chrome, select "Settings, Extensions". Make sure "Developer mode" is checked. Click on "Load unpacked extension..." and select the folder where the extension is unzipped to.</p>
	<p align="center"><img src="images/chrome01.png" /></p>
	<p>After you install the extension, click through to its options page and generate a PGID. Make sure to save the QR-code of the PGID to disk.</p>
	<p align="center"><img src="images/chrome02.png" /></p>
	<p>In its current form, the PGID is only ever stored in memory. Whenever you restart Chrome, you need to go to options to load the QR-code of your PGID into memory. For maximum security, it is best that the PGID is never transferred over public network or stored on a foreign server. It seems to me QR-code is one good way by which a PGID can be transferred quickly from one device to another simply by scanning with the camera, although there exists many other local means of transfer eg. Bluetooth.</p>
	<p>There are many possible implementations that I can think of. Conceivably, the best approach is to have one vault-like software on each device that has access to the private key. Other software will simply communicate with the vault through IPC to invoke the various functions, without ever having access to the content of the private key. The PGID can be further protected using symmetric encryption (using a password, PIN, pattern etc.) so that it needs to be unlocked before use. This means even if the device is stolen, the thief will not have access to the private key. I have an unfinished prototype running under Windows, where the Chrome extension talks to the vault via native messaging, so the idea is certainly feasible.</p>
	<h2 align="center"><a href="login.php">ENTER DEMO SITE</a></h2>
	<p>PS: Source code for the demo site can be downloaded <a href="downloads/pgid_php.zip">here</a>. It is written in PHP. 
</body>
</html>
