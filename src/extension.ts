import * as vscode from 'vscode';
import {getFiles} from './ftp';

export function activate(context: vscode.ExtensionContext) {

	const config = vscode.workspace.getConfiguration("conf");

	const val1 = (config.get("strItem"));
	const val2 = (config.get("numItem"));
	const val3 = (config.get("objItem"));

	let helloWorld = vscode.commands.registerCommand('nachi-robot-language-support.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from nachi robot language support!');
	});

	let getfileWithFtp = vscode.commands.registerCommand('nachi-robot-language-support.getfile-with-ftp', () => getFiles());

	context.subscriptions.push(helloWorld, getfileWithFtp);
}

export function deactivate() {}
