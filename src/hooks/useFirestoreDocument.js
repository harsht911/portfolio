import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestoreDocument = (collectionName, documentId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const docRef = doc(db, collectionName, documentId);

        // Using onSnapshot for real-time updates if settings change
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setData({ id: docSnap.id, ...docSnap.data() });
            } else {
                setData(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching Firestore document:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName, documentId]);

    return { data, loading, error };
};
