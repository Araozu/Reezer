import type { Result } from "neverthrow";
import type { ISong } from "~/providers";

export interface IAudioSource {
	GetTrack(track: ISong): Promise<Result<string, unknown>>
}
