/**
 * UDP Client Sample
 */

const dgram = require("dgram");
require("date-utils");

const mes = [...Array(1000)].map(i => "1").join("");
// const mes = "1,1,1,1,1";
// const PORT_B = process.argv[2] ? Number.parseInt(process.argv[2]) : 8080;
// const HOST_B = "192.168.1.10";

const PORT_B = 5000;
const HOST_B = "192.168.1.120";

const PORT_A = 8888;
const HOST_A = "192.168.1.80";

const socket = dgram.createSocket("udp4");

var count = 0;

var now = Date.now();

const data = Buffer.from(String(mes));
// console.log(mes);

// setInterval(() => {
//   count++;
//   const data = Buffer.from(String(mes));
//   // console.log(mes);
//   socket.send(data, 0, data.length, PORT_A, HOST_A, (err, bytes) => {
//     if (err) throw err;
//   });
// }, 100);

socket.on("message", (message, remote) => {
  const now2 = Date.now();
  console.log(now2 - now);
  now = now2;
  console.log(remote.address + ":" + remote.port + " - " + message);
});

socket.bind(PORT_B, HOST_B);


setInterval(() => {
  socket.send(Uint8Array.from([1, 1, 1]), 0, data.length, PORT_A, HOST_A, (err, bytes) => {
    if (err) throw err;
  });

}, 1)