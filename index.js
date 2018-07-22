const fetch = require("node-fetch");
const inquirer = require("inquirer");
const moment = require("moment");

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

async function getBudgetForMonth(budgetId, month) {
  const url =
    API_ENDPOINT +
    "/budgets/" +
    budgetId +
    "/months/" +
    month.format("YYYY-MM-DD");
  console.log(url);
  const response = await fetch(url, options).then(resp => resp.json());
  console.log(response)
  return response.data.month.categories;
}

(async function loop() {
  const budget = await getActiveBudget();
  const firstMonth = moment(budget.first_month).day(0);
  const lastMonth = moment(budget.last_month).day(0);
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


  let currentMonth = firstMonth.clone();
  const categoryForMonths = [];
  while (currentMonth.isBefore(lastMonth)) {
    getBudgetForMonth(budget.id, currentMonth);
    const categoriesForMonth = await getBudgetForMonth(budget.id, currentMonth);

    const selectedCategoryForMonth = categoriesForMonth.find(cat => cat.name === category);
    categoryForMonths.push(selectedCategoryForMonth);

    currentMonth.add(1, "month");
  }

  console.log(categoryForMonths);


  // For each month since start of budget
  // GET /budgets/{budget_id}/months/{month} => categories
  // Draw this as pdf chart
})();
