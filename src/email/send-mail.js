const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = (email, name) => {
    const msg = {
        to: email,
        from: 'ssoubhikk@gmail.com',
        subject: 'Tutorial',
        text: `Welcome ${name}`,
      };
      sgMail.send(msg);
}

module.exports = {
    sendMail
}