// App.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, {useContext} from 'react'

// firebase
import { getAuth } from 'firebase/auth'

// TODO implement this
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { initializeApp } from "firebase/app";
import { Routes, Route } from 'react-router'

// local
import Tribalopolis from './Tribalopolis'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// chakra
import { ChakraProvider } from '@chakra-ui/react'

const firebaseConfig = {
  apiKey: "AIzaSyAno9l7uKUR6SSI5M_cGqonZhw6JUQfrAk",
  authDomain: "tribalopolis-dev.firebaseapp.com",
  projectId: "tribalopolis-dev",
  storageBucket: "tribalopolis-dev.appspot.com",
  messagingSenderId: "79911740938",
  appId: "1:79911740938:web:5821518cb4c8bb76caa1f3",
  measurementId: "G-D58TT5J5J2"
};

const firebaseApp = initializeApp(firebaseConfig);

const FirebaseAppContext = React.createContext(firebaseApp)

export const useFirebaseApp = () => {
    return useContext(FirebaseAppContext)
}

const App = () => {

    return (
      
        <ChakraProvider>
            <Routes>
                <Route path = '/' element = {<div> home </div>} />
                <Route path = "/start" element = {<Tribalopolis />} />
{
//                <Route path = '/workspace' element = {<Workspace />} />
//                <Route path = '/signup' element = {<Signup />} />
//                <Route path = '/login' element = {<Login />} />
//                <Route path = '/admin' element = {<Admin />} />
//                <Route path = '*' element = {<NotFound />} />
}                
            </Routes>
        </ChakraProvider>

    )
  
}

export default App