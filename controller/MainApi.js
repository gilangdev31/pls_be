import db from "../config/Database.js";
import {handleSequelizeError} from "../utils/ErrorHandler.js";
import { v4 as uuidv4 } from 'uuid';

import multer from "multer";
import express from "express";
import path, {dirname, join} from "path";
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import newAdmin from "../index.js";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to generate a UUID
const generateUUID = () => {
    return uuidv4();
};


const uploadsDirectory = join(__dirname, 'uploads');
if (!existsSync(uploadsDirectory)) {
    mkdirSync(uploadsDirectory);
}

function getCurrentFormattedDate() {
    const currentDate = new Date();

    // Get individual date components
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = String(currentDate.getFullYear()).slice(-2); // Get last 2 digits of the year

    // Get individual time components
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    // Return formatted date and time
    return `${day}-${month}-${year}__${hours}:${minutes}:${seconds}`;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDirectory); // Destination folder where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${getCurrentFormattedDate()}__${Math.floor(Math.random() * 9000) + 1000}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage: storage });



export const fileUploads = upload.array('photos', 20)

async function getNextCS() {
    const getCSQuery = `
    SELECT * FROM t_order_mobile 
    ORDER BY CAST(id AS INT) DESC
    LIMIT 1
  `;

    // Count the number of active customer services
    const countCSQuery = `
    SELECT MAX(id) AS id FROM s_customer_services;
  `;

    // Get the list of active customer services
    const listCSQuery = `
    SELECT * FROM s_customer_services 
--    WHERE s_status = 'true' AND s_kategori = '2'
  `;


    const [getCSPromise, metadata] = await db.query(getCSQuery);
    const [countCSPromise, metadata2] = await db.query(countCSQuery);
    const [listCSPromise, metadata3] = await db.query(listCSQuery);

    const [getCS, countCS, listCS] = await Promise.all([getCSPromise, countCSPromise, listCSPromise]);

    const countFinal = parseInt(countCS[0].id);
    const getCsFinal = getCS[0] ? parseInt(getCS[0].t_id_cs) : -1;
    const listCSFinal = listCS;//.map(item => parseInt(item.id, 10));

    console.log("getCsFinalGilangO111L"); //[ { count: '2' } ]
    console.log(getCsFinal); // 1, 2, 3
    console.log("countFinalGilangO111L"); //[ { count: '2' } ]
    console.log(getCsFinal); // 1, 2, 3
    console.log("listCSFinalGilangO111L"); //[ { id: '1' }, { id: '2' }, { id: '3'
    console.log(listCSFinal); // 1, 2, 3


    let nextCS = null;


    if (countCS === 1) {
        nextCS = listCS[0];
    } else {
        for (const item of listCSFinal) {
            const cs = parseInt(item.id, 10)
            const isValid = item.s_status === true && item.s_kategori === 2;

            if (getCsFinal === -1 || getCsFinal === countFinal) {
                if(!isValid) {
                    continue;
                }
                console.log("11111"); //[ { count: '2' } ]
                nextCS = cs;
                break;
            } else if (getCsFinal !== -1 && getCsFinal >= cs) {
                console.log("22222"); //[ { count: '2' } ]
                continue;
            } else {

                if(!isValid) {
                    continue;
                }

                console.log("3333"); //[ { count: '2' } ]
                nextCS = cs;
                break;
            }
        }
    }
    return [nextCS];
}



