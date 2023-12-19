import db from "../config/Database.js";
import {handleSequelizeError} from "../utils/ErrorHandler.js";
import { v4 as uuidv4 } from 'uuid';

// Function to generate a UUID
const generateUUID = () => {
    return uuidv4();
};

export const getChip = async (req, res) => {
    try {
        const [results2, metadata2] = await db.query(`
      SELECT *
      FROM s_chip
--      JOIN s_provider ON s_chip.s_id_provider = s_provider.id
      ORDER BY s_chip.s_saldo ASC, s_chip.updated_at DESC
      LIMIT 1;
    `);

        res.json(results2);
    } catch (error) {
        handleSequelizeError(error, res)
    }
}

export const updateChip = async (req, res) => {
    try {
        const { id } = req.params;
        const [results, metadata] = await db.query(`
            UPDATE s_chip SET s_saldo = '${req.body.s_saldo}' WHERE id = '${id}'
        `);

        res.json({results, id});
    } catch (error) {
        handleSequelizeError(error, res)
    }
}

export const createOrder = async (req, res) => {
    try {
        const uuid = generateUUID(); // Assuming you have a function to generate a UUID

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
            '${req.body.t_id_cs}',
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

    res.json(results);

    } catch (error) {
        handleSequelizeError(error, res)
    }
}

export const getOrders = async (req, res) => {
    try {
        const [results, metadata] = await db.query(`
      SELECT *
      FROM t_order_mobile
      ORDER BY t_order_mobile.t_tgl_transaksi DESC
    `);

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