import { useEffect, useRef } from 'react';

/**
 * Hook that applies CSS class names to a react-native-web component's DOM node.
 * react-native-web ignores the `className` prop, so we use refs + DOM manipulation.
 *
 * Usage:
 *   const ref = useWebClass('hover-lift pulse-dot');
 *   <View ref={ref} style={styles.card}>...</View>
 */
const useWebClass = (className) => {
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node || !className) return;

        const classes = className.split(' ').filter(c => c.trim());
        classes.forEach(c => node.classList.add(c));

        return () => {
            classes.forEach(c => node.classList.remove(c));
        };
    }, [className]);

    return ref;
};

export default useWebClass;
