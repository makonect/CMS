import PageView from '../models/PageView.js';

export const trackPageView = async (req, res) => {
  try {
    const { website, pageUrl, pageTitle } = req.body;

    if (!website || !pageUrl || !pageTitle) {
      return res.status(400).json({
        success: false,
        error: 'Website, pageUrl, and pageTitle are required'
      });
    }

    const pageView = new PageView({
      website,
      pageUrl,
      pageTitle,
      viewDate: new Date()
    });

    await pageView.save();

    res.json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track page view'
    });
  }
};

export const getTrafficStats = async (req, res) => {
  try {
    const { website, date, period = 'day' } = req.query;
    const selectedDate = date ? new Date(date) : new Date();
    
    // Set date range based on period
    let startDate, endDate;
    if (period === 'day') {
      startDate = new Date(selectedDate.setHours(0, 0, 0, 0));
      endDate = new Date(selectedDate.setHours(23, 59, 59, 999));
    } else if (period === 'week') {
      startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const filter = { 
      website,
      viewDate: { $gte: startDate, $lte: endDate }
    };

    const [todayViews, totalViews, popularPages] = await Promise.all([
      // Today's views
      PageView.countDocuments(filter),
      
      // Total views for this website
      PageView.countDocuments({ website }),
      
      // Popular pages
      PageView.aggregate([
        { $match: filter },
        { $group: { 
          _id: '$pageUrl', 
          count: { $sum: 1 },
          title: { $first: '$pageTitle' }
        }},
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        todayViews,
        totalViews,
        popularPages,
        dateRange: {
          start: startDate,
          end: endDate,
          period
        }
      }
    });
  } catch (error) {
    console.error('Error getting traffic stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get traffic statistics'
    });
  }
};

export const getTrafficOverTime = async (req, res) => {
  try {
    const { website, days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const trafficData = await PageView.aggregate([
      {
        $match: {
          website,
          viewDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$viewDate" }
          },
          views: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing days with 0 views
    const filledData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = trafficData.find(item => item._id === dateStr);
      
      filledData.push({
        date: dateStr,
        views: existingData ? existingData.views : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: filledData
    });
  } catch (error) {
    console.error('Error getting traffic over time:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get traffic over time data'
    });
  }
};