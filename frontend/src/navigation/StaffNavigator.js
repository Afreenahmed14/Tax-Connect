import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';

const Stack = createNativeStackNavigator();

// TODO: replace with bottom tabs + nested stacks for the Staff role
export default function StaffNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={StaffDashboardScreen} />
    </Stack.Navigator>
  );
}
