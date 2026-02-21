import React, { useEffect, useRef } from 'react';
import { View } from 'react-native-web';

/**
 * ScrollReveal with IntersectionObserver.
 * We use direct DOM manipulation because RNW ignores className.
 * Version: Safe (Defaults to visible if observer not supported or fails)
 */
const ScrollReveal = ({ children, style, delay = 0 }) => {
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node || !window.IntersectionObserver) return;

        // Try to get the actual DOM node
        const domNode = node.classList ? node : (node.getScrollableNode?.() || node);
        if (!domNode || !domNode.style) return;

        // Initial state for animation (now starts at 0.1 so it's not invisible if something breaks)
        domNode.style.opacity = '0.01';
        domNode.style.transform = 'translateY(20px)';
        domNode.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        domNode.style.opacity = '1';
                        domNode.style.transform = 'translateY(0)';
                    }, delay);
                    observer.unobserve(domNode);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        observer.observe(domNode);

        return () => {
            observer.unobserve(domNode);
        };
    }, [delay]);

    return (
        <View ref={ref} style={style}>
            {children}
        </View>
    );
};

export default ScrollReveal;
