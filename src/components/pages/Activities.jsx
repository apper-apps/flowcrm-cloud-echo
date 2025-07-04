import React, { useState, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
import SearchBar from '@/components/molecules/SearchBar'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ActivityTimeline from '@/components/molecules/ActivityTimeline'
import { activitiesService } from '@/services/api/activitiesService'
import { contactsService } from '@/services/api/contactsService'

const Activities = () => {
  const [activities, setActivities] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [activitiesData, contactsData] = await Promise.all([
        activitiesService.getAll(),
        contactsService.getAll()
      ])
      setActivities(activitiesData)
      setContacts(contactsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? contact.name : 'Unknown Contact'
  }

  const getActivityStats = () => {
    const total = activities.length
    const thisWeek = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp)
      const weekStart = startOfWeek(new Date())
      const weekEnd = endOfWeek(new Date())
      return isWithinInterval(activityDate, { start: weekStart, end: weekEnd })
    }).length
    
    const byType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {})

    return { total, thisWeek, byType }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getContactName(activity.contactId).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.timestamp)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          matchesDate = activityDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekStart = startOfWeek(now)
          const weekEnd = endOfWeek(now)
          matchesDate = isWithinInterval(activityDate, { start: weekStart, end: weekEnd })
          break
        case 'month':
          matchesDate = activityDate.getMonth() === now.getMonth() && 
                       activityDate.getFullYear() === now.getFullYear()
          break
        default:
          matchesDate = true
      }
    }
    
    return matchesSearch && matchesType && matchesDate
  })

  const sortedActivities = filteredActivities.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return 'Phone'
      case 'email':
        return 'Mail'
      case 'meeting':
        return 'Calendar'
      case 'note':
        return 'FileText'
      case 'task':
        return 'CheckSquare'
      default:
        return 'Activity'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'call':
        return 'info'
      case 'email':
        return 'secondary'
      case 'meeting':
        return 'success'
      case 'note':
        return 'default'
      case 'task':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (loading) {
    return <Loading type="table" />
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />
  }

  const stats = getActivityStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Activities</h1>
          <p className="text-text-secondary">Track all customer interactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-sm text-text-secondary">Total Activities</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{stats.thisWeek}</p>
            <p className="text-sm text-text-secondary">This Week</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-info">{stats.byType.call || 0}</p>
            <p className="text-sm text-text-secondary">Calls</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{stats.byType.meeting || 0}</p>
            <p className="text-sm text-text-secondary">Meetings</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activities..."
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex space-x-2">
              {['all', 'call', 'email', 'meeting', 'note', 'task'].map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className="capitalize"
                >
                  {type === 'all' ? 'All Types' : type}
                </Button>
              ))}
            </div>
            <div className="flex space-x-2">
              {['all', 'today', 'week', 'month'].map((date) => (
                <Button
                  key={date}
                  variant={dateFilter === date ? 'accent' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter(date)}
                  className="capitalize"
                >
                  {date === 'all' ? 'All Time' : 
                   date === 'week' ? 'This Week' :
                   date === 'month' ? 'This Month' : date}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Activities List */}
      {sortedActivities.length === 0 ? (
        <Empty
          type="activities"
          title={searchTerm || typeFilter !== 'all' || dateFilter !== 'all' ? 'No activities found' : undefined}
          description={searchTerm || typeFilter !== 'all' || dateFilter !== 'all' ? 'Try adjusting your search or filters' : undefined}
          actionText={searchTerm || typeFilter !== 'all' || dateFilter !== 'all' ? 'Clear Filters' : undefined}
          onAction={() => {
            setSearchTerm('')
            setTypeFilter('all')
            setDateFilter('all')
          }}
        />
      ) : (
        <Card className="p-6">
          <div className="space-y-6">
            {sortedActivities.map((activity) => (
              <div key={activity.Id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'call' ? 'bg-blue-100' :
                  activity.type === 'email' ? 'bg-purple-100' :
                  activity.type === 'meeting' ? 'bg-green-100' :
                  activity.type === 'note' ? 'bg-gray-100' :
                  activity.type === 'task' ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  <ApperIcon 
                    name={getActivityIcon(activity.type)} 
                    className={`w-5 h-5 ${
                      activity.type === 'call' ? 'text-blue-600' :
                      activity.type === 'email' ? 'text-purple-600' :
                      activity.type === 'meeting' ? 'text-green-600' :
                      activity.type === 'note' ? 'text-gray-600' :
                      activity.type === 'task' ? 'text-orange-600' : 'text-gray-600'
                    }`} 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-text-secondary">
                          {getContactName(activity.contactId)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {format(new Date(activity.timestamp), 'MMM d, yyyy - h:mm a')}
                        </p>
                      </div>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-text-secondary">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <span className="font-medium capitalize">{key}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Badge variant={getActivityColor(activity.type)} className="ml-4">
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Activities