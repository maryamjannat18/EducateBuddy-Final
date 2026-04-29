//This secction consistents all the imports for Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";


//Imports Firebase storage tools
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

//Imports Firebase Authentication tools
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

//Imports Firebase Firestore tools
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";



//EducateBuddys unique configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhWJjF7m7ei-s9govmEYdjomVPJoxQinQ",
  authDomain: "educatebuddy-d8460.firebaseapp.com",
  projectId: "educatebuddy-d8460",
  storageBucket: "educatebuddy-d8460.firebasestorage.app",
  messagingSenderId: "139681483106",
  appId: "1:139681483106:web:26aaeb7fe5eea45f30043b",
  measurementId: "G-VR7D8TZTJ5"
};

//initialises Firebase with configuration
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

//Forms input for login and signup 
const email = document.getElementById("email");
const password = document.getElementById("password");
const nameInput = document.getElementById("name");
const msg = document.getElementById("msg");

//Tab buttons to switch between the login and signup pages
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const signupNow = document.getElementById("signupNow");
const forgotPassword = document.getElementById("forgotPassword");
const formTitle = document.getElementById("formTitle");
const bottomText = document.getElementById("bottomText");

//Action buttons on login/signup pages
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const resendBtn = document.getElementById("resendBtn");

//Containers that show or hide based on login status
const dashBox = document.getElementById("dashBox");
const authBox = document.getElementById("authBox");

//Group management elements
const groupList = document.getElementById("groupList");
const createGroupBtn = document.getElementById("createGroupBtn");
const groupNameInput = document.getElementById("groupName");
const joinGroupBtn = document.getElementById("joinGroupBtn");
const groupCodeInput = document.getElementById("groupCode");
const groupMsg = document.getElementById("groupMsg");

//Message elements
const chatBox = document.getElementById("chatBox");
const chatTitle = document.getElementById("chatTitle");
const chatHint = document.getElementById("chatHint");
const memberList = document.getElementById("memberList");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendMsgBtn = document.getElementById("sendMsgBtn");
const shareFileBtn = document.getElementById("shareFileBtn");

//To do list elements
const todoInput = document.getElementById("todoInput");
const todoDeadline = document.getElementById("todoDeadline");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");

//group management for leaving/deleting elements
const leaveGroupBtn = document.getElementById("leaveGroupBtn");
const deleteGroupBtn = document.getElementById("deleteGroupBtn");

//notificaiton elements
const notificationList = document.getElementById("notificationList");
const clearNotificationsBtn = document.getElementById("clearNotificationsBtn");

//calendar elements
const calendarPageBtn = document.getElementById("calendarPageBtn");


//State Variables
//track current state of website
let currentGroupId = null;
let currentGroupName = "";
let currentUserName = "";
let isSignup = false;

//clean up for when switching groups or logging out
let unsubscribeTodos = null;
let unsubscribeMessages = null;
let unsubscribeMembers = null;
let unsubscribeNotifications = null;



//Functions
//shows message on page
function showMessage(text, color = "black") {
  msg.textContent = text;
  msg.style.color = color;
}

//ensures login form is working and not signup
function switchToLogin() {
  isSignup = false;

//removes name section for login
  if (nameInput) {
    nameInput.style.display = "none";
    nameInput.value = "";
  }

  //clear messages and input boxes 
  if (email) email.value = "";
  if (password) password.value = "";
  if (msg) msg.textContent = "";

  //login form title
  if (formTitle) formTitle.textContent = "Login Form";

  //shows login button, hides signup 
  if (loginBtn) loginBtn.style.display = "block";
  if (signupBtn) signupBtn.style.display = "none";

  //resend verification and forgot password links
  if (resendBtn) resendBtn.style.display = "block";
  if (forgotPassword) forgotPassword.style.display = "block";


  if (bottomText) {
    bottomText.innerHTML = `Not a member? <span id="signupNow">Signup now</span>`;
  
    const newSignupNow = document.getElementById("signupNow");
    if (newSignupNow) {
      newSignupNow.addEventListener("click", switchToSignup);
    }
  }

  //active login tab
  if (loginTab) loginTab.classList.add("active");
  if (signupTab) signupTab.classList.remove("active");
}

