import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import useAuth from '../../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try { await login(identifier, password); }
    catch (e) { Alert.alert('Login failed', e.message || 'Try again'); }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16 }}>Tax Connect</Text>
      <TextInput placeholder="Phone or email" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" style={{ borderWidth: 1, padding: 10, marginBottom: 12 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 10, marginBottom: 12 }} />
      <Button title="Login" onPress={onLogin} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
      <Button title="Forgot password?" onPress={() => navigation.navigate('ForgotPassword')} />
    </View>
  );
}
