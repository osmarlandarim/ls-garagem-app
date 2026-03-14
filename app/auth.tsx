import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/context/auth-context';
import { saveToken } from '@/utils/auth-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function AuthScreen() {
  const [type, setType] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuthenticated } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    try {
      const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(`http://localhost:3000${endpoint}` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Exibir mensagem específica para cadastro
        if (type === 'register' && (data.error === 'Email já cadastrado.' || data.message === 'Email já cadastrado.')) {
          Alert.alert('Erro', 'Email já cadastrado.');
        } else if (typeof data.error === 'string' || typeof data.message === 'string') {
          Alert.alert('Erro', data.error || data.message || 'Erro desconhecido');
        } else {
          Alert.alert('Erro', JSON.stringify(data));
        }
        return;
      }
      if (data.token) {
        await saveToken(data.token);
      }
      setAuthenticated(true);
      router.replace('/');
      // Alert opcional: Alert.alert('Sucesso', type === 'login' ? 'Login realizado!' : 'Cadastro realizado!');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AuthForm
        type={type}
        onSubmit={handleSubmit}
        onSwitch={() => setType(type === 'login' ? 'register' : 'login')}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
