
function setNotice(notice, noticeID)
{
	var noticeParagraph=document.getElementById(noticeID);
	noticeParagraph.className="visible";
	noticeParagraph.innerHTML=notice;
}

function clearNotice()
{
	document.getElementById("status").innerHTML="";
	document.getElementById("status2").innerHTML="";
}


function saveBrainwallet()
{
	clearNotice();
	var passphrase=document.getElementById("passphrase").value;
	var compressed=document.getElementById("compressed").checked;
	
	var address = GenerateAddressFromPassphrase(passphrase, compressed)[1];
	
	localStorage["BrainPayAddress"] = address;
	
	//chrome.runtime.sendMessage({request: "fetchAddresses", identifier: identifier, password: password});
	
	location.reload();
}

function saveAddress()
{
	clearNotice();
	var select = document.getElementById("address");
	var addressInput = select.value;
	if (CheckAddressForValidityWithNetByte(addressInput, 0))
	{
		localStorage["BrainPayAddress"]=addressInput;
		setNotice("Saved.", "status2");
	} else {
		setNotice("Address specified is not valid.", "status2");
	}
}

// Restores select box state to saved value from localStorage.
function restoreOptions() {
	var address = localStorage["BrainPayAddress"];
	if (address)
	{
		var select = document.getElementById("address");
		select.value=address;
	}
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save2').addEventListener('click', saveAddress);
document.querySelector('#save').addEventListener('click', saveBrainwallet);