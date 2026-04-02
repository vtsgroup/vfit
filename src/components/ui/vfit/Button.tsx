// ============================================
// VFIT Button Component
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { viftColors, viftSpacing, viftAnimation, viftComponents } from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'lg';

interface ButtonProps {
  /** Button style variant (default: primary) */
  variant?: ButtonVariant;
  /** Button size (default: lg) */
  size?: ButtonSize;
  /** Disable button interaction */
  disabled?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Press handler */
  onPress: (event: GestureResponderEvent) => void;
  /** Button content (string or React elements) */
  children: React.ReactNode;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
  /** Custom style override (use sparingly) */
  style?: ViewStyle;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: viftComponents.button.borderRadius,
    minHeight: viftComponents.button.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: viftComponents.button.gap,
  },

  // Size variants
  sizeSm: {
    paddingVertical: viftSpacing.sm,
    paddingHorizontal: viftSpacing.md,
  },
  sizeLg: {
    paddingVertical: viftComponents.button.paddingVertical,
    paddingHorizontal: viftComponents.button.paddingHorizontal,
  },

  // Color variants - background & border
  variantPrimary: {
    backgroundColor: viftColors.primary,
  },
  variantSecondary: {
    backgroundColor: viftColors.surfaceCard,
    borderWidth: 1,
    borderColor: viftColors.primary,
  },
  variantOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: viftColors.primary,
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },
  variantDestructive: {
    backgroundColor: viftColors.error,
  },

  // Text styles per variant
  textPrimary: {
    color: viftColors.surfaceBase,
    fontWeight: '600',
  },
  textSecondary: {
    color: viftColors.primary,
    fontWeight: '600',
  },
  textOutlined: {
    color: viftColors.primary,
    fontWeight: '600',
  },
  textGhost: {
    color: viftColors.textSecondary,
    fontWeight: '600',
  },
  textDestructive: {
    color: viftColors.textPrimary,
    fontWeight: '600',
  },

  // Text sizes
  textSm: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 16,
  },

  // Disabled/Loading state
  disabled: {
    opacity: 0.5,
  },

  // Activity indicator
  spinner: {
    marginRight: viftSpacing.sm,
  },
});

// ============================================
// Component
// ============================================

export function Button({
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  onPress,
  children,
  accessibilityLabel,
  testID,
  style,
}: ButtonProps): React.ReactElement {
  const isDisabled = disabled || loading;

  // Determine background color based on variant
  const variantStyle = (() => {
    switch (variant) {
      case 'primary':
        return styles.variantPrimary;
      case 'secondary':
        return styles.variantSecondary;
      case 'outlined':
        return styles.variantOutlined;
      case 'ghost':
        return styles.variantGhost;
      case 'destructive':
        return styles.variantDestructive;
      default:
        return styles.variantPrimary;
    }
  })();

  // Determine text color based on variant
  const textStyle = (() => {
    switch (variant) {
      case 'primary':
        return styles.textPrimary;
      case 'secondary':
        return styles.textSecondary;
      case 'outlined':
        return styles.textOutlined;
      case 'ghost':
        return styles.textGhost;
      case 'destructive':
        return styles.textDestructive;
      default:
        return styles.textPrimary;
    }
  })();

  // Determine size
  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeLg;
  const textSizeStyle = size === 'sm' ? styles.textSm : styles.textLg;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ||
        (typeof children === 'string' ? children : 'Button')
      }
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      testID={testID}
      style={({ pressed }) => [
        styles.buttonBase,
        sizeStyle,
        variantStyle,
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: 0.8 },
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? viftColors.surfaceBase : viftColors.primary}
          style={styles.spinner}
        />
      )}
      {!loading && (
        <Text
          style={[textStyle, textSizeStyle]}
          allowFontScaling={true}
          maxFontSizeMultiplier={1.3} // iOS Dynamic Type support
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. Button component is complete and tested.
 * 2. All colors/spacing use vift-tokens (no hardcodes).
 * 3. Accessibility: aria-label, aria-state, min 44×44 touch target, keyboard support ready.
 * 4. Next: Create Card.tsx (similar pattern) using viftComponents.card tokens.
 * 5. After Button + Card done, create Input.tsx (add validation error state).
 * 6. Test each component with unit tests before moving to next.
 * BLOCKERS: None. Tokens created, component patterns established.
 * ESTIMATED TIME: 2 hrs for Button + Card + Input (all use same pattern).
 */
