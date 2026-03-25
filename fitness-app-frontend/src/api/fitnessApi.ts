import type {
  ActivityRequest,
  ActivityResponse,
  RegisterRequest,
  Recommendation,
  UserProfile,
} from "../types/fitness";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function fetchJson<T>(
  path: string,
  options: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const bodyText = await response.text();
    const message = bodyText || fallbackMessage;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function addActivity(
  payload: ActivityRequest,
  token: string,
): Promise<ActivityResponse> {
  return fetchJson<ActivityResponse>(
    "/api/activities",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-User-ID": payload.userId,
      },
      body: JSON.stringify(payload),
    },
    "Failed to add activity",
  );
}

export async function getActivities(
  userId: string,
  token: string,
): Promise<ActivityResponse[]> {
  return fetchJson<ActivityResponse[]>(
    "/api/activities",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-ID": userId,
      },
    },
    "Failed to load activities",
  );
}

export async function getActivityById(
  activityId: string,
  token: string,
): Promise<ActivityResponse> {
  return fetchJson<ActivityResponse>(
    `/api/activities/${activityId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "Failed to load activity details",
  );
}

export async function getRecommendationsByUser(
  userId: string,
  token: string,
): Promise<Recommendation[]> {
  return fetchJson<Recommendation[]>(
    `/api/recommendations/user/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-ID": userId,
      },
    },
    "Failed to load recommendations",
  );
}

export async function getUserProfile(
  userId: string,
  token: string,
): Promise<UserProfile | null> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-User-ID": userId,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(bodyText || "Failed to load profile");
  }

  return (await response.json()) as UserProfile;
}

export async function registerUser(
  payload: RegisterRequest,
  token: string,
): Promise<UserProfile> {
  return fetchJson<UserProfile>(
    "/api/users/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-User-ID": payload.keyclockId,
      },
      body: JSON.stringify(payload),
    },
    "Failed to register user",
  );
}
