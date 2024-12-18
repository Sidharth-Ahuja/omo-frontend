const functions = require('firebase-functions/v2')
const { defineSecret } = require('firebase-functions/params')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const admin = require('firebase-admin')
const Mailgun = require('mailgun.js')
const formData = require('form-data')
const cors = require('cors')({ origin: true }) // Enable CORS for all origins (for development)
const serviceAccount = require("./config/autoEmailServiceAccountKey.json"); // Path to your service account file

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "omo-v1.appspot.com",
});

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
      const { email } = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
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

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/registration/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path, featuredImage2Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
          if (fileName.includes('featuredimage2'))
            featuredImage2Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path ||
          !featuredImage2Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage2URL = await storage
          .bucket()
          .file(featuredImage2Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1
        emailData.featuredImage2 = featuredImage2URL[0] // Signed URL for featuredImage2


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
exports.sendAddressApprovedAutoEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email } = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const addressApprovedAutoEmailTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('addressApproved')
        const docSnap = await addressApprovedAutoEmailTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('Address Approved Auto Email template data not found in Firestore')
        }

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/addressApproved/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1


        // // Read and render the EJS template
        const template = fs.readFileSync(
          path.join(templatePath, 'addressApprovedTemplate.ejs'),
          'utf-8'
        )


        const renderedHtml = ejs.render(template, emailData)

        // Email data
        const emailMessage = {
          from: `no-reply@${domain}`,
          to: [email],
          subject: 'Your Documents Have Been Verified!',
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
exports.sendAddressDeclinedAutoEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email} = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const addressDeclinedAutoEmailTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('addressDeclined')
        const docSnap = await addressDeclinedAutoEmailTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('Address Declined Email template data not found in Firestore')
        }

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/addressDeclined/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1


        // // Read and render the EJS template
        const template = fs.readFileSync(
          path.join(templatePath, 'addressDeclinedTemplate.ejs'),
          'utf-8'
        )


        const renderedHtml = ejs.render(template, emailData)

        // Email data
        const emailMessage = {
          from: `no-reply@${domain}`,
          to: [email],
          subject: 'Document Verification Update!',
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
exports.sendBonusAutoEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email } = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const bonusAutoEmailTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('bonus')
        const docSnap = await bonusAutoEmailTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('Bonus Auto Email template data not found in Firestore')
        }

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/bonus/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1


        // // Read and render the EJS template
        const template = fs.readFileSync(
          path.join(templatePath, 'bonusTemplate.ejs'),
          'utf-8'
        )


        const renderedHtml = ejs.render(template, emailData)

        // Email data
        const emailMessage = {
          from: `no-reply@${domain}`,
          to: [email],
          subject: 'Claim your Prizes Now!',
          html: renderedHtml,
        }

        await mg.messages.create(domain, emailMessage)

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
exports.sendDepositAutoEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email } = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const depositTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('deposit')
        const docSnap = await depositTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('Deposit Auto Email template data not found in Firestore')
        }

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/deposit/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1


        // // Read and render the EJS template
        const template = fs.readFileSync(
          path.join(templatePath, 'depositTemplate.ejs'),
          'utf-8'
        )


        const renderedHtml = ejs.render(template, emailData)

        // Email data
        const emailMessage = {
          from: `no-reply@${domain}`,
          to: [email],
          subject: 'Purchase Succesful!',
          html: renderedHtml,
        }

        await mg.messages.create(domain, emailMessage)
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
exports.sendIDApprovedEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email } = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const idApprovedAutoEmailTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('idApproved')
        const docSnap = await idApprovedAutoEmailTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('ID Approved Auto Email template data not found in Firestore')
        }

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/idApproved/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1


        // // Read and render the EJS template
        const template = fs.readFileSync(
          path.join(templatePath, 'idApprovedTemplate.ejs'),
          'utf-8'
        )


        const renderedHtml = ejs.render(template, emailData)

        // Email data
        const emailMessage = {
          from: `no-reply@${domain}`,
          to: [email],
          subject: 'Your Documents Have Been Verified!',
          html: renderedHtml,
        }

        await mg.messages.create(domain, emailMessage)
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
exports.sendIDDeclinedAutoEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email } = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const idDeclinedAutoEmailTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('idDeclined')
        const docSnap = await idDeclinedAutoEmailTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('ID Declined Email template data not found in Firestore')
        }

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/idDeclined/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1


        // // Read and render the EJS template
        const template = fs.readFileSync(
          path.join(templatePath, 'idDeclinedTemplate.ejs'),
          'utf-8'
        )


        const renderedHtml = ejs.render(template, emailData)

        // Email data
        const emailMessage = {
          from: `no-reply@${domain}`,
          to: [email],
          subject: 'Document Verification Update!',
          html: renderedHtml,
        }

        await mg.messages.create(domain, emailMessage)
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
exports.sendRewardsAutoEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email } = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const rewardsAutoEmailTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('rewards')
        const docSnap = await rewardsAutoEmailTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('Rewards Email template data not found in Firestore')
        }

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/rewards/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1


        // // Read and render the EJS template
        const template = fs.readFileSync(
          path.join(templatePath, 'rewardsTemplate.ejs'),
          'utf-8'
        )


        const renderedHtml = ejs.render(template, emailData)

        // Email data
        const emailMessage = {
          from: `no-reply@${domain}`,
          to: [email],
          subject: 'Reward Unlocked!',
          html: renderedHtml,
        }

        await mg.messages.create(domain, emailMessage)
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
exports.sendWithdrawEmail = functions.https.onRequest(
  { secrets: [DOMAIN, API_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // Ensure it's a POST request
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed')
      }
      const { email } = req.body

      // Check if email or name is missing
      if (!email) {
        return res.status(400).send('Missing required fields: email')
      }
      const domain = DOMAIN.value()
      const apiKey = API_KEY.value()
      const mg = getMailgunClient(domain, apiKey)

      try {
        const withdrawAutoEmailTemplateDocRef = admin
          .firestore()
          .collection('auto-email-templates')
          .doc('withdraw')
        const docSnap = await withdrawAutoEmailTemplateDocRef.get()

        if (!docSnap.exists) {
          return res
            .status(404)
            .send('Withdraw Auto Email template data not found in Firestore')
        }

        const emailData = docSnap.data()

        // Get the image URLs from Firebase Storage (assuming these fields store the path to images)
        const storage = admin.storage()

        const folderPath = 'auto-email-templates-images/withdraw/'
        const [files] = await storage.bucket().getFiles({ prefix: folderPath })

        let bgImagePath, logoPath, featuredImage1Path

        files.forEach((file) => {
          const fileName = file.name.toLowerCase();

          if (fileName.includes('bgimage')) bgImagePath = file.name
          if (fileName.includes('logo')) logoPath = file.name
          if (fileName.includes('featuredimage1'))
            featuredImage1Path = file.name
        })

        if (
          !bgImagePath ||
          !logoPath ||
          !featuredImage1Path
        ) {
          throw new Error('One or more required images are missing.')
        }
        
        // Get download URLs for the images
        const bgImageURL = await storage
          .bucket()
          .file(bgImagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const logoURL = await storage
          .bucket()
          .file(logoPath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })
        const featuredImage1URL = await storage
          .bucket()
          .file(featuredImage1Path)
          .getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 })

        // Include the URLs in the data to pass to the template
        emailData.bgimage = bgImageURL[0] // Signed URL for background image
        emailData.logo = logoURL[0] // Signed URL for logo
        emailData.featuredImage1 = featuredImage1URL[0] // Signed URL for featuredImage1


        // // Read and render the EJS template
        const template = fs.readFileSync(
          path.join(templatePath, 'withdrawTemplate.ejs'),
          'utf-8'
        )


        const renderedHtml = ejs.render(template, emailData)

        // Email data
        const emailMessage = {
          from: `no-reply@${domain}`,
          to: [email],
          subject: 'Withdrawal is On the Way!',
          html: renderedHtml,
        }

        await mg.messages.create(domain, emailMessage)
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
