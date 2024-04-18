var Jimp = require('jimp');
var {readdirSync} = require('fs');
var {join} = require('path');

var files = readdirSync(join(__dirname,'block')).filter((val)=>(val.endsWith('.png')));
var i = new Jimp();
console.log(files);