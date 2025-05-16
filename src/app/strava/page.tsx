"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function StravaActivitySelector() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  // Check if we have an access token (basic connection check)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      exchangeToken(code);
    } else if (localStorage.getItem("strava_access_token")) {
      setIsConnected(true);
      fetchActivities();
    }
  }, []);

  const connectToStrava = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/strava`;
    const scope = "activity:read";
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=auto&scope=${scope}`;

    window.location.href = stravaAuthUrl;
  };

  const exchangeToken = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/strava-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with Strava");
      }

      const data = await response.json();
      localStorage.setItem("strava_access_token", data.access_token);
      localStorage.setItem("strava_refresh_token", data.refresh_token);
      setIsConnected(true);
      fetchActivities();

      // Clean up URL
      router.replace("/strava");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("strava_access_token");
      if (!token) {
        throw new Error("Not authenticated with Strava");
      }

      const response = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=30", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to refresh token if it's expired
        if (response.status === 401) {
          await refreshToken();
          return fetchActivities();
        }
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("strava_refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("/api/strava-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    localStorage.setItem("strava_access_token", data.access_token);
    localStorage.setItem("strava_refresh_token", data.refresh_token);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBackgroundImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !backgroundImage) {
      setError("Please select an activity and upload a background image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("strava_access_token");
      if (!token) {
        throw new Error("Not authenticated with Strava");
      }

      const formData = new FormData();
      formData.append("activityId", selectedActivity);
      formData.append("image", backgroundImage);

      const response = await fetch("/api/process-strava-gpx", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const blob = await response.blob();
      const image = URL.createObjectURL(blob);

      setResultImage(image);

      if (downloadRef.current) {
        downloadRef.current.href = image;
        downloadRef.current.download = "gpx-track.png";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-gray-900 p-6 shadow-sm sm:p-8">
          {!isConnected ? (
            <div className="text-center">
              <button
                onClick={connectToStrava}
                disabled={loading}
                className="inline-flex items-center rounded-md border border-transparent bg-orange-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Connect with Strava
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Activities List */}
              <div>
                <label className="mb-2 block text-base font-medium text-gray-200">
                  Select Activity
                </label>
                <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-800">
                  {activities.length === 0 ? (
                    <div className="p-4 text-center text-gray-200">
                      {loading ? "Loading activities..." : "No activities found"}
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {activities.map((activity) => (
                        <li
                          key={activity.id}
                          className="animation-all p-4 duration-500 hover:bg-gray-700 active:bg-lime-500"
                        >
                          <label className="flex cursor-pointer items-center">
                            <input
                              type="radio"
                              name="activity"
                              value={activity.id}
                              checked={selectedActivity === String(activity.id)}
                              onChange={() => setSelectedActivity(String(activity.id))}
                              className="h-4 w-4 text-lime-600 accent-lime-500 hover:cursor-pointer focus:ring-lime-50"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-200">{activity.name}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(activity.start_date).toLocaleString()} • {activity.type} •{" "}
                                {(Math.floor(activity.distance / 10) / 100).toFixed(2)} km
                              </p>
                            </div>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Background Image Upload */}
              <div>
                <label className="mb-2 block text-base font-medium text-gray-200">
                  Upload Image
                </label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-gray-700 px-6 py-10 text-center hover:border-gray-500">
                  <div className="space-y-2">
                    <svg
                      className="mx-auto h-10 w-10 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      />
                    </svg>
                    <div className="flex justify-center text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer rounded-md font-medium text-lime-600 focus-within:outline-none hover:text-lime-500"
                      >
                        <span>Upload an image</span>
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleImageChange}
                          className="sr-only"
                          disabled={loading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-200">
                      {backgroundImage?.name || "No file selected"}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedActivity || !backgroundImage}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-lime-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto sm:text-sm"
              >
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Generate Image"
                )}
              </button>
            </form>
          )}
        </div>

        {resultImage && (
          <div className="mt-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-100">Result</h2>
            <div className="rounded-lg border border-lime-400 bg-gray-900 p-4">
              <img
                src={resultImage}
                alt=""
                className="mx-auto max-h-96 max-w-full border object-contain"
              />
            </div>
            <a
              ref={downloadRef}
              className="inline-flex items-center rounded-md border border-transparent bg-lime-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:cursor-pointer hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
