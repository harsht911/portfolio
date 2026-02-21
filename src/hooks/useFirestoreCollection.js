import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestoreCollection = (collectionName, orderField = null) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let q = collection(db, collectionName);
                if (orderField) {
                    q = query(q, orderBy(orderField, 'asc'));
                }

                const querySnapshot = await getDocs(q);
                const documents = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setData(documents);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching Firestore collection:", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [collectionName, orderField]);

    return { data, loading, error };
};