export const getOrderById = async (req, res) => {
    try {
        const utcDate = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const utcPlus7Date = new Date(utcDate.getTime() + offset);
        const currentTime = utcPlus7Date.toISOString();

        const { id } = req.params;
        const [results, metadata] = await db.query(`
          SELECT *
          FROM t_order_mobile
          WHERE t_order_mobile.id = '${id}'
        `);

        if(results[0]) {
            const [inChip, metadata2] = await db.query(`
              SELECT *
              FROM t_inchip
              WHERE t_id_provider = '${results[0].t_id_provider}' AND t_id_cs = '${results[0].t_id_cs}'
              ORDER BY updated_at DESC
            `);

            res.json({
                inchip: inChip[0] ? inChip[0] : null,
                cs: inChip[0].t_id_cs,
                idTransaction: results[0].t_id_transaksi,
                id: results[0].id,
                currentTime: currentTime
            });
        }
    }catch (error) {
        handleSequelizeError(error, res)
    }
}
export const createOrder = async (req, res) => {
    try {
        const uuid = generateUUID(); // Assuming you have a function to generate a UUID
        const [nextCS] = await getNextCS(); // Get the next customer service ID

        const utcDate = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const utcPlus7Date = new Date(utcDate.getTime() + offset);
        const currentTime = utcPlus7Date.toISOString();
        let t_id_chip;
        let inChip, metadata2;

        if(nextCS != null) {
            const [inChipR, metadata2] = await db.query(`
          SELECT *
          FROM t_inchip
          WHERE t_id_cs = '${nextCS}' AND t_id_provider = '${req.body.t_id_provider}'
          ORDER BY updated_at DESC
        `);
            inChip = inChipR;
             t_id_chip = inChip[0] ? inChip[0].t_id_chip : null

        } else {
            inChip = null;
            t_id_chip = null
        }



        //  return res.json({
        //     inchip: t_id_chip,
        //     cs: nextCS,
        //     idTransaction: req.body.t_id_transaksi,
        //     currentTime: currentTime
        // });

        const [results, metadata] = await db.query(`
        INSERT INTO t_order_mobile (
            uuid,
            t_id_transaksi,
            t_tgl_transaksi,
            t_id_provider,
            t_provider,
            t_rate,
            t_no_telp,
            t_nominal,
            t_jumlah_pembayaran,
            t_id_metode_pembayaran,
            t_metode_pembayaran,
            t_no_rekening,
            t_nama_rekening,
            t_fee,
            t_total_jumlah_pembayaran,
            t_id_via,
            t_id_cs,
            t_id_chip,
            t_id_user,
            t_file_pulsa,
            t_file_pembayaran,
            is_valid,
            is_done,
            t_id_verifikasi,
            t_ket,
            created_at,
            updated_at,
            is_success
        ) VALUES (
            '${uuid}',
            '${req.body.t_id_transaksi}',
            '${req.body.t_tgl_transaksi}',
            '${req.body.t_id_provider}',
            '${req.body.t_provider}',
            '${req.body.t_rate}',
            '${req.body.t_no_telp}',
            '${req.body.t_nominal}',
            '${req.body.t_jumlah_pembayaran}',
            '${req.body.t_id_metode_pembayaran}',
            '${req.body.t_metode_pembayaran}',
            '${req.body.t_no_rekening}',
            '${req.body.t_nama_rekening}',
            '${req.body.t_fee}',
            '${req.body.t_total_jumlah_pembayaran}',
            '${req.body.t_id_via}',
            ${nextCS},
            ${t_id_chip},
            '${req.body.t_id_user}',
            NULL,
            NULL,
            NULL,
            NULL,
            '${req.body.t_id_verifikasi}',
            '${req.body.t_ket}',
            '${currentTime}',
            '${currentTime}',
            NULL
        ) RETURNING id
    `);

    res.json({
        inchip: inChip[0] ? inChip[0] : null,
        cs: nextCS,
        idTransaction: req.body.t_id_transaksi,
        id: results[0].id,
        currentTime: currentTime
    });

    } catch (error) {
        handleSequelizeError(error, res)
    }
}


export const getTutorial = async (req, res) => {
    try {
        const { idProvider } = req.params;
        const phoneNumber = req.query.number;
        const nominal = req.query.nominal;

        const [results, metadata] = await db.query(`
          SELECT *
          FROM s_tutorial
          WHERE t_id_provider = '${idProvider}' AND is_active = 'true'
        `);

        const [providers, metadata2] = await db.query(`
          SELECT *
          FROM s_provider
          WHERE id = '${idProvider}'
        `);

        // const updatedResults = results.map(item => {
        //     // Replace [nomor admin] with the custom variable in the s_ket string
        //     const updatedSket = item.s_ket.replace('[nomor admin]', phoneNumber);
        //     const updatedSket2 = updatedSket.replace('[nominal]', nominal);
        //     const updatedSket3 = updatedSket2.replace('[nominal pulsa]', nominal);
        //
        //     // Return a new object with the updated s_ket value
        //     return {
        //         ...item,
        //         s_ket: updatedSket3
        //     };
        // });

        res.json({
            results: results,
            providers: providers
        });

    } catch (error) {

    }
}



