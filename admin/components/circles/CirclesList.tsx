'use client'

import { useState, useEffect } from 'react'
import { 
  UsersIcon,
  CalendarIcon,
  DocumentIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PhotoIcon,
  CloudIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { adminService, Circle } from '../../services/adminService'
import { Card, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table'
import { Modal } from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'

interface FamiliesListProps {
  onCircleClick?: (CircleId: string) => void
}

export function FamiliesList({ onCircleClick }: FamiliesListProps) {
  const [families, setFamilies] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null)
  const [showCircleDetail, setShowCircleDetail] = useState(false)

  useEffect(() => {
    loadFamilies()
  }, [])

  const loadFamilies = async () => {
    try {
      setLoading(true)
      const data = await adminService.getFamilies()
      setFamilies(data)
    } catch (error) {
      console.error('Error loading families:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFamilies = families.filter(Circle => {
    const matchesSearch = Circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (Circle.description && Circle.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (Circle.owner?.first_name && Circle.owner.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (Circle.owner?.last_name && Circle.owner.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && Circle.is_active) ||
                          (filterStatus === 'inactive' && !Circle.is_active)
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'yellow'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Circle': return <UserGroupIcon className="w-5 h-5" />
      case 'friends': return <UsersIcon className="w-5 h-5" />
      case 'sharehouse': return <HomeIcon className="w-5 h-5" />
      default: return <QuestionMarkCircleIcon className="w-5 h-5" />
    }
  }

  const handleCircleClick = (Circle: Circle) => {
    if (onCircleClick) {
      onCircleClick(Circle.id)
    } else {
      setSelectedCircle(Circle)
      setShowCircleDetail(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading families">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card variant="frosted">
        <CardBody>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Families Management</h2>
              <p className="text-sm text-gray-500">Manage and monitor all families in the system</p>
            </div>
            <Button variant="primary" onClick={() => {}}>
              <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Circle
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="frosted" hoverable>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Families</p>
                <p className="text-3xl font-bold text-gray-900">{families.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="frosted" hoverable>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {families.filter(f => f.is_active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="frosted" hoverable>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Members</p>
                <p className="text-3xl font-bold text-blue-600">
                  {families.reduce((sum, f) => sum + f.member_count, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="frosted" hoverable>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Inactive</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {families.filter(f => !f.is_active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="frosted">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search"
              type="text"
              placeholder="Search families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
            <div className="flex items-end">
              <Button variant="secondary" className="w-full">
                <FunnelIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Families Table */}
      {filteredFamilies.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-8 w-8" />}
          title="No families found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead>Circle</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFamilies.map((Circle) => (
              <TableRow key={Circle.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {Circle.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{Circle.name}</div>
                      <div className="text-sm text-gray-500 truncate">{Circle.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {Circle.owner ? `${Circle.owner.first_name} ${Circle.owner.last_name}` : 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">{Circle.owner?.email || 'No email'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span className="font-semibold text-gray-900">{Circle.member_count}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={Circle.is_active ? 'success' : 'warning'}>
                    {Circle.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">{getTypeIcon(Circle.type)}</span>
                    <span className="text-sm font-medium text-gray-700 capitalize">{Circle.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {new Date(Circle.updated_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCircleClick(Circle)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      aria-label="View Circle"
                    >
                      <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      aria-label="Edit Circle"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      aria-label="Delete Circle"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Circle Detail Modal */}
      <Modal
        isOpen={showCircleDetail}
        onClose={() => setShowCircleDetail(false)}
        title={selectedCircle?.name}
        size="xl"
      >
        {selectedCircle && (
          <div className="space-y-6">
            <div className="text-sm text-gray-500">Circle ID: {selectedCircle.id}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="default">
                <CardBody>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <p className="text-gray-600">{selectedCircle.description || 'No description provided'}</p>
                </CardBody>
              </Card>
              <Card variant="default">
                <CardBody>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <Badge variant={selectedCircle.is_active ? 'success' : 'warning'}>
                    {selectedCircle.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </CardBody>
              </Card>
              <Card variant="default">
                <CardBody>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Owner</label>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {selectedCircle.owner ? `${selectedCircle.owner.first_name} ${selectedCircle.owner.last_name}` : 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">{selectedCircle.owner?.email || 'No email'}</div>
                  </div>
                </CardBody>
              </Card>
              <Card variant="default">
                <CardBody>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Member Count</label>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    <span className="font-semibold text-gray-900 text-lg">{selectedCircle.member_count}</span>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card variant="default">
              <CardBody>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Circle Type</label>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{getTypeIcon(selectedCircle.type)}</span>
                  <span className="text-lg font-medium text-gray-700 capitalize">{selectedCircle.type}</span>
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50">
              <Button variant="secondary" onClick={() => setShowCircleDetail(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  console.log('Navigate to Circle:', selectedCircle.id)
                  setShowCircleDetail(false)
                }}
              >
                View Circle Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

