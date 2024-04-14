// tribalopolis cloud functions
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/**
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// firebase-functions
import {onCall, HttpsError} from "firebase-functions/v2/https";
// import {auth as userAuth} from "firebase-functions";
// import {log} from "firebase-functions/logger";
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

// firebase-admin for version 2
import * as admin from "firebase-admin";
import {getFirestore as getFirestoreV2} from "firebase-admin/firestore";
import {initializeApp as initializeAppV2} from "firebase-admin/app";

// firebase, apparently required for version 1 functions below
// import {initializeApp as initializeAppV1} from "firebase/app";
// import {getFirestore as getFirestoreV1,
//   collection,
//   doc,
//   setDoc,
//   addDoc,
//   updateDoc,
//   serverTimestamp,
//   increment,
// } from "firebase/firestore";

// import firebaseConfig from "./firebaseConfig";

const appV2 = initializeAppV2();

// // This has to use version 1
// export const setupNewUser = userAuth.user().onCreate(async (user)=>{
//   const {displayName, photoURL, uid} = user;
//   const appV1 = initializeAppV1(firebaseConfig);
//   const db = getFirestoreV1(appV1);

//   // source of truth: utilities.updateDocumentVersion
//   const domainDocRef = await addDoc(collection(db, "domains"),
//     {
//       version: 0,
//       generation: 0,
//       profile: {
//         is_userdomain: true,
//         domain: {
//           name: displayName,
//           image: {
//             source: photoURL,
//           },
//         },
//         handle: {
//           id: null,
//           name: null,
//         },
//         owner: {
//           id: uid,
//           name: displayName,
//         },
//         administrator: {
//           id: null,
//           name: null,
//         },
//         workbox: {
//           id: null,
//           name: null,
//         },
//         commits: {
//           created_by: {id: uid, name: displayName},
//           created_timestamp: serverTimestamp(),
//           updated_by: {id: null, name: null},
//           updated_timestamp: null,
//         },
//         counts: {
//           members: 0,
//           workboxes: 0,
//         },
//       },
//     }
//   );

//   const workboxDocRef = await addDoc(collection(db, "workboxes"),
//     {
//       version: 0,
//       generation: 0,
//       profile: {
//         is_domainworkbox: true,
//         workbox: {
//           name: displayName,
//           image: {
//             source: photoURL,
//           },
//         },
//         owner: {
//           id: uid,
//           name: displayName,
//         },
//         domain: {
//           id: domainDocRef.id,
//           name: displayName,
//         },
//         type: {
//           name: "container",
//           alias: "Container",
//           image: {
//             source: null,
//           },
//         },
//         commits: {
//           created_by: {
//             id: uid,
//             name: displayName,
//           },
//           created_timestamp: serverTimestamp(),
//           updated_by: {id: null, name: null},
//           updated_timestamp: null,
//         },
//         read_role: "member",
//         write_role: null,
//         counts: {
//           links: 0,
//           references: 0,
//         },
//       },
//       document: {
//         sections: [
//           {
//             name: "standard",
//             alias: "Standard",
//             position: 0,
//             data: {
//               name: displayName,
//               image: {
//                 source: photoURL,
//               },
//               description: null,
//               summary: null,
//             },
//           },
//         ],
//       },
//       databox: {
//         accepts: [],
//         links: {
//           cached: true,
//           cache: [],
//         },
//       },
//     }
//   );

//   await updateDoc(domainDocRef, {
//     profile: {
//       generation: increment(1),
//       workbox: {
//         id: workboxDocRef,
//         name: displayName,
//       },
//     },
//   });

//   const accountDocumentRef = await addDoc(collection(db, "accounts"),
//     {
//       version: 0,
//       generation: 0,
//       profile: {
//         account: {
//           name: displayName,
//           image: {
//             source: photoURL,
//           },
//         },
//         owner: {
//           id: uid,
//           name: displayName,
//         },
//         commits: {
//           created_by: {
//             id: uid,
//             name: displayName,
//           },
//           created_timestamp: serverTimestamp(),
//           updated_by: {id: null, handle: null, name: null},
//           updated_timestamp: null,
//         },
//         counts: {
//         },
//       },
//     }
//   );

//   const userRecordRef = doc(db, "users", uid);
//   await setDoc(userRecordRef,

//     {
//       version: 0,
//       generation: 0,
//       profile: {
//         is_abandoned: false,
//         user: {
//           name: displayName,
//           image: {
//             source: photoURL,
//           },
//         },
//         domain: {
//           id: domainDocRef.id,
//           name: displayName,
//         },
//         handle: {
//           id: null,
//           name: null,
//         },
//         account: {
//           id: accountDocumentRef.id,
//           name: displayName,
//         },
//         commits: {
//           created_by: {
//             id: uid,
//             name: displayName,
//           },
//           created_timestamp: serverTimestamp(),
//           updated_by: {id: null, handle: null, name: null},
//           updated_timestamp: null,
//         },
//         counts: {
//         },
//       },
//     }
//   );
// });

// // This has to use version 1
// // set is_abandoned = true in user record
// export const abandonUser = userAuth.user().onDelete(async (user)=>{
//   const {uid} = user;
//   const appV1 = initializeAppV1(firebaseConfig);
//   const db = getFirestoreV1(appV1);
//   const userRecordRef = doc(db, "users", uid);
//   await updateDoc(userRecordRef, {
//     profile: {
//       is_abandoned: true,
//     },
//   });
// });

// the rest are version 2
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
  const db = getFirestoreV2(appV2);
  const docpath = path + collection + "/" + documentID;

  response.docpath = docpath;

  switch (operation) {
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
  const db = getFirestoreV2(appV2);
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
  const db = getFirestoreV2(appV2);
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
  const db = getFirestoreV2(appV2);
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
  const db = getFirestoreV2(appV2);
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
  try {
    const db = getFirestoreV2(appV2);
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
  } catch (e) {
    const error:Error = e as Error;
    throw new HttpsError("internal",
      "Internal error: getFirestore" + error?.message);
  }
});
