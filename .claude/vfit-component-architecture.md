# VFIT Component Architecture — React Native + Next.js

**Version**: 1.0  
**Date**: 2026-04-01  
**Target**: React Native (mobile) + Next.js 15 (web admin)  
**Status**: Ready for Implementation

---

## Part 1: React Native Project Structure

```
src/
├── app/                          # App Router (nested routes, Expo Router compatible)
│   ├── (tabs)/                   # Tab-based navigation (5 main tabs)
│   │   ├── _layout.tsx           # Bottom tab navigator setup
│   │   ├── treinos/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Workout library list
│   │   │   ├── [id].tsx          # Active workout tracker
│   │   │   └── history.tsx       # Session history + trends
│   │   ├── nutricao/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Meal planner for today
│   │   │   ├── logger.tsx        # Manual food entry
│   │   │   └── history.tsx       # Weekly/monthly summary
│   │   ├── avaliacoes/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Evaluation history + trends
│   │   │   ├── marketplace.tsx   # Trainer list + filtering
│   │   │   └── [trainer_id].tsx  # Trainer detail + booking
│   │   ├── ia/
│   │   │   ├── _layout.tsx
│   │   │   └── chat.tsx          # IA chat assistant
│   │   └── perfil/
│   │       ├── _layout.tsx
│   │       ├── index.tsx         # User profile + settings
│   │       └── premium.tsx       # Subscription management
│   └── (auth)/                   # Auth stack (login, signup, onboarding)
│       ├── _layout.tsx
│       ├── login.tsx
│       ├── signup.tsx
│       └── onboarding/
│           ├── _layout.tsx
│           ├── step-1.tsx        # Welcome
│           ├── step-2.tsx        # Goal selection
│           ├── step-3.tsx        # Experience level
│           ├── step-4.tsx        # Training days
│           ├── step-5.tsx        # Training locations
│           ├── step-6.tsx        # Body metrics
│           ├── step-7.tsx        # Dietary restrictions
│           ├── step-8.tsx        # Equipment
│           ├── step-9.tsx        # Subscription plan
│           └── step-10.tsx       # Confirmation
│
├── components/
│   ├── ui/
│   │   ├── vfit/                 # VFIT design system components
│   │   │   ├── Button.tsx        # Button (primary, secondary, outlined, ghost, destructive)
│   │   │   ├── Card.tsx          # Card container
│   │   │   ├── Input.tsx         # Text input with label + error
│   │   │   ├── Modal.tsx         # Modal dialog
│   │   │   ├── BottomNav.tsx     # 5-tab bottom navigation
│   │   │   ├── Badge.tsx         # Badge/tag component
│   │   │   ├── Divider.tsx       # Divider line
│   │   │   ├── DSIcon.tsx        # Icon wrapper (Lucide/custom)
│   │   │   ├── Avatar.tsx        # User avatar
│   │   │   ├── Spinner.tsx       # Loading spinner
│   │   │   ├── SkeletonLoader.tsx # Placeholder while loading
│   │   │   └── TextInput.tsx     # Keyboard-aware input for forms
│   │   └── ...other base components
│   │
│   ├── vfit/                     # VFIT-specific components
│   │   ├── onboarding/
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── GoalSelector.tsx
│   │   │   ├── ExperienceSelector.tsx
│   │   │   ├── TrainingDaysSelector.tsx
│   │   │   ├── BodyMetricsForm.tsx
│   │   │   ├── DietaryRestrictionsSelector.tsx
│   │   │   └── SubscriptionPlanCard.tsx
│   │   ├── workout/
│   │   │   ├── WorkoutCard.tsx
│   │   │   ├── WorkoutLibraryList.tsx
│   │   │   ├── SetLogger.tsx     # Reps, weight, RPE input
│   │   │   ├── Timer.tsx         # Rest period countdown
│   │   │   ├── ExerciseDetailView.tsx
│   │   │   ├── VolumeChart.tsx   # Weekly trend
│   │   │   └── PersonalRecordBadge.tsx
│   │   ├── nutrition/
│   │   │   ├── FoodSearchbar.tsx
│   │   │   ├── FoodCard.tsx
│   │   │   ├── MacroCard.tsx     # Daily macro summary
│   │   │   ├── MacroPieChart.tsx
│   │   │   ├── MealEntryForm.tsx
│   │   │   └── MealHistoryList.tsx
│   │   ├── evaluation/
│   │   │   ├── TrainerCard.tsx
│   │   │   ├── TrainerMarketplaceList.tsx
│   │   │   ├── RatingStars.tsx
│   │   │   ├── ReviewList.tsx
│   │   │   ├── BookingModal.tsx
│   │   │   └── EvaluationHistoryList.tsx
│   │   ├── ia/
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── QuickSuggestions.tsx
│   │   │   └── ChatHistory.tsx
│   │   ├── profile/
│   │   │   ├── UserInfo.tsx
│   │   │   ├── SubscriptionPlanBadge.tsx
│   │   │   ├── PremiumUpgradeCard.tsx
│   │   │   ├── TrainerConnectionsList.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── common/
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingScreen.tsx
│   │       └── AuthGuard.tsx     # Protect routes, check user_type + subscription_plan
│   └── ...other domain components
│
├── hooks/                        # TanStack Query + custom hooks
│   ├── useAuth.ts               # Auth state, login/logout
│   ├── useUser.ts               # User profile data
│   ├── useWorkouts.ts           # GET /api/workouts
│   ├── useActiveSession.ts      # Current workout session state
│   ├── useSetLogger.ts          # Log sets during workout
│   ├── useFoods.ts              # GET /api/foods (search)
│   ├── useUserMeals.ts          # GET /api/meals (user's logged meals)
│   ├── useMacroTargets.ts       # Calculate targets based on goal/weight
│   ├── useTrainers.ts           # GET /api/trainers (marketplace)
│   ├── useAvailableSlots.ts     # GET /api/trainers/:id/available-slots
│   ├── useBooking.ts            # POST /api/bookings
│   ├── useChatMessages.ts       # GET /api/ia/chat (infinite scroll)
│   ├── useAIContext.ts          # GET /api/ia/context (cached user context)
│   └── useSubscription.ts       # User's subscription plan + limits
│
├── stores/                       # Zustand global state
│   ├── auth-store.ts            # User session, JWT token
│   ├── app-store.ts             # Global UI state (theme, language)
│   ├── onboarding-store.ts      # Onboarding form state (multi-step)
│   ├── workout-store.ts         # Active session state, set logging
│   └── meal-store.ts            # Today's meal logging state
│
├── lib/
│   ├── vfit-tokens.ts           # Design system tokens (colors, spacing, typography)
│   ├── vfit-schemas.ts          # Zod schemas (users, workouts, meals, etc.)
│   ├── api-client.ts            # Fetch wrapper with auth headers
│   ├── nutrition-calc.ts        # Macro calculations
│   ├── date-utils.ts            # Date formatting, timezone handling
│   ├── constants.ts             # App constants (plans, goals, experience levels)
│   └── error-handler.ts         # Centralized error handling
│
├── types/
│   ├── vfit.ts                  # TypeScript types (User, Workout, Meal, etc.)
│   └── api.ts                   # API request/response types
│
└── styles/
    ├── globals.css              # Global styles, CSS variables
    └── tailwind.config.ts       # Tailwind config (if using)
```

