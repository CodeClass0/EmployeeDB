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
        }else if (answer === "Update an employee roll"){
            updateEmployeeRole();
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
            type: 'input',
            message: "Enter the Department for this Role: ",
            name: "role_department"
        }
    ]).then(function (userResponse){
        
        buildNewRole(userResponse);

    });
}

async function addEmployee(){
    let employeeArray = [];
    const employeeSearch = `SELECT * FROM employees_db.employees`;
    db.query(employeeSearch, (err, data) => {
        for (let i = 0; i<data.length; i++){
            employeeArray.push(data[i].first_name + " " + data[i].last_name);
        }
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

    // console.log(userResponse.employee_firstName);
    // console.log(userResponse.employee_lastName);
    // console.log(userResponse.employee_role);
    // console.log(userResponse.employee_manager);

    //Here we get the ID associated with the employee's manager
    let manId = await asyncCallId(`SELECT id FROM employees_db.employees WHERE CONCAT (first_name, " ", last_name) LIKE "${userResponse.employee_manager}"`);
    // console.log("man ID = " + manId);

    //Here we get the ID associated with the employee's role
    let roleId = await asyncCallId(`SELECT id FROM employees_db.roles WHERE title =  "${userResponse.employee_role}"`);
    // console.log("role ID = " + roleId);


    //Here we put it together to insert the employee into the db.
    await asyncCallAdd(`INSERT INTO employees_db.employees(first_name, last_name, role_id, manager_id)
    VALUES  ("${userResponse.employee_firstName}", "${userResponse.employee_lastName}", 
    ${roleId}, ${manId})`);
    console.log("Employee Added");
    viewAllEmployees();
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
    });

    //Build array of roles
    let roleArray = [];
    const roleSearch = `SELECT * FROM employees_db.employees`;
    db.query(roleSearch, (err, data) => {
        for (let i = 0; i<data.length; i++){
            roleArray.push(data[i].title);
        }
    });

    
    //Prompt User    
    let userResponse = await inquirer.prompt([
        {
            type: 'list',
            message: "Select the Employee to update role: ",
            name: "employee",
            choices: employeeArray
        },
        {
            type: 'list',
            message: "Select the new Role: ",
            name: "role",
            choices: roleArray
        }
    ]);
    
    //Here we get the ID associated with the employee's role
    let roleId = await asyncCallId(`SELECT id FROM employees_db.roles WHERE title =  "${userResponse.role}"`);
    console.log(roleId);

    //Here we update that employee in the db with the new role Id.
    await asyncCallAdd(`UPDATE employees_db.employees
    SET role_id = ${roleId}
    WHERE CONCAT (first_name, " ", last_name) LIKE "${userResponse.employee}" LIMIT 1;`);
    console.log("Employee Role Updated");
    viewAllEmployees();
}


 function buildNewRole(answer){
    let rollId;
    const sql = `SELECT department_name, id FROM employees_db.departments`;
    db.query(sql, (err, data) => {
        console.log(answer);
        //Check if the deparment already exists. If so, assign the matching existing deparment to the new role.
        for (let i = 0; i < data.length; i++){
            if (data[i].department_name.toLowerCase() === answer.role_department.toLowerCase()){
                console.log(data[i]);
                console.log("THERE IS AN EXISTING DEPT");
                rollId = data[i].id;

                //If the new role has an existing department, continue with adding the role to the db while assigning
                //the relevant department_id to the new role entry
                const roleSql = 
                `INSERT INTO employees_db.roles(title, salary, department_id)
                VALUES  ("${answer.role_name}", ${answer.role_salary}, ${rollId})`;

                db.query(roleSql, (err, data) => {
                    console.log("New role added with old dept");
                    viewAllRoles();
                });
                return;
            };
        };
    });

    //If there's no match, then the new department that the user added will be entered into the db along with the new role.
    //Add a new department
    const deptSql = `INSERT INTO employees_db.departments(department_name)
    VALUES  ("${answer.role_department}")`;
    db.query(deptSql, (err, data) => {
        console.log("New department added");
    });

    //There's a new department, now we get the id by repeating the first for loop
    const getDeptId = `SELECT id FROM employees_db.departments WHERE department_name =  "${answer.role_department}"`;
    db.query(getDeptId, (err, data) => {
        rollId = data[0].id;
        const roleSql = `INSERT INTO employees_db.roles(title, salary, department_id) 
        VALUES  ("${answer.role_name}", ${answer.role_salary}, ${rollId})`;

        db.query(roleSql, (err, data) => {
            console.log(`New Role is ${answer.role_name}`);
            console.log(`New Salary is ${answer.role_salary}`);
            console.log(`New Department ID is ${rollId}`);
            console.log("New role added with new dept");

        viewAllRoles();
        });
    });
}


init();







