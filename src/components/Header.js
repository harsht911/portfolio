import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native-web';
import WebView from './WebView';

import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { trackEvent, trackResumeDownload } from '../utils/analytics';
import { isDev } from '../utils/env';

const Header = () => {
  const { data: settings, loading: settingsLoading } = useFirestoreDocument('settings', 'global');
  const { data: firebaseNav, loading: navLoading } = useFirestoreCollection('navigation', 'order');
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pulseDotRef = useRef(null);

  const siteName = settings?.logoText || 'Harsh Thakkar';
  const displaySiteName = siteName.length > 15 ? 'BWH' : siteName; // Shorten if too long

  useEffect(() => {
    // Apply pulse animation class to the dot
    if (pulseDotRef.current) {
      pulseDotRef.current.classList.add('pulse-dot');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Simple active section detection based on scroll position
      const sections = ['home', 'skills', 'experience', 'projects', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    trackEvent('nav_click', { section_id: id });
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false); // Close mobile menu after clicking
    }
  };

  const handleResumeClick = () => {
    trackResumeDownload();
    const resumeUrl = settings?.resumeUrl || 'resume.pdf'; // Default local name

    if (resumeUrl.startsWith('http')) {
      // Open remote link
      window.open(resumeUrl, '_blank');
    } else {
      // Handle local file download/view
      const link = document.createElement('a');
      link.href = resumeUrl.startsWith('/') ? resumeUrl : `/${resumeUrl}`;
      link.download = resumeUrl.split('/').pop() || 'resume.pdf';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const staticNavLinks = [
    { title: 'Home', id: 'home' },
    { title: 'Skills', id: 'skills' },
    { title: 'Experience', id: 'experience' },
    { title: 'Projects', id: 'projects' },
    { title: 'Contact', id: 'contact' }
  ];

  const navLinks = firebaseNav.length > 0 ? firebaseNav : (isDev ? staticNavLinks : []);

  return (
    <View style={[styles.header, scrolled && styles.headerScrolled]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => scrollToSection('home')} style={{ textDecoration: 'none' }}>
          <View style={styles.logoContainer}>
            <View style={styles.logoGroup}>
              {settings?.profileImageUrl && (
                <Image
                  source={{ uri: settings.profileImageUrl }}
                  style={[
                    styles.headerAvatar,
                    {
                      opacity: scrolled && window.scrollY > 300 ? 1 : 0,
                      width: scrolled && window.scrollY > 300 ? 32 : 0,
                      marginRight: scrolled && window.scrollY > 300 ? 10 : 0,
                    }
                  ]}
                />
              )}
              <Text style={styles.logoBracket}>{'<'}</Text>
              <Text style={styles.logoText}>{displaySiteName}</Text>
              <Text style={styles.logoBracket}>{'/>'}</Text>
            </View>
            <View style={styles.divider} />
            <WebView className="availability-badge" style={styles.availabilityBadge}>
              <View ref={pulseDotRef} style={styles.pulseDot} />
              <Text style={styles.availabilityText}>{settings?.availabilityText || 'Available'}</Text>
            </WebView>
          </View>
        </TouchableOpacity>

        {/* Desktop Nav */}
        <WebView className="desktop-nav" style={styles.nav}>
          {navLinks.map((link) => (
            <TouchableOpacity key={link.id} onPress={() => scrollToSection(link.id)}>
              <Text style={[styles.navLink, activeSection === link.id && styles.navLinkActive]}>
                {link.title}
              </Text>
            </TouchableOpacity>
          ))}

          <WebView className="btn-primary-hover">
            <TouchableOpacity
              style={styles.resumeButton}
              onPress={handleResumeClick}
            >
              <Text style={styles.resumeButtonText}>📄 Resume</Text>
            </TouchableOpacity>
          </WebView>
        </WebView>

        {/* Mobile Hamburger Button */}
        <WebView className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}>
          <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
            <View>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          </TouchableOpacity>
        </WebView>

        {/* Mobile Nav Overlay */}
        <WebView className={`mobile-nav-overlay ${isMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <TouchableOpacity key={link.id} onPress={() => scrollToSection(link.id)}>
              <Text style={[styles.navLink, activeSection === link.id && styles.navLinkActive]}>
                {link.title}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.resumeButton, { marginTop: 20 }]}
            onPress={handleResumeClick}
          >
            <Text style={styles.resumeButtonText}>📄 Resume</Text>
          </TouchableOpacity>
        </WebView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    transition: 'all 0.3s ease',
    zIndex: 100
  },
  headerScrolled: {
    backgroundColor: 'rgba(13, 17, 23, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(48, 54, 61, 0.5)'
  },
  container: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer'
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  headerAvatar: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(63, 185, 80, 0.4)',
    transition: 'all 0.4s ease-in-out',
    overflow: 'hidden'
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E6EDF3'
  },
  logoBracket: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3FB950'
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(48, 54, 61, 0.5)'
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(63, 185, 80, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(63, 185, 80, 0.2)'
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
  nav: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'center'
  },
  navLink: {
    color: '#8B949E',
    fontWeight: '700',
    fontSize: 17,
    transition: 'color 0.3s ease',
    cursor: 'pointer'
  },
  navLinkActive: {
    color: '#3FB950'
  },
  resumeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(63, 185, 80, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3FB950',
    cursor: 'pointer'
  },
  resumeButtonText: {
    color: '#3FB950',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5
  },
  hamburgerLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E6EDF3',
    marginVertical: 2,
    borderRadius: 2
  }
});

export default Header;
