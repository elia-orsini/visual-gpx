import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

export async function handDrawnText({
  image,
  distance,
  date,
  pace,
  time,
  elevation,
}: {
  image: any;
  distance: string;
  date: string;
  pace: string;
  time: string;
  elevation: string;
}) {
  const imageBuffer2 = await image.getBuffer("image/png");
  const canvas = createCanvas(1800, 2400);
  const ctx = canvas.getContext("2d");

  const bgImg = await loadImage(Buffer.from(imageBuffer2));
  ctx.drawImage(bgImg, 0, 0, 1800, 2400);

  registerFont(path.join(process.cwd(), "public/fonts/handdrawn2.ttf"), {
    family: "Hand",
  });
  registerFont(path.join(process.cwd(), "public/fonts/Arial.ttf"), {
    family: "Arial",
  });
  registerFont(path.join(process.cwd(), "public/fonts/ArialBold.ttf"), {
    family: "ArialBold",
  });

  ctx.font = "150px Hand";
  ctx.fillStyle = "white";
  ctx.textBaseline = "top";
  ctx.fillText(distance, 645, 2000);

  ctx.font = "80px Hand";
  ctx.fillText("km", 1030, 2035);

  ctx.font = "50px ArialBold";
  ctx.fillText(date, 746, 400);

  ctx.font = "45px ArialBold";
  ctx.fillText(`${pace}             ${time}             ${elevation}`, 20, 20);

  const buffer = canvas.toBuffer("image/png");

  return buffer;
}
