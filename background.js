var lastBalance = 0.0;
var lastResponse = "";

function loadAddresses()
{
	var addresses = localStorage["BrainPayAddress"];
	if (!addresses) {
		return;
	}
	return addresses;
}

function printBalance(balance)
{
	if (balance<1000){
		return ""+balance+"s";
	}
	if (balance<100000){
		if (balance<10000)
			return ""+(balance/100.0).toPrecision(2)+"u";
		return ""+(balance/100.0).toPrecision(3)+"u";
		   
	}
	if (balance<10000000){
		return ""+(balance/100000.0).toPrecision(2)+"m";
	}
	if (balance<100000000000){
		if (balance<100000000)
			return ""+(balance/100000000.0).toPrecision(2);
		return ""+(balance/100000000.0).toPrecision(3);
	}
	if (balance<100000000000000){
		if (balance<10000000000000)
			return ""+(balance/100000000000.0).toPrecision(2)+"k";
		return ""+(balance/100000000000.0).toPrecision(3)+"k";
	}
	return ""+(balance/100000000000000.0).toPrecision(2)+"M";
}

function TestPrintBalance(){
	console.log(printBalance(1));
	console.log(printBalance(12));
	console.log(printBalance(123));
	console.log(printBalance(1234));
	console.log(printBalance(12345));
	console.log(printBalance(123456));
	console.log(printBalance(1234567));
	console.log(printBalance(12345678));
	console.log(printBalance(123456789));
	console.log(printBalance(1234567890));
	console.log(printBalance(12345678901));
	console.log(printBalance(123456789012));
	console.log(printBalance(1234567890123));
	console.log(printBalance(12345678901234));
	console.log(printBalance(123456789012345));
	console.log(printBalance(1234567890123456));
}

function replaceAll(str, toReplace, replaceWith)
{
	var answer = str;
	var index = answer.indexOf(toReplace);
	while (index>=0){
		answer = answer.replace(toReplace, replaceWith);
		index = answer.indexOf(toReplace);
	}
	return answer
}

function readBalance() {
	var xhr	= new XMLHttpRequest();
	var addresses = loadAddresses();
	if (!addresses){
		return;
	}
	addresses=replaceAll(addresses, ",", "|")
	xhr.open("GET", "https://blockchain.info/multiaddr?active="+addresses);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				lastResponse = xhr.responseText;
				var resp = JSON.parse(lastResponse);
				//console.log(resp);
				var textToPrint = "";
				var amount = 0.0;
				
				for (var i=0;i<resp["addresses"].length;i++)
				{
					//console.log(resp["addresses"][i]["final_balance"]);
					amount+=resp["addresses"][i]["final_balance"];
				}
				
				textToPrint=printBalance(amount);
				
				lastBalance=amount;
				
				chrome.browserAction.setBadgeText({text: textToPrint});
				chrome.browserAction.setBadgeBackgroundColor({color: "#F7931A"})
			}
		}
	}
	xhr.send();
}

function onAlarm(alarm) {
	if (alarm && alarm.name == 'refresh') {
		readBalance();
	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.request == "request")
			sendResponse({data: lastResponse});
		if (request.request == "fetchAddresses")
		{
			if ((request.identifier==null)||(request.password==null)){
				return
			}
			readAddressesFromLoginInfo(request.identifier, request.password);
		}
	});

chrome.alarms.create('refresh', {periodInMinutes: 1.0});
chrome.alarms.onAlarm.addListener(onAlarm);
readBalance();