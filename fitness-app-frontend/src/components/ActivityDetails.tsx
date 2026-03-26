import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { AuthContext } from "react-oauth2-code-pkce";
import { getActivityById, getRecommendationsByUser } from "../api/fitnessApi";
import type { ActivityResponse, Recommendation } from "../types/fitness";
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
  const { token, tokenData } = useContext(AuthContext);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendationsError, setRecommendationsError] = useState<
    string | null
  >(null);

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

  useEffect(() => {
    let mounted = true;

    const fetchRecommendations = async () => {
      if (!id || !token || !userId) {
        return;
      }

      setRecommendationsLoading(true);
      setRecommendationsError(null);

      try {
        const items = await getRecommendationsByUser(userId, token);
        if (mounted) {
          setRecommendations(items.filter((item) => item.activityId === id));
        }
      } catch (err) {
        if (mounted) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load recommendations";
          setRecommendationsError(message);
        }
      } finally {
        if (mounted) {
          setRecommendationsLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      mounted = false;
    };
  }, [id, token, userId]);

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
          <>
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

            <section className="activity-recommendations">
              <h3>AI Recommendations</h3>
              {recommendationsLoading ? (
                <p className="hint-text">Loading recommendations...</p>
              ) : null}
              {recommendationsError ? (
                <Alert variant="destructive">{recommendationsError}</Alert>
              ) : null}
              {!recommendationsLoading &&
              !recommendationsError &&
              recommendations.length === 0 ? (
                <div className="empty-state">
                  <h3>No recommendations for this activity yet</h3>
                  <p>Recommendations appear after processing your activity.</p>
                </div>
              ) : null}

              <div className="recommendation-list">
                {recommendations.map((recommendation) => (
                  <article
                    key={recommendation.id}
                    className="recommendation-card recommendation-inline-card"
                  >
                    <h4>{recommendation.activityType}</h4>
                    <p>{recommendation.recommendation}</p>

                    <h5>Improvements</h5>
                    <ul>
                      {recommendation.improvements?.map((item) => (
                        <li key={`${recommendation.id}-improvement-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <h5>Suggestions</h5>
                    <ul>
                      {recommendation.suggestions?.map((item) => (
                        <li key={`${recommendation.id}-suggestion-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <h5>Safety</h5>
                    <ul>
                      {recommendation.safety?.map((item) => (
                        <li key={`${recommendation.id}-safety-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default ActivityDetails;
