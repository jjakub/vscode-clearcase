'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {ClearCase} from './clearcase';
import {UIInformation} from './uiinformation'
import {ccConfigHandler} from './ccConfigHandler';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-clearcase" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let configHandler = new ccConfigHandler(context);

    let cc = new ClearCase(context, configHandler);
    vscode.commands.executeCommand('setContext', 'vscode-clearcase:enabled', cc.IsView);
    cc.onWindowChanged(() => {
        vscode.commands.executeCommand('setContext', 'vscode-clearcase:enabled', cc.IsView);
    }, cc);
    cc.bindEvents();
    cc.bindCommands();

    let uiInfo = new UIInformation(context, configHandler, vscode.window.activeTextEditor, cc);
    uiInfo.createStatusbarItem();
    uiInfo.bindEvents();
    uiInfo.initialQuery();

    cc.onCommandExecuted(() => {
        uiInfo.initialQuery();
    }, uiInfo);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
