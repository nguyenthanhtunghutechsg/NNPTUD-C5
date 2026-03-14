let fs = require('fs')
let path = require('path')
let jwt = require('jsonwebtoken')
let { generateKeyPairSync } = require('crypto')

let keyDir = path.join(__dirname, '..', 'keys')
let privateKeyPath = path.join(keyDir, 'jwtRS256.key')
let publicKeyPath = path.join(keyDir, 'jwtRS256.key.pub')

function normalizeEnvKey(value) {
  if (!value) {
    return null
  }
  return value.replace(/\\n/g, '\n')
}

function getOrCreateKeyPair() {
  let envPrivateKey = normalizeEnvKey(process.env.JWT_PRIVATE_KEY)
  let envPublicKey = normalizeEnvKey(process.env.JWT_PUBLIC_KEY)

  if (envPrivateKey && envPublicKey) {
    return {
      privateKey: envPrivateKey,
      publicKey: envPublicKey,
    }
  }

  if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
    return {
      privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
      publicKey: fs.readFileSync(publicKeyPath, 'utf8'),
    }
  }

  let { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })

  fs.mkdirSync(keyDir, { recursive: true })
  fs.writeFileSync(privateKeyPath, privateKey)
  fs.writeFileSync(publicKeyPath, publicKey)

  return {
    privateKey,
    publicKey,
  }
}

let keyPair = getOrCreateKeyPair()

module.exports = {
  signToken: function (payload, options = {}) {
    let tokenOptions = {
      expiresIn: '1h',
      ...options,
      algorithm: 'RS256',
    }

    return jwt.sign(payload, keyPair.privateKey, tokenOptions)
  },
  verifyToken: function (token) {
    return jwt.verify(token, keyPair.publicKey, {
      algorithms: ['RS256'],
    })
  },
}