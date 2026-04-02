// ============================================
// VFIT Badge Component
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  viftColors,
  viftSpacing,
  viftTypography,
} from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

type BadgeVariant = 'default' | 'success' | 'error' | 'warning';

interface BadgeProps {
  /** Badge label */
  children: React.ReactNode;
  /** Badge style variant (default: default) */
  variant?: BadgeVariant;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  badgeBase: {
    paddingVertical: viftSpacing.xs,
    paddingHorizontal: viftSpacing.sm,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },

  textBase: {
    fontSize: viftTypography.labelMedium.fontSize,
    fontWeight: '500' as const,
  },

  // Variants
  variantDefault: {
    backgroundColor: `${viftColors.primary}20`, // 20% opacity
  },
  textDefault: {
    color: viftColors.primary,
  },

  variantSuccess: {
    backgroundColor: `${viftColors.success}20`,
  },
  textSuccess: {
    color: viftColors.success,
  },

  variantError: {
    backgroundColor: `${viftColors.error}20`,
  },
  textError: {
    color: viftColors.error,
  },

  variantWarning: {
    backgroundColor: `${viftColors.warning}20`,
  },
  textWarning: {
    color: viftColors.warning,
  },
});

// ============================================
// Component
// ============================================

export function Badge({
  children,
  variant = 'default',
  style,
  testID,
}: BadgeProps): React.ReactElement {
  const variantStyle = (() => {
    switch (variant) {
      case 'success':
        return [styles.variantSuccess, styles.textSuccess];
      case 'error':
        return [styles.variantError, styles.textError];
      case 'warning':
        return [styles.variantWarning, styles.textWarning];
      default:
        return [styles.variantDefault, styles.textDefault];
    }
  })();

  const [bgStyle, textStyle] = variantStyle;

  return (
    <View
      style={[styles.badgeBase, bgStyle, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={`Badge: ${typeof children === 'string' ? children : 'custom'}`}
      accessibilityRole="status"
    >
      <Text
        style={[styles.textBase, textStyle]}
        allowFontScaling={true}
        maxFontSizeMultiplier={1.1}
      >
        {children}
      </Text>
    </View>
  );
}

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. Badge component complete (4 variants: default, success, error, warning).
 * 2. Used for labels, tags, status indicators.
 * 3. Next: Create Divider.tsx (separator line).
 * 4. Then: Create Spinner.tsx (loading indicator).
 * 5. After small components: Test all 8+ base components together.
 * BLOCKERS: None.
 * ESTIMATED TIME: 30 min for Divider + Spinner.
 */
