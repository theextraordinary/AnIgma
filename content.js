var lock=true;
// Clear the storage
// chrome.storage.local.clear(function() {
//   console.log('Storage cleared successfully');
// });


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message.action==="turnedOn"){

        performAnalysis(message.tab).then(result=>{
          console.log(result);
         
        })
        .catch(error=>{})
        lock=false;
    }else if(message.action==="turnedOff"){
      lock=true;
    }

})

async function performAnalysis(currentTab){
  console.log("getting analysis");
  Processing(currentTab);
  const url = currentTab.url;
  if (url.includes("github.com")) {
    const { owner, project } = extractOwnerAndProjectFromUrl(url);
    if (owner && project) {

      const modelPromise=getKey(owner,project);
      const foundModel=await modelPromise;

      if(foundModel!=undefined){
        console.log("present in storage");
        On(currentTab)
        return modelPromise;
      }else{
        console.log("Owner:", owner);
        console.log("Project:", project);
        const path=`https://api.github.com/repos/${owner}/${project}/contents`
        const finalCodeFiles=await getRepo(path,currentTab)
        // console.log(finalCodeFiles);
        const textFiles=objToMap("contents",finalCodeFiles);
        // console.log(textFiles);

        // //Api here
        // const newModel=await getModel(textFile);
        setKey(owner,project,textFiles)
      //   const filePath=extractFilePathFromUrl(url)
      //   console.log(filePath);
      //   const codeFile=await getRepo(path+"/"+filePath,currentTab);
      //  //if(await checkInvalid(currentTab)) return;
      //   textFile=codeFile[0].name+": \n"+codeFile[0].code
        On(currentTab);
        return new Promise((resolve,reject)=>{
          resolve(textFiles);
        })
      }
      
    } else {
      Invalid(currentTab);
    }
  } else {
      Invalid(currentTab);
  }
}
function objToMap(name,files){
  const map=[]
  for(const dictionary of files){
 
    if(dictionary.type==="dir"){
      const recMap=objToMap(name+"/"+dictionary.name,dictionary.subfile);
      for(const dic of recMap){
        map.push(dic);
      }
    }else{
      const temp={}
      temp.name=name+"/"+dictionary.name;
      temp.code=dictionary.code;
      map.push(temp);
     // text+=name+"/"+dictionary.name+": \n"+dictionary.code+"\n";
    }
  }
  return map

}
function getKey(owner,project){
  console.log("getting key");
  const key=`${owner}/${project}`;
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, function(result) {
      if (chrome.runtime.lastError) {
      } else {
        console.log(result[key]);
        resolve(result[key]);
      }
    });
  });
}
function setKey(owner,project,model){
  const key=`${owner}/${project}`;
  var data = {};
  data[key] = model;
  chrome.storage.local.set(data, function() {
    console.log("Key-value pair set in storage.");
  });

}

async function checkInvalid(tab){
  const state=await chrome.action.getBadgeText({ tabId: tab.id });
  if(state==="Invalid"){
    return true;
  }else{
    return false;
  }
}

function Invalid(tab){
  chrome.runtime.sendMessage({action:"invalid",tab:tab});
  lock=true;
}
function Processing(tab){

  chrome.runtime.sendMessage({action:"processing",tab:tab});
  lock=true;
}
function On(tab){
  chrome.runtime.sendMessage({action:"on",tab:tab});
  // lock=false;
}
const accessToken="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";
// Function to extract owner and project information from GitHub URL
function extractOwnerAndProjectFromUrl(url) {
  const regex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+).*$/;
  const match = url.match(regex);

  if (match && match.length >= 3) {
    const owner = match[1];
    const project = match[2];
    return { owner, project };
  }

  return null;
}
function extractFilePathFromUrl(url) {
  const regex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/[^/]+\/(.+)$/;
  const match = url.match(regex);

  if (match && match.length >= 4) {
    const filePath = match[3];
    return filePath;
  }

  return null;
}


async function getRepo(apiUrl,path,tab) {
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept": "application/vnd.github.v3+json"
    }
  });

  if (response.ok) {
    const codeFilesJson = await response.json();
      //console.log("Code Files:", codeFilesJson);
      // Pass the code files to your JavaScript model for further processing
      const codeData=await getCodes(codeFilesJson,apiUrl,tab);
      
      return codeData;
  } else {
    Invalid(tab)
    
  }
}


async function getCodes(dataArray, path, tab) {
  const data = [];
  for (const dictionary of dataArray) {
    const fileUrl = dictionary.download_url;
    const temp = {};
    temp.name = dictionary.name;
    if(!impFiles(temp.name.split('/').pop())){
      data.push(temp);
      continue;
    }
    if (dictionary.type === "dir") {
      temp.type = "dir";
      const subfile = await getRepo(`${path}/${dictionary.name}`, tab); // Await the subfile result
      temp.subfile = subfile;
    } else {
      temp.type = "file";
      const response = await fetch(fileUrl);
      const content = await response.text();
      temp.code = content;
    }

    data.push(temp);
  }
  return data;
}

function garbageFiles(fileName){
  if(fileName.endsWith(".log")||fileName.endsWith(".tmp")||
  fileName.endsWith(".bak")||fileName.endsWith("swp")||fileName.endsWith(".swo")||fileName.endsWith(".DS_Store")||
  fileName.endsWith(".min.js")||fileName.endsWith(".min.css")||fileName.endsWith(".jpeg")||
  fileName.endsWith(".png")||fileName.endsWith(".ipynb")||fileName.endsWith(".gitignore")){
    return true;
  }
  return false;
}
function impFiles(fileName){
  if(fileName.endsWith(".md")||fileName.endsWith(".yml")||
  fileName.endsWith(".py")||fileName.endsWith(".java")||fileName.endsWith(".html")||fileName.endsWith(".css")||
  fileName.endsWith(".js")||fileName.endsWith(".in")||fileName.endsWith(".json")||
  fileName.endsWith(".cpp")||!fileName.includes(".")){
    return true;
  }
  return false;
}




 document.addEventListener("mouseup", function(event) {
        if (lock) {
            return;
          }
          var previousSelection = ""; 

          document.addEventListener('keydown', async function(event) {
            if(lock) return;
            if (event.ctrlKey && event.key === 'y') {
              var selection = window.getSelection();
              if (selection && selection.toString().length > 0 && selection.toString() !== previousSelection) {
                var selectedText = selection.toString();
                previousSelection = selectedText;
                console.log(selectedText);
                const answer=await queryText(selectedText);
                console.log(answer);
              }
            }
          });

          
          
})
async function queryText(question){
  const delimeter="####"
  const prompt=`You are a code expert who has the knowledge of every programming language
   and your task is to
   help the user to understand the line of code from the project. Your task is to answer user's query code line and respond 
   with the natural language meaning of that line. You can add some analogy
   for better understanding of the line.The user asked query is delimetered by ${delimeter}.
      `

      messages =  [  
        {'role':'system', 
         'content': prompt},    
        {'role':'user', 
         'content': `${delimeter}${question}${delimeter}`},  
        ] 
    
   chrome.runtime.sendMessage({action:"getResponse",message:messages});   

}