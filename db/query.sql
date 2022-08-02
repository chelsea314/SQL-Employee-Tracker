CREATE TABLE view_all_roles
AS SELECT
    r.id,
    r.title,
    d.department_name,
    r.salary

FROM roles as r
INNER JOIN department as d ON r.department_id = d.id
ORDER BY r.id ASC;

CREATE TABLE view_all_employees
AS SELECT
    e.id,
    e.first_name,
    e.last_name,
    r.title,
    r.department_name,
    r.salary
   
FROM employee AS e
    LEFT JOIN view_all_roles as r 
        ON e.roles_id = r.id;