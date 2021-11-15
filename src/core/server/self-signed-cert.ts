import path from "path";
import fs from "fs";
const selfSigned = require("selfsigned");

const daysValidity = 30;

function createCertificate() {
  const attrs = [{
    name: "commonName",
    value: "localhost",
  },
  {
    name: "organizationName",
    value: "Dev"
  }];

  return selfSigned.generate(attrs, {
    algorithm: "sha256",
    days: daysValidity,
    keySize: 2048,
    extensions: [
      {
        name: "basicConstraints",
        cA: true,
      },
      {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: "extKeyUsage",
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true,
      },
      {
        name: "subjectAltName",
        altNames: [
          {
            // type 2 is DNS
            type: 2,
            value: "localhost",
          },
          {
            type: 2,
            value: "localhost.localdomain",
          },
          {
            type: 2,
            value: "[::1]",
          },
          {
            // type 7 is IP
            type: 7,
            ip: "127.0.0.1",
          },
          {
            type: 7,
            ip: "fe80::1",
          },
        ],
      },
    ],
  });
}

export function getCertificate() {
  const certificateDir = path.join(__dirname, ".cache");
  const certificatePath = path.join(certificateDir, "self-signed.pem");

  let certificateExists = false;

  certificateExists = fs.existsSync(certificatePath);

  if (certificateExists) {
    const oneDayInMs = 1000 * 60 * 60 * 24;
    const certStat = fs.statSync(certificatePath);

    const now = new Date();

    if ((now.getTime() - certStat.ctime.getTime()) / oneDayInMs > daysValidity) {
      certificateExists = false;
    }
  }

  if (!certificateExists) {
    fs.mkdirSync(certificateDir, { recursive: true });

    const pems = createCertificate();

    fs.writeFileSync(
      certificatePath,
      pems.private + pems.cert,
      {
        encoding: "utf8",
      }
    );
  }

  return fs.readFileSync(certificatePath);
}