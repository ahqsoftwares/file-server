import * as core from '@actions/core';
import * as fs from "fs";
import fetch from "node-fetch";

async function run(): Promise<void> {
  try {
    fetch("https://api.github.com/repos/arandomusernametouse/trivia-app/releases/latest")
    .then((data) => {
      return data.json() as Object
    })
    .then((text) => {
      core.info(JSON.stringify(text));
      fs.writeFileSync("./data.json", JSON.stringify(text));
    })
  } catch (error) {
    if (error instanceof Error)     core.setFailed(error.message)
  }
}

run()
