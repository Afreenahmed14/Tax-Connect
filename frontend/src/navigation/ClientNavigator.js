import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientHomeScreen from '../screens/client/ClientHomeScreen';

const Stack = createNativeStackNavigator();

// TODO: replace with bottom tabs + nested stacks for the Client role
export default function ClientNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={ClientHomeScreen} />
    </Stack.Navigator>
  );
}
