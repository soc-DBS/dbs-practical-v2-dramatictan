const { query } = require('../database');
const { EMPTY_RESULT_ERROR, SQL_ERROR_CODE, UNIQUE_VIOLATION_ERROR } = require('../errors');

// SECTION A: Create Stored Procedure
/**
SQL: Create Module stored procedure
CREATE OR REPLACE PROCEDURE create_module(IN p_code VARCHAR(10), IN p_name VARCHAR(100), IN p_credit INT)
AS $$
BEGIN
    -- Check if the module already exists
    IF EXISTS (SELECT * FROM module WHERE mod_code = p_code) THEN
        RAISE EXCEPTION 'Module % already exists', p_code;
    END IF;
    
    -- Insert the new module
    INSERT INTO module (mod_code, mod_name, credit_unit) VALUES (p_code, p_name, p_credit);
END;
$$ LANGUAGE plpgsql;
*/

// Old code:
// module.exports.create = function create(code, name, credit) {
//     return query('CALL create_module($1, $2, $3)', [code, name, credit])
//         .then(function (result) {
//         console.log('Module created successfully');
//         })
//         .catch(function (error) {
//         throw error;
//     });
// };

// New code:
module.exports.create = function create(code, name, credit) {
    const sql = 'CALL create_module($1, $2, $3)';
    return query(sql, [code, name, credit])
        .then(function (result) {
            console.log('Module created successfully');
        })
        .catch(function (error) {
            if (error.code === SQL_ERROR_CODE.UNIQUE_VIOLATION) {
                throw new UNIQUE_VIOLATION_ERROR(`Module ${code} already exists! Cannot create duplicate.`);
            }
            throw error;
        });
}
 
module.exports.retrieveByCode = function retrieveByCode(code) {
    const sql = `SELECT * FROM module WHERE mod_code = $1`;
    return query(sql, [code]).then(function (result) {
        const rows = result.rows;

        if (rows.length === 0) {
            // Note: result.rowCount returns the number of rows processed instead of returned
            // Read more: https://node-postgres.com/apis/result#resultrowcount-int--null
            throw new EMPTY_RESULT_ERROR(`Module ${code} not found!`);
        }

        return rows[0];
    });
};

// SQL: Delete Stored Module Procedure
// CREATE OR REPLACE PROCEDURE delete_module(IN p_code VARCHAR(10))
// AS
// $$
// BEGIN
//     -- Check if the module does not exist
//     IF NOT EXISTS (SELECT 1 FROM module WHERE mod_code = p_code) THEN
//         RAISE EXCEPTION 'Module % does not exist', p_code;
//     END IF;

//     -- Delete the module
//     DELETE FROM module WHERE mod_code = p_code;
// END;
// $$ LANGUAGE plpgsql;

// Old code:
// module.exports.deleteByCode = function deleteByCode(code) {
//     // Note:
//     // If using raw sql: Can use result.rowCount to check the number of rows affected
//     // But if using function/stored procedure, result.rowCount will always return null
//     const sql = `DELETE FROM module WHERE mod_code = $1`;
//     return query(sql, [code]).then(function (result) {
//         const rows = result.rowCount;

//         if (rows === 0) {
//             // Note: result.rowCount returns the number of rows processed instead of returned
//             // Read more: https://node-postgres.com/apis/result#resultrowcount-int--null
//             throw new EMPTY_RESULT_ERROR(`Module ${code} not found!`);
//         }
//     })
// };

// New code:
module.exports.deleteByCode = function deleteByCode(code) {
    return query(`CALL delete_module($1)`, [code])
        .then(function () {
            console.log(`Module ${code} deleted successfully`);
        })
        .catch(function (error) {
            throw error; // You can customize this error message if needed
        });
};


/**
SQL: Update Module stored procedure
CREATE OR REPLACE PROCEDURE update_module(IN p_code VARCHAR(10), IN p_credit INT)
AS
$$
BEGIN
    -- Check if the module does not exist
    IF NOT EXISTS (SELECT * FROM module WHERE mod_code = p_code) THEN
        RAISE EXCEPTION 'Module % does not exist', p_code;
    END IF;
    
    -- Update the module
    UPDATE module SET credit_unit=p_credit WHERE mod_code=p_code;
END;
$$ LANGUAGE plpgsql;
 */

// Old code: 
// module.exports.updateByCode = function updateByCode(code, credit) {
//     // Note:
//     // If using raw sql: Can use result.rowCount to check the number of rows affected
//     // But if using function/stored procedure, result.rowCount will always return null
//     const sql = `UPDATE module SET credit_unit = $1 WHERE mod_code = $2`;
//     return query(sql, [credit, code]).then(function (result) {
//         const rows = result.rowCount;

//         if (rows === 0) {
//             // Note: result.rowCount returns the number of rows processed instead of returned
//             // Read more: https://node-postgres.com/apis/result#resultrowcount-int--null
//             throw new EMPTY_RESULT_ERROR(`Module ${code} not found!`);
//         }
//     })
// };

// New code:
module.exports.updateByCode = function updateByCode(code, credit) {
    return query(`CALL update_module($1, $2)`, [code, credit])
        .then(function (result) {
            console.log("Module updated successfully");
        })
        .catch(function (error) {
            throw error;
        });
}

module.exports.retrieveAll = function retrieveAll() {
    const sql = `SELECT * FROM module`;
    return query(sql).then(function (result) {
        return result.rows;
    });
};

module.exports.retrieveBulk = function retrieveBulk(codes) {
    const sql = 'SELECT * FROM module WHERE code IN ($1)';
    return query(sql, [codes]).then(function (response) {
        const rows = response.rows;
        const result = {};
        for (let i = 0; i < rows.length; i += 1) {
            const row = rows[i];
            const code = row.code;
            result[code] = row;
        }
        return result;
    });
};
