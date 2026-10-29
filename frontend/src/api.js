
const API_URL = "http://localhost:5000/api";

// Store the login token for protected API requests.
let authToken = "";

// Save the token after login and clear it after logout.
export function setAuthToken(token) {
  authToken = token || "";
}

// Common function to connect React with the Express backend.
export async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  };

  // Set JSON content type when sending a request body.
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  // Attach the JWT token to protected API requests.
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  // Send the request to the Express backend.
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Read the backend response without an unnecessary initial assignment.
  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  // Return a readable error when the backend request fails.
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Register a new user.
export function signupUser(userData) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Log in and receive the JWT token.
export function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

// Get the logged-in user's carbon activity records.
export function getCarbonEntries() {
  return apiRequest("/carbon");
}

// Save a new carbon activity.
export function addCarbonEntry(entry) {
  return apiRequest("/carbon", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

// Delete a carbon activity by its database ID.
export function deleteCarbonEntry(id) {
  return apiRequest(`/carbon/${id}`, {
    method: "DELETE",
  });
}

// Get the logged-in user's goals.
export function getGoals() {
  return apiRequest("/goals");
}

// Create a new goal.
export function addGoal(goal) {
  return apiRequest("/goals", {
    method: "POST",
    body: JSON.stringify(goal),
  });
}

// Update an existing goal.
export function updateGoal(id, goal) {
  return apiRequest(`/goals/${id}`, {
    method: "PUT",
    body: JSON.stringify(goal),
  });
}

// Delete a goal by its database ID.
export function deleteGoal(id) {
  return apiRequest(`/goals/${id}`, {
    method: "DELETE",
  });
}

// Get available challenges.
export function getChallenges() {
  return apiRequest("/challenges");
}

// Get dashboard statistics.
export function getDashboard() {
  return apiRequest("/dashboard");
}

// Get the logged-in user's profile.
export function getProfile() {
  return apiRequest("/profile");
}

// Save updated profile details.
export function updateProfile(profile) {
  return apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export default API_URL;
