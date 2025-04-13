# DynamoDB Full Cheat Sheet (Beginner to Advanced)

This cheat sheet is designed to give you everything you need to understand and work with DynamoDB from the basics to advanced concepts using Node.js.

> Covers: Core Concepts, Indexing, Filters, Capacity Units, Best Practices, and Working Examples.

---

## 📘 Table of Contents

1. [What is DynamoDB?](#what-is-dynamodb)  
2. [Basic Concepts](#basic-concepts)  
3. [Data Types](#data-types)  
4. [Read & Write Capacity Units](#read--write-capacity-units)  
5. [Basic Operations with Node.js](#basic-operations-with-nodejs)  
6. [Indexing in DynamoDB](#indexing-in-dynamodb)  
7. [Filters](#filters)  
8. [Best Practices](#best-practices)  
9. [Summary Table](#summary-table)  
10. [Folder Structure for GitHub Repo](#folder-structure-for-github-repo)
11. [DynamoDB Transaction](#DynamoDB-Transactions)
---

## What is DynamoDB?
Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability.

---

## Basic Concepts

- **Table**: Collection of data.
- **Item**: A single row in a table.
- **Attribute**: A single column in an item.
- **Primary Key**: Unique key to identify items.
  - **Partition Key**
  - **Partition + Sort Key**
---

## Data Types

## 🧠 DynamoDB Data Type Reference

| Type             | Code | Description                                 |
|------------------|------|---------------------------------------------|
| **String**       | `S`  | Any UTF-8 string                            |
| **Number**       | `N`  | Stored as string, supports numeric values   |
| **Binary**       | `B`  | Base64-encoded binary data                  |
| **Boolean**      | `BOOL` | `true` or `false`                         |
| **Null**         | `NULL` | Represents an empty value (`null`)       |
| **String Set**   | `SS` | A set of strings                           |
| **Number Set**   | `NS` | A set of numbers                           |
| **Binary Set**   | `BS` | A set of base64-encoded binary values      |
| **List**         | `L`  | Ordered list of elements                   |
| **Map**          | `M`  | Unordered key-value pairs (like JSON object) |


```json
{
  "id": { "S": "user#123" },                                // String (S)
  "age": { "N": "30" },                                     // Number (N)
  "isActive": { "BOOL": true },                             // Boolean (BOOL)
  "profileImage": { "B": "U3RyaW5nIGJhc2U2NCBlbmNvZGVk" },  // Binary (B)
  "tags": { "SS": ["developer", "blogger"] },               // String Set (SS)
  "scores": { "NS": ["90", "85", "88"] },                   // Number Set (NS)
  "certificates": { "BS": ["Q2VydDE=", "Q2VydDI="] },       // Binary Set (BS)
  "address": {                                              // Map (M)
    "M": {
      "city": { "S": "Bangalore" },
      "pin": { "N": "560001" }
    }
  },
  "hobbies": {                                              // List (L)
    "L": [
      { "S": "Reading" },
      { "S": "Gaming" },
      { "S": "Traveling" }
    ]
  },
  "createdAt": { "S": "2024-04-11T09:00:00Z" },             // ISO8601 date string (custom convention)
  "nullableField": { "NULL": true }                         // Null (NULL)
}
```
---

## Basic Operations with Node.js

Install SDK:
```bash
npm install aws-sdk
```

### [Create Table](./examples/create-table.js)
```js
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

const params = {
  TableName: "Users",
  KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
  AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
};

dynamodb.createTable(params).promise();
```

- `TableName`: the name of the table
- `KeySchema`: Contains either `Primary key` or a `composite key (Primary Key + Sort Key)`
  - `Primary Key (HASH)`: It is Mandatory Field and `KeyType` `HASH` is represented for primary key
  - `Sort Key (RANGE)`: It is optional. This enables multiple `Primary Key` exists in a system with unique `Sort Key` and as name suggest it allows to sort data based on Primary + Sort (Ascending By Default). `KeyType` `RANGE` is used for Sort key
- `AttributeDefinitions`: It Defines the type of Data types for Primary or secondary keys 
  - Attribute Type: We can only have 3 types of attribute types 
    - S -> String
    - N -> Number
    - B -> Binary 

### Read & Write Capacity Units

- ReadCapacityUnits (RCUs): Number of strongly consistent reads per second of up to 4 KB each.
  - Eventually consistent reads consume 0.5 RCUs.

- WriteCapacityUnits (WCUs): Number of writes per second for items up to 1 KB.

#### On-Demand Mode
- Automatically scales based on traffic, No need to set capacity.
- Ideal for unpredictable workloads.

#### Provisioned Mode
- You specify the **Read Capacity Units (RCU)** and **Write Capacity Units (WCU)**.
  - **1 RCU** = one strongly consistent read per second for an item up to 4 KB.
  - **1 WCU** = one write per second for an item up to 1 KB.
- Cheaper when you know your traffic.


#### Pricing Tips

- Reads (RCU): $0.25 per million (approx.)

- Writes (WCU): $1.25 per million (approx.)

Use Batch operations to reduce cost.
Avoid Scan in large tables.

**Example**: To support 100 reads/sec and 50 writes/sec for 4 KB items:
```bash
RCU = 100
WCU = 50
```

`note: While creating tables we specify only HASH and RANGE  (Primary and/or Sort)`
---
## CURD Operations

### [Insert Items](./examples/put-item.js)
```js
const docClient = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: 'Users',
  Item: { userId: '123', name: 'John', age: 30 }
};
docClient.put(params).promise();
```

### [Get Item](./examples/get-item.js)
```js
const params = { TableName: 'Users', Key: { userId: '123' } };
docClient.get(params).promise();
```
### [Update Item](./examples/update-item.js)
```js
const params = {
  TableName: 'Users',
  Key: { userId: 'u1' },
  UpdateExpression: 'set age = :a',
  ExpressionAttributeValues: { ':a': 31 },
  ReturnValues: 'UPDATED_NEW'
};
docClient.update(params, console.log);
```

### [Delete Item](./examples/delete-item.js)

const params = {
  TableName: 'Users',
  Key: { userId: 'u1' }
};
docClient.delete(params, console.log);



---

## Indexing in DynamoDB

### [1. Global Secondary Index (GSI)](./examples/gsi-query.js
') 
- Query across **any attribute**.
- Doesn't need to be part of primary key.
- Has separate read/write capacity.

**Example:**
```js
const params = {
  TableName: 'Users',
  IndexName: 'EmailIndex',
  KeyConditionExpression: 'email = :e',
  ExpressionAttributeValues: { ':e': 'john@example.com' }
};
docClient.query(params).promise();
```

### [2. Local Secondary Index (LSI)](./examples/lsi-query.js)
- Based on same partition key, but different sort key.
- Must be defined during table creation.

**Example:**
```js
const params = {
  TableName: 'Users',
  IndexName: 'AgeIndex',
  KeyConditionExpression: 'userId = :uid AND age > :age',
  ExpressionAttributeValues: {
    ':uid': '123',
    ':age': 25
  }
};
docClient.query(params).promise();
```

---

## Filters

- Used with `Scan` or `Query` to **filter results after matching key conditions**.

**Example:**
```js
const params = {
  TableName: 'Users',
  FilterExpression: 'age > :a',
  ExpressionAttributeValues: { ':a': 25 }
};
docClient.scan(params).promise();
```

## DynamoDB `FilterExpression` 

| Expression Type        | Syntax Example | Explanation |
|------------------------|----------------|-------------|
| **Equals (`=`)** | `status = :statusVal`<br>`{ ":statusVal": "active" }` | Returns items where `status` is `"active"` |
| **Not Equals (`<>`)** | `status <> :statusVal`<br>`{ ":statusVal": "inactive" }` | Returns items where `status` is **not** `"inactive"` |
| **Greater Than (`>`)** | `age > :minAge`<br>`{ ":minAge": 18 }` | Returns items where `age` is greater than 18 |
| **Greater Than or Equal (`>=`)** | `age >= :minAge`<br>`{ ":minAge": 21 }` | Items where `age` is 21 or more |
| **Less Than (`<`)** | `price < :maxPrice`<br>`{ ":maxPrice": 100 }` | Items where `price` is less than 100 |
| **Less Than or Equal (`<=`)** | `price <= :maxPrice`<br>`{ ":maxPrice": 100 }` | Items where `price` is less than or equal to 100 |
| **Begins With** | `begins_with(name, :prefix)`<br>`{ ":prefix": "A" }` | Items where `name` starts with "A" |
| **Contains** | `contains(tags, :tag)`<br>`{ ":tag": "featured" }` | Works with lists and strings; returns items containing `"featured"` |
| **Between** | `price BETWEEN :low AND :high`<br>`{ ":low": 100, ":high": 500 }` | Items where `price` is between 100 and 500 inclusive |
| **AND / OR** | `status = :status AND age >= :minAge`<br>`{ ":status": "active", ":minAge": 21 }` | Combines multiple filters |
| **Simulate IN (OR)** | `status = :val1 OR status = :val2`<br>`{ ":val1": "pending", ":val2": "approved" }` | Simulates `IN ("pending", "approved")` |
| **Attribute Exists** | `attribute_exists(email)` | Items where `email` field exists |
| **Attribute Not Exists** | `attribute_not_exists(deletedAt)` | Filters out soft-deleted records (where `deletedAt` is missing) |
| **Attribute Type** | `attribute_type(score, :type)`<br>`{ ":type": "N" }` | Checks if `score` is of type **Number** |

---

## ⚠️ Notes

- `FilterExpression` filters **after data is fetched** (post-read), so RCUs are still consumed.
- Combine with `KeyConditionExpression` when using `query` for more efficient results.
- Works for both `Query` and `Scan` operations.
---

## Best Practices

- Prefer `Query` over `Scan`
- Use GSIs for alternate queries
- Keep items small (< 400 KB)
- Monitor with CloudWatch
- Use exponential backoff on retries

---


## Summary Table

| Operation     | Use-case                  | Function                |
|---------------|----------------------------|--------------------------|
| Put Item      | Create/Insert data         | `put()`                  |
| Get Item      | Read data by key           | `get()`                  |
| Update Item   | Modify data                | `update()`               |
| Delete Item   | Remove data                | `delete()`               |
| Query         | Filter by key/index        | `query()`                |
| Scan          | Full table read            | `scan()`                 |
| GSI           | Alternate query key        | `IndexName` param        |
| LSI           | Local alternate sort key   | Defined at creation time |

---

## Folder Structure for GitHub Repo

```
dynamodb-cheatsheet/
├── README.md
├── examples/
│   ├── create-table.js
│   ├── put-item.js
│   ├── get-item.js
│   ├── update-item.js
│   ├── delete-item.js
│   ├── gsi-query.js
│   ├── lsi-query.js
│   └── filter-example.js
├── assets/
└── LICENSE
```

---


## DynamoDB Transactions

DynamoDB supports **ACID transactions**, which means operations are **Atomic, Consistent, Isolated, and Durable** — just like in traditional databases.

> Transactions allow you to **group multiple reads and writes** into a single all-or-nothing operation.

---

### Supported Transaction APIs

| API Name                 | Description                                            |
|--------------------------|--------------------------------------------------------|
| `transactWriteItems`     | Perform **up to 100 write operations** in one call     |
| `transactGetItems`       | Perform **up to 100 read operations** in one call      |

---

##  `transactWriteItems` – Example

```js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, TransactWriteCommand } = require("@aws-sdk/lib-dynamodb");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));

const params = {
  TransactItems: [
    {
      Put: {
        TableName: "Users",
        Item: {
          userId: "user#123",
          name: "Alice",
          balance: 500
        }
      }
    },
    {
      Update: {
        TableName: "Users",
        Key: { userId: "acc#xyz" },
        UpdateExpression: "SET balance = balance - :amount",
        ExpressionAttributeValues: {
          ":amount": 100
        },
        ConditionExpression: "balance >= :amount"
      }
    }
  ]
};

await client.send(new TransactWriteCommand(params));
```

- In the above example initially it will create a user with 500 balance.
- In second one it  gets an user checks if balance is greater than or equal to 100, If success
  - Transaction is successful and deducts the 100 from balance
  - If fails then reverts insert operation

## `transactGetItems` - Example

```js
const { TransactGetCommand } = require("@aws-sdk/lib-dynamodb");

const params = {
  TransactItems: [
    {
      Get: {
        TableName: "Users",
        Key: { userId: "user#123" }
      }
    },
    {
      Get: {
        TableName: "Accounts",
        Key: { accountId: "acc#xyz" }
      }
    }
  ]
};

const result = await client.send(new TransactGetCommand(params));
console.log(result.Responses);
```
