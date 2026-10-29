
import { useState, useEffect } from "react";
import "./Profile.css";

import { getProfile, updateProfile } from "./api";

function Profile({ onProfileUpdate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [originalProfile, setOriginalProfile] = useState({
    name: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load the logged-in user's profile from the backend.
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const data = await getProfile();
        const profile = data.user || data.profile || data;

        const profileName = profile.name || "";
        const profileEmail = profile.email || "";

        setName(profileName);
        setEmail(profileEmail);
        setOriginalProfile({
          name: profileName,
          email: profileEmail,
        });
      } catch (err) {
        setError(err.message || "Could not load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Send the edited profile details to the backend.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    setSaving(true);

    try {
      const data = await updateProfile({
        name: name.trim(),
        email: email.trim(),
      });

      // Read the updated profile returned by the backend.
      const updated = data.user || data.profile || data;

      const updatedName = updated.name || name.trim();
      const updatedEmail = updated.email || email.trim();

      setName(updatedName);
      setEmail(updatedEmail);
      setOriginalProfile({
        name: updatedName,
        email: updatedEmail,
      });

      // Update the name and email shown in App.jsx.
      if (onProfileUpdate) {
        onProfileUpdate({
          ...updated,
          name: updatedName,
          email: updatedEmail,
        });
      }

      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Restore the saved details if editing is cancelled.
  const handleCancel = () => {
    setName(originalProfile.name);
    setEmail(originalProfile.email);
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <p className="profile-description">
        View and manage your account information.
      </p>

      {error && <p className="profile-message">{error}</p>}

      <div className="profile-card">
        <div className="profile-avatar">
          {name ? name.charAt(0).toUpperCase() : "U"}
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="profile-email">Email Address</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="profile-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <h2>{name}</h2>
            <p>{email}</p>

            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setMessage("");
                setError("");
              }}
            >
              Edit Profile
            </button>
          </div>
        )}

        {message && <p className="profile-message">{message}</p>}
      </div>
    </div>
  );
}

export default Profile;
