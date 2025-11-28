interface RGB {
	r: number;
	g: number;
	b: number;
}

interface ExtractedColors {
	colors: string[];
	isDark: boolean;
}

const QUANTIZATION_FACTOR = 32;
const MIN_COLOR_DISTANCE = 60;
const FALLBACK_COLORS: ExtractedColors = {
	colors: ["#ff6b6b", "#4ecdc4", "#ffe66d"],
	isDark: false,
};

function rgbToHex(r: number, g: number, b: number): string {
	return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function colorDistance(c1: RGB, c2: RGB): number {
	return Math.sqrt(
		Math.pow(c1.r - c2.r, 2) +
		Math.pow(c1.g - c2.g, 2) +
		Math.pow(c1.b - c2.b, 2),
	);
}

function getColorLuminance(r: number, g: number, b: number): number {
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors> {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";

		img.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				resolve(FALLBACK_COLORS);
				return;
			}

			const size = 50;
			canvas.width = size;
			canvas.height = size;

			ctx.drawImage(img, 0, 0, size, size);

			const imageData = ctx.getImageData(0, 0, size, size);
			const pixels = imageData.data;

			const colorMap = new Map<string, { rgb: RGB; count: number }>();
			let totalLuminance = 0;
			let pixelCount = 0;

			for (let i = 0; i < pixels.length; i += 4) {
				const r = Math.floor(pixels[i] / QUANTIZATION_FACTOR) * QUANTIZATION_FACTOR;
				const g = Math.floor(pixels[i + 1] / QUANTIZATION_FACTOR) * QUANTIZATION_FACTOR;
				const b = Math.floor(pixels[i + 2] / QUANTIZATION_FACTOR) * QUANTIZATION_FACTOR;

				totalLuminance += getColorLuminance(pixels[i], pixels[i + 1], pixels[i + 2]);
				pixelCount++;

				const key = `${r},${g},${b}`;
				const existing = colorMap.get(key);
				if (existing) {
					existing.count++;
				} else {
					colorMap.set(key, { rgb: { r, g, b }, count: 1 });
				}
			}

			const avgLuminance = totalLuminance / pixelCount;
			const isDark = avgLuminance < 0.5;

			const sortedColors = Array.from(colorMap.values())
				.sort((a, b) => b.count - a.count);

			const prominentColors: RGB[] = [];

			for (const color of sortedColors) {
				const isTooClose = prominentColors.some(
					(existing) => colorDistance(existing, color.rgb) < MIN_COLOR_DISTANCE,
				);

				if (!isTooClose) {
					prominentColors.push(color.rgb);
					if (prominentColors.length >= 3) break;
				}
			}

			while (prominentColors.length < 3) {
				const fallbacks = [
					{ r: 255, g: 107, b: 107 },
					{ r: 78, g: 205, b: 196 },
					{ r: 255, g: 230, b: 109 },
				];
				prominentColors.push(fallbacks[prominentColors.length]);
			}

			resolve({
				colors: prominentColors.map((c) => rgbToHex(c.r, c.g, c.b)),
				isDark,
			});
		};

		img.onerror = () => {
			resolve(FALLBACK_COLORS);
		};

		img.src = imageUrl;
	});
}
