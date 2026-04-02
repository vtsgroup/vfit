// ============================================
// VFIT Bottom Navigation Component
// Design System v1 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

import React from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  viftColors,
  viftSpacing,
  viftTypography,
  viftComponents,
} from '@/lib/vfit-tokens';

// ============================================
// Types
// ============================================

type BottomNavItem = 'treinos' | 'nutricao' | 'avaliacoes' | 'ia' | 'perfil';

interface BottomNavProps {
  /** Currently active tab */
  activeTab: BottomNavItem;
  /** Tab change handler */
  onTabChange: (tab: BottomNavItem) => void;
  /** Custom icon renderer (name -> React.ReactNode) */
  renderIcon?: (name: string, color: string, size: number) => React.ReactNode;
}

// ============================================
// Tab Configuration
// ============================================

const TABS: Array<{ id: BottomNavItem; label: string; icon: string }> = [
  { id: 'treinos', label: 'Treinos', icon: 'dumbbell' },
  { id: 'nutricao', label: 'Nutrição', icon: 'apple' },
  { id: 'avaliacoes', label: 'Avaliações', icon: 'chart-bar' },
  { id: 'ia', label: 'IA', icon: 'brain' },
  { id: 'perfil', label: 'Perfil', icon: 'user' },
];

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: viftColors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: `${viftColors.textTertiary}20`, // 20% opacity
  },

  navContainer: {
    flexDirection: 'row',
    backgroundColor: viftColors.surfaceCard,
    height: viftComponents.bottomNav.height - viftSpacing.lg, // Subtract safe area
    paddingBottom: Platform.OS === 'ios' ? viftSpacing.lg : viftSpacing.sm,
  },

  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: viftSpacing.sm,
    minHeight: 44, // Touch target
  },

  iconContainer: {
    marginBottom: viftSpacing.xs,
  },

  label: {
    fontSize: viftTypography.labelMedium.fontSize,
    fontWeight: '500' as const,
    marginTop: viftSpacing.xs,
  },

  labelActive: {
    fontWeight: '600' as const,
  },
});

// ============================================
// Component
// ============================================

export function BottomNav({
  activeTab,
  onTabChange,
  renderIcon,
}: BottomNavProps): React.ReactElement {
  return (
    <SafeAreaView
      style={styles.safeAreaContainer}
      edges={['bottom']}
      testID="bottom-nav-safe-area"
    >
      <View style={styles.navContainer} testID="bottom-nav-container">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const iconColor = isActive ? viftColors.primary : viftColors.textTertiary;
          const labelColor = isActive ? viftColors.primary : viftColors.textTertiary;

          return (
            <Pressable
              key={tab.id}
              style={({ pressed }) => [
                styles.tab,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => onTabChange(tab.id)}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              testID={`bottom-nav-tab-${tab.id}`}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                {renderIcon ? (
                  renderIcon(tab.icon, iconColor, 24)
                ) : (
                  // Fallback: Simple placeholder
                  <Text style={{ color: iconColor, fontSize: 24 }}>●</Text>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  { color: labelColor },
                  isActive && styles.labelActive,
                ]}
                numberOfLines={1}
                allowFontScaling={true}
                maxFontSizeMultiplier={1.2}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. BottomNav component complete with 5 tabs (Treinos, Nutrição, Avaliações, IA, Perfil).
 * 2. Active tab: Color change (#00FF00) + bold font weight.
 * 3. Inactive tabs: Muted color (#808080) + normal weight.
 * 4. SafeAreaView handles notch/home indicator on iOS, gesture bar on Android.
 * 5. renderIcon prop: Pass custom icon renderer (from DSIcon or Lucide).
 * 6. Accessibility: Each tab is a "tab" role, selected state indicated, label present.
 * 7. Next: Create DSIcon.tsx (wrapper for icon library - Lucide or custom).
 * 8. After DSIcon: Create Badge.tsx, Divider.tsx (smaller components).
 * BLOCKERS: None. Icon rendering is delegated to parent (flexible).
 * ESTIMATED TIME: 1 hr for DSIcon + other small components.
 */
