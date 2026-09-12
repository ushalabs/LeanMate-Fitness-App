import { useCallback, RefObject } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';

export const useScrollToTopOnFocus = (scrollRef: RefObject<ScrollView | null>) => {
  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
    }, [scrollRef])
  );
};
