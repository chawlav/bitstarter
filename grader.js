#!/usr/bin/env node
/*



*/

var fs = require('fs');
var cheerio = require('cheerio');
var program = require('commander');
var HTMLFILE_DEFAULT="index.html";
var rest = require('restler');
var CHECKSFILE_DEFAULT="checks.json";
var htmlfile="result.html";

var assertFileExists = function(infile){
	var instr = infile.toString();
	if (!fs.existsSync(instr)){
		console.log("%s does not exist. Exiting.",instr);
		process.exit(1);

	}
	return instr;
};

var cheerioHtmlFile = function(htmlFile){
	return cheerio.load(fs.readFileSync(htmlFile));
};

var loadChecks = function(checksFile){
	return JSON.parse(fs.readFileSync(checksFile));
};

var checkHtmlFile = function(htmlFile, checksFile){
	$ = cheerioHtmlFile(htmlFile);
	var checks = loadChecks(checksFile).sort();
	var out = {};
	for (var ii in checks){
		var present = $(checks[ii].length > 0 );
		out[checks[ii]] = present;

	}
	return out;
};

var clone = function(fn){
	return fn.bind({});
};


var buildfn = function(htmlfile, checksFile) {
    var resp2file = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
         } else {
            console.error("Wrote %s", htmlfile);
            fs.writeFileSync(htmlfile, result);
            
        }
    };
    return resp2file;
};

var resp = function(htmlfile, checksfile){
	checkHtmlFile(htmlfile, checksfile);
};

var checkOnURL = function(u){
	var resp2file = buildfn(htmlfile,CHECKSFILE_DEFAULT);
	rest.get(u).on('complete', resp2file);
};
if (require.main == module){
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', 
				clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option	('-f, --file <html_file>','Path to index.html', 
				clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <html_file>', 'URL')
			
		.parse(process.argv);
	var checkURL = checkOnURL(program.url);
	var checkJson=checkHtmlFile(program.file, program.checks);
	var outJson=JSON.stringify(checkJson,null,4);
	console.log(outJson);
}else {
	exports.checkHtmlFile = checkHtmlFile;
}