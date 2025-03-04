document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const loginData = { username, password };

  // Log the data to the console
  console.log("Login data:", loginData);

  try {
      const response = await fetch('login.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
      });
      const data = await response.json();
      console.log("Response from login.php:", data);

      if (data.success) {
          // Use the redirect URL from the server response
          window.location.href = data.redirect;
      } else {
          alert(data.error || 'Invalid credentials.');
      }
  } catch (error) {
      console.error('Error during login:', error);
      alert('There was an error processing your login.');
  }
});
