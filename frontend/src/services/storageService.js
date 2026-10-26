import * as SecureStore from 'expo-secure-store';

const KEY = 'tax_connect_token';
export const saveToken = (t) => SecureStore.setItemAsync(KEY, t);
export const getToken = () => SecureStore.getItemAsync(KEY);
export const clearToken = () => SecureStore.deleteItemAsync(KEY);
