import express from 'express';
import db from './config/Database.js';
import router from './routes/index.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path, {dirname} from "path";
import {fileURLToPath} from "url";
import cron from "node-cron";
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };





dotenv.config();


let newAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const app = express();
const PORT = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    await db.authenticate();
    console.log('Connection to database has been established successfully.');

    const [results, metadata] = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 't_upload_proses';
    `);

    // Extract column information from the results
    const columns = results.map((result) => ({
        name: result.column_name,
        type: result.data_type,
    }));

    console.log('Columns of t_upload_proses table:', columns);

    cron.schedule('*/5 * * * * *', async () => {
        // console.log('Running a task every 20 seconds:', new Date().toISOString());
        // Add your task logic here
        const [results, metadata] = await db.query(`
          SELECT *
          FROM s_timer
        `);

        if(results[0]) {
            const timeInMinute = results[0].s_time;
            const [results2, metadata2] = await db.query(`
              SELECT *
              FROM t_order_mobile
              WHERE t_order_mobile.t_file_pulsa IS NULL AND t_order_mobile.is_success IS NULL
            `);

            // console.log(`timeInMinute ${timeInMinute}`);

            for (const result of results2) {
                const createdAt = new Date(result.created_at);
                createdAt.setMinutes(createdAt.getMinutes() + timeInMinute);

                const now = new Date();

                const timeDifference = now.getTime() - createdAt.getTime();

                const timeInSeconds = timeDifference / 1000;

// Convert seconds to minutes and seconds
                const minutes = Math.floor(timeInSeconds / 60); // Get the whole minutes
                const seconds = Math.floor(timeInSeconds % 60); // Get the remaining seconds




                const utcDate = new Date();
                const offset = 7 * 60 * 60 * 1000;
                const utcPlus7Date = new Date(utcDate.getTime() + offset);
                const currentTime = utcPlus7Date.toISOString();

// Print the result
                console.log(`Current time: ${minutes} minutes ${seconds} seconds`);
                if(minutes > -1) {
                    await db.query(`                    UPDATE
                    t_order_mobile
                    SET
                    is_success = 'false', is_done = 'true', done_time = '${currentTime}', t_ket = 'Waktu habis'
                    WHERE
                    id = ${result.id}
                        `);
                }
            }
        }
    });


} catch (error) {
    console.error('Unable to connect to the database:', error);
}

export default newAdmin;

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