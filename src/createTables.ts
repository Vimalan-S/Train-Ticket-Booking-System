import { MysqlError } from 'mysql';

// Import the database connection
import db from './DB.js'; // Ensure DB.ts is correctly configured and exported

// SQL queries to create tables
const createUsersTable: string = `
  CREATE TABLE IF NOT EXISTS User (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobilenumber VARCHAR(20),
    gender ENUM('Male', 'Female', 'Other'),
    role ENUM('admin', 'regular') NOT NULL
  )
`;

const createTrainsTable: string = `
  CREATE TABLE IF NOT EXISTS Train (
    trainid INT AUTO_INCREMENT PRIMARY KEY,
    trainName VARCHAR(255) NOT NULL,
    maxSeatsAvailable INT NOT NULL,
    startLocation VARCHAR(255) NOT NULL,
    endLocation VARCHAR(255) NOT NULL
  )
`;

const createTicketsTable: string = `
  CREATE TABLE IF NOT EXISTS Ticket (
    ticketid INT AUTO_INCREMENT PRIMARY KEY,
    userid INT,
    trainid INT,
    FOREIGN KEY (userid) REFERENCES User(userid),
    FOREIGN KEY (trainid) REFERENCES Train(trainid)
  )
`;

const queryAsync = async (query: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.query(query, (err: MysqlError | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

async function createTables() {
  try {
    await queryAsync(createUsersTable);
    console.log('User table created or already exists.');
    
    await queryAsync(createTrainsTable);
    console.log('Train table created or already exists.');
    
    await queryAsync(createTicketsTable);
    console.log('Ticket table created or already exists.');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    db.end(); // Close the database connection
  }
}

// Call the async function to execute the code
createTables();