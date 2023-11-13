var prevtabid=null;

chrome.runtime.onInstalled.addListener(function() {
  chrome.action.setBadgeText({
    text: "OFF"
  });
});
var tabLoaded=false;
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    tabLoaded=true;
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if(tab.status!="complete") return;
  if(!tab.url.includes("github.com")){
    setInvalid(tab);
  }
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  if (prevState === "Invalid") return;
  if(prevState=== "Processing") return;
 
  if (prevState === "OFF") {
    chrome.tabs.sendMessage(tab.id, { action: "turnedOn" ,tab:tab});
  } else {

    chrome.tabs.sendMessage(tab.id, { action: "turnedOff" });
    setOff(tab);
  }
});

chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
  if(message.action==="invalid"){
    setInvalid(message.tab)
  }else if(message.action==="processing"){
    setProcessing(message.tab);
  }else if(message.action==="on"){
    tabLoaded=true;
        setOn(message.tab);
  }else if(message.action==="getResponse"){
    console.log(message.message);
    generateResponse(message.message)
  }
})

async function setInvalid(tab){
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: "Invalid"
  });
}
async function setProcessing(tab){
  console.log("Setting processing")
  await chrome.action.setBadgeText({
    tabId:tab.id,
    text:"Processing"
  })
}
async function setOff(tab){
  await chrome.action.setBadgeText({
    tabId:tab.id,
    text:"OFF"
  })
}
async function setOn(tab){
  await chrome.action.setBadgeText({
    tabId:tab.id,
    text:"ON"
  })
}

async function generateResponse(messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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' // Replace with your OpenAI API key
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // Specify the Ada model
      messages: messages
    })
  });

  const data = await response.json();
  console.log(data);
  // return data.choices[0].message.content;
}