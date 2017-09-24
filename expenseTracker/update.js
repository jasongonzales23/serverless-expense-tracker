'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  const {
    amount,
    description
  } = data

  // validation
  const validAmount =  typeof amount === 'number';
  const validDesc = typeof description === 'string';

  if (!validAmount || !validDesc) {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t update the expense entry.'));
    return;
  }

  const params = {
    TableName: process.env.EXPENSES_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeValues: {
      ':amount': amount,
      ':description': description,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET amount = :amount, description = :description, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  // update the todo in the database
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t update the expense item.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
