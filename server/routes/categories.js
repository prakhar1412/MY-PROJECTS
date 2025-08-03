const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id })
      .sort({ order: 1 });

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting categories'
    });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name is required and must be between 1 and 50 characters'),
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Icon must be less than 30 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, color, icon, description, isDefault } = req.body;

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({
      userId: req.user._id,
      name: name
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Get the highest order number for this user
    const lastCategory = await Category.findOne({ userId: req.user._id })
      .sort({ order: -1 });
    
    const order = lastCategory ? lastCategory.order + 1 : 0;

    const category = new Category({
      name,
      color,
      icon: icon || 'folder',
      description,
      userId: req.user._id,
      isDefault: isDefault || false,
      order
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating category'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Icon must be less than 30 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        userId: req.user._id,
        name: req.body.name,
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update category fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        category[key] = req.body[key];
      }
    });

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating category'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if there are tasks in this category
    const tasksInCategory = await Task.countDocuments({
      userId: req.user._id,
      category: category.name
    });

    if (tasksInCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It contains ${tasksInCategory} task(s). Please move or delete the tasks first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting category'
    });
  }
});

// @route   PUT /api/categories/reorder
// @desc    Reorder categories
// @access  Private
router.put('/reorder', auth, [
  body('categoryIds')
    .isArray()
    .withMessage('Category IDs must be an array'),
  body('categoryIds.*')
    .isMongoId()
    .withMessage('Each category ID must be a valid MongoDB ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { categoryIds } = req.body;

    // Update order for each category
    for (let i = 0; i < categoryIds.length; i++) {
      await Category.findOneAndUpdate(
        { _id: categoryIds[i], userId: req.user._id },
        { order: i }
      );
    }

    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reordering categories'
    });
  }
});

// @route   GET /api/categories/:id/stats
// @desc    Get statistics for a specific category
// @access  Private
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const totalTasks = await Task.countDocuments({
      userId: req.user._id,
      category: category.name
    });

    const completedTasks = await Task.countDocuments({
      userId: req.user._id,
      category: category.name,
      completed: true
    });

    const overdueTasks = await Task.countDocuments({
      userId: req.user._id,
      category: category.name,
      completed: false,
      dueDate: { $lt: new Date() }
    });

    const dueTodayTasks = await Task.countDocuments({
      userId: req.user._id,
      category: category.name,
      completed: false,
      dueDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const stats = {
      categoryName: category.name,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      overdueTasks,
      dueTodayTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting category statistics'
    });
  }
});

module.exports = router;