interface RGB {
	r: number;
	g: number;
	b: number;
}

interface HSL {
	h: number;
	s: number;
	l: number;
}

interface ExtractedColors {
	colors: string[];
	weights: number[];
	isDark: boolean;
}

interface ColorCandidate {
	rgb: RGB;
	hsl: HSL;
	count: number;
	score: number;
}

function rgbToHex(r: number, g: number, b: number): string
{
	return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): HSL
{
	const rNorm = r / 255;
	const gNorm = g / 255;
	const bNorm = b / 255;

	const max = Math.max(rNorm, gNorm, bNorm);
	const min = Math.min(rNorm, gNorm, bNorm);
	const l = (max + min) / 2;

	if (max === min)
	{
		return { h: 0, s: 0, l };
	}

	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

	let h = 0;
	if (max === rNorm)
	{
		h = (((gNorm - bNorm) / d) + (gNorm < bNorm ? 6 : 0)) / 6;
	}
	else if (max === gNorm)
	{
		h = (((bNorm - rNorm) / d) + 2) / 6;
	}
	else
	{
		h = (((rNorm - gNorm) / d) + 4) / 6;
	}

	return { h, s, l };
}

function colorDistanceLab(c1: RGB, c2: RGB): number
{
	const lab1 = rgbToLab(c1);
	const lab2 = rgbToLab(c2);

	const dl = lab1.l - lab2.l;
	const da = lab1.a - lab2.a;
	const db = lab1.b - lab2.b;

	return Math.sqrt((dl * dl) + (da * da) + (db * db));
}

function rgbToLab(rgb: RGB): { l: number; a: number; b: number }
{
	const rNorm = rgb.r / 255;
	const gNorm = rgb.g / 255;
	const bNorm = rgb.b / 255;

	const rLinear = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
	const gLinear = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
	const bLinear = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

	const xRaw = ((rLinear * 0.4124564) + (gLinear * 0.3575761) + (bLinear * 0.1804375)) / 0.95047;
	const yRaw = (rLinear * 0.2126729) + (gLinear * 0.7151522) + (bLinear * 0.0721750);
	const zRaw = ((rLinear * 0.0193339) + (gLinear * 0.1191920) + (bLinear * 0.9503041)) / 1.08883;

	const x = xRaw > 0.008856 ? Math.pow(xRaw, 1 / 3) : (7.787 * xRaw) + (16 / 116);
	const y = yRaw > 0.008856 ? Math.pow(yRaw, 1 / 3) : (7.787 * yRaw) + (16 / 116);
	const z = zRaw > 0.008856 ? Math.pow(zRaw, 1 / 3) : (7.787 * zRaw) + (16 / 116);

	return {
		l: (116 * y) - 16,
		a: 500 * (x - y),
		b: 200 * (y - z),
	};
}

function getColorLuminance(r: number, g: number, b: number): number
{
	return ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
}

function calculateColorScore(hsl: HSL, count: number, totalPixels: number): number
{
	const frequency = count / totalPixels;

	const saturationWeight = hsl.s > 0.15 ? hsl.s * 2 : hsl.s * 0.5;

	const lightnessScore = 1 - (Math.abs(hsl.l - 0.5) * 1.5);

	const isGrayish = hsl.s < 0.1;
	const grayPenalty = isGrayish ? 0.3 : 1;

	return (frequency * 0.3) + (saturationWeight * 0.4) + (lightnessScore * 0.3 * grayPenalty);
}

function kMeansClustering(pixels: RGB[], k: number, iterations: number = 10): RGB[]
{
	if (pixels.length === 0) return [];

	let centroids: RGB[] = [];
	const step = Math.floor(pixels.length / k);
	for (let i = 0; i < k; i += 1)
	{
		centroids.push({ ...pixels[Math.min(i * step, pixels.length - 1)] });
	}

	for (let iter = 0; iter < iterations; iter += 1)
	{
		const clusters: RGB[][] = Array.from({ length: k }, () => []);

		for (const pixel of pixels)
		{
			let minDist = Infinity;
			let closestIdx = 0;

			for (let i = 0; i < centroids.length; i += 1)
			{
				const dist = colorDistanceLab(pixel, centroids[i]);
				if (dist < minDist)
				{
					minDist = dist;
					closestIdx = i;
				}
			}

			clusters[closestIdx].push(pixel);
		}

		const previousCentroids = centroids;
		centroids = clusters.map((cluster, idx) =>
		{
			if (cluster.length === 0) return previousCentroids[idx];

			const sum = cluster.reduce(
				(acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
				{ r: 0, g: 0, b: 0 },
			);

			return {
				r: Math.round(sum.r / cluster.length),
				g: Math.round(sum.g / cluster.length),
				b: Math.round(sum.b / cluster.length),
			};
		});
	}

	return centroids;
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
			const ctx = canvas.getContext("2d");
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

			const rgbPixels: RGB[] = [];
			let totalLuminance = 0;

			for (let i = 0; i < pixels.length; i += 4)
			{
				const r = pixels[i];
				const g = pixels[i + 1];
				const b = pixels[i + 2];

				totalLuminance += getColorLuminance(r, g, b);
				rgbPixels.push({ r, g, b });
			}

			const avgLuminance = totalLuminance / rgbPixels.length;
			const isDark = avgLuminance < 0.5;

			const clusteredColors = kMeansClustering(rgbPixels, 12, 8);

			const candidates: ColorCandidate[] = clusteredColors.map((rgb) =>
			{
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

				let count = 0;
				for (const pixel of rgbPixels)
				{
					if (colorDistanceLab(pixel, rgb) < 30)
					{
						count += 1;
					}
				}

				return {
					rgb,
					hsl,
					count,
					score: calculateColorScore(hsl, count, rgbPixels.length),
				};
			});

			candidates.sort((a, b) => b.score - a.score);

			const selectedCandidates: ColorCandidate[] = [];
			const minDistance = 35;

			for (const candidate of candidates)
			{
				const isTooClose = selectedCandidates.some((existing) => colorDistanceLab(existing.rgb, candidate.rgb) < minDistance);

				const isTooExtreme = candidate.hsl.l < 0.08 || candidate.hsl.l > 0.95;

				if (!isTooClose && !isTooExtreme)
				{
					selectedCandidates.push(candidate);
					if (selectedCandidates.length >= maxColors) break;
				}
			}

			for (const candidate of candidates)
			{
				if (selectedCandidates.length >= maxColors) break;

				const isTooClose = selectedCandidates.some((existing) => colorDistanceLab(existing.rgb, candidate.rgb) < minDistance);

				if (!isTooClose)
				{
					selectedCandidates.push(candidate);
				}
			}

			if (selectedCandidates.length === 0)
			{
				resolve({ colors: [], weights: [], isDark });
				return;
			}

			const weights = selectedCandidates.map((c) =>
			{
				const frequency = c.count / rgbPixels.length;
				const vividness = c.hsl.s * (1 - Math.abs(c.hsl.l - 0.5));
				return (frequency * 0.6) + (vividness * 0.4);
			});

			const maxWeight = Math.max(...weights);
			const normalizedWeights = weights.map((w) => Math.max(0.3, w / maxWeight));

			resolve({
				colors: selectedCandidates.map((c) => rgbToHex(c.rgb.r, c.rgb.g, c.rgb.b)),
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
