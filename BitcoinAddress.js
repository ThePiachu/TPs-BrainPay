function CheckAddressForValidity(address)
{
	try
	{
		var decoded = Bitcoin.Base58.decode(address);
		var end = decoded.length - 4;
		var checksum = Crypto.SHA256(Crypto.SHA256(decoded.slice(0, end), {asBytes: true}), {asBytes: true});
		if (checksum[0]!=decoded[end] || checksum[1]!=decoded[end+1] || checksum[2]!=decoded[end+2] || checksum[3]!=decoded[end+3])
		{
			return false; //address is invalid
		}
		return true;//address is valid
	} catch (err)
	{
		return false;
	}
}

function CheckAddressForValidityWithNetByte(address, netByte)
{
	var decoded = Bitcoin.Base58.decode(address);
	if (decoded[0]!=netByte)
	{
		return false;
	}
	return CheckAddressForValidity(address)
}