---

## Part 2: Next.js Admin Panel Structure

```
src/
└── app/
    ├── dashboard/
    │   ├── admin/
    │   │   ├── _layout.tsx      # Admin layout (sidebar nav)
    │   │   ├── workouts/
    │   │   │   ├── page.tsx     # Workouts table + CRUD
    │   │   │   ├── [id]/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── edit.tsx
    │   │   │   └── new.tsx      # Create new workout
    │   │   ├── exercises/
    │   │   │   ├── page.tsx     # Exercises table
    │   │   │   ├── [id]/edit.tsx
    │   │   │   └── new.tsx
    │   │   ├── recipes/
    │   │   │   ├── page.tsx     # Recipes (foods) management
    │   │   │   ├── [id]/edit.tsx
    │   │   │   └── new.tsx
    │   │   ├── analytics/
    │   │   │   ├── page.tsx     # Dashboard with charts
    │   │   │   ├── users.tsx    # User signup trends
    │   │   │   ├── engagement.tsx # DAU, retention
    │   │   │   └── ia-usage.tsx # IA chat volume + performance
    │   │   └── settings/
    │   │       ├── page.tsx     # App settings, IA config
    │   │       └── users.tsx    # User management (ban/promote)
    │   └── ...other dashboards
    │
    └── components/
        ├── admin/
        │   ├── Sidebar.tsx      # Left navigation
        │   ├── DataTable.tsx    # Reusable table (sortable, filterable)
        │   ├── FormBuilder.tsx  # Dynamic form from schema
        │   ├── ImageUploader.tsx # R2 upload
        │   ├── DatePicker.tsx   # Calendar picker
        │   ├── UserSignupChart.tsx
        │   └── EngagementChart.tsx
        └── ...shared components
```

