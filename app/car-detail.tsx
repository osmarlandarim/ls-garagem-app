import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Garagem = {
  id: string;
  usuarioId: string;
  carroId: string;
  listaGaragemId?: string | null;
  favorito: boolean;
  carro?: any;
};

type CarDetail = {
  id: string | number;
  foto?: string;
  imagem?: string;
  image?: string;
  imagemLocal?: string;
  name: string;
  year?: string | number;
  color?: string;
  sku?: string;
  garagem?: Garagem;
};

export default function CarDetailScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  // Usar Record<string, any> para permitir acesso dinâmico por string
  const car: Record<string, any> | null = params.car ? JSON.parse(params.car as string) : null;

  React.useEffect(() => {
    if (car?.name) {
      navigation.setOptions?.({ title: car.name });
    }
  }, [car?.name, navigation]);

  if (!car) {
    return (
      <View style={styles.centered}><Text>Carro não encontrado.</Text></View>
    );
  }

  // Lista de campos para exibir
  // Mapeamento de campos para exibir com títulos em português
  const fieldMap: { [key: string]: string } = {
    name: 'Nome',
    mainLine: 'Linha',
    year: 'Ano',
    segment: 'Segmento',
    color: 'Cor',
    detailColor: 'Cor Detalhe',
    baseColor: 'Cor Base',
    windowColor: 'Cor da Janela',
    interiorColor: 'Cor Interior',
    weelType: 'Tipo de Roda',
    sku: 'SKU',
    skuCasting: 'SKU Casting',
    country: 'País',
    notes: 'Notas',
    designer: 'Designer',
    favorito: 'Favorito',
  };

  // Monta lista de campos dinâmicamente
  // Remover id, marcaid, fotoLocal/imagemLocal/foto/imagem/image/garagem
  // Garantir que corDetalhe (detailColor) fique por último
  const excludeFields = ['id', 'marcaid', 'marcaId', 'isSTH', 'imagemLocal', 'imageLocal', 'fotoLocal', 'foto', 'imagem', 'image', 'garagem'];
  let keys = Object.keys(car).filter(key => !excludeFields.includes(key) && car[key] !== undefined && car[key] !== null && car[key] !== '');
  // Move corDetalhe/detailColor para o final
  const corDetalheIdx = keys.findIndex(k => k.toLowerCase() === 'cordetalhe' || k.toLowerCase() === 'detailcolor');
  if (corDetalheIdx !== -1) {
    const [corDetalheKey] = keys.splice(corDetalheIdx, 1);
    keys.push(corDetalheKey);
  }
  const fields = keys.map(key => ({
    label: fieldMap[key] || key,
    value: key === 'favorito' ? (car.garagem?.favorito ? 'Sim' : 'Não') : car[key],
  }));

  // Divide os campos em duas colunas
  const left = fields.filter((_, i) => i % 2 === 0);
  const right = fields.filter((_, i) => i % 2 === 1);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: car.imagemLocal || car.foto || car.imagem || car.image }}
        style={styles.image}
        contentFit="contain"
      />
      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          {left.map((item, idx) => (
            <View key={idx} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value ?? '-'}</Text>
            </View>
          ))}
        </View>
        <View style={styles.infoCol}>
          {right.map((item, idx) => (
            <View key={idx} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value ?? '-'}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 220, backgroundColor: '#f9f9f9', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  infoCol: { flex: 1 },
  infoItem: { marginBottom: 18 },
  infoLabel: { fontWeight: 'bold', fontSize: 13, color: '#888', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#222' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});