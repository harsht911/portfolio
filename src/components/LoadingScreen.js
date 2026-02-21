import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native-web';

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ActivityIndicator size="large" color="#3FB950" />
                <Text style={styles.logoText}>BuiltWith<Text style={styles.accentText}>Harsh</Text></Text>
                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>
                <Text style={styles.loadingText}>Initializing secure connection...</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
    },
    content: {
        alignItems: 'center',
        gap: 24
    },
    logoText: {
        color: '#E6EDF3',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        fontFamily: "'Outfit', sans-serif"
    },
    accentText: {
        color: '#3FB950'
    },
    loadingText: {
        color: '#8B949E',
        fontSize: 14,
        fontFamily: "'Courier New', monospace",
        marginTop: 12
    },
    progressBar: {
        width: 200,
        height: 2,
        backgroundColor: 'rgba(48, 54, 61, 0.5)',
        borderRadius: 1,
        overflow: 'hidden'
    },
    progressFill: {
        width: '60%',
        height: '100%',
        backgroundColor: '#3FB950',
        // In a real app we'd animate this, but static is fine for a quick splash
    }
});

export default LoadingScreen;
