import type { SvgIconComponent } from '@mui/icons-material'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import DiamondOutlined from '@mui/icons-material/DiamondOutlined'
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined'
import UpcomingOutlined from '@mui/icons-material/UpcomingOutlined'
import type { NavKey } from '../types'
import { BespokeIcon } from './icons'

export interface NavItem {
  key: NavKey
  label: string
  subtitle: string
  icon: SvgIconComponent
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', subtitle: 'A refined overview of Amour Estilo.', icon: DashboardOutlined },
  { key: 'bookings', label: 'Bookings', subtitle: 'Every booking across the studio.', icon: CalendarMonthOutlined },
  { key: 'bespoke', label: 'Bespoke Booking', subtitle: 'Tailored appointments and fittings.', icon: BespokeIcon },
  { key: 'prive-applications', label: 'Privé Applications', subtitle: 'Membership requests awaiting review.', icon: DescriptionOutlined },
  { key: 'prive-members', label: 'Privé Members', subtitle: 'Your private membership roster.', icon: DiamondOutlined },
  { key: 'upcoming', label: 'Upcoming Bookings', subtitle: 'Confirmed appointments ahead.', icon: UpcomingOutlined },
  { key: 'completed', label: 'Completed Bookings', subtitle: 'Past appointments and their payments.', icon: TaskAltOutlined },
]
