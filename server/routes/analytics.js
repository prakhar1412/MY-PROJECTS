const express = require('express');
const { query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get overview analytics for the user
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total tasks
    const totalTasks = await Task.countDocuments({ userId });
    
    // Completed tasks
    const completedTasks = await Task.countDocuments({ 
      userId, 
      completed: true 
    });

    // Pending tasks
    const pendingTasks = totalTasks - completedTasks;

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      userId,
      completed: false,
      dueDate: { $lt: new Date() }
    });

    // Tasks due today
    const today = new Date();
    const dueTodayTasks = await Task.countDocuments({
      userId,
      completed: false,
      dueDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    // Tasks completed this week
    const completedThisWeek = await Task.countDocuments({
      userId,
      completed: true,
      completedAt: { $gte: startOfWeek }
    });

    // Tasks completed this month
    const completedThisMonth = await Task.countDocuments({
      userId,
      completed: true,
      completedAt: { $gte: startOfMonth }
    });

    // Tasks completed this year
    const completedThisYear = await Task.countDocuments({
      userId,
      completed: true,
      completedAt: { $gte: startOfYear }
    });

    // Average completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Priority distribution
    const priorityStats = await Task.aggregate([
      { $match: { userId, completed: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const priorityDistribution = {
      high: 0,
      medium: 0,
      low: 0
    };

    priorityStats.forEach(stat => {
      priorityDistribution[stat._id] = stat.count;
    });

    const overview = {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      dueTodayTasks,
      completedThisWeek,
      completedThisMonth,
      completedThisYear,
      completionRate,
      priorityDistribution
    };

    res.json({
      success: true,
      data: {
        overview
      }
    });
  } catch (error) {
    console.error('Get overview analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting overview analytics'
    });
  }
});

// @route   GET /api/analytics/productivity
// @desc    Get productivity analytics with time-based insights
// @access  Private
router.get('/productivity', auth, [
  query('period')
    .optional()
    .isIn(['week', 'month', 'year'])
    .withMessage('Period must be week, month, or year')
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

    const userId = req.user._id;
    const period = req.query.period || 'month';
    const now = new Date();

    let startDate, dateFormat, groupBy;

    // Set date range and grouping based on period
    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
      dateFormat = '%Y-%m-%d';
      groupBy = { $dateToString: { format: dateFormat, date: '$completedAt' } };
    } else if (period === 'month') {
      startDate = new Date(now.setDate(now.getDate() - 30));
      dateFormat = '%Y-%m-%d';
      groupBy = { $dateToString: { format: dateFormat, date: '$completedAt' } };
    } else {
      startDate = new Date(now.setMonth(now.getMonth() - 12));
      dateFormat = '%Y-%m';
      groupBy = { $dateToString: { format: dateFormat, date: '$completedAt' } };
    }

    // Tasks completed over time
    const completionTrend = await Task.aggregate([
      {
        $match: {
          userId,
          completed: true,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category performance
    const categoryPerformance = await Task.aggregate([
      {
        $match: {
          userId,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          completed: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    // Daily averages
    const dailyStats = await Task.aggregate([
      {
        $match: {
          userId,
          completed: true,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const averageTasksPerDay = dailyStats.length > 0 
      ? Math.round(dailyStats.reduce((sum, day) => sum + day.count, 0) / dailyStats.length * 10) / 10
      : 0;

    // Priority completion rates
    const priorityCompletion = await Task.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$priority',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      {
        $project: {
          priority: '$_id',
          total: 1,
          completed: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
              1
            ]
          }
        }
      }
    ]);

    const productivity = {
      period,
      completionTrend,
      categoryPerformance,
      averageTasksPerDay,
      priorityCompletion,
      totalDays: Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: {
        productivity
      }
    });
  } catch (error) {
    console.error('Get productivity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting productivity analytics'
    });
  }
});

// @route   GET /api/analytics/insights
// @desc    Get AI-powered insights and recommendations
// @access  Private
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - 7));
    const startOfMonth = new Date(now.setDate(now.getDate() - 30));

    // Get user's task patterns
    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({ userId, completed: true });
    const overdueTasks = await Task.countDocuments({
      userId,
      completed: false,
      dueDate: { $lt: new Date() }
    });

    // Weekly performance
    const weeklyCompleted = await Task.countDocuments({
      userId,
      completed: true,
      completedAt: { $gte: startOfWeek }
    });

    const weeklyCreated = await Task.countDocuments({
      userId,
      createdAt: { $gte: startOfWeek }
    });

    // Most productive category
    const categoryStats = await Task.aggregate([
      { $match: { userId, completed: true, completedAt: { $gte: startOfMonth } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Average completion time (for tasks with due dates)
    const avgCompletionTime = await Task.aggregate([
      {
        $match: {
          userId,
          completed: true,
          dueDate: { $exists: true },
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          completionTime: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$completionTime' }
        }
      }
    ]);

    // Generate insights
    const insights = [];

    if (totalTasks > 0) {
      const completionRate = (completedTasks / totalTasks) * 100;
      
      if (completionRate >= 80) {
        insights.push({
          type: 'positive',
          title: 'Excellent Progress!',
          message: `You have a ${Math.round(completionRate)}% completion rate. Keep up the great work!`,
          icon: 'trophy'
        });
      } else if (completionRate >= 60) {
        insights.push({
          type: 'neutral',
          title: 'Good Progress',
          message: `You have a ${Math.round(completionRate)}% completion rate. Consider focusing on pending tasks.`,
          icon: 'target'
        });
      } else {
        insights.push({
          type: 'warning',
          title: 'Room for Improvement',
          message: `Your completion rate is ${Math.round(completionRate)}%. Try breaking large tasks into smaller ones.`,
          icon: 'alert-circle'
        });
      }
    }

    if (overdueTasks > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Tasks',
        message: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}. Consider rescheduling or breaking them down.`,
        icon: 'clock'
      });
    }

    if (weeklyCompleted > weeklyCreated) {
      insights.push({
        type: 'positive',
        title: 'Great Week!',
        message: `You completed more tasks (${weeklyCompleted}) than you created (${weeklyCreated}) this week.`,
        icon: 'trending-up'
      });
    }

    if (categoryStats.length > 0) {
      insights.push({
        type: 'info',
        title: 'Most Productive Category',
        message: `You're most productive in "${categoryStats[0]._id}" with ${categoryStats[0].count} completed tasks this month.`,
        icon: 'star'
      });
    }

    if (avgCompletionTime.length > 0) {
      const avgDays = Math.round(avgCompletionTime[0].avgDays * 10) / 10;
      insights.push({
        type: 'info',
        title: 'Completion Pattern',
        message: `On average, you complete tasks in ${avgDays} day${avgDays !== 1 ? 's' : ''}.`,
        icon: 'calendar'
      });
    }

    // Recommendations
    const recommendations = [];

    if (overdueTasks > 3) {
      recommendations.push({
        title: 'Manage Overdue Tasks',
        action: 'Review and reschedule overdue tasks to reduce stress and improve productivity.',
        priority: 'high'
      });
    }

    if (weeklyCompleted < 5 && totalTasks > 10) {
      recommendations.push({
        title: 'Increase Daily Focus',
        action: 'Try to complete at least 1-2 tasks per day to maintain momentum.',
        priority: 'medium'
      });
    }

    if (categoryStats.length === 0) {
      recommendations.push({
        title: 'Organize with Categories',
        action: 'Use categories to better organize your tasks and track progress by area.',
        priority: 'low'
      });
    }

    res.json({
      success: true,
      data: {
        insights,
        recommendations,
        metrics: {
          totalTasks,
          completedTasks,
          overdueTasks,
          weeklyCompleted,
          weeklyCreated,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting insights'
    });
  }
});

// @route   GET /api/analytics/time-tracking
// @desc    Get time tracking analytics
// @access  Private
router.get('/time-tracking', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Tasks with time estimates vs actual time
    const timeComparison = await Task.aggregate([
      {
        $match: {
          userId,
          completed: true,
          estimatedDuration: { $exists: true },
          actualDuration: { $exists: true }
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          estimatedDuration: 1,
          actualDuration: 1,
          difference: {
            $subtract: ['$actualDuration', '$estimatedDuration']
          },
          accuracy: {
            $multiply: [
              {
                $divide: [
                  { $min: ['$estimatedDuration', '$actualDuration'] },
                  { $max: ['$estimatedDuration', '$actualDuration'] }
                ]
              },
              100
            ]
          }
        }
      },
      { $sort: { completedAt: -1 } },
      { $limit: 20 }
    ]);

    // Average estimation accuracy
    const estimationAccuracy = await Task.aggregate([
      {
        $match: {
          userId,
          completed: true,
          estimatedDuration: { $exists: true },
          actualDuration: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgAccuracy: {
            $avg: {
              $multiply: [
                {
                  $divide: [
                    { $min: ['$estimatedDuration', '$actualDuration'] },
                    { $max: ['$estimatedDuration', '$actualDuration'] }
                  ]
                },
                100
              ]
            }
          },
          totalTasks: { $sum: 1 }
        }
      }
    ]);

    // Time spent by category
    const timeByCategory = await Task.aggregate([
      {
        $match: {
          userId,
          completed: true,
          actualDuration: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$category',
          totalTime: { $sum: '$actualDuration' },
          averageTime: { $avg: '$actualDuration' },
          taskCount: { $sum: 1 }
        }
      },
      { $sort: { totalTime: -1 } }
    ]);

    const timeTracking = {
      timeComparison,
      estimationAccuracy: estimationAccuracy[0] || { avgAccuracy: 0, totalTasks: 0 },
      timeByCategory
    };

    res.json({
      success: true,
      data: {
        timeTracking
      }
    });
  } catch (error) {
    console.error('Get time tracking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting time tracking analytics'
    });
  }
});

module.exports = router;