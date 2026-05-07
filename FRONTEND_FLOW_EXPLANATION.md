# SmartSure Frontend — Complete Flow Explanation
# (For Evaluation Preparation)

---

## WHAT IS THE FRONTEND?

The frontend is built using React + Vite.
- React = JavaScript library for building UI (what the user sees)
- Vite = fast build tool (like a compiler that runs the app)
- Lives in the folder: user-management-ui/

Tech used:
- React (UI)
- React Router DOM (navigation between pages)
- Axios (HTTP calls to backend)
- React Hot Toast (popup notifications like "Login successful!")
- Recharts (graphs/charts on dashboard)
- Lucide React (icons like shield, bell, user)
- Razorpay (payment gateway)

---

## FOLDER STRUCTURE

```
src/
├── main.jsx          ← Entry point. App starts here.
├── App.jsx           ← Defines all routes (pages/URLs)
├── index.css         ← All CSS styling
├── context/          ← Global state (AuthContext, ThemeContext)
├── layouts/          ← Page wrappers (LandingLayout, DashboardLayout)
├── pages/            ← Actual pages (Login, Dashboard, Policies, etc.)
├── components/       ← Reusable pieces (Navbar, Sidebar, Modals)
└── services/         ← API calls to backend (api.js, razorpay.js)
```

---

## STEP 1 — HOW THE APP STARTS

### index.html
- The ONLY HTML file. Browser loads this first.
- Has <div id="root"> — React injects the entire app here.
- Loads main.jsx as a module.
- Loads Razorpay checkout script from internet (for payments).
- Loads Inter font from Google Fonts.

### main.jsx — Entry Point
```
ReactDOM.createRoot(document.getElementById('root')).render(...)
```
This finds the <div id="root"> in index.html and renders the React app inside it.

The wrapping order:
```
BrowserRouter          ← Enables URL-based navigation
  ThemeProvider        ← Provides dark/light theme to ALL pages
    AuthProvider       ← Provides login state to ALL pages
      App              ← The actual app with all routes/pages
```

WHY wrap this way?
Because any component inside can access auth info and theme using useContext.
This is called the Context API pattern.

---

## STEP 2 — AUTH CONTEXT (AuthContext.jsx)

The most important file. Manages WHO IS LOGGED IN.

What it stores:
- user      → { username: "john", role: "ADMIN" or "USER" } or null
- token     → JWT access token (sent with every API request)
- refreshToken → used to get new token when old one expires
- loading   → true while checking localStorage on first load

ON APP START (useEffect runs once):
1. Checks localStorage for saved token (key: "smartsure_token")
2. If found, decodes it using jwtDecode to read username, role, expiry
3. If token is NOT expired → sets user as logged in
4. If expired → clears localStorage, user must log in again

login(token, refreshToken) FUNCTION:
- Decodes the JWT to get username and role
- Saves both tokens to localStorage
- Sets user state → app now knows someone is logged in

logout() FUNCTION:
- Clears user, token, refreshToken from state
- Removes from localStorage
- User is now treated as a guest

isAuthenticated = true ONLY if both token AND user exist
isAdmin = true ONLY if user.role === 'ADMIN'

These two booleans are used EVERYWHERE to show/hide pages and UI elements.

---

## STEP 3 — THEME CONTEXT (ThemeContext.jsx)

Manages dark mode / light mode.

- On load, checks localStorage for saved theme preference
- If none saved, checks system preference (prefers-color-scheme)
- Sets data-theme="dark" or data-theme="light" on the <html> element
- CSS variables in index.css change based on this attribute
- toggleTheme() switches between dark and light and saves to localStorage

---

## STEP 4 — ROUTING (App.jsx)

Defines which component shows at which URL.

### Group 1 — Public Landing Routes (visible only if NOT logged in)
```
/        → HomePage
/about   → AboutPage
/contact → ContactPage
```
If user IS logged in and visits "/" → redirected to "/dashboard" automatically.

### Group 2 — Auth Routes (visible only if NOT logged in)
```
/login           → LoginPage
/register        → RegisterPage
/forgot-password → ForgotPasswordPage
```

