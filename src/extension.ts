import * as vscode from 'vscode';
import * as ftp from 'ftp';
import * as fs from 'fs';
import ExtensionSettings from './extension-settings';
import {createClient, getDirInfoFTPAsync,getFileFTPAsync,sendFileFTPAsync} from './ftp-client';
import {CompileType,ResponceCode,remoteCompile} from './remote-compile';
import * as path from 'path';
import { compileFunction } from 'vm';

const extentionName 		= 'Nachi robot language support';
const programDirName 		= "PROGRAM";
const outputConsoleViewName = "Nachi robot language support console output";


export function activate(context: vscode.ExtensionContext) {

	const settings: ExtensionSettings 			= new ExtensionSettings();
	const outputConsole: vscode.OutputChannel 	= vscode.window.createOutputChannel(outputConsoleViewName);
	outputConsole.show(true);

	outputConsole.appendLine(`robotIp: ${settings.robotIp}`);
	outputConsole.appendLine(`robotType: ${settings.robotType}`);
	outputConsole.appendLine(`ftpWorkDir: ${settings.ftpWorkDir}`);


	settings.robotIp 	= "127.0.0.1";
	settings.robotType 	= "MZ07-01";
	settings.ftpWorkDir = "WORK";

	let sendfileWithFtpCommand = vscode.commands.registerCommand(`${extentionName}.send-file-ftp`, () => {
		vscode.window.showErrorMessage("send-file-ftp is not supported.")
	});

	let sendAndCompileCommand = vscode.commands.registerCommand(`${extentionName}.send-and-compile`, async () => {

		const activeFileName = vscode.window.activeTextEditor?.document.fileName;
		if (activeFileName == null) {
			vscode.window.showErrorMessage("no file selected in editor.");
			return;
		}
		else if (!asciiProgramRegix.test(activeFileName)) {
			vscode.window.showErrorMessage("the file selected in editor is not ASCII robot program file.");
			return;
		}

		await sendFileAndRemoteCompileExecute(settings, activeFileName, outputConsole);
	});

	let getfileWithFtpCommand = vscode.commands.registerCommand(`${extentionName}.get-file-ftp`, async () => {
		await getfileWithFtp(settings, outputConsole);
	});

	let remoteCompileCommand = vscode.commands.registerCommand(`${extentionName}.remote-compile`, () => {
		vscode.window.showErrorMessage("remote-compile is not supported.")
	});

	let remoteDecompileCommand = vscode.commands.registerCommand(`${extentionName}.remote-decompile`, async () => {
		await RemoteDecompileExecute(settings, outputConsole);
	});

	context.subscriptions.push(
		sendfileWithFtpCommand,
		sendAndCompileCommand,
		getfileWithFtpCommand,
		remoteCompileCommand,
		remoteDecompileCommand
	);
}

export async function sendfileWithFtp(settings: ExtensionSettings, sendFilePath: string, destDir: string, console: vscode.OutputChannel) {

	const op: ftp.Options = {
		host: settings.robotIp,
		user: settings.ftpUserName,
		password: settings.ftpPassword,
		connTimeout: 2000
	};

	// await sendFileFTPAsync(op, targetFile, settings.ftpWorkDir);	
	await sendFileFTPAsync(op, sendFilePath, destDir);	
	// console.show(true);
	console.appendLine(`${sendFilePath} send to ${path.resolve(destDir, path.basename(sendFilePath))}`);
}

export async function getfileWithFtp(settings: ExtensionSettings, console: vscode.OutputChannel) {

	const op: ftp.Options = {
		host: settings.robotIp,
		user: settings.ftpUserName,
		password: settings.ftpPassword,
		connTimeout: 2000
	};

	const client = createClient(op);
	console.appendLine(`connect to ${op.host}:${op.port? op.port: 21}`);

	client.on("ready", async () => {

		const cdFTP = async (nextPath: string) => {

			return new Promise<ftp.ListingElement[]>((resolve, hasError) => {
				client.cwd(nextPath, (err, current) => {

					if (err) {
						hasError(err);						
					}
					else {
						client.list((err, list) => {

							if (err) {
								hasError(err);
							}
							else {

								client.pwd((err, current) => {

									if (err) {
										console.appendLine(err.message);	
										return;					
									}
									else {
										console.appendLine(current);
										if(current != "/") {
											list.push({name: returnDir, size: 0, type: "d", date: list[0.].date})
										}						
									}

									resolve(list);
								});
								
							}
						})
					}

				})
			});
		}
		let targetInfo: ftp.ListingElement;
		let nextPath = '/';

		const returnDir= "↑";

		while(true) {

			try {
				
				let dirInfoList = await cdFTP(nextPath);
				const selectList = dirInfoList.map(item => `${item.type}: ${item.name}`);

				const selected = await vscode.window.showQuickPick(selectList, {canPickMany: false});

				if (selected == `d: ${returnDir}`) {

					nextPath = "../";
				}
				else {
					const targetInfo = dirInfoList.find(item => {
						if (`${item.type}: ${item.name}` == selected) return item;
					});
	
					if (targetInfo == null) {
						client.end();
						vscode.window.showErrorMessage("error");
						return;		
					}		
					else if (targetInfo.type == '-') {
	
						client.get(targetInfo.name, (err, stream) => {
							if (err) {
								vscode.window.showErrorMessage(err.message);
								client.end();
								return;
							}
							else {
								stream.once('close', () => {
									client.end();
									return;
								});
							}
	
							const writeStream = stream.pipe(fs.createWriteStream(path.resolve(vscode.workspace.rootPath!, targetInfo.name)), {end: true});
						});
					}
					else {
						nextPath = targetInfo.name;
					}
				}
				
			}
			catch (error) {

				client.end();
				vscode.window.showErrorMessage(error);
				return;				
			}
		}		
	})

}

