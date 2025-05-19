import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

export async function cleanDataText({
  image,
  distance,
  pace,
  time,
  elevation,
}: {
  image: any;
  distance: string;
  pace: string;
  time: string;
  elevation: string;
}) {
  const imageBuffer2 = await image.getBuffer("image/png");
  const canvas = createCanvas(1800, 2400);
  const ctx = canvas.getContext("2d");

  const bgImg = await loadImage(Buffer.from(imageBuffer2));
  ctx.drawImage(bgImg, 0, 0, 1800, 2400);

  registerFont(path.join(process.cwd(), "public/fonts/Arial.ttf"), {
    family: "Arial",
  });
  registerFont(path.join(process.cwd(), "public/fonts/ArialBold.ttf"), {
    family: "ArialBold",
  });

  ctx.font = "360px ArialBold";
  ctx.fillStyle = "white";
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  ctx.fillText(`${distance}`, 20, 2430);
  ctx.textAlign = "right";
  ctx.fillText(`KM`, 1800, 2430);

  ctx.textAlign = "center";
  ctx.font = "70px ArialBold";

  ctx.fillText(pace.toUpperCase(), 900, 300);
  ctx.fillText(time.toUpperCase(), 900, 400);
  ctx.fillText(elevation.toUpperCase(), 900, 500);

  const buffer = canvas.toBuffer("image/png");

  return buffer;
}
