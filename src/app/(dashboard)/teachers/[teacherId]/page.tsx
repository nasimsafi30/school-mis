import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Printer,
  Download,
  Building2,
  Award,
  TrendingUp,
  Star,
  Users,
  Briefcase,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { eq, desc } from 'drizzle-orm'
import { teachers, payroll, subjects, classes } from '@/lib/db/schema'

interface TeacherDetailPageProps {
  params: {
    teacherId: string
  }
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch teacher with relations
  const teacher = await db.query.teachers.findFirst({
    where: eq(teachers.id, params.teacherId),
    with: {
      department: true,
      user: {
        columns: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      },
      subjects: {
        with: {
          class: true,
        },
      },
      payroll: {
        orderBy: [desc(payroll.createdAt)],
        limit: 12,
      },
    },
  })

  if (!teacher) {
    notFound()
  }

  // Fetch class teacher info separately
  let classTeacherInfo: any = null
  if (teacher.isClassTeacher && teacher.classTeacherOf) {
    classTeacherInfo = await db.query.classes.findFirst({
      where: eq(classes.id, teacher.classTeacherOf),
      with: {
        sections: true,
      },
    })
  }

  // Calculate payroll statistics
  const payrollStats = {
    totalEarnings: (teacher.payroll || []).reduce((sum: number, p: any) => sum + Number(p.netSalary), 0),
    averageMonthly: (teacher.payroll || []).length > 0
      ? (teacher.payroll || []).reduce((sum: number, p: any) => sum + Number(p.netSalary), 0) / (teacher.payroll || []).length
      : 0,
    lastSalary: (teacher.payroll || [])[0] ? Number((teacher.payroll || [])[0].netSalary) : 0,
    totalPayrolls: (teacher.payroll || []).length,
    totalAllowances: (teacher.payroll || []).reduce((sum: number, p: any) => sum + Number(p.allowances), 0),
    totalDeductions: (teacher.payroll || []).reduce((sum: number, p: any) => sum + Number(p.deductions), 0),
    paidCount: (teacher.payroll || []).filter((p: any) => p.status === 'paid').length,
    pendingCount: (teacher.payroll || []).filter((p: any) => p.status !== 'paid').length,
  }

  // Calculate experience
  const joiningDate = new Date(teacher.joiningDate)
  const today = new Date()
  let experienceYears = today.getFullYear() - joiningDate.getFullYear()
  let experienceMonths = today.getMonth() - joiningDate.getMonth()

  if (experienceMonths < 0) {
    experienceYears--
    experienceMonths += 12
  }

  const experience = {
    years: experienceYears,
    months: experienceMonths,
    totalMonths: experienceYears * 12 + experienceMonths,
    joiningDate: teacher.joiningDate,
  }

