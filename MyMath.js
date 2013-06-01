function HashStringReturnString(string)
{
	var hash=Crypto.SHA256(string, {asBytes: true});
	return Crypto.util.bytesToHex(hash);
}

function HashHexStringReturnString(string)
{
	var hash=Crypto.SHA256(Crypto.util.hexToBytes(string), {asBytes: true});
	return Crypto.util.bytesToHex(hash);
}

function Byte2Hex(bytes)
{
	return Crypto.util.bytesToHex(bytes);
}

function Hex2Byte(hex)
{
	return Crypto.util.hexToBytes(hex);
}

function Base58Encode(string)
{
	return Bitcoin.Base58.encode(string);
}