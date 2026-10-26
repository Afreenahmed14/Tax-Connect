import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/dashboard/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

// TODO: replace with bottom tabs + nested stacks for the Admin role
export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}
