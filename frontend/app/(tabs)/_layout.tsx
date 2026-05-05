
import { Tabs as ExpoTabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const theme = Colors.dark;

  return (
    <ExpoTabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B0F19',
          borderTopColor: '#2A3042',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#00f2fe',
        tabBarInactiveTintColor: '#9BA1A6',
      }}>
      <ExpoTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <ExpoTabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons name="receipt" size={24} color={color} />,
        }}
      />
      <ExpoTabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart" size={24} color={color} />,
        }}
      />
    </ExpoTabs>
  );
}
