import { Schema, model, Document } from "mongoose";

interface IScore extends Document {
    name: string;
    score: number;
    date: Date;
}

const ScoreSchema = new Schema<IScore>({
    name: { type: String, required: true }, // field for the name of the player
    score: { type: Number, required: true }, // Score of the player
    date: { type: Date, required: true, default: Date.now }, // Date of the score
}, {
    collection: "Scores"
});

export const Score = model<IScore>("Score", ScoreSchema);