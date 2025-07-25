import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatDate = (date: string | Date) => {
  return dayjs(date).format('MMM D, YYYY')
}

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow()
}

export const formatDuration = (startDate: string | Date, endDate?: string | Date) => {
  const start = dayjs(startDate)
  const end = endDate ? dayjs(endDate) : dayjs()
  const diff = end.diff(start, 'second')
  
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}