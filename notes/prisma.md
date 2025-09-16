# Prisma Complete Cheat Sheet

## Table of Contents
- [Installation & Setup](#installation--setup)
- [Schema Definition](#schema-definition)
- [CLI Commands](#cli-commands)
- [Prisma Client Operations](#prisma-client-operations)
- [Relationships](#relationships)
- [Advanced Queries](#advanced-queries)
- [Migrations](#migrations)
- [Database Functions](#database-functions)
- [Error Handling](#error-handling)
- [Performance & Optimization](#performance--optimization)

## Installation & Setup

### Initial Setup
```bash
# Initialize new project
npm init -y
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# For TypeScript
npm install -D typescript ts-node @types/node
```

### Database Providers
```bash
# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/database"

# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# SQLite
DATABASE_URL="file:./dev.db"

# MongoDB
DATABASE_URL="mongodb://user:password@localhost:27017/database"

# SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=mydb;user=sa;password=password;"
```

## Schema Definition

### Basic Schema Structure
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql" // or postgresql, sqlite, mongodb, sqlserver
  url      = env("DATABASE_URL")
}
```

### Field Types
```prisma
model Example {
  // Scalars
  id          Int       @id @default(autoincrement())
  email       String    @unique
  name        String?   // Optional
  age         Int
  price       Float
  isActive    Boolean   @default(true)
  
  // Special types
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Large text
  description String    @db.Text
  content     String    @db.LongText
  
  // JSON (PostgreSQL, MySQL 5.7+)
  metadata    Json?
  
  // Decimal for precise numbers
  salary      Decimal   @db.Decimal(10, 2)
  
  // Bytes for binary data
  avatar      Bytes?
}
```

### Attributes
```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  username String @unique @db.VarChar(50)
  
  // Field mapping
  firstName String @map("first_name")
  lastName  String @map("last_name")
  
  // Default values
  role      String @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Model mapping
  @@map("users")
  
  // Indexes
  @@index([email])
  @@index([firstName, lastName])
  @@unique([username, email])
}
```

## CLI Commands

### Essential Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Pull schema from existing DB
npx prisma db pull

# Push schema to DB (for prototyping)
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

### Migration Commands
```bash
# Create migration without applying
npx prisma migrate dev --create-only --name migration_name

# Resolve migration issues
npx prisma migrate resolve --applied "migration_name"

# View migration status
npx prisma migrate status

# Seed database
npx prisma db seed
```

## Prisma Client Operations

### Client Setup
```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// With options
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty'
})
```

### CRUD Operations

#### Create
```javascript
// Create single record
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe'
  }
})

// Create with relations
const post = await prisma.post.create({
  data: {
    title: 'Hello World',
    content: 'This is my first post',
    author: {
      connect: { id: 1 } // Connect to existing user
    }
  }
})

// Create many
const users = await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' }
  ]
})
```

#### Read
```javascript
// Find unique
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
})

// Find first
const user = await prisma.user.findFirst({
  where: { age: { gte: 18 } }
})

// Find many
const users = await prisma.user.findMany({
  where: { 
    age: { gte: 18 },
    email: { contains: '@gmail.com' }
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 20
})

// Find with relations
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,
    profile: true
  }
})

// Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true
      }
    }
  }
})
```

#### Update
```javascript
// Update single
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Updated Name' }
})

// Update many
const result = await prisma.user.updateMany({
  where: { age: { lt: 18 } },
  data: { status: 'minor' }
})

// Upsert (update or create)
const user = await prisma.user.upsert({
  where: { email: 'john@example.com' },
  update: { name: 'John Updated' },
  create: {
    email: 'john@example.com',
    name: 'John Doe'
  }
})
```

#### Delete
```javascript
// Delete single
const user = await prisma.user.delete({
  where: { id: 1 }
})

// Delete many
const result = await prisma.user.deleteMany({
  where: { age: { lt: 13 } }
})
```

## Relationships

### One-to-One
```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  profile Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}
```

### One-to-Many
```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  title    String
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### Many-to-Many (Implicit)
```prisma
model Post {
  id    Int    @id @default(autoincrement())
  title String
  tags  Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}
```

