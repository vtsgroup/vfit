// ============================================
// VFIT Input Component
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import {
  viftColors,
  viftSpacing,
  viftComponents,
  viftTypography,
} from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

type KeyboardType =
  | 'default'
  | 'email-address'
  | 'numeric'
  | 'phone-pad'
  | 'decimal-pad'
  | 'visible-password';

type TextContentType =
  | 'none'
  | 'username'
  | 'password'
  | 'email'
  | 'telephone'
  | 'url'
  | 'creditCardNumber'
  | 'postalCode'
  | 'newPassword'
  | 'oneTimeCode';

interface InputProps {
  /** Label text (required, shown above input) */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current input value */
  value: string;
  /** Change handler */
  onChangeText: (text: string) => void;
  /** Error message (shown below input if present) */
  error?: string;
  /** Disable input */
  disabled?: boolean;
  /** Keyboard type */
  keyboardType?: KeyboardType;
  /** iOS text content type (for autofill) */
  textContentType?: TextContentType;
  /** Hide input text (for passwords) */
  secureTextEntry?: boolean;
  /** Max characters allowed */
  maxLength?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
  /** Accessibility label override */
  accessibilityLabel?: string;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: viftSpacing.lg,
  },

  label: {
    color: viftColors.textPrimary,
    fontSize: viftTypography.labelLarge.fontSize,
    fontWeight: viftTypography.labelLarge.fontWeight as any,
    marginBottom: viftSpacing.sm,
  },

  inputWrapper: {
    borderWidth: viftComponents.input.borderWidth,
    borderColor: 'transparent', // Default (no focus)
    backgroundColor: viftColors.surfaceElevated,
    borderRadius: viftComponents.input.borderRadius,
    minHeight: viftComponents.input.minHeight,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  inputWrapperFocused: {
    borderColor: viftColors.primary,
    borderWidth: 2, // Thicker when focused for visibility
  },

  inputWrapperError: {
    borderColor: viftColors.error,
    borderWidth: viftComponents.input.borderWidth,
  },

  inputWrapperDisabled: {
    opacity: 0.5,
  },

  input: {
    color: viftColors.textPrimary,
    fontSize: viftTypography.bodyNormal.fontSize,
    fontWeight: viftTypography.bodyNormal.fontWeight as any,
    paddingVertical: viftComponents.input.paddingVertical,
    paddingHorizontal: viftComponents.input.paddingHorizontal,
    minHeight: viftComponents.input.minHeight,
  },

  placeholderColor: {
    color: viftColors.textTertiary,
  },

  errorText: {
    color: viftColors.error,
    fontSize: viftTypography.bodySmall.fontSize,
    marginTop: viftSpacing.sm,
  },

  helperText: {
    color: viftColors.textSecondary,
    fontSize: viftTypography.labelSmall.fontSize,
    marginTop: viftSpacing.xs,
  },
});

// ============================================
// Component
// ============================================

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  keyboardType = 'default',
  textContentType = 'none',
  secureTextEntry = false,
  maxLength,
  style,
  testID,
  accessibilityLabel,
}: InputProps): React.ReactElement {
  const [isFocused, setIsFocused] = useState(false);

  const inputWrapperStyle = [
    styles.inputWrapper,
    isFocused && styles.inputWrapperFocused,
    error && styles.inputWrapperError,
    disabled && styles.inputWrapperDisabled,
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      <Text
        style={styles.label}
        accessibilityLabel={`${label} label`}
      >
        {label}
      </Text>

      {/* Input Wrapper */}
      <View style={inputWrapperStyle}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={viftColors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          keyboardType={keyboardType}
          textContentType={textContentType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          testID={testID}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityRole="adjustable"
          accessibilityState={{
            disabled,
            busy: false,
          }}
          allowFontScaling={true}
          maxFontSizeMultiplier={1.3} // iOS Dynamic Type support
          // Platform-specific
          {...(Platform.OS === 'ios' && {
            spellCheck: false,
            autoCapitalize: 'none',
          })}
        />
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={styles.errorText}
          role="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. Input component complete with validation error state.
 * 2. Supports all keyboard types (email, numeric, phone, password via secureTextEntry).
 * 3. iOS Dynamic Type support (maxFontSizeMultiplier).
 * 4. Accessibility: label always visible, error shown as aria-alert, focus state visible.
 * 5. Next: Create Modal.tsx (overlay + dismiss on backdrop).
 * 6. Then: Create BottomNav.tsx (5 tabs with active state + icon support).
 * 7. Then: Create DSIcon.tsx (wrapper for icon library).
 * BLOCKERS: None. Pattern clear. Keep same structure for Modal.
 * ESTIMATED TIME: 3 hrs for Modal + BottomNav + DSIcon.
 */
