const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const inquirer = require("./lib/inquirer");
const validator = require("./lib/validator");

clear();

// Splash
console.log(
  chalk.yellow(figlet.textSync("FinSpec", { horizontalLayout: "full" }))
);

// Get input
const run = async () => {
  const answers = await inquirer.askFinSpecQuestions();
  validator.validateFinSpec(answers, function(message) {   
    if(message.pass) {
      console.log(
        chalk.green("\n----\nFile passes validation - great job!\n----\n")
      );
    }
    else {
      console.log(
        chalk.red("\n----\nFile fails validation - here's the feedback:\n\n" + message.error + "\n\n----\n")
      );
    }
  });
};

run();