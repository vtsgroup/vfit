// ============================================
// index.ts — Barrel export do Design System v2
// ============================================
//
// O que faz:
//   Re-exporta todos os componentes base do DS v2.
//   Única fonte de importação para componentes UI: import { X } from '@/components/ui'.
//   Nunca importar diretamente de subpaths como '@/components/ui/button'.
//
// Exports principais:
//   Todos os componentes DS v2: Button, DSIcon, PageHeader, FilterPills,
//   ProgressBarDS, EmptyStateDS, UserSearch, StatsCard, SlidingTabs,
//   ActionIconButton e demais.
//
// v7 Consolidation (S17):
//   - Removed 9 unused components (ActionButton3D, ActionCard3D, MD3Card*, ToolCard, etc.)
//   - See individual files for @deprecated notes
/**
 * src/components/ui/index.ts
 *
 * Index — Design System UI
 * Features: DSIcon
 */

export { Button, type ButtonProps } from './button'
export { Input, type InputProps } from './input'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
export { Badge, type BadgeProps } from './badge'
export { Avatar } from './avatar'
export { AvatarWithPlanBadge } from './avatar-plan-badge'
export { Spinner, PageLoader, Skeleton } from './spinner'
export { EmptyState } from './empty-state'
export { EmptyStateDS, type EmptyStateDSProps } from './empty-state-ds'
export { PageHeader, type PageHeaderProps } from './page-header'
export { CommandPalette } from './command-palette'
export { StyledSelect } from './styled-select'
// @deprecated — ActionButton3D, ActionCard3D: use <Button variant="primary"> instead
// export { ActionButton3D, ActionCard3D, PERSONAL_ACTIONS } from './action-button-3d'
export { ActionIconButton, type ActionIconButtonProps } from './action-icon-button'
export { AIBotFab, AiBotIcon } from './ai-bot-fab'
export { DSIcon, type DSIconName, type DSIconProps, DS_ICON_NAMES } from './ds-icon'
export { StatsCard, type StatsCardProps } from './stats-card'
// @deprecated — ToolCard: use <Card> or <GlassCard> instead
// export { ToolCard, type ToolCardProps } from './tool-card'
// @deprecated — ActionButtons: no real-page usage
// export { ActionButtons, type ActionButtonsProps } from './action-buttons'
// @deprecated — NotificationCard: use <Alert> instead
// export { NotificationCard, type NotificationCardProps } from './notification-card'
// @deprecated — CustomSelect3D: use <StyledSelect> instead
// export { CustomSelect3D, type CustomSelect3DProps } from './custom-select-3d'
export { SlidingTabs, type SlidingTabsProps } from './sliding-tabs'
export { ProgressBarDS, type ProgressBarDSProps } from './progress-bar-ds'
export { ProgressBar, type ProgressBarProps } from './progress-bar'
export { FilterPills, type FilterPillsProps, type FilterPillOption } from './filter-pills'
export { UserSearch, type UserSearchProps } from './user-search'
export { GlassCard, CardHeader as GlassCardHeader, CardContent as GlassCardContent, CardFooter as GlassCardFooter, StatsCard as GlassStatsCard, FeatureCard as GlassFeatureCard } from './glass-card'
export { Stagger, StaggerItem } from './stagger'
export { StaggeredList, StaggeredItem } from './staggered-list'
export { MD3Tabs, MD3TabPanel } from './md3-tabs'
export { LinearProgress, CircularProgress, StepProgress } from './md3-progress'
export { Pagination, type PaginationProps } from './pagination'
// @deprecated — MD3Card system: use <Card> from './card' instead (50+ usages vs 0)
// export { MD3Card, MD3CardHeader, MD3CardTitle, MD3CardLabel, MD3CardContent, MD3CardFooter } from './md3-card'
// @deprecated — MD3Badge/MD3Chip/MD3Status: use <Badge> instead
// export { MD3Badge, MD3Chip, MD3Status } from './md3-badge'
export { MD3Select } from './md3-select'
export { MD3Input, MD3TextArea, MD3SearchBar } from './md3-input'
export { Modal } from './modal'
export { ConfirmDialog, type ConfirmDialogProps } from './confirm-dialog'
export { Tooltip, type TooltipProps } from './tooltip'
export { Toggle, type ToggleProps } from './toggle'
export { Checkbox, type CheckboxProps } from './checkbox'
export { RadioGroup, RadioItem } from './radio-group'
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'
export { Alert, type AlertProps } from './alert'
export { Divider } from './divider'
export { AvatarGroup } from './avatar-group'
export {
	SkeletonCard,
	SkeletonStatsGrid,
	SkeletonTable,
	SkeletonList,
	SkeletonChart,
	SkeletonProfile,
	SkeletonPage,
	SkeletonForm,
	Shimmer,
} from './skeleton'
export { DateRangePicker, type DateRange } from './date-range-picker'
export { SmartAppBanner } from './smart-app-banner'
