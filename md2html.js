// Usage
// command [source file or directories] [-o output directory]

// Setting
// Path separator
var pathSeparator='\\'

// Read command line.
const argsObj = require('command-line-parser')();
console.log('receive command line imformations:')
console.log(argsObj)

// Load renders.
// Load syntax highlight.
var hljs = require('highlight.js'); // https://highlightjs.org/
// Load markdown-it with highlight.js.
var mdpre = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    return ''; // use external default escaping
  }
});
// Load math render.
let kt = require('katex'),
    tm = require('markdown-it-texmath').use(kt),
    md = mdpre.use(tm);

// The style from VSCode and Markdown+Math plugin.
// I copied them from source code of Markdown+Math.
// I don't understand CSS and style of html.
const clipTmpl = (html,usrcss) => `<!doctype html><html><head><meta charset='utf-8'>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.4.1/github-markdown.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.11.0/styles/default.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/katex.min.css">
<link rel="stylesheet" href="https://gitcdn.xyz/repo/goessner/mdmath/master/css/texmath.css">
<link rel="stylesheet" href="https://gitcdn.xyz/repo/goessner/mdmath/master/css/vscode-texmath.css">
${usrcss ? `<link rel="stylesheet" href="${usrcss}">` : ''}
</head><body class="markdown-body">
${html}
</body></html>`.replace('vscode-resource:','');

// Load file system.
var fs=require('fs');
//var ph = require('path');  

// Judge whether it is a dir.  
function exists(filePath){  
     return fs.existsSync(filePath);  
}  
function isDir(path){
  return exists(path)&&fs.statSync(path).isDirectory();
}

// Check if it is a md file.
function isMarkdownFile(name){
  const regex1=/.md$/;
  const regex2=/.markdown$/;
  if(regex1.exec(name)||regex2.exec(name)){
    return true;
  }
  else{
    return false;
  }
}
// Filter out markdown files.
function filterOutMarkdownFile(nameList){
  var tempList=new Array();
  for(var index in nameList){
    if(isMarkdownFile(nameList[index])){
      tempList.push(nameList[index]);
    }
  }
  return tempList;
}

// Get names of markdown files.
var totalNameList=new Array();
var aList=argsObj._args;
for (var nameIndex in aList){
  if(!exists(aList[nameIndex])){
    continue;
  }
  if(isDir(aList[nameIndex])){
    var tempArray=fs.readdirSync(aList[nameIndex])
    var tempArray2=new Array();
    for(var relativePath in tempArray){
      tempArray2.push(aList[nameIndex]+pathSeparator+tempArray[relativePath]);
    }
    totalNameList=totalNameList.concat(tempArray2)
  }
  else{
    totalNameList.push(aList[nameIndex]);
  }
}
console.log('Detected files:')
console.log(totalNameList)
console.log('Markdown files:')
console.log(filterOutMarkdownFile(totalNameList));

var markdownFiles=filterOutMarkdownFile(totalNameList);

// Detect output dir.
var outputPath=''
if(argsObj.o){
  outputPath=argsObj.o;
}else{
  outputPath='output'
}
if(!exists(outputPath)){
  fs.mkdirSync(outputPath)
}
outputPath=outputPath+pathSeparator

for(var index in markdownFiles){
  var tempFile=fs.readFileSync(markdownFiles[index])
  var result=clipTmpl(md.render(tempFile.toString()))
  var fileNewName=markdownFiles[index].replace(/.md$/,'.html')
  // lint fileNewName
  fileNewName=fileNewName.replace('\\','')
  fileNewName=fileNewName.replace(/^\./,'')
  var savePath=outputPath+fileNewName
  fs.writeFile(savePath,result,function(err){
    if(err){
    console.log(err);
    }
  })
}
