import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Pressable, 
  Dimensions, 
  GestureResponderEvent, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { PlayerControls } from './PlayerControls';
import { Movie } from '../types';

interface VideoPlayerProps {
  movie: Movie;
  streamUrl: string;
  initialProgressSeconds: number;
  onClose: () => void;
  onSaveProgress: (seconds: number) => void;
  onClearProgress: () => void;
}

export function VideoPlayer({
  movie,
  streamUrl,
  initialProgressSeconds,
  onClose,
  onSaveProgress,
  onClearProgress
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialProgressSeconds);
  const [duration, setDuration] = useState(7200); // Default duration 2h if not fetched yet
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto Hide controls trigger
  const triggerAutoHide = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const showControlsAndAutoFade = () => {
    setControlsVisible(true);
    triggerAutoHide();
  };

  useEffect(() => {
    triggerAutoHide();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Sync / save progress periodically (mocked or custom hook caller)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying && currentTime > 0) {
        onSaveProgress(currentTime);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, currentTime]);

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
    showControlsAndAutoFade();
  };

  const handleSeekForward = () => {
    setCurrentTime(prev => Math.min(prev + 10, duration));
    showControlsAndAutoFade();
  };

  const handleSeekBackward = () => {
    setCurrentTime(prev => Math.max(prev - 10, 0));
    showControlsAndAutoFade();
  };

  // Click on the core screen toggles or double-clicks jump backward/forward
  const handleScreenPress = (evt: GestureResponderEvent) => {
    const { pageX } = evt.nativeEvent;
    const { width } = Dimensions.get('window');

    // Left 30% area is backward seek
    if (pageX < width * 0.3) {
      handleSeekBackward();
    } 
    // Right 30% area is forward seek
    else if (pageX > width * 0.7) {
      handleSeekForward();
    } 
    // Center is standard trigger controls display
    else {
      showControlsAndAutoFade();
    }
  };

  // Simulated playback ticker for local Web Player emulation
  useEffect(() => {
    let playTicker: any;
    if (isPlaying) {
      playTicker = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            onClearProgress();
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (playTicker) clearInterval(playTicker);
    };
  }, [isPlaying, duration]);

  return (
    <Pressable style={styles.container} onPress={handleScreenPress}>
      
      {/* Background Simulated player view */}
      <View style={styles.videoPlaceholder}>
        <Text style={styles.playingText}>Reproduciendo Stream HLS Activo...</Text>
        <Text style={styles.streamingUrlText} numberOfLines={1}>{streamUrl}</Text>
        
        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={styles.bufferingLabel}>Cargando búfer...</Text>
          </View>
        )}
      </View>

      {/* Reusable D-pad custom controls */}
      <PlayerControls
        visible={controlsVisible}
        onTogglePlay={handleTogglePlay}
        isPlaying={isPlaying}
        onSeekBackward={handleSeekBackward}
        onSeekForward={handleSeekForward}
        currentTime={currentTime}
        duration={duration}
        movieTitle={movie.title}
        onClose={onClose}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
    padding: 20,
  },
  playingText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streamingUrlText: {
    color: '#666666',
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 5, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingLabel: {
    color: '#ffffff',
    fontSize: 13,
    marginTop: 12,
  },
});
