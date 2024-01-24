const inquirer = require("inquirer");
const express = require("express");
const app = express();
const api = require("./routes/api");
const mysql = require("mysql2");

let port = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use('/api', api);
app.use(express.static("public"));



async function getInput(){
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
    }));
}




function viewAllDepts(){

}
function viewAllRoles(){

}
function viewAllEmployees(){

}
function addDept(){

}
function addRole(){

}
function updateEmployeeRoll(){

}




init();







app.listen(port, () => {
    console.log(`App listening on PORT ${port}`);
})

module.exports=app;