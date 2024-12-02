import pkg from 'pg'; // Import the entire package
const { Client } = pkg; // Destructure the Client class from the package

// PostgreSQL connection string for Railway
const connectionString = 'postgresql://postgres:CLDWTWnfWmxerqyhNAPCOWFAfxEboWjH@roundhouse.proxy.rlwy.net:26221/railway';

// Create a new client instance
const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false, // Important to allow SSL connection
    },
});

// Connect to the database
client.connect()
    .then(() => {
        console.log('Connected to the PostgreSQL database');
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.stack);
    });

// Export the client for use in other files
export default client;
