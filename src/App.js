import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native-web';

// Components
import CodeBackground from './components/CodeBackground';
import Header from './components/Header';
import Footer from './components/Footer';
import WebView from './components/WebView';

// Pages
import Home from './pages/Home';
import Skills from './pages/Skills';
import Experience from './pages/Experience';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import LoadingScreen from './components/LoadingScreen';

import { useFirestoreDocument } from './hooks/useFirestoreDocument';

import { trackError, trackEvent, trackVisit } from './utils/analytics';
import { isDev } from './utils/env';

const App = () => {
  const { data: settings, loading: settingsLoading, error: settingsError } = useFirestoreDocument('settings', 'global');
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');

  useEffect(() => {
    if (!settingsLoading) {
      console.log("Firebase Diagnostic:", {
        connected: !!settings,
        hasError: !!settingsError,
        error: settingsError?.message,
        hostname: window.location.hostname
      });
    }
  }, [settingsLoading, settings, settingsError]);

  useEffect(() => {
    // 1. Record actual visit in Firestore for Admin Dashboard
    if (!isAdmin) {
      trackVisit();
    }

    // 2. Crashlytics Alternative: Track global JS errors
    const handleError = (event) => {
      trackError(event.error || event.message, true);
    };

    // 2. Track unhandled promise rejections
    const handleRejection = (event) => {
      trackError(`Promise Rejection: ${event.reason}`, false);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // 3. Initial Page View Tracking
    trackEvent('app_mount', { screen: isAdmin ? 'Admin' : 'Portfolio' });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const newIsAdmin = window.location.hash === '#admin';
      setIsAdmin(newIsAdmin);
      trackEvent('navigation_hash_change', { hash: window.location.hash || 'home' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Updated logic in src/App.js
  useEffect(() => {
    if (settings && settings.faviconUrl) {
      // ... favicon logic remains the same ...
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      const value = settings.faviconUrl;
      const emojiRegex = /\p{Emoji}/u;

      if (emojiRegex.test(value) && value.length < 5) {
        // 1. Handle Emoji
        const canvas = document.createElement('canvas');
        canvas.height = 32; canvas.width = 32;
        const ctx = canvas.getContext('2d');
        ctx.font = '28px serif';
        ctx.fillText(value, 0, 28);
        link.href = canvas.toDataURL();
      }
      else if (value.startsWith('http') || value.startsWith('data:')) {
        // 2. Handle Remote URL or Base64
        link.href = value;
      }
      else {
        // 3. Handle Local File (e.g., logo.jpg in public folder)
        link.href = value.startsWith('/') ? value : `/${value}`;
      }
    }
  }, [settings]);

  if (settingsLoading && !isDev) {
    return <LoadingScreen />;
  }

  if (isAdmin) {
    return <Admin />;
  }

  return (
    <View style={styles.app}>
      <CodeBackground />
      <Header />
      <View style={styles.main}>
        <View nativeID="home">
          <Home />
        </View>
        <WebView className="section-divider" />
        <View nativeID="skills">
          <Skills />
        </View>
        <WebView className="section-divider" />
        <View nativeID="experience">
          <Experience />
        </View>
        <WebView className="section-divider" />
        <View nativeID="projects">
          <Projects />
        </View>
        <WebView className="section-divider" />
        <View nativeID="contact">
          <Contact />
        </View>
      </View>
      <Footer />
    </View>
  );
};


const styles = StyleSheet.create({
  app: {
    minHeight: '100vh',
    position: 'relative'
  },
  main: {
    position: 'relative',
    zIndex: 1
  }
});

export default App;
