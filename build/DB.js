import mysql from 'mysql';
// Create a connection to the database
const db = mysql.createConnection({
    host: 'bul4tcaoaqs3qcxepc1g-mysql.services.clever-cloud.com',
    user: 'u1beyq0e4gtgapvf',
    password: 'LJ8Hvi6pAuxQLCHqZs6o',
    database: 'bul4tcaoaqs3qcxepc1g'
});
// Define the SQL query for creating the table
const sql = `
    CREATE TABLE IF NOT EXISTS UserCredentials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'regular') NOT NULL
    );
`;
// Connect to the database and execute the SQL query
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Connected to the database.');
    // Create the table if it does not exist
    db.query(sql, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            process.exit(1);
        }
        console.log('Table created or already exists.');
    });
});
// Export the database connection
export default db;
