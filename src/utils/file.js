// let fs = require('fs');
// let fpath = require('path');
// export const path =fpath.resolve('./')+'connection.json';
export function readFile(){
    return new Promise(function(resolve){
    let data = window.localStorage.getItem('config.connection');
    if(data){
        data = JSON.parse(data);
    }
    else{
        data = [];
    }
    resolve(data);
        // fs.readFile(path,{encoding:'utf-8',flag:'a+'},function(err,data){
        //     if(err){
        //         reject(err);
        //     }
        //     else{
        //         resolve(data);
        //     }
        // })
    })
}

export function writeFile(data){
    return new Promise(function(resolve){
        let config = window.localStorage.getItem('config.connection');
        if(config){
            config = JSON.parse(config);
            config.push(data);
        }
        else{
            config = [data];
        }
        window.localStorage.setItem('config.connection',JSON.stringify(config));
        resolve(config);
        // let dt = fs.readFileSync(path,{flag:'a+'}),current=[];
        // if(dt&&dt.toString()){
        //     dt = dt.toString();
        //     current = JSON.parse(dt);
        // }
        // current.push(data);
        // fs.writeFile(path,JSON.stringify(current),function(err,data){
        //     if(err){
        //         reject(err);
        //     }
        //     else{
        //         resolve(data);
        //     }
        // })
    })
}

export function writeFile1(data){
    return new Promise(function(resolve){
        window.localStorage.setItem('config.connection',JSON.stringify(data));
        resolve(data);
        // let dt = fs.readFileSync(path,{flag:'a+'}),current=[];
        // if(dt&&dt.toString()){
        //     dt = dt.toString();
        //     current = JSON.parse(dt);
        // }
        // current.push(data);
        // fs.writeFile(path,JSON.stringify(current),function(err,data){
        //     if(err){
        //         reject(err);
        //     }
        //     else{
        //         resolve(data);
        //     }
        // })
    })
}