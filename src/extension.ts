// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path = require('path');
import * as dotenv from 'dotenv';
import * as fs from "fs";

function typedarrayToBuffer(arr: Uint8Array) {
	return ArrayBuffer.isView(arr)
		// To avoid a copy, use the typed array's underlying ArrayBuffer to back
		// new Buffer, respecting the "view", i.e. byteOffset and byteLength
		? Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
		// Pass through all other types to `Buffer.from`
		: Buffer.from(arr);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('terminal-dotenv.createTerminal', async () => {

		// specify the active workspace or select one if multiple
		const workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
		let workspaceFolder: vscode.WorkspaceFolder;
		if (!workspaceFolders) {
			return;
		}
		if (workspaceFolders.length > 1) {
			// prompot user to select folder in case of multi-root workspace
			const workspaceFoldersItems: vscode.QuickPickItem[] = workspaceFolders?.map(f => { return { label: f.name, description: vscode.workspace.asRelativePath(f.uri.path) } });
			const pickerOptions: vscode.QuickPickOptions = {placeHolder:'Select current working directory for new terminal'} ;
			const selectedWorkspaceFolder = await vscode.window.showQuickPick(workspaceFoldersItems || [],pickerOptions);
			workspaceFolder = workspaceFolders[workspaceFolders.findIndex(f => f.name === selectedWorkspaceFolder?.label)];
		} else {
			// select the root folder
			workspaceFolder = workspaceFolders[0];
		}
		
		let env = {};
		try {
			// search for .env file inside the workspace
			let envFile: Uint8Array = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(workspaceFolder.uri, '.env'));
			const envFileBuffer = typedarrayToBuffer(envFile);
			env = dotenv.parse(envFileBuffer);
		} catch (e) {
			// either file not found or invalid .env file
		}

		let terminal = vscode.window.createTerminal({
			cwd: workspaceFolder.uri.fsPath,
			env: env
		});
		terminal.show(false);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