### Group 3 — Protected Routes (visible only if LOGGED IN)
```
/dashboard       → DashboardPage
/policies        → PoliciesPage
/policies/:id    → PolicyDetailPage   (:id = dynamic policy ID)
/payment-success → PaymentSuccessPage
/claims          → ClaimsPage
/claims/:id      → ClaimDetailPage
/profile         → ProfilePage
/users           → UsersPage    ← ADMIN ONLY
/reports         → ReportsPage  ← ADMIN ONLY
```

### Fallback (*)
If no URL matches → redirect to "/dashboard" if logged in, else "/"

### <Toaster />
Also placed in App.jsx. Shows popup notifications anywhere in the app.
Called using: toast.success('Login successful!') or toast.error('Error!')

---

## STEP 5 — PROTECTED ROUTE (ProtectedRoute.jsx)

A GUARD that blocks access to pages unless conditions are met.

Props:
- children   = the page to show if allowed
- adminOnly  = false by default. Set to true for admin-only pages.

Logic (in order):
1. If still loading (checking localStorage) → show a spinner
2. If NOT authenticated → redirect to "/login" (saves current URL so user returns after login)
3. If adminOnly=true AND user is NOT admin → redirect to "/dashboard"
4. All checks pass → show the actual page (return children)

Used in App.jsx like:
<ProtectedRoute>              ← just checks login
  <DashboardLayout />
</ProtectedRoute>

<ProtectedRoute adminOnly>    ← checks login + admin role
  <UsersPage />
</ProtectedRoute>

---

## STEP 6 — LAYOUTS

Layouts are WRAPPERS that provide consistent structure around pages.

### LandingLayout.jsx — For public pages
- Fixed top navigation bar (Logo, Home/About/Contact links, Sign In, Get Started)
- Scroll detection: navbar background becomes solid when you scroll down 20px
- Mobile hamburger menu (shows/hides on small screens)
- <Outlet /> = where child page content appears (React Router concept)

### DashboardLayout.jsx — For logged-in pages
Structure:
```
┌────────────┬──────────────────────────────┐
│            │  NAVBAR (top bar)             │
│  SIDEBAR   ├──────────────────────────────┤
│  (left)    │  <Outlet />                  │
│            │  (page content here)         │
└────────────┴──────────────────────────────┘
```
- Manages sidebarOpen state (open/close on mobile)
- On mobile: sidebar slides in with hamburger button click
- On desktop: sidebar is always visible
- Shows dark overlay on mobile when sidebar is open (click overlay to close)

---

## STEP 7 — SIDEBAR (Sidebar.jsx)

Shows navigation menu based on user role.

Menu items shown to EVERYONE:
- Dashboard (/dashboard)
- Policies (/policies)
- Claims (/claims)
- Profile (/profile)

Menu items shown ONLY TO ADMIN (checked using isAdmin):
- Users (/users)
- Reports (/reports)

Uses NavLink (not Link):
- NavLink automatically adds "active" CSS class to currently selected link
- This highlights the current page in the sidebar

Bottom of sidebar:
- Shows logged-in user's name and role
- Logout button → calls logout() from AuthContext → navigates to /login

---

## STEP 8 — NAVBAR (Navbar.jsx)

The top bar inside the dashboard. Contains:

1. HAMBURGER BUTTON
   - Only visible on mobile (screen width <= 1024px)
   - Calls onMenuClick prop to open/close sidebar

2. SEARCH BAR
   - UI only (cosmetic, no backend search)

3. THEME TOGGLE
   - Sun icon (dark mode) or Moon icon (light mode)
   - Calls toggleTheme() from ThemeContext

4. NOTIFICATION BELL
   - Fetches notifications on mount: authService.getNotifications(username)
   - Re-fetches every 30 seconds using setInterval
   - Shows red badge with unread count number
   - Clicking opens a dropdown panel
   - Clicking outside the panel closes it (uses useRef + document.addEventListener)
   - Can mark individual notification as read (click on it)
   - "Mark all read" button calls API for each unread notification simultaneously

5. USER AVATAR
   - Shows first letter of username (e.g., "J" for "john")
   - Clicking it navigates to /profile page

---

## STEP 9 — API SERVICE (api.js)