---

## Part 3: Core Component Specifications

### 3.1 Button Component

```typescript
// src/components/ui/vfit/Button.tsx
import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { viftTokens } from '@/lib/vfit-tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost' | 'destructive';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
  testID?: string;
}

export function Button({
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  onPress,
  children,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const variantStyles = {
    primary: {
      backgroundColor: viftTokens.colors.primary,
      borderColor: viftTokens.colors.primary,
    },
    secondary: {
      backgroundColor: viftTokens.colors.surfaceCard,
      borderColor: viftTokens.colors.primary,
    },
    // ... other variants
  };

  const sizeStyles = {
    sm: { paddingHorizontal: 12, paddingVertical: 8 },
    lg: { paddingHorizontal: 16, paddingVertical: 12 },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || children}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          borderRadius: 4,
          minHeight: 44,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          ...variantStyles[variant],
          ...sizeStyles[size],
        },
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={viftTokens.colors.textPrimary} />
      ) : (
        <Text style={{ color: viftTokens.colors.textPrimary, fontWeight: '600' }}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
```

### 3.2 Input Component

```typescript
// src/components/ui/vfit/Input.tsx
import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { viftTokens } from '@/lib/vfit-tokens';

interface InputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  accessibilityLabel?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled,
  keyboardType = 'default',
  accessibilityLabel,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ marginBottom: viftTokens.spacing.lg }}>
      <Text
        style={{
          color: viftTokens.colors.textPrimary,
          fontSize: viftTokens.typography.labelLarge.fontSize,
          fontWeight: '600',
          marginBottom: viftTokens.spacing.sm,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: error ? viftTokens.colors.error : isFocused ? viftTokens.colors.primary : 'transparent',
          backgroundColor: viftTokens.colors.surfaceElevated,
          color: viftTokens.colors.textPrimary,
          paddingHorizontal: viftTokens.spacing.lg,
          paddingVertical: viftTokens.spacing.md,
          borderRadius: 4,
          minHeight: 44,
          fontSize: viftTokens.typography.bodyNormal.fontSize,
        }}
        placeholder={placeholder}
        placeholderTextColor={viftTokens.colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel || label}
      />
      {error && (
        <Text style={{ color: viftTokens.colors.error, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
```

### 3.3 BottomNav Component

```typescript
// src/components/ui/vfit/BottomNav.tsx
import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { DSIcon } from '@/components/ui/vfit/DSIcon';
import { viftTokens } from '@/lib/vfit-tokens';

const TABS = [
  { name: 'Treinos', icon: 'dumbbell', href: '/(tabs)/treinos' },
  { name: 'Nutrição', icon: 'apple', href: '/(tabs)/nutricao' },
  { name: 'Avaliações', icon: 'chart-bar', href: '/(tabs)/avaliacoes' },
  { name: 'IA', icon: 'brain', href: '/(tabs)/ia' },
  { name: 'Perfil', icon: 'user', href: '/(tabs)/perfil' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: viftTokens.colors.surfaceCard,
        borderTopWidth: 1,
        borderTopColor: viftTokens.colors.textTertiary + '20',
        paddingBottom: 20, // Safe area
        height: 64,
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.href)}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 44,
            }}
            accessibilityLabel={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <DSIcon
              name={tab.icon}
              size={24}
              color={isActive ? viftTokens.colors.primary : viftTokens.colors.textTertiary}
            />
            <Text
              style={{
                fontSize: viftTokens.typography.labelMedium.fontSize,
                color: isActive ? viftTokens.colors.primary : viftTokens.colors.textTertiary,
                marginTop: 4,
                fontWeight: isActive ? '600' : '500',
              }}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
```

