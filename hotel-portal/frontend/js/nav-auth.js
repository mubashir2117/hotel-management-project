function renderNavbarAuth(){
  const token = localStorage.getItem('hotelToken') || localStorage.getItem('token');
  const userName = localStorage.getItem('hotelName') || 'Guest';
  const authContainer = document.getElementById('navAuthContext');

  if(token){
    const firstLetter = userName.charAt(0).toUpperCase();
    authContainer.innerHTML = `
      <div class="user-actions">
        <div class="user-icon" onclick="toggleDropdown()">${firstLetter}</div>
        <div class="user-dropdown" id="userDropdownMenu">
          <span class="dd-name">Hi, ${userName}</span>
          <ul>
            <li><a href="my-bookings.html"><i class="fa-solid fa-calendar-check"></i> My Reservations</a></li>
            <li><button class="dd-signout" onclick="handleNavbarSignOut()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button></li>
          </ul>
        </div>
      </div>
    `;
  } else {
    authContainer.innerHTML = `<a href="/login.html" class="btn-login" onclick="redirectToLogin(event)">Sign In</a>`;
  }
}

function toggleDropdown(){
  const d = document.getElementById('userDropdownMenu');
  if(d) d.classList.toggle('show');
}
function handleNavbarSignOut(){
  localStorage.clear();
  window.location.href='/login.html';
}
function redirectToLogin(e){
  if(e) e.preventDefault();
  window.location.href='/login.html';
}
