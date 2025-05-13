import { distancePointToLine } from "@/utils/gpx/distancePointToLine";

export function drawGpxShape(image: any, points: any) {
  const { width, height } = image.bitmap;

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLon = points[0].lon;
  let maxLon = points[0].lon;

  points.forEach((point: any) => {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLon = Math.min(minLon, point.lon);
    maxLon = Math.max(maxLon, point.lon);
  });

  // Projection function
  const project = (lat: number, lon: number) => {
    const paddedMinLon = minLon - (maxLon - minLon) * 0.1;
    const paddedMaxLon = maxLon + (maxLon - minLon) * 0.1;
    const paddedMinLat = minLat - (maxLat - minLat) * 0.1;
    const paddedMaxLat = maxLat + (maxLat - minLat) * 0.1;

    const gpxWidth = paddedMaxLon - paddedMinLon;
    const gpxHeight = paddedMaxLat - paddedMinLat;
    const scale = Math.min(width / gpxWidth, height / gpxHeight);
    const offsetX = (width - gpxWidth * scale) / 2;
    const offsetY = (height - gpxHeight * scale) / 2;

    return {
      x: (lon - paddedMinLon) * scale + offsetX,
      y: height - ((lat - paddedMinLat) * scale + offsetY),
    };
  };

  const lineWidth = 6;

  for (let i = 0; i < points.length - 1; i++) {
    const start = project(points[i].lat, points[i].lon);
    const end = project(points[i + 1].lat, points[i + 1].lon);

    image.scan(
      Math.max(0, Math.min(start.x, end.x) - lineWidth),
      Math.max(0, Math.min(start.y, end.y) - lineWidth),
      Math.min(width, Math.abs(end.x - start.x) + lineWidth * 2),
      Math.min(height, Math.abs(end.y - start.y) + lineWidth * 2),
      function (x: number, y: number, idx: number) {
        const distanceToLine = distancePointToLine(x, y, start.x, start.y, end.x, end.y);
        if (distanceToLine < lineWidth) {
          //@ts-expect-error 'this' implicitly has type 'any'
          this.bitmap.data[idx + 0] = 255;
          //@ts-expect-error 'this' implicitly has type 'any'
          this.bitmap.data[idx + 1] = 255;
          //@ts-expect-error 'this' implicitly has type 'any'
          this.bitmap.data[idx + 2] = 255;
        }
      }
    );
  }

  return image;
}
