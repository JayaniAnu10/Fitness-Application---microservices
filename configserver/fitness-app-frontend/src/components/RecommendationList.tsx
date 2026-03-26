import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { getRecommendationsByUser } from "../api/fitnessApi";
import type { Recommendation } from "../types/fitness";
import { Alert } from "./ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

function RecommendationList() {
  const { token, tokenData } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
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

    const fetchRecommendations = async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getRecommendationsByUser(userId, token);
        if (mounted) {
          setRecommendations(data);
        }
      } catch (err) {
        if (mounted) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch recommendations";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      mounted = false;
    };
  }, [token, userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Recommendations</CardTitle>
        <CardDescription className="hint-text">
          Recommendations are generated from your activities via the AI service.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="hint-text">Loading recommendations...</p>
        ) : null}
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {!loading && !error && recommendations.length === 0 ? (
          <div className="empty-state">
            <h3>No recommendations yet</h3>
            <p>
              Add activities first, then refresh this page in a few seconds for
              AI guidance.
            </p>
          </div>
        ) : null}

        <div className="recommendation-list">
          {recommendations.map((recommendation) => (
            <article key={recommendation.id} className="recommendation-card">
              <h3>{recommendation.activityType}</h3>
              <p>{recommendation.recommendation}</p>

              <h4>Improvements</h4>
              <ul>
                {recommendation.improvements?.map((item) => (
                  <li key={`${recommendation.id}-improvement-${item}`}>
                    {item}
                  </li>
                ))}
              </ul>

              <h4>Suggestions</h4>
              <ul>
                {recommendation.suggestions?.map((item) => (
                  <li key={`${recommendation.id}-suggestion-${item}`}>
                    {item}
                  </li>
                ))}
              </ul>

              <h4>Safety</h4>
              <ul>
                {recommendation.safety?.map((item) => (
                  <li key={`${recommendation.id}-safety-${item}`}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecommendationList;
