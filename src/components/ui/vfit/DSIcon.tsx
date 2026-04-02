// ============================================
// VFIT Icon Component (Design System Icon wrapper)
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { viftColors } from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

type IconName =
  | 'dumbbell'
  | 'apple'
  | 'chart-bar'
  | 'brain'
  | 'user'
  | 'checkmark'
  | 'close'
  | 'alert-triangle'
  | 'loader'
  | 'arrow-left'
  | 'arrow-right'
  | 'heart'
  | 'home'
  | 'settings'
  | 'search'
  | 'menu'
  | 'more-vertical';

type IconColor = keyof typeof viftColors;

interface DSIconProps {
  /** Icon name from design system */
  name: IconName;
  /** Icon size in pixels (default: 24) */
  size?: number;
  /** Icon color token or custom color */
  color?: IconColor | string;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

// ============================================
// Icon SVG Data (minimal, placeholder-friendly)
// In production, integrate with Lucide React / Heroicons
// ============================================

/**
 * SVG icon map
 * Each icon is a simple SVG string for demonstration
 * Replace with proper icon library (Lucide, Heroicons) in production
 */
const ICONS: Record<IconName, string> = {
  dumbbell: '<path d="M6 1h2v6h12V1h2v6h2v2h-2v6h2v2h-2v6h-2v-6H8v6H6v-6H4v-2h2V9H4V7h2V1z" />',
  apple: '<path d="M7 2c-1 0-2 1-2 2v12c0 1 1 2 2 2h6c1 0 2-1 2-2V4c0-1-1-2-2-2H7zm3 1c.5 0 1 .5 1 1s-.5 1-1 1-1-.5-1-1 .5-1 1-1z" />',
  'chart-bar': '<rect x="2" y="7" width="3" height="7"/><rect x="7" y="3" width="3" height="11"/><rect x="12" y="5" width="3" height="9"/>',
  brain: '<path d="M6 2C4.9 2 4 2.9 4 4v6c0 1.1.9 2 2 2h1v2H4v2h6v-2H8v-2h1c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-2m2 0c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2" />',
  user: '<circle cx="8" cy="4" r="2"/><path d="M8 8c-2.2 0-4 1.8-4 4v2h8v-2c0-2.2-1.8-4-4-4z" />',
  checkmark: '<path d="M2 8l4 4 8-8" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />',
  close: '<path d="M2 2l12 12M14 2L2 14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" />',
  'alert-triangle': '<path d="M8 1l7 12H1L8 1zm0 9v2m0-4v2" stroke="currentColor" fill="none" strokeWidth="2" />',
  loader: '<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="9.42 37.7" />',
  'arrow-left': '<path d="M12 2L4 8l8 6" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />',
  'arrow-right': '<path d="M4 2l8 6-8 6" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />',
  heart: '<path d="M8 14s-1-1-3-3-3-3-3-5c0-2 1-3 2.5-3 1 0 1.8.5 2.5 1.5.7-1 1.5-1.5 2.5-1.5 1.5 0 2.5 1 2.5 3 0 2-1 3-3 5s-3 3-3 3z" fill="currentColor" />',
  home: '<path d="M2 10V4l6-3 6 3v6h-2v4h-8v-4H2z" fill="currentColor" />',
  settings: '<circle cx="8" cy="8" r="2" fill="currentColor"/><path d="M8 1v2m0 10v2M3 8H1m12 0h-2M3.5 3.5l-1.4-1.4M11.9 11.9l-1.4-1.4M3.5 12.5l-1.4 1.4M11.9 4.1l-1.4 1.4" stroke="currentColor" strokeWidth="2" fill="none" />',
  search: '<circle cx="7" cy="7" r="5" stroke="currentColor" fill="none" strokeWidth="2"/><line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />',
  menu: '<line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="2"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2"/><line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2"/>',
  'more-vertical': '<circle cx="8" cy="4" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/>',
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================
// Component
// ============================================

export function DSIcon({
  name,
  size = 24,
  color = 'textPrimary',
  style,
  testID,
  accessibilityLabel,
}: DSIconProps): React.ReactElement {
  // Resolve color: token name or custom hex
  const resolvedColor =
    color in viftColors
      ? viftColors[color as IconColor]
      : (color as string);

  const svgPath = ICONS[name] || ICONS.dumbbell;

  // For now, return a placeholder View
  // In production, use: react-native-svg, Lucide React, or similar
  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size },
        style,
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || name}
      accessibilityRole="image"
    >
      {/* Placeholder: colored square with icon name */}
      {/* Replace with actual SVG rendering in production */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: resolvedColor,
          opacity: 0.3,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </View>
  );
}

// ============================================
// Production Integration
// ============================================

/**
 * For production, use one of:
 *
 * 1. react-native-svg + SVG assets
 * 2. Lucide React Native (https://lucide.dev/)
 * 3. Heroicons (https://heroicons.com/)
 * 4. Custom SVG library
 *
 * Example with Lucide:
 * ```
 * import { Dumbbell, Apple, BarChart3, Brain, User } from 'lucide-react-native';
 *
 * const ICON_COMPONENTS = {
 *   dumbbell: Dumbbell,
 *   apple: Apple,
 *   'chart-bar': BarChart3,
 *   brain: Brain,
 *   user: User,
 *   ...
 * };
 *
 * export function DSIcon({ name, size = 24, color = 'textPrimary', ... }) {
 *   const IconComponent = ICON_COMPONENTS[name];
 *   const resolvedColor = color in viftColors ? viftColors[color] : color;
 *   return <IconComponent size={size} color={resolvedColor} />;
 * }
 * ```
 */

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. DSIcon is a PLACEHOLDER. In production, integrate real icon library.
 * 2. Current implementation: colored placeholder circles (for testing layout).
 * 3. Supports: 17+ icon names (dumbbell, apple, brain, user, checkmark, etc.).
 * 4. Production: Replace with Lucide React Native (easiest integration).
 * 5. Next: Create small utility components (Badge.tsx, Divider.tsx, Spinner.tsx).
 * 6. Then: Test all components together (unit tests).
 * 7. After components: Start onboarding screen structure.
 * BLOCKERS: None. All 6 base components (Button, Card, Input, Modal, BottomNav, DSIcon) complete.
 * ESTIMATED TIME: 1 hr for small utility components + basic unit tests.
 */
