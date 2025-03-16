import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './db';
import { Score } from './models/Score';

const app = express();

// Connect to MongoDB database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/api/scores', async (req: Request, res: Response) => {
    try {
        const scores = await Score.find().sort({ score: -1 });
        res.json(scores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

app.post('/api/scores', async (req: Request, res: Response) => {
    try {
        const { name, score } = req.body;

        // Find the existing score for this player
        const existingScore = await Score.findOne({ name });

        if (existingScore) {
            // Only update if the new score is higher
            if (score > existingScore.score) {
                existingScore.score = score;
                existingScore.date = new Date();
                await existingScore.save();
            }
        } else {
            // Create a new score entry if player doesn't exist
            const newScore = new Score({ name, score, date: new Date() });
            await newScore.save();
        }

        res.status(201).json({ message: 'Score saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.get('/api/scores/check-name', async (req: Request, res: Response) => {
    try {
        const { name } = req.query;
        const exists = await Score.exists({ name });
        res.json({ exists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check name' });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});