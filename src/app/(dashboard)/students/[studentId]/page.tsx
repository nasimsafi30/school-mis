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
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Printer,
  Download,
  Home,
  Award,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

interface StudentDetailPageProps {
  params: {
    studentId: string
  }
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch student with all relations
  const student = await db.query.students.findFirst({
    where: (students: any, { eq }: any) => eq(students.id, params.studentId),
    with: {
      class: true,
      section: true,
      parent: true,
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
      attendance: {
        orderBy: (attendance: any, { desc }: any) => [desc(attendance.date)],
        limit: 30,
      },
      results: {
        with: {
          exam: {
            with: {
              subject: true,
            },
          },
          subject: true,
        },
        orderBy: (results: any, { desc }: any) => [desc(results.createdAt)],
        limit: 20,
      },
      fees: {
        orderBy: (fees: any, { desc }: any) => [desc(fees.createdAt)],
      },
    },
  })

  if (!student) {
    notFound()
  }

  // Calculate attendance statistics
  const attendanceStats = {
    total: student.attendance?.length || 0,
    present: student.attendance?.filter((a: any) => a.status === 'present').length || 0,
    absent: student.attendance?.filter((a: any) => a.status === 'absent').length || 0,
    late: student.attendance?.filter((a: any) => a.status === 'late').length || 0,
    halfDay: student.attendance?.filter((a: any) => a.status === 'half_day').length || 0,
    percentage: (student.attendance?.length || 0) > 0
      ? (((student.attendance?.filter((a: any) => a.status === 'present' || a.status === 'late').length || 0) / (student.attendance?.length || 1)) * 100).toFixed(1)
      : '0',
  }

  // Calculate fee statistics
  const feeStats = {
    totalAmount: student.fees?.reduce((sum: number, f: any) => sum + Number(f.amount), 0) || 0,
    totalPaid: student.fees?.reduce((sum: number, f: any) => sum + Number(f.paidAmount), 0) || 0,
    totalPending: student.fees
      ?.filter((f: any) => f.status !== 'paid')
      .reduce((sum: number, f: any) => sum + (Number(f.amount) - Number(f.paidAmount)), 0) || 0,
    paidCount: student.fees?.filter((f: any) => f.status === 'paid').length || 0,
    pendingCount: student.fees?.filter((f: any) => f.status !== 'paid').length || 0,
    overdueCount: student.fees?.filter((f: any) => f.status === 'overdue').length || 0,
    collectionRate: (student.fees?.length || 0) > 0
      ? (((student.fees?.reduce((sum: number, f: any) => sum + Number(f.paidAmount), 0) || 0) / (student.fees?.reduce((sum: number, f: any) => sum + Number(f.amount), 0) || 1)) * 100).toFixed(1)
      : '0',
  }

  // Calculate academic performance
  const examResults = (student.results || []).map((r: any) => {
    const exam = r.exam || {}
    const subject = r.subject || {}
    const totalMarks = exam.totalMarks || 100
    const passingMarks = exam.passingMarks || 40
    const marksObtained = Number(r.marksObtained)
    
    return {
      id: r.id,
      examName: exam.name || 'Unknown Exam',
      examType: exam.type || 'N/A',
      subject: subject.name || 'Unknown Subject',
      marksObtained,
      totalMarks,
      passingMarks,
      percentage: ((marksObtained / totalMarks) * 100).toFixed(1),
      grade: r.grade || 'N/A',
      remarks: r.remarks || '',
      isPassed: marksObtained >= passingMarks,
      date: r.createdAt,
    }
  })

  const academicStats = {
    totalExams: (student.results || []).length,
    passedExams: examResults.filter((r: any) => r.isPassed).length,
    failedExams: examResults.filter((r: any) => !r.isPassed).length,
    averagePercentage: (student.results || []).length > 0
      ? ((student.results || []).reduce((sum: number, r: any) => {
          const exam = r.exam || {}
          return sum + ((Number(r.marksObtained) / (exam.totalMarks || 100)) * 100)
        }, 0) / (student.results || []).length).toFixed(1)
      : '0',
    bestSubject: examResults.length > 0
      ? examResults.reduce((best: any, curr: any) => Number(curr.percentage) > Number(best.percentage) ? curr : best)
      : null,
    worstSubject: examResults.length > 0
      ? examResults.reduce((worst: any, curr: any) => Number(curr.percentage) < Number(worst.percentage) ? curr : worst)
      : null,
  }

