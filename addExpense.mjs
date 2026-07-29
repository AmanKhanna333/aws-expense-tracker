import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { amount, category, date, note } = body;
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    const expense = {
      expenseId: randomUUID(),
      userId,
      amount: parseFloat(amount),
      category,
      date,
      note: note || "",
      createdAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: "Expenses",
      Item: expense
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(expense)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
