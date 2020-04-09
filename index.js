//console.log('index.js loaded')
const port = 8000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const open = require('open');
const fetch = require("node-fetch");
const prompt = require('prompt-sync')();

const readline = require("readline");

const client_id = '52zad6jrv5v52mn1hfy1vsjtr9jn5o1w'
const client_secret = '2rHTqzJumz8s9bAjmKMV83WHX1ooN4kT'
let token = ""
let tokenResponse = {}
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
        cliLoop()
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
open (url)

async function cliLoop(){
    let cmd = ""
    let currFolder = '0'
    while(cmd != "quit" && cmd != null){
        cmd = prompt('>');
        if(cmd != null){
            let cmdParams = cmd.split(/\s+/)
            //console.log(`Received:` + cmd);
            if(cmdParams[0] == 'ls'){
                if(cmdParams.length > 1){
                    let r = await fetch('https://api.box.com/2.0/folders/' + cmdParams[1] + '/items',{
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
        }
        //cmd = "quit";
        //console.log(cmd)
    }
}

function parseFolderItems(response){
    let items = response.entries;
    let toReturn = [];
    for(let i = 0; i < items.length; i++){
        let item = items[i];
        console.log(item.name)
        toReturn.push(item.name)
    }
    return toReturn;
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