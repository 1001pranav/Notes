const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: 'Users',
  Key: { userId: '123' },
  UpdateExpression: 'set age = :a',
  ExpressionAttributeValues: { ':a': 31 }
};

docClient.update(params).promise();
