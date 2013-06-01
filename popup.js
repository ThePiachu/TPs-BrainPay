var DeveloperAddress = "1TPiDevCuXc1aTLJYw3E9HVuhWnkWGJoK";

function callback(variable){
	//getting all addresses into one array
	var array = new Array();
	for (var i=0;i<variable.length;i++)
	{
		for (j=0;j<variable[i].length;j++)
		{
			array.push(variable[i][j]);
		}
	}
	//removing duplicates
	var addresses = new Array();
	var toAdd = true;
	
	for (var i=0;i<array.length;i++)
	{
		toAdd=true;
		for (var j=0;j<addresses.length;j++)
		{
			if (array[i]==addresses[j])
			{
				toAdd=false;
			}
		}
		if (toAdd)
		{
			addresses.push(array[i]);
		}
	}
	
	if (addresses.length>0)
	{
		//printing them out
		for (var i=0;i<addresses.length;i++)
		{
			newAddressWithAddress(addresses[i]);
		}
	} else {
		//nothing found
		setNotice("No matching addresses found");
	}
}

function handleTabs(tabs){
	for (var i=0;i<tabs.length;i++){
		chrome.tabs.executeScript(null, {file: "bitcoinjs-min.js"});
		chrome.tabs.executeScript(null, {file: "BitcoinAddress.js"});
		chrome.tabs.executeScript(null, {file: "contentScript.js"}, callback);
	}
}

function scour() {
	clearNotice();
	clearTXID();
	chrome.tabs.query({active: true, highlighted:true}, handleTabs);
}
	
function clearPassphrase()
{
	document.getElementById("passphrase").value="";
}

function setTXID(txid)
{
	var txidParagraph=document.getElementById("txid");
	txidParagraph.className="visible";
	txidParagraph.innerHTML=txid;
}

function clearTXID()
{
	var txid=document.getElementById("txid");
	txid.className="hidden";
	txid.value="";
}

function makeFirstDivVisible()
{
	document.getElementById("firstDiv").className="visible";
	document.getElementById("secondDiv").className="hidden";
}

function makeSecondDivVisible()
{
	document.getElementById("secondDiv").className="visible";
	document.getElementById("firstDiv").className="hidden";
}

function setNotice(notice)
{
	var noticeParagraph=document.getElementById("notice");
	noticeParagraph.className="visible";
	noticeParagraph.innerHTML=notice;
	window.scrollTo(0, 0);
}

function clearNotice()
{
	var notice=document.getElementById("notice");
	notice.className="hidden";
	notice.value="";
}

function Cancel()
{
	clearNotice();
	clearTXID();
	
	makeFirstDivVisible();
}

function newAddress()
{
	var table=document.getElementById("BitcoinAddresses");
	var numberOfrows=table.rows.length-1;
	var row = table.insertRow(-1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);

	cell1.innerHTML="<input type=\"text\" id=\"address"+numberOfrows+"\" name=\"address\" size=35 value=\"\"></input>";
	cell2.innerHTML="<input type=\"text\" id=\"amount"+numberOfrows+"\" name=\"amount\" size=5 value=\"0.0\"></input>";
}

function newAddressWithAddress(address)
{
	var table=document.getElementById("BitcoinAddresses");
	var numberOfrows=table.rows.length-1;
	var row = table.insertRow(-1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);

	cell1.innerHTML="<input type=\"text\" id=\"address"+numberOfrows+"\" name=\"address\" size=35 value=\""+address+"\"></input>";
	cell2.innerHTML="<input type=\"text\" id=\"amount"+numberOfrows+"\" name=\"amount\" size=5 value=\"0.0\"></input>";
}

