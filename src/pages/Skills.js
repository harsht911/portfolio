import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native-web';
import ScrollReveal from '../components/ScrollReveal';
import WebView from '../components/WebView';

import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

import { isDev } from '../utils/env';

const staticContent = {
  label: '// EXPERTISE',
  title: 'Technical Arsenal',
  description: 'Comprehensive expertise in modern Android development with focus on performance, scalability, and exceptional user experience.'
};

const staticSkills = [
  {
    icon: '📱',
    title: 'Mobile Development',
    description: 'Expertise in Android (Kotlin, Java), Jetpack Compose, and Compose Multiplatform. Learning Flutter.',
    tags: ['Kotlin', 'Java', 'Jetpack Compose', 'KMP', 'Coroutines', 'Flow']
  },
  {
    icon: '🏗️',
    title: 'Architecture & DI',
    description: 'Building scalable apps using Clean Architecture, MVVM, MVI, and MVP patterns with robust dependency injection.',
    tags: ['Clean Architecture', 'MVVM', 'MVI', 'Hilt', 'Dagger', 'Koin']
  },
  {
    icon: '☁️',
    title: 'Backend & Cloud',
    description: 'Experience with Java Spring Boot, Node.js, and extensive usage of Firebase and Google Cloud Platform.',
    tags: ['Spring Boot', 'Node.js', 'Firebase', 'GCP', 'REST APIs', 'CI/CD']
  },
  {
    icon: '💾',
    title: 'Databases',
    description: 'Proficient with local and cloud databases including Room, SQLite, Firestore, and Realtime Database.',
    tags: ['Firestore', 'Realtime DB', 'Room', 'SQLite', 'PostgreSQL', 'DataStore']
  },
  {
    icon: '🔌',
    title: 'Hardware & Integrations',
    description: 'Specialized in BLE, IoT integrations, Maps, Payment Gateways, and External Hardware SDKs (Zebra).',
    tags: ['BLE', 'IoT', 'Google Maps', 'Razorpay', 'Zebra SDKs', 'MyFatoora']
  },
  {
    icon: '🛠️',
    title: 'Tools & DevOps',
    description: 'Proficient with modern development tools, version control, and project management platforms.',
    tags: ['Git', 'Docker', 'Postman', 'Jira', 'Gradle', 'Android Studio']
  }
];

const Skills = () => {
  const { data: pageData, loading: contentLoading } = useFirestoreDocument('content', 'skills');
  const { data: firebaseSkills, loading: skillsLoading } = useFirestoreCollection('skills', 'order');

  const content = pageData || (isDev ? staticContent : null);
  const skills = firebaseSkills.length > 0 ? firebaseSkills : (isDev ? staticSkills : []);

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

        <WebView className="skills-grid responsive-grid" style={styles.skillsGrid}>
          {skills.map((skill, i) => (
            <ScrollReveal key={i} delay={i * 100} style={styles.skillCardWrapper}>
              <WebView className="hover-lift" style={styles.skillCard}>
                <View style={styles.skillAccent} />
                <Text style={styles.skillIcon}>{skill.icon}</Text>
                <Text style={styles.skillTitle}>{skill.title}</Text>
                <Text style={styles.skillDescription}>{skill.description}</Text>
                <View style={styles.tags}>
                  {skill.tags.map((tag, j) => (
                    <View key={j} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </WebView>
            </ScrollReveal>
          ))}
        </WebView>
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
    marginBottom: 32
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
    marginBottom: 16,
    letterSpacing: -1,
    color: '#E6EDF3'
  },
  description: {
    fontSize: 16,
    color: '#C9D1D9',
    maxWidth: '100%',
    lineHeight: 28
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20
  },
  skillCardWrapper: {
    width: '100%',
    maxWidth: 500,
    flexGrow: 1
  },
  skillCard: {
    backgroundColor: 'rgba(22, 27, 34, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(48, 54, 61, 0.5)',
    borderRadius: 12,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    height: '100%'
  },
  skillAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    background: 'linear-gradient(90deg, #3FB950, #56D364)'
  },
  skillIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  skillTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#E6EDF3'
  },
  skillDescription: {
    color: '#C9D1D9',
    lineHeight: 28,
    marginBottom: 24,
    fontSize: 17
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(63, 185, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(63, 185, 80, 0.2)',
    borderRadius: 20
  },
  tagText: {
    fontSize: 14,
    color: '#3FB950',
    fontFamily: "'Courier New', monospace",
    fontWeight: '600'
  }
});

export default Skills;
