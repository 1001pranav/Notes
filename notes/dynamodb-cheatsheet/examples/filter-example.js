const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: 'Users',
  FilterExpression: 'age > :age',
  ExpressionAttributeValues: { ':age': 25 }
};

docClient.scan(params, (err, data) => {
  if (err) console.error(err);
  else console.log(data.Items);
});
