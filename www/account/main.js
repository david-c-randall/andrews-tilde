const formUsername = document.getElementById("form-change-username");
const inputUsername = document.getElementById("change-username");
const btnUsernameChange = document.getElementById("btn-username-change");
const btnLogout = document.getElementById("btn-logout");
const currentUsername = document.getElementById("current-username");
const imgAvatar = document.getElementById("img-avatar");

import { supabase } from "../supabase.js"

// Automatically sends to homepage if user not logged in
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  console.log("user not logged in. Redirecting...");
  window.location.href = "../";
} else {
  console.log("logged in")
}
updateUsername();

// Logs out user on button click
btnLogout.addEventListener("click", async () => {
  const { error }  = await supabase.auth.signOut();
  
  if (error) {
    console.error("Logout failed: ", error)
    alert(`Logout failed: ${error}`)
  } else {
    console.log("Logging Out...")
    window.location.href = "../index.html";
  } 
});

// Checks if username is available and, if so, updates the username in the database
formUsername.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (inputUsername) {
    const { data, error } = await supabase.from("profiles").update({ username: inputUsername.value }).eq('id', user.id);
    if (error) {
      console.error("Update failed: ", error);
    } else {
      inputUsername.value = ""
    }
  }
  updateUsername();
});

// Displays username on the page
async function updateUsername() {
  const { data, error } = await supabase.from("profiles").select("username").eq("id", user.id);
  if (error) {
    console.error("Update failed: ", error);
  } else {
    console.log(data)
    currentUsername.innerText = data[0].username;
    imgAvatar.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${data[0].username}`
  }
}