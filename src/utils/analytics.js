import { analytics, logEvent, db } from '../firebase';
import { doc, setDoc, increment } from 'firebase/firestore';
import { isDev } from './env';

/**
 * Track a visit in Firestore for the CMS Analytics dashboard
 */
export const trackVisit = async () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const analyticsRef = doc(db, 'site_analytics', 'visits');
    const envPrefix = isDev ? 'local' : 'prod';

    try {
        await setDoc(analyticsRef, {
            // Global total hits
            totalHits: increment(1),
            [`daily_${today}`]: increment(1),

            // Environment specific tracking
            [`${envPrefix}_totalHits`]: increment(1),
            [`${envPrefix}_daily_${today}`]: increment(1)
        }, { merge: true });
    } catch (e) {
        console.warn("Analytics recording failed", e);
    }
};

/**
 * Log a custom event to Firebase Analytics AND Firestore for CMS
 */
export const trackEvent = async (eventName, params = {}) => {
    // Skip tracking if we are in admin mode to keep data clean
    if (window.location.hash === '#admin') return;
    const envPrefix = isDev ? 'local' : 'prod';

    // 1. Log to GA4 (Firebase Analytics)
    if (analytics) {
        logEvent(analytics, eventName, {
            ...params,
            platform: 'web',
            environment: envPrefix,
            timestamp: new Date().toISOString()
        });
    }

    // 2. Log to Firestore for real-time CMS dashboard
    try {
        const eventRef = doc(db, 'site_analytics', 'events');
        const fieldName = `${eventName}_${params.button || params.section_id || params.method || 'total'}`;
        await setDoc(eventRef, {
            [fieldName]: increment(1),
            [`count_${eventName}`]: increment(1),
            total_interactions: increment(1),

            // Env specific
            [`${envPrefix}_${fieldName}`]: increment(1),
            [`${envPrefix}_count_${eventName}`]: increment(1),
            [`${envPrefix}_total_interactions`]: increment(1)
        }, { merge: true });
    } catch (e) {
        console.warn("Firestore event tracking failed", e);
    }
};

/**
 * Track a "Crash" or Error to Firebase Analytics
 * Note: Firebase Crashlytics is mobile-only. On web, we log as 'exception' events.
 */
export const trackError = (error, fatal = false) => {
    if (analytics) {
        logEvent(analytics, 'exception', {
            description: error.message || error,
            fatal: fatal,
            stack: error.stack || 'N/A'
        });
        console.error(`[Analytics] Error Tracked:`, error);
    }
};

/**
 * Preset common tracking events
 */
export const trackPageTransition = (pageName) => trackEvent('page_view', { page_name: pageName });
export const trackProjectClick = (projectName) => trackEvent('project_click', { project_id: projectName });
export const trackResumeDownload = () => trackEvent('resume_download');
export const trackContactClick = (method) => trackEvent('contact_click', { method });