Central communication layer between frontend and backend.

### Axios Instance:
```js
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
});
```
All requests go to /api/v1/... which Nginx routes to the API Gateway.

### Request Interceptor (runs BEFORE every API call):
```js
const token = localStorage.getItem('smartsure_token');
if (token) config.headers.Authorization = `Bearer ${token}`;
```
Automatically adds JWT token to every request header.
You NEVER manually add the token in each page — it's automatic.

### Response Interceptor (runs AFTER every API response):
If backend returns 401 (Unauthorized / token expired):
- Removes token from localStorage
- Redirects to /login
This handles session expiry AUTOMATICALLY.

### 4 Service Objects:

authService → /auth/...
- login(data)              → POST /auth/login
- register(data)           → POST /auth/register
- sendOtp(data)            → POST /auth/send-otp
- forgotPassword(data)     → POST /auth/forgot-password
- resetPassword(data)      → POST /auth/reset-password
- getUser(username)        → GET  /auth/user/:username
- updateProfile(u, data)   → PUT  /auth/update-profile
- changePassword(u, data)  → PUT  /auth/change-password
- logout(username)         → POST /auth/logout
- getAllUsers()             → GET  /auth/all-users
- deleteUser(id)           → DELETE /auth/delete/:id
- blockUser(id)            → PUT  /auth/users/:id/block
- activateUser(id)         → PUT  /auth/users/:id/activate
- getNotifications(u)      → GET  /auth/notifications
- markNotificationRead(id) → PUT  /auth/notifications/:id/read

policyService → /policies/...
- getAll()                 → GET  /policies
- getById(id)              → GET  /policies/:id
- getActive()              → GET  /policies/active
- getByType(type)          → GET  /policies/type/:type
- search(query)            → GET  /policies/search?query=...
- getUserPolicies(username)→ GET  /policies/user
- create(data)             → POST /policies
- update(id, data)         → PUT  /policies/:id
- delete(id)               → DELETE /policies/:id
- purchase(id, username)   → POST /policies/:id/purchase
- cancel(id, username)     → POST /policies/:id/cancel
- payPremium(id, username) → POST /policies/:id/pay-premium
- getPaymentStatus(id, u)  → GET  /policies/:id/payment-status

claimsService → /claims/...
- getAll()                 → GET  /claims
- getUserClaims(username)  → GET  /claims/user
- getById(id)              → GET  /claims/:id
- getByStatus(status)      → GET  /claims/status/:status
- initiate(data, username) → POST /claims/initiate-claim
- submit(id, username)     → PUT  /claims/:id/submit
- cancel(id, username)     → PUT  /claims/:id/cancel
- addDocument(id, file, u) → POST /claims/:id/add-document (multipart)
- deleteDocument(cId,dId,u)→ DELETE /claims/:id/documents/:docId
- downloadDocument(cId,dId)→ GET  /claims/:id/documents/:docId/download

adminService → /admin/...
- getAllClaims()            → GET  /admin/claims
- getPendingClaims()       → GET  /admin/claims/pending
- getClaimById(id)         → GET  /admin/claims/:id
- reviewClaim(id, data)    → POST /admin/claims/:id/review
- startReview(id)          → PUT  /admin/claims/:id/start-review
- approveClaim(id)         → POST /admin/claims/:id/approve
- rejectClaim(id)          → POST /admin/claims/:id/reject
- getAllUsers()             → GET  /admin/users
- blockUser(id)            → PUT  /admin/users/:id/block
- activateUser(id)         → PUT  /admin/users/:id/activate
- getGeneralReport()       → GET  /admin/reports
- getClaimsReport()        → GET  /admin/reports/claims
- getPoliciesReport()      → GET  /admin/reports/policies

---

## STEP 10 — RAZORPAY (razorpay.js)

Handles the payment popup for buying/paying insurance premium.

FLOW:
1. Backend creates a Razorpay order → returns orderId + amount
2. Frontend calls openRazorpayCheckout({ orderId, amount, ... })
3. Razorpay payment popup opens (loaded from script in index.html)
4. User enters card/UPI details and pays
5. On success → handler() called with paymentId, orderId, signature
6. Frontend sends these 3 values to backend for payment VERIFICATION
7. If user closes popup without paying → onFailure() is called

