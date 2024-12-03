const functions = require('firebase-functions/v2');
const { defineSecret } = require('firebase-functions/params');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const admin = require('firebase-admin');
const Mailgun = require('mailgun.js');
const formData = require('form-data');

// Initialize Firebase Admin SDK
admin.initializeApp()
// Mailgun Configuration
const mailgun = new Mailgun(formData)
const DOMAIN = defineSecret('MAILGUN_DOMAIN')
const API_KEY = defineSecret('MAILGUN_API_KEY')

// Singleton Mailgun client
let mailgunClient = null;

const getMailgunClient = (domain, apiKey) => {
  if (mailgunClient) {
    return mailgunClient;
  }

  mailgunClient = new Mailgun(formData).client({ username: 'api', key: apiKey });

  return mailgunClient;
};

const templatePath = path.join(__dirname, 'templates')

exports.sendRegistrationEmail = functions.https.onRequest({secrets:[DOMAIN,API_KEY]},async (req, res) => {
  // Ensure it's a POST request
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }
  const { email, name } = req.body
  
  // Check if email or name is missing
  if (!email || !name) {
    return res.status(400).send('Missing required fields: email or name')
  }
  const domain=DOMAIN.value()
  const apiKey=API_KEY.value();
  const mg = getMailgunClient(domain, apiKey);

  try {
    // Prepare dynamic content for the template
    const emailData = {
      backgroundImage: "https://img.freepik.com/free-vector/realistic-luxury-background_23-2149354608.jpg?semt=ais_hybrid", // URL for the background image
      logoImage: "https://omov8-bebd1.web.app/assets/omo-logo-389de2f2.png", // URL for the OMO logo
      headerText: "Welcome to OMO", // Main header
      subHeaderText: "Your Gateway to Crypto Betting", // Sub-header
      userName: `${name}`, // Dynamic user name
      personalizedMessage: `
        Dear Evro, 
        We are thrilled to welcome you to the world of Crypto Betting with OMO!
        Explore new opportunities, enjoy seamless betting, and stay ahead in the crypto space.`,
      gettingStartedText: "Get started by exploring our features designed just for you.",
      featureImage1: "https://cdn.pixabay.com/photo/2016/07/07/16/46/dice-1502706_640.jpg", // Image for getting started section
      featureText1: "Explore hassle-free onboarding with our intuitive platform.",
      featureImage2: "https://omov8-bebd1.web.app/assets/FirstTemplatesecond-39ba3c79.png", // Image for secure transactions
      featureText2: "Enjoy secure transactions backed by cutting-edge technology.",
      ctaText: "Start Now", // Text for the CTA button
      ctaLink: "https://yourapp.com/start" // URL for the call-to-action button
    };
    

    // // Read and render the EJS template
    const template = fs.readFileSync(
      path.join(templatePath, 'registrationTemplate.ejs'),
      'utf-8'
    )
    const renderedHtml = ejs.render(template, emailData)

    // Email data
    const emailMessage = {
      from: `no-reply@${domain}`,
      to: [email],
      subject: 'Welcome to YourApp!',
      text: `Hello ${name},\n\nWelcome to YourApp! We're excited to have you onboard.\n\nBest Regards,\nYourApp Team`,
      html: renderedHtml,
    }

    await mg.messages.create(domain, emailMessage)

    console.log(`Email successfully sent to ${email}`)
    return res.status(200).send(`Email sent successfully to ${email}`)
  } catch (error) {
    console.error(
      'Mailgun error details:',
      error.response ? error.response.body : error.message
    )
    return res.status(500).send('Failed to send email')
  }
})
