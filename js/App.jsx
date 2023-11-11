// App.tsx
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { ChakraProvider } from '@chakra-ui/react';
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
const App = () => {
    return (<ChakraProvider>
          <div>Hello, world!</div>
      </ChakraProvider>);
};
export default App;
//# sourceMappingURL=App.jsx.map