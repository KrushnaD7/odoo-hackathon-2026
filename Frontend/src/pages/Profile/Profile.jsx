import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { employeeService } from '../../services/employeeService'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useToast } from '../../components/ui/use-toast'
import { User, Briefcase, DollarSign, FileText, Edit, Save, X } from 'lucide-react'
import { getInitials } from '../../utils/formatters'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await employeeService.getProfile(user.id)
      return response.data
    },
    enabled: !!user?.id,
  })

  const updateMutation = useMutation({
    mutationFn: (data) => employeeService.updateProfile(user.id, data),
    onSuccess: (response) => {
      updateUser(response.data)
      queryClient.invalidateQueries(['profile', user.id])
      setIsEditing(false)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error?.message || 'Failed to update profile',
        variant: 'destructive',
      })
    },
  })

  const handleEdit = () => {
    setEditData({
      phone: profileData?.phone || '',
      address: profileData?.address || '',
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    updateMutation.mutate(editData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
              {getInitials(profileData?.first_name, profileData?.last_name)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                {profileData?.first_name} {profileData?.last_name}
              </h2>
              <p className="text-muted-foreground mt-1">{profileData?.job_title}</p>
              <p className="text-sm text-muted-foreground">{profileData?.department}</p>
              <div className="mt-3 flex items-center justify-center md:justify-start gap-2">
                <Badge variant="secondary">{profileData?.employee_id}</Badge>
                <Badge variant="outline" className="capitalize">{profileData?.role}</Badge>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="mr-2" size={16} />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">
            <User className="mr-2" size={16} />
            Personal
          </TabsTrigger>
          <TabsTrigger value="job">
            <Briefcase className="mr-2" size={16} />
            Job Details
          </TabsTrigger>
          <TabsTrigger value="salary">
            <DollarSign className="mr-2" size={16} />
            Salary
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2" size={16} />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={profileData?.first_name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={profileData?.last_name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={profileData?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                      <Save className="mr-2" size={16} />
                      Save Changes
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="mr-2" size={16} />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">First Name</Label>
                    <p className="font-medium text-foreground">{profileData?.first_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Name</Label>
                    <p className="font-medium text-foreground">{profileData?.last_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium text-foreground">{profileData?.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium text-foreground">{profileData?.phone || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="font-medium text-foreground">{profileData?.address || '-'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Job Title</Label>
                  <p className="font-medium text-foreground">{profileData?.job_title || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium text-foreground">{profileData?.department || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Employee ID</Label>
                  <p className="font-medium text-foreground">{profileData?.employee_id || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={profileData?.status === 'active' ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}>
                    {profileData?.status || '-'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Salary information is read-only for employees.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View your documents in the Documents section.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

