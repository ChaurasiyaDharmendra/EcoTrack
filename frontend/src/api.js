const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function signupUser(userData) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getCarbonEntries() {
  return apiRequest("/carbon");
}

export function addCarbonEntry(entry) {
  return apiRequest("/carbon", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export function deleteCarbonEntry(id) {
  return apiRequest(`/carbon/${id}`, {
    method: "DELETE",
  });
}

export function getGoals() {
  return apiRequest("/goals");
}

export function addGoal(goal) {
  return apiRequest("/goals", {
    method: "POST",
    body: JSON.stringify(goal),
  });
}

export function updateGoal(id, goal) {
  return apiRequest(`/goals/${id}`, {
    method: "PUT",
    body: JSON.stringify(goal),
  });
}

export function deleteGoal(id) {
  return apiRequest(`/goals/${id}`, {
    method: "DELETE",
  });
}

export function getChallenges() {
  return apiRequest("/challenges");
}

export function getDashboard() {
  return apiRequest("/dashboard");
}

export function getProfile() {
  return apiRequest("/profile");
}

export function updateProfile(profile) {
  return apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export default API_URL;
