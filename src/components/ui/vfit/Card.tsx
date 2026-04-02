// ============================================
// VFIT Card Component
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { viftColors, viftComponents } from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Optional press handler (makes card tappable) */
  onPress?: (event: GestureResponderEvent) => void;
  /** Custom style override */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: viftColors.surfaceCard,
    padding: viftComponents.card.padding,
    borderRadius: viftComponents.card.borderRadius,
    marginBottom: viftComponents.card.marginBottom,
    shadowColor: viftComponents.card.shadowColor,
    shadowOffset: viftComponents.card.shadowOffset,
    shadowOpacity: viftComponents.card.shadowOpacity,
    shadowRadius: viftComponents.card.shadowRadius,
    elevation: viftComponents.card.elevation, // Android
  },

  // Pressed state for tappable cards
  pressed: {
    opacity: 0.95,
  },
});

// ============================================
// Component
// ============================================

export function Card({
  children,
  onPress,
  style,
  testID,
  accessibilityLabel,
}: CardProps): React.ReactElement {
  const content = (
    <View
      style={[styles.cardBase, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );

  // If onPress provided, wrap in Pressable for interaction feedback
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessible={false}
        accessibilityRole="button"
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  // Otherwise return static card
  return content;
}

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. Card component complete (static + interactive variants).
 * 2. Uses viftComponents.card tokens for padding, radius, shadow.
 * 3. Shadow works on both iOS (shadowColor, shadowOffset, etc.) and Android (elevation).
 * 4. Next: Create Input.tsx for form fields (text input with label + error support).
 * 5. Input will be the most complex (validation, focus states, keyboard type support).
 * 6. After Input, create Modal.tsx (overlay + content container).
 * BLOCKERS: None. Pattern established from Button.tsx.
 * ESTIMATED TIME: 1.5 hrs for Input + Modal.
 */
