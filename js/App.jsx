// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
// App.tsx
import React from 'react';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { ChakraProvider } from '@chakra-ui/react';
import { FirebaseAppProvider } from 'reactfire';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAno9l7uKUR6SSI5M_cGqonZhw6JUQfrAk",
    authDomain: "tribalopolis-dev.firebaseapp.com",
    projectId: "tribalopolis-dev",
    storageBucket: "tribalopolis-dev.appspot.com",
    messagingSenderId: "79911740938",
    appId: "1:79911740938:web:5821518cb4c8bb76caa1f3",
    measurementId: "G-D58TT5J5J2"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const App = () => {
    return (<ChakraProvider>
        <FirebaseAppProvider firebaseConfig={firebaseConfig}>
          <div>Hello, world!</div>
        </FirebaseAppProvider>
      </ChakraProvider>);
};
export default App;
//# sourceMappingURL=App.jsx.map