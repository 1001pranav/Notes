const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: 'Users',
  Key: { userId: '123' }
};

docClient.get(params).promise().then(data => console.log(data.Item));
