import Category from "../models/CategoryModel.js";
import {handleSequelizeError} from "../utils/ErrorHandler.js";

export const getCategories = async (req, res) => {
    try {
        const users = await Category.findAll();
        res.json(users);
    } catch (error) {
        console.error(error);
    }
}

export const getCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findOne({
            where: {
                id: categoryId,
            }
        });

        if (!category) {
            return res.status(404).json({message: "Category not found"});
        }

        res.json(category);
    } catch (error) {
        console.error(error);
    }
}

export const createCategories = async (req, res) => {
    try {
        const {title, description} = req.body;
        const category = await Category.create({
            title: title,
            description: description,
        });
        res.json({
            message: "Category created successfully",
            category: category,
        });
    } catch (error) {
        handleSequelizeError(error, res);
    }
}

export const updateCategories = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const {title, description} = req.body;
        const category = await Category.update({
            title: title,
            description: description,
        }, {
            where: {
                id: categoryId,
            }
        });

        if(category[0] === 0) {
            return res.status(404).json({message: "Category not found"});
        }

        res.json({
            message: "Category updated successfully",
        });
    } catch (error) {
        handleSequelizeError(error, res);
    }
}

export const deleteCategories = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.destroy({
            where: {
                id: categoryId,
            }
        });

        if(category === 0) {
            return res.status(404).json({message: "Category not found"});
        }

        res.json({
            message: "Category deleted successfully",
        });
    } catch (error) {
        handleSequelizeError(error, res);
    }
}