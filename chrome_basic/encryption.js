// A wrapper around encryption functions in the Forge library.

"use strict";

var Encryption = {};
Encryption.AES = {};

Encryption.AES.iv = [0x84, 0xCD, 0x67, 0x30, 0x9D, 0x9E, 0x9F, 0xB6, 0x24, 0x2D, 0x27, 0x1D, 0xA3, 0x6D, 0xDF, 0x48, 0x94, 0x3B, 0x70, 0xC4, 0x09, 0x2F, 0xA3, 0x04, 0x29, 0xB1, 0x3E, 0xB2, 0xC1, 0x91, 0x1C, 0xF8];

/* "operation" must be an object with the following properties:
* 	key: the key used for encryption. Can be a typed array, a Forge ByteBuffer or a string
* 	data: the data to encrypt. Can be a typed array, a Forge ByteBuffer or a string
* 	oncomplete: called when the encryption is complete.
* 		The function will be passed the following parameters:
* 		ciphertext: the encrypted ciphertext in an ArrayBuffer
* 	onerror: called if the encryption fails.
* 		No parameters will be passed.
*/
Encryption.AES.encrypt = function(operation) {
	try {
		var key = new forge.util.ByteBuffer(operation.key);
		var cipher = forge.cipher.createCipher("AES-CBC", key);
		cipher.start({iv: Encryption.AES.iv});
		cipher.update(new forge.util.ByteBuffer(operation.data));
		cipher.finish();
		operation.oncomplete(forgeByteBufferToArrayBuffer(cipher.output));
	}
	catch (e) {
		if (operation.onerror) {
			operation.onerror();
		}
	}
};

/* "operation" must be an object with the following properties:
 * 	key: the key used for decryption. Can be a typed array, a Forge ByteBuffer or a string
 * 	data: the data to decrypt. Can be a typed array, a Forge ByteBuffer or a string
 * 	oncomplete: called when the decryption is complete.
 * 		The function will be passed the following parameters:
 * 		plaintext: the unencrypted plaintext in an ArrayBuffer
 * 	onerror: called if the decryption fails.
 * 		No parameters will be passed.
 */
Encryption.AES.decrypt = function(operation) {
	try {
		var key = new forge.util.ByteBuffer(operation.key);
		var decipher = forge.cipher.createDecipher("AES-CBC", key);
		decipher.start({iv: Encryption.AES.iv});
		decipher.update(new forge.util.ByteBuffer(operation.data));
		decipher.finish();
		operation.oncomplete(forgeByteBufferToArrayBuffer(decipher.output));
	}
	catch (e) {
		if (operation.onerror) {
			operation.onerror();
		}
	}
};

function forgeByteBufferToArrayBuffer(b) {
	var arr = new Uint8Array(b.length());
	for (var i = 0; i < arr.length; ++i) {
		arr[i] = b.getByte();
	}
	return arr.buffer;
}

Encryption.PBKDF2 = {}

/* "operation" must be an object with the following properties:
 *	password: the password as a string
 *	oncomplete: called when key derivation is complete.
 *		The function will be passed the following parameters:
 *		key: the key in an ArrayBuffer
 *	onerror: called if key derivation fails.
 *		No parameters will be passed.
 */
Encryption.PBKDF2.deriveKey = function(operation) {
	try {
		var salt = "\x3D\x29\x97\xA8\x84\xCC\xDA\x8D\x8C\x21\x19\x17\x7B\xC7\xAD\x64\x26\x3C\xA6\x4B\x31\x2F\x20\x0F\x80\x85\xE9\xD4\xE1\x47\x91\x66\x51\x27\xE5\xE9\x63\x6E\x4F\xD7\x6C\xE2\x49\x18\x00\x28\x65\xFE\x3A\x08\xB2\xA4\x64\x65\xE2\xFF\xB8\x8A\x03\x87\x97\x2C\x48\x4C\xD2\x73\x92\xB5\x68\x88\xCF\x06\xAD\x39\x48\x11\xE3\x2F\x40\x8C\x38\xD2\x73\xAB\x50\x55\xFB\x09\x53\x5C\x19\x46\x47\x92\xD6\xAD\x55\xFE\x15\x8D\x3E\x43\x1D\xDF\xD8\x75\x53\xB2\xD1\x76\x87\x13\x67\x1E\xB8\xA4\xA3\x81\xAE\x11\x6E\x25\x56\x6E\x26\xCE\xA8\x3B";
		var key = forge.pkcs5.pbkdf2(operation.password, salt, 4096, 32);
		operation.oncomplete(stringToArrayBuffer(key));
	}
	catch (e) {
		if (operation.onerror) {
			operation.onerror();
		}
	}
};

function stringToArrayBuffer(str) {
	var arr = new Uint8Array(str.length);
	for (var i = 0; i < str.length; ++i) {
		arr[i] = str.charCodeAt(i);
	}
	return arr.buffer;
}
