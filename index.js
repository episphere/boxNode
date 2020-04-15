//console.log('index.js loaded')
const port = 8000;
const util = require('util')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const open = require('open');
const fetch = require("node-fetch");
const prompt = require('prompt-sync')();
const fs = require('fs');
const readline = require("readline");
const streamPipeline = util.promisify(require('stream').pipeline)

const client_id = '52zad6jrv5v52mn1hfy1vsjtr9jn5o1w'
const client_secret = '2rHTqzJumz8s9bAjmKMV83WHX1ooN4kT'
let token = ""
let tokenResponse = {}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });
  

function readParms(str){
    str=str.replace(/[\?\#]/g,'&').replace(/^\&/,'')

    let parms={}
    str.split('&').forEach(aa=>{
        aa = aa.split('=')
        parms[aa[0]]=aa[1]
    })
    return parms
}
async function getToken(code){
    fetch('https://api.box.com/oauth2/token',{
        method:"POST",
        body:`grant_type=authorization_code&code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(response => response.json())
    .then(data => {
        tokenResponse = data
        token = tokenResponse.access_token
        //console.log(token)
        rl.prompt();
        //cliLoop()
    })
}
let test = 'abc'
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.get('/',(req,res) => {
    //console.log(req.url)
    let url = req.url;
    let querystring = url.substring(url.indexOf('?') + 1)
    let params = readParms(querystring)
    //console.log(JSON.stringify(params))
    if(params.hasOwnProperty('code')){
        //console.log('CODE: '  + params.code)
        getToken(params.code)
    }
    res.send('Thanks! You can close this browser now.')
    //browser.close()
    server.close()

})

//app.get('/', (req, res) => res.send('Hello World! 1'))
/*
app.post('/',(req,res) =>{
    
});
*/
 /*
expressApp.use(function(req, res, next){
    console.log(req);
    next();
})*/
let server = app.listen(port, () => {})



let url=`https://account.box.com/api/oauth2/authorize?client_id=${client_id}&response_type=code&redirect_uri=http://localhost:8000/`
let browser = open (url)


let cmd = ""
let currFolder = '0'

rl.on('line', async (line)=>{
    cmd = line
    if(cmd != null){
        let cmdParams = cmd.split(/\s+/)
        //console.log(`Received:` + cmd);
        if(cmdParams[0] == 'ls'){
            if(cmdParams.length > 1){
                let idOfLocation = await findLocation(cmdParams[1]);
                if(idOfLocation == -2){
                    console.log('ERROR: Type Mismatch')
                }
                else if (idOfLocation == -1){
                    console.log('ERROR: Specified location not found')
                }
                else{
                    let r = await fetch('https://api.box.com/2.0/folders/' + idOfLocation + '/items',{
                        method:"GET",
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        //console.log(JSON.stringify(data))
                        //console.log(data)
                        let folderNames = parseFolderItems(data)                
                    })
                }
            }
            else{
                let r = await fetch('https://api.box.com/2.0/folders/' + currFolder + '/items',{
                    method:"GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                })
                .then(response => response.json())
                .then(data => {
                    //console.log(data)
                    //console.log(JSON.stringify(data))
                    let folderNames = parseFolderItems(data)                
                })
            }
        }
    
        else if(cmdParams[0] == 'download'){
            if(cmdParams.length == 3){
                console.log('Beginning download');
                let loc = findLocation(cmdParams[1])
                
                download(cmdParams[1], cmdParams[2])
                .then(function(res){
                    console.log('finished!')
                })
                
            }
            else{
                console.log('The download command requires 2 parameters')
            }
            
            
        }

        else if(cmdParams[0] == 'cd'){
            let dest = cmdParams[1]
            //copy(src, dest)
            await changeDir(dest);
        }

    }
    //cmd = "quit";
    //console.log(cmd)
    rl.prompt();
}).on('close', () => {
    console.log('Have a great day!');
    process.exit(0);
});
    

function parseFolderItems(response){
    let items = response.entries;
    let toReturn = [];
    for(let i = 0; i < items.length; i++){
        let item = items[i];
        console.log(item.name)
        if(item.type == 'folder'){
            toReturn.push(item.name + '/')
        }
        else{
            toReturn.push(item.name)
        }
        
    }
    return toReturn;
}

async function changeDir(dest){
    let id = await findLocation(dest, expected="folder");
    if(id == -1){
        console.log('Folder not found');
    }
    else if(id == -2){
        console.log(dest + ' is not a folder');
    }
    else{
        currFolder = id;
    }
}
/*
async function findFolder(folder){
    let startFolder = currFolder;
    if(folder.startsWith('/')){
        startFolder = 
    }
}

function nameToId(name, response ){
    let items = response.entries;
    let toReturn = [];
    for(let i = 0; i < items.length; i++){
        let item = items[i];
        if(item.name == name){
            return item.id;
        }
    }
    return -1;
}*/

//returns number for current folder
async function findLocation(dest, expected = ""){
    let currLocation = currFolder;
    if(dest.startsWith('/')){
        currLocation = 0
        dest = dest.substring(1);
    }
    if(dest.endsWith('/')){
        dest = dest.substring(0, dest.length - 1);
    }
    arr = dest.split('/')
    let type = 'folder';
    for(let i = 0; i < arr.length; i++){
        let curr = arr[i]
        await fetch('https://api.box.com/2.0/folders/' + currLocation + '/items',{
            method:"GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(response => response.json())
        .then(data => {
            //console.log(JSON.stringify(data))
            //console.log(data)
            let found = false;
            for(let j = 0; j < data.entries.length; j++){
                let currEntry = data.entries[j];
                if(currEntry.name == curr){
                    currLocation = currEntry.id;
                    type = currEntry.type;
                    j = data.entries.length;
                    found = true;
                }
            }
            if(!found){
                //console.log('error, location ' + dest + ' not found');
                return -1;
            }
        })
    }

    if(expected != ""){
        if(type != expected){
            return -2;
        }
    }
    return currLocation;
    
    
    
}


async function download(id, fileName){

    return new Promise(function (fulfill, reject){
        fetch('https://api.box.com/2.0/files/' + id + '/content',{
            method:"GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(response => {
            if (!response.ok){
                reject('Unexpected response ' + response.statusText);
            }
            else{
                streamPipeline(response.body, fs.createWriteStream(fileName))
                .then(response => {
                    fulfill('Your download, ' + fileName + ' is complete!')
                });
            }
        })
        
    });
    
}

async function copy(src, dest){
    fetch('https://api.box.com/2.0/folders/' + src + '/copy',{
        method:"POST",
        body:{"parent":{"id":dest}},
        headers: {
            "Authorization": "Bearer " + token
        }
    })
}