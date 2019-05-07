CREATE DATABASE bamazon;
use bamazon;
CREATE TABLE IF NOT EXISTS products (
	Id INT NOT NULL AUTO_INCREMENT,
    ProductName varchar(255),
    DepartmentName varchar(255),
    Price float,
    StockQuantity int,
    Category varchar(255),
    ItemDesc varchar(255),
    PRIMARY KEY (Id)
)

