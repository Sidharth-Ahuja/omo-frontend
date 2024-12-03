const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Mailgun = require('mailgun.js');
const formData = require('form-data');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Mailgun Configuration
const mailgun = new Mailgun(formData);
const DOMAIN = "";
const API_KEY = "";
const mg = mailgun.client({username: 'api', key: API_KEY});

exports.sendRegistrationEmail = functions.https.onRequest(async (req, res) => {
  // Ensure it's a POST request
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }
  console.log("Request body:", req.body);
  const { email, name } = req.body;
  console.log(email,name);

  // Check if email or name is missing
  if (!email || !name) {
    return res.status(400).send("Missing required fields: email or name");
  }

  // Email data
  const emailData = {
    from: `mailgun@${domain}`,
    to: [email],
    subject: "Welcome to YourApp!",
    text: `Hello ${name},\n\nWelcome to YourApp! We're excited to have you onboard.\n\nBest Regards,\nYourApp Team`
  };

  try {
    console.log("Sending email with data:", emailData);
    await mg.messages.create(DOMAIN, emailData);
    console.log(`Email successfully sent to ${email}`);
    return res.status(200).send(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error("Mailgun error details:", error.response ? error.response.body : error.message);
    return res.status(500).send("Failed to send email");
  }

});
