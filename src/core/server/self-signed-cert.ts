import path from "path";
import fs from "fs";
import { getCacheDir } from "../../utils/cache";
import selfSigned from "selfsigned";

const daysValidity = 30;

/**
 * Create a self-signed certificate valid for 30 days.
 * @returns {string} The certificate
 */
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

export interface Certificate {
  cert: string;
  regenerated: boolean;
}

/**
 * Get or generate a self-signed certificate valid for 30 days
 * @returns {string} The certificate
 */
export function getCertificate(): Certificate {
  const certificateDir = path.join(getCacheDir(), "certs");
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

    const pem = createCertificate();

    fs.writeFileSync(
      certificatePath,
      pem.private + pem.cert,
      {
        encoding: "utf8",
      }
    );
  }

  return {
     cert: fs.readFileSync(certificatePath, { encoding: "utf8" }),
     regenerated: !certificateExists
  };
}