import db from "../config/Database.js";
import {handleSequelizeError} from "../utils/ErrorHandler.js";
import { v4 as uuidv4 } from 'uuid';

// Function to generate a UUID
const generateUUID = () => {
    return uuidv4();
};

async function getNextCS() {
    const getCSQuery = `
    SELECT * FROM t_order_mobile 
    ORDER BY CAST(id AS INT) DESC
    LIMIT 1
  `;

    // Count the number of active customer services
    const countCSQuery = `
    SELECT COUNT(*) as count FROM s_customer_services 
    WHERE s_status = 'true'
  `;

    // Get the list of active customer services
    const listCSQuery = `
    SELECT id FROM s_customer_services 
    WHERE s_status = 'true'
  `;

    const [getCSPromise, metadata] = await db.query(getCSQuery);
    const [countCSPromise, metadata2] = await db.query(countCSQuery);
    const [listCSPromise, metadata3] = await db.query(listCSQuery);

    const [getCS, countCS, listCS] = await Promise.all([getCSPromise, countCSPromise, listCSPromise]);

    const countFinal = parseInt(countCS[0].count);
    const getCsFinal = getCS[0] ? parseInt(getCS[0].t_id_cs) : -1;
    const listCSFinal = listCS.map(item => parseInt(item.id, 10));

    console.log("getCsFinal"); //[ { count: '2' } ]
    console.log(getCsFinal); // 1, 2, 3
    console.log("countFinal"); //[ { count: '2' } ]
    console.log(countFinal); // 1, 2, 3


    let nextCS = null;


    if (countCS === 1) {
        nextCS = listCS[0];
    } else {
        for (const cs of listCSFinal) {
            console.log("getCsFinal");
            console.log(getCsFinal);
            console.log("countFinal");
            console.log(countFinal);
            if (getCsFinal === -1 || getCsFinal === countFinal) {
                nextCS = cs;


                break;
            } else if (getCsFinal !== -1 && getCsFinal >= cs) {
                continue;
            } else {
                nextCS = cs;
                break;
            }
        }
    }
    return [nextCS];
}

export const createOrder = async (req, res) => {
    try {
        const uuid = generateUUID(); // Assuming you have a function to generate a UUID
        const [nextCS] = await getNextCS(); // Get the next customer service ID

        const [inChip, metadata2] = await db.query(`
          SELECT *
          FROM t_inchip
          WHERE t_id_cs = '${nextCS}' AND t_id_provider = '${req.body.t_id_provider}'
          ORDER BY updated_at DESC
        `);

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
            t_ket
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
            '${nextCS}',
            '${req.body.t_id_chip}',
            '${req.body.t_id_user}',
            '${req.body.t_file_pulsa}',
            '${req.body.t_file_pembayaran}',
            '${req.body.is_valid}',
            '${req.body.is_done}',
            '${req.body.t_id_verifikasi}',
            '${req.body.t_ket}'
        )
    `);

    res.json({
        inchip: inChip[0] ? inChip[0] : null,
        cs: nextCS,
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
          WHERE t_id_provider = '${idProvider}'
        `);

        const updatedResults = results.map(item => {
            // Replace [nomor admin] with the custom variable in the s_ket string
            const updatedSket = item.s_ket.replace('[nomor admin]', phoneNumber);
            const updatedSket2 = updatedSket.replace('[nominal]', nominal);

            // Return a new object with the updated s_ket value
            return {
                ...item,
                s_ket: updatedSket2
            };
        });

        res.json({
            results: updatedResults
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

    //     db.query(`
    //   DELETE FROM t_order_mobile
    // `)


        res.json(results);
    } catch (error) {
        handleSequelizeError(error, res)
    }
}

export const updateStatusOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const [results, metadata] = await db.query(`
            UPDATE t_order_mobile SET is_done = '${req.body.is_done}' WHERE id = '${id}'
        `);

        res.json(results);
    } catch (error) {
        handleSequelizeError(error, res)
    }
}