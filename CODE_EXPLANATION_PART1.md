# SmartSure — Line by Line Code Explanation (Part 1)
# Files: main.jsx, AuthContext, ThemeContext, App.jsx, ProtectedRoute, api.js

===============================================================
FILE 1: src/main.jsx  (Entry Point — App starts here)
===============================================================

LINE 1: import React from 'react';
→ Imports the React library. Needed to use JSX (the HTML-like syntax in .jsx files).

LINE 2: import ReactDOM from 'react-dom/client';
→ ReactDOM is used to "mount" (attach) the React app into the actual HTML page.

LINE 3: import { BrowserRouter } from 'react-router-dom';
→ BrowserRouter enables URL-based navigation (going from /login to /dashboard etc.)
→ Without this, React Router's Link and Route components won't work.

LINE 4: import { AuthProvider } from './context/AuthContext';
→ Imports the AuthProvider component which wraps the app and provides login state.

LINE 5: import { ThemeProvider } from './context/ThemeContext';
→ Imports ThemeProvider which wraps the app and provides dark/light mode state.

LINE 6: import App from './App';
→ Imports the main App component where all routes are defined.

LINE 7: import './index.css';
→ Imports the global CSS file (all styling, color variables, button styles, etc.)

LINE 9: ReactDOM.createRoot(document.getElementById('root')).render(...)
→ Finds the <div id="root"> in index.html and tells React to render the app inside it.
→ This is the SINGLE point where React takes over the page.

LINE 10: <React.StrictMode>
→ A development tool that warns you about potential bugs. Does NOT affect production.

LINE 11: <BrowserRouter>
→ Enables navigation. Watches the URL and tells React Router which page to show.

LINE 12: <ThemeProvider>
→ Wraps everything so ALL components can access the current theme (dark/light).

LINE 13: <AuthProvider>
→ Wraps everything so ALL components can access who is logged in.

LINE 14: <App />
→ The actual application with all pages and routes.

WHY THIS NESTING ORDER MATTERS:
- BrowserRouter must be outermost (routing needs to know about the browser URL first)
- ThemeProvider and AuthProvider wrap App so that EVERY page can use theme and auth state
- If you put AuthProvider outside BrowserRouter, routing won't work properly

===============================================================
FILE 2: src/context/AuthContext.jsx  (Login State Manager)
===============================================================

LINE 1: import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
→ Imports React hooks:
  - createContext: creates a "shared data container" (the context)
  - useContext: lets any component READ from the context
  - useState: store values that can change (token, user, etc.)
  - useEffect: run code when component loads or values change
  - useCallback: memoize (cache) functions so they don't re-create every render

LINE 2: import { jwtDecode } from 'jwt-decode';
→ Imports the jwtDecode function from a library.
→ JWT tokens are encoded strings. jwtDecode reads the data inside them.
→ Example: jwtDecode("eyJhbGc...") returns { sub: "john", role: "ADMIN", exp: 1234567890 }

LINE 4: const AuthContext = createContext(null);
→ Creates an empty "container" (context) that will hold auth data.
→ null is the default value (before AuthProvider sets it up).
→ Think of it like creating an empty box that will hold the login state.

LINE 6-10: export const useAuth = () => { ... }
→ This is a CUSTOM HOOK. It's a shortcut for other components to use the auth context.
→ Any component can call: const { user, isAdmin, login, logout } = useAuth();
→ Line 8: Throws an error if useAuth() is called outside of AuthProvider — safety check.

