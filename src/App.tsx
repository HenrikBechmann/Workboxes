// App.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React from 'react'

// firebase
import { getAuth } from 'firebase/auth'
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

// local
import Tribalopolis from './Tribalopolis'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// chakra
import { ChakraProvider } from '@chakra-ui/react'

const App = () => {

    return (
      
        <ChakraProvider>
            <Tribalopolis />
        </ChakraProvider>

    )
  
}

export default App