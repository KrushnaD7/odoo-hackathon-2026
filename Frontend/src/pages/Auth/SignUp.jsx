import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../components/ui/use-toast'
import { UserPlus, Mail, Lock, User, Briefcase } from 'lucide-react'

const signUpSchema = z.object({
  employee_id: z.string().min(3, 'Employee ID must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['employee', 'hr', 'admin']).default('employee'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
})

export default function SignUp() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'employee',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await signup(data)
    setLoading(false)

    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Please sign in to continue.',
        variant: 'success',
      })
      navigate('/signin')
    } else {
      toast({
        title: 'Sign up failed',
        description: result.error || 'Failed to create account',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 bg-background items-center justify-center p-12 border-r border-border">
        <div className="text-foreground text-center max-w-md">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Join Dayflow</h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Start your journey with us today.
          </p>
          <p className="text-lg text-muted-foreground">
            Create your account and get access to all HR features.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <Card className="w-full max-w-2xl shadow-lg my-8 border-border">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <UserPlus className="text-primary-foreground" size={32} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign up to get started with Dayflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id" className="text-foreground">Employee ID *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      id="employee_id"
                      placeholder="EMP001"
                      className="pl-10 bg-input text-foreground border-border"
                      {...register('employee_id')}
                    />
                  </div>
                  {errors.employee_id && (
                    <p className="text-sm text-destructive">{errors.employee_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-input text-foreground border-border"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-input text-foreground border-border"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">Role</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-border bg-input text-foreground px-3 py-2 text-sm"
                    {...register('role')}
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-foreground">First Name *</Label>
                  <Input
                    id="first_name"
                    placeholder="John"
                    className="bg-input text-foreground border-border"
                    {...register('first_name')}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-foreground">Last Name *</Label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    className="bg-input text-foreground border-border"
                    {...register('last_name')}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    className="bg-input text-foreground border-border"
                    {...register('phone')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title" className="text-foreground">Job Title</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      id="job_title"
                      placeholder="Software Engineer"
                      className="pl-10 bg-input text-foreground border-border"
                      {...register('job_title')}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="department" className="text-foreground">Department</Label>
                  <Input
                    id="department"
                    placeholder="IT"
                    className="bg-input text-foreground border-border"
                    {...register('department')}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/signin" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

