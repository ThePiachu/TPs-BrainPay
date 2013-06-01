
function GeneratePrivateKeyFromPassphrase(passphrase)
{
	return HashStringReturnString(passphrase);
}

function GeneratePrivateKeyFromPassphraseWithCompressed(passphrase, compressed)
{
	var hash=GeneratePrivateKeyFromPassphrase(passphrase);
	if (compressed)
	{
		return hash+"01";
	} else {
		return hash;
	}
}

function GenerateWIF(privateKey, compressed)
{
	var step2="80"+privateKey;
	if (compressed)
	{
		step2+="01";
	}
	var step5=HashHexStringReturnString(HashHexStringReturnString("80"+privateKey)).slice(0, 8);
	var step7=Bitcoin.Base58.encode(Hex2Byte(step2+step5));
	return step7;
}

function GeneratePublicKeyFromPrivateKey(privateKey, compressed)
{
	var key=new Bitcoin.ECKey(Hex2Byte(privateKey));
	var curve=getSECCurveByName("secp256k1");
	var keyPair=curve.getG().multiply(key.priv);
	
	var x=keyPair.getX().toBigInteger();
	var y=keyPair.getY().toBigInteger();
	
	var xStr=Byte2Hex(integerToBytes(x, 32));
	var yStr=Byte2Hex(integerToBytes(y, 32));
	if (compressed)
	{
		if (y.isEven())
		{
			return "02"+xStr;
		} else {
			return "03"+xStr;
		}
	} else {
		return "04"+xStr+yStr;
	}
}

function GenerateHash160FromPublicKey(publicKey)
{
	return Byte2Hex(Bitcoin.Util.sha256ripe160(Hex2Byte(publicKey)));
}

function GenerateAddressFromHash(hash160)
{
	return GenerateAddressFromHashWithNetByte(hash160, "00");
}

function GenerateAddressFromHashWithNetByte(hash160, netByte)
{
	var address=netByte+hash160;
	var checksum=HashHexStringReturnString(HashHexStringReturnString(address)).slice(0, 8);
	address=address+checksum;
	return Bitcoin.Base58.encode(Hex2Byte(address));
}

function GenerateAddressFromPassphrase(passphrase, compressed)
{
	var privateKey=GeneratePrivateKeyFromPassphrase(passphrase);
	var publicKey=GeneratePublicKeyFromPrivateKey(privateKey, compressed);
	var hash160=GenerateHash160FromPublicKey(publicKey);
	var address=GenerateAddressFromHash(hash160);
	
	return [privateKey, address];
}