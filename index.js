const fetch = require("node-fetch");
const inquirer = require("inquirer");

const API_ENDPOINT = "https://api.youneedabudget.com/v1";
const API_TOKEN = process.env.TOKEN;

const options = {
  headers: {
    Authorization: "Bearer " + API_TOKEN
  }
};

async function getActiveBudget() {
  const response = await fetch(API_ENDPOINT + "/budgets", options).then(resp =>
    resp.json()
  );
  return response.data.budgets[0];
}

async function getCategories(budgetId) {
  const response = await fetch(
    API_ENDPOINT + "/budgets/" + budgetId + "/categories",
    options
  ).then(resp => resp.json());
  return response.data.category_groups;
}

(async function loop() {
  const budget = await getActiveBudget();
  const categories = await getCategories(budget.id);
  const flatCategories = categories.reduce(
    (list, item) => list.concat(item.categories),
    []
  );

  const { category } = await inquirer.prompt([
    {
      name: "category",
      type: "list",
      message: "Pick a category to get the graph from",
      choices: flatCategories.map(cat => cat.name)
    }
  ]);

  const categoryChoice = flatCategories.find(cat => cat.name === category);
  console.log("category: ", categoryChoice);
})();
