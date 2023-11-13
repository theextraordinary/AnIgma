const btn=document.getElementById("scan");
const lbl=document.getElementById("myLabel");
const btn2=document.getElementById("lock")

btn.addEventListener("click",async function(){
    const tabs=await chrome.tabs.query({active:true,currentWindow:true});
    lbl.textContent="Processing"
    chrome.tabs.sendMessage(tabs[0].id,{action:"clicking"});
})
var selected="";
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
    if(message.action==="selected"){
        selected=message.text;
        lbl.textContent=selected+"\nClick on Lock to lock it.";
    }
})
btn2.addEventListener("click",async function(){
    const tabs=await chrome.tabs.query({active:true,currentWindow:true});
    chrome.tabs.sendMessage(tabs[0].id,{action:"selectionDone"});
    lbl.textContent="Final text "+selected;

})