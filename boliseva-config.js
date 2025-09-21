/*window.botpress.init({
  "botId": "41dd7105-169d-4c1c-8d0f-1b3685862d7e",
  "clientId": "4b592635-99d6-41d8-9c23-199205981c03",
  "userId": "user-" + Math.random().toString(36).substr(2, 9), // unique per user
  "configuration": {
    "botName": "BoliBot",
    "botAvatar": "https://files.bpcontent.cloud/2025/09/10/05/20250910055607-BSGP3G91.png",
    "composerPlaceholder": "Hello i am BoliBot, how may i assist you today",
    "color": "#1E40AF"
  }
});*/
// This code gets the user ID from the logged-in user in your app.
const currentUser = JSON.parse(localStorage.getItem('boliseva_user'));
const userId = currentUser ? currentUser.id : "guest-" + Math.random().toString(36).substr(2, 9);

window.botpress.init({
  "botId": "41dd7105-169d-4c1c-8d0f-1b3685862d7e",
  "clientId": "4b592635-99d6-41d8-9c23-199205981c03",
  "userId": userId, // This is the line that now sends the real user ID.
  "configuration": {
    "botName": "BoliBot",
    "botAvatar": "https://files.bpcontent.cloud/2025/09/10/05/20250910055607-BSGP3G91.png",
    "composerPlaceholder": "Hello i am BoliBot, how may i assist you today",
    "color": "#1E40AF"
  }
});