function Prepare()
{
	clearNotice();
	var passphrase=document.getElementById("passphrase").value;
	var compressed=document.getElementById("compressed").checked;
	
	var response = GenerateAddressFromPassphrase(passphrase, compressed);
	var privateKey = response[0];
	var address = response[1];
	
	var addressToCall="https://blockchain.info/unspent?active="+address;
	
	var addresses=document.getElementsByName("address");
	var amounts=document.getElementsByName("amount");
	
	var table=document.getElementById("BitcoinAddresses2");
	while (table.rows.length>1)
	{
		table.deleteRow(-1);
	}
	
	for (var i=0;i<addresses.length;i++)
	{//checking for invalid addresses
		if ((addresses[i].value!="") && !CheckAddressForValidityWithNetByte(addresses[i].value, 0))
		{
			setNotice("" + addresses[i].value + " is not a valid Bitcoin address, please fix or delete the entry.");
			return;
		}
	}
	
	for (var i=0;i<addresses.length;i++)
	{
		if ((addresses[i].value!="") && (CheckAddressForValidityWithNetByte(addresses[i].value, 0) && (parseFloat(amounts[i].value)>0.0)))
		{
			var row = table.insertRow(-1);
			var cell1=row.insertCell(0);
			var cell2=row.insertCell(1);
			
			cell1.setAttribute("name","addressToSend");
			cell1.setAttribute("value",addresses[i].value);
			var cellText=document.createTextNode(addresses[i].value);
			cell1.appendChild(cellText);
			
			cell2.setAttribute("name","amountToSend");
			cell2.setAttribute("value",amounts[i].value);
			cellText=document.createTextNode(parseFloat(amounts[i].value));
			cell2.appendChild(cellText);
		}
	}
	
	if (table.rows.length<2)
	{
		setNotice("No valid Bitcoin addresses or transfer amounts specified.");
		return;
	}
	
	var xhr	= new XMLHttpRequest();
	xhr.open("GET", addressToCall);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				clearNotice();
				var tx_unspent = xhr.responseText;
				//var resp = JSON.parse(xhr.responseText);
				
				var eckey = new Bitcoin.ECKey(Hex2Byte(privateKey));
				eckey.setCompressed(compressed);
				TX.init(eckey);
				TX.parseInputs(tx_unspent, TX.getAddress());
				console.log("Balance - "+TX.getBalance());
				var totalAmount=0.0;
				for (var i=0;i<addresses.length;i++)
				{
					var amount = parseFloat(amounts[i].value)*0.001;
					if ((addresses[i].value!="") && (amount>0.0))
					{
						console.log("Adding output - "+amount);
						TX.addOutput(addresses[i].value, amount);
						totalAmount+=amount;
					}
				}
				var developerDonation = parseFloat(document.getElementById("donation").value);
				console.log("developerDonation - "+developerDonation);
				if (developerDonation>0.0)
				{
					TX.addOutput(DeveloperAddress, developerDonation*0.001);
					totalAmount+=developerDonation*0.001;
					
					var row = table.insertRow(-1);
					var cell1=row.insertCell(0);
					var cell2=row.insertCell(1);
					
					cell1.setAttribute("name","addressToSend");
					cell1.setAttribute("value",DeveloperAddress);
					var cellText=document.createTextNode(DeveloperAddress);
					cell1.appendChild(cellText);
					
					cell2.setAttribute("name","amountToSend");
					cell2.setAttribute("value",developerDonation);
					cellText=document.createTextNode(developerDonation);
					cell2.appendChild(cellText);
				}
				var minerFee = parseFloat(document.getElementById("fee").value);
				console.log("Miner fee - "+minerFee);
				if (minerFee>0.0)
				{
					totalAmount+=minerFee*0.001;
					
					var row = table.insertRow(-1);
					var cell1=row.insertCell(0);
					var cell2=row.insertCell(1);
					
					cell1.setAttribute("name","addressToSend");
					cell1.setAttribute("value","Fee");
					var cellText=document.createTextNode("Fee");
					cell1.appendChild(cellText);
					
					cell2.setAttribute("name","amountToSend");
					cell2.setAttribute("value",minerFee);
					cellText=document.createTextNode(minerFee);
					cell2.appendChild(cellText);
				}
				console.log("Balance - "+TX.getBalance());
				var difference = (TX.getBalance()/100000000.0)-totalAmount;
				if (difference < 0.0)
				{
					setNotice("Attempting to send "+totalAmount+" BTC. Only "+(TX.getBalance()/100000000.0)+"BTC available.");
					return;
				} else if (difference > 0.0)
				{
					TX.addOutput(address, difference);
				}
				
				
				var sendTx = TX.construct();
				
				document.getElementById("json").value=TX.toBBE(sendTx);
				document.getElementById("raw").value=Crypto.util.bytesToHex(sendTx.serialize());
				makeSecondDivVisible();
			} else
			{
				if (xhr.responseText=="No free outputs to spend")
				{
					setNotice("Blockchain can't find any unspent outputs.\nEither the address has no money, or you made a mistake entering your passphrase (generating a different address).");
					return;
				} else {
					setNotice("Got an unexpected response from blockchain - "+xhr.responseText);
					return;
				}
			}
		}
	}
	xhr.send();
	
	setNotice("Preparing transaction...");
}

function SendTransaction()
{
	clearNotice();
	var addressToCall="https://blockchain.info/pushtx?tx="+document.getElementById("raw").value;
	//var txData = 'tx=' + tx;
	
	
	
	var xhr	= new XMLHttpRequest();
	xhr.open("POST", addressToCall);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				clearNotice();
				console.log(xhr.responseText);
				makeFirstDivVisible();
				clearPassphrase();
			}
		}
	}
	xhr.send();
	setNotice("Sending transaction...");
}


document.addEventListener('DOMContentLoaded', function ()
{
	document.querySelector('#newAddress').addEventListener('click', newAddress);
	document.querySelector('#prepare').addEventListener('click', Prepare);
	document.querySelector('#send').addEventListener('click', SendTransaction);
	document.querySelector('#scour').addEventListener('click', scour);
	document.querySelector('#cancel').addEventListener('click', Cancel);
});