// Switches the form to signup 
function switchToSignup() {
  isSignup = true;

  if (nameInput) {
    nameInput.style.display = "block";
    nameInput.value = "";
  }

  
  if (email) email.value = "";
  if (password) password.value = "";
  if (msg) msg.textContent = "";

  if (formTitle) formTitle.textContent = "Signup Form";

  if (loginBtn) loginBtn.style.display = "none";
  if (signupBtn) signupBtn.style.display = "block";

  // Hides resend verification and forgot password for signup
  if (resendBtn) resendBtn.style.display = "none";
  if (forgotPassword) forgotPassword.style.display = "none";

  if (bottomText) {
    bottomText.innerHTML = `Already have an account? <span id="signupNow">Login now</span>`;

  // Add click event to the new span
    const newLoginNow = document.getElementById("signupNow");
    if (newLoginNow) {
      newLoginNow.addEventListener("click", switchToLogin);
    }
  }
//signup tab active
  if (signupTab) signupTab.classList.add("active");
  if (loginTab) loginTab.classList.remove("active");
}

//gets logged in user name from Firestore
async function getCurrentUserName() {
  const user = auth.currentUser;
  if (!user) return "";

  //using UID, checks user collection for account details
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  //returns saved name once found
  if (userSnap.exists()) {
    const data = userSnap.data();
    return data.name || user.email || "User";
  }

  //return email if not found
  return user.email || "User";
}


//group/chat/task is cleared if no group is selcted or user logs out
function clearGroupUI() {
  currentGroupId = null;
  currentGroupName = "";
  chatTitle.textContent = "Group Chat";

  if (chatHint) chatHint.style.display = "block";
  chatBox.style.display = "none";

//group/chat/task emptied
  memberList.innerHTML = "";
  todoList.innerHTML = "";
  messagesDiv.innerHTML = "";


  //Stops listening to real time updates
  if (unsubscribeTodos) {
    unsubscribeTodos();
    unsubscribeTodos = null;
  }

  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  if (unsubscribeMembers) {
    unsubscribeMembers();
    unsubscribeMembers = null;
  }

  if (unsubscribeNotifications) {
    unsubscribeNotifications();
    unsubscribeNotifications = null;
  }
}



// Converts Firebase timestamp into visable date/time
function formatTime(value) {
  if (!value) return "";
  try {
    if (value.toDate) {
      return value.toDate().toLocaleString();
    }
    return "";
  } catch {
    return "";
  }
}


// Opens the profile modal and loads the user's data
async function openProfileModal() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() : {};

  document.getElementById("profileName").value = data.name || "";
  document.getElementById("profileBio").value = data.bio || "";
  document.getElementById("profileEmail").textContent = user.email;

  document.getElementById("profileModal").classList.add("show");
}

// Saves updated name and bio back to Firestore
async function saveProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const newName = document.getElementById("profileName").value.trim();
  const newBio = document.getElementById("profileBio").value.trim();

  if (!newName) {
    alert("Name cannot be empty");
    return;
  }

  await setDoc(doc(db, "users", user.uid), {
    name: newName,
    bio: newBio,
    email: user.email
  }, { merge: true });

  currentUserName = newName;
  alert("Profile saved!");
  document.getElementById("profileModal").classList.remove("show");
}

// Closes the modal
function closeProfileModal() {
  document.getElementById("profileModal").classList.remove("show");
}

