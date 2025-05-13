export function transformGpxData(streams: any) {
  const latlngStream = streams.find((s: any) => s.type === "latlng");
  const altitudeStream = streams.find((s: any) => s.type === "altitude");
  const timeStream = streams.find((s: any) => s.type === "time");

  const points = latlngStream.data.map((coords: [number, number], i: number) => ({
    lat: coords[0],
    lon: coords[1],
    ele: altitudeStream?.data?.[i] || null,
    time: timeStream?.data?.[i] ? new Date(timeStream.data[i] * 1000).toISOString() : null,
  }));

  return points;
}
