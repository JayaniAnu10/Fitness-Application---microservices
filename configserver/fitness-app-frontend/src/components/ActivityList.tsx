import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "react-oauth2-code-pkce";
import { getActivities } from "../api/fitnessApi";
import type { ActivityResponse } from "../types/fitness";
import { Alert } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Your Activities</CardTitle>
        <CardDescription>
          A quick timeline of the sessions tracked under your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <p className="hint-text">Loading activities...</p> : null}
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {!loading && !error && activities.length === 0 ? (
          <div className="empty-state">
            <h3>No activities yet</h3>
            <p>
              Add your first workout from the form to start generating insights.
            </p>
          </div>
        ) : null}

        <ul className="activity-list">
          {activities.map((activity) => (
            <li key={activity.id}>
              <div className="item-stack">
                <strong className="item-title">
                  {activity.type.replace("_", " ")}
                </strong>
                <Badge>
                  {activity.duration} min · {activity.caloriesBurned} kcal
                </Badge>
              </div>
              <Link
                to={`/activities/${activity.id}`}
                className="list-link-action"
              >
                Details
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default ActivityList;
