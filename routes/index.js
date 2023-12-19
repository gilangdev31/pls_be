import express from "express";
import {
    createCategories,
    deleteCategories,
    getCategories,
    getCategory,
    updateCategories
} from "../controller/Category.js";
import {createOrder, getChip, getOrders, updateChip, updateStatusOrder} from "../controller/MainApi.js";

const router = express.Router();

//Category
router.get('/api/v1/category', getCategories);
router.get('/api/v1/category/:categoryId', getCategory);
router.post('/api/v1/category', createCategories);
router.put('/api/v1/category/:categoryId', updateCategories);
router.delete('/api/v1/category/:categoryId', deleteCategories);

router.get('/api/v1/chip', getChip);
router.get('/api/v1/order', getOrders);
router.put('/api/v1/chip/:id', updateChip);
router.post('/api/v1/order', createOrder);
router.put('/api/v1/order/:id', updateStatusOrder);

export default router;
