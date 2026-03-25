import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { AuthContext } from "react-oauth2-code-pkce";
import { getActivityById } from "../api/fitnessApi";
import type { ActivityResponse } from "../types/fitness";
import { Alert } from "./ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

function ActivityDetails() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchActivity = async () => {
      if (!id || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getActivityById(id, token);
        if (mounted) {
          setActivity(data);
        }
      } catch (err) {
        if (mounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load activity";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchActivity();

    return () => {
      mounted = false;
    };
  }, [id, token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Details</CardTitle>
        <CardDescription>
          Detailed snapshot for one recorded session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="/activities" className="back-link">
          Back to activities
        </Link>

        {loading ? (
          <p className="hint-text">Loading activity details...</p>
        ) : null}
        {error ? <Alert variant="destructive">{error}</Alert> : null}

        {activity ? (
          <div className="details-grid">
            <p>
              <strong>Type:</strong> {activity.type.replace("_", " ")}
            </p>
            <p>
              <strong>Duration:</strong> {activity.duration} min
            </p>
            <p>
              <strong>Calories:</strong> {activity.caloriesBurned} kcal
            </p>
            <p>
              <strong>Start time:</strong>{" "}
              {new Date(activity.startTime).toLocaleString()}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(activity.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {new Date(activity.updatedAt).toLocaleString()}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default ActivityDetails;
