var express = require('express');
var { statSync, readdirSync, readFileSync, watchFile } = require('fs');
const { join, extname } = require('path');

const app = express();

var baseHtmlPath = __dirname+'\\index.html';
var baseHtml = readFileSync(baseHtmlPath).toString('ascii');
watchFile(baseHtmlPath,(curr,prec)=>{
    baseHtml = readFileSync(baseHtmlPath).toString('ascii');
    console.log('BaseHtml was modified at:',curr.mtime,'\nNew size:',baseHtml.length,'B');
});
var dirname = join(__dirname,'..');

app.get('*', (req,res) => {
    var path = join(dirname,req.path);
    
    var file = statSync(path,{throwIfNoEntry:false});
    if(file === undefined) {res.status(404).send('404 file not found.'); return;}
    if(file.isDirectory()){
        var showHidden = req.query.h == 't';

        var tableString = '';
        if(req.path.length > 1) tableString = `<tr><td>📁</td><td><a href="${join(req.path,'..') + (showHidden ? '?h=t':'')}">..</a></td><td>${readdirSync(join(path,'..')).length}</td></tr>`;
        var files = readdirSync(path);
        for(let fil of files){
            if(!showHidden && fil[0] == '.') continue;
            let npath = join(path,fil);
            var f = statSync(npath);
            var iD = f.isDirectory();
            tableString += `<tr><td>${iD?'📁':'📄'}</td><td><a href="${join(req.path,fil) + (showHidden ? '?h=t':'')}">${fil}</a></td><td>${iD?readdirSync(npath).length+' files':f.size+' B'}</td></tr>`;
        }
        var replTable = {
            '{dirname}': path,
            '{table}':  tableString
        }
        res.send(baseHtml.replace(/{dirname}|{table}/g,m=>replTable[m]));
    }else{
        res.type(extname(path)).sendFile(path);
    }
});

app.listen(80,()=>console.log('Server started on port 80'));