### 3.4 SetLogger Component (Workout)

```typescript
// src/components/vfit/workout/SetLogger.tsx
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Input } from '@/components/ui/vfit/Input';
import { Button } from '@/components/ui/vfit/Button';
import { viftTokens } from '@/lib/vfit-tokens';

interface SetLoggerProps {
  exerciseName: string;
  setNumber: number;
  targetReps?: string;
  targetWeight?: number;
  onLogSet: (reps: number, weight: number, rpe: number) => void;
  onSkip: () => void;
}

export function SetLogger({
  exerciseName,
  setNumber,
  targetReps,
  targetWeight,
  onLogSet,
  onSkip,
}: SetLoggerProps) {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState(targetWeight?.toString() || '');
  const [rpe, setRpe] = useState(5); // Rate of Perceived Exertion (1-10)

  const handleSubmit = () => {
    if (!reps || !weight) return; // Validate
    onLogSet(parseInt(reps), parseFloat(weight), rpe);
  };

  return (
    <View style={{ padding: viftTokens.spacing.lg }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: viftTokens.spacing.md }}>
        {exerciseName} — Set {setNumber}
      </Text>

      {targetReps && (
        <Text style={{ color: viftTokens.colors.textSecondary, marginBottom: viftTokens.spacing.md }}>
          Target: {targetReps} reps {targetWeight && `@ ${targetWeight}kg`}
        </Text>
      )}

      <Input
        label="Reps"
        placeholder="E.g., 10"
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
      />

      <Input
        label="Weight (kg)"
        placeholder="E.g., 80"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
      />

      {/* RPE Slider */}
      <View style={{ marginBottom: viftTokens.spacing.lg }}>
        <Text style={{ fontWeight: '600', marginBottom: viftTokens.spacing.sm }}>
          Perceived Exertion: {rpe}/10
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <Pressable
              key={num}
              onPress={() => setRpe(num)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: rpe === num ? viftTokens.colors.primary : viftTokens.colors.surfaceElevated,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityLabel={`Exertion ${num}`}
            >
              <Text style={{ color: viftTokens.colors.textPrimary, fontWeight: '600' }}>
                {num}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: viftTokens.spacing.md }}>
        <Button variant="secondary" size="lg" onPress={onSkip} style={{ flex: 1 }}>
          Skip
        </Button>
        <Button size="lg" onPress={handleSubmit} style={{ flex: 1 }}>
          Log Set
        </Button>
      </View>
    </View>
  );
}
```

---

## Part 4: Design System Tokens (vfit-tokens.ts)

```typescript
// src/lib/vfit-tokens.ts
export const viftTokens = {
  colors: {
    primary: '#00FF00',
    primaryDark: '#00CC00',
    surfaceBase: '#0F2B2B',
    surfaceCard: '#0F3A3A',
    surfaceElevated: '#1A4A4A',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#808080',
    success: '#4CAF50',
    error: '#FF4444',
    warning: '#FFA500',
    info: '#4DA6FF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    '4xl': 64,
  },
  typography: {
    display: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    headline: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    subtitle1: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    subtitle2: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    bodyNormal: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0.25,
    },
    labelLarge: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    labelMedium: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.4,
    },
    labelSmall: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.5,
    },
  },
  animation: {
    micro: { duration: 150 },
    standard: { duration: 250 },
    slow: { duration: 400 },
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 999,
  },
};
```

---

## Part 5: Hook Examples (TanStack Query)

```typescript
// src/hooks/useWorkouts.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Workout {
  id: string;
  name: string;
  primaryMuscle: string;
  difficulty: string;
  duration: number;
}

export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const res = await apiClient('/api/workouts');
      return res.json() as Promise<Workout[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// src/hooks/useSetLogger.ts
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useSetLogger(sessionId: string) {
  return useMutation({
    mutationFn: async (setData: { exerciseId: string; reps: number; weight: number; rpe: number }) => {
      const res = await apiClient(`/api/sets`, {
        method: 'POST',
        body: JSON.stringify({ sessionId, ...setData }),
      });
      return res.json();
    },
  });
}
```

---

## Part 6: Zustand Store Examples

