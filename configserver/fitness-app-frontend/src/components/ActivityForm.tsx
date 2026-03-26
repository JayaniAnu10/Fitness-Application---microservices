import { useContext, useMemo, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { addActivity } from "../api/fitnessApi";
import type { ActivityRequest, ActivityType } from "../types/fitness";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
    <Card>
      <CardHeader>
        <CardTitle>Add Activity</CardTitle>
        <CardDescription>
          Capture your workout details to feed analytics and AI recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="activity-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-field-label">Activity Type</span>
            <Select
              value={form.type}
              onValueChange={(value) => {
                if (value) {
                  onChange("type", value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an activity type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <div className="activity-form-row">
            <label className="form-field">
              <span className="form-field-label">Duration (minutes)</span>
              <Input
                type="number"
                min={1}
                value={form.duration}
                onChange={(event) => onChange("duration", event.target.value)}
                required
              />
            </label>

            <label className="form-field">
              <span className="form-field-label">Calories Burned</span>
              <Input
                type="number"
                min={0}
                value={form.caloriesBurned}
                onChange={(event) =>
                  onChange("caloriesBurned", event.target.value)
                }
                required
              />
            </label>
          </div>

          <label className="form-field">
            <span className="form-field-label">Start Time</span>
            <Input
              type="datetime-local"
              value={form.startTime}
              onChange={(event) => onChange("startTime", event.target.value)}
              required
            />
          </label>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="activity-submit-btn"
          >
            {isSubmitting ? "Saving..." : "Save Activity"}
          </Button>
        </form>

        <div className="message-stack">
          {statusMessage ? (
            <Alert className="alert-success">{statusMessage}</Alert>
          ) : null}
          {errorMessage ? (
            <Alert variant="destructive">{errorMessage}</Alert>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityForm;
