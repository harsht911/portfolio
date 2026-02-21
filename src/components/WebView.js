import React, { useEffect, useRef } from 'react';
import { View } from 'react-native-web';

/**
 * A View wrapper that supports CSS class names.
 */
const WebView = ({ children, className, style, nativeID, ...props }) => {
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node || !className) return;

        // Try to get the actual DOM node
        const domNode = node.classList ? node : (node.getScrollableNode?.() || node);
        if (!domNode || !domNode.classList) return;

        const classes = className.split(' ').filter(c => c.trim());
        classes.forEach(c => domNode.classList.add(c));

        return () => {
            classes.forEach(c => domNode.classList.remove(c));
        };
    }, [className]);

    return (
        <View ref={ref} style={style} nativeID={nativeID} {...props}>
            {children}
        </View>
    );
};

export default WebView;
