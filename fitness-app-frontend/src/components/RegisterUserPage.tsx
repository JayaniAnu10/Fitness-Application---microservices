import { useContext, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { registerUser } from "../api/fitnessApi";
import type { RegisterRequest } from "../types/fitness";
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
  const { logIn } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const onChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onLoginClick = () => {
    window.sessionStorage.setItem("postLoginRoute", "/activities");
    logIn();
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    const payload: RegisterRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    try {
      await registerUser(payload);
      setStatus("Registration successful.");
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
        <button
          type="button"
          className="register-side-link"
          onClick={onLoginClick}
        >
          Log in
        </button>
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
      </section>
    </div>
  );
}

export default RegisterUserPage;
