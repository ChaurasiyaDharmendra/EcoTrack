
import { useState, useEffect } from "react";
import "./Challenges.css";
import { getChallenges } from "./api";

function Challenges() {
  const [challengeData, setChallengeData] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load available challenges from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadChallenges() {
      setLoading(true);
      setError("");

      try {
        const data = await getChallenges();
        const records = Array.isArray(data)
          ? data
          : data.challenges || [];

        if (!cancelled) {
          setChallengeData(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load challenges.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChallenges();

    return () => {
      cancelled = true;
    };
  }, []);

  // Join or leave a challenge in the current interface only.
  const toggleChallenge = (id) => {
    setJoinedChallenges((previous) =>
      previous.includes(id)
        ? previous.filter((challengeId) => challengeId !== id)
        : [...previous, id]
    );
  };

  return (
    <div className="challenges-page">
      <h1>Sustainability Challenges</h1>

      <p className="challenges-description">
        Take small actions every day to help reduce your carbon footprint.
      </p>

      <div className="challenge-summary">
        <h2>{joinedChallenges.length}</h2>
        <p>Challenges Joined</p>
      </div>

      {error && <p className="auth-error">{error}</p>}

      {loading ? (
        <p>Loading challenges...</p>
      ) : challengeData.length === 0 ? (
        <p>No challenges available right now.</p>
      ) : (
        <div className="challenges-list">
          {challengeData.map((challenge) => {
            const id = challenge._id || challenge.id;
            const isJoined = joinedChallenges.includes(id);

            return (
              <div className="challenge-card" key={id}>
                <span className="challenge-category">
                  {challenge.category}
                </span>

                <h2>{challenge.title}</h2>
                <p>{challenge.description}</p>

                <div className="challenge-duration">
                  Duration: {challenge.durationDays ?? challenge.duration ?? 7} days
                </div>

                <button
                  type="button"
                  className={isJoined ? "joined-button" : "join-button"}
                  onClick={() => toggleChallenge(id)}
                >
                  {isJoined ? "Leave Challenge" : "Join Challenge"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Challenges;
