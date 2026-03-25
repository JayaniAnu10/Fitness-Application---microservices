import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { getUserProfile, registerUser } from "../api/fitnessApi";
import type { RegisterRequest, UserProfile } from "../types/fitness";
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

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type UserProfilePageProps = {
  mode?: "profile" | "register";
};

function UserProfilePage({ mode = "profile" }: UserProfilePageProps) {
  const { token, tokenData } = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const keyclockId = useMemo(() => {
    if (!tokenData) {
      return "";
    }
    return (
      tokenData.sub ?? tokenData.userId ?? tokenData.preferred_username ?? ""
    );
  }, [tokenData]);

  const [form, setForm] = useState<FormState>({
    firstName: tokenData?.given_name ?? "",
    lastName: tokenData?.family_name ?? "",
    email: tokenData?.email ?? "",
    password: "123456",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      firstName: tokenData?.given_name ?? prev.firstName,
      lastName: tokenData?.family_name ?? prev.lastName,
      email: tokenData?.email ?? prev.email,
    }));
  }, [tokenData]);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      if (!token || !keyclockId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getUserProfile(keyclockId, token);
        if (!mounted) {
          return;
        }
        setProfile(data);
      } catch (err) {
        if (mounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load profile";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [token, keyclockId]);

  const onChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !keyclockId) {
      setError("Missing authentication token or user id.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    const payload: RegisterRequest = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      keyclockId,
    };

    try {
      const data = await registerUser(payload, token);
      setProfile(data);
      setStatus("Profile registered successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "register" ? "Register User" : "User Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="profile-card">
      <CardHeader>
        <CardTitle>
          {mode === "register" ? "User Registration" : "User Profile"}
        </CardTitle>
        <CardDescription className="hint-text">
          {mode === "register"
            ? "Create your userservice profile to sync identity details and unlock activity tracking."
            : "View your registered userservice profile details and identity mapping."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {status ? <Alert className="alert-success">{status}</Alert> : null}

        {profile && mode === "profile" ? (
          <div className="profile-grid">
            <p>
              <strong>First name:</strong> {profile.firstName}
            </p>
            <p>
              <strong>Last name:</strong> {profile.lastName}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Keycloak ID:</strong> {profile.keyclockId}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(profile.createdDate).toLocaleString()}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {new Date(profile.updatedDate).toLocaleString()}
            </p>
          </div>
        ) : (
          <form className="profile-form" onSubmit={onSubmit}>
            {profile ? (
              <p className="hint-text">
                A profile already exists for this user. Submit again only if you
                need to re-register.
              </p>
            ) : (
              <p className="hint-text">
                No userservice profile found for your account. Complete
                registration below.
              </p>
            )}

            <label className="form-field">
              First Name
              <Input
                value={form.firstName}
                onChange={(event) => onChange("firstName", event.target.value)}
                required
              />
            </label>

            <label className="form-field">
              Last Name
              <Input
                value={form.lastName}
                onChange={(event) => onChange("lastName", event.target.value)}
                required
              />
            </label>

            <label className="form-field">
              Email
              <Input
                type="email"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                required
              />
            </label>

            <label className="form-field">
              Password (userservice profile)
              <Input
                type="password"
                value={form.password}
                onChange={(event) => onChange("password", event.target.value)}
                minLength={6}
                required
              />
            </label>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Profile"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default UserProfilePage;
