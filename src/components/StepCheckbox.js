import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme';

export default function StepCheckbox({ stepNumber, instruction, duration, completed, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.container, completed && styles.completedContainer]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxRow}>
        <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
          {completed && <Ionicons name="checkmark" size={16} color={Colors.white} />}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.stepLabel}>Step {stepNumber}</Text>
          <Text style={[styles.instruction, completed && styles.completedText]}>
            {instruction}
          </Text>
          {duration ? (
            <View style={styles.durationRow}>
              <Ionicons name="timer-outline" size={14} color={completed ? Colors.textTertiary : Colors.accent} />
              <Text style={[styles.durationText, completed && styles.completedDuration]}>
                {duration} min
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  completedContainer: {
    backgroundColor: Colors.successBg,
    borderLeftColor: Colors.success,
    opacity: 0.85,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  textContainer: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  instruction: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.accent,
  },
  completedDuration: {
    color: Colors.textTertiary,
  },
});
