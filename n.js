const fs = require('fs');

const start = 1;
const end = 9999;


const creatEXT = (num, length) => {
    return ('0000' + num).slice(-length);
}

const le = [...Array(9999)].map((v,i) => { return i+1}).map(num => {
    const leng = (num >= 1000)? 4: 3;
    const numStr = creatEXT(num, leng);
    return `"A.${numStr}",`;
});

const w = le.join('\r\n');

fs.writeFileSync('d.txt', w);
