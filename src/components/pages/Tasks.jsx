import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { format, isToday, isPast, isTomorrow } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
import SearchBar from '@/components/molecules/SearchBar'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import TaskForm from '@/components/organisms/TaskForm'
import { tasksService } from '@/services/api/tasksService'
import { contactsService } from '@/services/api/contactsService'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [tasksData, contactsData] = await Promise.all([
        tasksService.getAll(),
        contactsService.getAll()
      ])
      setTasks(tasksData)
      setContacts(contactsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId)
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      
      await tasksService.update(taskId, { status: newStatus })
      setTasks(tasks.map(t => 
        t.Id === taskId ? { ...t, status: newStatus } : t
      ))
      
      toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'reopened'}!`)
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksService.delete(taskId)
        setTasks(tasks.filter(task => task.Id !== taskId))
        toast.success('Task deleted successfully!')
      } catch (error) {
        console.error('Error deleting task:', error)
        toast.error('Failed to delete task')
      }
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const handleFormSave = () => {
    loadData()
  }

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? contact.name : null
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'completed').length
    const overdue = tasks.filter(task => 
      task.status !== 'completed' && isPast(new Date(task.dueDate))
    ).length
    const today = tasks.filter(task => 
      task.status !== 'completed' && isToday(new Date(task.dueDate))
    ).length
    const tomorrow = tasks.filter(task => 
      task.status !== 'completed' && isTomorrow(new Date(task.dueDate))
    ).length

    return { total, completed, overdue, today, tomorrow }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Sort by completion status first (incomplete first)
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1
    
    // Then sort by due date
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in-progress':
        return 'warning'
      case 'pending':
        return 'default'
      default:
        return 'default'
    }
  }

  const getTaskDueStatus = (dueDate, status) => {
    if (status === 'completed') return null
    
    const date = new Date(dueDate)
    if (isPast(date)) return 'overdue'
    if (isToday(date)) return 'today'
    if (isTomorrow(date)) return 'tomorrow'
    return 'upcoming'
  }

  if (loading) {
    return <Loading type="table" />
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />
  }

  const stats = getTaskStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Tasks</h1>
          <p className="text-text-secondary">Stay organized and on track</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-sm text-text-secondary">Total Tasks</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
            <p className="text-sm text-text-secondary">Completed</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-error">{stats.overdue}</p>
            <p className="text-sm text-text-secondary">Overdue</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{stats.today}</p>
            <p className="text-sm text-text-secondary">Due Today</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-info">{stats.tomorrow}</p>
            <p className="text-sm text-text-secondary">Due Tomorrow</p>
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
              placeholder="Search tasks..."
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex space-x-2">
              {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Status' : status.replace('-', ' ')}
                </Button>
              ))}
            </div>
            <div className="flex space-x-2">
              {['all', 'high', 'medium', 'low'].map((priority) => (
                <Button
                  key={priority}
                  variant={priorityFilter === priority ? 'accent' : 'outline'}
                  size="sm"
                  onClick={() => setPriorityFilter(priority)}
                  className="capitalize"
                >
                  {priority === 'all' ? 'All Priority' : priority}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
        <Empty
          type="tasks"
          onAction={() => setShowForm(true)}
          title={searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No tasks found' : undefined}
          description={searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Try adjusting your search or filters' : undefined}
          actionText={searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Clear Filters' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const contactName = getContactName(task.contactId)
            const dueStatus = getTaskDueStatus(task.dueDate, task.status)
            
            return (
              <Card key={task.Id} className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handleToggleComplete(task.Id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 ${
                      task.status === 'completed'
                        ? 'bg-success border-success'
                        : 'border-gray-300 hover:border-success'
                    }`}
                  >
                    {task.status === 'completed' && (
                      <ApperIcon name="Check" className="w-3 h-3 text-white" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          task.status === 'completed' 
                            ? 'text-text-secondary line-through' 
                            : 'text-text-primary'
                        }`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm text-text-secondary">
                            <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </div>
                          {contactName && (
                            <div className="flex items-center text-sm text-text-secondary">
                              <ApperIcon name="User" className="w-4 h-4 mr-1" />
                              {contactName}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        {dueStatus && (
                          <Badge variant={
                            dueStatus === 'overdue' ? 'error' :
                            dueStatus === 'today' ? 'warning' :
                            dueStatus === 'tomorrow' ? 'info' : 'default'
                          }>
                            {dueStatus}
                          </Badge>
                        )}
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                            className="text-primary hover:text-primary"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.Id)}
                            className="text-error hover:text-error"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showForm}
        onClose={handleFormClose}
        task={editingTask}
        onSave={handleFormSave}
      />
    </div>
  )
}

export default Tasks