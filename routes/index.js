import express from "express";
import {
    createCategories,
    deleteCategories,
    getCategories,
    getCategory,
    updateCategories
} from "../controller/Category.js";
import {createOrder, getOrders, getTutorial, updateStatusOrder} from "../controller/MainApi.js";

const router = express.Router();

router.get('/api/v1/order', getOrders);
router.post('/api/v1/order', createOrder);
router.put('/api/v1/order/:id', updateStatusOrder);

router.get('/api/v1/tutorial/:idProvider', getTutorial);

export default router;
