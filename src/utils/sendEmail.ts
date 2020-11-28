import nodemailer from "nodemailer";

type emailProps = {
  to: string;
  subject: string;
  html: string;
};

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async ({ to, subject, html }: emailProps) => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"DNSIC Foo 👻" <admin@dnsic.com>', // sender address
    to, // list of receivers
    subject, // Subject line
    html, // html body
  });

  return info;
};

export default sendEmail;
