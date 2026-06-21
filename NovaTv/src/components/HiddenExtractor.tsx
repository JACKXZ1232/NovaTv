import React, { useRef, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';

interface Props {
  embedUrl: string;
  onSuccess: (m3u8Url: string) => void;
  onError: () => void;
  timeoutMs?: number;
}

const HiddenExtractor: React.FC<Props> = ({
  embedUrl,
  onSuccess,
  onError,
  timeoutMs = 20000,
}) => {
  const found = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Iniciar timeout al montar
  useEffect(() => {
    timer.current = setTimeout(() => {
      if (!found.current) {
        onError();
      }
    }, timeoutMs);
    
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [onError, timeoutMs]);

  const handleRequest = useCallback(
    (request: { url: string }) => {
      const url = request.url;
      if (!found.current && url.includes('.m3u8')) {
        found.current = true;
        if (timer.current) {
          clearTimeout(timer.current);
        }
        onSuccess(url);
        return false; // bloquear la request, ya tenemos el link
      }
      return true; // dejar pasar el resto
    },
    [onSuccess]
  );

  return (
    <View style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}>
      <WebView
        source={{ uri: embedUrl }}
        onShouldStartLoadWithRequest={handleRequest}
        onError={() => {
          if (!found.current) {
            onError();
          }
        }}
        javaScriptEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      />
    </View>
  );
};

export default HiddenExtractor;
