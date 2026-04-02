// ============================================
// VFIT Modal Component
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React, { useEffect } from 'react';
import {
  View,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { viftColors, viftComponents, viftAnimation } from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

interface ModalProps {
  /** Is modal visible */
  visible: boolean;
  /** Close handler (called when user dismisses) */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Allow dismissal by tapping backdrop (default: true) */
  dismissOnBackdrop?: boolean;
  /** Custom style for modal container */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: `rgba(0, 0, 0, ${viftComponents.modal.overlayOpacity})`,
    justifyContent: 'flex-end', // Bottom sheet behavior
  },

  centeredOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: viftColors.surfaceCard,
    borderRadius: viftComponents.modal.borderRadius,
    borderTopLeftRadius: viftComponents.modal.borderRadius,
    borderTopRightRadius: viftComponents.modal.borderRadius,
    padding: viftComponents.modal.padding,
    // Bottom sheet safe area (handled by parent)
  },

  modalCentered: {
    borderRadius: viftComponents.modal.borderRadius,
    maxWidth: '90%',
    maxHeight: '90%',
  },
});

// ============================================
// Component
// ============================================

export function Modal({
  visible,
  onClose,
  children,
  dismissOnBackdrop = true,
  style,
  testID,
}: ModalProps): React.ReactElement {
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: viftAnimation.standard,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: viftAnimation.standard,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: viftAnimation.micro,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: viftAnimation.micro,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        style={styles.centeredOverlay}
        onPress={dismissOnBackdrop ? onClose : undefined}
        accessible={false}
      >
        {/* Backdrop */}
        <View style={styles.overlay} />

        {/* Modal Content (animated) */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            style={[styles.modalContent, styles.modalCentered, style]}
            onPress={(e) => e.stopPropagation()} // Prevent dismissal on content tap
            accessible={true}
            accessibilityRole="dialog"
            accessibilityLabel="Modal dialog"
          >
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </RNModal>
  );
}

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. Modal component complete with fade + scale animation.
 * 2. Dismissal: Tap overlay (if dismissOnBackdrop=true) or programmatic onClose().
 * 3. Animation: 250ms standard easing, uses native driver for performance.
 * 4. Accessibility: role="dialog", focus trap ready for implementation.
 * 5. Next: Create BottomNav.tsx (5-tab navigation, active state, bottom-fixed).
 * 6. Then: Create DSIcon.tsx (icon wrapper component).
 * BLOCKERS: None.
 * ESTIMATED TIME: 2 hrs for BottomNav + DSIcon.
 */
