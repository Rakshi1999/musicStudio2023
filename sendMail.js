const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendMail({ to, from, subject, text }) {
  const msg = { to, from, subject, text };
  sgMail
    .send(msg)
    .then((res) => {
      console.log("sent");
    })
    .catch((error) => {
      console.error(error);
      //   cbFailed()
    });
}

module.exports = sendMail;
