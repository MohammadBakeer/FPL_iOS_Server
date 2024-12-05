import db from '../db.js'; 
import axios from 'axios';

export const fetchTable = async (req, res) => {
    try {
        // Fetch data from the Fantasy Premier League API
        const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
        const data = response.data;

        // Extract teams, elements, and element types
        const teams = data.teams;
        const elements = data.elements;
        const elementTypes = data.element_types;

        // Map team IDs to team names
        const teamMap = teams.reduce((acc, team) => {
            acc[team.id] = team.name;
            return acc;
        }, {});

        // Map position IDs to position names
        const positionMap = elementTypes.reduce((acc, type) => {
            acc[type.id] = type.singular_name;
            return acc;
        }, {});

        // Create the initial player details array
        const playerDetails = elements.map(player => ({
            lastName: player.second_name,
            team: teamMap[player.team], // Map team ID to team name
            position: positionMap[player.element_type], // Map position ID to position name
        }));

        // Query the database to get players and their prices
        const dbQuery = 'SELECT last_name, price FROM players';
        const dbResult = await db.query(dbQuery);
        const dbPlayers = dbResult.rows; // Assuming `rows` contains the query results

        // Create a map of last names to prices for quick lookup
        const priceMap = dbPlayers.reduce((acc, player) => {
            acc[player.last_name] = player.price;
            return acc;
        }, {});

        // Add the price to playerDetails if lastName matches
        const tablePlayerDetails = playerDetails.map(player => ({
            ...player,
            price: priceMap[player.lastName] || null, // Add price if available, otherwise null
        }));

        console.log(tablePlayerDetails);
        // Send the enriched player details as the response
        res.json({ players: tablePlayerDetails });
    } catch (error) {
        console.error('Error fetching data from the Fantasy Premier League API:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