### Many-to-Many (Explicit)
```prisma
model Post {
  id       Int       @id @default(autoincrement())
  title    String
  postTags PostTag[]
}

model Tag {
  id       Int       @id @default(autoincrement())
  name     String
  postTags PostTag[]
}

model PostTag {
  id       Int  @id @default(autoincrement())
  post     Post @relation(fields: [postId], references: [id])
  postId   Int
  tag      Tag  @relation(fields: [tagId], references: [id])
  tagId    Int
  assignedAt DateTime @default(now())
  
  @@unique([postId, tagId])
}
```

### Self Relations
```prisma
model User {
  id       Int    @id @default(autoincrement())
  name     String
  manager  User?  @relation("UserManager", fields: [managerId], references: [id])
  managerId Int?
  reports  User[] @relation("UserManager")
}
```

## Advanced Queries

### Filtering
```javascript
// Comparison operators
const users = await prisma.user.findMany({
  where: {
    age: { gte: 18, lte: 65 }, // >= 18 AND <= 65
    email: { not: null },
    name: { contains: 'john', mode: 'insensitive' },
    status: { in: ['active', 'pending'] },
    createdAt: { gt: new Date('2023-01-01') }
  }
})

// Logical operators
const users = await prisma.user.findMany({
  where: {
    AND: [
      { age: { gte: 18 } },
      { email: { contains: '@gmail.com' } }
    ],
    OR: [
      { status: 'active' },
      { role: 'admin' }
    ],
    NOT: {
      email: { contains: 'spam' }
    }
  }
})

// Relation filters
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: { // At least one post
        published: true
      }
    },
    comments: {
      every: { // All comments
        approved: true
      }
    },
    profile: {
      is: { // Profile exists and matches
        verified: true
      }
    }
  }
})
```

### Sorting and Pagination
```javascript
const users = await prisma.user.findMany({
  orderBy: [
    { createdAt: 'desc' },
    { name: 'asc' }
  ],
  take: 10,    // Limit
  skip: 20,    // Offset
  cursor: {    // Cursor-based pagination
    id: 100
  }
})

// Relation ordering
const users = await prisma.user.findMany({
  orderBy: {
    posts: {
      _count: 'desc' // Order by post count
    }
  }
})
```

### Aggregations
```javascript
// Count
const userCount = await prisma.user.count({
  where: { active: true }
})

// Aggregations
const result = await prisma.post.aggregate({
  _count: { id: true },
  _avg: { views: true },
  _sum: { views: true },
  _min: { createdAt: true },
  _max: { createdAt: true },
  where: { published: true }
})

// Group by
const result = await prisma.user.groupBy({
  by: ['role'],
  _count: { id: true },
  _avg: { age: true },
  having: {
    age: {
      _avg: { gt: 25 }
    }
  }
})
```

### Raw Queries
```javascript
// Raw SQL
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE age > ${18}
`

// Execute raw SQL
const result = await prisma.$executeRaw`
  UPDATE User SET active = true WHERE role = 'admin'
`

// Unsafe (for dynamic queries)
const tableName = 'User'
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM ${tableName} WHERE active = ?`,
  true
)
```

## Migrations

### Schema Changes
```bash
# Add new model
npx prisma migrate dev --name add_product_model

# Add field
npx prisma migrate dev --name add_user_avatar

# Modify field
npx prisma migrate dev --name modify_user_email_length

# Remove field  
npx prisma migrate dev --name remove_user_nickname
```

### Migration Files
```sql
-- CreateTable
CREATE TABLE `User` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `User_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Seeding
```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.createMany({
    data: [
      { email: 'admin@example.com', name: 'Admin', role: 'admin' },
      { email: 'user@example.com', name: 'User', role: 'user' }
    ]
  })
  
  console.log(`Created ${users.count} users`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to package.json:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

## Database Functions

### Transactions
```javascript
// Sequential operations
const result = await prisma.$transaction(async (prisma) => {
  const user = await prisma.user.create({
    data: { email: 'test@example.com', name: 'Test' }
  })
  
  const post = await prisma.post.create({
    data: {
      title: 'Hello World',
      authorId: user.id
    }
  })
  
  return { user, post }
})

// Batch transactions
const [userCount, postCount] = await prisma.$transaction([
  prisma.user.count(),
  prisma.post.count()
])

