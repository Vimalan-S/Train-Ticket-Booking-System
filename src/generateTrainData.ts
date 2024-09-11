import db from './DB.js'; // Ensure the correct path to DB.js
import { MysqlError, OkPacket } from 'mysql';

// Define a type for Train data
interface TrainData {
  trainName: string;
  maxSeatsAvailable: number;
  startLocation: string;
  endLocation: string;
}

// Function to generate random train data with strict type return
function generateRandomTrainData(index: number): TrainData {
  const trainNames: string[] = ['Express', 'Superfast', 'Mail', 'Passenger', 'Intercity'];
  const locations: string[] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

  const trainName: string = `${trainNames[Math.floor(Math.random() * trainNames.length)]}-${index}`;
  const maxSeatsAvailable: number = Math.floor(Math.random() * (300 - 100 + 1)) + 100; // Random seats between 100-300
  const startLocation: string = locations[Math.floor(Math.random() * locations.length)];
  
  let endLocation: string = locations[Math.floor(Math.random() * locations.length)];
  
  // Ensure start and end locations are not the same
  while (startLocation === endLocation) {
    endLocation = locations[Math.floor(Math.random() * locations.length)];
  }

  return { trainName, maxSeatsAvailable, startLocation, endLocation };
}

// Function to generate and insert 250 rows into the Train table
function generateTrainData(): void {
  const trains: (string | number)[][] = [];
  
  for (let i = 1; i <= 250; i++) {
    const train: TrainData = generateRandomTrainData(i);
    trains.push([train.trainName, train.maxSeatsAvailable, train.startLocation, train.endLocation]);
  }

  const query: string = 'INSERT INTO Train (trainName, maxSeatsAvailable, startLocation, endLocation) VALUES ?';

  // Insert the train data into the Train table in bulk
  db.query(query, [trains], (err: MysqlError | null, results: OkPacket) => {
    if (err) {
      console.error('Error inserting train data:', err);
    } else {
      console.log('Train data inserted successfully:', results.affectedRows);
    }
    db.end(); // Close the DB connection
  });
}

// Run the data generation function
//generateTrainData();




