# SmartSure — Line by Line Code Explanation (Part 2)
# Files: LoginPage, RegisterPage, DashboardPage, PoliciesPage, ClaimsPage, ProfilePage, UsersPage

===============================================================
FILE 8: src/pages/LoginPage.jsx
===============================================================

LINE 1: import React, { useState } from 'react';
→ useState is needed to track form data and loading state.

LINE 2: import { Link, useNavigate } from 'react-router-dom';
→ Link: creates clickable links that navigate without page reload.
→ useNavigate: a hook that gives us a function to navigate programmatically.

LINE 3: import { useAuth } from '../context/AuthContext';
→ We need the login() function from AuthContext.

LINE 4: import { authService } from '../services/api';
→ authService has the .login() method to call the backend.

LINE 5: import { Shield, Eye, EyeOff, LogIn, Loader } from 'lucide-react';
→ Icons from the Lucide library.
→ Eye/EyeOff: show/hide password toggle icons.
→ Loader: spinning animation while logging in.

LINE 6: import toast from 'react-hot-toast';
→ toast.success(), toast.error() shows popup messages.

LINE 9: const { login } = useAuth();
→ Gets the login function from AuthContext.
→ We'll call this AFTER the backend confirms credentials.

LINE 10: const navigate = useNavigate();
→ navigate('/dashboard') will move the user to the dashboard page.

LINE 11: const [formData, setFormData] = useState({ username: '', password: '' });
→ formData stores what the user is typing in the form fields.
→ Starts with empty strings.

LINE 12: const [showPassword, setShowPassword] = useState(false);
→ false = password hidden (shows dots). true = shows actual text.

LINE 13: const [loading, setLoading] = useState(false);
→ true while API call is in progress. Used to show spinner on button.

LINE 15-17: const handleChange = (e) => { ... }
→ Called every time user types in any input field.
→ e.target.name → the "name" attribute of the input (e.g., "username" or "password")
→ e.target.value → what was typed.
→ { ...formData, [e.target.name]: e.target.value }
  → Spread operator (...formData) copies all existing fields.
  → Then overrides just the field that changed.
  → Example: typing in username field → { username: "john", password: "" }

LINE 19-42: const handleSubmit = async (e) => { ... }
→ Called when user clicks "Sign In" button (form submit).

LINE 20: e.preventDefault();
→ By default, submitting an HTML form refreshes the page.
→ preventDefault stops that. We handle it in React code instead.

LINE 21-23: if (!formData.username || !formData.password) { return toast.error(...) }
→ Validation: if either field is empty → show error toast and STOP (return).

LINE 24: setLoading(true);
→ Shows spinner on the button.

LINE 25-34: try { ... }
→ try/catch block to handle errors from the API call.

LINE 26: const res = await authService.login(formData);
→ Calls POST /api/v1/auth/login with { username, password }.
→ await pauses execution until the backend responds.
→ res.data will contain { token, refreshToken } from backend.

