"use client";
import { useState, useRef } from "react";

export default function GPXProcessor() {
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleGpxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setGpxFile(e.target.files[0]);
      console.log(e.target.files[0].name);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpxFile || !imageFile) {
      setError("Please upload both a GPX file and an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("gpx", gpxFile);
      formData.append("image", imageFile);

      const response = await fetch(`/api/process-gpx?t=${Date.now()}`, {
        method: "POST",
        body: formData,
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process files");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResultImage(imageUrl);

      // Set up download link
      if (downloadRef.current) {
        downloadRef.current.href = imageUrl;
        downloadRef.current.download = "gpx-track.png";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-zinc-950 to-zinc-800">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-zinc-300 p-6 shadow-sm sm:p-8">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">GPX Track Visualizer</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GPX File Upload */}
            <div>
              <label className="mb-2 block text-base font-medium text-gray-700">
                Upload GPX File
              </label>
              <div className="flex bg-zinc-200 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-6 py-10 text-center hover:border-gray-300">
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
                      htmlFor="gpx-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 focus-within:outline-none hover:text-blue-500"
                    >
                      <span>Upload a GPX file</span>
                      <input
                        id="gpx-upload"
                        name="gpx"
                        type="file"
                        accept=".gpx"
                        onChange={handleGpxChange}
                        className="sr-only"
                        disabled={loading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">{gpxFile?.name || "No file selected"}</p>
                </div>
              </div>
            </div>

            {/* Background Image Upload */}
            <div>
              <label className="mb-2 block text-base font-medium text-gray-700">
                Upload Background Image
              </label>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-zinc-200 px-6 py-10 text-center hover:border-gray-300">
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
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 focus-within:outline-none hover:text-blue-500"
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
                  <p className="text-xs text-gray-500">{imageFile?.name || "No file selected"}</p>
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
              disabled={loading || !gpxFile || !imageFile}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto sm:text-sm"
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

          {resultImage && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Result</h2>
              <div className="rounded-lg border border-gray-200 p-4">
                <img
                  src={resultImage}
                  alt="GPX track on background"
                  className="mx-auto max-h-96 max-w-full object-contain"
                />
              </div>
              <a
                ref={downloadRef}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Download Image
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
