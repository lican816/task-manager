const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.EMAIL_API_KEY);

function sendWelcomeEmail(email, name) {
    sgMail.send({
        to: email,
        from: 'test@example.com',
        subject: 'Welcome to my App',
        text: `Welcome ${name}, please take a quick look...`
    })

    console.log('Email sent...')
}

function sendCancelEmail(email, name) {
    sgMail.send({
        to: email,
        from: 'test@example.com',
        subject: 'Sorry to see cancelation to my App',
        text: `Hi ${name}, please take a quick look...`
    })

    console.log('Email sent...')
}


module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}


