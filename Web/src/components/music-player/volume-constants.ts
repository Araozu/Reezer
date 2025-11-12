
/**
 * This array maps a number from 0-100 to a volume curve.
 *
 * It is a memoized array of Math.pow(x / 100, 2)
 */
export const sliderToVolume = new Array(101).fill(0)
	.map((_, idx) => Math.pow(idx / 100, 2));

export const volumeToSlider = (logVolume: number) => Math.round(Math.sqrt(logVolume) * 100);
