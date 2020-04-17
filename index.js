const fs = require("fs");
const ampValidator = require("amphtml-validator");
const axios = require("axios");

if (process.argv.length < 3) {
  console.error("You have to supply a text input file. Eg. input.txt");
  process.exit();
}

const filePath = process.argv[2];

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
      console.log(e);
      continue;
    }

    const validationResult = validatorInstance.validateString(res.data);

    if (validationResult.status === "FAIL") {
      console.log("\n----------------------------------------------------");
      console.log(`${validationResult.status} - ${url}`);

      validationResult.errors.forEach((err) => {
        console.log(`${err.severity} at line ${err.line}, col ${err.col}`);
        console.log(`${err.message}`);
      });

      console.log("----------------------------------------------------\n");
    } else {
      console.log(`${validationResult.status} - ${url}`);
    }
  }
}

run();