//creates notifications for all users except current user
async function createNotificationsForGroup(groupId, text) {
  try {
    const membersQuery = query(
      collection(db, "memberships"),
      where("groupId", "==", groupId)
    );
    const membersSnap = await getDocs(membersQuery);


  //gets logged in user
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    //gets group name from Firestore
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    let groupName = "Group";

    //gets group name and loops all the members
    if (groupSnap.exists()) {
      groupName = groupSnap.data().name || "Group";
    }
    for (const memberDoc of membersSnap.docs) {
      const memberData = memberDoc.data();


      //do not send notifications to yourself
      if (memberData.userId === currentUser.uid) continue;

      //notifcation documentation for users
      await addDoc(collection(db, "notifications"), {
        userIdToNotify: memberData.userId,
        groupId: groupId,
        groupName: groupName,
        text: text,
        read: false,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
  }
}


//logs notification for logged in users
function loadNotifications() {
  if (unsubscribeNotifications) unsubscribeNotifications();

  notificationList.innerHTML = "";

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  //notifications meant for user
  const q = query(
    collection(db, "notifications"),
    where("userIdToNotify", "==", currentUser.uid)
  );

//real time listener for when notifications update
  unsubscribeNotifications = onSnapshot(q, (snapshot) => {
    notificationList.innerHTML = "";

    const notifications = [];

    snapshot.forEach((docSnap) => {
      notifications.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

// Sort newest notification first
    notifications.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

// If no notifications exist, show message    
    if (notifications.length === 0) {
      notificationList.innerHTML = "<li>No notifications yet</li>";
      return;
    }

// Display every notification on the page
    notifications.forEach((notification) => {
      const li = document.createElement("li");

      const text = document.createElement("div");
      text.textContent = `${notification.groupName}: ${notification.text}`;

      const time = document.createElement("span");
      time.className = "notification-time";
      time.textContent = formatTime(notification.createdAt);

      li.appendChild(text);
      li.appendChild(time);
      notificationList.appendChild(li);
    });
  });
}


//Clears notifications
if (clearNotificationsBtn) {
clearNotificationsBtn.addEventListener("click", async () => {
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in first");
      return;
    }

//finds notifications belonging to user
    const q = query(
      collection(db, "notifications"),
      where("userIdToNotify", "==", currentUser.uid)
    );

    const snap = await getDocs(q);

//tells user if no notifications
    if (snap.empty) {
      alert("No notifications to clear");
      return;
    }

//deletes notifications
    for (const notificationDoc of snap.docs) {
      await deleteDoc(doc(db, "notifications", notificationDoc.id));
    }

    alert("Notifications cleared ");
  } catch (error) {
    console.error("CLEAR NOTIFICATIONS ERROR:", error);
    alert(error.message);
  }
});
}


//This sections contols user logs in/out, forgets password, verificaion
if (loginTab) {
  loginTab.addEventListener("click", switchToLogin);
}

if (signupTab) {
  signupTab.addEventListener("click", switchToSignup);
}

if (signupNow) {
  signupNow.addEventListener("click", switchToSignup);
}

if (forgotPassword) {
  forgotPassword.addEventListener("click", async () => {
    try {
      const userEmail = email.value.trim();

      if (!userEmail) {
        alert("Enter your email first");
        return;
      }

      await sendPasswordResetEmail(auth, userEmail);
      alert("Password reset email sent, Check your inbox/spam");
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      alert(error.message);
    }
  });
}

//signup button creats new account
signupBtn.addEventListener("click", async () => {
  try {
    if (!isSignup) {
      alert("Switch to signup tab first");
      return;
    }

//gets value from form
    const userName = nameInput.value.trim();
    const userEmail = email.value.trim();
    const userPassword = password.value.trim();

    //ensures all boxes are filled
    if (!userName || !userEmail || !userPassword) {
      alert("Fill all fields");
      return;
    }

    // Create account in Firebase Authentication
    const cred = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
  
    //saves users name and email in Firebase
    await setDoc(doc(db, "users", cred.user.uid), {
      name: userName,
      email: userEmail,
      createdAt: serverTimestamp()
    });

    //sends verification to email
    await sendEmailVerification(cred.user);

    // Sign user out until they verify email
    alert("Account created, Check your email");
    await signOut(auth);
  } catch (error) {
    alert(error.message);
  }
});

// Login button logs user in
loginBtn.addEventListener("click", async () => {
  try {
    if (isSignup) {
      alert("Switch to login tab first");
      return;
    }

    // Get email and password
    const userEmail = email.value.trim();
    const userPassword = password.value.trim();

    // ensures fields are filled
    if (!userEmail || !userPassword) {
      alert("Enter email and password");
      return;
    }

    //log in with Firebase
    const cred = await signInWithEmailAndPassword(auth, userEmail, userPassword);

    //no login if email isnt verified
    if (!cred.user.emailVerified) {
      alert("Please verify your email first");
      await signOut(auth);
      return;
    }
    alert("Logged in successfully");
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert(error.message);
  }
});


// Resend verification email button
resendBtn.addEventListener("click", async () => {
  try {
    const userEmail = email.value.trim();
    const userPassword = password.value.trim();

    //signin system
    if (!userEmail || !userPassword) {
      alert("Enter your email and password first");
      return;
    }

    const cred = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    await sendEmailVerification(cred.user);
    alert("Verification email sent again");
    await signOut(auth);

  } catch (error) {
    console.error("RESEND ERROR:", error);
    alert(error.message);
  }
});

//logout button to sign out
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Dashboard page layout
    document.body.style.display = "block";
    document.body.style.background = "#f5f7ff";

    // Hide login box and show dashboard
    authBox.style.display = "none";
    dashBox.style.display = "block";

    //users name from Firestore, loads groups and nofifications
    currentUserName = await getCurrentUserName();
    await loadGroups();
    loadNotifications();
  } else {

  // User is logged out, login page layout
    document.body.style.display = "flex";
    document.body.style.justifyContent = "center";
    document.body.style.alignItems = "center";
    document.body.style.background = "linear-gradient(135deg, #4f8cff, #6dd5ff)";
    authBox.style.display = "block";
    dashBox.style.display = "none";

    //clears everything
    currentUserName = "";
    clearGroupUI();
  }
});




