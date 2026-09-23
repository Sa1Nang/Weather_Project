import {
  CloudLightning,
  CloudRain,
  Flame,
  Sun,
  Tornado,
  Waves,
  Wind,
} from 'lucide-react'
import type { WarningCategory } from '@/types/alerts'
import { cn } from '@/utils/cn'

const CATEGORY_META: Record<
  WarningCategory,
  { label: string; Icon: typeof Wind }
> = {
  thunderstorm: { label: 'Thunderstorm', Icon: CloudLightning },
  'heavy-rain': { label: 'Heavy rain', Icon: CloudRain },
  'strong-wind': { label: 'Strong wind', Icon: Wind },
  'extreme-heat': { label: 'Extreme heat', Icon: Flame },
  'high-uv': { label: 'High UV', Icon: Sun },
  flooding: { label: 'Flooding', Icon: Waves },
  typhoon: { label: 'Typhoon', Icon: Tornado },
}

export function categoryLabel(category: WarningCategory): string {
  return CATEGORY_META[category].label
}

export function CategoryIcon({
  category,
  className,
  decorative,
}: {
  category: WarningCategory
  className?: string
  /** Set when the parent button already names the category. */
  decorative?: boolean
}) {
  const { Icon, label } = CATEGORY_META[category]
  if (decorative) {
    return <Icon aria-hidden="true" className={cn('h-5 w-5', className)} />
  }
  return <Icon aria-label={label} role="img" className={cn('h-5 w-5', className)} />
}
