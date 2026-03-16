import { CardCar } from '@/components/card-car';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/utils/api';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


export default function MinhaGaragemScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [garagem, setGaragem] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchGaragem() {
        setLoading(true);
        try {
          const url = search
            ? `http://localhost:3000/garagens?search=${encodeURIComponent(search)}`
            : 'http://localhost:3000/garagens';
          const response = await apiFetch(url);
          const data = await response.json();
          if (isActive) setGaragem(data);
        } catch (error) {
          if (isActive) setGaragem([]);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      fetchGaragem();
      return () => {
        isActive = false;
      };
    }, [search])
  );

  // Busca imediata a cada letra
  const handleSearchChange = (text: string) => {
    setSearchInput(text);
  };

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
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar na garagem..."
        value={searchInput}
        onChangeText={handleSearchChange}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
      <FlatList
        data={garagem}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => {
          // Garante que imageLocal seja passado corretamente
          const carro = {
            ...item.carro,
            imagemLocal: item.carro.imageLocal || item.carro.imagemLocal || item.carro.fotoLocal || item.carro.foto || item.carro.imagem || item.carro.image,
          };
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/car-detail', params: { car: JSON.stringify(carro) } })}
              style={{ flex: 1 }}
            >
              <CardCar carro={carro} />
            </TouchableOpacity>
          );
        }}
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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
