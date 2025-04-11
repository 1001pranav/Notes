const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: 'Users',
  Item: {
    userId: '123',
    name: 'John Doe',
    age: 30
  }
};

docClient.put(params).promise();
