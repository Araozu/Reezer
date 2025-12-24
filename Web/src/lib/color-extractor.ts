interface ExtractedColors {
	colors: string[];
	weights: number[];
	isDark: boolean;
}

interface ColorBucket {
	r: number;
	g: number;
	b: number;
	count: number;
}

const QUANT_BITS = 5;
const QUANT_SHIFT = 8 - QUANT_BITS;
const QUANT_LEVELS = 1 << QUANT_BITS;

function rgbToHex(r: number, g: number, b: number): string
{
	return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function colorDistanceSq(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number
{
	const dr = r1 - r2;
	const dg = g1 - g2;
	const db = b1 - b2;
	return (dr * dr * 2) + (dg * dg * 4) + (db * db * 3);
}

function getSaturation(r: number, g: number, b: number): number
{
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	if (max === 0) return 0;
	return (max - min) / max;
}

function getLightness(r: number, g: number, b: number): number
{
	return (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
}

function scoreColor(r: number, g: number, b: number, count: number, totalPixels: number): number
{
	const frequency = count / totalPixels;
	const saturation = getSaturation(r, g, b);
	const lightness = getLightness(r, g, b);

	const satBonus = saturation > 0.15 ? saturation * 2 : saturation * 0.5;
	const lightnessScore = 1 - (Math.abs(lightness - 0.5) * 1.5);
	const grayPenalty = saturation < 0.1 ? 0.3 : 1;

	return (frequency * 0.3) + (satBonus * 0.4) + (lightnessScore * 0.3 * grayPenalty);
}

export async function extractColorsFromImage(imageUrl: string, maxColors: number = 4): Promise<ExtractedColors>
{
	return new Promise((resolve) =>
	{
		const img = new Image();
		img.crossOrigin = "anonymous";

		img.onload = () =>
		{
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx)
			{
				resolve({ colors: [], weights: [], isDark: false });
				return;
			}

			const size = 100;
			canvas.width = size;
			canvas.height = size;
			ctx.drawImage(img, 0, 0, size, size);

			const imageData = ctx.getImageData(0, 0, size, size);
			const pixels = imageData.data;
			const totalPixels = size * size;

			const histogram = new Map<number, ColorBucket>();
			let totalLuminance = 0;

			for (let i = 0; i < pixels.length; i += 4)
			{
				const r = pixels[i];
				const g = pixels[i + 1];
				const b = pixels[i + 2];

				totalLuminance += (0.299 * r) + (0.587 * g) + (0.114 * b);

				const rq = r >> QUANT_SHIFT;
				const gq = g >> QUANT_SHIFT;
				const bq = b >> QUANT_SHIFT;
				const key = (rq << (QUANT_BITS * 2)) | (gq << QUANT_BITS) | bq;

				const bucket = histogram.get(key);
				if (bucket)
				{
					bucket.r += r;
					bucket.g += g;
					bucket.b += b;
					bucket.count += 1;
				}
				else
				{
					histogram.set(key, { r, g, b, count: 1 });
				}
			}

			const avgLuminance = totalLuminance / (totalPixels * 255);
			const isDark = avgLuminance < 0.5;

			const buckets = Array.from(histogram.values())
				.filter((b) => b.count >= 3)
				.map((b) => ({
					r: Math.round(b.r / b.count),
					g: Math.round(b.g / b.count),
					b: Math.round(b.b / b.count),
					count: b.count,
					score: 0,
				}));

			for (const bucket of buckets)
			{
				bucket.score = scoreColor(bucket.r, bucket.g, bucket.b, bucket.count, totalPixels);
			}

			const selected: typeof buckets = [];
			const minDistSq = 1600;
			const diversityRadius = 10000;

			while (selected.length < maxColors)
			{
				let bestIdx = -1;
				let bestScore = -Infinity;

				for (let i = 0; i < buckets.length; i += 1)
				{
					const bucket = buckets[i];

					const lightness = getLightness(bucket.r, bucket.g, bucket.b);
					if (lightness < 0.08 || lightness > 0.95) continue;

					let diversityPenalty = 0;
					let tooClose = false;

					for (const s of selected)
					{
						const distSq = colorDistanceSq(s.r, s.g, s.b, bucket.r, bucket.g, bucket.b);
						if (distSq < minDistSq)
						{
							tooClose = true;
							break;
						}
						if (distSq < diversityRadius)
						{
							diversityPenalty += 1 - (distSq / diversityRadius);
						}
					}

					if (tooClose) continue;

					const adjustedScore = bucket.score - (diversityPenalty * 0.3);
					if (adjustedScore > bestScore)
					{
						bestScore = adjustedScore;
						bestIdx = i;
					}
				}

				if (bestIdx === -1) break;

				selected.push(buckets[bestIdx]);
				buckets.splice(bestIdx, 1);
			}

			if (selected.length === 0)
			{
				resolve({ colors: [], weights: [], isDark });
				return;
			}

			const weights = selected.map((c) =>
			{
				const frequency = c.count / totalPixels;
				const saturation = getSaturation(c.r, c.g, c.b);
				const lightness = getLightness(c.r, c.g, c.b);
				const vividness = saturation * (1 - Math.abs(lightness - 0.5));
				return (frequency * 0.6) + (vividness * 0.4);
			});

			const maxWeight = Math.max(...weights);
			const normalizedWeights = weights.map((w) => Math.max(0.3, w / maxWeight));

			resolve({
				colors: selected.map((c) => rgbToHex(c.r, c.g, c.b)),
				weights: normalizedWeights,
				isDark,
			});
		};

		img.onerror = () =>
		{
			resolve({ colors: [], weights: [], isDark: false });
		};

		img.src = imageUrl;
	});
}
