import {MysqlError } from 'mysql';
import db from './DB.js'; 

// Type definitions for query results
interface User {
  userid: number;
  name: string;
  mobilenumber?: string;
  gender?: 'Male' | 'Female' | 'Other';
  role: 'admin' | 'regular';
}

interface Train {
  trainid: number;
  trainName: string;
  maxSeatsAvailable: number;
  startLocation: string;
  endLocation: string;
}

interface Ticket {
  ticketid: number;
  userid?: number;
  trainid?: number;
}

// Queries
const usersQuery: string = 'SELECT * FROM User';
const trainsQuery: string = 'SELECT * FROM Train';
const ticketsQuery: string = 'SELECT * FROM Ticket';

// Helper function to execute queries
const queryDatabase = <T>(query: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.query(query, (err: MysqlError | null, results: T[]) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Execute all queries
const fetchData = async (): Promise<void> => {
  try {
    // Fetch users
    const users: User[] = await queryDatabase<User>(usersQuery);
    console.log('Users:');
    console.table(users);

    // Fetch trains
    const trains: Train[] = await queryDatabase<Train>(trainsQuery);
    console.log('Trains:');
    console.table(trains);

    // Fetch tickets
    const tickets: Ticket[] = await queryDatabase<Ticket>(ticketsQuery);
    console.log('Tickets:');
    console.table(tickets);
    
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    db.end();
  }
};

// Run the fetchData function
fetchData();
