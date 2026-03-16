// Componente para exibir o card do carro com fallback de imagem
interface Car {
  id: string | number;
  foto?: string;
  imagem?: string;
  image?: string;
  imagemLocal?: string;
  name: string;
  year?: string | number;
  color?: string;
  sku?: string;
  garagem?: {
    id: string;
    usuarioId: string;
    carroId: string;
    listaGaragemId?: string | null;
    favorito: boolean;
    carro?: any;
  };
}

interface CarCardProps {
  car: Car;
  styles: any; // You can replace 'any' with the correct type if desired
}


function CarCard({ car, styles }: CarCardProps) {
  const [imgUri, setImgUri] = React.useState(car.imagemLocal || car.foto || car.imagem || car.image);
  const [favorito, setFavorito] = React.useState(car.garagem?.favorito ?? false);
  const [garagem, setGaragem] = React.useState(car.garagem ?? null);

  // Adiciona carro à garagem
  const handleAddToGarage = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/garagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carroId: car.id, favorito: false })
      });
      if (!res.ok) throw new Error('Erro ao adicionar à garagem');
      const data = await res.json();
      setGaragem(data);
      setFavorito(false);
      Alert.alert('Sucesso', 'Carro adicionado à garagem!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível adicionar à garagem.');
    }
  };

  // Remove carro da garagem
  const handleRemoveFromGarage = async () => {
    if (!garagem?.id) return;
    try {
      const res = await apiFetch(`http://localhost:3000/garagens/${garagem.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erro ao remover da garagem');
      setGaragem(null);
      setFavorito(false);
      Alert.alert('Removido', 'Carro removido da garagem!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível remover da garagem.');
    }
  };

  // Alterna favorito carro na garagem
  const handleFavorite = async () => {
    if (!garagem?.id) {
      Alert.alert('Atenção', 'Adicione o carro à garagem antes de favoritar.');
      return;
    }
    try {
      const novoFavorito = !garagem.favorito;
      const res = await apiFetch(`http://localhost:3000/garagens/${garagem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorito: novoFavorito })
      });
      if (!res.ok) throw new Error('Erro ao atualizar favorito');
      setFavorito(novoFavorito);
      setGaragem({ ...garagem, favorito: novoFavorito });
      Alert.alert('Sucesso', novoFavorito ? 'Carro favoritado!' : 'Favorito removido!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível atualizar favorito.');
    }
  };

  return (
    <View style={styles.cardSmall} key={car.id}>
      <View style={styles.imageContainerSmall}>
        <Image
          source={{ uri: imgUri }}
          style={styles.imageSmall}
          contentFit="contain"
          placeholder="https://via.placeholder.com/150"
          onError={() => setImgUri('https://via.placeholder.com/150')}
        />
      </View>
      <View style={styles.cardInfoSmall}>
        <Text style={styles.cardTitleSmall} numberOfLines={2}>{car.name}</Text>
        {car.sku && (
          <Text style={[styles.cardSubSmall, { color: '#888', fontSize: 10 }]} numberOfLines={1}>{car.sku}</Text>
        )}
        <Text style={styles.cardSubSmall}>{car.year} {car.color ? `- ${car.color}` : ''}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
          {garagem ? (
            <TouchableOpacity onPress={handleRemoveFromGarage} style={{ marginHorizontal: 8 }}>
              <IconSymbol name="minus" color="#E61C23" size={24} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleAddToGarage} style={{ marginHorizontal: 8 }}>
              <IconSymbol name="plus" color="#007AFF" size={24} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleFavorite}
            style={{ marginHorizontal: 8 }}
            disabled={!garagem}
          >
            <IconSymbol
              name={garagem && garagem.favorito ? "star.fill" : "star"}
              color={garagem ? (garagem.favorito ? "#FFD700" : "#ddd") : "#ccc"}
              size={24}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento.')} style={{ marginHorizontal: 8 }}>
            <IconSymbol name="questionmark.circle" color="#888" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiFetch } from '@/utils/api';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCars, setSelectedCars] = useState<any[] | null>(null); // Alterado para Array
  const [loadingCard, setLoadingCard] = useState(false);

  // ...existing code...
  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
    }
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar carro..."
        value={query}
        onChangeText={async (text) => {
          setQuery(text);
          if (text.length === 0) {
            setResults([]);
            setSelectedCars(null); // Limpa os cards ao limpar o campo
            return;
          }
          setSelectedCars(null); // Sempre limpa os cards ao digitar
          setLoading(true);
          try {
            const res = await apiFetch(`http://localhost:3000/carros/search?q=${encodeURIComponent(text)}&pageSize=5`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : [data]);
          } catch {
            setResults([]);
          } finally {
            setLoading(false);
          }
        }}
        returnKeyType="search"
        autoFocus
      />

      {loading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {/* Lista de nomes (Busca rápida) */}
      {(!selectedCars || selectedCars.length === 0) && !loading && (
        <FlatList
          data={results}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => {
            const name = item?.name || item?.nome || (typeof item === 'string' ? item : '');
            return (
              <TouchableOpacity
                style={styles.item}
                onPress={async () => {
                  setQuery(name);
                  setResults([]); // Limpa os links encontrados
                  setLoadingCard(true);
                  setSelectedCars(null);
                  try {
                    const res = await apiFetch(`http://localhost:3000/carros?search=${encodeURIComponent(name)}`);
                    const data = await res.json();
                    setSelectedCars(Array.isArray(data) ? data : [data]);
                  } catch {
                    setSelectedCars(null);
                  } finally {
                    setLoadingCard(false);
                  }
                }}
              >
                <Text style={styles.link}>{name}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={query.length > 0 && results.length === 0 ? <Text style={styles.empty}>Nenhum carro encontrado.</Text> : null}
        />
      )}

      {/* Área de exibição dos Cards (abaixo do campo de busca) */}
      {loadingCard && <ActivityIndicator size="large" color="#E61C23" />}
      {selectedCars && selectedCars.length > 0 && (
        <View style={styles.cardsContainer}>          
          <FlatList
            data={selectedCars}
            keyExtractor={(car, idx) => car.id?.toString() || idx.toString()}
            numColumns={2}
            columnWrapperStyle={styles.cardRow}
            renderItem={({ item: car }) => <CarCard car={car} styles={styles} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardsContainer: {
    flex: 1,
    marginTop: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardSmall: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    marginHorizontal: 4,
    flex: 1,
    minWidth: 150,
    maxWidth: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageContainerSmall: {
    width: '100%',
    height: 90,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  imageSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  cardInfoSmall: {
    padding: 8,
    alignItems: 'center',
  },
  cardTitleSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cardSubSmall: {
    fontSize: 11,
    color: '#E61C23',
    fontWeight: '600',
    textAlign: 'center',
  },
  closeHeader: {
    padding: 10,
    alignItems: 'flex-end',
  },
  closeText: {
    color: '#E61C23',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 24,
  },
});