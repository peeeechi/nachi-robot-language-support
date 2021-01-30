import * as ftp from 'ftp';
import * as fs from 'fs';
import * as path from 'path';

export function createClient(option: ftp.Options): ftp {
    const client = new ftp();
    client.connect(option);
    
    console.log(`connect to ${option.host}:${option.port}`);
    return client;
}


export async function pwdFTPAsync(option: ftp.Options) {

    return new Promise<string>((resolve, hasError) => {        
        const client = createClient(option);
        client.on("ready", () => {
            client.pwd((err, currentPath) => {

                if (err) {
                    hasError(err);
                }
                else {
                    resolve(currentPath);
                }

                client.end();        
            })
        });
    });    
}

export async function getDirInfoFTPAsync(option: ftp.Options, targetDir: string = "/"): Promise<ftp.ListingElement[]> {

    return new Promise<ftp.ListingElement[]> ((resolve, hasError) => {
        const client = createClient(option);
        client.on("ready", () => {
            client.cwd(targetDir, (err, currentDir) => {
                if (err) {
                    hasError(err);
                    client.end();
                } else {
                    
                    client.list((err,list) => {
                        if (err) {
                            hasError(err);
                        }
                        else {
                            resolve(list);
                        }

                        client.end();
                    });
                }    
            });
        });
    });
}

export async function getFileFTPAsync(option: ftp.Options, targetFileName: string, saveDir?: string): Promise<void> {

    const saveBaseDir: string = saveDir? saveDir : path.dirname(__dirname);

    return new Promise<void> ((resolve, hasError) => {
        const client = createClient(option);
        client.on("ready", () => {
            // file 取得
            client.get(targetFileName, (err, stream) => {
                if (err) {
                    hasError(err);
                    client.end();
                }
                else {
                    stream.once('close', () => {
                        client.end();
                        resolve();
                    });
                }
                const writeStream = stream.pipe(fs.createWriteStream(path.resolve(saveBaseDir, path.basename(targetFileName))), {end: true});
            });
        });
    });
}

export async function sendFileFTPAsync(option: ftp.Options, sourceFilePath: string, destinationDir?: string): Promise<void> {

    const saveBaseDir: string = destinationDir? destinationDir : "/";
    return new Promise<void> ((resolve, hasError) => {
        const client = createClient(option);
        client.on("ready", () => {
            // file 送信
            client.put(sourceFilePath, `${destinationDir}/${path.basename(sourceFilePath)}`, (error) => {
                if (error) {
                    hasError(error);
                }
                else {
                    resolve();
                }
                client.end();
            });
        });
    });
}