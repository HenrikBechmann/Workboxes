
import React from 'react'

import { BrowserRouter } from 'react-router-dom'
import { FirebaseAppProvider} from 'reactfire'

const firebaseConfig = {
  apiKey: "AIzaSyAno9l7uKUR6SSI5M_cGqonZhw6JUQfrAk",
  authDomain: "tribalopolis-dev.firebaseapp.com",
  projectId: "tribalopolis-dev",
  storageBucket: "tribalopolis-dev.appspot.com",
  messagingSenderId: "79911740938",
  appId: "1:79911740938:web:5821518cb4c8bb76caa1f3",
  measurementId: "G-D58TT5J5J2"
};

import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root'))

root.render(
    <BrowserRouter>
        <App /> 
    </BrowserRouter>
)