  // Status badge
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'on_leave': return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
      case 'inactive': return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
      default: return <Badge>{status || 'Unknown'}</Badge>
    }
  }

  // Payroll status badge
  const getPayrollStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'processed': return <Badge className="bg-blue-100 text-blue-800">Processed</Badge>
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/teachers">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {teacher.firstName} {teacher.lastName}
              </h1>
              {getStatusBadge(teacher.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              Employee ID: {teacher.employeeId} | {teacher.designation || 'Teacher'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Link href={`/teachers/${params.teacherId}/edit`}>
            <Button><Edit className="mr-2 h-4 w-4" />Edit Teacher</Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Experience</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{experience.years}y {experience.months}m</div>
            <p className="text-xs text-blue-600">Since {formatDate(experience.joiningDate)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {teacher.salary ? formatCurrency(Number(teacher.salary) / 12) : 'N/A'}
            </div>
            <p className="text-xs text-green-600">
              Annual: {teacher.salary ? formatCurrency(Number(teacher.salary)) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{(teacher.subjects || []).length}</div>
            <p className="text-xs text-purple-600">Active subjects assigned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(payrollStats.totalEarnings)}</div>
            <p className="text-xs text-orange-600">{payrollStats.totalPayrolls} payrolls processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal"><User className="mr-2 h-4 w-4" />Personal</TabsTrigger>
          <TabsTrigger value="professional"><Briefcase className="mr-2 h-4 w-4" />Professional</TabsTrigger>
          <TabsTrigger value="subjects"><BookOpen className="mr-2 h-4 w-4" />Subjects</TabsTrigger>
          <TabsTrigger value="payroll"><DollarSign className="mr-2 h-4 w-4" />Payroll</TabsTrigger>
          <TabsTrigger value="account"><Activity className="mr-2 h-4 w-4" />Account</TabsTrigger>
        </TabsList>

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground">First Name</label><p className="font-medium">{teacher.firstName}</p></div>
                  <div><label className="text-sm text-muted-foreground">Last Name</label><p className="font-medium">{teacher.lastName}</p></div>
                  <div><label className="text-sm text-muted-foreground">Date of Birth</label><p className="font-medium">{formatDate(teacher.dateOfBirth)}</p></div>
                  <div><label className="text-sm text-muted-foreground">Gender</label><p className="font-medium capitalize">{teacher.gender}</p></div>
                  <div><label className="text-sm text-muted-foreground">Blood Group</label><p className="font-medium">{teacher.bloodGroup || 'N/A'}</p></div>
                  <div><label className="text-sm text-muted-foreground">Joining Date</label><p className="font-medium">{formatDate(teacher.joiningDate)}</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Contact Information</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{teacher.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{teacher.phone}</span></div>
                  {teacher.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p>{teacher.address}</p>
                        {(teacher.city || teacher.state) && (
                          <p className="text-sm text-muted-foreground">
                            {[teacher.city, teacher.state, teacher.country, teacher.pincode].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experience Card */}
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />Experience Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{experience.years}</p>
                    <p className="text-sm text-muted-foreground">Years</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{experience.months}</p>
                    <p className="text-sm text-muted-foreground">Months</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{experience.totalMonths}</p>
                    <p className="text-sm text-muted-foreground">Total Months</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{new Date().getFullYear() - new Date(teacher.joiningDate).getFullYear()}</p>
                    <p className="text-sm text-muted-foreground">Calendar Years</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Professional Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground">Employee ID</label><p className="font-medium font-mono">{teacher.employeeId}</p></div>
                  <div><label className="text-sm text-muted-foreground">Designation</label><p className="font-medium">{teacher.designation || 'N/A'}</p></div>
                  <div><label className="text-sm text-muted-foreground">Qualification</label><p className="font-medium">{teacher.qualification || 'N/A'}</p></div>
                  <div><label className="text-sm text-muted-foreground">Specialization</label><p className="font-medium">{teacher.specialization || 'N/A'}</p></div>
                  <div><label className="text-sm text-muted-foreground">Department</label><p className="font-medium">{teacher.department?.name || 'N/A'}</p></div>
                  <div><label className="text-sm text-muted-foreground">Annual Salary</label><p className="font-medium">{teacher.salary ? formatCurrency(Number(teacher.salary)) : 'N/A'}</p></div>
                  <div><label className="text-sm text-muted-foreground">Class Teacher</label><p className="font-medium">{classTeacherInfo ? classTeacherInfo.name : 'No'}</p></div>
                  <div><label className="text-sm text-muted-foreground">Status</label><div className="mt-1">{getStatusBadge(teacher.status)}</div></div>
                </div>
              </CardContent>
            </Card>

            {teacher.department && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Department Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div><label className="text-sm text-muted-foreground">Department Name</label><p className="font-medium text-lg">{teacher.department.name}</p></div>
                    <div><label className="text-sm text-muted-foreground">Department Code</label><Badge variant="outline" className="font-mono">{teacher.department.code}</Badge></div>
                    {teacher.department.description && <div><label className="text-sm text-muted-foreground">Description</label><p className="text-sm mt-1">{teacher.department.description}</p></div>}
                  </div>
                </CardContent>
              </Card>
            )}

            {classTeacherInfo && (
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Class Teacher Of</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div><label className="text-sm text-muted-foreground">Class</label><p className="font-medium text-lg">{classTeacherInfo.name}</p></div>
                    {classTeacherInfo.sections && classTeacherInfo.sections.length > 0 && (
                      <div>
                        <label className="text-sm text-muted-foreground">Sections</label>
                        <div className="flex gap-2 mt-2">
                          {classTeacherInfo.sections.map((section: any) => (
                            <Badge key={section.id} variant="secondary">Section {section.name}{section.roomNo && ` (Room ${section.roomNo})`}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Assigned Subjects ({(teacher.subjects || []).length})</CardTitle></CardHeader>
            <CardContent>
              {(teacher.subjects || []).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-lg text-muted-foreground">No subjects assigned</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead><TableHead>Subject Name</TableHead><TableHead>Class</TableHead><TableHead>Type</TableHead><TableHead>Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(teacher.subjects || []).map((subject: any) => (
                      <TableRow key={subject.id}>
                        <TableCell><Badge variant="outline" className="font-mono">{subject.code}</Badge></TableCell>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>{subject.class?.name || 'N/A'}</TableCell>
                        <TableCell><Badge variant={subject.isOptional ? 'secondary' : 'default'}>{subject.isOptional ? 'Optional' : 'Mandatory'}</Badge></TableCell>
                        <TableCell>{subject.credits || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Earnings</CardTitle><DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-900">{formatCurrency(payrollStats.totalEarnings)}</div></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Average Monthly</CardTitle><TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-900">{formatCurrency(payrollStats.averageMonthly)}</div></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Last Salary</CardTitle><DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-purple-900">{formatCurrency(payrollStats.lastSalary)}</div></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Payrolls</CardTitle><CheckCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-orange-900">{payrollStats.totalPayrolls}</div><p className="text-xs text-orange-600">{payrollStats.paidCount} paid, {payrollStats.pendingCount} pending</p></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Payroll History</CardTitle></CardHeader>
            <CardContent>
              {(teacher.payroll || []).length === 0 ? (
                <div className="text-center py-12"><DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-lg text-muted-foreground">No payroll records found</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead><TableHead>Basic Salary</TableHead><TableHead>Allowances</TableHead><TableHead>Deductions</TableHead><TableHead>Net Salary</TableHead><TableHead>Payment Date</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(teacher.payroll || []).map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.month} {record.year}</TableCell>
                        <TableCell>{formatCurrency(Number(record.basicSalary))}</TableCell>
                        <TableCell className="text-green-600">+{formatCurrency(Number(record.allowances))}</TableCell>
                        <TableCell className="text-red-600">-{formatCurrency(Number(record.deductions))}</TableCell>
                        <TableCell><span className="font-bold text-lg">{formatCurrency(Number(record.netSalary))}</span></TableCell>
                        <TableCell>{record.paymentDate ? formatDate(record.paymentDate) : 'N/A'}</TableCell>
                        <TableCell className="capitalize text-muted-foreground">{record.paymentMethod ? record.paymentMethod.replace('_', ' ') : 'N/A'}</TableCell>
                        <TableCell>{getPayrollStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          {teacher.user ? (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Account Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div><label className="text-sm text-muted-foreground">Email</label><p className="font-medium">{teacher.user.email}</p></div>
                  <div><label className="text-sm text-muted-foreground">Role</label><Badge variant="outline" className="capitalize">{teacher.user.role}</Badge></div>
                  <div><label className="text-sm text-muted-foreground">Account Status</label><Badge className={teacher.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{teacher.user.isActive ? 'Active' : 'Inactive'}</Badge></div>
                  <div><label className="text-sm text-muted-foreground">Last Login</label><p className="font-medium text-sm">{teacher.user.lastLogin ? formatDate(teacher.user.lastLogin) : 'Never'}</p></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <p className="text-lg text-muted-foreground">No user account linked</p>
                <Button className="mt-4"><User className="mr-2 h-4 w-4" />Create Account</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}