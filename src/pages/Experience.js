import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native-web';
import ScrollReveal from '../components/ScrollReveal';
import WebView from '../components/WebView';

import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

import { isDev } from '../utils/env';

const staticContent = {
  label: '// JOURNEY',
  title: 'Professional Experience',
  description: 'A progressive journey through challenging roles in mobile development, delivering impactful solutions for global enterprises.'
};

const staticTimeline = [
  {
    year: 'Mar 2024 - Present',
    title: 'Software Engineer',
    company: 'Vedlogic',
    description: 'Leading Android development for a kiosk-based communication and wellbeing app for elderly users in the UK.',
    achievements: [
      'Ensuring accessibility, stability, and user-friendly interaction',
      'Collaborating with clients on feature planning, releases, and issue resolution',
      'Mentoring a junior Android developer',
      'Integrating BLE sensor data into the application',
      'Contributing to backend modules using Java (MVC) and Python REST APIs'
    ],
    technologies: ['Android', 'Kotlin', 'BLE', 'Java (MVC)', 'Python', 'Spring Boot']
  },
  {
    year: 'Jan 2023 - Feb 2024',
    title: 'Senior Android App Developer',
    company: 'TriState Technology',
    description: 'Developed and maintained multiple Android applications, optimizing performance and improving code quality.',
    achievements: [
      'Developed and maintained multiple Android applications',
      'Optimized performance and improved code quality',
      'Fixed bugs and enhanced stability',
      'Mentored interns and junior developers'
    ],
    technologies: ['Android', 'Kotlin', 'Performance Optimization', 'Mentoring']
  },
  {
    year: 'Feb 2021 - Jan 2023',
    title: 'Junior Android App Developer',
    company: 'I Can Infotech',
    description: 'Built Android apps for multiple client projects, implementing features like maps, payments, and push notifications.',
    achievements: [
      'Built Android apps for multiple client projects',
      'Implemented features including maps, payments, and push notifications',
      'Worked on localization and dynamic UI components'
    ],
    technologies: ['Android', 'Maps', 'Payments', 'Localization', 'Dynamic UI']
  }
];

const Experience = () => {
  const { data: pageData, loading: contentLoading } = useFirestoreDocument('content', 'experience');
  const { data: firebaseTimeline, loading: timelineLoading } = useFirestoreCollection('experience', 'order');

  const content = pageData || (isDev ? staticContent : null);
  const timeline = firebaseTimeline.length > 0 ? firebaseTimeline : (isDev ? staticTimeline : []);

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

        <View style={styles.timeline}>
          <View style={styles.timelineLine} />
          {timeline.map((item, index) => (
            <ScrollReveal key={index} delay={index * 150}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                  <View style={styles.timelineInnerDot} />
                </View>

                <Text style={styles.timelineYear}>{item.year}</Text>

                <WebView className="hover-lift" style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineCompany}>{item.company}</Text>
                  <Text style={styles.timelineDescription}>{item.description}</Text>

                  {item.achievements.length > 0 && (
                    <View style={styles.achievementsList}>
                      <Text style={styles.achievementsTitle}>Key Achievements:</Text>
                      {item.achievements.map((achievement, i) => (
                        <View key={i} style={styles.achievementItem}>
                          <Text style={styles.bullet}>▹</Text>
                          <Text style={styles.achievementText}>{achievement}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </WebView>
              </View>
            </ScrollReveal>
          ))}
        </View>
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
  timeline: {
    position: 'relative',
    paddingLeft: 32
  },
  timelineLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    background: 'linear-gradient(180deg, #3FB950, #56D364)'
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 40,
    paddingLeft: 32
  },
  timelineDot: {
    position: 'absolute',
    left: -41.5,
    top: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0D1117',
    borderWidth: 2,
    borderColor: '#3FB950',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  timelineInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3FB950'
  },
  timelineContent: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(22, 27, 34, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(48, 54, 61, 0.4)',
    cursor: 'pointer'
  },
  timelineYear: {
    fontSize: 14,
    color: '#3FB950',
    fontFamily: "'Courier New', monospace",
    marginBottom: 8,
    fontWeight: '700'
  },
  timelineTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    color: '#E6EDF3'
  },
  timelineCompany: {
    fontSize: 18,
    color: '#C9D1D9',
    marginBottom: 16,
    fontStyle: 'italic',
    fontWeight: '500'
  },
  timelineDescription: {
    color: '#C9D1D9',
    lineHeight: 30,
    marginBottom: 24,
    fontSize: 18
  },
  achievementsList: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#3FB950',
    marginTop: 8
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6EDF3',
    marginBottom: 12
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  bullet: {
    color: '#3FB950',
    marginRight: 12,
    fontSize: 18
  },
  achievementText: {
    flex: 1,
    color: '#C9D1D9',
    lineHeight: 28,
    fontSize: 16
  },
  techTag: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(63, 185, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(63, 185, 80, 0.2)',
    borderRadius: 20
  },
  techText: {
    fontSize: 14,
    color: '#3FB950',
    fontFamily: "'Courier New', monospace",
    fontWeight: '600'
  }
});

export default Experience;
