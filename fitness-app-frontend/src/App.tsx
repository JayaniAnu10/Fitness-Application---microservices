import Button from "@mui/material/Button";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router";
import { logout, setCredentials } from "./store/authSlice";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import ActivityDetails from "./components/ActivityDetails";
import RecommendationList from "./components/RecommendationList";
import UserProfilePage from "./components/UserProfilePage";

const AppHeader = ({ onLogout }: { onLogout: () => void }) => (
  <header className="app-header">
    <h1>Fitness Tracker</h1>
    <nav className="app-nav">
      <Link to="/activities">Activities</Link>
      <Link to="/recommendations">AI Recommendations</Link>
      <Link to="/profile">Profile</Link>
      <Button variant="outlined" color="secondary" onClick={onLogout}>
        Logout
      </Button>
    </nav>
  </header>
);

const ActivitiesPage = () => (
  <Box component="section" className="content-grid">
    <ActivityForm />
    <ActivityList />
  </Box>
);

function App() {
  const { token, tokenData, logIn, logOut, loginInProgress, error } =
    useContext(AuthContext);
  const dispatch = useDispatch();

  const userId = useMemo(() => {
    if (!tokenData) {
      return null;
    }
    return (
      tokenData.sub ?? tokenData.userId ?? tokenData.preferred_username ?? null
    );
  }, [tokenData]);

  useEffect(() => {
    if (token) {
      dispatch(setCredentials({ token, user: tokenData }));
    }
  }, [token, tokenData, dispatch]);

  useEffect(() => {
    if (!token && !loginInProgress) {
      logIn();
    }
  }, [token, loginInProgress, logIn]);

  const handleLogout = () => {
    dispatch(logout());
    logOut();
  };

  return (
    <Router>
      {!token ? (
        <main className="login-state">
          <Typography variant="h5" component="h2">
            Redirecting to Keycloak login...
          </Typography>
          {error ? <p className="error-text">{error}</p> : null}
          <Button variant="contained" onClick={() => logIn()}>
            Login Now
          </Button>
        </main>
      ) : (
        <main className="app-shell">
          <AppHeader onLogout={handleLogout} />
          <Stack spacing={2} className="user-chip-wrap">
            <Typography variant="body2">
              Signed in as: {userId ?? "Unknown user"}
            </Typography>
          </Stack>
          <Routes>
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityDetails />} />
            <Route path="/recommendations" element={<RecommendationList />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/" element={<Navigate to="/activities" replace />} />
          </Routes>
        </main>
      )}
    </Router>
  );
}

export default App;
