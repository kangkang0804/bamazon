const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
var Table = require('cli-table');


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Thanos23",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(chalk.green.bold("---Manager View---"))
    start();
});


var start = function () {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: chalk.bold("Let's get started. Select an option below."),
            choices: ["Visit Assortment", "View Low Inventory", "Add to Inventory", "Add to Assortment", "Exit"]
        }).then(function (answers) {
            switch (answers.action) {
                case "Visit Assortment":
                    viewProduct();
                    break;

                case "View Low Inventory":
                    atRiskLevels();
                    break;


                case "Add to Inventory":
                    addInventory();
                    break;

                case "Add to Assortment":
                    addProduct();
                    break;

                case "Exit":
                    connection.end();
                    break;
            }
        })
};


// Read all products for sale
function viewProduct() {
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
        start();
    })
};
// Read all products with stock levels below 5
function atRiskLevels() {
    connection.query("SELECT * FROM products WHERE StockQuantity < 5", function (err, res) {
        if (err) throw err;

        var table = new Table(
            {
                head: [chalk.bold("Product ID"), chalk.bold("Product Name"), chalk.bold("Department"), chalk.bold("Price"), chalk.bold("Quanity")],
                colWidths: [12, 75, 20, 12, 12]
            }
        );

        for (var x = 0; x < res.length; x++) {
            table.push(
                [res[x].Id, res[x].ProductName, res[x].DepartmentName, res[x].Price, res[x].StockQuantity]
            );
        }
        console.log(table.toString());
        start();
    })
};
// update inventory levels
function addInventory() {
    inquirer
        .prompt([
            {
                type: "number",
                name: "product",
                message: "What is the Product ID of the item you would like to update?",
                validate: function (value) {
                    var valid = !isNaN(parseInt(value));
                    return valid || "Please enter a number";
                },
                filter: Number
            },
            {
                type: "number",
                name: "quantity",
                message: "Number of units you want to add.",
                validate: function (value) {
                    var valid = !isNaN(parseInt(value));
                    return valid || "Please enter a number";
                },
                filter: Number
            }
        ]).then(function (answers) {
            var product = answers.product;
            var quantity = answers.quantity;
            connection.query("SELECT * FROM products WHERE ?", { Id: product }, function (err, selectedItem) {
                if (err) throw err;
                console.log(chalk.green.bold("\ninventory successfully updated"));
                console.log(selectedItem)

                // update inventory levels
                connection.query("UPDATE products SET ? WHERE ?", [{ StockQuantity: selectedItem[0].StockQuantity + quantity }, { Id: product }],
                    function (err, update) {
                        if (err) throw err;
                        console.log(update.affectedRows + " items updated");
                        start();
                    });
            })
        })
};
// new product questions
var newProductQuestions = [
    {
        type: "input",
        name: "ProductName",
        message: "Product being added:"
    },
    {
        name: "Department",
        type: "list",
        message: "Department: ",
        choices: ["Home Theater", "Mobile"]
    },
    {
        type: "number",
        name: "Price",
        message: "Price: ",
        validate: function (value) {
            var valid = !isNaN(parseFloat(value));
            return valid || "Please enter a number";
        },
        filter: Number
    },
    {
        type: "input",
        name: "StockQuantity",
        message: "Quantity: ",
        validate: function (value) {
            var valid = !isNaN(parseInt(value));
            return valid || "Please enter a number";
        },
        filter: Number
    },
    {
        name: "Category",
        type: "input",
        message: "Category: ",
    },
    {
        type: "input",
        name: "ItemDesc",
        message: "Item Description: "
    }
]
// add brand new product to assortment
function addProduct() {
    inquirer
        .prompt(newProductQuestions).then(function (newItem) {
            let productName = newItem.ProductName;
            let department  = newItem.Department;
            let price = newItem.Price;
            let stockQuantity = newItem.StockQuantity;
            let category = newItem.Category;
            let description = newItem.ItemDesc;
            connection.query("INSERT INTO products SET ?",{
                ProductName: productName,
                DepartmentName: department,
                Price: price,
                StockQuantity: stockQuantity,
                Category: category,
                ItemDesc: description
            }, function(err, res){
                console.log(res.affectedRows + " product inserted!")
                start();
            })
        })
};