import { useContext, useEffect } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router";
import { logout, setCredentials } from "./store/authSlice";
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import ActivityDetails from "./components/ActivityDetails";
import RegisterUserPage from "./components/RegisterUserPage";
import UserProfilePage from "./components/UserProfilePage";
import loginHeroImage from "./assets/image.svg";
import { Alert } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "./components/ui/card";

const AppHeader = ({ onLogout }: { onLogout: () => void }) => (
  <header className="app-header">
    <div>
      <p className="brand-kicker">Personal Fitness Intelligence</p>
      <h1>FitTrack Studio</h1>
    </div>
    <nav className="app-nav">
      <NavLink to="/activities" className="nav-pill">
        Activities
      </NavLink>
      <NavLink to="/profile" className="nav-pill">
        Profile
      </NavLink>
      <Button variant="outline" className="logout-button" onClick={onLogout}>
        Logout
      </Button>
    </nav>
  </header>
);

const ActivitiesPage = () => (
  <section className="content-grid activities-page">
    <ActivityForm />
    <ActivityList />
  </section>
);

function App() {
  const { token, tokenData, logIn, logOut, loginInProgress, error } =
    useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(setCredentials({ token, user: tokenData }));
    }
  }, [token, tokenData, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    logOut();
  };

  const beginLoginFlow = (nextRoute: "/activities" | "/register") => {
    window.sessionStorage.setItem("postLoginRoute", nextRoute);
    logIn();
  };

  const getPostLoginRoute = () => {
    const storedRoute = window.sessionStorage.getItem("postLoginRoute");
    if (storedRoute === "/register" || storedRoute === "/activities") {
      window.sessionStorage.removeItem("postLoginRoute");
      return storedRoute;
    }
    return "/activities";
  };

  const AuthenticatedApp = () => {
    const location = useLocation();
    const isRegisterPage = location.pathname === "/register";
    const isProfilePage = location.pathname === "/profile";

    return (
      <main className={isRegisterPage ? "register-route-shell" : "app-shell"}>
        {!isRegisterPage ? <AppHeader onLogout={handleLogout} /> : null}
        <section
          className={
            isRegisterPage
              ? "register-route-frame"
              : isProfilePage
                ? "page-frame page-frame--plain"
                : "page-frame"
          }
        >
          <Routes>
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityDetails />} />
            <Route
              path="/recommendations"
              element={<Navigate to="/activities" replace />}
            />
            <Route path="/register" element={<RegisterUserPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route
              path="/"
              element={<Navigate to={getPostLoginRoute()} replace />}
            />
          </Routes>
        </section>
      </main>
    );
  };

  const PublicApp = () => (
    <Routes>
      <Route
        path="/register"
        element={
          <main className="register-route-shell">
            <section className="register-route-frame">
              <RegisterUserPage />
            </section>
          </main>
        }
      />
      <Route
        path="*"
        element={
          <main className="login-state">
            <Card className="login-hero">
              <CardContent className="login-hero-content">
                <div className="login-layout">
                  <section className="login-visual" aria-hidden="true">
                    <div className="login-visual-overlay" />
                    <img
                      src={loginHeroImage}
                      alt=""
                      className="login-illustration"
                    />
                  </section>
                  <section className="login-panel">
                    <h2 className="login-brand">FitTrack</h2>
                    {loginInProgress ? (
                      <CardTitle>Completing login, please wait...</CardTitle>
                    ) : (
                      <>
                        <CardTitle className="hero-title">
                          Train smart. Stay strong.
                        </CardTitle>
                        <CardDescription className="hero-copy">
                          Track workouts, get AI insights, and keep your
                          progress in one place.
                        </CardDescription>
                        <div className="hero-metrics" aria-hidden="true">
                          <article className="hero-metric-card">
                            <span>Target</span>
                            <strong>5 sessions / week</strong>
                          </article>
                          <article className="hero-metric-card">
                            <span>Insights</span>
                            <strong>AI recommendations</strong>
                          </article>
                          <article className="hero-metric-card">
                            <span>Tracking</span>
                            <strong>Calories + duration</strong>
                          </article>
                        </div>
                        {error ? (
                          <Alert variant="destructive">{error}</Alert>
                        ) : null}
                        <div className="hero-actions">
                          <Button
                            onClick={() => beginLoginFlow("/activities")}
                            size="lg"
                            className="h-11 px-7 text-base"
                          >
                            Login
                          </Button>
                          <Link to="/register" className="hero-register-link">
                            <Button
                              variant="secondary"
                              size="lg"
                              className="h-11 px-7 text-base"
                            >
                              Register
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </CardContent>
            </Card>
          </main>
        }
      />
    </Routes>
  );

  return <Router>{token ? <AuthenticatedApp /> : <PublicApp />}</Router>;
}

export default App;
