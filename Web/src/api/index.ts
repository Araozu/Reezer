import type { paths } from "./api";
export type { components } from "./api";
import createClient from "openapi-fetch";

export const api = createClient<paths>({
	credentials: "include", // Include cookies in requests
	...(import.meta.env.DEV
		? {
				// Add latency on dev
				fetch: async (req) => {
					await new Promise((res) => setTimeout(res, 500));

					return fetch(req);
				},
			}
		: {}),
});

type FetchResult<A, B> = {
	data?: A;
	error?: B;
	response: Response;
};

// biome-ignore lint/suspicious/noExplicitAny: needed for typing
export type FetchError<T = any> = {
	statusCode: number;
	message: string;
	error: T;
};

export const sv =
	<Data, Error>(fn: () => Promise<FetchResult<Data, Error>>) =>
	async (): Promise<Data> => {
		try {
			const data = await fn();
			if (data.response.ok) {
				// biome-ignore lint/style/noNonNullAssertion: needed for typing
				return data.data!;
			}

			if (data.error) {
				// attempt to extract error messages from validation errors
				if (data.response.status === 400) {
					const e = data.error as Error;
					if (typeof e === "object" && e !== null && "errors" in e) {
						const errors = e.errors as Record<string, string>;
						const errorsStr = Object.entries(errors)
							.map(([, v]) => `${v}`)
							.join(", ");

						throw {
							statusCode: data.response.status,
							message: `${errorsStr}`,
							error: data.error,
						};
					}
				}

				const e = data.error as Error;
				if (typeof e === "object" && e !== null && "title" in e) {
					throw {
						statusCode: data.response.status,
						message: `${e.title}`,
						error: data.error,
					};
				}

				if (typeof e === "string") {
					throw {
						statusCode: data.response.status,
						message: e,
						error: data.error,
					};
				}

				throw {
					statusCode: data.response.status,
					message: "Error interno del servidor",
					error: data.error,
				};
			} else {
				throw {
					statusCode: data.response.status,
					message: "Error interno del servidor",
					// biome-ignore lint/style/noNonNullAssertion: needed for typing
					error: data.error!,
				};
			}
		} catch (e) {
			if (import.meta.env.DEV) {
				console.error(e);
			}
			throw {
				statusCode: 503,
				message: "Servidor no disponible",
				error: null as Error,
			};
		}
	};