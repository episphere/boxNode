#!/usr/bin/env node
const { program } = require('commander');
const {Storage} = require('@google-cloud/storage');
const BoxSDK = require('box-node-sdk')
const storage = new Storage();

 
program
  .option('-b, --bucket <type>', 'select bucket')
  .option('-i, --id <type>', 'box file id')
  .option('-d, --dest <type>', 'output file name')
  .option('-t --token <type>', 'authentication token');
program.parse(process.argv);

download(program);

function download(program){
    if(program.bucket === undefined){
        console.log('Must specify a bucket');
        return;
    }
    if(program.id === undefined){
        console.log('Must specify a box id');
        return;
    }
    if(program.dest === undefined){
        console.log('Must specify a destination')
    }
    if(program.token === undefined){
        console.log('Must specify an authentication token')
    }

    client = BoxSDK.getBasicClient(program.token)


    client.files.getReadStream(program.id,null,function(error,stream){
        if(error){
            //console.log('There was an error!')
            console.log(program.id);
            console.log('There was an error getting the readstream from box!')
            return;
        }
        else{
            //const bucket = 'boxnodetesting';
            const bucket = storage.bucket(program.bucket);
            const blob = bucket.file(program.dest);
            const output = blob.createWriteStream();
            //var output = fs.createWriteStream('/Users/shenbn/Documents/test/boxNode/test.txt.gz');
            stream.pipe(output)
            stream.on('end',()=>{
                console.log('Your download, ' + program.dest + ' is complete!')
            });

        }
    });
}