"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = searchParams.get('image');
    if (url) {
      setImageUrl(decodeURIComponent(url));
    }
  }, [searchParams]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'gpx-track.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-zinc-950 to-zinc-800">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-zinc-300 p-6 shadow-sm sm:p-8">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">Your Activity Visualization</h1>
          
          {imageUrl ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <img
                  src={imageUrl}
                  alt="GPX track on background"
                  className="mx-auto max-h-96 max-w-full object-contain"
                />
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Download Image
              </button>
            </div>
          ) : (
            <p className="text-gray-700">No image to display</p>
          )}
        </div>
      </div>
    </div>
  );
}