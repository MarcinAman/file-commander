const http = require('http');
const url = require('url');
const fs = require('fs')
const resolve = require('path').resolve
const express = require('express')
const app = express()


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/view*',(request,response) => {
    const urlParts = url.parse(request.url, true);
    const path = resolve(urlParts.query.path);

    fs.readdir(path,(err,files) => {
        if(err){
            response.write(`{"path": ${path}, "content": "error"}`)
        }
        else{
               let iter = 0
                response.write(`{"path": "${path}","content": [`)
                files.forEach(
                    (file) => {
                        fs.lstat(path,
                            (err,stat)=>{
                                response.write(
                                    `{
                                    "name": "${file}",
                                    "size": ${stat['size']},
                                    "directory": ${stat.isDirectory()},
                                    "file": ${stat.isFile()}
                                  }`
                                )
                                iter += 1
                                if(files.length === iter){
                                    response.write(']}')
                                    response.end()
                                }
                                else{
                                    response.write(',')
                                }
                            }
                        )
                    }
                )
            }
        })
})

app.get('/show*',(request,response) => {
    const urlParts = url.parse(request.url, true);
    const path = resolve(urlParts.query.path);

    fs.readFile(path,(err,content)=>{
        if (err){
            response.send(`{"path": "${path}","content": "error"}`)
        }
        else{
            response.send(JSON.stringify({path: path,content: content.toString().split('\n')}))
        }
     })
})

app.get('/copy*',(request,response) => {
    const urlParts = url.parse(request.url, true);
    const path = resolve(urlParts.query.path);
        const acc = path.split('|')
        fs.lstat(acc[0],(err,cont) => {
            if(err){
                response.send(`{"path": "${path}","content": "${err.toString()}"}`)
            }
           else if(cont.isDirectory()){
                response.send(`{"path": "${path}","content": "directory"}`)
           }
           else if(cont.isFile()){
               fs.copyFile(acc[0],acc[1],(err)=>{
                   if(err){
                       response.send(`{"path": "${path}","content": "${err.toString()}"}`)
                   }
                   else{
                       response.send(`{"path":"${path}","content":"success"}`)
                   }
               })
           }
           else{ //error and neither file nor directory
               response.send(`{"path": "${path}","content": "error"}`)
           }
        })
})

app.get('/remove*',(request,response) => {
    const urlParts = url.parse(request.url, true);
    const path = resolve(urlParts.query.path);
        fs.lstat(path,(err,cont) => {
            if(err){
                response.send(`{"path": "${path}","content": "error"}`)
            }
            else if(cont.isDirectory()){
                fs.rmdir(path,(err)=>{
                    if(err){
                        response.send(`{"path": "${path}","content": "error"}`) //#TODO error while directory is not empty
                    }
                    else{
                        response.write(`{"path":"${path}","content":"success"}`)
                        response.end()
                    }
                })
            }
            else if(cont.isFile()){
                fs.unlink(path,(err)=>{
                    if(err){
                        response.send(`{"path": "${path}","content": "${err.toString()}"}`)
                    }
                    else{
                        response.send(`{"path":"${path}","content":"success"}`)
                    }
                })
            }
            else{ //error and neither file nor directory
                response.send(`{"path": "${path}","content": "${err.toString()}"}`)
            }
        })
})

app.get('/rename',(request,response) => {
    const urlParts = url.parse(request.url, true);
    const path = resolve(urlParts.query.path);
    const path_splitted = path.split('|')
    fs.rename(path_splitted[0],path_splitted[1],(e)=>{
         if(e){
             response.send(`{"path": "${path}","content": "${err.toString()}"}`)
            }
            else{
                response.send(`{"path":"${path}","content":"success"}`)
            }
        })
    })

const server = app.listen(8080,() => {
    const host = server.address().address
    const port = server.address().port

    console.log("Listening at http://%s:%s", host, port)
})

