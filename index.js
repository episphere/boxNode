console.log('index.js loaded')
const port = 8000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const open = require('open');
const fetch = require("node-fetch");

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
        console.log(token)
    })
}
let test = 'abc'
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.get('/',(req,res) => {
    console.log(req.url)
    let url = req.url;
    let querystring = url.substring(url.indexOf('?') + 1)
    let params = readParms(querystring)
    console.log(JSON.stringify(params))
    if(params.hasOwnProperty('code')){
        console.log('CODE: '  + params.code)
        getToken(params.code)
    }
    res.send('Thanks! You can close this browser now.')
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
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))



let url=`https://account.box.com/api/oauth2/authorize?client_id=${client_id}&response_type=code&redirect_uri=http://localhost:8000/`
open (url)