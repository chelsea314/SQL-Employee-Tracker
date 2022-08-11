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
  
function getDepartments(cb) {
    let sql = "SELECT * FROM department";
    connection.query(sql, (err,result) => {
        if(err) throw err
        cb(result);
    });
}

// Query to view data from view_all_roles table
function viewDepartments() {
    getDepartments((result) => {
        console.table('\n', result, '\n');
        promptUser();
    });
};

function getRoles(cb) {
    let sql = `
        SELECT
            r.id,
            r.title,
            d.department_name,
            r.salary
        FROM roles as r
        INNER JOIN department as d ON r.department_id = d.id
        ORDER BY r.id ASC;`;
    connection.query(sql, (err,result) => {
        if(err) throw err
        cb(result);
    });
}

// Query to view data from view_all_roles table
function viewAllRoles() {
    getRoles((result) => {
        console.table('\n', result, '\n');
        promptUser();
    });
};

function getEmployees(cb) {
    let sql = `
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            e.roles_id,
            r.title,
            r.salary,
            r.department_id
        
        FROM employee AS e
        LEFT JOIN roles as r ON e.roles_id = r.id
        ;`;
    connection.query(sql,(err,result)=>{
        if(err) throw err
        cb(result);
    });
}   

// Query to view data from view_all_employees table
function viewAllEmployees() {
    getEmployees((result) => {
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

    getDepartments((departments) => {
        const deptMap = {};

        departments.forEach((dept) => {
            deptMap[dept.department_name] = dept.id;
        });
    
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
            {
                type: "list",
                message: "Which department does the role belong to?",
                name: "departmentName",
                choices: Object.keys(deptMap),
            }
        ])
        .then((answer) => {
            const deptId = deptMap[answer.departmentName];
            console.log('\n', 'answer', answer, 'deptid', deptId);
            connection.query(`INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?);`, [
                answer.roleName, answer.salary, deptId
            ], (err) => 
            {
                if (err) {
                    console.log(err);
                }
                console.log('\n', 'Added ' + answer.roleName + 'to the database.', '\n');
                promptUser();
            });
        })
    });
};

// Query to add an employee
function addEmployee() {

    getRoles((roles) => {
        const roleMap = {};

        roles.forEach((roles) => {
            roleMap[roles.title] = roles.id;
        });
    
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
            {
                type: "list",
                message: "What is the employee's role?",
                name: "employeeRole",
                choices: Object.keys(roleMap),
            },
            // How do I list only managers?
            // {
            //     type: "list",
            //     message: "Who is the employee's manager?",
            //     name: "employeeManager",
            //     choices: ['insert manager names'],
            // }
        ])
        .then((answer) => {
            const roleId = roleMap[answer.employeeRole];
            console.log('\n', 'answer', answer, 'roleid', roleId);
            connection.query(`INSERT INTO employee (first_name, last_name, roles_id) VALUES (?, ?, ?);`, [
                answer.firstName, answer.lastName, roleId
            ], (err) => 
            {
                if (err) {
                    console.log(err);
                }
                console.log('\n', 'Added ' + answer.firstName, answer.lastName, 'to the database.', '\n');
                promptUser();
            });
        })
    });
}

// Query to update a role
function updateRole() {
    getEmployees((employees) => {
        const employeeFirstMap = {};

        employees.forEach((employees) => {
            employeeFirstMap[employees.first_name] = employees.id;
        });

    getEmployees((employees) => {
        const employeeLastMap = {};
            employees.forEach((employees) => {
                employeeLastMap[employees.last_name] = employees.id;
            });

    getRoles((roles) => {
        const roleMap = {};
    
        roles.forEach((roles) => {
            roleMap[roles.title] = roles.id;
        });

        inquirer.prompt([
            {
                type: "list",
                message: "What is the first name of the employee you want to update?",
                name: "employee_first",
                choices: Object.keys(employeeFirstMap),
            },
            {
                type: "list",
                message: "What is the last name of the employee you want to update?",
                name: "employee_last",
                choices: Object.keys(employeeLastMap),
            },
            {
                type: "list",
                message: "Which role do you want to assign the selected employee?",
                name: "updatedRole",
                choices: Object.keys(roleMap),
            },
        ])
        .then((answer) => {
            console.log(answer);
            const updatedRoleId = roleMap[answer.updatedRole];
            console.log('\n', 'answer', answer, 'updatedRoleId', updatedRoleId);

                connection.query(`UPDATE employee SET Col_{$roles_id} = (updatedRoleID) WHERE last_name = (answer.employee_last)`, (err) => 
                {
                    if (err) {
                        console.log(err);
                    }
                    console.log('\n', 'Role has been updated in the database.', '\n');
                    promptUser();
                });
            })
        });
    });
});
};

// Initialize 
function init() {
    // Begins questioning user
    promptUser();
    };

init();