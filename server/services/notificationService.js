const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initializeEmailTransporter();
    this.startReminderScheduler();
  }

  initializeEmailTransporter() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not provided, email notifications disabled');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter verification failed:', error);
      } else {
        console.log('Email transporter ready');
      }
    });
  }

  async sendTaskReminder(user, task) {
    if (!this.transporter || !user.preferences.emailNotifications) {
      return;
    }

    const subject = `Reminder: ${task.title}`;
    const html = this.generateReminderEmailTemplate(user, task);

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        html
      });

      console.log(`Reminder email sent to ${user.email} for task: ${task.title}`);
    } catch (error) {
      console.error('Failed to send reminder email:', error);
    }
  }

  async sendTaskDueSoonNotification(user, tasks) {
    if (!this.transporter || !user.preferences.emailNotifications || tasks.length === 0) {
      return;
    }

    const subject = `${tasks.length} task${tasks.length > 1 ? 's' : ''} due soon`;
    const html = this.generateDueSoonEmailTemplate(user, tasks);

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        html
      });

      console.log(`Due soon notification sent to ${user.email} for ${tasks.length} tasks`);
    } catch (error) {
      console.error('Failed to send due soon notification:', error);
    }
  }

  async sendWeeklySummary(user, summary) {
    if (!this.transporter || !user.preferences.emailNotifications) {
      return;
    }

    const subject = 'Your Weekly Productivity Summary';
    const html = this.generateWeeklySummaryTemplate(user, summary);

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        html
      });

      console.log(`Weekly summary sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send weekly summary:', error);
    }
  }

  generateReminderEmailTemplate(user, task) {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    const dueTime = task.dueTime || '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .task-card { background-color: #f8f9fa; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .priority-high { border-left-color: #EF4444; }
          .priority-medium { border-left-color: #F59E0B; }
          .priority-low { border-left-color: #10B981; }
          .button { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Task Reminder</h1>
            <p>Hi ${user.name},</p>
            <p>This is a friendly reminder about your upcoming task:</p>
          </div>
          
          <div class="task-card priority-${task.priority}">
            <h2>${task.title}</h2>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Priority:</strong> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
            <p><strong>Due:</strong> ${dueDate} ${dueTime}</p>
            ${task.subtasks && task.subtasks.length > 0 ? `
              <p><strong>Subtasks:</strong></p>
              <ul>
                ${task.subtasks.map(subtask => `<li>${subtask.title}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/tasks" class="button">View Task</a>
          </div>
          
          <div class="footer">
            <p>You're receiving this email because you have email notifications enabled.</p>
            <p>You can change your notification preferences in your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateDueSoonEmailTemplate(user, tasks) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .task-item { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #F59E0B; }
          .button { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tasks Due Soon</h1>
            <p>Hi ${user.name},</p>
            <p>You have ${tasks.length} task${tasks.length > 1 ? 's' : ''} due within the next 24 hours:</p>
          </div>
          
          ${tasks.map(task => `
            <div class="task-item">
              <h3>${task.title}</h3>
              <p><strong>Category:</strong> ${task.category} | <strong>Priority:</strong> ${task.priority}</p>
              <p><strong>Due:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'} ${task.dueTime || ''}</p>
            </div>
          `).join('')}
          
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/tasks" class="button">View All Tasks</a>
          </div>
          
          <div class="footer">
            <p>Stay on top of your tasks with Modern Todo App!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWeeklySummaryTemplate(user, summary) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-card { background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 2em; font-weight: bold; color: #3B82F6; }
          .button { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Weekly Productivity Summary</h1>
            <p>Hi ${user.name},</p>
            <p>Here's how you did this week:</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${summary.completedTasks}</div>
              <div>Tasks Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${summary.createdTasks}</div>
              <div>Tasks Created</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${summary.completionRate}%</div>
              <div>Completion Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${summary.streak}</div>
              <div>Day Streak</div>
            </div>
          </div>
          
          ${summary.topCategory ? `
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🏆 Most Productive Category</h3>
              <p>You completed the most tasks in <strong>${summary.topCategory.name}</strong> with ${summary.topCategory.count} tasks!</p>
            </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/analytics" class="button">View Detailed Analytics</a>
          </div>
          
          <div class="footer">
            <p>Keep up the great work! 🚀</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  startReminderScheduler() {
    // Check for reminders every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.checkAndSendReminders();
    });

    // Send daily due soon notifications at 9 AM
    cron.schedule('0 9 * * *', async () => {
      await this.sendDailySummary();
    });

    // Send weekly summaries on Sunday at 6 PM
    cron.schedule('0 18 * * 0', async () => {
      await this.sendWeeklySummaries();
    });

    console.log('Notification scheduler started');
  }

  async checkAndSendReminders() {
    try {
      const now = new Date();
      const reminderWindow = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

      const tasksToRemind = await Task.find({
        completed: false,
        reminderDate: {
          $gte: now,
          $lte: reminderWindow
        }
      }).populate('userId');

      for (const task of tasksToRemind) {
        if (task.userId && task.userId.preferences.emailNotifications) {
          await this.sendTaskReminder(task.userId, task);
          // Update reminder date to prevent duplicate notifications
          task.reminderDate = null;
          await task.save();
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  async sendDailySummary() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const users = await User.find({ 'preferences.emailNotifications': true });

      for (const user of users) {
        const dueSoonTasks = await Task.find({
          userId: user._id,
          completed: false,
          dueDate: { $lte: tomorrow }
        }).limit(10);

        if (dueSoonTasks.length > 0) {
          await this.sendTaskDueSoonNotification(user, dueSoonTasks);
        }
      }
    } catch (error) {
      console.error('Error sending daily summaries:', error);
    }
  }

  async sendWeeklySummaries() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const users = await User.find({ 'preferences.emailNotifications': true });

      for (const user of users) {
        const weeklyStats = await this.generateWeeklyStats(user._id, oneWeekAgo);
        await this.sendWeeklySummary(user, weeklyStats);
      }
    } catch (error) {
      console.error('Error sending weekly summaries:', error);
    }
  }

  async generateWeeklyStats(userId, startDate) {
    const completedTasks = await Task.countDocuments({
      userId,
      completed: true,
      completedAt: { $gte: startDate }
    });

    const createdTasks = await Task.countDocuments({
      userId,
      createdAt: { $gte: startDate }
    });

    const totalTasks = await Task.countDocuments({ userId });
    const allCompleted = await Task.countDocuments({ userId, completed: true });
    const completionRate = totalTasks > 0 ? Math.round((allCompleted / totalTasks) * 100) : 0;

    // Get top category
    const topCategory = await Task.aggregate([
      {
        $match: {
          userId,
          completed: true,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Calculate streak (simplified)
    const recentDays = await Task.aggregate([
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
          }
        }
      }
    ]);

    return {
      completedTasks,
      createdTasks,
      completionRate,
      streak: recentDays.length,
      topCategory: topCategory.length > 0 ? {
        name: topCategory[0]._id,
        count: topCategory[0].count
      } : null
    };
  }
}

module.exports = new NotificationService();