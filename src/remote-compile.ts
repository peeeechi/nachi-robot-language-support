import * as dgram from 'dgram';

/**
 * Port number for remote compilation
 */
const remoteCompilePort: number     = 233;
const socketType: dgram.SocketType  = "udp4";
const commandNo                     = 25;
const resByteLength                 = 5;

/**
 * コンパイルのタイプの規定コード
 */
export enum CompileType {
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile0 = 0x0,
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile1 = 0x1,
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile2 = 0x2,
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile3 = 0x3,
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile4 = 0x4,
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile5 = 0x5,
    /** 移動命令を MOVE として逆コンパイルします。 */
    DecompileMove = 0x80,
    /** 移動命令を MOVEJ として逆コンパイルします。 */
    DecompileMoveJ = 0x81,
    /** 移動命令を MOVEX-W として逆コンパイルします。 */
    DecompileMoveX_W = 0x82,
    /** 移動命令を MOVEX-X として逆コンパイルします。 */
    DecompileMoveX_X = 0x83,
    /** 移動命令を MOVEX-J として逆コンパイルします。 */
    DecompileMoveX_J = 0x84,
    /** 移動命令を MOVEX-E として逆コンパイルします。 */
    DecompileMoveX_E = 0x85,
}

/**
 * リモートコンパイルの応答コード
 */
export enum ResponceCode {
    /** コンパイルが成功した場合にこのコードを返します。 */
    Success = 0x00,
    /** コンパイル処理中に問題が発生した場合にこのコードを返します。
     * ロボット言語に間違いがあった場合や、本制御装置の T/P から言語変換を行っている途中に
     * コマンドを送信した場合などにこのエラーが発生します。
     * エラーの内容は、“AutoCompileErr.txt”ファイル
     * （「Work→Log」フォルダ内）を参照してください。
     */
    SomeErrorHappend = 0x01,
    /**
     * 出力先のプログラムファイルがプロテクトされている場合にこのコードを返します。
     * ファイルのプロテクトを確認してください。
     */
    ProgramFileAreProtected = 0x02,
    /**
     * 変換前のプログラムファイルが存在していない場合にこのコードを返します。
     * 「Work→Program」フォルダの中にプログラムファイルがあることを確認してください。
     */
    ProgramFileNotFound = 0x03,
    /**
     * シーケンス No.が範囲外の場合にこのコードを返します。
     * 1～999 の範囲であることを確認してください。
     */
    SequenceNoOutOfRange = 0x04,
    /**
     * プログラム No.が範囲外の場合にこのコードを返します。
     * 0～9999 の範囲であることを確認してください。
     */
    ProgramNoOutOfRange = 0x05,
    /**
     * 指定されたユニット No.にユニットが存在しない場合にこのコードを返します。
     * ユニットが登録されていることを確認してください。
     */
    UnitNotFound = 0x06,
    /**
     * 処理タイプが“無効”の場合にこのコードを返します。
     * 0～5 または 128～133 の範囲の値を入力してください。
     */
    CommandInvaild = 0x07,
    /**
     * ロボットが起動中の場合にこのコードを返します。
     * 「外部コンパイル機能」はロボット起動中には使用できません。
     * ロボットを停止させてからご使用ください。
     */
    RobotRunning = 0x08,
    /**
     * コンパイル要求が発行され、すでに処理を実行している場合にこのコードを返します。
     * 処理の終了を待ってからコンパイル要求を発行してください。
     */
    RemoteCompilationInProgress = 0x09,
    /**
     * カレントプログラムをコンパイルしようとしている場合にこのコードを返します。
     * カレントプログラムは編集中である可能性があるため、コンパイルを行うことはできません。
     * カレントプログラムを変更してください。 
     */
    CurrentProgramSelected = 0x10
}

function convertTypedArray(src) {
    const buffer    = new ArrayBuffer(src.byteLength);
    const baseView  = new src.constructor(buffer).set(src);
    const retBytes  = new Uint8Array(buffer);

    // console.log('ret', retBytes, src);

    return retBytes;
}

function createSendBytes(programNo: number, compileType: CompileType, unitNo = 1, sequenceNo: number = 1): Uint8Array {
    const sendBytes = new Uint8Array(8);

    sendBytes[0] = commandNo;
    sendBytes[1] = 0;

    const sequenceNoBytes   = convertTypedArray(new Uint16Array([sequenceNo]));
    sendBytes[2]            = sequenceNoBytes[0];
    sendBytes[3]            = sequenceNoBytes[1];
    
    sendBytes[4] = unitNo;
    
    sendBytes[5] = compileType;
    
    const programNoBytes    = convertTypedArray(new Uint16Array([programNo]));
    sendBytes[6]            = programNoBytes[0];
    sendBytes[7]            = programNoBytes[1];

    return sendBytes;
}

export async function remoteCompile(programNo: number, cfdIp: string, compileType: CompileType, unitNo: number = 1, sequenceNo: number = 1): Promise<ResponceCode> {

    return new Promise<ResponceCode>((resolve, hasError) => {

        const socket = dgram.createSocket(socketType);
    
        const sendData = createSendBytes(programNo, compileType, unitNo, sequenceNo);

        const buf: Buffer = Buffer.from([0,0,0,0,0])
        let resIndex = 0;
    
        socket.on("message", (responseData: Buffer, remote: dgram.RemoteInfo) => {
            // console.log(remote.address + ":" + remote.port + " - " + responseData.length);
            responseData.forEach(byte => {
                buf[resIndex] = byte;               
                resIndex++;    

                if (resIndex >= resByteLength) {
                    
                    const resCommandNo  = buf.readUInt16LE(0);
                    const resSequenceNo = buf.readUInt16LE(2);
                    const resCode       = buf[4] as ResponceCode;
                    
                    // console.log("recive data from " +remote.address + ":" + remote.port);
                    // console.log(`commandNo: ${resCommandNo}, sequenceNo: ${resSequenceNo}`);                 

                    socket.close();
                    resolve(resCode);
                }
            });  
        });
    
        socket.bind();
    
        socket.send(sendData, remoteCompilePort, cfdIp, (err, sendBytesLength) => {
            if (err) {
                hasError(err);
            }
            // console.log(`send ${sendBytesLength} bytes to ${cfdIp}:${remoteCompilePort}.`);
        });
    });    
}