export const getTimer = async (req, res) => {
    try {
        const [results, metadata] = await db.query(`
          SELECT *
          FROM s_timer
        `);

        res.json({
            results: results
        });

    } catch (error) {

    }
}


export const getCs = async (req, res) => {
    try {
        const [results, metadata] = await db.query(`
          SELECT *
          FROM s_customer_services
        `);

        res.json({
            results: results
        });

    } catch (error) {

    }
}


export const getStatusChat = async (req, res) => {
    try {
        const [results, metadata] = await db.query(`
          SELECT *
          FROM s_chat
        `);

        res.json({
            results: results
        });

    } catch (error) {

    }
}


export const getOrders = async (req, res) => {
    try {
     const [results, metadata] = await db.query(`
      SELECT *
      FROM t_order_mobile
      ORDER BY t_order_mobile.t_tgl_transaksi DESC
    `);

    //  db.query(`
    //   DELETE FROM t_order_mobile
    // `)


        res.json(results);
    } catch (error) {
        handleSequelizeError(error, res)
    }
}

export const updateStatusOrder = async (req, res) => {
    try {
        const utcDate = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const utcPlus7Date = new Date(utcDate.getTime() + offset);
        const currentTime = utcPlus7Date.toISOString();

        const { id } = req.params;
        const [results, metadata] = await db.query(`
            UPDATE t_order_mobile SET is_done = '${req.body.is_done}', updated_at = '${currentTime}' WHERE id = '${id}'
        `);

        res.json(results);
    } catch (error) {
        handleSequelizeError(error, res)
    }
}

export const updateFilesClient = async (req, res) => {
    try {
        const photos = req.files;
        const { id } = req.params;
        const utcDate = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const utcPlus7Date = new Date(utcDate.getTime() + offset);
        const currentTime = utcPlus7Date.toISOString();


        const async1 = photos.map(photo => {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const pathName = photo.filename; // Replace with the actual pathName property from your file object
            const t_nama = baseUrl + "/uploads/" + pathName;

            console.log(`gilang ${t_nama}`);

            // Insert a new record into the t_upload_order table with t_nama set to baseUrl + pathName
            return db.query(`
                INSERT INTO t_upload_order (
                    t_id_transaksi,
                    t_nama,
                    created_at,
                    updated_at,
                    created_by
                ) VALUES (
                    '${id}',
                    '${t_nama}',
                    '${currentTime}',
                    '${currentTime}',
                    '-1'
                )
            `);
        })
        Promise.all([async1])
            .then(async () => {
                // All records inserted successfully
                const [results, metadata] = await db.query(`
                    UPDATE t_order_mobile SET t_file_pulsa = '1' WHERE id = '${id}'
                    RETURNING id
                `);

                res.status(200).json(
                    {
                        message: "Photos uploaded successfully",
                        size: photos.length,
                        photos: photos,
                        update_t_order_mobile: results
                    }
                );
            })
            .catch(error => {
                // Handle any errors that occurred during insertion
                console.error('Error inserting photos:', error);
                res.status(500).send('Internal Server Error');
            });

        // res.json({
        //     message: "Setting Brand updated successfully",
        // });
    } catch (error) {
        handleSequelizeError(error, res)
    }
}

export const getFilesClient = async (req, res) => {
    try {
        const {id} = req.params;
        const [results, metadata] = await db.query(`
            SELECT *
            FROM t_upload_order
        `);

        res.json(results);
    } catch (e) {
        handleSequelizeError(e, res)
    }
}

export const getFilesClientByIdTransaksi = async (req, res) => {
    try {
        const {id} = req.params;
        const [results, metadata] = await db.query(`
            SELECT *
            FROM t_upload_order
            WHERE t_id_transaksi = '${id}'
        `);

        res.json(results);
    } catch (e) {
        handleSequelizeError(e, res)
    }
}