//Group Section
//Create, join, load, open groups, show members and manage tasks
//creates group
createGroupBtn.addEventListener("click", async () => {
  try {
    const user = auth.currentUser;
    const groupName = groupNameInput.value.trim();

    if (!user) {
      alert("Please login first");
      return;
    }

    //stops ig group name inbox is empty
    if (!groupName) {
      alert("Enter a group name");
      return;
    }

    //creates 6 character random code
    const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    //saves group in group collection
    const created = await addDoc(collection(db, "groups"), {
      name: groupName,
      code: groupCode,
      ownerId: user.uid,
      ownerName: currentUserName || user.email,
      createdAt: serverTimestamp()
    });

    //adds creator to the group
    await addDoc(collection(db, "memberships"), {
      userId: user.uid,
      userName: currentUserName || user.email,
      userEmail: user.email,
      groupId: created.id,
      groupName: groupName,
      groupCode: groupCode,
      joinedAt: serverTimestamp()
    });

    //clears input box for group name and shows code to user
    groupNameInput.value = "";
    groupMsg.textContent = `Group created  Code: ${groupCode}`;
    alert(`Group created \nGroup code: ${groupCode}`);

    //refresh group list
    await loadGroups();
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    alert(error.message);
  }
});

//join group button and functions
joinGroupBtn.addEventListener("click", async () => {
  try {
    const user = auth.currentUser;
    const code = groupCodeInput.value.trim().toUpperCase();

    if (!user) {
      alert("Please login first");
      return;
    }

    if (!code) {
      alert("Enter a group code");
      return;
    }

    //search firestore for group with this code entered above
    const groupQuery = query(collection(db, "groups"), where("code", "==", code));
    const groupSnap = await getDocs(groupQuery);

    //stops if no group exists
    if (groupSnap.empty) {
      alert("No group found");
      return;
    }

    //gets the matching group and checks if user is already in it
    const groupDoc = groupSnap.docs[0];
    const groupData = groupDoc.data();
    const membershipQuery = query(
      collection(db, "memberships"),
      where("userId", "==", user.uid),
      where("groupId", "==", groupDoc.id)
    );

    const membershipSnap = await getDocs(membershipQuery);

    if (!membershipSnap.empty) {
      alert("You are already in this group");
      return;
    }

    //adds user to the list
    await addDoc(collection(db, "memberships"), {
      userId: user.uid,
      userName: currentUserName || user.email,
      userEmail: user.email,
      groupId: groupDoc.id,
      groupName: groupData.name,
      groupCode: groupData.code,
      joinedAt: serverTimestamp()
    });

    //alerts other memebers someone joined
await createNotificationsForGroup(
  groupDoc.id,
  `${currentUserName || user.email} joined the group`
);

//clears input and shows success message
groupCodeInput.value = "";
groupMsg.textContent = `Joined group  ${groupData.name} (${groupData.code})`;

//refresh group list
await loadGroups();
  } catch (error) {
    console.error("JOIN GROUP ERROR:", error);
    alert(error.message);
  }
});

