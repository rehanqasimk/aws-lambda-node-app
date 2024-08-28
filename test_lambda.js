const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { fromIni } = require("@aws-sdk/credential-providers");


const _env = require("dotenv")
_env.config()
const ENV = process.env

async function invokeLambda(profileName, region, functionName) {
  try {
    // Create Lambda client
    const client = new LambdaClient({
      region: region,
      credentials: fromIni({ profile: profileName })
    });

    // Parameters for invoking the Lambda function
    const params = {
      FunctionName: functionName,
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
      Payload: JSON.stringify({}) // Empty payload as the Lambda doesn't expect any input
    };

    // Invoke the Lambda function
    const command = new InvokeCommand(params);
    const { Payload, LogResult } = await client.send(command);

    // Parse and log the result
    const result = JSON.parse(Buffer.from(Payload).toString());
    console.log("Lambda function response:");
    console.log("Status Code:", result.statusCode);
    console.log("Body:", JSON.parse(result.body));

    // If you want to see the logs:
    if (LogResult) {
      console.log("\nLogs:", Buffer.from(LogResult, 'base64').toString());
    }
  } catch (err) {
    console.error("Error invoking Lambda function:", err);
  }
}

// Usage
const profileName = ENV.PROFILE_NAME; // Replace with your AWS profile name
const region = ENV.REGION; // e.g., 'us-east-1'
const functionName = ENV.FUNCTION_NAME;

invokeLambda(profileName, region, functionName);