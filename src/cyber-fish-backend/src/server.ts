import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './db'; // Import the MongoDB connection function
import { Score } from './models/Score'; // Import the Score model

const app = express();

// Connect to MongoDB database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(bodyParser.json()); // Parse incoming JSON data in request bodies

// Routes

// GET /api/scores - Fetch all scores sorted in descending order
app.get('/api/scores', async (_req: Request, res: Response) => {
    try {
        // Fetch all scores from the database and sort them by score in descending order
        const scores = await Score.find().sort({ score: -1 });
        res.json(scores); // Send the scores as a JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch scores' }); // Handle errors
    }
});

// POST /api/scores - Save or update a player's score
app.post('/api/scores', async (req: Request, res: Response) => {
    try {
        const { name, score } = req.body;

        // Check if the player already has a score in the database
        const existingScore = await Score.findOne({ name });

        if (existingScore) {
            // If the player exists, update their score only if the new score is higher
            if (score > existingScore.score) {
                existingScore.score = score;
                existingScore.date = new Date();
                await existingScore.save(); // Save the updated score
            }
        } else {
            // If the player doesn't exist, create a new score entry
            const newScore = new Score({ name, score, date: new Date() });
            await newScore.save(); // Save the new score
        }

        res.status(201).json({ message: 'Score saved successfully' }); // Send success response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save score' }); // Handle errors
    }
});

// GET /api/scores/check-name - Check if a player name already exists
app.get('/api/scores/check-name', async (req: Request, res: Response) => {
    try {
        const { name } = req.query;
        const exists = await Score.exists({ name }); // Check if the name exists in the database
        res.json({ exists }); // Send the result as a JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check name' }); // Handle errors
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});