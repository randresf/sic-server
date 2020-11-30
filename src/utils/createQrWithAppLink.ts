import QRCode from "qrcode";
const BASE_URL = "www.dnsic.com.co";
const createQRWithAppLink = async (link: string) => {
  try {
    return await QRCode.toDataURL(`https://${BASE_URL}/${link}`);
  } catch (err) {
    console.log(err);
    return "";
  }
};

export default createQRWithAppLink;
