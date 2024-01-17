import express from "express";
import {
    createCategories,
    deleteCategories,
    getCategories,
    getCategory,
    updateCategories
} from "../controller/Category.js";
import {
    createOrder, createOrderChat,
    fileUploads,
    getChip, getCs,
    getFilesAdminByIdTransaksi,
    getFilesClient,
    getFilesClientByIdTransaksi, getInchip,
    getOrderById,
    getOrders,
    getStatus, getStatusChat,
    getStatusNumber,
    getStatusOder,
    getStatusOderByUserId,
    getTimer,
    getTutorial, handleHook,
    updateFilesClient,
    updateOrderChip,
    updateOrderStatus,
    updateStatusOrder
} from "../controller/MainApi.js";

const router = express.Router();

router.get('/api/v1/order', getOrders);
router.get('/api/v1/order/:id', getOrderById);
router.post('/api/v1/order', createOrder);
router.post('/api/v1/order_chat', createOrderChat);
router.put('/api/v1/order/:id', updateStatusOrder);
router.get('/api/v1/timer', getTimer);
router.get('/api/v1/cs', getCs);
router.get('/api/v1/status_chat', getStatusChat);
router.post('/api/v1/upload_files/:id',fileUploads, updateFilesClient);

router.get('/api/v1/files', getFilesClient);
router.get('/api/v1/files/:id', getFilesClientByIdTransaksi);
router.get('/api/v1/files_admin/:id', getFilesAdminByIdTransaksi);

router.get('/api/v1/tutorial/:idProvider', getTutorial);
router.get('/api/v1/status', getStatus);
router.get('/api/v1/chip', getChip);
router.get('/api/v1/status_number/:id', getStatusNumber);
router.get('/api/v1/inchip', getInchip);
router.get('/api/v1/status_order/:id', getStatusOder);
router.get('/api/v1/status_order_by_user/:id', getStatusOderByUserId);
router.post('/api/v1/hook', handleHook);

router.put('/api/v1/update_order_chip/:id', updateOrderChip);
router.put('/api/v1/update_order_status/:id', updateOrderStatus);

export default router;
