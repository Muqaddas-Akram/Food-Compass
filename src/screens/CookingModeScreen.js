import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme';
import StepCheckbox from '../components/StepCheckbox';
import { getSteps, getStepProgress, toggleStepComplete, resetStepProgress } from '../database/queries';
import { blurActiveElementOnWeb } from '../utils/accessibility';

export default function CookingModeScreen({ route, navigation }) {
  const { recipeId, recipeName } = route.params;
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState({});
  const [allDone, setAllDone] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useKeepAwake(); // Prevent screen sleep during cooking

  const loadData = useCallback(async () => {
    try {
      const st = await getSteps(recipeId);
      setSteps(st);
      const progress = await getStepProgress(recipeId);
      const completed = {};
      progress.forEach(p => {
        if (p.completed) completed[p.stepNumber] = true;
      });
      setCompletedSteps(completed);
      setAllDone(st.length > 0 && st.every(s => completed[s.stepNumber]));
    } catch (e) {
      console.error('Error loading cooking data:', e);
    }
  }, [recipeId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggleStep = async (stepNumber) => {
    const isNowComplete = await toggleStepComplete(recipeId, stepNumber);
    const newCompleted = { ...completedSteps };
    if (isNowComplete) {
      newCompleted[stepNumber] = true;
    } else {
      delete newCompleted[stepNumber];
    }
    setCompletedSteps(newCompleted);
    const done = steps.every(s => newCompleted[s.stepNumber]);
    setAllDone(done);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const performReset = async () => {
    await resetStepProgress(recipeId);
    setCompletedSteps({});
    setAllDone(false);
  };

  const completedCount = Object.keys(completedSteps).length;
  const progress = steps.length > 0 ? completedCount / steps.length : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cookingLabel}>COOKING MODE</Text>
            <Text style={styles.recipeName} numberOfLines={1}>{recipeName}</Text>
          </View>
          {completedCount > 0 && (
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Ionicons name="refresh" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{completedCount} / {steps.length}</Text>
        </View>
      </View>

      {/* Steps */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.stepsContent}
        showsVerticalScrollIndicator={false}
      >
        {steps.map((step) => (
          <StepCheckbox
            key={step.id}
            stepNumber={step.stepNumber}
            instruction={step.instruction}
            duration={step.duration}
            completed={!!completedSteps[step.stepNumber]}
            onToggle={() => handleToggleStep(step.stepNumber)}
          />
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Celebration or status */}
      {allDone && (
        <View style={styles.celebrationOverlay}>
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Dish Ready!</Text>
            <Text style={styles.celebrationSub}>You've completed all the steps. Enjoy your meal!</Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={async () => {
                blurActiveElementOnWeb();
                await performReset();
                navigation.goBack();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneButtonText}>Back to Recipe</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reset Confirmation Overlay */}
      {showResetConfirm && (
        <View style={styles.celebrationOverlay}>
          <View style={styles.resetCard}>
            <View style={styles.resetIconCircle}>
              <Ionicons name="refresh-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.celebrationTitle}>Reset Progress?</Text>
            <Text style={styles.celebrationSub}>This will uncheck all completed steps and start fresh.</Text>
            
            <View style={styles.resetActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowResetConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.resetConfirmButton}
                onPress={async () => {
                  await performReset();
                  setShowResetConfirm(false);
                }}
              >
                <Text style={styles.resetConfirmButtonText}>Reset Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.small,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cookingLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.sienna,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.round,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  stepsContent: {
    padding: Spacing.lg,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  celebrationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    ...Shadows.large,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  celebrationSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  doneButton: {
    backgroundColor: Colors.sienna,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  resetCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '90%',
    ...Shadows.large,
  },
  resetIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resetActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  resetConfirmButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  resetConfirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
