const port = 8000;
const open = require('open');
const fetch = require("node-fetch");
const BoxSDK = require('box-node-sdk')
const http = require('http')


const client_id = '52zad6jrv5v52mn1hfy1vsjtr9jn5o1w'
const client_secret = '2rHTqzJumz8s9bAjmKMV83WHX1ooN4kT'
let token = ""
let tokenResponse = {}

let client = ""

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
        //refresh_token = tokenResponse.refresh_token
        //expireTime = tokenResponse.expires_in
        console.log(JSON.stringify(tokenResponse))
        client = BoxSDK.getBasicClient(token)
        //cliLoop()
    })
}
const server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    let url = req.url;
    let querystring = url.substring(url.indexOf('?') + 1)
    let params = readParms(querystring)
    //console.log(JSON.stringify(params))
    if(params.hasOwnProperty('code')){
        //console.log('CODE: '  + params.code)
        getToken(params.code)
    }
    res.write('Thanks! You can close this browser now.')
    //browser.close()
    server.close();
    res.end();
  }).listen(8000);

  let url=`https://account.box.com/api/oauth2/authorize?client_id=${client_id}&response_type=code&redirect_uri=http://localhost:8000/`
  let browser = open (url)