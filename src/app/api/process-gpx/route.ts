import { NextResponse } from "next/server";
import gpxParser from "gpxparser";
import { Jimp } from "jimp";
import fs from "fs";
import { createCanvas, loadImage, registerFont } from "canvas";

export const dynamic = "force-dynamic"; // Ensure this route is dynamic

export async function POST(request: Request) {
  const gpx = new gpxParser();

  try {
    const formData = await request.formData();
    const gpxFile = formData.get("gpx") as File;
    const backgroundImage = formData.get("image") as File;

    if (!gpxFile || !backgroundImage) {
      return NextResponse.json({ error: "Both GPX file and image are required" }, { status: 400 });
    }

    // Process GPX file
    const gpxText = await gpxFile.text();
    gpx.parse(gpxText);

    let movingTime = 0;
    let movingDistance = 0;
    let elevationGain = 0;

    const minSpeed = 0.87; // m/s
    for (let i = 1; i < gpx.tracks[0].points.length; i++) {
      const timeDiff =
        (new Date(gpx.tracks[0].points[i].time).getTime() -
          new Date(gpx.tracks[0].points[i - 1].time).getTime()) /
        1000; // in seconds

      // Calculate distance between points (using haversine formula)
      const dist = haversineDistance(
        gpx.tracks[0].points[i - 1].lat,
        gpx.tracks[0].points[i - 1].lon,
        gpx.tracks[0].points[i].lat,
        gpx.tracks[0].points[i].lon
      );
      // Calculate speed in km/h
      const speed = dist / timeDiff;
      if (speed > minSpeed) {
        movingTime += timeDiff;
        movingDistance += dist;

        const eleDiff = gpx.tracks[0].points[i].ele - gpx.tracks[0].points[i - 1].ele;
        if (eleDiff > 0) {
          elevationGain += eleDiff; // Only count positive elevation changes
        }
      }
    }

    // Calculate pace (minutes per km)
    const paceMinPerKm = movingTime / 60 / (movingDistance / 1000);

    const startDate = new Date(gpx.tracks[0].points[0].time);
    const formattedDate = startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const distanceKm = (movingDistance / 1000).toFixed(2);
    const distanceText = `${distanceKm}`;
    const paceText = `Pace: ${Math.floor(paceMinPerKm)}:${Math.floor((paceMinPerKm % 1) * 60)
      .toString()
      .padStart(2, "0")} min/km`;
    const elevationText = `Elevation: ${Math.floor(elevationGain)} m`;

    if (!gpx.tracks.length || !gpx.tracks[0].points.length) {
      return NextResponse.json({ error: "No track points found in GPX file" }, { status: 400 });
    }

    // Process background image
    const tempImagePath = `./${backgroundImage.name}`;
    const imageBuffer = await backgroundImage.arrayBuffer();
    await fs.promises.writeFile(tempImagePath, Buffer.from(imageBuffer));

    // Load image with JIMP
    const image = await Jimp.read(tempImagePath);

    // Convert to black and white
    image.greyscale().contrast(0.3).brightness(0.6);

    image.cover({ w: 900, h: 1200 });

    // Get image dimensions
    const { width, height } = image.bitmap;

    // Calculate bounds of GPX track
    const points = gpx.tracks[0].points;
    let minLat = points[0].lat;
    let maxLat = points[0].lat;
    let minLon = points[0].lon;
    let maxLon = points[0].lon;

    points.forEach((point) => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLon = Math.min(minLon, point.lon);
      maxLon = Math.max(maxLon, point.lon);
    });

    const project = (lat: number, lon: number) => {
      // Calculate bounds with padding
      const paddedMinLon = minLon - (maxLon - minLon) * 0.1;
      const paddedMaxLon = maxLon + (maxLon - minLon) * 0.1;
      const paddedMinLat = minLat - (maxLat - minLat) * 0.1;
      const paddedMaxLat = maxLat + (maxLat - minLat) * 0.1;

      // Calculate the GPX track's dimensions and aspect ratio
      const gpxWidth = paddedMaxLon - paddedMinLon;
      const gpxHeight = paddedMaxLat - paddedMinLat;

      // Calculate scaling factors for both dimensions
      const widthScale = width / gpxWidth;
      const heightScale = height / gpxHeight;

      // Use the most constrained scale to maintain aspect ratio
      const scale = Math.min(widthScale, heightScale);

      // Calculate offsets to center the track
      const offsetX = (width - gpxWidth * scale) / 2;
      const offsetY = (height - gpxHeight * scale) / 2;

      // Convert coordinates
      const x = (lon - paddedMinLon) * scale + offsetX;
      const y = height - ((lat - paddedMinLat) * scale + offsetY); // Flip Y-axis

      return { x, y };
    };

    // Draw the GPX track
    const lineWidth = 3; // Thicker line for better visibility

    for (let i = 0; i < points.length - 1; i++) {
      const start = project(points[i].lat, points[i].lon);
      const end = project(points[i + 1].lat, points[i + 1].lon);

      // Draw a thicker line by scanning a wider area
      image.scan(
        Math.max(0, Math.min(start.x, end.x) - lineWidth),
        Math.max(0, Math.min(start.y, end.y) - lineWidth),
        Math.min(width, Math.abs(end.x - start.x) + lineWidth * 2),
        Math.min(height, Math.abs(end.y - start.y) + lineWidth * 2),
        function (x, y, idx) {
          const distanceToLine = distancePointToLine(x, y, start.x, start.y, end.x, end.y);
          if (distanceToLine < lineWidth) {
            //@ts-ignore
            this.bitmap.data[idx + 0] = 255; // R
            //@ts-ignore
            this.bitmap.data[idx + 1] = 255; // G
            //@ts-ignore
            this.bitmap.data[idx + 2] = 255; // B
            // Alpha remains the same
          }
        }
      );
    }

    const imageBuffer2 = await image.getBuffer("image/png");

    const canvas = createCanvas(900, 1200);
    const ctx = canvas.getContext("2d");

    const bgImg = await loadImage(Buffer.from(imageBuffer2));
    ctx.drawImage(bgImg, 0, 0, 900, 1200);

    registerFont("public/fonts/handdrawn2.ttf", {
      family: "Hand",
      weight: "normal",
      style: "normal",
    });

    ctx.font = "110px Hand";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.fillText(distanceText, 100, 800);

    ctx.font = "90px Hand";
    ctx.fillText("km", 200, 920);

    ctx.font = "60px Hand";
    ctx.fillText(formattedDate, 450, 1050);

    ctx.font = "32px Arial";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.fillText(paceText, 10, 10);
    ctx.fillText(elevationText, 10, 50);

    const buffer = canvas.toBuffer("image/png");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="gpx-track.png"`,
      },
    });
  } catch (error) {
    console.error("Error processing GPX:", error);
    return NextResponse.json({ error: "Failed to process GPX and image" }, { status: 500 });
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Helper function to calculate distance from point to line segment
function distancePointToLine(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
