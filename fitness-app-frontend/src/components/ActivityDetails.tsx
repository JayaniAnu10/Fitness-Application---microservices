import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { AuthContext } from "react-oauth2-code-pkce";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  Dumbbell,
  Flame,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
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
    <div className="activity-details-shell">
      <Link to="/activities" className="back-link activity-details-back-link">
        <ArrowLeft size={16} />
        Back to activities
      </Link>

      {loading ? (
        <p className="hint-text">Loading activity details...</p>
      ) : null}
      {error ? <Alert variant="destructive">{error}</Alert> : null}

      {activity ? (
        <>
          <Card className="activity-details-card">
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
              <CardDescription>
                Overview of your selected workout session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="activity-summary-grid">
                <article className="activity-summary-item">
                  <Dumbbell size={18} />
                  <div>
                    <span>Type</span>
                    <strong>{activity.type.replace("_", " ")}</strong>
                  </div>
                </article>

                <article className="activity-summary-item">
                  <Timer size={18} />
                  <div>
                    <span>Duration</span>
                    <strong>{activity.duration} min</strong>
                  </div>
                </article>

                <article className="activity-summary-item">
                  <Flame size={18} />
                  <div>
                    <span>Calories</span>
                    <strong>{activity.caloriesBurned} kcal</strong>
                  </div>
                </article>

                <article className="activity-summary-item">
                  <CalendarClock size={18} />
                  <div>
                    <span>Start Time</span>
                    <strong>
                      {new Date(activity.startTime).toLocaleString()}
                    </strong>
                  </div>
                </article>

                <article className="activity-summary-item">
                  <Calendar size={18} />
                  <div>
                    <span>Created</span>
                    <strong>
                      {new Date(activity.createdAt).toLocaleString()}
                    </strong>
                  </div>
                </article>

                <article className="activity-summary-item">
                  <Calendar size={18} />
                  <div>
                    <span>Updated</span>
                    <strong>
                      {new Date(activity.updatedAt).toLocaleString()}
                    </strong>
                  </div>
                </article>
              </div>
            </CardContent>
          </Card>

          <Card className="activity-ai-card">
            <CardHeader>
              <CardTitle className="activity-ai-title">
                <Sparkles size={18} />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Personalized guidance generated for this specific activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
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

              <div className="activity-ai-list">
                {recommendations.map((recommendation) => (
                  <article key={recommendation.id} className="activity-ai-item">
                    <header className="activity-ai-item-header">
                      <h4>{recommendation.activityType}</h4>
                    </header>

                    <p className="activity-ai-main-text">
                      {recommendation.recommendation}
                    </p>

                    <section className="activity-ai-section">
                      <h5>
                        <TrendingUp size={14} />
                        Improvements
                      </h5>
                      <ul>
                        {recommendation.improvements?.map((item) => (
                          <li key={`${recommendation.id}-improvement-${item}`}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="activity-ai-section">
                      <h5>
                        <Lightbulb size={14} />
                        Suggestions
                      </h5>
                      <ul>
                        {recommendation.suggestions?.map((item) => (
                          <li key={`${recommendation.id}-suggestion-${item}`}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="activity-ai-section">
                      <h5>
                        <ShieldCheck size={14} />
                        Safety
                      </h5>
                      <ul>
                        {recommendation.safety?.map((item) => (
                          <li key={`${recommendation.id}-safety-${item}`}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

export default ActivityDetails;
