import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native-web';
import packageJson from '../../package.json';
import { db } from '../firebase';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from 'firebase/firestore';

const COLLECTIONS = [
    { id: 'settings', label: 'Global Settings', type: 'doc', docs: ['global'] },
    { id: 'content', label: 'Page Content', type: 'doc', docs: ['home', 'skills', 'experience', 'projects', 'contact'] },
    { id: 'navigation', label: 'Navigation Menu', type: 'collection' },
    { id: 'stats', label: 'Dashboard Stats', type: 'collection' },
    { id: 'skills', label: 'Skills & Tech', type: 'collection' },
    { id: 'experience', label: 'Job History', type: 'collection' },
    { id: 'projects', label: 'Featured Projects', type: 'collection' },
    { id: 'services', label: 'Service Offerings', type: 'collection' },
    { id: 'contacts', label: 'Contact Info', type: 'collection' },
    { id: 'deployment', label: 'Deployment Hub', type: 'collection' },
    { id: 'site_analytics', label: 'Visitor Analytics', type: 'doc', docs: ['visits'] }
];

const FIELD_LABELS = {
    profileImageUrl: 'Profile Photo URL',
    logoText: 'Website Logo Text',
    availabilityText: 'Availability Status',
    resumeUrl: 'Resume File/Link',
    adminPin: 'Admin Master PIN',
    title: 'Main Title',
    label: 'Section Label',
    description: 'Full Description',
    typedTexts: 'Typewriter Sentences',
    order: 'Display Priority Order',
    icon: 'Icon Name/URL',
    appVersion: 'CMS Version Number',
    buildVersion: 'Build ID (e.g. 1.0.1+12)',
    environment: 'Environment (Prod/Staging)',
    status: 'Status (Live/Maintenance)',
    deployedAt: 'Deployment Date/Time',
    notes: 'Release Notes',
    techStack: 'Technologies Used',
    highlights: 'Key Success Points',
    link: 'Project Live URL',
    github: 'Source Code Link',
    metrics: 'Key Performance Data',
    company: 'Organization',
    year: 'Date/Duration',
    achievements: 'Responsibilities',
    technologies: 'Tech List',
    tags: 'Skill Tags',
    value: 'Contact Value/URL',
    ctaTitle: 'Call to Action Title',
    ctaDescription: 'CTA Subtext',
    ctaButtonText: 'Button Label',
    ctaEmail: 'Contact Email'
};

const COLLECTION_TEMPLATES = {
    projects: { title: '', category: 'Mobile', description: '', tech: [], highlights: [], icon: '📱', order: 0 },
    skills: { title: '', icon: '⚡', description: '', tags: [], order: 0 },
    experience: { title: '', company: '', year: '', description: '', achievements: [], technologies: [], order: 0 },
    services: { title: '', description: '', icon: '🛠️', order: 0 },
    contacts: { title: '', value: '', icon: '✉️', link: '', order: 0 },
    navigation: { title: '', id: 'home', order: 0 },
    deployment: {
        title: `v1.0.${Math.floor(Math.random() * 100)}`,
        buildVersion: '1.0.0',
        environment: 'Production',
        status: 'Success',
        deployedAt: new Date().toLocaleString(),
        notes: 'Initial production build for portfolio.',
        order: 0
    }
};

const getLabel = (key) => {
    const label = FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `${label} (${key})`;
};

