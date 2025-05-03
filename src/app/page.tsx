import Image from "next/image";
import Link from "next/link";

export default async function IndexPage() {
  const imgs = ["/gpx-track2.png", "/gpx-track3.png", "/gpx-track4.png"];

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-zinc-950 to-zinc-800 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="md:w-1/2">
              <h1 className="mb-6 text-5xl font-bold">
                Transform Your Adventures <span className="text-lime-400">into Art</span>
              </h1>
              <p className="mb-8 text-xl text-white opacity-80">
                Upload your GPX files and create stunning visualizations. Perfect for runners,
                cyclists, and outdoor enthusiasts.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link href="/upload">
                  <button className="rounded-md bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-lime-600 hover:text-white">
                    Create Your First Visualization
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-2xl md:w-1/2">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-full w-full">
                  <Image alt="" src="/gpx-track2.png" fill objectFit="cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Create Stunning Activity Visuals
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Multiple styles to showcase your adventures
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: "Minimalist Route",
                description: "Clean, simple lines showing just your path",
                style: "bg-gradient-to-br from-gray-50 to-gray-100",
              },
              {
                title: "Topographic Style",
                description: "Elevation-aware with terrain contours",
                style: "bg-gradient-to-br from-lime-50 to-green-100",
              },
              {
                title: "Night Mode",
                description: "Dark background with glowing route",
                style: "bg-gradient-to-br from-gray-900 to-gray-800 text-white",
              },
            ].map((feature) => (
              <div key={feature.title} className={`rounded-xl p-8 ${feature.style}`}>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="examples" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Inspiration for Your Next Creation
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              See what others have made with their activity data
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="overflow-hidden rounded-xl shadow-md">
                <div className="relative aspect-square bg-gradient-to-tr from-gray-100 to-gray-300">
                  <Image alt="" src={imgs[item - 1]} fill objectFit="cover" />
                </div>
                <div className="bg-white p-4">
                  <h3 className="font-medium">Morning Run • {item}0km</h3>
                  <p className="text-sm text-gray-500">By @user{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-zinc-950 to-zinc-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-6 text-3xl font-bold">
              Ready to Visualize <span className="text-lime-400">Your Adventures?</span>
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-xl opacity-80">
              Upload your GPX file and create beautiful posters in seconds.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/upload">
                <button className="rounded-md bg-white px-8 py-4 font-medium text-black transition-colors hover:bg-gray-100">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