```typescript
// src/stores/workout-store.ts
import { create } from 'zustand';

interface WorkoutSessionState {
  sessionId: string | null;
  workoutId: string | null;
  currentExerciseIndex: number;
  sets: Array<{ reps: number; weight: number; rpe: number }>;
  startSession: (workoutId: string) => void;
  logSet: (reps: number, weight: number, rpe: number) => void;
  nextExercise: () => void;
  completeSession: () => void;
}

export const useWorkoutStore = create<WorkoutSessionState>((set) => ({
  sessionId: null,
  workoutId: null,
  currentExerciseIndex: 0,
  sets: [],
  startSession: (workoutId) =>
    set({
      workoutId,
      sessionId: `session-${Date.now()}`,
      currentExerciseIndex: 0,
      sets: [],
    }),
  logSet: (reps, weight, rpe) =>
    set((state) => ({
      sets: [...state.sets, { reps, weight, rpe }],
    })),
  nextExercise: () =>
    set((state) => ({
      currentExerciseIndex: state.currentExerciseIndex + 1,
      sets: [],
    })),
  completeSession: () =>
    set({
      sessionId: null,
      workoutId: null,
      currentExerciseIndex: 0,
      sets: [],
    }),
}));
```

---

## Part 7: Zod Validation Schemas

```typescript
// src/lib/vfit-schemas.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  goalType: z.enum(['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  subscriptionPlan: z.enum(['free', 'premium', 'premium_plus']),
});

export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  primaryMuscle: z.string(),
  exercises: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.number().int().positive(),
    reps: z.string(),
    restSeconds: z.number().int(),
  })),
});

export const SetLogSchema = z.object({
  exerciseId: z.string().uuid(),
  reps: z.number().int().positive(),
  weight: z.number().positive(),
  rpe: z.number().int().min(1).max(10),
});

export type User = z.infer<typeof UserSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type SetLog = z.infer<typeof SetLogSchema>;
```

---

## Part 8: Testing Strategy

### Unit Tests

```typescript
// src/components/ui/vfit/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button onPress={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Click me</Button>);
    fireEvent.press(screen.getByText('Click me'));
    expect(onPress).toHaveBeenCalled();
  });

  it('is disabled when loading', () => {
    const onPress = jest.fn();
    render(<Button loading onPress={onPress}>Click me</Button>);
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test('complete onboarding flow', async ({ page }) => {
  await page.goto('app://onboarding');

  // Step 1: Welcome
  await expect(page.locator('text=Welcome to VFIT')).toBeVisible();
  await page.click('button:has-text("Next")');

  // Step 2: Goal selection
  await expect(page.locator('text=What is your fitness goal?')).toBeVisible();
  await page.click('button:has-text("Muscle Gain")');
  await page.click('button:has-text("Next")');

  // ... continue through all steps

  // Final: Confirmation
  await expect(page.locator('text=Your profile is ready!')).toBeVisible();
  await page.click('button:has-text("Start Training")');

  // Verify redirect to home
  await expect(page).toHaveURL('app:///(tabs)/treinos');
});
```

---

## Continuity Prompt for Opus

> **Next Session Start Instruction**: If continuing component implementation in Opus:
> 1. Read `.claude/vfit-component-architecture.md` (this file) to understand full structure
> 2. Verify existing components:
>    - [ ] vfit-tokens.ts created with all color/spacing/typography tokens?
>    - [ ] Base components built? (Button, Card, Input, Modal, BottomNav)
>    - [ ] Design system tests written? (unit tests, 20+)
> 3. If components in progress:
>    - Resume from latest component in `.claude/session-state.md`
>    - Ensure all new components follow tokens from vfit-tokens.ts
>    - Add tests for every component (unit + accessibility)
> 4. If components complete:
>    - Move to screens: Create `src/app/(app)/treinos/` pages
>    - Start with onboarding screens (8-10 steps)
> 5. Guidelines:
>    - Use only vift-tokens for colors/spacing (never hardcode hex)
>    - Add accessibility props to every interactive element (aria-label, role, testID)
>    - Test every component with unit tests + E2E
>    - Keep components small, single-responsibility
> **Blockers to watch**: Design system tokens locked? Zod schemas ready? TanStack Query version?
> **Estimated time**: 3 days (tokens + 8 base components) + 2 days (tests + accessibility)

