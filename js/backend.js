(function () {
  const config = window.RESEARCH_FIREBASE_CONFIG || {};
  const sdkVersion = "12.18.0";
  let servicesPromise;

  function isConfigured() {
    const firebase = config.firebase || {};
    return Boolean(config.enabled && firebase.apiKey && firebase.projectId && firebase.appId);
  }

  async function services() {
    if (!isConfigured()) throw new Error("Firebase is not configured yet.");
    if (!servicesPromise) {
      servicesPromise = Promise.all([
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-firestore.js`),
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-storage.js`)
      ]).then(([appApi, authApi, firestoreApi, storageApi]) => {
        const app = appApi.initializeApp(config.firebase);
        return {
          authApi,
          firestoreApi,
          storageApi,
          auth: authApi.getAuth(app),
          db: firestoreApi.getFirestore(app),
          storage: storageApi.getStorage(app)
        };
      });
    }
    return servicesPromise;
  }

  function cleanPublication(id, value) {
    const item = { ...value, id };
    item.url = `research/publications/?paper=${encodeURIComponent(item.slug || id)}`;
    delete item.createdAt;
    delete item.updatedAt;
    return item;
  }

  function cleanProfile(id, value) {
    const item = { ...value, id, ownerUid: id };
    item.profileHandle = item.slug || "";
    item.slug = `member-${id}`;
    item.accountEmail = item.email || "";
    item.email = item.publicEmail || "";
    delete item.createdAt;
    delete item.updatedAt;
    return item;
  }

  function verified(user) {
    return Boolean(user && user.email && user.emailVerified);
  }

  async function listPublications(options = {}) {
    if (!isConfigured()) return [];
    const service = await services();
    const { collection, getDocs, query, where } = service.firestoreApi;
    let reference;
    if (options.includeDrafts) {
      const user = service.auth.currentUser;
      if (!verified(user)) throw new Error("A verified email address is required.");
      reference = await isAdmin(user)
        ? collection(service.db, "publications")
        : query(collection(service.db, "publications"), where("ownerUid", "==", user.uid));
    } else {
      reference = query(collection(service.db, "publications"), where("status", "==", "published"));
    }
    const snapshot = await getDocs(reference);
    return snapshot.docs.map((entry) => cleanPublication(entry.id, entry.data()));
  }

  async function listProfiles(options = {}) {
    if (!isConfigured()) return [];
    const service = await services();
    const { collection, getDocs, query, where } = service.firestoreApi;
    let reference = query(collection(service.db, "profiles"), where("status", "==", "public"));
    if (options.includePrivate) {
      const user = service.auth.currentUser;
      if (!user || !(await isAdmin(user))) throw new Error("Site administrator access is required.");
      reference = collection(service.db, "profiles");
    }
    const snapshot = await getDocs(reference);
    return snapshot.docs.map((entry) => cleanProfile(entry.id, entry.data()));
  }

  async function signIn() {
    const service = await services();
    const provider = new service.authApi.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return service.authApi.signInWithPopup(service.auth, provider);
  }

  async function signOut() {
    const service = await services();
    return service.authApi.signOut(service.auth);
  }

  async function subscribeAuth(callback) {
    const service = await services();
    return service.authApi.onAuthStateChanged(service.auth, callback);
  }

  async function isAdmin(user) {
    if (!user) return false;
    const service = await services();
    const { doc, getDoc } = service.firestoreApi;
    const record = await getDoc(doc(service.db, "admins", user.uid));
    return record.exists() && record.data().active === true;
  }

  async function getOwnProfile() {
    const service = await services();
    const user = service.auth.currentUser;
    if (!verified(user)) return null;
    const record = await service.firestoreApi.getDoc(service.firestoreApi.doc(service.db, "profiles", user.uid));
    return record.exists() ? cleanProfile(record.id, record.data()) : null;
  }

  async function saveOwnProfile(profile) {
    const service = await services();
    const user = service.auth.currentUser;
    if (!verified(user)) throw new Error("Verify your email address before editing a profile.");
    const { doc, serverTimestamp, setDoc } = service.firestoreApi;
    const payload = {
      ...profile,
      email: user.email,
      ownerUid: user.uid,
      updatedAt: serverTimestamp()
    };
    delete payload.id;
    await setDoc(doc(service.db, "profiles", user.uid), payload, { merge: true });
    return user.uid;
  }

  async function saveManagedProfile(profile) {
    const service = await services();
    const user = service.auth.currentUser;
    if (!verified(user) || !(await isAdmin(user))) throw new Error("Site administrator access is required.");
    const { doc, serverTimestamp, setDoc } = service.firestoreApi;
    const id = profile.id || `curated-${profile.slug}`;
    const payload = {
      ...profile,
      adminManaged: true,
      ownerUid: "curated",
      updatedAt: serverTimestamp(),
      updatedBy: user.uid
    };
    delete payload.id;
    await setDoc(doc(service.db, "profiles", id), payload, { merge: true });
    return id;
  }

  async function deleteManagedProfile(id) {
    const service = await services();
    const user = service.auth.currentUser;
    if (!verified(user) || !(await isAdmin(user))) throw new Error("Site administrator access is required.");
    await service.firestoreApi.deleteDoc(service.firestoreApi.doc(service.db, "profiles", id));
  }

  async function uploadPaper(file, publicationId, progress) {
    if (!file || !file.size) return null;
    if (file.type !== "application/pdf") throw new Error("Only PDF uploads are accepted.");
    if (file.size > 25 * 1024 * 1024) throw new Error("PDFs must be 25 MB or smaller.");
    const service = await services();
    const user = service.auth.currentUser;
    if (!verified(user)) throw new Error("A verified email address is required.");
    const safeName = String(file.name || "paper.pdf").replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `papers/${user.uid}/${publicationId}/${Date.now()}-${safeName}`;
    const reference = service.storageApi.ref(service.storage, path);
    const task = service.storageApi.uploadBytesResumable(reference, file, { contentType: "application/pdf" });
    await new Promise((resolve, reject) => {
      task.on("state_changed", (snapshot) => {
        if (progress) progress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      }, reject, resolve);
    });
    return {
      paperUrl: await service.storageApi.getDownloadURL(task.snapshot.ref),
      storagePath: path,
      fileName: file.name
    };
  }

  async function uploadProfilePhoto(file, progress) {
    if (!file || !file.size) return null;
    if (!/^image\/(?:jpeg|png|webp)$/.test(file.type)) throw new Error("Profile photos must be JPEG, PNG, or WebP.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Profile photos must be 5 MB or smaller.");
    const service = await services();
    const user = service.auth.currentUser;
    if (!verified(user)) throw new Error("A verified email address is required.");
    const extension = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `profiles/${user.uid}/photo-${Date.now()}.${extension}`;
    const reference = service.storageApi.ref(service.storage, path);
    const task = service.storageApi.uploadBytesResumable(reference, file, { contentType: file.type });
    await new Promise((resolve, reject) => task.on("state_changed", (snapshot) => {
      if (progress) progress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
    }, reject, resolve));
    return await service.storageApi.getDownloadURL(task.snapshot.ref);
  }

  async function savePublication(publication) {
    const service = await services();
    const user = service.auth.currentUser;
    if (!verified(user)) throw new Error("A verified email address is required.");
    const administrator = await isAdmin(user);
    const { doc, getDoc, serverTimestamp, setDoc } = service.firestoreApi;
    const id = publication.id || publication.slug;
    const reference = doc(service.db, "publications", id);
    const existing = await getDoc(reference);
    if (!administrator && existing.exists() && existing.data().ownerUid !== user.uid) throw new Error("You can edit only your own publications.");
    const ownProfile = administrator ? null : await getOwnProfile();
    if (!administrator && !ownProfile) throw new Error("Create your researcher profile before adding publications.");
    const ownerUid = administrator ? (publication.ownerUid || (existing.exists() && existing.data().ownerUid) || user.uid) : user.uid;
    const payload = {
      ...publication,
      ownerUid,
      profileSlugs: administrator ? (publication.profileSlugs || []) : [ownProfile.slug],
      updatedAt: serverTimestamp(),
      updatedBy: user.uid
    };
    delete payload.id;
    await setDoc(reference, payload, { merge: true });
    return id;
  }

  async function deletePublication(id) {
    const service = await services();
    const user = service.auth.currentUser;
    if (!verified(user)) throw new Error("A verified email address is required.");
    const reference = service.firestoreApi.doc(service.db, "publications", id);
    const record = await service.firestoreApi.getDoc(reference);
    if (!record.exists()) return;
    if (!(await isAdmin(user)) && record.data().ownerUid !== user.uid) throw new Error("You can delete only your own publications.");
    await service.firestoreApi.deleteDoc(reference);
  }

  window.RESEARCH_BACKEND = {
    isConfigured,
    listPublications,
    listProfiles,
    signIn,
    signOut,
    subscribeAuth,
    isAdmin,
    getOwnProfile,
    saveOwnProfile,
    saveManagedProfile,
    deleteManagedProfile,
    uploadPaper,
    uploadProfilePhoto,
    savePublication,
    deletePublication
  };
})();
