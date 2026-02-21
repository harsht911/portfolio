import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native-web';
import ScrollReveal from '../components/ScrollReveal';
import WebView from '../components/WebView';
import { trackEvent } from '../utils/analytics';

import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

import { isDev } from '../utils/env';

const staticHero = {
  label: '// MOBILE APPLICATION DEVELOPER',
  title: 'Building Seamless Digital Experiences',
  fullText: 'Mobile Application Developer (Android)',
  description: 'Software Engineer with over five years of experience in mobile and enterprise application development. Specialized in Android development using Kotlin and modern UI frameworks.'
};

const staticStats = [
  { number: '5+', label: 'Years' },
  { number: '10+', label: 'Projects' },
  { number: '100K+', label: 'Downloads' },
  { number: '10+', label: 'Clients' }
];

const Home = () => {
  const { data: settings } = useFirestoreDocument('settings', 'global');
  const { data: homeData, loading: homeLoading } = useFirestoreDocument('content', 'home');
  const { data: firebaseStats, loading: statsLoading } = useFirestoreCollection('stats', 'order');

  const [typedText, setTypedText] = useState('');

  // ...

  // Only show static hero in Dev. In Prod, wait for Firebase.
  const hero = homeData || (isDev ? staticHero : null);
  const fullText = hero?.fullText || '';

  useEffect(() => {
    if (!fullText) return;
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [fullText]);

  // In Prod, don't show stats until loaded
  const stats = firebaseStats.length > 0 ? firebaseStats : (isDev ? staticStats : []);

  if (!hero && !isDev) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <WebView className="content responsive-content" style={styles.content}>
        <View style={styles.heroLayout} className="hero-layout">
          <View style={styles.textContent}>
            <ScrollReveal>
              <WebView className="availability-badge" style={styles.mobileOnlyBadge}>
                <View style={styles.pulseDot} className="pulse-dot" />
                <Text style={styles.availabilityText}>{settings?.availabilityText || 'Available'}</Text>
              </WebView>
              <Text style={styles.label}>{hero.label}</Text>
              <WebView className="hero-title">
                <Text style={styles.title}>
                  {hero.title}
                </Text>
              </WebView>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <View style={styles.typewriterContainer}>
                <Text style={styles.typewriterPrefix}>{' > '}</Text>
                <Text style={styles.typewriterText} className="typewriter-text-one-line">
                  {typedText}
                  <Text style={styles.cursor} className="cursor-blink">|</Text>
                </Text>
              </View>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <Text style={styles.description}>
                {hero.description}
              </Text>
            </ScrollReveal>
          </View>

          <ScrollReveal delay={400}>
            <View style={styles.imageContainer} className="image-container-responsive">
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: settings?.profileImageUrl || 'https://via.placeholder.com/400x400/161b22/3fb950?text=HT' }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <View style={styles.imageGlow} />
              </View>
            </View>
          </ScrollReveal>
        </View>

        <WebView className="stats-grid" style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={600 + (i * 100)}>
              <WebView className="hover-lift" style={styles.statCard}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </WebView>
            </ScrollReveal>
          ))}
        </WebView>

        <ScrollReveal delay={1000}>
          <WebView className="btn-group-responsive" style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.buttonPrimary}
              className="btn-primary-hover"
              onPress={() => {
                trackEvent('cta_click', { button: 'lets_connect' });
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Text style={styles.buttonPrimaryText}>Let's Connect</Text>
              <Text style={styles.buttonPrimaryText}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              className="btn-secondary-hover"
              onPress={() => {
                trackEvent('cta_click', { button: 'view_projects' });
                const el = document.getElementById('projects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Text style={styles.buttonSecondaryText}>View Projects</Text>
              <Text style={styles.buttonSecondaryText}>↓</Text>
            </TouchableOpacity>
          </WebView>
        </ScrollReveal>
      </WebView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: '100vh',
    justifyContent: 'center',
    paddingTop: 120,
    position: 'relative'
  },
  content: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 32,
    width: '100%'
  },
  heroLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 48,
    marginBottom: 64
  },
  textContent: {
    flex: 1,
    paddingRight: 24
  },
  imageContainer: {
    padding: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageWrapper: {
    width: 380,
    height: 380,
    borderRadius: 190,
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(63, 185, 80, 0.3)'
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 190
  },
  imageGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 200,
    backgroundColor: '#3FB950',
    opacity: 0.15,
    filter: 'blur(40px)',
    zIndex: 1
  },
  mobileOnlyBadge: {
    display: 'none', // Shown only via CSS on mobile
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(63, 185, 80, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(63, 185, 80, 0.2)',
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  pulseDot: {
    width: 8,
    height: 8,
    backgroundColor: '#3FB950',
    borderRadius: 4
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3FB950',
    letterSpacing: 0.5
  },
  label: {
    fontSize: 14,
    color: '#3FB950',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: "'Courier New', monospace"
  },
  title: {
    fontSize: 42, // Reduced for mobile by default
    fontWeight: '800',
    lineHeight: 48, // Adjusted
    color: '#E6EDF3',
    marginBottom: 24,
    letterSpacing: -1,
  },
  typewriterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 40
  },
  typewriterPrefix: {
    fontSize: 24,
    color: '#3FB950',
    fontWeight: '700',
    fontFamily: "'Courier New', monospace"
  },
  typewriterText: {
    fontSize: 20,
    color: '#C9D1D9',
    fontWeight: '500',
    fontFamily: "'Courier New', monospace"
  },
  cursor: {
    color: '#3FB950'
  },
  description: {
    fontSize: 16,
    color: '#C9D1D9',
    maxWidth: '100%',
    lineHeight: 28,
    marginBottom: 48
  },
  boldGreen: {
    color: '#3FB950',
    fontWeight: '700'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 48,
    justifyContent: 'center'
  },
  statCard: {
    padding: 20,
    backgroundColor: 'rgba(22, 27, 34, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(48, 54, 61, 0.5)',
    width: 'calc(50% - 8px)',
    minWidth: 140,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3FB950',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#8B949E',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 80,
    width: '100%',
    justifyContent: 'center'
  },
  buttonPrimary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#3FB950',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer'
  },
  buttonPrimaryText: {
    color: '#0D1117',
    fontSize: 16,
    fontWeight: '700'
  },
  buttonSecondary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(48, 54, 61, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer'
  },
  buttonSecondaryText: {
    color: '#E6EDF3',
    fontSize: 16,
    fontWeight: '700'
  }
});

export default Home;
