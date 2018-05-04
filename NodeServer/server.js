const http = require('http');
const url = require('url');
const fs = require('fs')
const resolve = require('path').resolve

http.createServer((request, response) => {
    //localhost:8080/view?path=/
    const urlParts = url.parse(request.url, true);
    response.writeHead(200, { 'Content-Type': 'text/HTML; charset=utf-8' });
    if (urlParts.pathname === '/view') { //View catalog
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
    }
    else if(urlParts.pathname === '/show'){ //Show file
        //localhost:8080/show?path=/etc/passwd
        const path = resolve(urlParts.query.path);
        fs.readFile(path,(err,content)=>{
            if (err){
                response.write(`{"path": "${path}","content": "error"}`)
            }
            else{
                response.write(JSON.stringify({path: path,content: content.toString().split('\n')}))
            }
        })
        response.end()
    }
    else if(urlParts.pathname === '/copy'){ //Copy file or catalog
        //localhost:8080/copy?path=/etc/passwd|/bin/file
        const path = resolve(urlParts.query.path);

        const acc = path.split('|')
        fs.lstat(acc[0],(err,cont) => {
            if(err){
                response.write(`{"path": "${path}","content": "${err.toString()}"}`)
                response.end()
            }
           else if(cont.isDirectory()){
                response.write(`{"path": "${path}","content": "directory"}`)
                response.end()
           }
           else if(cont.isFile()){
               fs.copyFile(acc[0],acc[1],(err)=>{
                   if(err){
                       response.write(`{"path": "${path}","content": "${err.toString()}"}`)
                       response.end()
                   }
                   else{
                       response.write(`{"path":"${path}","content":"success"}`)
                       response.end()
                   }
               })
           }
           else{ //error and neither file nor directory
               response.write(`{"path": "${path}","content": "error"}`)
               response.end()
           }
        })
    }
    else if(urlParts.pathname === '/remove'){ //remove file or catalog
        //localhost:8080/remove?path=/etc/passwd

        const path = resolve(urlParts.query.path);
        fs.lstat(path,(err,cont) => {
            if(err){
                response.write(`{"path": "${path}","content": "error"}`)
                response.end()
            }
            else if(cont.isDirectory()){
                fs.rmdir(path,(err)=>{
                    if(err){
                        response.write(`{"path": "${path}","content": "error"}`) //#TODO error while directory is not empty
                        response.end()
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
                        response.write(`{"path": "${path}","content": "${err.toString()}"}`)
                        response.end()
                    }
                    else{
                        response.write(`{"path":"${path}","content":"success"}`)
                        response.end()
                    }
                })
            }
            else{ //error and neither file nor directory
                response.write(`{"path": "${path}","content": "${err.toString()}"}`)
                response.end()
            }
        })
    }
    else if(urlParts.pathname === '/rename'){ //rename
        //localhost:8080/rename?path=/etc/passwd|/etc/pass
        const path = resolve(urlParts.query.path);
        const path_splitted = path.split('|')
        fs.rename(path_splitted[0],path_splitted[1],(e)=>{
            if(e){
                response.write(`{"path": "${path}","content": "${err.toString()}"}`)
                response.end()
            }
            else{
                response.write(`{"path":"${path}","content":"success"}`)
                response.end()
            }
        })
    }
    else {
        /*error 404?*/
        response.write(`{"path": "${path}","content": "Error, no such command"}`)

        response.end();
    }
}).listen(8080);
