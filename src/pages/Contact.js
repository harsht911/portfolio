import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native-web';
import ScrollReveal from '../components/ScrollReveal';
import WebView from '../components/WebView';

import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

import { isDev } from '../utils/env';

const staticContent = {
  label: 'Get In Touch',
  title: "Let's Work Together",
  description: "Have a project in mind or looking for a dedicated mobile developer? I'm always open to discussing new opportunities and challenges.",
  ctaTitle: 'Ready to start?',
  ctaDescription: 'I am currently available for freelance projects and full-time opportunities.',
  ctaButtonText: 'Say Hello 👋',
  ctaEmail: 'harshthacker19@gmail.com'
};

const staticContacts = [
  {
    icon: '📍',
    title: 'Location',
    value: 'Ahmedabad, India',
    link: '#',
    description: 'Open to remote & relocation'
  },
  {
    icon: '📧',
    title: 'Email',
    value: 'harsh.thakkar@example.com',
    link: 'mailto:harsh.thakkar@example.com',
    description: 'For project inquiries and collaborations'
  },
  {
    icon: '💼',
    title: 'LinkedIn',
    value: 'LinkedIn Profile',
    description: 'Connect for professional networking.'
  }
];

const staticServices = [
  {
    title: 'Mobile Development',
    description: 'Native Android (Kotlin) & Cross-platform (Flutter/React Native) solutions.'
  },
  {
    title: 'Consultancy',
    description: 'Architecture review, code auditing, and performance optimization.'
  },
  {
    title: 'Kiosk Solutions',
    description: 'Secure, locked-down Android kiosk applications for enterprise use.'
  }
];

const Contact = () => {
  const { data: pageData, loading: contentLoading } = useFirestoreDocument('content', 'contact');
  const { data: firebaseContacts, loading: contactsLoading } = useFirestoreCollection('contacts', 'order');
  const { data: firebaseServices, loading: servicesLoading } = useFirestoreCollection('services', 'order');

  const content = pageData || (isDev ? staticContent : null);
  const contacts = firebaseContacts.length > 0 ? firebaseContacts : (isDev ? staticContacts : []);
  const services = firebaseServices.length > 0 ? firebaseServices : (isDev ? staticServices : []);

  if (!content && !isDev) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <WebView className="content responsive-content" style={styles.content}>
        <ScrollReveal>
          <View style={styles.header}>
            <Text style={styles.label}>{content.label}</Text>
            <WebView className="section-title">
              <Text style={styles.title}>{content.title}</Text>
            </WebView>
            <Text style={styles.description}>
              {content.description}
            </Text>
          </View>
        </ScrollReveal>

        <WebView className="contact-grid contact-grid-responsive" style={styles.contactGrid}>
          {contacts.map((info, index) => (
            <ScrollReveal key={index} style={styles.contactCardWrapper} delay={index * 100}>
              <WebView className="hover-lift" style={styles.contactCard}>
                <TouchableOpacity
                  onPress={() => info.link && Linking.openURL(info.link)}
                  disabled={!info.link}
                  style={{ width: '100%' }}
                >
                  <View style={styles.iconContainer}>
                    <Text style={styles.contactIcon}>{info.icon}</Text>
                  </View>
                  <Text style={styles.contactTitle}>{info.title}</Text>
                  <Text style={styles.contactValue}>{info.value}</Text>
                  <Text style={styles.contactDescription}>{info.description}</Text>
                </TouchableOpacity>
              </WebView>
            </ScrollReveal>
          ))}
        </WebView>

        <ScrollReveal delay={400}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What I Can Do For You</Text>
          </View>
        </ScrollReveal>

        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <ScrollReveal key={index} style={styles.serviceItem} delay={500 + (index * 100)}>
              <Text style={styles.bullet}>▹</Text>
              <View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
            </ScrollReveal>
          ))}
        </View>

        <ScrollReveal delay={800}>
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaTitle}>{content.ctaTitle}</Text>
            <Text style={styles.ctaDescription}>
              {content.ctaDescription}
            </Text>
            <WebView className="btn-primary-hover">
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => Linking.openURL(`mailto:${content.ctaEmail}`)}
              >
                <Text style={styles.ctaButtonText}>{content.ctaButtonText}</Text>
              </TouchableOpacity>
            </WebView>
          </View>
        </ScrollReveal>
      </WebView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120
  },
  content: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 32,
    paddingBottom: 48,
    width: '100%'
  },
  header: {
    marginBottom: 32,
    alignItems: 'flex-start',
    textAlign: 'left'
  },
  label: {
    fontSize: 15,
    color: '#3FB950',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: "'Courier New', monospace"
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -1,
    color: '#E6EDF3'
  },
  description: {
    fontSize: 16,
    color: '#C9D1D9',
    maxWidth: '100%',
    lineHeight: 28
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 48
  },
  contactCardWrapper: {
    width: '100%',
    maxWidth: 400,
    flexGrow: 1
  },
  contactCard: {
    padding: 32,
    backgroundColor: 'rgba(22, 27, 34, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(48, 54, 61, 0.6)',
    borderRadius: 16,
    height: '100%',
    alignItems: 'flex-start'
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 139, 253, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 139, 253, 0.2)'
  },
  contactIcon: {
    fontSize: 28
  },
  contactTitle: {
    fontSize: 14,
    color: '#8B949E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600'
  },
  contactValue: {
    color: '#3FB950',
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 8
  },
  contactDescription: {
    color: '#C9D1D9',
    fontSize: 15,
    lineHeight: 22
  },
  sectionHeader: {
    marginBottom: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(48, 54, 61, 0.5)'
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E6EDF3'
  },
  servicesGrid: {
    marginBottom: 64
  },
  serviceItem: {
    flexDirection: 'row',
    marginBottom: 24,
    maxWidth: 800
  },
  bullet: {
    color: '#3FB950',
    marginRight: 16,
    fontSize: 24,
    lineHeight: 30
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E6EDF3',
    marginBottom: 8
  },
  serviceDescription: {
    color: '#C9D1D9',
    lineHeight: 26,
    fontSize: 16
  },
  ctaContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(63, 185, 80, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(63, 185, 80, 0.15)',
    textAlign: 'center'
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E6EDF3',
    marginBottom: 16
  },
  ctaDescription: {
    fontSize: 18,
    color: '#C9D1D9',
    maxWidth: 600,
    lineHeight: 30,
    marginBottom: 32
  },
  availabilityText: {
    color: '#C9D1D9',
    fontSize: 16,
    fontWeight: '600'
  },
  ctaButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    backgroundColor: '#3FB950',
    borderRadius: 8,
    transition: 'transform 0.2s ease',
    cursor: 'pointer'
  },
  ctaButtonText: {
    color: '#0D1117',
    fontWeight: '700',
    fontSize: 18
  }
});

export default Contact;
