import QRCode from "qrcode";
const BASE_URL = process.env.PROD ? "www.dnsic.com" : "localhost:3000";
const createQRWithAppLink = async (link: string) => {
  try {
    return await QRCode.toDataURL(`https://${BASE_URL}/${link}`);
  } catch (err) {
    console.log(err);
    return "";
  }
};

export default createQRWithAppLink;
