import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Platform, Alert, Image } from 'react-native';

import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface FamilyStatusMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive: Date;
  heartRate: number;
  heartRateHistory: number[];
  steps: number;
  sleepHours: number;
  location: string;
  batteryLevel: number;
  isEmergency: boolean;
}

interface FamilyMemberDrawerProps {
  visible: boolean;
  member: FamilyStatusMember | null;
  onClose: () => void;
}

const Section: React.FC<{ title: string; icon?: string } & { children: React.ReactNode }> = ({ title, icon, children }) => (
  <View style={{ marginBottom: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
      {icon ? <IconMC name={icon as any} size={18} color="#6B7280" /> : null}
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>{title}</Text>
    </View>
    <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
      {children}
    </View>
  </View>
);



export const FamilyMemberDrawer: React.FC<FamilyMemberDrawerProps> = ({ visible, member, onClose }) => {
  const renderHeartRateChart = () => {
    const data = member?.heartRateHistory ?? [];
    if (!data.length) {
      return (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>No heart rate data</Text>
        </View>
      );
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(1, max - min);
    return (
      <View style={{ padding: 16 }}>
        <View style={{ height: 100, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          {data.map((v, i) => {
            const h = ((v - min) / range) * 100 + 4;
            return <View key={i} style={{ width: 10, height: h, backgroundColor: '#EF4444', borderRadius: 4 }} />;
          })}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{min} bpm</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{max} bpm</Text>
        </View>
      </View>
    );
  };

  const renderLocationTimeline = () => {
    // Mocked coordinates for timeline (latest first)
    const coords = [
      { latitude: 37.775, longitude: -122.419, time: 'Now', label: member?.location ?? 'Current' },
      { latitude: 37.772, longitude: -122.414, time: '1h ago', label: 'Coffee Shop' },
      { latitude: 37.769, longitude: -122.409, time: '3h ago', label: 'Gym' },
      { latitude: 37.764, longitude: -122.429, time: '6h ago', label: 'Home' },
    ];

    const initial = coords[0];

    return (
      <View>
        {/* Map with polyline and markers (native only) */}
        <View style={{ height: 220, borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden', backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
          {Platform.OS !== 'web' ? (
            (() => {
              // Use eval to avoid static resolution on web bundlers
              // eslint-disable-next-line no-eval
              const mapsModule = eval('require')("react-native-maps");
              const { default: MapView, Marker, Polyline, PROVIDER_GOOGLE } = mapsModule;
              return (
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  initialRegion={{
                    latitude: initial.latitude,
                    longitude: initial.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                >
                  <Polyline
                    coordinates={[...coords].reverse().map(c => ({ latitude: c.latitude, longitude: c.longitude }))}
                    strokeColor="#3B82F6"
                    strokeWidth={4}
                  />
                  {coords.map((c, idx) => (
                    <Marker key={idx} coordinate={{ latitude: c.latitude, longitude: c.longitude }} title={c.label} description={c.time}>
                      <View style={{ backgroundColor: idx === 0 ? '#10B981' : '#FFFFFF', borderColor: '#3B82F6', borderWidth: 2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ color: idx === 0 ? '#FFFFFF' : '#1F2937', fontWeight: '700', fontSize: 12 }}>{idx + 1}</Text>
                      </View>
                    </Marker>
                  ))}
                </MapView>
              );
            })()
          ) : (
            <Text style={{ color: '#6B7280' }}>Map preview not available on web. Use mobile app.</Text>
          )}
        </View>

        {/* Timeline list */}
        <View style={{ padding: 16 }}>
          {coords.map((c, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 28, alignItems: 'center' }}>
                <IconMC name={idx === 0 ? 'map-marker' : 'map-marker-outline'} size={18} color={idx === 0 ? '#10B981' : '#6B7280'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#111827', fontWeight: '600' }}>{c.label}</Text>
                <Text style={{ color: '#6B7280', fontSize: 12 }}>{c.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderScreenTime = () => {
    const apps = [
      { name: 'YouTube', minutes: 42, color: '#EF4444', icon: 'youtube' },
      { name: 'WhatsApp', minutes: 35, color: '#10B981', icon: 'whatsapp' },
      { name: 'Instagram', minutes: 28, color: '#8B5CF6', icon: 'instagram' },
      { name: 'Maps', minutes: 16, color: '#3B82F6', icon: 'map' },
    ];
    const max = Math.max(...apps.map(a => a.minutes));
    return (
      <View style={{ padding: 16 }}>
        {apps.map((app, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconMC name={app.icon as any} size={16} color="#6B7280" />
                <Text style={{ color: '#111827', fontWeight: '600' }}>{app.name}</Text>
              </View>
              <Text style={{ color: '#6B7280' }}>{app.minutes}m</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 9999, overflow: 'hidden', marginTop: 6 }}>
              <View style={{ width: `${(app.minutes / max) * 100}%`, height: '100%', backgroundColor: app.color }} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' }}>
          {/* Header */}
          <View style={{ padding: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFB6C1', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {member?.avatar ? (
                    <Image
                      source={{ uri: member.avatar }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20 }}>{member?.name?.charAt(0) ?? '?'}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>{member?.name ?? 'Member'}</Text>
                  {!!member && (
                    <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
                      {member.location}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <IconMC name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', gap: 6 }}
                onPress={() => Alert.alert('Directions', `Navigating to ${member?.name || 'member'}...`)}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                  <IconMC name="directions" size={24} color="#3B82F6" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563' }}>Direction</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', gap: 6 }}
                onPress={() => Alert.alert('Call', `Calling ${member?.name || 'member'}...`)}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                  <IconMC name="phone" size={24} color="#10B981" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563' }}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', gap: 6 }}
                onPress={() => Alert.alert('Distract', 'Sent distraction!')}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
                  <IconMC name="alert" size={24} color="#EF4444" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563' }}>Distract</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', gap: 6 }}
                onPress={() => Alert.alert('Profile', `Viewing ${member?.name || 'member'}'s profile`)}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
                  <IconMC name="account" size={24} color="#8B5CF6" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563' }}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', gap: 6 }}
                onPress={() => Alert.alert('Message', `Messaging ${member?.name || 'member'}...`)}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' }}>
                  <IconMC name="message-text" size={24} color="#F97316" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563' }}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ padding: 20 }}>
              <Section title="Heart Rate" icon="heart">
                {renderHeartRateChart()}
              </Section>

              <Section title="Location Timeline" icon="timeline-clock-outline">
                {renderLocationTimeline()}
              </Section>

              <Section title="Screen Time by App" icon="cellphone-information">
                {renderScreenTime()}
              </Section>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FamilyMemberDrawer;


