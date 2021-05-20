const fs = require("fs");
const ampValidator = require("amphtml-validator");
const axios = require("axios");

if (process.argv.length < 3) {
  console.error("You have to supply a text input file. Eg. input.txt");
  process.exit();
}

const filePath = process.argv[2];

console.log("Input file is: ", filePath)

let outputFileStream
if (typeof process.argv[3] !== "undefined"){
  outputFileStream = fs.createWriteStream(process.argv[3]);
  console.log("Output file is: ", process.argv[3])
}

function getMessage(validationResult, url, exception) {
  let message = "\n----------------------------------------------------\n";

  if (exception) {
    message += `${url} - ${exception.response.status}\n`
    message += "----------------------------------------------------\n";
    return message;
  }

  if (validationResult.status === "FAIL") {
    message += `${validationResult.status} - ${url}\n`;

    validationResult.errors.forEach((err) => {
      message += `${err.severity} at line ${err.line}, col ${err.col}\n`;
      message += `${err.message}\n`;
    });

    message += "----------------------------------------------------\n";
  } else {
    message += `${validationResult.status} - ${url}`;
  }

  return message;
}

function writeToConsole(message){
  console.log(message);
}

function writeToOutput(outputFileStream, message) {
  if (outputFileStream !== undefined) {
    outputFileStream.write(message, "utf-8");
  }
}

async function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

async function run() {
  const allUrls = fs.readFileSync(filePath).toString().split("\n");

  const validatorInstance = await ampValidator.getInstance();

  for (const url of allUrls) {
    if (url === "") {
      continue;
    }

    await sleep(200);

    let res;
    try {
      res = await axios.default.get(url);
    } catch (e) {
      const message = getMessage(null, url, e);
      writeToConsole(message);
      writeToOutput(outputFileStream, message);
      continue;
    }

    const validationResult = validatorInstance.validateString(res.data);
    const message = getMessage(validationResult, url);
    writeToConsole(message);
    writeToOutput(outputFileStream, message);
  }
}

run();
