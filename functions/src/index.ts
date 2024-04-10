// tribalopolis cloud functions
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/**
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {initializeApp} from 'firebase/app'
import {getFirestore} from "firebase-admin/firestore";
import {getFirestore as getdb, collection, addDoc} from "firebase/firestore"
import { auth as userAuth } from "firebase-functions"
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

const app = initializeApp();

// This has to use version 1
export const setupNewUser = userAuth.user().onCreate(async (user)=>{
  const {displayName, photoURL, uid} = user
  const db = getdb(app);
  const domainDocRef = await addDoc(collection(db,"domains"),
    {
      profile:{
        name:displayName, 
        thumbnail:photoURL,
        owner:{
          ID:uid,
          name:displayName,
        }
      }
    }
  );
  const workboxDocRef = await addDoc(collection(db,"workboxes"),
    {
      profile:{
        domain:{
          ID:domainDocRef.id, 
          name:displayName,
        },
        owner:{
          ID:uid
        }
      }
    }
  );
  // const accountDocumentRef = await db.doc("accounts").set({});
  // const userDocRef = await db.doc("users").set({
  //   profile:{
  //     ID:uid, 
  //     name:displayName, 
  //     thumbnail:photoURL,
  //   }
  // });

})

// --
export const updateDatabase = onCall( async (request) => {
  const getAuthorization = () => {
    const isAdmin = !!request.auth?.token.admin === true;
    const isAuthorized = isAdmin;
    return isAuthorized;
  };

  const response = {status: false, error: false, message: "", docpath: ""};
  const isAuthorized = getAuthorization();

  if (!isAuthorized) {
    response.message = "requested database operation is not authorized";
    return response;
  }

  const {data} = request;
  const {document, context} = data;
  const {operation, path, collection, documentID} = context;
  const db = getFirestore(app);
  // const db = getdb(app)
  const docpath = path + collection + "/" + documentID;
  response.docpath = docpath;
  switch (operation) {
  // case "add": {
  //   const id = documentID || db.doc(docpath).id
  //   docpath += id
  //   try {
  //     await db.doc(docpath).set(document)
  //   } catch(error:any) {
  //     response.error = true
  //     response.message = error.message
  //     return response
  //   }
  //   break;
  // }
  case "set": {
    try {
      await db.doc(docpath).set(document);
    } catch (e) {
      const error:Error = e as Error;
      response.error = true;
      response.message = error.message;
      return response;
    }
    break;
  }
  // case "update":{
  //   try {
  //     await db.doc(docpath).update(document)
  //   } catch(error:any) {
  //     response.error = true
  //     response.message = error.message
  //     return response
  //   }
  //   break;
  // }
  // case "delete":{
  //   try {
  //     await db.doc(docpath).delete(document)
  //   } catch(error:any) {
  //     response.error = true
  //     response.message = error.message
  //     return response
  //   }
  //   break
  // }
  default: {
    response.message = "unrecognized operation requested";
    return response;
  }
  }

  response.message = "database update operation was completed";
  response.status = true;
  return response;
});

// --
export const setAdminClaim = onCall( async (request) =>{
  // validate the caller
  let email = request.auth?.token.email || null;
  if (email) email = email.toLowerCase();
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("sysadmins")
      .where("properties.email", "==", email).get();
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      error: true,
      message: error.message,
    };
  }
  if (!result?.docs[0]) {
    return {
      status: false,
      message: "sender email not found",
    };
  }

  // make sure candidate email is provided
  let candidateemail = request.data.email;
  if (!candidateemail) {
    return {
      status: false,
      message: "candidate email required",
    };
  }

  // validate the candidate email
  candidateemail = candidateemail.toLowerCase();
  try {
    result = await db.collection("sysadmins")
      .where("properties.email", "==", candidateemail).get();
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      error: true,
      message: error.message,
    };
  }

  if (!result?.docs[0]) {
    return {
      status: false,
      message: "candidate email not found",
    };
  }
  let user;
  try {
    user = await admin.auth().getUserByEmail(candidateemail);
    if (user.customClaims && user.customClaims.admin === true) {
      return {
        status: true,
        message: "candidate already has admin claim",
      };
    }
    admin.auth().setCustomUserClaims(user.uid, {admin: true});
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      error: true,
      message: error.message,
    };
  }
  return {
    status: true,
    message: "candidate admin claim is set",
  };
});

// --
export const revokeAdminClaim = onCall( async (request) =>{
  // validate the caller
  let email = request.auth?.token.email || null;
  if (email) email = email.toLowerCase();
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("sysadmins")
      .where("properties.email", "==", email).get();
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      error: true,
      message: error.message,
    };
  }
  if (!result?.docs[0]) {
    return {
      status: false,
      message: "sender email not found",
    };
  }

  // make sure candidate email is provided
  let candidateemail = request.data.email;
  if (!candidateemail) {
    return {
      status: false,
      message: "candidate email required",
    };
  }
  candidateemail = candidateemail.toLowerCase();

  let user;
  try {
    user = await admin.auth().getUserByEmail(candidateemail);
    if (user.customClaims && !user.customClaims.admin) {
      return {
        status: true,
        message: "candidate did not have admin claim",
      };
    }
    admin.auth().setCustomUserClaims(user.uid, null);
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      error: true,
      message: error.message,
    };
  }
  return {
    status: true,
    message: "candidate admin claim revoked",
  };
});

// --
export const isAdminUser = onCall(async (request) => {
  const isAdmin = !!request.auth?.token.admin === true;
  return {
    status: isAdmin,
  };
});

// --
export const isSuperUser = onCall(async (request) => {
  let email = request.auth?.token.email || null;
  if (email) email = email.toLowerCase();
  const isAdmin = {
    isSuperUser: false,
    errorCondition: false,
    role: undefined,
  };
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("sysadmins")
      .where("properties.email", "==", email).get();
  } catch (e) {
    isAdmin.errorCondition = true;
  }
  if (result?.docs[0]) {
    isAdmin.role = result.docs[0].data().role;
    isAdmin.isSuperUser = true;
  }
  return isAdmin;
});

export const beforecreated = beforeUserCreated(async (event) => {
  const user = event.data;
  let email = user?.email;
  if (email) email = email.toLowerCase();
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("invitations")
      .where("properties.email", "==", email).get();
  } catch (e) {
    const error:Error = e as Error;
    throw new HttpsError("internal",
      "Internal error: " + error?.message);
  }
  if (!result?.docs[0]) {
    throw new HttpsError("permission-denied",
      "An invitation is required to sign in to Tribalopolis.",
      email + " was not found in invitations.");
  }
});

// --
export const beforesignedin = beforeUserSignedIn(async (event) => {
  const user = event.data;
  let email = user?.email;
  if (email) email = email.toLowerCase();
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("suspensions")
      .where("properties.email", "==", email).get();
  } catch (e) {
    const error:Error = e as Error;
    throw new HttpsError("internal",
      "Internal error: " + error?.message);
  }
  if (result?.docs[0]) {
    throw new HttpsError("permission-denied",
      "Accounts must be in good standing to sign in to Tribalopolis.",
      email + " was found in suspensions.");
  }
});
