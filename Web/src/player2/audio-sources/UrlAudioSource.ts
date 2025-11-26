import {ok,type  Result} from "neverthrow";
import type { IAudioSource } from "../interfaces/IAudioSource";

type UrlAudioError = "NotFound" | "Other"

/**
 * Gets audio tracks from the default streaming backend,
 * with content-type `audio/webm` only.
 *
 * Provides URLs to be used directly in HTMLAudioElement.src.
 */
export class UrlAudioSource implements IAudioSource
{
	private static baseUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL;

	async GetTrack(id: string): Promise<Result<string, UrlAudioError>>
	{
		// This one really does nothing, but there will be
		// a different implementation that deals with auth
		// & signed URLs.
		return ok(`${UrlAudioSource.baseUrl}/api/Songs/${id}/stream`);
	}
}