// Interactive transactions
const result = await prisma.$transaction(
  async (tx) => {
    const user = await tx.user.findUnique({ where: { id: 1 } })
    if (user.balance < 100) {
      throw new Error('Insufficient balance')
    }
    
    await tx.user.update({
      where: { id: 1 },
      data: { balance: user.balance - 100 }
    })
    
    return user
  },
  {
    maxWait: 5000,
    timeout: 10000
  }
)
```

### Middleware
```javascript
prisma.$use(async (params, next) => {
  console.log('Query:', params.model, params.action)
  
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  
  console.log(`Query took ${after - before}ms`)
  return result
})

// Soft delete middleware
prisma.$use(async (params, next) => {
  if (params.action === 'delete') {
    params.action = 'update'
    params.args['data'] = { deleted: true }
  }
  
  if (params.action === 'deleteMany') {
    params.action = 'updateMany'
    if (params.args.data != undefined) {
      params.args.data['deleted'] = true
    } else {
      params.args['data'] = { deleted: true }
    }
  }
  
  return next(params)
})
```

## Error Handling

### Common Errors
```javascript
import { 
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError 
} from '@prisma/client/runtime/library'

try {
  const user = await prisma.user.create({
    data: { email: 'existing@example.com' }
  })
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    // P2002 - Unique constraint violation
    if (error.code === 'P2002') {
      console.log('Email already exists')
    }
    // P2025 - Record not found
    if (error.code === 'P2025') {
      console.log('Record not found')
    }
  }
}
```

### Error Codes
```javascript
// Common Prisma error codes
const ERROR_CODES = {
  'P2002': 'Unique constraint violation',
  'P2014': 'Invalid ID',
  'P2003': 'Foreign key constraint violation',
  'P2025': 'Record not found',
  'P2016': 'Query interpretation error',
  'P2021': 'Table does not exist',
  'P2022': 'Column does not exist'
}
```

## Performance & Optimization

### Connection Pool
```javascript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool settings are configured in DATABASE_URL
  // Example: DATABASE_URL="mysql://user:pass@host:port/db?connection_limit=10"
})
```

### Query Optimization
```javascript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true
  }
})

// Use include judiciously
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      take: 5, // Limit related records
      select: {
        id: true,
        title: true
      }
    }
  }
})

// Use indexes
// In schema.prisma
// @@index([email])
// @@index([status, createdAt])
```

### Batch Operations
```javascript
// Use createMany for bulk inserts
await prisma.user.createMany({
  data: userData,
  skipDuplicates: true
})

// Use updateMany for bulk updates
await prisma.user.updateMany({
  where: { status: 'pending' },
  data: { status: 'active' }
})
```

### Read Replicas
```javascript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// For read operations, you can configure read replicas
// This requires database-level configuration
```

## Environment Configuration

### .env File
```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/mydb"

# Shadow database for development
SHADOW_DATABASE_URL="mysql://user:password@localhost:3306/mydb_shadow"

# Enable query logging
DEBUG="prisma:query"

# Connection pooling
DATABASE_URL="mysql://user:password@localhost:3306/mydb?connection_limit=10&pool_timeout=20"
```

### Multiple Environments
```javascript
// Different clients for different environments
const databaseUrl = process.env.NODE_ENV === 'production' 
  ? process.env.PROD_DATABASE_URL 
  : process.env.DEV_DATABASE_URL

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
})
```

---

## Quick Reference

### Most Used Commands
```bash
npx prisma migrate dev        # Create and apply migration
npx prisma generate          # Generate client
npx prisma studio           # Open database browser
npx prisma db push          # Push schema changes
npx prisma db pull          # Pull schema from database
```

### Most Used Operations
```javascript
// CRUD
await prisma.model.create({ data: {} })
await prisma.model.findMany({ where: {} })
await prisma.model.update({ where: {}, data: {} })
await prisma.model.delete({ where: {} })

// Relations
include: { relation: true }
select: { field: true }

// Filtering
where: { field: { equals: 'value' } }
where: { field: { in: ['a', 'b'] } }
where: { field: { contains: 'text' } }
```

This cheat sheet covers the essential Prisma concepts and operations. Keep it handy for quick reference during development!
