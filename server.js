const inquirer = require("inquirer");
const mysql = require("mysql2");


const db = mysql.createConnection(
    {
    host: "localhost",
    user: "root",
    password: "root",
    database: "employees_db",
    },
    console.log("Connected to db")
);

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
                "Add an employee",
                "Update an employee role"
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
        }else if (answer === "Add an employee"){
            addEmployee();
        }else if (answer === "Update an employee role"){
            updateEmployeeRole();
        };
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
    inquirer.prompt([
        {
            type: 'input',
            message: "Enter the Department Name: ",
            name: "department_name"
        }
    ]).then(function (answer){
        console.log(answer);
        const sql = `INSERT INTO employees_db.departments(department_name)
        VALUES ("${answer.department_name}")`;
        db.query(sql, (err, data) => {
            viewAllDepts();
        });
    });
}
function addRole(){
    let departmentNameArray = [];
    const sql = `SELECT * FROM employees_db.departments`;
    db.query(sql, (err, data) => {
        for (let i = 0; i<data.length; i++){
            departmentNameArray.push(data[i].department_name);
        }
    });

inquirer.prompt([
        {
            type: 'input',
            message: "Enter the Role Name: ",
            name: "role_name"
        },
        {
            type: 'input',
            message: "Enter the Salary for this Role: ",
            name: "role_salary"
        },
        {
            type: 'list',
            message: "Select a department for this role: ",
            name: "role_department",
            choices: departmentNameArray
        }
    ]).then(function (userResponse){
        const str = `INSERT INTO employees_db.roles (title, salary, department_id)
        VALUES("${userResponse.role_name}", ${userResponse.role_salary}, (SELECT id FROM employees_db.departments WHERE department_name LIKE "${userResponse.role_department}"));`;
        db.query(str, (err, data) => {
            console.log("New Role Added");
            viewAllRoles();
        });

    });
}
async function addEmployee(){
    let employeeArray = [];
    const employeeSearch = `SELECT * FROM employees_db.employees`;
    db.query(employeeSearch, (err, data) => {
        for (let i = 0; i<data.length; i++){
            employeeArray.push(data[i].first_name + " " + data[i].last_name);
        }
        employeeArray.push("No Manager");
    });

    let roleArray = [];
    const roleSearch = `SELECT * FROM employees_db.roles`;
    db.query(roleSearch, (err, data) => {
        for (let i = 0; i<data.length; i++){
            roleArray.push(data[i].title);
        }
    });

    let userResponse = await inquirer.prompt([
        {
            type: 'input',
            message: "Enter the Employee's First Name: ",
            name: "employee_firstName"
        },
        {
            type: 'input',
            message: "Enter the Employee's Last Name: ",
            name: "employee_lastName"
        },
        {
            type: 'list',
            message: "Select the Employee's Role: ",
            name: "employee_role",
            choices: roleArray
        },
        {
            type: 'list',
            message: "Select the Employee's Manager: ",
            name: "employee_manager",
            choices: employeeArray
        },
    ]);

    if (userResponse.employee_manager === "No Manager"){
        const str = `INSERT INTO employees_db.employees (first_name, last_name, role_id)
        VALUES ("${userResponse.employee_firstName}", "${userResponse.employee_lastName}", 
        (SELECT id FROM employees_db.roles WHERE title LIKE "${userResponse.employee_role}"))`;
        db.query(str, (err, data) => {
            console.log("New employee added");
            viewAllEmployees();
        });
    } else{
        const str = `INSERT INTO employees_db.employees (first_name, last_name, role_id, manager_id)
        VALUES ("${userResponse.employee_firstName}", "${userResponse.employee_lastName}", 
        (SELECT id FROM employees_db.roles WHERE title LIKE "${userResponse.employee_role}"), 
        (SELECT id FROM (SELECT * FROM employees_db.employees WHERE CONCAT (first_name, " ", last_name) LIKE "${userResponse.employee_manager}") AS toPost));`;
        db.query(str, (err, data) => {
            console.log("New employee added");
            viewAllEmployees();
        });
    }
}




//===============================
//This block ensures that we wait for the query to finish before returning an id
function resolveId (str){
    return new Promise((resolve) => {
        db.query(str,  (err, data) => {
            resolve(data[0].id);
        });
    });
}
async function asyncCallId(str){
    console.log("Calling");
    const result = await resolveId(str);
    console.log("logging result " + result);
    return result;
}
//===============================




//This block ensures that the query finishes before continuing in the calling function
//===============================
function resolveAdd(str){
    return new Promise((resolve) => {
        db.query(str,  (err, data) => {
            resolve(console.log(str));
        });
    });
}

async function asyncCallAdd(str){
    console.log("Calling");
    const result = await resolveAdd(str);
    console.log("logging result " + result);
    return result;
}
//===============================






async function updateEmployeeRole(){
    //Build array of employees
    let employeeArray = [];
    const employeeSearch = `SELECT * FROM employees_db.employees`;
    db.query(employeeSearch, (err, data) => {
        for (let i = 0; i<data.length; i++){
            employeeArray.push(data[i].first_name + " " + data[i].last_name);
        }
        console.log("Employee Array Built")
    });

    //Build array of roles
    let roleArray = [];
    const roleSearch = `SELECT * FROM employees_db.employees`;
    db.query(roleSearch, (err, data) => {
        for (let i = 0; i<data.length; i++){
            roleArray.push(data[i].title);
        }
        console.log("Role Array Built");
    });



    // let received = await updateInput(roleArray, employeeArray);

    //Prompt User    
    // let userResponse = await inquirer.prompt([
    //     {
    //         type: 'list',
    //         message: "Select the Employee to update role: ",
    //         name: "employee",
    //         choices: employeeArray
    //     },
    //     {
    //         type: 'list',
    //         message: "Select the new Role: ",
    //         name: "role",
    //         choices: roleArray
    //     }
    // ]);
    
    //Here we get the ID associated with the employee's role
    let roleId = await asyncCallId(`SELECT id FROM employees_db.roles WHERE title =  "${received.role}"`);
    console.log(roleId);

    //Here we update that employee in the db with the new role Id.
    await asyncCallAdd(`UPDATE employees_db.employees
    SET role_id = ${roleId}
    WHERE CONCAT (first_name, " ", last_name) LIKE "${received.employee}" LIMIT 1;`);
    console.log("Employee Role Updated");
    viewAllEmployees();
}


async function updateInput(roles, employees){
    return inquirer.prompt([
        {
            type: 'list',
            message: "Select the Employee to update role: ",
            name: "employee",
            choices: employees
        },
        {
            type: 'list',
            message: "Select the new Role: ",
            name: "role",
            choices: roles
        }
    ]);
}

init();







