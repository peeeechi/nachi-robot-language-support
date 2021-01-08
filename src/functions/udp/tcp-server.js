const net = require("net");

const port = process.argv[2] ? Number.parseInt(process.argv[2]) : 3000;
const host = '192.168.1.120';
// const host = "127.0.0.1";

const sendData = [...Array(20)].map((v, i) => `12345`).join(",");

console.log(sendData.length);

const server = net.createServer(socket => {
    // 受信処理
    socket.on("data", data => {
      console.log(`${data} from ${socket.remoteAddress}:${socket.remotePort}`);
      socket.write(sendData, err => {
        if (err) {
          console.error(err);
        } else {
          // console.log(`senddata: ${sendData}`);
          console.log(`senddata: ${data}`);
        }
      });
    });

    // 接続確率時の処理
    socket.on("connect", () => {
      console.log(`conected from ${socket.remoteAddress}:${socket.remotePort}`);
    });

    socket.on("lookup", (err, add, fam, host) => {
      console.log(
        `err: ${err}, address: ${add}, family: ${fam}, host: ${host}`
      );
    });

    // 接続遮断時の処理
    socket.on("close", () => {
      console.log("client closed connection");
    });
  })
  .listen(
    {
      port: port,
      host: host
    },
    () => {
      // Listen開始時処理
      console.log(`server on ${host}:${port}`);
    }
  );
