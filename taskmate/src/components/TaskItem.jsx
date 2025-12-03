// src/components/TaskItem.jsx
import React, { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colorOfName } from '../constants/categories';
import { colorOfPriority } from '../constants/priorities';
import { useTheme } from '../constants/themeContext';

// Utility to determine deadline info
function deadlineInfo(deadline) {
  if (!deadline) return { status: 'none', text: '' };
  const todayStr = new Date().toISOString().slice(0, 10);
  const t = new Date(`${todayStr}T00:00:00`);
  const d = new Date(`${deadline}T00:00:00`);
  if (isNaN(d.getTime())) return { status: 'none', text: '' };
  const diffMs = d - t;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return { status: 'overdue', text: 'Overdue' };
  if (days === 0) return { status: 'today', text: 'Deadline: Hari ini' };
  return { status: 'future', text: `Sisa ${days} hari` };
}

export default function TaskItem({ task, categories, onToggle, onDelete }) {
  const router = useRouter();
  const isDone = task.status === 'done';
  const [cardHeight, setCardHeight] = useState(0);

  const catColor = colorOfName(task.category ?? 'Umum', categories);
  const prioColor = colorOfPriority(task.priority ?? 'Low');
  const raw = typeof task.progress === 'number' ? task.progress : 0;
  const pct = Math.max(0, Math.min(100, raw));
  const info = deadlineInfo(task.deadline);

  const { theme } = useTheme();

  // === Shared value for swipe ===
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 100;

  // === New shared value for the "nudge" animation ===
  const nudgeX = useSharedValue(0);

  // 👇 Run the looping nudge when task is done
  useEffect(() => {
    if (isDone) {
      nudgeX.value = withRepeat(
        withSequence(
          withTiming(10, { duration: 250 }), // slide right
          withTiming(0, { duration: 250 })   // slide back
        ),
        -1, // infinite
        true
      );
    } else {
      cancelAnimation(nudgeX);
      nudgeX.value = 0;
    }
  }, [isDone]);

  const confirmDelete = () => {
    Alert.alert(
      "Konfirmasi",
      "Apakah kamu yakin ingin menghapus tugas ini?",
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => {
            translateX.value = withTiming(0);
          },
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            translateX.value = withTiming(500, { duration: 200 }, () => {
              runOnJS(onDelete)?.(task);
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // === Gesture setup ===
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      if (isDone) {
        translateX.value = Math.max(0, event.translationX);
      }
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(confirmDelete)();
      } else {
        translateX.value = withTiming(0);
      }
    });

  // === Animated styles ===
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + nudgeX.value }, // 🔥 combine swipe & nudge
    ],
  }));

  return (
    <View
      style={{
        position: 'relative',
        marginBottom: 12,
        borderColor: theme.border,
      }}
      onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
    >
      {/* background layer (delete) */}
      {isDone && (
        <View
          style={[
            styles.deleteBackground,
            { backgroundColor: theme.danger, height: cardHeight },
          ]}
        >
          <Text style={styles.deleteText}>Hapus</Text>
        </View>
      )}

      {/* swipeable + animated card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            isDone && { opacity: 1 },
            theme.statusColors?.[info.status] && {
              backgroundColor: theme.statusColors[info.status].bg,
              borderColor: theme.statusColors[info.status].border,
            },
            cardAnimatedStyle,
          ]}
        >
          <TouchableOpacity onPress={() => onToggle?.(task)} style={{ flex: 1 }}>
            {/* title */}
            <Text
              style={[
                styles.title,
                isDone && styles.strike,
                { color: theme.text },
              ]}
            >
              {task.title}
            </Text>

            {/* deadline */}
            {!!task.deadline && (
              <Text
                style={[
                  styles.deadline,
                  {
                    color:
                      info.status === 'overdue'
                        ? theme.statusColors.overdue.text
                        : theme.subtext,
                    fontWeight: info.status === 'overdue' ? '700' : '400',
                  },
                ]}
              >
                Deadline: {task.deadline} {info.text ? `• ${info.text}` : ''}
              </Text>
            )}

            {/* description */}
            {!!task.description && (
              <Text style={[styles.desc, { color: theme.subtext }]}>
                {task.description}
              </Text>
            )}

            {/* badges */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <View
                style={[
                  styles.badge,
                  {
                    borderColor: catColor,
                    backgroundColor:
                      theme.mode === 'dark'
                        ? `${catColor}40`
                        : `${catColor}20`,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: catColor }]}>
                  {task.category ?? 'Umum'}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  {
                    borderColor: prioColor,
                    backgroundColor:
                      theme.mode === 'dark'
                        ? `${prioColor}40`
                        : `${prioColor}20`,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: prioColor }]}>
                  {task.priority ?? 'Low'}
                </Text>
              </View>
            </View>

            {/* progress bar */}
            <View
              style={[
                styles.progressWrap,
                { backgroundColor: theme.progressBackground },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${pct}%`,
                    backgroundColor: theme.progressFill,
                  },
                ]}
              />
              <Text
                style={[styles.progressText, { color: theme.subtext }]}
              >
                {pct}%
              </Text>
            </View>
          </TouchableOpacity>

          {/* action buttons */}
          <View style={{ gap: 6 }}>
            <TouchableOpacity onPress={() => router.push(`/edit/${task.id}`)}>
              <Text style={{ color: theme.progressFill }}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  strike: { textDecorationLine: 'line-through' },
  deadline: { fontSize: 12, marginBottom: 4 },
  desc: { marginRight: 2 },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  progressWrap: {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: { height: '100%' },
  progressText: {
    position: 'absolute',
    right: 8,
    top: -18,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 16,
    paddingLeft: 20,
    zIndex: -1, // stays below the card
  },

  deleteText: { color: '#fff', fontWeight: '700' },
});
