import React from 'react'
import { View, Text, Image, ActivityIndicator } from 'react-native'

interface SplashBrandingProps {
  appName?: string
  logoUrl?: string
}

export const SplashBranding: React.FC<SplashBrandingProps> = ({ appName, logoUrl }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={{ width: 96, height: 96, borderRadius: 16, marginBottom: 16 }} />
      ) : (
        <View style={{ width: 96, height: 96, borderRadius: 16, marginBottom: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEE' }}>
          <Text style={{ fontSize: 40 }}>🏷️</Text>
        </View>
      )}
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>{appName || 'Loading...'}</Text>
      <ActivityIndicator color="#FA7272" />
    </View>
  )
}

export default SplashBranding