//Load groups function, shows all groups user is in
async function loadGroups() {
  groupList.innerHTML = "";

  try {
    const q = query(
      collection(db, "memberships"),
      where("userId", "==", auth.currentUser.uid)
    );

    const snap = await getDocs(q);

    //empty message if user has no groups
    if (snap.empty) {
      groupList.innerHTML = "<li>No groups yet, Create on to get started</li>";
      return;
    }

    snap.forEach((docSnap) => {
      const data = docSnap.data();

      //creates list item
      const li = document.createElement("li");
      li.style.marginBottom = "10px";

      //shows group name, code and joined date
      const info = document.createElement("span");
      info.textContent = `${data.groupName} (Code: ${data.groupCode}) - Joined: ${formatTime(data.joinedAt)} `;

      //creat open button
      const openBtn = document.createElement("button");
      openBtn.textContent = "Open";
      openBtn.onclick = () => openGroup(data.groupId, data.groupName);

      li.appendChild(info);
      li.appendChild(openBtn);
      groupList.appendChild(li);
    });
  } catch (error) {
    console.error("LOAD GROUPS ERROR:", error);
    alert(error.message);
  }
}

//Open Group section
function openGroup(groupId, groupName) {
  currentGroupId = groupId;
  currentGroupName = groupName;

  //shows chat box, shows title
  chatBox.style.display = "block";
  chatTitle.textContent = groupName;
  if (chatHint) chatHint.style.display = "none";

  //loads group information
  loadMembers(groupId);
  loadTodos(groupId);
  loadMessages(groupId);
  populateAssigneeDropdown(groupId);
}

// Calender Section
let calendarInstance = null;

async function loadCalendar() {
  const user = auth.currentUser;
  if (!user) return;

  // Get all groups the user is in
  const membershipQuery = query(
    collection(db, "memberships"),
    where("userId", "==", user.uid)
  );
  const membershipSnap = await getDocs(membershipQuery);

  // Collect all group IDs
  const groupIds = [];
  const groupNames = {};
  membershipSnap.forEach((docSnap) => {
    const data = docSnap.data();
    groupIds.push(data.groupId);
    groupNames[data.groupId] = data.groupName;
  });

  if (groupIds.length === 0) {
    document.getElementById("calendarEl").innerHTML =
      "<p style='color:#6b7280;text-align:center;padding:40px'>Join a group to see tasks on the calendar</p>";
    return;
  }

  // Fetch todos that have a deadline for each group
  const allEvents = [];
  for (const groupId of groupIds) {
    const todoQuery = query(
      collection(db, "todos"),
      where("groupId", "==", groupId)
    );
    const todoSnap = await getDocs(todoQuery);

    todoSnap.forEach((docSnap) => {
      const todo = docSnap.data();

      // Only show tasks that have a deadline
      if (!todo.deadline) return;

      // Pick a colour: green if done, red if overdue, teal otherwise
      const today = new Date().toISOString().split("T")[0];
      let color = "#109498";
      if (todo.completed) {
        color = "#6b7280";
      } else if (todo.deadline < today) {
        color = "#dc2626";
      } else if (todo.deadline === today) {
        color = "#d97706";
      }

      allEvents.push({
        title: todo.assignedTo
          ? `${todo.text} (${todo.assignedTo})`
          : todo.text,
        date: todo.deadline,
        backgroundColor: color,
        borderColor: color,
        classNames: todo.completed ? ["completed-task"] : [],
        extendedProps: {
          groupName: groupNames[groupId] || "Group",
          assignedTo: todo.assignedTo || "Unassigned",
          completed: todo.completed,
          deadline: todo.deadline
        }
      });
    });
  }

  // Destroy old calendar if it exists before making a new one
  if (calendarInstance) {
    calendarInstance.destroy();
    calendarInstance = null;
  }

  const calendarEl = document.getElementById("calendarEl");

  calendarInstance = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,listMonth"
    },
    events: allEvents,
    height: "auto",

    // When user clicks a task on the calendar, show a popup
    eventClick: function (info) {
      const props = info.event.extendedProps;
      alert(
        `📋 Task: ${info.event.title}\n` +
        `📁 Group: ${props.groupName}\n` +
        `👤 Assigned to: ${props.assignedTo}\n` +
        `📅 Deadline: ${props.deadline}\n` +
        `✅ Completed: ${props.completed ? "Yes" : "No"}`
      );
    }
  });

  calendarInstance.render();
}

