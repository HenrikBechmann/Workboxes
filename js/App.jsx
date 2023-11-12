// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// App.tsx
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { useFirebaseApp, AuthProvider, useInitFirestore, FirestoreProvider } from 'reactfire';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { ChakraProvider } from '@chakra-ui/react';
const App = () => {
    const [appState, setAppState] = useState('setup');
    const app = useFirebaseApp();
    const auth = getAuth(app);
    // TODO consider persitent database
    const { status: firestoreStatus, data: firestoreInstance } = useInitFirestore((firebaseApp) => __awaiter(void 0, void 0, void 0, function* () {
        const db = initializeFirestore(firebaseApp, {});
        return db;
    }));
    useEffect(() => {
        if (firestoreStatus !== 'success') { // 'success', 'loading', 'error'
            setAppState(firestoreStatus);
        }
        else {
            setAppState('ready');
        }
    }, [appState, firestoreStatus]);
    return (<AuthProvider sdk={auth}>
            {appState == 'ready'
            ? <FirestoreProvider sdk={firestoreInstance}>
                    <ChakraProvider>
                        <div>Hello, world!</div>
                    </ChakraProvider>
                  </FirestoreProvider>
            : <div>Waiting...</div>}
        </AuthProvider>);
};
export default App;
//# sourceMappingURL=App.jsx.map