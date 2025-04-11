# 🚀 DynamoDB Full Cheat Sheet (Beginner to Advanced)

This cheat sheet is designed to give you everything you need to understand and work with DynamoDB from the basics to advanced concepts using Node.js.

> ✅ Covers: Core Concepts, Indexing, Filters, Capacity Units, Best Practices, and Working Examples.

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

- **Scalar Types**: `String`, `Number`, `Binary`, `Boolean`, `Null`
- **Document Types**: `List`, `Map`
- **Set Types**: `String Set`, `Number Set`, `Binary Set`

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
---

### Put Item
```js
const docClient = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: 'Users',
  Item: { userId: '123', name: 'John', age: 30 }
};
docClient.put(params).promise();
```

### Get Item
```js
const params = { TableName: 'Users', Key: { userId: '123' } };
docClient.get(params).promise();
```

---

## Indexing in DynamoDB

### 1. Global Secondary Index (GSI)
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

### 2. Local Secondary Index (LSI)
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
> Filters are applied **after** fetching data. They **don’t reduce RCU**.

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


### 

```js
const params = {
  TableName: 'Users',
  KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
  AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
};
```