---

## STEP 11 — LOGIN FLOW (LoginPage.jsx) — Step by Step

1.  User types username + password in form fields
2.  handleChange() updates formData state on every keystroke
3.  User clicks "Sign In" button
4.  handleSubmit() is called
5.  e.preventDefault() → stops browser from refreshing the page
6.  Validates fields are not empty (shows toast if empty)
7.  setLoading(true) → shows spinner on button
8.  authService.login(formData) → sends POST to /api/v1/auth/login
9.  Request Interceptor checks for token (none yet, first login, skips)
10. Backend validates credentials → returns { token, refreshToken }
11. res.data.token exists → calls login(token, refreshToken) from AuthContext
12. AuthContext decodes JWT → extracts username and role
13. Saves to localStorage and state
14. isAuthenticated becomes true
15. toast.success('Login successful!')
16. navigate('/dashboard')
17. App.jsx sees isAuthenticated=true, no longer redirects away
18. ProtectedRoute checks isAuthenticated=true → shows DashboardLayout
19. Dashboard loads! ✅

---

## STEP 12 — DASHBOARD (DashboardPage.jsx)

Different experience for USER vs ADMIN.

ON LOAD:
- useEffect([], []) runs fetchDashboardData() ONCE when page loads

FOR ADMIN:
- Calls 3 APIs at SAME TIME using Promise.all():
  - adminService.getGeneralReport()   → total users, policies, claims
  - adminService.getAllClaims()        → all claims list
  - adminService.getPoliciesReport()  → policy breakdown
- Shows stat cards: Total Users, Total Policies, Total Claims, Under Review

FOR REGULAR USER:
- Calls 2 APIs at SAME TIME using Promise.all():
  - policyService.getUserPolicies(username)
  - claimsService.getUserClaims(username)
- Calculates stats locally from the returned data
- Shows: My Policies, My Claims, Under Review, Approved counts

CHARTS:
- Pie Chart   = Claims by status (PENDING/APPROVED/REJECTED/etc.)
- Bar Chart   = Policies by type (LIFE/HEALTH/AUTO/etc.)
- Both use Recharts library
- ResponsiveContainer = makes charts fit any screen size

RECENT CLAIMS TABLE:
- Shows last 5 claims sorted by ID descending (newest first)
- Clicking a row → navigate('/claims/:id')

EMPTY STATE:
- If user has NO policies and NO claims → shows "Get Started" card
- Has button to go to /policies page

---

## HOW ONE REQUEST TRAVELS END-TO-END

```
User clicks "Sign In"
      ↓
LoginPage.jsx calls authService.login()
      ↓
api.js Request Interceptor → adds JWT header (none on first login)
      ↓
HTTP POST /api/v1/auth/login → goes to Nginx
      ↓
Nginx proxies request to API Gateway (port 8080)
      ↓
API Gateway validates JWT (if present), routes to Auth Service
      ↓
Auth Service checks username/password in database
      ↓
Returns { token, refreshToken }
      ↓
api.js Response Interceptor → no error, passes response through
      ↓
LoginPage.jsx receives response
      ↓
Calls login() in AuthContext
      ↓
Token decoded, saved to state + localStorage
      ↓
navigate('/dashboard')
      ↓
ProtectedRoute: isAuthenticated = true ✅
      ↓
DashboardLayout renders with Sidebar + Navbar
      ↓
DashboardPage loads and fetches data
```

---

## ALL PAGES SUMMARY

| Page              | URL              | Who Can See  | Purpose                          |
|-------------------|-----------------|--------------|----------------------------------|
| HomePage          | /               | Public       | Landing page, features, hero     |
| AboutPage         | /about          | Public       | About SmartSure                  |
| ContactPage       | /contact        | Public       | Contact form                     |
| LoginPage         | /login          | Guest only   | Login form                       |
| RegisterPage      | /register       | Guest only   | Registration + OTP verification  |
| ForgotPasswordPage| /forgot-password| Guest only   | Password reset                   |
| DashboardPage     | /dashboard      | All users    | Stats, charts, recent claims     |
| PoliciesPage      | /policies       | All users    | Browse and manage policies       |
| PolicyDetailPage  | /policies/:id   | All users    | Policy detail, buy, pay premium  |
| PaymentSuccessPage| /payment-success| All users    | Shown after Razorpay payment     |
| ClaimsPage        | /claims         | All users    | List all claims                  |
| ClaimDetailPage   | /claims/:id     | All users    | File claim, add documents        |
| ProfilePage       | /profile        | All users    | Edit profile, change password    |
| UsersPage         | /users          | ADMIN only   | View, block, delete users        |
| ReportsPage       | /reports        | ADMIN only   | Analytics and system reports     |