const asciiProgramRegix 	= /-A\.\d{3,4}$/;
const compiledProgramRegix 	= /(?!.*-A\.).*\d{3,4}$/;
const programNoRegix 		= /\d{3,4}$/;

export async function sendFileAndRemoteCompileExecute(settings: ExtensionSettings, programFile: string, console: vscode.OutputChannel) {

	if (asciiProgramRegix.test(programFile)) {

		try {
			await sendfileWithFtp(settings, programFile, path.resolve(settings.ftpWorkDir, programDirName), console);
		}
		catch (error) {
			const errorMessage = `ftp faild !!\nerror: ${error}`;
			vscode.window.showErrorMessage(errorMessage);
			return;
		}

		const programNo: number = Number.parseInt(programNoRegix.exec(programFile)![0]);
		const ret = await remoteCompile(programNo, settings.robotIp, CompileType.Compile0);
	
		if (ret === ResponceCode.Success) {
			vscode.window.showInformationMessage(`success compile ${path.basename(programFile)}`);	
		}		
		else {
			vscode.window.showErrorMessage(`faild compile ${path.basename(programFile)} with code ${ret}`);	
		}
	}
	else {
		vscode.window.showErrorMessage(`${path.basename(programFile)} is not ASCII Program file ext!! (require {robot-name}-A.[001 - 9999])`);	
	}
	return;
}

export async function RemoteCompileExecute(settings: ExtensionSettings, console: vscode.OutputChannel) {

	try {
		const op: ftp.Options = {
			host: settings.robotIp,
			password: settings.ftpPassword,
			user: settings.ftpUserName,
			connTimeout: 2000
		};
		const infoList = await getDirInfoFTPAsync(op, path.resolve(settings.ftpWorkDir, programDirName));
		const fileList = infoList.filter(info => {
			if (info.type === '-' && asciiProgramRegix.test(info.name)) return info;
		});

		if (fileList.length <= 0) {
			vscode.window.showErrorMessage(`ASCII file not exit...`);
			return;
		}

		const selected = await vscode.window.showQuickPick(fileList.map(info => info.name), {canPickMany: true, placeHolder: "please select compile program files."});

		if (selected == null) return;

		selected.forEach(async file => {

			const programNo: number = Number.parseInt(programNoRegix.exec(file)![0]);
			const ret = await remoteCompile(programNo, settings.robotIp, CompileType.Compile0);
		
			if (ret.code === ResponceCode.Success.code) {
				vscode.window.showInformationMessage(`success compile ${path.basename(file)}`);	
			}		
			else {
				vscode.window.showErrorMessage(`faild compile ${path.basename(file)}.\n error code: ${ret.code},\nmessage: ${ret.message}`);	
			}
		});

		return;
	}
	catch (error) {
		const errorMessage = `faild !!\nerror: ${error}`;
		vscode.window.showErrorMessage(errorMessage);
		return;
	}
}

export async function RemoteDecompileExecute(settings: ExtensionSettings, console: vscode.OutputChannel) {

	try {
		const op: ftp.Options = {
			host: settings.robotIp,
			password: settings.ftpPassword,
			user: settings.ftpUserName,
			connTimeout: 2000
		};
		const infoList = await getDirInfoFTPAsync(op, path.resolve(settings.ftpWorkDir, programDirName));
		const fileList = infoList.filter(info => {
			if (info.type === '-' && compiledProgramRegix.test(info.name)) return info;
		});

		if (fileList.length <= 0) {
			vscode.window.showErrorMessage(`ASCII file not exit...`);
			return;
		}

		const selected = await vscode.window.showQuickPick(fileList.map(info => info.name), {canPickMany: true, placeHolder: "please select decompile program files."});

		if (selected == null) return;

		const decompileList = [
			CompileType.DecompileMove,
			CompileType.DecompileMoveJ,
			CompileType.DecompileMoveX_E,
			CompileType.DecompileMoveX_J,
			CompileType.DecompileMoveX_W,
			CompileType.DecompileMoveX_X,
		];
		const selectedMode = await vscode.window.showQuickPick(decompileList.map(type => type.keyword), {canPickMany: false, placeHolder: "please select decompile type."});

		if (selectedMode == null) return;
		const decompileType = decompileList.find(type => {
			if (type.keyword == selectedMode) {
				return type;				
			}
		});

		selected.forEach(async file => {

			const programNo: number = Number.parseInt(programNoRegix.exec(file)![0]);
			const ret = await remoteCompile(programNo, settings.robotIp, decompileType!);
		
			if (ret.code === ResponceCode.Success.code) {
				vscode.window.showInformationMessage(`success decompile ${path.basename(file)}`);	
			}		
			else {
				vscode.window.showErrorMessage(`faild decompile ${path.basename(file)}.\n error code: ${ret.code},\nmessage: ${ret.message}`);	
			}
		});

		return;
	}
	catch (error) {
		const errorMessage = `faild !!\nerror: ${error}`;
		vscode.window.showErrorMessage(errorMessage);
		return;
	}
}


export function deactivate() {}
