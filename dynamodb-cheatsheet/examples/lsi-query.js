const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: 'Users',
  IndexName: 'UserAgeIndex',
  KeyConditionExpression: 'userId = :uid AND age > :age',
  ExpressionAttributeValues: {
    ':uid': '123',
    ':age': 25
  }
};

docClient.query(params).promise();
