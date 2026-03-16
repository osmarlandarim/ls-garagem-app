import { CardCar } from '@/components/card-car';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/utils/api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default function MinhaGaragemScreen() {
  const { isAuthenticated } = useAuth();
  const [garagem, setGaragem] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGaragem() {
      setLoading(true);
      try {
        const response = await apiFetch('http://localhost:3000/garagens');
        const data = await response.json();
        setGaragem(data);
      } catch (error) {
        setGaragem([]);
      } finally {
        setLoading(false);
      }
    }
    fetchGaragem();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Garagem</Text>
      <FlatList
        data={garagem}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => <CardCar carro={item.carro} />}
        ListEmptyComponent={<Text>Nenhum carro na garagem.</Text>}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={{ gap: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