LINE 12: export const AuthProvider = ({ children }) => {
→ AuthProvider is the component that WRAPS the app and provides the auth state.
→ { children } = everything nested inside <AuthProvider>...</AuthProvider>

LINE 13: const [user, setUser] = useState(null);
→ user stores the logged-in user's data: { username: "john", role: "USER" }
→ useState(null) means initially no one is logged in.

LINE 14: const [token, setToken] = useState(null);
→ token stores the JWT access token string.
→ Sent in every API request to prove identity.

LINE 15: const [refreshToken, setRefreshToken] = useState(null);
→ refreshToken is a longer-lived token used to get a new access token when it expires.

LINE 16: const [loading, setLoading] = useState(true);
→ loading = true means "we are still checking if user is already logged in"
→ Set to true at start, then set to false after checking localStorage.
→ ProtectedRoute shows a spinner while loading=true.

LINE 19-44: useEffect(() => { ... }, []);
→ The [] means this runs ONCE when the component first loads (on app startup).
→ This is where we restore the session from localStorage.

LINE 20: const storedToken = localStorage.getItem('smartsure_token');
→ Reads the saved JWT from the browser's localStorage.
→ If user logged in before, this will have a value.

LINE 21: const storedRefresh = localStorage.getItem('smartsure_refresh');
→ Reads the saved refresh token.

LINE 22: if (storedToken) {
→ If a token was found, try to restore the session.

LINE 24: const decoded = jwtDecode(storedToken);
→ Decodes the JWT to read the data inside it.
→ Returns: { sub: "username", role: "ADMIN", exp: 1234567890 }

LINE 26: if (decoded.exp * 1000 > Date.now()) {
→ decoded.exp is the expiry time in SECONDS. Multiply by 1000 to convert to milliseconds.
→ Date.now() returns current time in milliseconds.
→ This checks: "Has the token expired?"
→ If expiry time is in the FUTURE → token is still valid.

LINE 27-32: setToken, setRefreshToken, setUser(...)
→ Restores the logged-in state from the saved token.
→ user.role comes from decoded.role (the role saved inside the JWT by the backend).

LINE 34-37: else { localStorage.removeItem(...) }
→ Token is expired → clear localStorage so user must log in again.

LINE 38-41: catch { localStorage.removeItem(...) }
→ If jwtDecode fails (token is corrupted) → clear everything.

LINE 43: setLoading(false);
→ Done checking → set loading to false so ProtectedRoute shows the page.

LINE 46-56: const login = useCallback((tokenValue, refreshTokenValue) => { ... }, []);
→ This function is called after successful login.
→ useCallback means this function won't be re-created on every render (performance).

LINE 47: const decoded = jwtDecode(tokenValue);
→ Decodes the new token to extract username and role.

LINE 48-53: setToken, setRefreshToken, setUser(...)
→ Updates state so the whole app knows someone is logged in.

LINE 54: localStorage.setItem('smartsure_token', tokenValue);
→ Saves token to localStorage so it persists if the browser is refreshed.

LINE 58-64: const logout = useCallback(() => { ... }, []);
→ Clears everything — state and localStorage.
→ After this, isAuthenticated becomes false, user is sent to /login.

LINE 66: const isAuthenticated = !!token && !!user;
→ !! converts a value to boolean (true/false).
→ isAuthenticated is true ONLY IF both token and user exist.
→ If either is null → false.

LINE 67: const isAdmin = user?.role === 'ADMIN';
→ user?.role means: if user exists, get its role. If user is null, return undefined.
→ isAdmin is true only if role is exactly "ADMIN".

LINE 69-78: const value = { user, token, ... }
→ This is the object that ALL components will receive when they use useAuth().
→ It exposes: user, token, loading, login(), logout(), isAuthenticated, isAdmin.

LINE 80-84: return (<AuthContext.Provider value={value}>{ children}</AuthContext.Provider>)
→ This wraps the children (entire app) and makes the value available to all.
→ Any component inside can now call useAuth() to get this value.

===============================================================
FILE 3: src/context/ThemeContext.jsx  (Dark/Light Mode)
===============================================================

LINE 3: const ThemeContext = createContext();
→ Creates the theme context container.

LINE 5: export const ThemeProvider = ({ children }) => {
→ The ThemeProvider wraps the app and provides theme state.

LINE 6-10: const [theme, setTheme] = useState(() => { ... });
→ useState with a function (lazy initializer) — runs once to get initial value.
→ First checks localStorage for saved theme.
→ If nothing saved, checks system preference using window.matchMedia.
→ Result: either 'dark' or 'light'.

LINE 12-15: useEffect(() => { ... }, [theme]);
→ Runs every time theme changes.
→ Sets data-theme attribute on the <html> element.
→ CSS reads [data-theme="dark"] to change all colors.
→ Also saves the preference to localStorage.

LINE 17-19: const toggleTheme = () => { ... }
→ Switches theme: if current is 'light' → set 'dark', and vice versa.

===============================================================
FILE 4: src/App.jsx  (All Routes / Pages)
===============================================================

LINE 1: import React from 'react';
→ Always needed for JSX.

LINE 2: import { Routes, Route, Navigate } from 'react-router-dom';
→ Routes: container for all Route definitions.
→ Route: maps a URL path to a component.
→ Navigate: programmatically redirects to another URL.

LINE 3: import { Toaster } from 'react-hot-toast';
→ Toaster is the container that shows popup notifications.
→ toast.success(), toast.error() methods work because Toaster is rendered here.

LINE 4: import { useAuth } from './context/AuthContext';
→ Gets isAuthenticated to use in route guards.

LINE 27: const { isAuthenticated } = useAuth();
→ Reads from AuthContext whether someone is logged in.

LINE 30-43: <Toaster ... />
→ Renders the notification system.
→ position="top-right" → notifications appear at top right corner.
→ duration: 3000 → each toast shows for 3 seconds then disappears.
→ style: dark background with rounded corners (matches the app theme).

LINE 46: <Route element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingLayout />}>
→ This is a LAYOUT ROUTE. It wraps child routes.
→ If user IS logged in → redirect to /dashboard (no point showing landing page).
→ If user is NOT logged in → show LandingLayout (with navbar/header).
→ replace means: don't add to browser history (back button won't loop).

LINE 47-49: Nested routes inside LandingLayout
→ /, /about, /contact are child routes.
→ <Outlet /> in LandingLayout renders these child pages inside the layout.

LINE 53-64: Auth routes (/login, /register, /forgot-password)
→ Each checks: if already logged in → redirect to /dashboard.
→ Prevents logged-in users from seeing the login page.

LINE 67-98: Protected routes
→ Wrapped in <ProtectedRoute> → only accessible if logged in.
→ Wrapped in <DashboardLayout> → shows sidebar + navbar around the page.
→ /users and /reports: wrapped in <ProtectedRoute adminOnly> → admin only.

LINE 100-101: Fallback route path="*"
→ Catches any URL that doesn't match any route above.
→ Redirects to /dashboard if logged in, else /.

===============================================================
FILE 5: src/components/ProtectedRoute.jsx  (Page Guard)
===============================================================

LINE 6: const ProtectedRoute = ({ children, adminOnly = false }) => {
→ children = the page component to show if allowed.
→ adminOnly = false by default. Set to true for admin-only pages.

LINE 7: const { isAuthenticated, isAdmin, loading } = useAuth();
→ Gets authentication state from AuthContext.

LINE 8: const location = useLocation();
→ Gets the current URL. Used to redirect back after login.

LINE 10-17: if (loading) { return spinner }
→ While still checking localStorage on startup → show a loading spinner.
→ Prevents the page from flashing to /login and back.

LINE 19-21: if (!isAuthenticated) { return <Navigate to="/login" ... /> }
→ Not logged in → send to login page.
→ state={{ from: location }} saves the current URL.
→ After login, LoginPage can redirect back to where user wanted to go.

LINE 23-25: if (adminOnly && !isAdmin) { return <Navigate to="/dashboard" /> }
→ Admin-only page but user is not admin → redirect to dashboard.

LINE 27: return children;
→ All checks passed → render the actual page.

===============================================================
FILE 6: src/services/api.js  (All API Calls)
===============================================================

LINE 1: import axios from 'axios';
→ Axios is a library for making HTTP requests (GET, POST, PUT, DELETE).
→ Better than the built-in fetch() — handles errors and JSON automatically.

LINE 3: const API_BASE = '/api/v1';
→ Base URL prefix for all API calls.
→ In production, Nginx proxies /api/v1 to the API Gateway on port 8080.

LINE 5-10: const api = axios.create({ ... })
→ Creates a CUSTOM AXIOS INSTANCE with default settings.
→ baseURL: '/api/v1' → automatically prepended to all request paths.
→ 'Content-Type': 'application/json' → tells backend we are sending JSON data.

LINE 13-22: api.interceptors.request.use(...)
→ REQUEST INTERCEPTOR — runs BEFORE every single API call.
→ Line 15: Reads token from localStorage.
→ Line 17: If token exists, adds it to the request header.
→ Format: Authorization: Bearer eyJhbGciOi...
→ Backend (API Gateway) reads this header to verify who is making the request.
→ (error) => Promise.reject(error) → if something goes wrong, pass the error along.

LINE 25-35: api.interceptors.response.use(...)
→ RESPONSE INTERCEPTOR — runs AFTER every API response comes back.
→ (response) => response → if response is OK, just pass it through unchanged.
→ If error.response?.status === 401 (Unauthorized):
  - Token is expired or invalid.
  - Remove token from localStorage.
  - Redirect to /login.
→ return Promise.reject(error) → even after handling, still throw the error
  so the component calling the API can also handle it.

LINE 38-60: export const authService = { ... }
→ Object containing all authentication API calls.
→ Each property is an arrow function that calls api.get/post/put/delete.
→ Examples:
  - login: (data) => api.post('/auth/login', data)
    → Sends POST request to /api/v1/auth/login with { username, password }
  - getUser: (username) => api.get(`/auth/user/${username}`)
    → Sends GET request to /api/v1/auth/user/john
  - updateProfile: (username, data) => api.put('/auth/update-profile', data, { headers: { 'X-Username': username } })
    → The backend needs to know WHO is updating. Since it's not in the URL,
      we pass it as a custom header X-Username.

LINE 63-84: export const policyService = { ... }
→ All policy-related API calls.
→ purchase: (id, username) => api.post(`/policies/${id}/purchase`, null, { headers: { 'X-Username': username } })
  → null = no request body (just the URL and header).
  → X-Username header tells backend who is purchasing.

LINE 87-112: export const claimsService = { ... }
→ All claims-related API calls.
→ addDocument uses FormData (multipart/form-data) for file uploads:
  - formData.append('file', file) → attaches the file.
  - 'Content-Type': 'multipart/form-data' → tells backend it's a file upload.

LINE 115-129: export const adminService = { ... }
→ Admin-only API calls for managing claims, users, and reports.

===============================================================
FILE 7: src/services/razorpay.js  (Payment Gateway)
===============================================================

LINE 6: const RAZORPAY_KEY_ID = 'rzp_test_Sj0AyHVKS3wjql';
→ This is the Razorpay API KEY (test mode).
→ Identifies our merchant account to Razorpay.

LINE 21-31: export const openRazorpayCheckout = ({ orderId, amount, ... }) => {
→ This function opens the Razorpay payment popup.
→ Accepts an options object with orderId, amount, callbacks, etc.

LINE 32-35: if (!window.Razorpay) { alert(...); return; }
→ Checks if the Razorpay script loaded from index.html.
→ If no internet or script blocked → show alert and stop.

LINE 37-72: const options = { ... }
→ Configuration object for the Razorpay popup.
→ key: RAZORPAY_KEY_ID → identifies us to Razorpay.
→ amount: in paise (1 rupee = 100 paise). So ₹500 = 50000 paise.
→ handler: function(response) → called AUTOMATICALLY when payment succeeds.
  - response contains paymentId, orderId, signature.
  - We call onSuccess callback with these values.
→ prefill: pre-fills user's name, email, phone in the popup.
→ theme.color: the purple color matching our app theme.
→ modal.ondismiss: called when user CLOSES the popup without paying.
  - We call onFailure callback with "Payment cancelled by user".

LINE 74: const rzp = new window.Razorpay(options);
→ Creates a new Razorpay checkout instance with our options.

LINE 75-79: rzp.on('payment.failed', function(response) { ... })
→ Listens for payment failure event (declined card, wrong OTP, etc.)
→ Calls onFailure with the error description.

LINE 80: rzp.open();
→ Opens the actual payment popup for the user.

===============================================================
HOW ALL 6 FILES CONNECT (Summary)
===============================================================

index.html
  → loads main.jsx

main.jsx
  → wraps App in BrowserRouter + ThemeProvider + AuthProvider
  → AuthProvider reads localStorage → restores session if token exists

App.jsx
  → defines all routes
  → reads isAuthenticated from AuthContext
  → wraps protected routes in ProtectedRoute
  → wraps logged-in pages in DashboardLayout

ProtectedRoute.jsx
  → reads isAuthenticated and isAdmin from AuthContext
  → blocks or allows access to protected pages

AuthContext.jsx
  → stores user, token, isAuthenticated, isAdmin
  → login() and logout() update the state and localStorage

api.js
  → Axios instance with interceptors
  → Request interceptor: auto-adds token to every request
  → Response interceptor: auto-logs out on 401
  → authService, policyService, claimsService, adminService objects