export const getFilesAdminByIdTransaksi = async (req, res) => {
    try {
        const {id} = req.params;
        const [results, metadata] = await db.query(`
            SELECT *
            FROM t_upload_proses
            WHERE t_id_transaksi = '${id}'
        `);

        res.json(results);
    } catch (e) {
        handleSequelizeError(e, res)
    }
}

export const getStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const [results, metadata] = await db.query(`
            SELECT *
            FROM s_status
        `);

        res.json({
            results: results
        });
    } catch (e) {
        handleSequelizeError(e, res)
    }
}

export const getChip = async (req, res) => {
    try {
        const {id} = req.params;
        const [results, metadata] = await db.query(`
            SELECT *
            FROM s_chip
        `);

        res.json({
            results: results
        });
    } catch (e) {
        handleSequelizeError(e, res)
    }
}

export const getInchip = async (req, res) => {
    try {
        const [results, metadata] = await db.query(`
            SELECT *
            FROM t_inchip
        `);

        res.json({
            results: results
        });
    } catch (e) {
        handleSequelizeError(e, res)
    }
}

export const getStatusNumber = async (req, res) => {
    try {
        const {id} = req.params;
        const [results, metadata] = await db.query(`
            SELECT *
            FROM t_order_mobile
            WHERE t_order_mobile.id = '${id}'
        `);

        var nomor = null;

        if (results[0]) {
            const [results2, metadata2] = await db.query(`
            SELECT *
            FROM s_chip
            WHERE s_chip.id = '${results[0].t_id_chip}'
        `);
            if(results2[0]) {
                nomor = results2[0].s_nomor;
            }
        }

        res.json({
            nomor: nomor
        });
    } catch (e) {
        handleSequelizeError(e, res)
    }
}


export const getStatusOder = async (req, res) => {
    try {
        const {id} = req.params;
        const [results, metadata] = await db.query(`
            SELECT *
            FROM t_order_mobile
            WHERE t_order_mobile.id = '${id}'
        `);

        res.json(results[0]);
    } catch (e) {
        handleSequelizeError(e, res)
    }
}


export const updateOrderChip = async (req, res) => {
    try {
        const {id} = req.params;

        const utcDate = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const utcPlus7Date = new Date(utcDate.getTime() + offset);
        const currentTime = utcPlus7Date.toISOString();


        const [results, metadata] = await db.query(`
            UPDATE t_order_mobile SET t_id_chip = '${req.body.t_id_chip}', updated_at = '${currentTime}' WHERE id = '${id}'
            RETURNING id
        `);

        res.json({
            results: results,
            t_id_chip: req.body.t_id_chip,
            id: id
        });
    } catch (e) {
        handleSequelizeError(e, res)
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const {id} = req.params;

        const utcDate = new Date();
        const offset = 7 * 60 * 60 * 1000;
        const utcPlus7Date = new Date(utcDate.getTime() + offset);
        const currentTime = utcPlus7Date.toISOString();

        const [results, metadata] = await db.query(`
            UPDATE t_order_mobile SET is_valid = '${req.body.is_valid}', is_done = '${req.body.is_done}', is_success = '${req.body.is_success}', t_ket = '${req.body.t_ket}', updated_at = '${currentTime}' WHERE id = '${id}'
            RETURNING id
        `);

        res.json({
            results: results,
        });
    } catch (e) {
        handleSequelizeError(e, res)
    }
}

export const getStatusOderByUserId = async (req, res) => {
    try {
        const {id} = req.params;
        const [results, metadata] = await db.query(`
            SELECT *
            FROM t_order_mobile
            WHERE t_order_mobile.t_id_user = '${id}'
            ORDER BY t_order_mobile.created_at DESC
        `);

        res.json(results);
    } catch (e) {
        handleSequelizeError(e, res)
    }
}


export const handleHook = async (req, res) => {
    try {
        console.log("webhook called");
        console.log(req.body);
        res.json("ok");

        const message = {
            notification: {
                title: 'Message Received',
                body: req.body.data.content.toString(),
            },
            data: {
                score: '850',
                time: '2:45'
            },
            topic: req.body.data.session_id
        };

        newAdmin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    } catch (e) {
        handleSequelizeError(e, res)
    }
}