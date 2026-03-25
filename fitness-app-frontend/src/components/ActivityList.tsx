import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "react-oauth2-code-pkce";
import { getActivities } from "../api/fitnessApi";
import type { ActivityResponse } from "../types/fitness";

function ActivityList() {
  const { token, tokenData } = useContext(AuthContext);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = useMemo(() => {
    if (!tokenData) {
      return "";
    }
    return (
      tokenData.sub ?? tokenData.userId ?? tokenData.preferred_username ?? ""
    );
  }, [tokenData]);

  useEffect(() => {
    let mounted = true;

    const fetchActivities = async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getActivities(userId, token);
        if (mounted) {
          setActivities(data);
        }
      } catch (err) {
        if (mounted) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch activities";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchActivities();

    const handler = () => {
      fetchActivities();
    };
    window.addEventListener("activities:reload", handler);

    return () => {
      mounted = false;
      window.removeEventListener("activities:reload", handler);
    };
  }, [token, userId]);

  return (
    <section className="card">
      <h2>Your Activities</h2>
      {loading ? <p>Loading activities...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && !error && activities.length === 0 ? (
        <p>No activities yet. Add one from the form.</p>
      ) : null}

      <ul className="activity-list">
        {activities.map((activity) => (
          <li key={activity.id}>
            <div>
              <strong>{activity.type.replace("_", " ")}</strong>
              <p>
                {activity.duration} min · {activity.caloriesBurned} kcal
              </p>
            </div>
            <Link to={`/activities/${activity.id}`}>Details</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActivityList;
