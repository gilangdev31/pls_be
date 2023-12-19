import express from 'express';
import db from './config/Database.js';
import router from './routes/index.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 8080;

try {
    await db.authenticate();
    console.log('Connection to database has been established successfully.');
    const [results, metadata] = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 't_order_mobile';
    `);

    // Extract column information from the results
    const columns = results.map((result) => ({
        name: result.column_name,
        type: result.data_type,
    }));

    console.log('Columns of s_chip table:', columns);

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})