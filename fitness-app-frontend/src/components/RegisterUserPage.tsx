import { useState } from "react";
import { Link } from "react-router";
import { registerUser } from "../api/fitnessApi";
import type { RegisterRequest, UserProfile } from "../types/fitness";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

function RegisterUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [createdProfile, setCreatedProfile] = useState<UserProfile | null>(
    null,
  );

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const onChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setStatus(null);
    setCreatedProfile(null);

    const payload: RegisterRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    try {
      const profile = await registerUser(payload);
      setCreatedProfile(profile);
      setStatus(
        "Account created successfully! You can now log in with your credentials.",
      );
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-split-layout">
      <aside className="register-side-panel">
        <h2>Get Started</h2>
        <p>Already have an account?</p>
        <Link to="/activities" className="register-side-link">
          Log in
        </Link>
      </aside>

      <section className="register-form-panel">
        <h3>Create Account</h3>

        {status ? <Alert className="alert-success">{status}</Alert> : null}
        {error ? <Alert variant="destructive">{error}</Alert> : null}

        <form className="register-form" onSubmit={onSubmit}>
          <label className="register-field">
            <span className="register-field-label">First Name</span>
            <Input
              value={form.firstName}
              onChange={(event) => onChange("firstName", event.target.value)}
              placeholder="Enter first name"
              required
            />
          </label>

          <label className="register-field">
            <span className="register-field-label">Last Name</span>
            <Input
              value={form.lastName}
              onChange={(event) => onChange("lastName", event.target.value)}
              placeholder="Enter last name"
              required
            />
          </label>

          <label className="register-field">
            <span className="register-field-label">Email</span>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="Enter email"
              required
            />
          </label>

          <label className="register-field">
            <span className="register-field-label">Password</span>
            <Input
              type="password"
              value={form.password}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="Enter password"
              minLength={6}
              required
            />
          </label>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="register-submit-btn"
          >
            {isSubmitting ? "Creating user..." : "Sign Up"}
          </Button>
        </form>

        {createdProfile ? (
          <div className="register-result-card">
            <p>
              <strong>Account Created!</strong>
            </p>
            <p>
              Email: <strong>{createdProfile.email}</strong>
            </p>
            <p className="register-result-hint">
              Please log in with Keycloak to complete your profile setup and
              activate your account.
            </p>
            <Link to="/" className="list-link-action">
              Proceed to Login
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default RegisterUserPage;
