import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { 
  GraduationCap, ClipboardCheck, DollarSign, BookOpen, 
  Library, Clock, Calendar, ChevronRight 
} from 'lucide-react'

const activities = [
  {
    id: 1,
    user: 'John Admin',
    action: 'enrolled a new student',
    target: 'Sarah Johnson',
    time: new Date(Date.now() - 2 * 60 * 1000),
    type: 'enrollment',
    initials: 'JA',
    icon: GraduationCap,
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'marked attendance for',
    target: 'Grade 5 - Section A',
    time: new Date(Date.now() - 15 * 60 * 1000),
    type: 'attendance',
    initials: 'JS',
    icon: ClipboardCheck,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  {
    id: 3,
    user: 'Mike Wilson',
    action: 'collected fee from',
    target: 'Emma Brown',
    time: new Date(Date.now() - 60 * 60 * 1000),
    type: 'fee',
    initials: 'MW',
    icon: DollarSign,
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  },
  {
    id: 4,
    user: 'Admin',
    action: 'created new exam',
    target: 'Mid-Term Mathematics',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'exam',
    initials: 'AD',
    icon: BookOpen,
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  },
  {
    id: 5,
    user: 'Sarah Connor',
    action: 'issued book to',
    target: 'Tom Harris',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: 'library',
    initials: 'SC',
    icon: Library,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  },
  {
    id: 6,
    user: 'Robert Chen',
    action: 'updated timetable for',
    target: 'Grade 3 - Section B',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: 'timetable',
    initials: 'RC',
    icon: Clock,
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
  },
  {
    id: 7,
    user: 'Lisa Park',
    action: 'added new event',
    target: 'Annual Sports Day',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'event',
    initials: 'LP',
    icon: Calendar,
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  },
]

export function RecentActivity() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Latest actions across the system</p>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1">
          View All <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="h-[350px] pr-4">
        <div className="space-y-1">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div 
                key={activity.id} 
                className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
              >
                {/* Timeline & Avatar */}
                <div className="relative flex flex-col items-center">
                  <div className={`p-2 rounded-xl ${activity.iconBg} transition-transform group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1 min-h-[20px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{activity.user}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <Badge variant="outline" className={`text-xs font-medium border-0 ${activity.badgeColor}`}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {activity.action}{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">{activity.target}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {activity.initials}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(activity.time, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}