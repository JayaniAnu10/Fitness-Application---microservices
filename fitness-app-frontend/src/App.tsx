import { useContext, useEffect } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router";
import { logout, setCredentials } from "./store/authSlice";
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import ActivityDetails from "./components/ActivityDetails";
import RecommendationList from "./components/RecommendationList";
import UserProfilePage from "./components/UserProfilePage";
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
      <NavLink to="/recommendations" className="nav-pill">
        AI Insights
      </NavLink>
      <NavLink to="/profile" className="nav-pill">
        Profile
      </NavLink>
      <Button variant="outline" onClick={onLogout}>
        Logout
      </Button>
    </nav>
  </header>
);

const ActivitiesPage = () => (
  <section className="content-grid">
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

  return (
    <Router>
      {!token ? (
        <main className="login-state">
          <Card className="login-hero">
            <CardContent>
              <p className="brand-kicker">Train Smart. Recover Better.</p>
              {loginInProgress ? (
                <CardTitle>Completing login, please wait...</CardTitle>
              ) : (
                <>
                  <CardTitle className="hero-title">
                    Fitness activity, AI guidance, and profile tracking in one
                    place
                  </CardTitle>
                  <CardDescription className="hero-copy">
                    Sign in with Keycloak to add activities, generate
                    recommendations, and manage your user registration profile.
                  </CardDescription>
                  {error ? <Alert variant="destructive">{error}</Alert> : null}
                  <div className="hero-actions">
                    <Button
                      onClick={() => beginLoginFlow("/activities")}
                      size="lg"
                    >
                      Login with Keycloak
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => beginLoginFlow("/register")}
                      size="lg"
                    >
                      Register Profile
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      ) : (
        <main className="app-shell">
          <AppHeader onLogout={handleLogout} />
          <section className="page-frame">
            <Routes>
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/activities/:id" element={<ActivityDetails />} />
              <Route path="/recommendations" element={<RecommendationList />} />
              <Route
                path="/register"
                element={<UserProfilePage mode="register" />}
              />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route
                path="/"
                element={<Navigate to={getPostLoginRoute()} replace />}
              />
            </Routes>
          </section>
        </main>
      )}
    </Router>
  );
}

export default App;
