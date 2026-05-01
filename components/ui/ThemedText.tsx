import { Text, type TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type ThemedTextProps = TextProps & {
  variant?: 'default' | 'secondary' | 'tertiary' | 'title' | 'subtitle' | 'label';
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  variant = 'default',
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  const color = {
    default: theme.text,
    secondary: theme.textSecondary,
    tertiary: theme.textTertiary,
    title: theme.text,
    subtitle: theme.textSecondary,
    label: theme.textTertiary,
  }[variant];

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    color: '#059669',
  },
});