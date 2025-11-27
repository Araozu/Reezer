import type { Result } from "neverthrow";

export interface IAudioSource {
	GetTrack(id: string): Promise<Result<string, unknown>>
}
