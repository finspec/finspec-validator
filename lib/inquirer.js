const inquirer = require("inquirer");

module.exports = {
  askFinSpecQuestions: () => {
    const questions = [
      {
        name: "version",
        type: "list",
        message: "Which FinSpec version do you want to validater against?",
        choices: ["3.0", "2.1"],
        default: [0],
      },
      {
        name: "path",
        type: "input",
        message: "What is the path to FinSpec to be validated?",
      },
    ];
    return inquirer.prompt(questions);
  },
};
