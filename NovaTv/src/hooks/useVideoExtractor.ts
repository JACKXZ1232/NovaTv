import { useState, useCallback } from 'react';

export type VideoExtractorState =
  | { status: 'idle' }
  | { status: 'extracting'; embedUrl: string; attemptIndex: number }
  | { status: 'ready'; m3u8Url: string }
  | { status: 'error' };

export function useVideoExtractor(embedUrls: (string | null | undefined)[]) {
  const validUrls = embedUrls.filter(Boolean) as string[];
  const [state, setState] = useState<VideoExtractorState>({ status: 'idle' });

  const start = useCallback(() => {
    if (validUrls.length === 0) {
      setState({ status: 'error' });
      return;
    }
    setState({ status: 'extracting', embedUrl: validUrls[0], attemptIndex: 0 });
  }, [validUrls]);

  const onSuccess = useCallback((m3u8Url: string) => {
    setState({ status: 'ready', m3u8Url });
  }, []);

  const onError = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'extracting') {
        return { status: 'error' };
      }
      const nextIndex = prev.attemptIndex + 1;
      if (nextIndex >= validUrls.length) {
        return { status: 'error' };
      }
      // intentar el siguiente embed
      return {
        status: 'extracting',
        embedUrl: validUrls[nextIndex],
        attemptIndex: nextIndex,
      };
    });
  }, [validUrls]);

  return { state, start, onSuccess, onError };
}
