import React, { useEffect } from 'react';
import { tester } from './test';

const App = (): JSX.Element => {
    useEffect(() => {
        tester();
    }, []);
    
    return (
        <>
            <h1>test</h1>
        </>
    );
};

export default App;