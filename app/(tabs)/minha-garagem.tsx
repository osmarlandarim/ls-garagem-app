import { CardCar } from '@/components/card-car';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/utils/api';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


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
          // item.id é o id da garagem, necessário para o DELETE
          const carro = {
            ...item.carro,
            imagemLocal: item.carro.imageLocal || item.carro.imagemLocal || item.carro.fotoLocal || item.carro.foto || item.carro.imagem || item.carro.image,
          };
          const handleRemove = async () => {
            try {
              setLoading(true);
              await apiFetch(`http://localhost:3000/garagens/${item.id}`, { method: 'DELETE' });
              setGaragem(prev => prev.filter((g: any) => g.id !== item.id));
              Alert.alert('Sucesso', 'Carro removido da garagem!');
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível remover o carro.');
            } finally {
              setLoading(false);
            }
          };

          const handleToggleFavorito = async () => {
            try {
              setLoading(true);
              const novoFavorito = !item.favorito;
              await apiFetch(`http://localhost:3000/garagens/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorito: novoFavorito })
              });
              setGaragem(prev => prev.map((g: any) => g.id === item.id ? { ...g, favorito: novoFavorito } : g));
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível atualizar favorito.');
            } finally {
              setLoading(false);
            }
          };
          return (
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/car-detail', params: { car: JSON.stringify(carro) } })}
                  style={{ flex: 1 }}
                >
                  <CardCar carro={carro} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 8, marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={handleRemove}
                  style={{ backgroundColor: '#e53935', borderRadius: 20, padding: 8, alignItems: 'center', justifyContent: 'center' }}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="minus" size={5} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleToggleFavorito}
                  style={{ marginLeft: 12, borderRadius: 20, padding: 8, alignItems: 'center', justifyContent: 'center' }}
                  activeOpacity={0.7}
                >
                  <IconSymbol name={item.favorito ? 'star.fill' : 'star'} size={22} color={item.favorito ? '#FFD600' : '#bbb'} />
                </TouchableOpacity>
              </View>
            </View>
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
