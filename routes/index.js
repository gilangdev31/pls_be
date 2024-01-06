import express from "express";
import {
    createCategories,
    deleteCategories,
    getCategories,
    getCategory,
    updateCategories
} from "../controller/Category.js";
import {
    createOrder, fileUploads, getChip, getFilesClient,
    getOrders, getStatus, getStatusNumber,
    getTimer,
    getTutorial,
    updateFilesClient, updateOrderChip,
    updateStatusOrder
} from "../controller/MainApi.js";

const router = express.Router();

router.get('/api/v1/order', getOrders);
router.post('/api/v1/order', createOrder);
router.put('/api/v1/order/:id', updateStatusOrder);
router.get('/api/v1/timer', getTimer);
router.post('/api/v1/upload_files/:id',fileUploads, updateFilesClient);

router.get('/api/v1/files', getFilesClient);

router.get('/api/v1/tutorial/:idProvider', getTutorial);
router.get('/api/v1/status', getStatus);
router.get('/api/v1/chip', getChip);
router.get('/api/v1/status_number/:id', getStatusNumber);

router.put('/api/v1/update_order_chip/:id', updateOrderChip);

export default router;
