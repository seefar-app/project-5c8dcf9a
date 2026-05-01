import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type ThemedViewProps = ViewProps & {
  variant?: 'default' | 'secondary' | 'card';
};

export function ThemedView({ style, variant = 'default', ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  
  const backgroundColor = {
    default: theme.background,
    secondary: theme.backgroundSecondary,
    card: theme.card,
  }[variant];

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}