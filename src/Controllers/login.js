import { finduserbymail } from "../Models/database.js";

const submitbtn = document.querySelector('#submitbtn');
const pass = document.querySelector('#password');
const email = document.querySelector('#mail');

submitbtn.addEventListener('click', handleSubmit);

function handleSubmit() {
  let mail = email.value;
  let password = pass.value;

  if (mail === '' || password === '') {
    alert("Bad Credentials");
    return;
  }

  submitbtn.textContent = 'Loading...'; 

  setTimeout(() => {
    const user = finduserbymail(mail, password);
    if (user) {
      sessionStorage.setItem("CurrentUser", JSON.stringify(user));
      document.location = "dashboard.html";
    } else {
      alert("Bad Credentials");
      submitbtn.textContent = 'Se connecter'; 
    }
  }, 2000);
}