// Fills the assignee dropdown with users
async function populateAssigneeDropdown(groupId) {
  const select = document.getElementById("todoAssignee");
  select.innerHTML = `<option value="">Assign to...</option>`;

  const q = query(
    collection(db, "memberships"),
    where("groupId", "==", groupId)
  );

  const snap = await getDocs(q);

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const option = document.createElement("option");
    option.value = data.userName || data.userEmail;
    option.textContent = data.userName || data.userEmail;
    select.appendChild(option);
  });
}

//Members Section
//loads all memebers in group
function loadMembers(groupId) {
  memberList.innerHTML = "";
  if (unsubscribeMembers) unsubscribeMembers();
  const q = query(
    collection(db, "memberships"),
    where("groupId", "==", groupId)
  );

  //real time listener for memebers
  unsubscribeMembers = onSnapshot(q, (snapshot) => {
    memberList.innerHTML = "";
    const members = [];

    //puts members into array
    snapshot.forEach((docSnap) => {
      members.push(docSnap.data());
    });

    //sorts members alphabetically
    members.sort((a, b) => {
      const nameA = (a.userName || "").toLowerCase();
      const nameB = (b.userName || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

    //message if no members are found
    if (members.length === 0) {
      memberList.innerHTML = "<li>No members found</li>";
      return;
    }

    //shows memebers
    members.forEach((member) => {
      const li = document.createElement("li");
      li.textContent = member.userName || member.userEmail || "Unknown user";
      memberList.appendChild(li);
    });
  });
}

//To do list section
function loadTodos(groupId) {
  todoList.innerHTML = "";

  //stops old task listner
  if (unsubscribeTodos) unsubscribeTodos();

  //finds task in the group
  const q = query(
    collection(db, "todos"),
    where("groupId", "==", groupId)
  );

  //real time listener for tasks
  unsubscribeTodos = onSnapshot(q, (snapshot) => {
    todoList.innerHTML = "";

    const todos = [];

    //puts all tasks into array
    snapshot.forEach((docSnap) => {
      todos.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    //sorts all the tasks by creation time
    todos.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });

    //message when no tasks
    if (todos.length === 0) {
      todoList.innerHTML = "<li>No tasks yet</li>";
      return;
    }

//displays tasks    
todos.forEach((todo) => {
  const li = document.createElement("li");
  li.style.marginBottom = "8px";

  const textSpan = document.createElement("span");
  let displayText = todo.text;

//adds deadlines
if (todo.deadline) {
  displayText += ` (Due: ${todo.deadline})`;
}

//show tick if tasks completed
textSpan.textContent = todo.completed ? `✅ ${displayText}` : displayText;

// Show assignee badge if task has one
if (todo.assignedTo) {
  const badge = document.createElement("span");
  badge.className = "task-assignee-badge";
  badge.textContent = `👤 ${todo.assignedTo}`;
  textSpan.appendChild(badge);
}

//gets todays date
const today = new Date().toISOString().split("T")[0];

//depending on deadline, changes colour
if (todo.deadline) {
  if (todo.deadline < today) {
    textSpan.style.color = "red";
    textSpan.style.fontWeight = "bold";
  } else if (todo.deadline === today) {
    textSpan.style.color = "orange";
    textSpan.style.fontWeight = "bold";
  }
}

//creates done/undone button
  const doneBtn = document.createElement("button");
  doneBtn.textContent = todo.completed ? "Undo" : "Done";
  doneBtn.style.marginLeft = "10px";

  doneBtn.onclick = async () => {
    try {
      await setDoc(doc(db, "todos", todo.id), {
        groupId: todo.groupId,
        text: todo.text,
        deadline: todo.deadline || "",
        completed: !todo.completed,
        createdAt: todo.createdAt || serverTimestamp()
      });
      
    } catch (error) {
      console.error("TODO TOGGLE ERROR:", error);
      alert(error.message);
    }
  };

  //creates delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.style.marginLeft = "10px";

  //deletes task when clicked
  deleteBtn.onclick = async () => {
    try {
      await deleteDoc(doc(db, "todos", todo.id));
    } catch (error) {
      console.error("TODO DELETE ERROR:", error);
      alert(error.message);
    }
  };

  //adds text and buttons to the list item
  li.appendChild(textSpan);
  li.appendChild(doneBtn);
  li.appendChild(deleteBtn);
  todoList.appendChild(li);
});
  });
}

//makes sure group is selected
addTodoBtn.addEventListener("click", async () => {
  try {
    if (!currentGroupId) {
      alert("Click a group first");
      return;
    }

    // gets task text, deadline and assign
    const text = todoInput.value.trim();
    const deadline = todoDeadline.value;
    const assignedTo = document.getElementById("todoAssignee").value;
    //if task box is empty, stops
    if (!text) {
      alert("Type a task first");
      return;
    }
    //adds task into FIrebase to do collection
    await addDoc(collection(db, "todos"), {
      groupId: currentGroupId,
      text: text,
      deadline: deadline,
      assignedTo: assignedTo,
      completed: false,
      createdAt: serverTimestamp()
    });
    //notification for everyone in group
    await createNotificationsForGroup(
      currentGroupId,
      `${currentUserName || auth.currentUser.email} added a new task`
    );

    //Notify assigned person specifically
    if (assignedTo) {
      await createNotificationsForGroup(
        currentGroupId,
        `You were assigned a task: "${text}"`
      );
    }
    //resets all input fields
    todoInput.value = "";
    todoDeadline.value = "";
    document.getElementById("todoAssignee").value = "";
  } catch (error) {
    console.error("ADD TODO ERROR:", error);
    alert(error.message);
  }
});


//Message Section
function loadMessages(groupId) {
  messagesDiv.innerHTML = "";
  //clears and stops liseting to old group messages
  if (unsubscribeMessages) unsubscribeMessages();
  //builds query to load messages only from this group
  const q = query(
    collection(db, "messages"),
    where("groupId", "==", groupId)
  );
  // real time linster runs everytime a message is added or changed
  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";

    const messages = [];
    snapshot.forEach((docSnap) => {
      messages.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    //sort messages with time
    messages.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });
    //placeholder for no messages
    if (messages.length === 0) {
      messagesDiv.innerHTML = "<p>No messages yet</p>";
      return;
    }
//displays messages in chat UI
messages.forEach((message) => {
  const isMe = auth.currentUser && message.senderId === auth.currentUser.uid;
  const row = document.createElement("div");
  row.className = isMe ? "message-row me" : "message-row other";
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  const sender = document.createElement("div");
  sender.className = "message-sender";
  sender.textContent = isMe ? "You" : (message.senderName || "User");
  const body = document.createElement("div");
  //file or texts
  if (message.type === "file") {
    const link = document.createElement("a");
    link.href = message.fileUrl;
    link.target = "_blank";
    link.textContent = `📎 ${message.fileName || "Open file"}`;
    body.appendChild(link);
  } else {
    body.textContent = message.text || "";
  }
  //message time and bubble builds
  const time = document.createElement("div");
  time.className = "message-time";
  time.textContent = formatTime(message.createdAt);
  bubble.appendChild(sender);
  bubble.appendChild(body);
  bubble.appendChild(time);
  row.appendChild(bubble);
  messagesDiv.appendChild(row);
});
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
//user must pick group
sendMsgBtn.addEventListener("click", async () => {
  try {
    if (!currentGroupId) {
      alert("Click a group first");
      return;
    }
    //get the message text
    const text = messageInput.value.trim();
    if (!text) {
      alert("Type a message first");
      return;
    }

    const user = auth.currentUser;
    //saves message in Firestore
    await addDoc(collection(db, "messages"), {
      groupId: currentGroupId,
      text: text,
      type: "text",
      senderId: user.uid,
      senderName: currentUserName || user.email,
      createdAt: serverTimestamp()
    });
    //members are notified
    await createNotificationsForGroup(
      currentGroupId,
      `${currentUserName || user.email} sent a new message`
    );
    //clears input
    messageInput.value = "";
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    alert(error.message);
  }
});


// File Section
shareFileBtn.addEventListener("click", async () => {
  try {
    if (!currentGroupId) {
      alert("Click a group first");
      return;
    }
    //creates file picker
    const picker = document.createElement("input");
    picker.type = "file";

    picker.onchange = async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        //creates unique file path in Firebase Storage
        //uploads and gets downloadable link
        const user = auth.currentUser;
        const filePath = `groupFiles/${currentGroupId}/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, filePath);

        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        //saves file in Firestore
        await addDoc(collection(db, "messages"), {
          groupId: currentGroupId,
          type: "file",
          fileName: file.name,
          fileUrl: downloadURL,
          senderId: user.uid,
          senderName: currentUserName || user.email,
          createdAt: serverTimestamp()
        });
//nofifys members
await createNotificationsForGroup(
  currentGroupId,
  `${currentUserName || user.email} shared a file`
);

alert("File shared successfully");
      } catch (error) {
        console.error("UPLOAD ERROR:", error);
        alert(error.message);
      }
    };

    picker.click();
  } catch (error) {
    console.error("SHARE FILE ERROR:", error);
    alert(error.message);
  }
});

//Leave group section
leaveGroupBtn.addEventListener("click", async () => {
  try {
    if (!currentGroupId) {
      alert("Open a group first");
      return;
    }
    //finds members record
    const user = auth.currentUser;

    const q = query(
      collection(db, "memberships"),
      where("groupId", "==", currentGroupId),
      where("userId", "==", user.uid)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("You are not a member of this group");
      return;
    }
    //deletes membership records
    for (const membershipDoc of snap.docs) {
      await deleteDoc(doc(db, "memberships", membershipDoc.id));
    }

    alert("You left the group");
    clearGroupUI();
    await loadGroups();
  } catch (error) {
    console.error("LEAVE GROUP ERROR:", error);
    alert(error.message);
  }
});

//Delete Group section
deleteGroupBtn.addEventListener("click", async () => {
  try {
    if (!currentGroupId) {
      alert("Open a group first");
      return;
    }

    const groupRef = doc(db, "groups", currentGroupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      alert("Group not found");
      return;
    }

    const groupData = groupSnap.data();
    //only owner can delete
    if (groupData.ownerId !== auth.currentUser.uid) {
      alert("Only the group owner can delete this group");
      return;
    }
    //confirmation box
    const confirmDelete = confirm(
      "Are you sure? This will delete the group document. (Messages/todos left behind in Firestore would need manual cleanup or Cloud Functions later.)"
    );
    
    if (!confirmDelete) return;
    //deletes membership
    const membershipQ = query(
      collection(db, "memberships"),
      where("groupId", "==", currentGroupId)
    );
    const membershipSnap = await getDocs(membershipQ);

    for (const membershipDoc of membershipSnap.docs) {
      await deleteDoc(doc(db, "memberships", membershipDoc.id));
    }
    //deletes group
    await deleteDoc(groupRef);

    alert("Group deleted");
    clearGroupUI();
    await loadGroups();
  } catch (error) {
    console.error("DELETE GROUP ERROR:", error);
    alert(error.message);
  }
});

// Switching page section
switchToLogin();

//buttons for navigation
const homePageBtn = document.getElementById("homePageBtn");
const groupsPageBtn = document.getElementById("groupsPageBtn");

const homePage = document.getElementById("homePage");
const groupsPage = document.getElementById("groupsPage");
const calendarPage = document.getElementById("calendarPage");
//hides all pages before showing selected
function hideAllPages() {
  homePage.style.display = "none";
  groupsPage.style.display = "none";
  calendarPage.style.display = "none";
  homePageBtn.classList.remove("active");
  groupsPageBtn.classList.remove("active");
  calendarPageBtn.classList.remove("active");
}
//navigation logic
if (homePageBtn) {
  homePageBtn.addEventListener("click", () => {
    hideAllPages();
    homePage.style.display = "block";
    homePageBtn.classList.add("active");
  });
}

if (groupsPageBtn) {
  groupsPageBtn.addEventListener("click", () => {
    hideAllPages();
    groupsPage.style.display = "block";
    groupsPageBtn.classList.add("active");
  });
}

if (calendarPageBtn) {
  calendarPageBtn.addEventListener("click", () => {
    hideAllPages();
    calendarPage.style.display = "block";
    calendarPageBtn.classList.add("active");
    loadCalendar();
  });
}



//Notification bell
const bellBtn = document.getElementById("bellBtn");
const notificationDropdown = document.getElementById("notificationDropdown");
//shows and hides dropdown
if (bellBtn && notificationDropdown) {
  bellBtn.addEventListener("click", () => {
    notificationDropdown.classList.toggle("show");
  });
}
//profile popup
document.getElementById("profileBtn").addEventListener("click", openProfileModal);
document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);
document.getElementById("closeProfileBtn").addEventListener("click", closeProfileModal);