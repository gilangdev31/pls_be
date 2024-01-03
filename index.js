import express from 'express';
import db from './config/Database.js';
import router from './routes/index.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path, {dirname} from "path";
import {fileURLToPath} from "url";

dotenv.config();

const app = express();
const PORT = 8083;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    await db.authenticate();
    console.log('Connection to database has been established successfully.');

    const [results, metadata] = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 't_upload_order';
    `);

    // Extract column information from the results
    const columns = results.map((result) => ({
        name: result.column_name,
        type: result.data_type,
    }));

    console.log('Columns of t_upload_order table:', columns);

} catch (error) {
    console.error('Unable to connect to the database:', error);
}

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(router)
app.use('/uploads', express.static(path.join(__dirname, '/controller/uploads')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})