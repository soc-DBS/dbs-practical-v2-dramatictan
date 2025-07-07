const { query } = require('../database');

// SECTION B: Create a User Defined Database Function
/** 
SQL:
CREATE OR REPLACE FUNCTION get_modules_performance()
RETURNS TABLE (
	mod_registered VARCHAR(10),
	grade CHAR(2),
	grade_count BIGINT
) AS
$$
BEGIN
	RETURN QUERY
	SELECT
		s.mod_registered,
		s.grade,
		COUNT(s.mark) AS grade_count
	FROM
		stud_mod_performance s
	GROUP BY s.mod_registered, s.grade
	ORDER BY s.mod_registered, s.grade;
END;
$$
LANGUAGE plpgsql;
 */

module.exports.generateModulesPerformance = function generateModulesPerformance() {
    const sql = 'SELECT * FROM get_modules_performance()';
    return query(sql)
        .then(function (result) {
            const rows = result.rows;
            return rows;
        })
        .catch(function (error) {
            throw error;
        });
};

module.exports.calculateStudentsGPA = function calculateStudentsGPA() {
    const sql = 'CALL calculate_students_gpa()';
    return query(sql)
        .then(function (result) {
            console.log('Calculating students GPA');
        })
        .catch(function (error) {
            throw error;
        });
};

module.exports.generateAttendance = function generateAttendance() {
    // TODO: Fix this sql query to invoke the corresponding database function/procedure 
    const sql = '';
    return query(sql)
        .then(function (result) {
            const rows = result.rows;
            return rows;
        })
        .catch(function (error) {
            throw error;
        });
};
