// Pós-efeitos leves aplicados sobre o canvas já desenhado — cada um é um
// passe curto e opcional, nenhum precisa de WebGL/shader.

export function applyVignette(ctx, width, height, strength) {
  if (strength <= 0) return;
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.32,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Bloom simples: desenha uma versão borrada (ctx.filter) do próprio
// canvas por cima com blend "screen" e opacidade baixa — sem pipeline de
// shader, só um passe extra.
export function applyBloom(ctx, sourceCanvas, width, height, strength, blurPx) {
  if (strength <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = strength;
  ctx.filter = `blur(${blurPx}px)`;
  ctx.drawImage(sourceCanvas, 0, 0, width, height);
  ctx.restore();
}

// Grain determinístico por frame (posições fixas, só a fase de opacidade
// muda) — evita realocar centenas de números aleatórios a cada frame.
let grainPoints = null;
function ensureGrainPoints(width, height, count) {
  if (grainPoints && grainPoints.width === width && grainPoints.height === height && grainPoints.pts.length === count) {
    return grainPoints.pts;
  }
  const pts = new Array(count);
  for (let i = 0; i < count; i += 1) {
    pts[i] = { x: Math.random() * width, y: Math.random() * height, a: 0.15 + Math.random() * 0.5 };
  }
  grainPoints = { width, height, pts };
  return pts;
}

export function applyGrain(ctx, width, height, amount, time) {
  if (amount <= 0) return;
  const count = Math.round((width * height) / 900);
  const pts = ensureGrainPoints(width, height, count);
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    const flicker = 0.5 + 0.5 * Math.sin(time * 3 + i);
    ctx.fillStyle = `rgba(255,255,255,${p.a * amount * flicker})`;
    ctx.fillRect(p.x, p.y, 1, 1);
  }
  ctx.restore();
}

// Glitch: recorta algumas faixas horizontais finas e reposiciona
// lateralmente por um instante — raro e curto no chamador, não aqui.
export function applyGlitchSlices(ctx, width, height, sliceCount, maxOffset) {
  for (let i = 0; i < sliceCount; i += 1) {
    const sliceHeight = 2 + Math.random() * 6;
    const sourceY = Math.random() * (height - sliceHeight);
    const offset = (Math.random() - 0.5) * maxOffset;
    const slice = ctx.getImageData(0, sourceY, width, sliceHeight);
    ctx.putImageData(slice, offset, sourceY);
  }
}

