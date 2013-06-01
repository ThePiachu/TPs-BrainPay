function getCharset()
{
	var toParse = document.documentElement.outerHTML;
	//27-34 
	//123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
	var searchPattern = new RegExp("[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{27,34}","g");
	
	var found = toParse.match(searchPattern);
	var answer = new Array();
	
	for (var i=0;i<found.length;i++)
	{
		if (CheckAddressForValidity(found[i])){
			answer.push(found[i]);
		}
	}
	return answer;
}

getCharset();