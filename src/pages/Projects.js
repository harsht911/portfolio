import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native-web';
import ScrollReveal from '../components/ScrollReveal';
import WebView from '../components/WebView';

import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { trackEvent, trackProjectClick } from '../utils/analytics';
import { isDev } from '../utils/env';

const staticContent = {
  label: '// My Work',
  title: 'Featured Projects',
  description: 'A showcase of scalable mobile apps, production-grade systems, and creative experiments.'
};

const staticProjects = [
  {
    title: 'MyDODL Kiosk App',
    category: 'Healthcare & IoT',
    description: 'Kiosk-based communication and wellbeing platform for elderly residents in the UK. Features video calling, door-entry integration, BLE sensor data montoring, and messaging.',
    tech: ['Android', 'Kotlin', 'BLE', 'WebRTC', 'MDM'],
    highlights: [
      'Real-time video calling & messaging',
      'BLE sensor data integration',
      'Door-entry system integration',
      'Remote management via MDM'
    ],
    metrics: {
      users: 'Elderly',
      rating: 'Prod',
      downloads: 'Kiosk'
    },
    icon: '👵'
  },
  {
    title: 'AHA Solar App',
    category: 'Renewable Energy',
    description: 'Comprehensive solar platform mobile application featuring map integration, real-time chat, and dynamic UI management.',
    tech: ['Android', 'Firebase', 'Google Maps', 'Dynamic UI'],
    highlights: [
      'Map integration for solar installations',
      'Firebase-powered chat system',
      'Multi-language support',
      'Dynamic UI components'
    ],
    metrics: {
      users: 'Solar',
      rating: 'Prod',
      downloads: 'Enterprise'
    },
    icon: '☀️'
  },
  {
    title: 'Tahani Flowers',
    category: 'E-Commerce',
    description: 'E-commerce mobile application for a premium flower delivery service, featuring custom bouquet creation and scheduled deliveries.',
    icon: '🌺',
    tech: ['Flutter', 'Firebase', 'Stripe'],
    highlights: [
      'Custom bouquet builder UI',
      'Real-time delivery tracking',
      'Multi-currency support'
    ],
    metrics: {
      value: '4.8',
      label: 'App Store Rating'
    }
  },
  {
    title: 'AI Chat Assistant',
    description: 'A personal AI assistant app integrated with OpenAI API, featuring voice commands and context-aware conversations.',
    icon: '🤖',
    tech: ['React Native', 'OpenAI API', 'Expo'],
    highlights: [
      'Voice-to-text integration',
      'Context retention logic',
      'Customizable personas'
    ],
    metrics: {
      value: 'Personal',
      label: 'Project'
    },
    category: 'Web'
  },
  {
    title: 'Compose To-Do',
    description: 'A modern, clean to-do list application built entirely with Jetpack Compose to demonstrate declarative UI patterns.',
    icon: '✅',
    tech: ['Kotlin', 'Jetpack Compose', 'Room DB'],
    highlights: [
      '100% Jetpack Compose UI',
      'Dark/Light theme support',
      'Drag-and-drop reordering'
    ],
    metrics: {
      value: 'Open Source',
      label: 'On GitHub'
    },
    category: 'Mobile'
  },
  {
    title: 'Portfolio API',
    description: 'Backend service for portfolio data management and contact form handling.',
    icon: '🔌',
    tech: ['Node.js', 'Express', 'MongoDB'],
    highlights: [
      'RESTful API architecture',
      'Rate limiting & Security',
      'Automated testing'
    ],
    metrics: {
      value: '99.9%',
      label: 'Uptime'
    },
    category: 'Backend'
  }
];

