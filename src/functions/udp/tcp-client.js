const net = require("net");
const fs = require('fs');

// const serverIP = '192.168.1.10';
const serverIP = "192.168.0.101";
// const serverIP = '127.0.0.1';
// const serverPort = 3000;
const serverPort = 2001;

// const fileName = `${Date.now()}.csv`;
const fileName = `${Date.now()}.json`;
console.log(fileName);

const sendData = [...Array(100)].map((v, i) => `a`).join("");
// fs.appendFileSync(fileName, 'recive at,send at,recive data\n', {
//   encoding: 'utf-8'
// });
// 接続
const client = new net.Socket();
client.connect(serverPort, serverIP, () => {
  console.log(`connect`);

  // client.write("hello");
});

client.on("data", data => {
  // const res = data.toString("utf-8", 0, data.length);
  const res = data.toString("utf-8", 0, data.length);
  // fs.appendFileSync(fileName, `${Date.now()},${res}\n`, {
  //   encoding: "utf-8"
  // });
  fs.appendFileSync(fileName, res, {
    encoding: "utf-8"
  });
  console.log(data);
  console.log(data.length);
});

client.on("close", () => {
  console.log("disconnected");
});

// setInterval(() => {
//   // client.write(new Date().toISOString());
//   // client.write(`${Date.now()},${sendData}`);

//   const d = {
//     cmd_id: 11
//   };

//   client.write(JSON.stringify(d));
// }, 100);

// const d = {
//   cmd_id: 11
// };

// const dd = {"cmd_id":5,"pos_no":1,"point":12.345,"speed_hi":12.345,"speed_low":-12.345,"force":1.345,"direction":true};

// client.write(JSON.stringify(dd));

// const sendUint8 = new Uint8Array([0x03, 0x15, 0x01]);
const sendUint8 = Buffer.from([0x03, 0x07, 0x01]);
client.write(sendUint8, (err) => {
  console.log("send");
  if (err) {
    console.error(err);
  }
  
});
// console.log([0x03, 0x07, 0x01]);



// setTimeout(() => {
//   client.destroy();
//   console.log('destroyd');
// }, 4000);