import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import StaffNavigator from './StaffNavigator';
import ClientNavigator from './ClientNavigator';

export default function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  if (!user) return <AuthNavigator />;
  if (user.role === ROLES.ADMIN) return <AdminNavigator />;
  if (user.role === ROLES.STAFF) return <StaffNavigator />;
  return <ClientNavigator />;
}
