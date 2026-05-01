import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';

interface MapCardProps {
  latitude: number;
  longitude: number;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title?: string;
  }>;
  height?: number;
  style?: ViewStyle;
  interactive?: boolean;
}

export function MapCard({
  latitude,
  longitude,
  markers = [],
  height = 160,
  style,
  interactive = false,
}: MapCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { height, backgroundColor: theme.card }, Shadows.md, style]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            title={marker.title}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});