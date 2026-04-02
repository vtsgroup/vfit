// ============================================
// VFIT Divider Component
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { viftColors, viftSpacing } from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

interface DividerProps {
  /** Margin above and below divider (default: lg) */
  spacing?: keyof typeof viftSpacing;
  /** Horizontal inset padding (default: 0) */
  inset?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  dividerBase: {
    height: 1,
    backgroundColor: `${viftColors.textTertiary}20`, // 20% opacity
  },

  spacingXs: { marginVertical: viftSpacing.xs },
  spacingSm: { marginVertical: viftSpacing.sm },
  spacingMd: { marginVertical: viftSpacing.md },
  spacingLg: { marginVertical: viftSpacing.lg },
  spacingXl: { marginVertical: viftSpacing.xl },
});

// ============================================
// Component
// ============================================

export function Divider({
  spacing = 'lg',
  inset = 0,
  style,
  testID,
}: DividerProps): React.ReactElement {
  const spacingStyle = (() => {
    switch (spacing) {
      case 'xs':
        return styles.spacingXs;
      case 'sm':
        return styles.spacingSm;
      case 'md':
        return styles.spacingMd;
      case 'lg':
        return styles.spacingLg;
      case 'xl':
        return styles.spacingXl;
      default:
        return styles.spacingLg;
    }
  })();

  return (
    <View
      style={[
        styles.dividerBase,
        spacingStyle,
        inset > 0 && {
          marginHorizontal: inset,
        },
        style,
      ]}
      testID={testID}
      accessible={false} // Dividers are purely visual
    />
  );
}

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. Divider component complete (simple 1px line with configurable spacing).
 * 2. Next: Create Spinner.tsx (loading indicator).
 * 3. After Spinner: 8+ base components ready for unit testing.
 * BLOCKERS: None.
 * ESTIMATED TIME: 30 min for Spinner.
 */
