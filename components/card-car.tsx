import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type Carro = {
    id: string;
    name: string;
    year: number;
    segment: string;
    color: string;
    sku: string;
    foto: string;
    fotoLocal?: string;
    imageLocal?: string;
};

interface CardCarProps {
    carro: Carro;
}

export function CardCar({ carro }: CardCarProps) {
    if (!carro) return null;
    const imageSource = carro.imageLocal
        ? { uri: carro.imageLocal }
        : carro.fotoLocal
            ? { uri: carro.fotoLocal }
            : { uri: carro.foto };
    return (
        <View style={styles.card}>
            <Image source={imageSource} style={styles.image} resizeMode="contain" />
            <View style={styles.info}>
                <Text style={styles.name}>{carro.name}</Text>
                <Text style={styles.detail}>{carro.year} • {carro.segment}</Text>
                <Text style={styles.detail}>{carro.sku}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 0,
        overflow: 'hidden',
        elevation: 2,
        flex: 1,
        minWidth: 0,
        marginRight: 0,
        alignItems: 'stretch',
    },
    image: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#eee',
        alignSelf: 'center',
    },
    info: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detail: {
        fontSize: 14,
        color: '#555',
    },
});
