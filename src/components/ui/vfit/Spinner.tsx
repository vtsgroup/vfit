// ============================================
// VFIT Spinner Component (Loading Indicator)
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React, { useEffect } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  AccessibilityRole,
} from 'react-native';
import { viftColors, viftAnimation } from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = keyof typeof viftColors;

interface SpinnerProps {
  /** Spinner size (default: md) */
  size?: SpinnerSize;
  /** Spinner color token (default: primary) */
  color?: SpinnerColor | string;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  spinnerBase: {
    borderWidth: 3,
  },
});

// ============================================
// Component
// ============================================

export function Spinner({
  size = 'md',
  color = 'primary',
  style,
  testID,
}: SpinnerProps): React.ReactElement {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  // Determine spinner dimensions
  const sizeMap = { sm: 24, md: 32, lg: 48 };
  const spinnerSize = sizeMap[size];
  const borderWidth = size === 'sm' ? 2 : 3;

  // Resolve color
  const resolvedColor =
    color in viftColors
      ? viftColors[color as SpinnerColor]
      : (color as string);

  // Start rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: viftAnimation.slow,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  // Interpolate rotation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.spinnerContainer,
        {
          width: spinnerSize,
          height: spinnerSize,
          transform: [{ rotate }],
        },
        style,
      ]}
      testID={testID}
      accessible={true}
      accessibilityRole="progressbar" as AccessibilityRole
      accessibilityLabel="Loading"
      accessibilityLiveRegion="polite"
    >
      <View
        style={[
          styles.spinnerBase,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderColor: resolvedColor,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
          },
        ]}
      />
    </Animated.View>
  );
}

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. Spinner component complete (3 sizes, animated 360° rotation).
 * 2. Uses linear easing for continuous smooth rotation.
 * 3. Accessibility: role="progressbar", aria-label="Loading".
 * 4. COMPONENT LIBRARY COMPLETE:
 *    - Button.tsx ✅
 *    - Card.tsx ✅
 *    - Input.tsx ✅
 *    - Modal.tsx ✅
 *    - BottomNav.tsx ✅
 *    - DSIcon.tsx ✅
 *    - Badge.tsx ✅
 *    - Divider.tsx ✅
 *    - Spinner.tsx ✅
 * 5. Next: Write unit tests for all components (20+ tests).
 * 6. After tests: Start onboarding screen structure + form state management.
 * BLOCKERS: None. All base components done.
 * ESTIMATED TIME (Sprint 41 Week 1): Tests + onboarding screens = 2-3 days remaining.
 */
