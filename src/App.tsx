// App.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, {useContext} from 'react'

// services
import { Routes, Route } from 'react-router'

// firebase
import { getAuth } from 'firebase/auth'
// TODO implement firestore
import { initializeApp } from "firebase/app";
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore'


// local
import Tribalopolis from './Tribalopolis'
import Start from './pages/Start'
import ProtectedRoute from './components/ProtectedRoute'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
      
        <Routes>
            <Route path = '/' element = {
                <ProtectedRoute 
                    user = {null} 
                    redirectPath = '/start'>
                    <Tribalopolis/>
                </ProtectedRoute>
            } />
            <Route path = '/start' element = {<Start />} />
{
//            <Route path = '/signup' element = {<Signup />} />
//            <Route path = '/login' element = {<Login />} />
//            <Route path = '/admin' element = {<Admin />} />
//            <Route path = '*' element = {<NotFound />} />
}                
        </Routes>

    )
  
}

export default App