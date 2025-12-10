import {ok,type  Result} from "neverthrow";
import type { IAudioSource } from "../interfaces/IAudioSource";
import type { ISong } from "../types";

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

	async GetTrack(track: ISong): Promise<Result<string, UrlAudioError>>
	{
		// This one really does nothing, but there will be
		// a different implementation that deals with auth
		// & signed URLs.
		if (track.type === "regular") return ok(`${UrlAudioSource.baseUrl}/api/Songs/${track.id}/stream`);
		else if (track.type === "youtube") return ok(`${UrlAudioSource.baseUrl}/api/Yt/${track.id}/stream`);
		else throw new Error("Unreachable: Unsupported song type");
	}
}