LINE 28: if (res.data && res.data.token) {
→ Checks that the response actually has a token.

LINE 29: login(res.data.token, res.data.refreshToken);
→ Calls login() from AuthContext.
→ This decodes the JWT, saves user+token to state and localStorage.
→ isAuthenticated becomes true.

LINE 30: toast.success('Login successful!');
→ Shows green popup notification.

LINE 31: navigate('/dashboard');
→ Moves user to the dashboard page.

LINE 35-38: catch (err) { ... }
→ If API call failed (wrong password, user not found, etc.)
→ err.response?.data?.message → tries to get the error message from the backend.
→ If the message is not a string → show generic 'Login failed'.

LINE 40: finally { setLoading(false); }
→ Always runs (whether success or error).
→ Stops the loading spinner.

LINE 44-124: return ( ... )
→ JSX (the visual UI).

LINE 45: <div className="auth-page">
→ CSS class that creates the two-column layout (sidebar left, form right).

LINE 46-56: <div className="auth-sidebar">
→ The blue/purple left panel with the SmartSure tagline.
→ Just decorative content.

LINE 58-123: <div className="auth-content">
→ The right panel with the actual login form.

LINE 65: <form onSubmit={handleSubmit}>
→ When form is submitted (Enter key or button click) → calls handleSubmit.

LINE 68-76: <input type="text" name="username" value={formData.username} onChange={handleChange} />
→ Controlled Input — value is controlled by React state (formData.username).
→ Every keystroke calls handleChange which updates formData.
→ name="username" → handleChange uses this to know which field to update.

LINE 83: type={showPassword ? 'text' : 'password'}
→ If showPassword is true → show text (readable).
→ If false → show dots (hidden).

LINE 93: onClick={() => setShowPassword(!showPassword)}
→ Toggle: if showPassword is true → set to false, and vice versa.
→ The eye icon changes between Eye and EyeOff based on this.

LINE 109-116: <button type="submit" disabled={loading} ...>
→ Clicking this triggers the form's onSubmit (which calls handleSubmit).
→ disabled={loading} → button is unclickable while API call is in progress.
→ Shows spinner icon if loading, else shows "Sign In" text + icon.

===============================================================
FILE 9: src/pages/RegisterPage.jsx  (Two-Step Registration)
===============================================================

LINE 8: const STEPS = { FORM: 'FORM', OTP: 'OTP' };
→ Constants for the two registration steps.
→ FORM = user is filling the registration form.
→ OTP = user is entering the OTP sent to their email.
→ Using constants prevents typos (better than using raw strings "FORM", "OTP").

LINE 14: const [step, setStep] = useState(STEPS.FORM);
→ Tracks which step we're on. Starts on the form step.

LINE 15-23: const [formData, setFormData] = useState({ ... })
→ Stores all form fields: name, username, email, phone, address, password, confirmPassword.

LINE 24: const [otp, setOtp] = useState('');
→ Stores the 6-digit OTP the user types.

LINE 27: const [otpSending, setOtpSending] = useState(false);
→ True while the OTP email is being sent.

LINE 34-58: const handleSendOtp = async (e) => { ... }
→ Step 1 handler. Called when user submits the registration form.

LINE 36-44: Password validations:
→ Passwords must match.
→ Minimum 8 characters.
→ Regex /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/ checks:
  - (?=.*[A-Z]) → at least one uppercase letter
  - (?=.*[0-9]) → at least one digit
  - .{8,} → at least 8 characters total

LINE 48: await authService.sendOtp({ email: formData.email });
→ Calls POST /api/v1/auth/send-otp with the user's email.
→ Backend sends a 6-digit OTP to that email.

LINE 50: setStep(STEPS.OTP);
→ Switches the UI to show the OTP input form.

LINE 61-97: const handleRegister = async (e) => { ... }
→ Step 2 handler. Called when user submits the OTP.

LINE 63-65: if (otp.length !== 6) { return toast.error('...') }
→ OTP must be exactly 6 digits.

LINE 69-78: const registerData = { ... }
→ Builds the full registration payload including the OTP.
→ role: 'USER' → always USER, admins are created differently.
→ phone: formData.phone || null → if phone is empty, send null (not empty string).

LINE 79: const res = await authService.register(registerData);
→ POST /api/v1/auth/register with all user data + OTP.
→ Backend verifies OTP, creates account, returns token.

LINE 82-84: if (res.data && res.data.token) { login(...) }
→ Backend auto-logs in the user after registration.
→ Same as login flow — saves token and navigates to dashboard.

LINE 99-109: const handleResendOtp = async () => { ... }
→ Sends a new OTP to the same email.
→ Called when user clicks "Resend OTP" link.

LINE 124-139: Step indicator UI
→ Shows "1. Your Details" and "2. Verify Email" with circles.
→ Active step has colored circle, completed step shows checkmark.
→ step === STEPS.OTP ? <CheckCircle/> : '1' → step 1 shows checkmark once OTP step is active.

LINE 144: {step === STEPS.FORM ? ( ... ) : ( ... )}
→ Conditional rendering: shows form OR OTP input based on current step.
→ This is how the two-step flow works — same page, different content.

LINE 291: onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
→ /\D/g → regex that matches non-digit characters.
→ replace(/\D/g, '') → removes all non-numbers.
→ .slice(0, 6) → limits to 6 characters.
→ Ensures OTP field only accepts numbers, max 6 digits.

LINE 320-326: Back to details button
→ onClick={() => setStep(STEPS.FORM)} → goes back to step 1.

===============================================================
FILE 10: src/pages/DashboardPage.jsx
===============================================================

LINE 1: import React, { useState, useEffect } from 'react';
LINE 4: import { policyService, claimsService, adminService } from '../services/api';
→ Imports all three services — dashboard uses all of them.

LINE 6: import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
→ Recharts components for drawing charts.
→ BarChart + Bar = bar graph. PieChart + Pie + Cell = pie/donut chart.

LINE 9: const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
→ Array of colors used for pie chart slices.
→ Each status gets a different color.

LINE 12: const { user, isAdmin } = useAuth();
→ Gets logged-in user info and admin status.

LINE 14-17: useState for stats, claims, policies, loading
→ stats: numbers shown in stat cards (totals).
→ claims: list of all claim objects.
→ policies: list of policy objects.
→ loading: true while fetching data.

LINE 19: useEffect(() => { fetchDashboardData(); }, []);
→ Runs fetchDashboardData() ONCE when component mounts (page loads).
→ [] = no dependencies = runs only on first render.

LINE 21-42: const fetchDashboardData = async () => { ... }
→ Fetches data from backend to populate the dashboard.

LINE 24: if (isAdmin) {
→ Different data for admin vs regular user.

LINE 25: const [reportRes, claimsRes, policiesRes] = await Promise.all([...])
→ Promise.all() runs THREE API calls at the same time (parallel).
→ Faster than calling them one by one.
→ Waits until ALL three complete, then continues.
→ Destructuring: [reportRes, claimsRes, policiesRes] = results in order.

LINE 28: const [userPolicies, userClaims] = await Promise.all([...])
→ For regular user: only fetch their own policies and claims.

LINE 30-35: setStats({ ... }) for user
→ Since users don't have a report API, we CALCULATE stats from the data locally.
→ totalPolicies: count of their policies array.
→ pendingClaims: filter claims where status is UNDER_REVIEW or SUBMITTED.
→ approvedClaims: filter claims where status is APPROVED.

LINE 44: const claimStatusData = () => { ... }
→ Converts claims array into chart-friendly format.
→ m = {} is an empty object used as a counter (map).
→ claims.forEach: for each claim, increment m[status] counter.
→ Example: m = { APPROVED: 3, REJECTED: 1, SUBMITTED: 2 }
→ Object.entries(m) → [["APPROVED", 3], ["REJECTED", 1], ...]
→ .map → converts to [{ name: "APPROVED", value: 3 }, ...]
→ Recharts needs data in this format to draw the chart.

LINE 45: const policyTypeData = () => { ... }
→ Same logic but groups policies by type (HEALTH, LIFE, etc.)

LINE 47: if (loading) return <div>Loading...</div>
→ Early return — shows loading message before the main UI.
→ Component renders this until loading=false.

LINE 49-60: adminCards and userCards arrays
→ Each card: { icon, label, value, color, bg }
→ value comes from stats object.
→ These are used to render the 4 stat boxes.

LINE 61: const statCards = isAdmin ? adminCards : userCards;
→ Choose which set of cards to show based on role.

LINE 154: {[...claims].sort((a, b) => b.id - a.id).slice(0, 5).map(...)}
→ [...claims] creates a COPY of the array (don't mutate original).
→ .sort((a, b) => b.id - a.id) sorts by ID descending (newest first).
→ .slice(0, 5) takes only first 5 items.
→ .map() renders each as a table row.

LINE 111: <Pie data={claimStatusData()} cx="50%" cy="50%" innerRadius={60} outerRadius={100} ...>
→ cx/cy = center position of pie (50% = centered).
→ innerRadius=60, outerRadius=100 → makes it a DONUT chart (hole in middle).
→ paddingAngle=4 → small gap between slices.

LINE 112: {claimStatusData().map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
→ For each data item, creates a Cell with a color.
→ index % CHART_COLORS.length → wraps around if more items than colors.

===============================================================
FILE 11: src/pages/PoliciesPage.jsx
===============================================================

LINE 15: const TYPES = ['ALL', 'HEALTH', 'LIFE', 'VEHICLE', 'PROPERTY', 'OTHER'];
→ Filter options for the type dropdown.

LINE 16: const TABS = ['All Policies', 'Active', 'Expired'];
→ Tab options to filter by policy status.

LINE 21: const [policies, setPolicies] = useState([]);
→ ALL policies from backend.

LINE 22: const [filtered, setFiltered] = useState([]);
→ FILTERED subset of policies (what's shown on screen after applying tabs/search).

LINE 32: const [purchasedIds, setPurchasedIds] = useState([]);
→ List of policy IDs that the current user has already purchased.
→ Used to show "Purchased" badge and change button from "Purchase" to "File Claim".

LINE 33: const [claimedPolicyIds, setClaimedPolicyIds] = useState([]);
→ List of policy IDs for which user has already filed a claim.
→ Used to show "Claim Filed" instead of "File Claim" button.

LINE 34: const [actionLoading, setActionLoading] = useState(null);
→ Stores the ID of the policy currently being acted on.
→ null = no action in progress. policy.id = that specific card shows spinner.
→ Prevents clicking multiple buttons at once.

LINE 35: const [purchaseConfirm, setPurchaseConfirm] = useState(null);
→ Stores the policy object when user clicks "Purchase".
→ null = no confirmation dialog. policy = shows the confirmation modal.

LINE 37-43: useEffect
→ On load: fetch all policies + (if user) fetch purchased policy IDs + claimed policy IDs.
→ This is how we know which policies the user already bought.

LINE 59: useEffect(() => { applyFilters(); }, [policies, activeTab, typeFilter, searchQuery, showMyPolicies]);
→ Runs applyFilters() whenever ANY of these values change.
→ This keeps the displayed list in sync with all filters.

LINE 75-85: const applyFilters = () => { ... }
→ Filters the policies array based on active tab, type, and search query.
→ result = copy of policies array.
→ activeTab === 1 → filter to ACTIVE only.
→ typeFilter !== 'ALL' → filter to specific type.
→ searchQuery.trim() → search in name and description.
→ setFiltered(result) → updates the displayed list.

LINE 95-97: const initiatePurchase = (policy) => { setPurchaseConfirm(policy); }
→ When "Purchase" is clicked, just open the confirmation dialog.
→ Doesn't pay yet — user must confirm in the dialog.

LINE 99-132: const handlePurchase = async () => { ... }
→ Called when user clicks "Pay Now" in the confirmation dialog.

LINE 104: const amountInPaise = Math.round(purchaseConfirm.basePremium * 100);
→ Razorpay uses paise (1 rupee = 100 paise).
→ Math.round to avoid floating point issues.

LINE 105-131: openRazorpayCheckout({ ... })
→ Opens the Razorpay payment popup.
→ onSuccess callback (runs after payment):
  - Calls policyService.purchase() to confirm purchase in backend.
  - Shows success toast.
  - Adds policy ID to purchasedIds list.
  - Redirects to /payment-success page.
→ onFailure callback (runs if payment cancelled/failed):
  - Shows error toast.
  - Clears the loading state.

LINE 234-235: const isPurchased = purchasedIds.includes(policy.id);
              const hasClaim = claimedPolicyIds.includes(policy.id);
→ Checks if this specific policy was purchased or claimed by the user.

LINE 260-285: Button logic for each policy card:
→ If NOT admin and policy is ACTIVE:
  → If PURCHASED:
    → If HAS CLAIM: show "Claim Filed" button (green, links to /claims)
    → If NO CLAIM: show "File Claim" button (opens claim modal)
  → If NOT PURCHASED: show "Purchase" button (opens Razorpay)
→ If admin: show Edit and Delete buttons instead.

===============================================================
FILE 12: src/pages/ClaimsPage.jsx
===============================================================

LINE 12: const STATUS_TABS = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'];
→ All possible claim statuses. Used for the filter tabs.

CLAIM LIFECYCLE:
DRAFT → user created claim but not submitted yet
SUBMITTED → user submitted for admin review
UNDER_REVIEW → admin started reviewing
APPROVED → admin approved the claim
REJECTED → admin rejected the claim
CANCELLED → user cancelled the claim

LINE 25: useEffect(() => { fetchClaims(); }, []);
→ Fetch claims on page load.

LINE 26: useEffect(() => { applyFilter(); }, [claims, activeStatus]);
→ Re-filter whenever claims list or selected status changes.

LINE 28-43: const fetchClaims = async () => { ... }
→ Admin → fetches ALL claims (adminService.getAllClaims()).
→ User → fetches only their own claims (claimsService.getUserClaims(username)).

LINE 45-51: const applyFilter = () => { ... }
→ Filters claims by activeStatus.
→ [...result].sort((a, b) => b.id - a.id) → sorts by ID descending (newest first).

LINE 53-64: const openNewClaim = async () => { ... }
→ Before opening the "File Claim" modal, we need to fetch the user's purchased policies
  (so the user can pick which policy to file against).
→ First tries getUserPolicies. If that fails, falls back to getActive().
→ Then opens the modal.

LINE 66-80: const handleClaimSubmit = async (data) => { ... }
→ Creates a new claim:
  1. Separate file from other claim data (file is uploaded separately).
  2. POST /claims/initiate-claim with claim data.
  3. If a file was attached, upload it as a document.
  4. Optimistic update: add new claim to local state immediately.
  5. Show success and refresh claims.

LINE 73: setClaims(prev => [res.data, ...prev]);
→ OPTIMISTIC UPDATE: adds the new claim to the front of the list immediately.
→ User sees it right away without waiting for fetchClaims() to complete.

LINE 82-93: const handleSubmitClaim = async (id) => { ... }
→ Changes a DRAFT claim to SUBMITTED.
→ setActionLoading(id) → shows spinner on that specific claim's button.

LINE 95-106: const handleCancelClaim = async (id) => { ... }
→ Cancels a DRAFT or SUBMITTED claim.

LINE 108-119: const handleApprove / handleReject
→ Admin-only actions on UNDER_REVIEW or SUBMITTED claims.

LINE 170-171: count in tab badges
→ claims.filter(c => c.status === status).length
→ Shows count of claims for each status in the tab button.

LINE 222-231: User action buttons per row:
→ DRAFT: show Submit + Cancel buttons.
→ SUBMITTED: show only Cancel button (can't re-submit).
→ APPROVED/REJECTED: no actions (final states).

LINE 232-241: Admin action buttons:
→ UNDER_REVIEW or SUBMITTED: show Approve + Reject buttons.

===============================================================
FILE 13: src/pages/ProfilePage.jsx
===============================================================

LINE 9: const [profile, setProfile] = useState(null);
→ Full user profile data from backend (includes name, email, phone, address, role).

LINE 13: const [profileForm, setProfileForm] = useState({ ... })
→ Separate state for the editable form fields.
→ Pre-filled from profile data after fetching.

LINE 17: const [passwordForm, setPasswordForm] = useState({ oldPassword, newPassword, confirmPassword })
→ Separate state for the change password form.

LINE 21: const [pwdErrors, setPwdErrors] = useState({});
→ Stores validation error messages for each password field.
→ e.g., { newPassword: 'Min 8 chars, 1 uppercase, 1 digit' }

LINE 25-42: const fetchProfile = async () => { ... }
→ GET /auth/user/{username} → fetches the user's full profile.
→ Then pre-fills profileForm with the fetched data.
→ This is why the form shows existing values when you open the page.

LINE 44-61: const handleProfileUpdate = async (e) => { ... }
→ Validates required fields.
→ PUT /auth/update-profile with updated data.
→ After success: calls logout() after 1.5 seconds.
→ WHY? The username might have changed, so the old JWT token is now invalid.
  User must log in again with the new username.

LINE 55: setTimeout(() => logout(), 1500);
→ Wait 1.5 seconds (so user can read the success message) then log out.

LINE 63-88: const handlePasswordChange = async (e) => { ... }
→ Validates all 3 password fields.
→ Regex check same as registration.
→ If errors found → sets pwdErrors and STOPS (returns early).
→ PUT /auth/change-password with oldPassword and newPassword.
→ On success: clears the form fields.

LINE 66-73: Validation logic
→ errs is an empty object.
→ If a field fails validation → add it to errs object.
→ setPwdErrors(errs) → UI shows error messages.
→ if (Object.keys(errs).length > 0) return; → if any errors, stop before calling API.

LINE 165: style={{ borderColor: pwdErrors.oldPassword ? 'var(--color-danger)' : undefined }}
→ If there's an error for that field → make the input border red.
→ undefined means don't override the default border style.

===============================================================
FILE 14: src/pages/UsersPage.jsx  (Admin Only)
===============================================================

LINE 9: const [users, setUsers] = useState([]);
→ All users from the backend.

LINE 13: const [filter, setFilter] = useState('ALL');
→ Can filter to show: ALL, ACTIVE, or BLOCKED users.

LINE 15-25: const fetchUsers = async () => { ... }
→ GET /admin/users → returns all users.

LINE 27: useEffect(() => { fetchUsers(); }, []);
→ Fetch users when page loads.

LINE 29-32: const handleDeleteClick = (userId) => { ... }
→ When delete icon is clicked → store the userId and open the delete confirmation dialog.
→ Does NOT delete immediately — shows a confirmation first.

LINE 34-48: const handleStatusToggle = async (userItem) => { ... }
→ If user.blocked is true → call activateUser (unblock).
→ If user.blocked is false → call blockUser (block).
→ toast.loading() shows "Updating status..." while API runs.
→ { id: loadingToast } → replaces the loading toast with success/error toast.

LINE 50-60: const handleDeleteConfirm = async () => { ... }
→ Called when admin confirms deletion in the dialog.
→ DELETE /auth/delete/{userId}

LINE 62-66: const filteredUsers = users.filter(...)
→ Client-side filtering (no new API call).
→ Filters based on the filter state value.

LINE 77-119: Stat cards (Total, Active, Blocked)
→ Clicking a stat card sets the filter.
→ The clicked card gets a colored border (shows it's active filter).
→ border: filter === 'ALL' ? '2px solid var(--color-primary-500)' : '...'

LINE 127-131: <UserTable ... />
→ Passes filtered users + action handlers to the UserTable component.
→ UserTable is a separate component that renders the actual table rows.

LINE 134-139: <DeleteDialog ... />
→ A confirmation dialog. Always rendered but only VISIBLE when isDeleteOpen=true.

===============================================================
COMPONENTS SUMMARY
===============================================================

Sidebar.jsx:
→ isAdmin check → shows Users and Reports menu only for admins.
→ NavLink with isActive → CSS class changes for current page.
→ Logout → calls logout() from AuthContext → navigate('/login').

Navbar.jsx:
→ Polls notifications every 30 seconds (setInterval in useEffect).
→ useRef(null) → holds reference to the notification panel div.
→ document.addEventListener('mousedown', ...) → detects clicks outside the panel.
→ panelRef.current.contains(e.target) → checks if click was inside the panel.
→ formatTime() → converts dates to "5m ago", "2h ago", "3d ago" format.

UserTable.jsx:
→ Receives users array + onDelete + onStatusChange as props.
→ Renders a table row for each user.
→ Passes actions up via the callback props.

DeleteDialog.jsx:
→ A modal (popup) that asks "Are you sure you want to delete?"
→ Only appears when isOpen=true.
→ onConfirm → calls the delete function in UsersPage.
→ onClose → cancels the deletion.

PolicyModal.jsx:
→ Form modal for ADMIN to create or edit a policy.
→ When editPolicy is passed → pre-fills form with existing values (edit mode).
→ When null → empty form (create mode).

ClaimModal.jsx:
→ Form modal for USER to file a new claim.
→ Has a dropdown to select which policy they want to claim against.
→ Has file upload for supporting documents.

Pagination.jsx:
→ Reusable component that shows Previous/Next and page number buttons.
→ Receives: currentPage, totalPages, onPageChange as props.

===============================================================
QUICK CHEAT SHEET FOR EVALUATION
===============================================================

Q: What is useState?
A: A React hook that creates a variable that, when changed, causes the
   component to re-render. Syntax: const [value, setValue] = useState(initial)

Q: What is useEffect?
A: A hook that runs code as a side effect. useEffect(() => {}, []) runs once
   on mount. useEffect(() => {}, [x]) runs when x changes.

Q: What is async/await?
A: async marks a function as asynchronous. await pauses execution until a
   Promise resolves. Used for API calls.

Q: What is try/catch/finally?
A: try: code that might fail. catch: handles the error. finally: always runs,
   used to reset loading states.

Q: What does e.preventDefault() do?
A: Stops the default browser behavior. For forms, it stops the page from
   refreshing on submit.

Q: What does {...formData, [key]: value} mean?
A: Spread operator. Copies all properties of formData, then overrides/adds
   the property with key=key. Used to update one field without losing others.

Q: What is Promise.all()?
A: Takes an array of Promises and runs them ALL simultaneously. Returns when
   all of them complete. Faster than awaiting them one by one.

Q: What is conditional rendering?
A: Showing different JSX based on a condition.
   {isAdmin && <AdminSection />} → shows only if isAdmin is true.
   {loading ? <Spinner/> : <Content/>} → shows Spinner or Content based on loading.

Q: What is prop drilling vs Context API?
A: Prop drilling = passing data through many component layers as props.
   Context API = creating a global "store" that any component can read directly.
   AuthContext uses Context API so every page can access user data without props.
