const inquirer = require("inquirer");
const mysql = require("mysql2");

const db =  mysql.createConnection(
    {
    host: "localhost",
    user: "root",
    password: "root",
    database: "employees_db",
    },
    console.log("Connected to db")
);

async function getInput(){
    console.log("Welcome!");
    return inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'choice',
            choices: [
                'View all departments',
                "View all roles", 
                "View all employees", 
                "Add a department", 
                "Add a role", 
                "Update an employee roll"
            ]
        }
    ])
}

async function init(){
    const data = await getInput().then((data => {
        let answer = data.choice;
        console.log("Prompting complete.");
        console.log("User selected " + answer);
        callDb(answer);
    }));
}

async function callDb(answer){
        //Sort answers, call functions that correspond
        if (answer === "View all departments"){
            viewAllDepts();
        }else if (answer === "View all roles"){
            viewAllRoles();
        }else if (answer === "View all employees"){
            viewAllEmployees();
        }else if (answer === "Add a department"){
            addDept();
        }else if (answer === "Add a role"){
            addRole();
        }else if (answer === "Update an employee roll"){
            updateEmployeeRoll();
        }
}



async function viewAllDepts(){
    const sql = `SELECT * FROM employees_db.departments`;
    db.query(sql, (err, data) => {
        console.table(data);
        init();
    });   
}
function viewAllRoles(){
    const sql = `SELECT * FROM employees_db.roles`;
    db.query(sql, (err, data) => {
        console.table(data);
        init();
    });
}
function viewAllEmployees(){
    const sql = `SELECT * FROM employees_db.employees`;
    db.query(sql, (err, data) => {
        console.table(data);
        init();
    });
}
function addDept(){

}
function addRole(){

}
function updateEmployeeRoll(){

}




init();







