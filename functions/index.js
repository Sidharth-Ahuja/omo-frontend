const functions = require('firebase-functions/v2')
const { defineSecret } = require('firebase-functions/params')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const admin = require('firebase-admin')
const Mailgun = require('mailgun.js')
const formData = require('form-data')
const cors = require('cors')({ origin: true }) // Enable CORS for all origins (for development)

// Initialize Firebase Admin SDK
admin.initializeApp()
// Mailgun Configuration
const DOMAIN = defineSecret('MAILGUN_DOMAIN')
const API_KEY = defineSecret('MAILGUN_API_KEY')

// Singleton Mailgun client
let mailgunClient = null

const getMailgunClient = (domain, apiKey) => {
  if (mailgunClient) {
    return mailgunClient
  }

  mailgunClient = new Mailgun(formData).client({ username: 'api', key: apiKey })

  return mailgunClient
}

const templatePath = path.join(__dirname, 'templates')

exports.sendRegistrationEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email, name } = req.body

      // Check if email or name is missing
      if (!email || !name) {
        return res.status(400).send('Missing required fields: email or name')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const registrationEmailTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('registration')
        const docSnap = await registrationEmailTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('Registration Email template data not found in Firestore')
        }
        // Prepare dynamic content for the template
        const emailData = docSnap.data()

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
          subject: 'Welcome to OMO!',
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
  }
)
