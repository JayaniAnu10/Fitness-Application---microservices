import { useContext, useMemo, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { addActivity } from "../api/fitnessApi";
import type { ActivityRequest, ActivityType } from "../types/fitness";

const ACTIVITY_TYPES: ActivityType[] = [
  "RUNNING",
  "WALKING",
  "CYCLING",
  "SWIMMING",
  "WEIGHT_TRAINING",
  "YOGA",
  "HIT",
  "CARDIO",
  "STRETCHING",
  "OTHER",
];

type FormState = {
  type: ActivityType;
  duration: string;
  caloriesBurned: string;
  startTime: string;
};

const initialState: FormState = {
  type: "RUNNING",
  duration: "",
  caloriesBurned: "",
  startTime: new Date().toISOString().slice(0, 16),
};

function ActivityForm() {
  const { token, tokenData } = useContext(AuthContext);
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userId = useMemo(() => {
    if (!tokenData) {
      return "";
    }
    return (
      tokenData.sub ?? tokenData.userId ?? tokenData.preferred_username ?? ""
    );
  }, [tokenData]);

  const onChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !userId) {
      setErrorMessage("No authentication token or user ID available.");
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    const payload: ActivityRequest = {
      userId,
      type: form.type,
      duration: Number(form.duration),
      caloriesBurned: Number(form.caloriesBurned),
      startTime: new Date(form.startTime).toISOString(),
      additionalMetrics: {},
    };

    try {
      await addActivity(payload, token);
      setStatusMessage("Activity saved. Recommendations may appear shortly.");
      setForm((prev) => ({
        ...prev,
        duration: "",
        caloriesBurned: "",
      }));
      window.dispatchEvent(new Event("activities:reload"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save activity";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Add Activity</h2>
      <form className="activity-form" onSubmit={handleSubmit}>
        <label>
          Activity Type
          <select
            value={form.type}
            onChange={(event) => onChange("type", event.target.value)}
          >
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label>
          Duration (minutes)
          <input
            type="number"
            min={1}
            value={form.duration}
            onChange={(event) => onChange("duration", event.target.value)}
            required
          />
        </label>

        <label>
          Calories Burned
          <input
            type="number"
            min={0}
            value={form.caloriesBurned}
            onChange={(event) => onChange("caloriesBurned", event.target.value)}
            required
          />
        </label>

        <label>
          Start Time
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(event) => onChange("startTime", event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Activity"}
        </button>
      </form>

      {statusMessage ? <p className="status-text">{statusMessage}</p> : null}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
    </section>
  );
}

export default ActivityForm;
