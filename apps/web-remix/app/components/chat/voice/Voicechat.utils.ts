export function drawCircleBars(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  frequencyBinCountArray: Uint8Array,
) {
  const circleCount = 5;
  const barWidth = 15;
  const radius = barWidth / 2;
  const barSpacing = canvas.width / circleCount;

  for (let i = 0; i < circleCount; i++) {
    const barHeight =
      15 + (frequencyBinCountArray[i] / 255) * (canvas.height - 15);

    const x = barSpacing * i + barSpacing / 2 - barWidth / 2;
    const y = canvas.height - barHeight;

    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, canvas.height - radius);
    ctx.quadraticCurveTo(x, canvas.height, x + radius, canvas.height);
    ctx.lineTo(x + barWidth - radius, canvas.height);
    ctx.quadraticCurveTo(
      x + barWidth,
      canvas.height,
      x + barWidth,
      canvas.height - radius,
    );
    ctx.lineTo(x + barWidth, y + radius);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.fillStyle = '#111';
    ctx.fill();
  }
}

export function drawChatCircle(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  frequencyBinCountArray: Uint8Array,
  image?: HTMLImageElement | null,
) {
  const averageFrequency =
    frequencyBinCountArray.reduce((a, b) => a + b, 0) /
    frequencyBinCountArray.length;

  const baseRadius = 70;

  const maxGrowth = canvas.width - baseRadius;
  const radius = baseRadius + (averageFrequency / 255) * maxGrowth;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  if (image) {
    const imgX = centerX - radius / 2;
    const imgY = centerY - radius / 2;
    ctx.drawImage(image, imgX, imgY, radius, radius);
  }
}