const Admin = () => {
    const { data: settings } = useFirestoreDocument('settings', 'global');
    const { data: analyticsVisits } = useFirestoreDocument('site_analytics', 'visits');
    const { data: analyticsEvents } = useFirestoreDocument('site_analytics', 'events');
    const [activeCol, setActiveCol] = useState(COLLECTIONS[0]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployStatus, setDeployStatus] = useState('');
    const [analyticsEnv, setAnalyticsEnv] = useState('prod'); // 'prod', 'local', 'all'

    useEffect(() => {
        console.log("CMS Version Info:", {
            pkgVersion: packageJson.version,
            settingsVersion: settings?.appVersion,
            displayVersion: packageJson.version || settings?.appVersion || 'v1.0.0'
        });
    }, [settings]);

    const handleDeploySite = async () => {
        const version = window.prompt("Enter Deployment Version (e.g. 1.0.5):", `1.0.${items.length + 1}`);
        if (!version) return;

        const notes = window.prompt("Enter Release Notes:", "Production update from CMS.");
        if (notes === null) return;

        setIsDeploying(true);
        setDeployStatus('Initializing system... 🚀');

        try {
            // We use a local bridge service to run shell commands
            const response = await fetch('http://localhost:9000/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version, notes })
            });

            const result = await response.json();

            if (result.success) {
                setDeployStatus('Saving deployment record... 💾');

                // Auto-create the record in Firestore
                const deployData = {
                    title: `Release ${version}`,
                    buildVersion: version,
                    environment: 'Production',
                    status: 'Success',
                    deployedAt: new Date().toLocaleString(),
                    notes: notes,
                    order: items.length + 1
                };

                const docRef = doc(collection(db, 'deployment'));
                await setDoc(docRef, deployData);

                setDeployStatus('Deployment Successful! 🎉');
                fetchData(); // Refresh list to see the new history entry
                setTimeout(() => {
                    setIsDeploying(false);
                    setDeployStatus('');
                }, 3000);
            } else {
                alert(`Deployment Failed: ${result.error}`);
                setIsDeploying(false);
            }
        } catch (e) {
            console.error(e);
            alert("Deployment Bridge not found. Please ensure you are running 'npm run bridge' locally.");
            setIsDeploying(false);
        }
    };
    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const renderAnalyticsDashboard = () => {
        if (!analyticsVisits) return <ActivityIndicator color="#3FB950" />;

        const prefix = analyticsEnv === 'all' ? '' : `${analyticsEnv}_`;
        const totalHits = analyticsVisits[`${prefix}totalHits`] || (analyticsEnv === 'all' ? analyticsVisits.totalHits : 0);

        // Extract daily keys and sort them
        const dailyKeys = Object.keys(analyticsVisits)
            .filter(k => k.startsWith(`${prefix}daily_`))
            .sort()
            .slice(-7);

        const maxHits = Math.max(...dailyKeys.map(k => analyticsVisits[k] || 0), 10);

        const eventPrefix = analyticsEnv === 'all' ? '' : `${analyticsEnv}_`;
        const totalEvents = analyticsEnv === 'all' ? (analyticsEvents?.total_interactions || 0) : (analyticsEvents?.[`${eventPrefix}total_interactions`] || 0);

        const eventKeys = analyticsEvents ? Object.keys(analyticsEvents)
            .filter(k => {
                if (analyticsEnv === 'all') return !k.startsWith('count_') && k !== 'total_interactions' && !k.startsWith('local_') && !k.startsWith('prod_');
                return k.startsWith(eventPrefix) && !k.includes('count_') && !k.includes('total_interactions');
            })
            .sort((a, b) => analyticsEvents[b] - analyticsEvents[a])
            .slice(0, 6) : [];

        return (
            <ScrollView style={styles.analyticsFrame} showsVerticalScrollIndicator={false}>
                {/* Filter Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginBottom: 20 }}>
                    {['prod', 'local', 'all'].map(env => (
                        <TouchableOpacity
                            key={env}
                            onPress={() => setAnalyticsEnv(env)}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: analyticsEnv === env ? '#3FB950' : 'rgba(48, 54, 61, 0.5)',
                                borderWidth: 1,
                                borderColor: analyticsEnv === env ? '#3FB950' : '#30363D'
                            }}
                        >
                            <Text style={{ color: analyticsEnv === env ? '#0D1117' : '#8B949E', fontWeight: '700', textTransform: 'capitalize' }}>
                                {env}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Dashboard Header Stats */}
                <View style={styles.dashboardStatsRow}>
                    <View style={styles.dashboardStatCard}>
                        <View style={styles.statIconCircle}><Text style={{ fontSize: 20 }}>👁️</Text></View>
                        <View>
                            <Text style={styles.dashboardStatValue}>{totalHits}</Text>
                            <Text style={styles.dashboardStatLabel}>{analyticsEnv} Site Visits</Text>
                        </View>
                    </View>
                    <View style={styles.dashboardStatCard}>
                        <View style={[styles.statIconCircle, { backgroundColor: 'rgba(56, 139, 253, 0.15)' }]}><Text style={{ fontSize: 20 }}>🖱️</Text></View>
                        <View>
                            <Text style={styles.dashboardStatValue}>{totalEvents}</Text>
                            <Text style={styles.dashboardStatLabel}>{analyticsEnv} Interactions</Text>
                        </View>
                    </View>
                    <View style={styles.dashboardStatCard}>
                        <View style={[styles.statIconCircle, { backgroundColor: 'rgba(210, 153, 34, 0.15)' }]}><Text style={{ fontSize: 20 }}>🔥</Text></View>
                        <View>
                            <Text style={styles.dashboardStatValue}>{analyticsVisits[`${prefix}daily_${new Date().toISOString().split('T')[0]}`] || 0}</Text>
                            <Text style={styles.dashboardStatLabel}>Hits Today ({analyticsEnv})</Text>
                        </View>
                    </View>
                </View>

                {/* Main Content Area */}
                <View style={styles.dashboardChartsRow}>
                    {/* Left: Traffic Chart */}
                    <View style={styles.chartModernBlock}>
                        <Text style={styles.chartTitle}>{analyticsEnv.toUpperCase()} Traffic (Last 7 Days)</Text>
                        <View style={styles.chartContainer}>
                            {dailyKeys.map(key => {
                                const value = analyticsVisits[key] || 0;
                                const barHeight = (value / maxHits) * 160;
                                return (
                                    <View key={key} style={styles.chartBarWrapper}>
                                        <View style={[styles.chartBar, { height: barHeight }]} />
                                        <Text style={styles.chartValue}>{value}</Text>
                                        <Text style={styles.chartLabel}>{key.split('_').pop().split('-').slice(1).join('/')}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Right: Interaction List */}
                    <View style={styles.chartModernBlock}>
                        <Text style={styles.chartTitle}>Top {analyticsEnv} Actions</Text>
                        <View style={styles.eventList}>
                            {eventKeys.length === 0 ? (
                                <Text style={styles.emptyText}>No data for {analyticsEnv} environment.</Text>
                            ) : (
                                eventKeys.map(key => (
                                    <View key={key} style={styles.eventListItem}>
                                        <View style={styles.eventInfo}>
                                            <Text style={styles.eventName}>{key.replace(eventPrefix, '').replace(/_/g, ' ')}</Text>
                                            <View style={[styles.eventProgressBase]}>
                                                <View style={[styles.eventProgressFill, { width: `${(analyticsEvents[key] / (totalEvents || 1)) * 100}%` }]} />
                                            </View>
                                        </View>
                                        <Text style={styles.eventCount}>{analyticsEvents[key]}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.infoBoxModern}>
                    <Text style={styles.infoTextModern}>
                        Viewing real-time {analyticsEnv} metrics.
                        Data is partitioned by hostname to prevent local testing from bloating production stats.
                    </Text>
                </View>
            </ScrollView>
        );
    };

    const handleExit = () => {
        window.location.hash = '';
        // Completely remove the trailing # from the URL without reloading the page
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    };

    const handleLogin = () => {
        const masterPin = settings?.adminPin || '1234';
        if (pin === masterPin) {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect PIN');
            setPin('');
        }
    };

    // Fetch data based on selected collection
    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeCol.type === 'doc') {
                const docsData = [];
                for (const docId of activeCol.docs) {
                    const docRef = doc(db, activeCol.id, docId);
                    const snap = await getDocs(query(collection(db, activeCol.id)));
                    // Simplified for the demo, fetching all docs in the 'content' or 'settings' collection
                    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setItems(items);
                    break;
                }
            } else {
                const q = query(collection(db, activeCol.id), orderBy('order', 'asc'));
                const snap = await getDocs(q);
                setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            // Fallback if no order field exists
            const snap = await getDocs(collection(db, activeCol.id));
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        setEditingItem(null);
    }, [activeCol]);

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({ ...item });
    };

    const handleAddNew = () => {
        let newId = 'new';
        if (activeCol.type === 'doc') {
            newId = window.prompt("Enter a unique Document ID (e.g., 'about', 'extra_settings'):");
            if (!newId) return;
        }

        const template = COLLECTION_TEMPLATES[activeCol.id] || {};

        setEditingItem({ id: newId });
        setFormData({
            id: newId,
            ...template,
            // If it's a deployment, refresh the date automatically
            ...(activeCol.id === 'deployment' ? { deployedAt: new Date().toLocaleString() } : {}),
            order: items.length + 1
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { id, ...data } = formData;

            // If it's a new item without a specific ID, generate one
            const docRef = (id === 'new')
                ? doc(collection(db, activeCol.id))
                : doc(db, activeCol.id, id);

            // setDoc with { merge: true } creates the document if it doesn't exist 
            // and updates it if it does, preventing 'No document to update' errors.
            await setDoc(docRef, data, { merge: true });

            await fetchData();
            setEditingItem(null);
            alert('Saved Successfully!');
        } catch (error) {
            alert('Save Error: ' + error.message);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, activeCol.id, id));
            await fetchData();
        } catch (error) {
            alert('Delete Error: ' + error.message);
        }
        setLoading(false);
    };

    const handleArrayChange = (field, value, index) => {
        const newArr = [...(formData[field] || [])];
        if (index === -1) {
            newArr.push('');
        } else if (value === null) {
            newArr.splice(index, 1);
        } else {
            newArr[index] = value;
        }
        setFormData({ ...formData, [field]: newArr });
    };

    const renderFieldValue = (key, value) => {
        const fieldDisplayName = getLabel(key);

        // Prevent editing ID or special internal fields unless it's a new item
        const isNew = editingItem?.id && !items.find(i => i.id === editingItem.id);
        const isLockedField = key === 'id' && !isNew;

        if (Array.isArray(value)) {
            return (
                <View key={key} style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>{fieldDisplayName}</Text>
                    {value.map((val, idx) => (
                        <View key={idx} style={styles.arrayLine}>
                            <TextInput
                                style={styles.input}
                                value={val}
                                onChangeText={(v) => handleArrayChange(key, v, idx)}
                                placeholder={`Item ${idx + 1}`}
                            />
                            <TouchableOpacity onPress={() => handleArrayChange(key, null, idx)} style={styles.deleteSmall}>
                                <Text style={{ color: '#FF4444' }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => handleArrayChange(key, '', -1)} style={styles.addSmall}>
                        <Text style={{ color: '#3FB950' }}>+ Add Item</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (typeof value === 'object' && value !== null) {
            return (
                <View key={key} style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>{fieldDisplayName}</Text>
                    {Object.keys(value).map(subKey => (
                        <View key={subKey} style={styles.subField}>
                            <Text style={styles.subLabel}>{subKey}:</Text>
                            <TextInput
                                style={styles.input}
                                value={String(formData[key][subKey] || '')}
                                onChangeText={(v) => {
                                    const newObj = { ...formData[key], [subKey]: v };
                                    setFormData({ ...formData, [key]: newObj });
                                }}
                            />
                        </View>
                    ))}
                </View>
            );
        }

        return (
            <View key={key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{fieldDisplayName}</Text>
                <TextInput
                    style={[styles.input, key.toLowerCase().includes('description') && { height: 80 }]}
                    value={String(formData[key] || '')}
                    onChangeText={(v) => setFormData({ ...formData, [key]: v })}
                    multiline={key.toLowerCase().includes('description')}
                />
            </View>
        );
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.loginContainer}>
                <View style={styles.loginCard}>
                    <Text style={styles.sideTitle}>ADMIN SECURE ACCESS</Text>
                    <Text style={styles.fieldLabel}>ENTER MASTER PIN</Text>
                    <TextInput
                        style={styles.input}
                        value={pin}
                        onChangeText={setPin}
                        placeholder="••••"
                        placeholderTextColor="#30363D"
                        secureTextEntry
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={handleLogin}>
                        <Text style={styles.saveBtnText}>Verify Identity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ marginTop: 20 }}
                        onPress={handleExit}
                    >
                        <Text style={styles.exitText}>← Back to Portfolio</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Sidebar */}
            <View style={styles.sidebar}>
                <View style={styles.sidebarHeader}>
                    <Text style={styles.sideTitle}>ADMIN CMS</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>v{packageJson.version || settings?.appVersion || '1.0.0'}</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.sidebarNav}>
                    {COLLECTIONS.map(col => (
                        <TouchableOpacity
                            key={col.id}
                            style={[styles.sideItem, activeCol.id === col.id && styles.sideActive]}
                            onPress={() => setActiveCol(col)}
                        >
                            <Text style={[styles.sideText, activeCol.id === col.id && styles.sideTextActive]}>{col.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.sidebarFooter}>
                    <View style={styles.statsContainer}>
                        <Text style={styles.statsHeader}>SITE ANALYTICS</Text>
                        <View style={styles.statLine}>
                            <Text style={styles.statLabel}>Today:</Text>
                            <Text style={styles.statValue}>{analyticsVisits?.[`daily_${new Date().toISOString().split('T')[0]}`] || 0} hits</Text>
                        </View>
                        <View style={styles.statLine}>
                            <Text style={styles.statLabel}>Total:</Text>
                            <Text style={styles.statValue}>{analyticsVisits?.totalHits || 0} hits</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={handleExit}
                    >
                        <Text style={styles.exitText}>Exit to Site →</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.main}>
                <View style={styles.topBar}>
                    <View>
                        <Text style={styles.mainTitle}>{activeCol.label} Console</Text>
                        {isDeploying && <Text style={{ color: '#3FB950', fontSize: 13, marginTop: 4, fontWeight: '700' }}>{deployStatus}</Text>}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {activeCol.id === 'deployment' && (
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: '#388BFD' }]}
                                onPress={handleDeploySite}
                                disabled={isDeploying}
                            >
                                <Text style={styles.addButtonText}>🚀 {isDeploying ? 'Deploying...' : 'Deploy to Production'}</Text>
                            </TouchableOpacity>
                        )}
                        {activeCol.id !== 'site_analytics' && (
                            <TouchableOpacity style={styles.addButton} onPress={handleAddNew} disabled={isDeploying}>
                                <Text style={styles.addButtonText}>
                                    + Add {activeCol.type === 'doc' ? 'Document' : 'Item'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {activeCol.id === 'site_analytics' ? (
                    renderAnalyticsDashboard()
                ) : loading ? (
                    <ActivityIndicator size="large" color="#3FB950" style={{ marginTop: 50 }} />
                ) : (
                    <ScrollView style={styles.scroll}>
                        {editingItem ? (
                            <View style={styles.editor}>
                                <Text style={styles.editorTitle}>{editingItem.id === 'new' ? 'Create New' : `Editing: ${editingItem.id}`}</Text>
                                {Object.keys(formData).map(key => key !== 'id' && renderFieldValue(key, formData[key]))}

                                {/* Always show the add field button when editing to allow schema expansion */}
                                <TouchableOpacity
                                    style={styles.addFieldBtn}
                                    onPress={() => {
                                        const key = window.prompt("Enter new field name (use camelCase, e.g., 'subTitle'):");
                                        if (key && !formData[key]) {
                                            setFormData({ ...formData, [key]: '' });
                                        } else if (formData[key]) {
                                            alert('Field already exists!');
                                        }
                                    }}
                                >
                                    <Text style={{ color: '#8B949E' }}>+ Add custom field key to this document</Text>
                                </TouchableOpacity>

                                <View style={styles.editorActions}>
                                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                        <Text style={styles.saveBtnText}>Save Changes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingItem(null)}>
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.list}>
                                {items.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>No data mapping found in this collection.</Text>
                                        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                                            <Text style={styles.addButtonText}>Initialize First {activeCol.type === 'doc' ? 'Document' : 'Entry'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    items.map(item => (
                                        <View key={item.id} style={styles.itemCard}>
                                            <View style={styles.itemInfo}>
                                                <Text style={styles.itemName}>{item.title || item.label || item.year || item.id}</Text>
                                                <Text style={styles.itemId}>
                                                    {activeCol.id === 'deployment'
                                                        ? `${item.environment || 'Prod'} • ${item.status || 'Live'} • ${item.deployedAt || 'N/A'}`
                                                        : activeCol.id === 'projects'
                                                            ? `${item.category || 'App'} • ${Array.isArray(item.tech) ? item.tech.join(', ') : item.tech || ''}`
                                                            : `ID: ${item.id} • Order: ${item.order || 'N/A'}`}
                                                </Text>
                                            </View>
                                            <View style={styles.itemActions}>
                                                <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                                                    <Text style={styles.itemBtnText}>Edit</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id)}>
                                                    <Text style={styles.itemBtnText}>Delete</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    loginContainer: {
        flex: 1,
        backgroundColor: '#0D1117',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    loginCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#161B22',
        padding: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#30363D',
        alignItems: 'stretch', // Changed from center to stretch for full-width inputs
        gap: 20
    },
    container: {
        height: '100vh',
        flexDirection: 'row',
        backgroundColor: '#0D1117',
        color: '#E6EDF3'
    },
    sidebar: {
        width: 300,
        backgroundColor: '#161B22',
        borderRightWidth: 1,
        borderRightColor: '#30363D',
        display: 'flex',
        flexDirection: 'column'
    },
    sidebarHeader: {
        padding: 32,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    versionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: 'rgba(56, 139, 253, 0.15)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(56, 139, 253, 0.4)'
    },
    versionText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#58a6ff'
    },
    sidebarNav: {
        flex: 1,
        paddingHorizontal: 16
    },
    sidebarFooter: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#30363D'
    },
    statsContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20
    },
    statsHeader: {
        fontSize: 11,
        fontWeight: '800',
        color: '#8B949E',
        marginBottom: 12,
        letterSpacing: 1
    },
    statLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    statLabel: {
        fontSize: 12,
        color: '#8B949E'
    },
    statValue: {
        fontSize: 12,
        color: '#3FB950',
        fontWeight: '700'
    },
    sideTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#3FB950',
        letterSpacing: 1
    },
    sideItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 6
    },
    sideActive: {
        backgroundColor: 'rgba(63, 185, 80, 0.15)',
    },
    sideText: {
        color: '#8B949E',
        fontWeight: '500'
    },
    sideTextActive: {
        color: '#3FB950'
    },
    exitButton: {
        marginTop: 'auto',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#30363D'
    },
    exitText: {
        color: '#388BFD',
        fontWeight: '600',
        textAlign: 'center'
    },
    main: {
        flex: 1,
        padding: 40
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#E6EDF3'
    },
    addButton: {
        backgroundColor: '#238636',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: '600'
    },
    scroll: {
        flex: 1
    },
    list: {
        gap: 12
    },
    itemCard: {
        backgroundColor: '#161B22',
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#30363D',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemName: {
        color: '#E6EDF3',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4
    },
    itemId: {
        color: '#8B949E',
        fontSize: 12
    },
    itemActions: {
        flexDirection: 'row',
        gap: 8
    },
    editBtn: {
        backgroundColor: '#30363D',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4
    },
    delBtn: {
        backgroundColor: 'rgba(248, 81, 73, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(248, 81, 73, 0.4)'
    },
    itemBtnText: {
        color: '#C9D1D9',
        fontSize: 13,
        fontWeight: '500'
    },
    editor: {
        backgroundColor: '#161B22',
        padding: 32,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#30363D'
    },
    editorTitle: {
        color: '#3FB950',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 24
    },
    fieldGroup: {
        marginBottom: 20
    },
    fieldLabel: {
        color: '#8B949E',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1
    },
    input: {
        backgroundColor: '#0D1117',
        borderWidth: 1,
        borderColor: '#30363D',
        borderRadius: 6,
        padding: 12,
        color: '#E6EDF3',
        fontSize: 14,
        outlineStyle: 'none'
    },
    arrayLine: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8
    },
    deleteSmall: {
        justifyContent: 'center',
        padding: 8
    },
    addSmall: {
        paddingVertical: 4
    },
    subField: {
        marginLeft: 16,
        marginBottom: 8
    },
    subLabel: {
        color: '#8B949E',
        fontSize: 12,
        marginBottom: 4
    },
    editorActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 32,
        borderTopWidth: 1,
        borderTopColor: '#30363D',
        paddingTop: 24
    },
    saveBtn: {
        backgroundColor: '#238636',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 6,
        alignItems: 'center'
    },
    saveBtnText: {
        color: '#FFF',
        fontWeight: '700',
        textAlign: 'center'
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#30363D'
    },
    cancelBtnText: {
        color: '#C9D1D9'
    },
    addFieldBtn: {
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#30363D',
        alignItems: 'center'
    },
    emptyState: {
        padding: 60,
        backgroundColor: 'rgba(22, 27, 34, 0.5)',
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#30363D',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginTop: 20
    },
    emptyText: {
        color: '#8B949E',
        fontSize: 16,
        fontWeight: '500'
    },
    analyticsFrame: {
        flex: 1,
        paddingTop: 10
    },
    statCardBig: {
        flex: 1,
        backgroundColor: '#161B22',
        padding: 30,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(63, 185, 80, 0.3)',
        alignItems: 'center'
    },
    statNumberBig: {
        fontSize: 48,
        fontWeight: '900',
        color: '#3FB950'
    },
    statLabelBig: {
        fontSize: 12,
        color: '#8B949E',
        fontWeight: '700',
        marginTop: 8,
        letterSpacing: 2
    },
    chartContainer: {
        height: 300,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 20,
        borderRadius: 16,
        marginTop: 20
    },
    chartBarWrapper: {
        alignItems: 'center',
        flex: 1
    },
    chartBar: {
        width: 40,
        backgroundColor: '#3FB950',
        borderRadius: 6,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundImage: 'linear-gradient(to bottom, #3FB950, #238636)',
        boxShadow: '0 0 15px rgba(63, 185, 80, 0.2)'
    },
    chartValue: {
        color: '#E6EDF3',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8
    },
    chartLabel: {
        color: '#8B949E',
        fontSize: 10,
        marginTop: 12
    },
    infoBox: {
        marginTop: 30,
        padding: 20,
        backgroundColor: 'rgba(56, 139, 253, 0.1)',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#388BFD'
    },
    infoText: {
        color: '#C9D1D9',
        fontSize: 14,
        lineHeight: 22
    },
    // Premium Dashboard Styles
    dashboardStatsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap'
    },
    dashboardStatCard: {
        flex: 1,
        minWidth: 200,
        backgroundColor: '#161B22',
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#30363D',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
    },
    statIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(63, 185, 80, 0.15)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dashboardStatValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#E6EDF3'
    },
    dashboardStatLabel: {
        fontSize: 12,
        color: '#8B949E',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    dashboardChartsRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 24,
        flexWrap: 'wrap'
    },
    chartModernBlock: {
        flex: 1,
        minWidth: 400,
        backgroundColor: '#161B22',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#30363D'
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E6EDF3',
        marginBottom: 24,
        opacity: 0.9
    },
    eventList: {
        gap: 16
    },
    eventListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
    },
    eventInfo: {
        flex: 1,
        gap: 8
    },
    eventName: {
        color: '#C9D1D9',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    eventCount: {
        color: '#3FB950',
        fontWeight: '800',
        fontSize: 16
    },
    eventProgressBase: {
        height: 6,
        backgroundColor: 'rgba(48, 54, 61, 0.5)',
        borderRadius: 3,
        overflow: 'hidden'
    },
    eventProgressFill: {
        height: '100%',
        backgroundColor: '#3FB950',
        borderRadius: 3
    },
    infoBoxModern: {
        backgroundColor: 'rgba(56, 139, 253, 0.1)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(56, 139, 253, 0.2)'
    },
    infoTextModern: {
        color: '#58A6FF',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center'
    }
});

export default Admin;
