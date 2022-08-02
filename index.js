const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const { allowedNodeEnvironmentFlags } = require('process');


const promptUser = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role'],
        }
    ])
    .then((answer) => {
        if (answer.choice === 'View all departments'){
            viewDepartments();
        } else if (answer.choice === 'View all roles'){
            viewAllRoles();
        } else if (answer.choice === 'View all employees'){
            viewAllEmployees();
        } else if (answer.choice === 'Add a department'){
            addDepartment();
        } else if (answer.choice === 'Add a role'){
            addRole();
        } else if (answer.choice === 'Add an employee'){
            addEmployee();
        } else {
            updateRole();
        }
    })
};


// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'company_db'
  });

// Query to view data from view_all_roles table
function viewDepartments() {
    let sql = "SELECT * FROM department";
    connection.query(sql,(err,result)=>{
        if(err) throw err
        console.table('\n', result, '\n');
        promptUser();
    });
};

// Query to view data from view_all_roles table
function viewAllRoles() {
    let sql = "SELECT * FROM view_all_roles";
    connection.query(sql,(err,result)=>{
        if(err) throw err
        console.table('\n', result, '\n');
        promptUser();
    });
};

// Query to view data from view_all_employees table
function viewAllEmployees() {
    let sql = "SELECT * FROM view_all_employees";
    connection.query(sql,(err,result)=>{
        if(err) throw err
        console.table('\n', result, '\n');
        promptUser();
    });
};

// Add a department
function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the name of the department?",
            name: 'departmentName',
        },
    ])
    .then((answer) => {
        connection.query(`INSERT INTO department (department_name) VALUES (?);`, answer.departmentName, (err) => 
        {
            if(err) {
                console.log(err);
            }
            console.log('\n', 'Added ' + answer.departmentName + ' to the database.', '\n');
            promptUser();
        });
    })
};

// Add a role
function addRole() {
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the name of the role?",
            name: 'roleName',
        },
        {
            type: 'input',
            message: "What is the salary of the role?",
            name: 'salary',
        },
        // How do I dynmaically populate the choices based on what's in the department table?
        {
            type: "list",
            message: "Which department does the role belong to?",
            name: "choice",
            choices: ['Engineering', 'Finance', 'Legal', 'Sales'],
        }
    ])
    .then((answer) => {
        console.log(answer);
        // How do I insert more than one param into the values?
        connection.query(`INSERT INTO roles VALUES (?, ?, ?);`, answer.roleName, answer.salary, answer.choice, (err) => 
        {
            if (err) {
                console.log(err);
            }
            console.log('\n', 'Added ' + answer.roleName + ' to the database.', '\n');
            promptUser();
        });
    })
};

// Query to add an employee
function addEmployee() {
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: 'firstName',
        },
        {
            type: 'input',
            message: "What is the employee's last name?",
            name: 'lastName',
        },
        // How do I dynmaically populate the choices based on what's in the roles table?
        {
            type: "list",
            message: "What is the employee's role?",
            name: "employeeRole",
            choices: ['insert roles'],
        },
        // How do I list only managers?
        {
            type: "list",
            message: "Who is the employee's manager?",
            name: "employeeManager",
            choices: ['insert manager names'],
        }
    ])
    .then((answer) => {
    console.log(answer);
        connection.query(`INSERT INTO employee VALUES (?, ?, ?, ?);`, answer.firstName, answer.lastName, answer.employeeRole, answer.employeeManager, (err) => 
        {
            if (err) {
                console.log(err);
            }
            console.log('\n', 'Added ' + answer.firstName, answer.lastName, ' to the database.', '\n');
            promptUser();
        });
    })
};

// Query to update a role
function updateRole() {
    inquirer.prompt([
        // How do I dynmaically populate the choices based on what's in the roles table?
        {
            type: "list",
            message: "Which employee's role do you want to update?",
            name: "employee",
            choices: ['insert employee names'],
        },
        {
            type: "list",
            message: "Which role do you want to assign the selected employee?",
            name: "updatedRole",
            choices: ['insert roles'],
        },
    ])
    .then((answer) => {
        console.log(answer);
        // How do I link to a column with datatype INT using the results? How do I get the ID of the role?
            connection.query(`INSERT INTO employee (roles_id) VALUES (?);`, answer.updatedRole, (err) => 
            {
                if (err) {
                    console.log(err);
                }
                console.log('\n', 'Role has been updated in the database.', '\n');
                promptUser();
            });
        })
};

// Initialize 
function init() {
    // Begins questioning user
    promptUser();
    };

init();