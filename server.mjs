import { createReadStream, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import nodemailer from 'nodemailer'

const port = Number(process.env.PORT || 3000)
const distDirectory = resolve('dist')
const maxBodySize = 16 * 1024
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

const requiredMailVariables = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL']

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(value))
}

function readJson(request) {
  return new Promise((resolveBody, reject) => {
    let size = 0
    let body = ''
    request.on('data', chunk => {
      size += chunk.length
      if (size > maxBodySize) {
        reject(new Error('Request too large'))
        request.destroy()
        return
      }
      body += chunk
    })
    request.on('end', () => {
      try { resolveBody(JSON.parse(body || '{}')) } catch { reject(new Error('Invalid request')) }
    })
    request.on('error', reject)
  })
}

function text(value, maxLength = 4000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function headerText(value) {
  return text(value, 200).replace(/[\r\n]+/g, ' ')
}

function validEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value) && value.length <= 254
}

function mailConfiguration() {
  const missing = requiredMailVariables.filter(key => !process.env[key])
  if (missing.length) return null
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    from: process.env.CONTACT_FROM_EMAIL,
    to: process.env.CONTACT_TO_EMAIL,
  }
}

async function sendContactEmail(payload) {
  const configuration = mailConfiguration()
  if (!configuration) throw new Error('Mail is not configured')
  const transporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure,
    requireTLS: !configuration.secure,
    auth: configuration.auth,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  })
  const inquiryText = [
    'New website inquiry',
    '',
    `Name: ${payload.name}`,
    `Company: ${payload.company}`,
    `Email: ${payload.email}`,
    `Country or Region: ${payload.region || 'Not provided'}`,
    `WhatsApp: ${payload.whatsapp || 'Not provided'}`,
    `Product Interest: ${payload.interest || 'Not provided'}`,
    `Product Model / Family: ${payload.product || 'Not provided'}`,
    '',
    'Message:',
    payload.message,
  ].join('\n')

  await transporter.sendMail({
    from: `Dulifei Website <${configuration.from}>`,
    to: configuration.to,
    replyTo: payload.email,
    subject: `Website inquiry from ${headerText(payload.name)}`,
    text: inquiryText,
  })

  try {
    await transporter.sendMail({
      from: `Dulifei <${configuration.from}>`,
      to: payload.email,
      subject: 'We received your inquiry | Dulifei',
      text: `Hello ${payload.name},\n\nThank you for contacting Dulifei. We have received your inquiry and will review the information you shared.\n\nBest regards,\nDulifei`,
    })
  } catch (error) {
    console.error('Inquiry delivered, but automatic reply could not be sent.', error)
  }
}

async function handleContact(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed' })
  try {
    const body = await readJson(request)
    if (text(body.website)) return sendJson(response, 200, { ok: true })
    const payload = {
      name: headerText(body.name),
      company: headerText(body.company),
      email: headerText(body.email),
      region: text(body.region, 200),
      whatsapp: text(body.whatsapp, 200),
      interest: text(body.interest, 200),
      product: text(body.product, 200),
      message: text(body.message, 4000),
    }
    if (!payload.name || !payload.company || !payload.message || !validEmail(payload.email)) {
      return sendJson(response, 400, { error: 'Please provide the required inquiry details.' })
    }
    if (!mailConfiguration()) return sendJson(response, 503, { error: 'Email service is not configured.' })
    await sendContactEmail(payload)
    return sendJson(response, 200, { ok: true })
  } catch (error) {
    console.error('Contact request failed.', error)
    return sendJson(response, 500, { error: 'Unable to send inquiry.' })
  }
}

function serveFile(pathname, response) {
  const relativePath = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^([/\\]*\.\.[/\\]*)+/, '')
  const requestedFile = resolve(distDirectory, `.${relativePath}`)
  const isAssetRequest = extname(requestedFile) !== ''
  const file = requestedFile.startsWith(distDirectory) && existsSync(requestedFile)
    ? requestedFile
    : isAssetRequest ? null : join(distDirectory, 'index.html')
  if (!file || !existsSync(file)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }
  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(file)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  })
  createReadStream(file).pipe(response)
}

createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  if (url.pathname === '/api/contact') {
    void handleContact(request, response)
    return
  }
  serveFile(url.pathname, response)
}).listen(port, '0.0.0.0', () => {
  console.log(`Dulifei website is listening on port ${port}`)
})
