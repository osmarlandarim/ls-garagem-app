import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


export default function CarCreateScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [maiLine, setMaiLine] = useState('');
    const [year, setYear] = useState('');
    const [segment, setSegment] = useState('');
    const [color, setColor] = useState('');
    const [detailColor, setDetailColor] = useState('');
    const [baseColor, setBaseColor] = useState('');
    const [windowColor, setWindowColor] = useState('');
    const [interiorColor, setInteriorColor] = useState('');
    const [weelType, setWeelType] = useState('');
    const [sku, setSku] = useState('');
    const [skuCasting, setSkuCasting] = useState('');
    const [country, setCountry] = useState('');
    const [notes, setNotes] = useState('');
    const [isSTH, setIsSTH] = useState(false);
    const [foto, setFoto] = useState('');
    const [fotoLocal, setFotoLocal] = useState('');
    const [designer, setDesigner] = useState('');
    const [image, setImage] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [brands, setBrands] = useState<{ id: string; descricao: string }[]>([]);
    const [brandId, setBrandId] = useState<string | null>(null);
    // Busca marcas ao montar
    useEffect(() => {
        apiFetch('http://localhost:3000/marcas')
            .then(async (res) => {
                const data = await res.json();
                setBrands(Array.isArray(data) ? data : []);
            })
            .catch(() => setBrands([]));
    }, []);
    // Abre a câmera para tirar foto
    const handleTakePhoto = async () => {
        // Solicita permissão
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão negada', 'Permita o acesso à câmera para tirar uma foto.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
            setImage(Platform.OS === 'web' ? result.assets[0].uri : `data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !year || !brandId) {
            Alert.alert('Atenção', 'Nome, ano e marca são obrigatórios.');
            return;
        }
        setLoading(true);
        try {
            const res = await apiFetch('http://localhost:3000/carros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    maiLine,
                    year: Number(year),
                    segment,
                    color,
                    detailColor,
                    baseColor,
                    windowColor,
                    interiorColor,
                    weelType,
                    sku,
                    skuCasting,
                    country,
                    notes,
                    isSTH,
                    designer,
                    foto: image,
                    marcaId: brandId
                })
            });
            if (!res.ok) throw new Error('Erro ao cadastrar carro');
            Alert.alert('Sucesso', 'Carro cadastrado com sucesso!');
            router.back();
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível cadastrar o carro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Cadastro de Carro</Text>
            <View style={{ marginBottom: 16 }}>
                <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Marca*</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8 }}>
                    <Picker
                        selectedValue={brandId}
                        onValueChange={(itemValue) => setBrandId(itemValue)}
                        style={{ height: 48 }}
                    >
                        <Picker.Item label="Selecione a marca" value={null} />
                        {brands.map((b) => (
                            <Picker.Item key={b.id} label={b.descricao} value={b.id} />
                        ))}
                    </Picker>
                </View>
            </View>            
            <TextInput style={styles.input} placeholder="Nome do carro*" value={name} onChangeText={setName} />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="SKU*"
                    value={sku}
                    onChangeText={setSku}
                />
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="SKU Casting"
                    value={skuCasting}
                    onChangeText={setSkuCasting}
                />
            </View>
            <TextInput style={styles.input} placeholder="MaiLine" value={maiLine} onChangeText={setMaiLine} />
            <TextInput style={styles.input} placeholder="Segmento" value={segment} onChangeText={setSegment} />
            <TextInput style={styles.input} placeholder="Cor" value={color} onChangeText={setColor} />
            <TextInput style={styles.input} placeholder="Cor Detalhe" value={detailColor} onChangeText={setDetailColor} />
            <TextInput style={styles.input} placeholder="Cor Base" value={baseColor} onChangeText={setBaseColor} />
            <TextInput style={styles.input} placeholder="Cor Vidro" value={windowColor} onChangeText={setWindowColor} />
            <TextInput style={styles.input} placeholder="Cor Interior" value={interiorColor} onChangeText={setInteriorColor} />
            <TextInput style={styles.input} placeholder="Tipo de Roda" value={weelType} onChangeText={setWeelType} />
            <TextInput style={styles.input} placeholder="País" value={country} onChangeText={setCountry} />
            <TextInput style={styles.input} placeholder="Designer" value={designer} onChangeText={setDesigner} />
            <TextInput style={styles.input} placeholder="Notas" value={notes} onChangeText={setNotes} multiline />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ marginRight: 8 }}>Super Treasure Hunt?</Text>
                <TouchableOpacity
                    style={{ backgroundColor: isSTH ? '#007AFF' : '#ccc', borderRadius: 12, padding: 8 }}
                    onPress={() => setIsSTH(!isSTH)}
                >
                    <Text style={{ color: '#fff' }}>{isSTH ? 'Sim' : 'Não'}</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Ano*"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Cor"
                value={color}
                onChangeText={setColor}
            />
            <TextInput
                style={styles.input}
                placeholder="SKU"
                value={sku}
                onChangeText={setSku}
            />
            <View style={{ marginBottom: 16 }}>
                {imageUri ? (
                    <View style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 8, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        <Image
                            source={{ uri: imageUri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </View>
                ) : null}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#007AFF' }]} onPress={handleTakePhoto}>
                        <Text style={styles.buttonText}>Tirar foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#aaa' }]} onPress={() => setImageUri(null)}>
                        <Text style={styles.buttonText}>Remover foto</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Ou insira uma URL abaixo:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="URL da imagem"
                    value={image}
                    onChangeText={text => { setImage(text); setImageUri(text ? text : null); }}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Cadastrar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
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
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    cancelButton: {
        backgroundColor: '#eee',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
    },
});

import React, { useEffect, useState } from 'react';


import { apiFetch } from '@/utils/api';
import * as ImagePicker from 'expo-image-picker';

