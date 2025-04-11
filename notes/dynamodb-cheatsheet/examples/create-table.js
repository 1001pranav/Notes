const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

const params = {
  TableName: "Users",
  KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
  AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

dynamodb.createTable(params).promise();
