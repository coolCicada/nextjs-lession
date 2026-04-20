'use client';
import React, { forwardRef, useEffect, useRef } from 'react';

// 自定义 Hook
const useMergeRefs = (refs: Array<any>) => {
    return (node: any) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                ref.current = node;
            }
        });
    };
};

// 示例组件
const MergedRefComponent = forwardRef((props, ref) => {
    const localRef = useRef(null);
    const mergedRef = useMergeRefs([ref, localRef]);

    useEffect(() => {
        console.log('Merged ref:', localRef.current); // 打印合并后的引用
    }, []);

    return <div ref={mergedRef}>Hello</div>;
});

MergedRefComponent.displayName = 'MergedRefComponent';

// 父组件
const App = () => {
    const ref = useRef(null);

    return (
        <div>
            <MergedRefComponent ref={ref} />
            <button onClick={() => console.log(ref.current)}>Log Ref</button>
        </div>
    );
};

export default App;
