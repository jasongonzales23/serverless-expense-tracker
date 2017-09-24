'use strict';

const ulid = require('ulid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.createBudget = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  const {
    amount,
    description
  } = data

  const validAmount =  typeof amount === 'number';
  const validDesc = typeof description === 'string';

  if (!validAmount || !validDesc) {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t create the budget entry.'));
    return;
  }

  const params = {
    TableName: process.env.BUDGETS_TABLE,
    Item: {
      id: ulid(),
      amount: amount,
      description: description,
      createdAt: timestamp,
    },
  };

  // write the todo to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the todo item.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};

