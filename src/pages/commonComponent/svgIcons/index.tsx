import { AccessibilityIcon, ActivityIcon, ArchiveIcon, BellIcon, BookOpenIcon, CalendarIcon, CameraIcon, CheckIcon, CircleHelpIcon, CloudIcon, CodeIcon, CompassIcon, DownloadIcon, EyeIcon, FileIcon, FlameIcon, FolderIcon, HeartIcon, HomeIcon, ImageIcon, InfoIcon, LightbulbIcon, LockIcon, MailIcon, MapIcon, MessageCircleIcon, MusicIcon, SearchIcon, SettingsIcon, StarIcon, UserIcon, VideoIcon, WifiIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const iconList = [
  AccessibilityIcon,
  ActivityIcon,
  ArchiveIcon,
  BellIcon,
  BookOpenIcon,
  CalendarIcon,
  CameraIcon,
  CheckIcon,
  CircleHelpIcon,
  CloudIcon,
  CodeIcon,
  CompassIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  FlameIcon,
  FolderIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  InfoIcon,
  LightbulbIcon,
  LockIcon,
  MailIcon,
  MapIcon,
  MessageCircleIcon,
  MusicIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  UserIcon,
  VideoIcon,
  WifiIcon,
]

export default function SvgIconsPage() {
  const { t } = useTranslation('menu')

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('svgIcons')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {iconList.map(Icon => (
            <div key={Icon.displayName} className="flex flex-col items-center gap-2 rounded-md border p-4 text-muted-foreground">
              <Icon aria-hidden="true" />
              <span className="text-xs">{Icon.displayName?.replace(/Icon$/, '')}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
