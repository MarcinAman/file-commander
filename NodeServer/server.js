const http = require('http');
const url = require('url');
const fs = require('fs')

http.createServer((request, response) => {
    //localhost:8080/view?path=/
    const urlParts = url.parse(request.url, true);
    if (urlParts.pathname === '/view') { //View catalog
        const path = urlParts.query.path;

        response.writeHead(200, { 'Content-Type': 'text/HTML; charset=utf-8' });

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
        const path = urlParts.query.path;
        fs.readFile(path,(err,content)=>{
            if (err || !content.isFile()){
                response.write(`{"path": "${path}","content": "error"}`)
            }
            else{
                response.write(JSON.stringify({path: path,content: content.toString().split('\n')}))
            }
        })
    }
    else if(urlParts.pathname === '/copy'){ //Copy file or catalog
        //localhost:8080/copy?path=/etc/passwd|/bin
        const acc = path.split('|')
        fs.lstat(acc[0],(err,cont) => {
           if(cont.isDirectory()){
               response.write(`{"path": "${path}","content": "directory"}`)
           }
           else if(cont.isFile()){
               fs.copyFile(acc[0],acc[1],(err)=>{
                   if(err){
                       response.write(`{"path": "${path}","content": "error"}`)
                   }
                   else{
                       response.write(`{"path":"${path}","content":"success"}`)
                   }
               })
           }
           else{ //error and neither file nor directory
               response.write(`{"path": "${path}","content": "error"}`)
           }
        })
    }
    else if(urlParts.pathname === '/remove'){ //remove file or catalog
        //move /dev/null?
        //localhost:8080/remove?path=/etc/passwd

        fs.lstat(path,(err,cont) => {
            if(cont.isDirectory()){
                fs.rmdir(path,(err)=>{
                    if(err){
                        response.write(`{"path": "${path}","content": "error"}`)
                    }
                    else{
                        response.write(`{"path":"${path}","content":"success"}`)
                    }
                })
            }
            else if(cont.isFile()){
                fs.copyFile(path,'/dev/null',(err)=>{
                    if(err){
                        response.write(`{"path": "${path}","content": "error"}`)
                    }
                    else{
                        response.write(`{"path":"${path}","content":"success"}`)
                    }
                })
            }
            else{ //error and neither file nor directory
                response.write(`{"path": "${path}","content": "error"}`)
            }
        })
    }
    else if(urlParts.pathname === '/rename'){ //rename

    }
    else {
        /*error 404?*/
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.write('\n');

        response.end();
    }
}).listen(8080);
