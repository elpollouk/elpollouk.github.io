"use strict";

var fs = require('fs');
var execSync = require('child_process').execSync;

// Load project file
var project = require("./build.json");
console.log(`Building ${project.output}...`);

// Get the current revision id
var commitId = execSync("git rev-parse HEAD").toString().trim();
console.log(`Commit id: ${commitId}`);

// Create the header
var builder = [];
builder.push(`// Built: ${new Date().toISOString()}\n`);
builder.push(`// Commit: ${commitId}\n\n`);

// Loop through the input files adding them to the output
for (var i = 0; i < project.input.length; i++) {
    var path = project.input[i].path;
    console.log(`Adding ${path}...`);
    builder.push(`// File: ${path}\n`);

    var data = fs.readFileSync(path, "utf8");
    builder.push(data);
    builder.push("\n\n");
}

// Write the output to the final location
fs.writeFileSync(project.output, builder.join(""), "utf8");

console.log("Done.");
