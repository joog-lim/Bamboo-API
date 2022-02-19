import * as nodemailer from "nodemailer";

export const sendAuthMessage: Function = async (arg: {
  receiver: string;
  authNumber: number;
}) => {
  const transpoter: nodemailer.Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_ID as string,
      pass: process.env.MAIL_PW as string,
    },
  });

  const { receiver, authNumber } = arg;

  const mailOptions: nodemailer.SendMailOptions = {
    from: `Bamboo for GSM CA ${process.env.MAIL_ID as string}`,
    to: receiver,
    subject: "광주소프트웨어 마이스터고 대나무숲 인증 메일입니다.",
    html: `<b>안녕하세요, 대나무숲 인증 메일입니다.<b></br>
    <b> 다음 번호를 입력하시고 인증을 끝마치시길 바랍니다.<b></br>
    <b> 만약 수신자님이 아니시라면, 해당 메일은 무시하시고 삭제해주시길 바랍니다.<b></br>
    <h2>${authNumber}</h2>`,
  };
  try {
    await transpoter.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
};
