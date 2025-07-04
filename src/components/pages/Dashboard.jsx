import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { contactsService } from '@/services/api/contactsService'
import { dealsService } from '@/services/api/dealsService'
import { tasksService } from '@/services/api/tasksService'
import { activitiesService } from '@/services/api/activitiesService'

const Dashboard = () => {
  const [data, setData] = useState({
    contacts: [],
    deals: [],
    tasks: [],
    activities: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [contacts, deals, tasks, activities] = await Promise.all([
        contactsService.getAll(),
        dealsService.getAll(),
        tasksService.getAll(),
        activitiesService.getAll()
      ])
      
      setData({ contacts, deals, tasks, activities })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading type="dashboard" />
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getMetrics = () => {
    const totalDeals = data.deals.length
    const totalDealValue = data.deals.reduce((sum, deal) => sum + deal.value, 0)
    const wonDeals = data.deals.filter(deal => deal.stage === 'closed-won').length
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals * 100).toFixed(1) : 0
    const overdueTasks = data.tasks.filter(task => 
      task.status !== 'completed' && new Date(task.dueDate) < new Date()
    ).length
    const todaysTasks = data.tasks.filter(task => {
      const taskDate = new Date(task.dueDate).toDateString()
      const today = new Date().toDateString()
      return taskDate === today && task.status !== 'completed'
    }).length

    return {
      totalContacts: data.contacts.length,
      totalDeals,
      totalDealValue,
      conversionRate,
      overdueTasks,
      todaysTasks
    }
  }

  const getDealsByStage = () => {
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']
    return stages.map(stage => ({
      stage,
      count: data.deals.filter(deal => deal.stage === stage).length,
      value: data.deals.filter(deal => deal.stage === stage).reduce((sum, deal) => sum + deal.value, 0)
    }))
  }

  const getRecentActivities = () => {
    return data.activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
  }

  const getUpcomingTasks = () => {
    return data.tasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  }

  const metrics = getMetrics()
  const dealsByStage = getDealsByStage()
  const recentActivities = getRecentActivities()
  const upcomingTasks = getUpcomingTasks()

  const MetricCard = ({ title, value, icon, color, change }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <ApperIcon name="TrendingUp" className="w-4 h-4 text-success mr-1" />
                <span className="text-sm text-success">{change}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
            <ApperIcon name={icon} className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Contacts"
          value={metrics.totalContacts}
          icon="Users"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          change="+12% from last month"
        />
        <MetricCard
          title="Active Deals"
          value={metrics.totalDeals}
          icon="Target"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          change="+8% from last month"
        />
        <MetricCard
          title="Deal Value"
          value={formatCurrency(metrics.totalDealValue)}
          icon="DollarSign"
          color="bg-gradient-to-br from-green-500 to-green-600"
          change="+15% from last month"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon="TrendingUp"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          change="+2.3% from last month"
        />
      </div>

      {/* Sales Pipeline */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-text-primary">Sales Pipeline</h2>
          <Badge variant="info">{metrics.totalDeals} deals</Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dealsByStage.map((stage) => (
            <div key={stage.stage} className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-2">
                <p className="text-2xl font-bold text-text-primary">{stage.count}</p>
                <p className="text-sm text-text-secondary capitalize">{stage.stage.replace('-', ' ')}</p>
              </div>
              <p className="text-xs text-text-secondary">
                {formatCurrency(stage.value)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-text-primary">Recent Activities</h2>
            <ApperIcon name="Activity" className="w-5 h-5 text-text-secondary" />
          </div>
          
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-center text-text-secondary py-8">No recent activities</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.Id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{activity.description}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-text-primary">Upcoming Tasks</h2>
            <div className="flex items-center space-x-2">
              {metrics.overdueTasks > 0 && (
                <Badge variant="error">{metrics.overdueTasks} overdue</Badge>
              )}
              <Badge variant="warning">{metrics.todaysTasks} today</Badge>
            </div>
          </div>
          
          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <p className="text-center text-text-secondary py-8">No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task) => {
                const isOverdue = new Date(task.dueDate) < new Date()
                const isToday = new Date(task.dueDate).toDateString() === new Date().toDateString()
                
                return (
                  <div key={task.Id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                    <div className={`w-3 h-3 rounded-full ${
                      isOverdue ? 'bg-error' : isToday ? 'bg-warning' : 'bg-success'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
                      <p className="text-xs text-text-secondary">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}>
                      {task.priority}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard