const { query } = require('../database');
const { SQL_ERROR_CODE, UNIQUE_VIOLATION_ERROR, RAISE_EXCEPTION } = require('../errors');

// SECTION C: Combining function & stored procedure
/**
 * SQL: Alter the database to store gpa score for each student in the table
ALTER TABLE student
ADD COLUMN gpa NUMERIC(4, 2),
ADD COLUMN gpa_last_updated DATE;
 */

/** Add a database function to maps the grade  
CREATE OR REPLACE FUNCTION get_grade_point(grade_input CHAR(2))
RETURNS NUMERIC
AS $$
DECLARE
grade_point NUMERIC;
BEGIN
-- Base on output
grade_point := CASE
WHEN grade_input = 'AD' THEN 4.0
WHEN grade_input = 'A' THEN 4.0
WHEN grade_input = 'B+' THEN 3.5
WHEN grade_input = 'B' THEN 3.0
WHEN grade_input = 'C+' THEN 2.5
WHEN grade_input = 'C' THEN 2.0
WHEN grade_input = 'D+' THEN 1.5
WHEN grade_input = 'D' THEN 1.0
WHEN grade_input = 'F' THEN 0.0
ELSE NULL -- Assign NULL for invalid grades
END;
IF grade_point IS NULL THEN
RAISE EXCEPTION 'Invalid Grade: %', grade_input;
END IF;
RETURN grade_point;
END;
$$ LANGUAGE plpgsql;
*/

// Old code: 
// module.exports.retrieveAll = function retrieveAll() {
//     const sql = `SELECT adm_no, stud_name, gender, crse_code FROM student`;
//     return query(sql).then(function (result) {
//         return result.rows;
//     });
// };

// Add a stored procedure to calculate students GPA and update GPAs for all student
// -- Stored Procedure to calculate and update GPAs for all students
// CREATE OR REPLACE PROCEDURE calculate_students_gpa()
// AS $$
// DECLARE
//     -- Declare variables for procedure
//     v_adm_no CHAR(4);
//     v_mod_performance RECORD;
//     total_credit_units INT; -- total credit unit for each student in nested loop
//     total_weighted_grade_points NUMERIC; -- total grade points for each student in nested loop
//     computed_gpa NUMERIC; -- gpa for each student
// BEGIN
//     -- Loop through stud_mod_performance
//     FOR v_adm_no IN (
//         -- Retrieve the distinct admission numbers from stud_mod_performance (SELECT DISTINCT)
//         SELECT DISTINCT adm_no FROM stud_mod_performance
//     )
//     LOOP
//         -- Initialize total credit units and weighted grade points
//         total_credit_units := 0;
//         total_weighted_grade_points := 0;

//         -- Nested loop that iterates over module performance records for a specific student to calculate gpa
//         FOR v_mod_performance IN
//             -- Retrieve the module performances for the specific student (SELECT)
//             -- Join the stud_mod_performance table with the module table to get the
//             -- credit unit and grade for each module (JOIN)
//             -- Use the v_adm_no variable to filter for a specific student (WHERE)
//             SELECT 
//                 smp.mod_registered, 
//                 smp.mark, 
//                 m.credit_unit, 
//                 smp.grade 
//             FROM stud_mod_performance smp
//             JOIN module m ON smp.mod_registered = m.mod_code
//             WHERE smp.adm_no = v_adm_no
//         LOOP
//             -- 1. Calculate the total credit units and weighted grade points for the
//             -- student based on the gpa formula.
//             -- 2. Use the get_grade_point function to map grade to grade points
//             total_credit_units := total_credit_units + v_mod_performance.credit_unit;
//             total_weighted_grade_points := total_weighted_grade_points + 
//                 (v_mod_performance.credit_unit * get_grade_point(v_mod_performance.grade));
//         END LOOP;

//         -- Calculate GPA if total credit units are greater than 0
//         IF total_credit_units > 0 THEN
//             computed_gpa := total_weighted_grade_points / total_credit_units;

//             -- Update the student table with the computed gpa
//             -- use today's date for gpa_last_updated
//             UPDATE student 
//             SET gpa = computed_gpa, 
//                 gpa_last_updated = CURRENT_DATE 
//             WHERE adm_no = v_adm_no;
//         END IF;
//     END LOOP;
// END;
// $$ LANGUAGE plpgsql;

// New Code: 
module.exports.retrieveAll = function retrieveAll() {
    const sql = `SELECT adm_no, stud_name, gender, crse_code, gpa, gpa_last_updated FROM student`;
    return query(sql).then(function (result) {
        return result.rows;
    });
};

module.exports.enrolNewStudent = function enrolNewStudent(adminNumber, studentName, gender, address, dob, nationality, courseCode) {
    const sql = 'CALL enrol_new_student($1, $2, $3, $4, $5, $6, $7)';
    return query(sql, [adminNumber, studentName, gender, address, dob, nationality, courseCode])
        .then(function (result) {
            console.log('Student enrolled');
        })
        .catch(function (error) {
            if (error.code === SQL_ERROR_CODE.UNIQUE_VIOLATION) {
                throw new UNIQUE_VIOLATION_ERROR(`Student with adm no ${adminNumber} already exists! Cannot create duplicate.`);
            } 
            if (error.code === SQL_ERROR_CODE.RAISE_EXCEPTION) {
                throw new RAISE_EXCEPTION(error.message);
            }
            throw error;
        });
};
