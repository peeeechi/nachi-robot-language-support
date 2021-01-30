import * as dgram from 'dgram';

/**
 * Port number for remote compilation
 */
const remoteCompilePort: number     = 233;
const socketType: dgram.SocketType  = "udp4";
const commandNo                     = 25;
const resByteLength                 = 5;

export interface CompileCodeKeywordPair {
    code: number;
    keyword: string;
}

export interface ResponceCodeMessagePair {
    code: number;
    message: string;
}

/**
 * コンパイルのタイプの規定コード
 */
export const CompileType = {
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile0: { code: 0x0,  keyword: "Compile0"},
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile1: { code: 0x1,  keyword: "Compile1"},
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile2: { code: 0x2,  keyword: "Compile2"},
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile3: { code: 0x3,  keyword: "Compile3"},
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile4: { code: 0x4,  keyword: "Compile4"},
    /** コンパイル処理を行います。0~5のどの値を指定しても動作は変わりません。 */
    Compile5: { code: 0x5,  keyword: "Compile5"},
    /** 移動命令を MOVE として逆コンパイルします。 */
    DecompileMove: { code: 0x80,  keyword: "DecompileMove"},
    /** 移動命令を MOVEJ として逆コンパイルします。 */
    DecompileMoveJ: { code: 0x81,  keyword: "DecompileMoveJ"},
    /** 移動命令を MOVEX-W として逆コンパイルします。 */
    DecompileMoveX_W: { code: 0x82,  keyword: "DecompileMoveX_W"},
    /** 移動命令を MOVEX-X として逆コンパイルします。 */
    DecompileMoveX_X: { code: 0x83,  keyword: "DecompileMoveX_X"},
    /** 移動命令を MOVEX-J として逆コンパイルします。 */
    DecompileMoveX_J: { code: 0x84,  keyword: "DecompileMoveX_J"},
    /** 移動命令を MOVEX-E として逆コンパイルします。 */
    DecompileMoveX_E: { code: 0x85,  keyword: "DecompileMoveX_E"},
}

/**
 * リモートコンパイルの応答コード
 */
export const ResponceCode = {
    /** コンパイルが成功した場合にこのコードを返します。 */
    Success: { code: 0x00,  message: "Success"},
    /** コンパイル処理中に問題が発生した場合にこのコードを返します。
     * ロボット言語に間違いがあった場合や、本制御装置の T/P から言語変換を行っている途中に
     * コマンドを送信した場合などにこのエラーが発生します。
     * エラーの内容は、“AutoCompileErr.txt”ファイル
     * （「Work→Log」フォルダ内）を参照してください。
     */
    SomeErrorHappend: { code: 0x01,  message: "SomeErrorHappend"},
    /**
     * 出力先のプログラムファイルがプロテクトされている場合にこのコードを返します。
     * ファイルのプロテクトを確認してください。
     */
    ProgramFileAreProtected: { code: 0x02,  message: "ProgramFileAreProtected"},
    /**
     * 変換前のプログラムファイルが存在していない場合にこのコードを返します。
     * 「Work→Program」フォルダの中にプログラムファイルがあることを確認してください。
     */
    ProgramFileNotFound: { code: 0x03,  message: "ProgramFileNotFound"},
    /**
     * シーケンス No.が範囲外の場合にこのコードを返します。
     * 1～999 の範囲であることを確認してください。
     */
    SequenceNoOutOfRange: { code: 0x04,  message: "SequenceNoOutOfRange"},
    /**
     * プログラム No.が範囲外の場合にこのコードを返します。
     * 0～9999 の範囲であることを確認してください。
     */
    ProgramNoOutOfRange: { code: 0x05,  message: "ProgramNoOutOfRange"},
    /**
     * 指定されたユニット No.にユニットが存在しない場合にこのコードを返します。
     * ユニットが登録されていることを確認してください。
     */
    UnitNotFound: { code: 0x06,  message: "UnitNotFound"},
    /**
     * 処理タイプが“無効”の場合にこのコードを返します。
     * 0～5 または 128～133 の範囲の値を入力してください。
     */
    CommandInvaild: { code: 0x07,  message: "CommandInvaild"},
    /**
     * ロボットが起動中の場合にこのコードを返します。
     * 「外部コンパイル機能」はロボット起動中には使用できません。
     * ロボットを停止させてからご使用ください。
     */
    RobotRunning: { code: 0x08,  message: "RobotRunning"},
    /**
     * コンパイル要求が発行され、すでに処理を実行している場合にこのコードを返します。
     * 処理の終了を待ってからコンパイル要求を発行してください。
     */
    RemoteCompilationInProgress: { code: 0x09,  message: "RemoteCompilationInProgress"},
    /**
     * カレントプログラムをコンパイルしようとしている場合にこのコードを返します。
     * カレントプログラムは編集中である可能性があるため、コンパイルを行うことはできません。
     * カレントプログラムを変更してください。 
     */
    CurrentProgramSelected: { code: 0x10,  message: "CurrentProgramSelected"}
}

function convertTypedArray(src: any) {
    const buffer    = new ArrayBuffer(src.byteLength);
    const baseView  = new src.constructor(buffer).set(src);
    const retBytes  = new Uint8Array(buffer);

    // console.log('ret', retBytes, src);

    return retBytes;
}

function createSendBytes(programNo: number, compileType: CompileCodeKeywordPair, unitNo = 1, sequenceNo: number = 1): Uint8Array {
    const sendBytes = new Uint8Array(8);

    sendBytes[0] = commandNo;
    sendBytes[1] = 0;

    const sequenceNoBytes   = convertTypedArray(new Uint16Array([sequenceNo]));
    sendBytes[2]            = sequenceNoBytes[0];
    sendBytes[3]            = sequenceNoBytes[1];
    
    sendBytes[4] = unitNo;
    
    sendBytes[5] = compileType.code;
    
    const programNoBytes    = convertTypedArray(new Uint16Array([programNo]));
    sendBytes[6]            = programNoBytes[0];
    sendBytes[7]            = programNoBytes[1];

    return sendBytes;
}

export async function remoteCompile(programNo: number, cfdIp: string, compileType: CompileCodeKeywordPair, unitNo: number = 1, sequenceNo: number = 1): Promise<ResponceCodeMessagePair> {

    return new Promise<ResponceCodeMessagePair>((resolve, hasError) => {

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
                    const resCode       = buf[4] as number;
                    
                    // console.log("recive data from " +remote.address + ":" + remote.port);
                    // console.log(`commandNo: ${resCommandNo}, sequenceNo: ${resSequenceNo}`);                 

                    socket.close();
                    const resPair = Object.entries<ResponceCodeMessagePair>(ResponceCode)
                                    .find(pair => {if (pair[1].code == resCode) return pair;});
                    if (resPair == null) {
                        hasError(`Unknown responce code: ${resCode}`);                        
                    }
                    else {
                        resolve(resPair[1]);
                    }                                    
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