const Projects = () => {
  const { data: pageData, loading: contentLoading } = useFirestoreDocument('content', 'projects');
  const { data: firebaseProjects, loading: projectsLoading } = useFirestoreCollection('projects', 'order');

  const content = pageData || (isDev ? staticContent : null);
  const projects = useMemo(() => {
    return firebaseProjects.length > 0 ? firebaseProjects : (isDev ? staticProjects : []);
  }, [firebaseProjects]);

  const [activeCategory, setActiveCategory] = useState('All');

  // Derive unique categories from projects
  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)].sort();
  }, [projects]);

  // Reset active category if it disappears
  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [categories, activeCategory]);

  if (!content && !isDev) {
    return <View style={styles.container} />;
  }

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

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

        {/* Filter Buttons */}
        <ScrollReveal delay={200}>
          <View style={styles.filterContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterButton,
                  activeCategory === cat && styles.filterButtonActive
                ]}
                onPress={() => {
                  trackEvent('project_filter_click', { category: cat });
                  setActiveCategory(cat);
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeCategory === cat ? styles.filterTextActive : styles.filterTextInactive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollReveal>

        <WebView className="projects-grid responsive-grid" style={styles.projectsGrid}>
          {filteredProjects.map((project, index) => (
            <ScrollReveal key={project.title} style={styles.projectCardWrapper} delay={index * 100}>
              <WebView className="hover-lift" style={styles.projectCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.projectIcon}>{project.icon}</Text>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{project.category}</Text>
                  </View>
                </View>

                <Text style={styles.projectTitle}>{project.title}</Text>

                <View style={styles.techStack}>
                  {
                    project.tech.map((t, i) => (
                      <Text key={i} style={styles.techText}>
                        {t}{i < project.tech.length - 1 ? ' • ' : ''}
                      </Text>
                    ))}
                </View>

                <Text style={styles.projectDescription}>{project.description}</Text>

                <View style={styles.metricsContainer}>
                  <View>
                    <Text style={styles.metricValue}>{project.metrics.value || project.metrics.downloads}</Text>
                    <Text style={styles.metricLabel}>{project.metrics.label || 'Project'}</Text>
                  </View>
                </View>

                <View style={styles.highlights}>
                  <Text style={styles.highlightsTitle}>Key Features</Text>
                  {project.highlights.map((highlight, i) => (
                    <View key={i} style={styles.highlightItem}>
                      <Text style={styles.bullet}>▹</Text>
                      <Text style={styles.highlightText}>{highlight}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => trackProjectClick(project.title)}
                >
                  <Text style={styles.viewButtonText}>View Details →</Text>
                </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
    flexWrap: 'wrap'
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filterButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(201, 209, 217, 0.2)'
  },
  filterButtonActive: {
    backgroundColor: 'rgba(63, 185, 80, 0.1)',
    borderColor: '#3FB950'
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600'
  },
  filterTextInactive: {
    color: '#8B949E'
  },
  filterTextActive: {
    color: '#3FB950'
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20
  },
  projectCardWrapper: {
    width: '100%',
    maxWidth: 600,
    flexGrow: 1
  },
  projectCard: {
    padding: 32,
    backgroundColor: 'rgba(22, 27, 34, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(48, 54, 61, 0.6)',
    borderRadius: 16,
    height: '100%',
    transition: 'transform 0.2s ease',
    cursor: 'pointer'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  projectIcon: {
    fontSize: 56
  },
  categoryTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(56, 139, 253, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 139, 253, 0.2)'
  },
  categoryText: {
    fontSize: 12,
    color: '#58A6FF',
    fontWeight: '600'
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E6EDF3',
    marginBottom: 12
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24
  },
  techText: {
    color: '#8B949E',
    fontSize: 15,
    marginRight: 4,
    fontFamily: "'Courier New', monospace"
  },
  projectDescription: {
    color: '#C9D1D9',
    lineHeight: 28,
    marginBottom: 24,
    fontSize: 16
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(48, 54, 61, 0.5)',
    marginBottom: 24
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3FB950',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 13,
    color: '#8B949E',
    textTransform: 'uppercase'
  },
  highlights: {
    flex: 1
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E6EDF3',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  bullet: {
    color: '#3FB950',
    marginRight: 12,
    fontSize: 18
  },
  highlightText: {
    flex: 1,
    color: '#C9D1D9',
    fontSize: 15,
    lineHeight: 22
  },
  techText: {
    fontSize: 13,
    color: '#3FB950',
    fontFamily: "'Courier New', monospace",
    fontWeight: '600'
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(63, 185, 80, 0.3)',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  viewButtonText: {
    color: '#3FB950',
    fontWeight: '600',
    fontSize: 16
  }
});

export default Projects;
