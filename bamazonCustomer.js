const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "*******",
    database: "bamazon"
});

// Create connection to mySQL database
connection.connect(function (err) {
    if (err) throw err;
    console.log(chalk.green.bold("---You've made it to Bamazon!---"))
    start();
})

// initialize store app
function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: chalk.bold("Let's get started. Select an option below."),
            choices: ["Product View", "Department View", "Exit"]
        }).then(function (answers) {
            switch (answers.action) {
                case "Product View":
                    viewAssortment1();
                    break;

                case "Department View":
                    viewAssortment2();
                    break;

                case "Exit":
                    connection.end();
            }
        })
};

// wide view
function viewAssortment1() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var table = new Table(
            {
                head: [chalk.bold("Product ID"), chalk.bold("Product Name"), chalk.bold("Department"), chalk.bold("Price"), chalk.bold("Quanity")],
                colWidths: [12, 75, 20, 12, 12]
            }
        )
        for (var x = 0; x < res.length; x++) {
            table.push(
                [res[x].Id, res[x].ProductName, res[x].DepartmentName, res[x].Price, res[x].StockQuantity]
            );
        }
        console.log(table.toString());
        createCart()
    })
}

// department view
function viewAssortment2() {
    inquirer
        .prompt({
            type: 'rawlist',
            name: "department",
            message: "Select a department",
            choices: ["Home Theater", "Mobile"]
        }).then(function (answer) {
            connection.query("SELECT * FROM products WHERE ?", { DepartmentName: answer.department },
                function (err, res) {
                    if (err) throw err;

                    var table = new Table(
                        {
                            head: [chalk.bold("Product ID"), chalk.bold("Product Name"), chalk.bold("Department"), chalk.bold("Price"), chalk.bold("Quanity")],
                            colWidths: [12, 75, 20, 12, 12]
                        }
                    )
                    for (var x = 0; x < res.length; x++) {
                        table.push(
                            [res[x].Id, res[x].ProductName, res[x].DepartmentName, res[x].Price, res[x].StockQuantity]
                        );
                    }
                    console.log(table.toString());
                    console.log(chalk.magenta("Press CTRL + C to Exit"))
                    createCart()
                })
        })
}

// customer facing questions
var questions = [
    {
        type: "input",
        name: "product",
        message: "What is the Product ID of the item you would like to purhcase?",
        validate: function (value) {
            var valid = !isNaN(parseInt(value));
            return valid || "Please enter a number";
        },
        filter: Number
    },
    {
        type: "number",
        name: "quantity",
        message: "How many do you need",
        validate: function (value) {
            var valid = !isNaN(parseInt(value));
            return valid || "Please enter a number";
        },
        filter: Number
    }
];

// product pick and how many
function createCart() {
    inquirer.prompt(questions).then(function (order) {
        var product = order.product;
        var quantity = order.quantity;
        connection.query("SELECT * FROM products WHERE ?", {Id: product}, function(err, selectedItem){
            if (selectedItem[0].StockQuantity - quantity >= 0) {
                var total = selectedItem[0].Price * quantity
                console.log(chalk.green.bold("\nCongratulations! Your order has successfully been placed."));
                console.log(chalk.red.bold(quantity + " " + chalk.yellow.bold(selectedItem[0].ProductName + ".\n")))
                console.log(chalk.green.bold("\nYour order total: $") + total + ".");

                // update inventory levels
                connection.query("UPDATE products SET ? WHERE ?", [{StockQuantity: selectedItem[0].StockQuantity - quantity}, {Id: product}],
                function(err, inventory){
                    if (err) throw err;
                    start();
                });
            }
            else {
                console.log(chalk.red.inverse("We do not currently have the available inventory to fulfill your order at this time.\n"));
                console.log(chalk.red.inverse("Current availability: " + selectedItem[0].StockQuantity));
                start();
            }
        })
        
    })
}