  // Get status badge
  const getStatusBadge = (status: string | null) => {
    const s = status || 'pending'
    switch (s) {
      case 'enrolled':
        return <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'transferred':
        return <Badge className="bg-orange-100 text-orange-800">Transferred</Badge>
      case 'graduated':
        return <Badge className="bg-purple-100 text-purple-800">Graduated</Badge>
      default:
        return <Badge>{s}</Badge>
    }
  }

  // Get attendance status icon
  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'half_day':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800'
      case 'A': return 'bg-green-100 text-green-800'
      case 'B+': return 'bg-blue-100 text-blue-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      case 'F': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {student.firstName} {student.lastName}
              </h1>
              {getStatusBadge(student.admissionStatus)}
            </div>
            <p className="text-muted-foreground mt-1">
              Admission No: {student.admissionNo} | Roll No: {student.rollNo || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href={`/students/${params.studentId}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Attendance</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{attendanceStats.percentage}%</div>
            <Progress value={Number(attendanceStats.percentage)} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Academic Avg</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{academicStats.averagePercentage}%</div>
            <p className="text-xs text-green-600">
              {academicStats.passedExams}/{academicStats.totalExams} exams passed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Fee Status</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{feeStats.collectionRate}%</div>
            <p className="text-xs text-yellow-600">
              {feeStats.pendingCount > 0 
                ? `${formatCurrency(feeStats.totalPending)} pending`
                : 'All fees paid'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Exams Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{academicStats.totalExams}</div>
            <p className="text-xs text-purple-600">
              Best: {academicStats.bestSubject ? `${academicStats.bestSubject.percentage}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">
            <User className="mr-2 h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="academic">
            <GraduationCap className="mr-2 h-4 w-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="fees">
            <DollarSign className="mr-2 h-4 w-4" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="results">
            <Award className="mr-2 h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">First Name</label>
                    <p className="font-medium">{student.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last Name</label>
                    <p className="font-medium">{student.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Date of Birth</label>
                    <p className="font-medium">{formatDate(student.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Gender</label>
                    <p className="font-medium capitalize">{student.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Blood Group</label>
                    <p className="font-medium">{student.bloodGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Admission Date</label>
                    <p className="font-medium">{formatDate(student.admissionDate)}</p>
                  </div>
                </div>
                {student.medicalInfo && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <label className="text-sm text-muted-foreground">Medical Information</label>
                      <p className="text-sm mt-1">{student.medicalInfo}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p>{student.address}</p>
                        {(student.city || student.state) && (
                          <p className="text-sm text-muted-foreground">
                            {[student.city, student.state, student.country, student.pincode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {student.previousSchool && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm text-muted-foreground">Previous School</label>
                        <p className="font-medium">{student.previousSchool}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Class</label>
                    <p className="font-medium">{student.class?.name || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Section</label>
                    <p className="font-medium">{student.section?.name || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Admission No</label>
                    <p className="font-medium font-mono">{student.admissionNo}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Roll Number</label>
                    <p className="font-medium font-mono">{student.rollNo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(student.admissionStatus)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Admission Date</label>
                    <p className="font-medium">{formatDate(student.admissionDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {student.parent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Parent/Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {student.parent.fatherName && (
                      <div>
                        <label className="text-sm text-muted-foreground">Father's Name</label>
                        <p className="font-medium">{student.parent.fatherName}</p>
                      </div>
                    )}
                    {student.parent.motherName && (
                      <div>
                        <label className="text-sm text-muted-foreground">Mother's Name</label>
                        <p className="font-medium">{student.parent.motherName}</p>
                      </div>
                    )}
                    {student.parent.fatherPhone && (
                      <div>
                        <label className="text-sm text-muted-foreground">Father's Phone</label>
                        <p className="font-medium">{student.parent.fatherPhone}</p>
                      </div>
                    )}
                    {student.parent.motherPhone && (
                      <div>
                        <label className="text-sm text-muted-foreground">Mother's Phone</label>
                        <p className="font-medium">{student.parent.motherPhone}</p>
                      </div>
                    )}
                    {student.parent.fatherEmail && (
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground">Father's Email</label>
                        <p className="font-medium">{student.parent.fatherEmail}</p>
                      </div>
                    )}
                    {student.parent.motherEmail && (
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground">Mother's Email</label>
                        <p className="font-medium">{student.parent.motherEmail}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {student.user && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium">{student.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Role</label>
                      <Badge variant="outline" className="capitalize">{student.user.role}</Badge>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Status</label>
                      <Badge className={student.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {student.user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Last Login</label>
                      <p className="font-medium text-sm">
                        {student.user.lastLogin ? formatDate(student.user.lastLogin) : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{academicStats.averagePercentage}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Average Score</p>
                </div>
                <Progress value={Number(academicStats.averagePercentage)} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{academicStats.passedExams}</p>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{academicStats.failedExams}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {academicStats.bestSubject && (
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Best Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-green-900">{academicStats.bestSubject.subject}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{academicStats.bestSubject.percentage}%</p>
                  <Badge className={cn('mt-2', getGradeColor(academicStats.bestSubject.grade))}>
                    Grade: {academicStats.bestSubject.grade}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {academicStats.worstSubject && (
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800">Needs Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-red-900">{academicStats.worstSubject.subject}</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{academicStats.worstSubject.percentage}%</p>
                  <Badge className={cn('mt-2', getGradeColor(academicStats.worstSubject.grade))}>
                    Grade: {academicStats.worstSubject.grade}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                <p className="text-xs text-muted-foreground">
                  {attendanceStats.total > 0 ? ((attendanceStats.present / attendanceStats.total) * 100).toFixed(0) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                <p className="text-xs text-muted-foreground">
                  {attendanceStats.total > 0 ? ((attendanceStats.absent / attendanceStats.total) * 100).toFixed(0) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Half Day</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{attendanceStats.halfDay}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance History (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!student.attendance || student.attendance.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    student.attendance.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAttendanceIcon(record.status)}
                            <span className="capitalize">{record.status.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.reason || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(feeStats.totalAmount)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(feeStats.totalPaid)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{formatCurrency(feeStats.totalPending)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fee History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!student.fees || student.fees.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No fee records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    student.fees.map((fee: any) => {
                      const balance = Number(fee.amount) - Number(fee.paidAmount)
                      return (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">{fee.feeType}</TableCell>
                          <TableCell>{formatCurrency(Number(fee.amount))}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(Number(fee.paidAmount))}</TableCell>
                          <TableCell className={cn('font-medium', balance > 0 ? 'text-red-600' : 'text-green-600')}>
                            {formatCurrency(balance)}
                          </TableCell>
                          <TableCell>{formatDate(fee.dueDate)}</TableCell>
                          <TableCell>
                            <Badge className={
                              fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                              fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              fee.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {fee.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Examination Results</CardTitle>
              <CardDescription>Performance across all exams</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No exam results found
                      </TableCell>
                    </TableRow>
                  ) : (
                    examResults.map((result: any) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.examName}</TableCell>
                        <TableCell>{result.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {typeof result.examType === 'string' ? result.examType.replace('_', ' ') : result.examType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{result.marksObtained}</span>
                          <span className="text-muted-foreground">/{result.totalMarks}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={Number(result.percentage)} className="h-1.5 w-20" />
                            <span className="text-sm">{result.percentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                        </TableCell>
                        <TableCell>
                          {result.isPassed ? (
                            <Badge className="bg-green-100 text-green-800">Pass</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Fail</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}