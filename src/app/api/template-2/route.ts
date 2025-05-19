import { NextResponse } from "next/server";
import { Jimp } from "jimp";
import { formatTime } from "@/utils/formatTime";
import { transformGpxData } from "@/utils/gpx/transformGpxData";
import { cleanDataText } from "@/utils/templates/template2/cleanDataText";
import { drawGpxShapeSmall } from "@/utils/templates/template2/drawGpxShapeSmall";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const backgroundImage = formData.get("image") as File;
    const stravaActivityId = formData.get("activityId");

    if (!backgroundImage || !stravaActivityId) {
      return NextResponse.json({ error: "Missing required field." }, { status: 400 });
    }

    const accessToken = request.headers.get("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated with Strava" }, { status: 401 });
    }

    // Fetch activity data from Strava
    const activityResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${stravaActivityId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    // Fetch GPS data from Strava
    const streamsResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${stravaActivityId}/streams?keys=latlng,altitude`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!streamsResponse.ok || !activityResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from Strava" },
        { status: streamsResponse.status }
      );
    }

    const streams = await streamsResponse.json();
    const activityData = await activityResponse.json();

    const points = transformGpxData(streams);

    const distance = activityData.distance;
    const elevationGain = activityData.total_elevation_gain;
    const movingTime = activityData.moving_time;

    const distanceFormatted = (Math.floor(distance / 10) / 100).toFixed(2);
    const elevationMeters = Math.floor(parseFloat(elevationGain.toString()));
    const timeSeconds = parseFloat(movingTime.toString());
    const totalTime = formatTime(timeSeconds);

    const paceMinPerKm = timeSeconds / 60 / (parseFloat(distanceFormatted) || 1);
    const paceFormatted = `Pace: ${Math.floor(paceMinPerKm)}:${Math.round((paceMinPerKm % 1) * 60)
      .toString()
      .padStart(2, "0")} min/km`;
    const elevationFormatted = `Elevation: ${elevationMeters} m`;
    const totalTimeFormatted = `Time: ${totalTime}`;

    const imageBuffer = await backgroundImage.arrayBuffer();
    const image = await Jimp.read(Buffer.from(imageBuffer));
    image.cover({ w: 1800, h: 2400 });

    drawGpxShapeSmall(image, points);

    const buffer = await cleanDataText({
      image,
      distance: distanceFormatted,
      pace: paceFormatted,
      time: totalTimeFormatted,
      elevation: elevationFormatted,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="activity-track.png"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
