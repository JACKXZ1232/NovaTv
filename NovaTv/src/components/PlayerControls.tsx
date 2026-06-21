import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';

interface PlayerControlsProps {
  visible: boolean;
  onTogglePlay: () => void;
  isPlaying: boolean;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  currentTime: number;
  duration: number;
  movieTitle: string;
  onClose: () => void;
  onProgressBarPress?: (percentage: number) => void;
}

export function PlayerControls({
  visible,
  onTogglePlay,
  isPlaying,
  onSeekBackward,
  onSeekForward,
  currentTime,
  duration,
  movieTitle,
  onClose,
  onProgressBarPress
}: PlayerControlsProps) {

  if (!visible) return null;

  // Format progress helpers: seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (num: number) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.absoluteContainer}>
      
      {/* Top bar with Movie Title and Close Button */}
      <View style={styles.topBar}>
        <Text style={styles.title} numberOfLines={1}>{movieTitle}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeButtonText}>✕ Cerrar</Text>
        </TouchableOpacity>
      </View>

      {/* Middle controls: Play, Pause, Jump 10s left/right */}
      <View style={styles.midControlsBlock}>
        <TouchableOpacity style={styles.skipButton} onPress={onSeekBackward} activeOpacity={0.7}>
          <Text style={styles.skipText}>⏪ 10s</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButtonMain} onPress={onTogglePlay} activeOpacity={0.7}>
          <Text style={styles.playIconMainText}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={onSeekForward} activeOpacity={0.7}>
          <Text style={styles.skipText}>10s ⏩</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom controls: Timestamps and interactive Progress Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
        </View>

        {/* Progress Bar Back */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>

        {Platform.OS === 'web' && (
          <View style={styles.controlsLegend}>
            <Text style={styles.legendText}>Control Remoto TV: OK (Pausa/Play) • Izquierda/Derecha (±10s) • Arriba (Controles)</Text>
          </View>
        )}
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 28,
    zIndex: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  midControlsBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  skipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 50,
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  playButtonMain: {
    backgroundColor: '#E50914',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  playIconMainText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomBar: {
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'between' as any,
    alignItems: 'center',
    marginBottom: 6,
  },
  timeLabel: {
    color: '#999999',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 3,
  },
  controlsLegend: {
    marginTop: 10,
    alignItems: 'center',
  },
  legendText: {
    color: '#666666',
    fontSize: 10,
    textAlign: 'center',
  },
});
