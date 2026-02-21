import React from 'react';
import { View, Text, StyleSheet } from 'react-native-web';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';

const Footer = () => {
  const { data: settings, loading } = useFirestoreDocument('settings', 'global');
  const siteName = settings?.logoText || 'BuiltWithHarsh';

  if (loading && window.location.hostname !== 'localhost') return null;

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <Text style={styles.text}>
          © {new Date().getFullYear()} {siteName}. Built with React Native Web & ❤️
        </Text>
        <Text style={[styles.text, styles.subText]}>
          Crafted for mobile developers, by a mobile developer
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 48,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(48, 54, 61, 0.5)',
    position: 'relative',
    zIndex: 1
  },
  container: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 32,
    alignItems: 'center'
  },
  text: {
    color: '#8B949E',
    fontFamily: "'Courier New', monospace",
    fontSize: 14
  },
  subText: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.7
  }
});

export default Footer;
