# Security Best Practices

Essential security practices for distributed systems.

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [API Security](#api-security)
3. [Data Encryption](#data-encryption)
4. [Common Vulnerabilities](#common-vulnerabilities)
5. [Security Headers](#security-headers)
6. [Secrets Management](#secrets-management)

---

## Authentication & Authorization

### Authentication (Who are you?)

#### JWT (JSON Web Tokens)

```javascript
// Structure: header.payload.signature
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user123",
    "name": "John Doe",
    "iat": 1516239022,
    "exp": 1516242622
  }
}
```

**Implementation:**
```javascript
const jwt = require('jsonwebtoken')

// Generate token
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)

// Verify token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' })
  }
}
```

#### OAuth 2.0

**Flows:**

**Authorization Code (Most secure):**
```
1. Client redirects to authorization server
2. User logs in and grants permission
3. Server redirects back with code
4. Client exchanges code for access token
5. Client uses token to access resources
```

**Refresh Tokens:**
```javascript
// Access token: Short-lived (15 min)
// Refresh token: Long-lived (30 days)

POST /token/refresh
{
  "refresh_token": "..."
}

Response:
{
  "access_token": "new_token",
  "expires_in": 900
}
```

### Authorization (What can you do?)

#### RBAC (Role-Based Access Control)

```javascript
const roles = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  editor: ['read', 'write'],
  viewer: ['read']
}

function authorize(requiredPermission) {
  return (req, res, next) => {
    const userRole = req.user.role
    const permissions = roles[userRole]

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}

// Usage
app.delete('/api/users/:id',
  authenticateToken,
  authorize('delete'),
  deleteUserHandler
)
```

#### ABAC (Attribute-Based Access Control)

```javascript
function checkPolicy(user, resource, action) {
  // Policy: Editors can edit their own articles
  if (action === 'edit' &&
      user.role === 'editor' &&
      resource.author_id === user.id) {
    return true
  }

  // Policy: Admins can do anything
  if (user.role === 'admin') {
    return true
  }

  return false
}
```

---

## API Security

### 1. HTTPS Only

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`)
  }
  next()
})
```

### 2. Input Validation

```javascript
const { body, validationResult } = require('express-validator')

app.post('/api/users',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
  body('name').trim().escape().isLength({ min: 2, max: 100 }),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    // Process request
  }
)
```

### 3. SQL Injection Prevention

**Bad:**
```javascript
// NEVER do this
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`
```

**Good:**
```javascript
// Use parameterized queries
const query = 'SELECT * FROM users WHERE email = $1'
const result = await db.query(query, [req.body.email])

// Or ORM
const user = await User.findOne({ where: { email: req.body.email } })
```

### 4. XSS Prevention

```javascript
// Sanitize user input
const DOMPurify = require('isomorphic-dompurify')

const cleanHTML = DOMPurify.sanitize(userInput)

// Content Security Policy
res.setHeader('Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.example.com"
)
```

### 5. CSRF Protection

```javascript
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() })
})

app.post('/submit', csrfProtection, (req, res) => {
  // Process form
})
```

---

## Data Encryption

### At Rest

```javascript
// Database encryption
// PostgreSQL: Transparent Data Encryption (TDE)
// MongoDB: Encryption at Rest

// Application-level encryption
const crypto = require('crypto')

function encrypt(text, key) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text, key) {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

### In Transit

```
TLS/SSL for all connections
HTTPS for web traffic
TLS for database connections
```

### Password Hashing

```javascript
const bcrypt = require('bcrypt')

// Hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Verify password
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

// NEVER store plain passwords
// NEVER use weak hashing (MD5, SHA1)
```

---

## Common Vulnerabilities

### OWASP Top 10

**1. Injection:** SQL, NoSQL, OS command
**2. Broken Authentication:** Weak passwords, session management
**3. Sensitive Data Exposure:** Unencrypted data
**4. XML External Entities (XXE):** XML parsing vulnerabilities
**5. Broken Access Control:** Improper authorization
**6. Security Misconfiguration:** Default configs, verbose errors
**7. XSS:** Unsanitized user input
**8. Insecure Deserialization:** Unsafe object deserialization
**9. Using Components with Known Vulnerabilities:** Outdated dependencies
**10. Insufficient Logging & Monitoring:** Can't detect breaches

### Prevention

```bash
# Regular dependency updates
npm audit
npm audit fix

# Security scanning
snyk test
npm install -g retire
retire

# Code analysis
eslint --plugin security
```

---

## Security Headers

```javascript
const helmet = require('helmet')

app.use(helmet())

// Or manually
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // HSTS (Force HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'")

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  next()
})
```

---

## Secrets Management

### Environment Variables

```javascript
// .env file (NEVER commit to git)
DB_PASSWORD=secret123
API_KEY=abc123xyz
JWT_SECRET=supersecretkey

// .gitignore
.env

// Usage
require('dotenv').config()
const dbPassword = process.env.DB_PASSWORD
```

### Dedicated Services

**AWS Secrets Manager:**
```javascript
const AWS = require('aws-sdk')
const client = new AWS.SecretsManager()

async function getSecret(secretName) {
  const data = await client.getSecretValue({ SecretId: secretName }).promise()
  return JSON.parse(data.SecretString)
}

const dbCreds = await getSecret('prod/database')
```

**HashiCorp Vault:**
```javascript
const vault = require('node-vault')({
  endpoint: 'http://vault:8200',
  token: process.env.VAULT_TOKEN
})

const secrets = await vault.read('secret/data/myapp')
const apiKey = secrets.data.data.api_key
```

---

## Key Takeaways

1. **Authentication:** Use JWT or OAuth 2.0
2. **Authorization:** Implement RBAC or ABAC
3. **Input Validation:** Never trust user input
4. **Encryption:** TLS in transit, encryption at rest
5. **Headers:** Use security headers (helmet.js)
6. **Secrets:** Never commit secrets, use secret managers
7. **Updates:** Keep dependencies updated
8. **Monitoring:** Log and monitor security events

---

[← Previous: Rate Limiting](./08-rate-limiting.md) | [Next: Case Studies →](./10-case-studies.md)
