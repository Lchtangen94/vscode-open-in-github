// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

var VsCode = require('vscode');
var Window = VsCode.window;
var commands = VsCode.commands;
var workspace = VsCode.workspace;
var Position = VsCode.Position;

var path = require('path');
var fs = require('fs');
var git = require('parse-git-config');
var exec = require('child_process').exec;
var parse = require('github-url-from-git');
var open = require('./open');

function findBranch(config) {
    for (var prop in config) {
        if (prop.indexOf("branch \"") > -1) {
            return prop.replace(/branch \"/g, "").replace(/\"/g, "");
        }
    }

    return "master";
}

function openInGitHub() {
    var cwd = workspace.rootPath;

    git({
        cwd: cwd
    }, function (err, config) {
        var rawUri, parseOpts, lineIndex = 0, parsedUri, branch, editor, selection
            , projectName, subdir, gitLink, scUrls;

        scUrls = {
            github: 'https://github.com',
            bitbucket: 'https://bitbucket.org',
            visualstudiocom: /^https:\/\/[\w\d-]*\.visualstudio.com\//
        }

        rawUri = config['remote \"origin\"'].url;
        parseOpts = {
            extraBaseUrls: ['bitbucket.org']
        }

        rawUri = rawUri.replace('bitbucket.org:', 'bitbucket.org/')

        parsedUri = parse(rawUri, parseOpts);
        if (!parsedUri) {
            parsedUri = rawUri;
        }

        branch = findBranch(config);
        editor = Window.activeTextEditor;
        if (editor) {
            selection = editor.selection;

            lineIndex = selection.active.line + 1;
            projectName = parsedUri.substring(parsedUri.lastIndexOf("/") + 1, parsedUri.length);

            subdir = editor.document.uri.fsPath.substring(workspace.rootPath.length).replace(/\"/g, "");

            if (parsedUri.startsWith(scUrls.github)) {
                gitLink = parsedUri + "/blob/" + branch + subdir + "#L" + lineIndex;
            } else if (parsedUri.startsWith(scUrls.bitbucket)) {
                gitLink = parsedUri + "/src/" + branch + subdir + "#cl-" + lineIndex;
            } else if (scUrls.visualstudiocom.test(parsedUri)) {
                gitLink = parsedUri + "#path=" + subdir + "&version=GB" + branch;
            } else {
                Window.showWarningMessage('Unknown Git provider.');
            }
        } else {
            gitLink = gitLink = parsedUri + "/tree/" + branch;
        }

        if (gitLink)
            open(gitLink);
    });
}

function activate(context) {
    context.subscriptions.push(commands.registerCommand('extension.openInGitHub', openInGitHub));
}

exports.activate = activate;
