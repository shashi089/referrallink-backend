const mailer = require("nodemailer");

// transport mail
const send_mail = async (email, subject, content) => {
  // transporter
  let transporter = mailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  // mail details
  let mailOptions = {
    from: "testshashidhsr@gmail.com",
    subject: subject,
    text: content,
    // html: link,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error in sending mail : ", error);
    } else {
      console.log("Email successfully sent : ", info.response);
    }
  });
};

module.exports = send_mail;