---

## KEY REACT CONCEPTS — MUST KNOW FOR EVALUATION

| Concept       | What it means                                          | Where used                  |
|---------------|--------------------------------------------------------|-----------------------------|
| useState      | Stores data that can change. UI re-renders when it changes | Every page/component     |
| useEffect     | Runs code when page loads or when a value changes      | Every page (for API calls)  |
| useContext    | Read data from a Context (AuthContext, ThemeContext)   | Every component             |
| useNavigate   | Go to another page programmatically (from code)        | LoginPage, Sidebar, etc.    |
| useRef        | Hold reference to a DOM element without re-rendering   | Navbar (outside click)      |
| Promise.all   | Call multiple APIs at the same time, wait for all      | DashboardPage               |
| Context API   | Share data across components without passing props     | Auth + Theme                |
| JWT Token     | Encrypted string proving who you are                   | Stored in localStorage      |
| Interceptor   | Code that runs automatically before/after every request| api.js                      |
| <Outlet />    | Placeholder in layout where child page renders         | Both layouts                |
| NavLink       | Like <Link> but adds 'active' class to current page   | Sidebar                     |
| ProtectedRoute| Blocks access unless conditions met                    | App.jsx                     |
| async/await   | Wait for API response before continuing                | All service calls           |
| try/catch     | Handle errors from API calls gracefully                | All service calls           |

---

## ANSWER TEMPLATES FOR EVALUATION

Q: "How does login work?"
A: "User fills the form and clicks Sign In. The handleSubmit function calls
    authService.login() which sends a POST request to /api/v1/auth/login via Axios.
    The backend validates the credentials and returns a JWT token and refresh token.
    We then call the login() function from AuthContext which decodes the JWT using
    jwtDecode to extract the username and role, saves them to state and localStorage,
    making isAuthenticated true. Finally we navigate the user to /dashboard."

Q: "What is AuthContext?"
A: "AuthContext is a React Context that stores the global login state — the user object,
    token, and two helper booleans: isAuthenticated and isAdmin. It wraps the entire app
    so any component can access who is logged in without passing props. On app startup it
    reads from localStorage to restore the session if the token hasn't expired."

Q: "What is ProtectedRoute?"
A: "ProtectedRoute is a component that acts as a guard for private pages. It checks if
    the user is authenticated. If not, it redirects them to /login. For admin-only pages
    it also checks if the user has the ADMIN role. If not, it redirects to /dashboard."

Q: "What is the Axios interceptor?"
A: "We have two interceptors in api.js. The request interceptor automatically reads the
    JWT token from localStorage and adds it to the Authorization header of every request,
    so we never have to add it manually. The response interceptor watches every API response
    and if it gets a 401 Unauthorized error, it clears the token from localStorage and
    redirects the user to the login page automatically."

Q: "How does payment work?"
A: "When a user wants to pay premium, the frontend calls payPremium() which hits the
    backend. The backend creates a Razorpay order and returns an orderId and amount.
    The frontend then calls openRazorpayCheckout() from razorpay.js which opens the
    Razorpay payment popup. After successful payment, Razorpay gives us a paymentId,
    orderId, and signature. We send these back to the backend to verify the payment."

Q: "What is the difference between LandingLayout and DashboardLayout?"
A: "LandingLayout is used for public pages like Home, About, Contact. It has a top
    navigation bar with Sign In and Get Started buttons. DashboardLayout is for
    logged-in users and has a sidebar on the left for navigation and a navbar at the top.
    Both layouts use <Outlet /> from React Router to render the current page inside them."
