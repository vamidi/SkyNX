import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService
{
	/** ----------------- CONNECTIONS --------------------------- **/

	public static httpGet(url: string, headers): Promise<Response>
	{
		return fetch(url, {
			method: 'GET', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'same-origin', // include, *same-origin, omit
			headers,
			redirect: 'follow', // manual, *follow, error
			// no-referrer, *no-referrer-when-downgrade,
			// origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			referrerPolicy: 'no-referrer',
		});
	}

	/**
	 * @brief make a post connection.
	 * @param url
	 * @param headers
	 * @param body
	 */
	public static httpPost(url: string, headers, body: any): Promise<Response>
	{
		return fetch(url, {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'same-origin', // include, *same-origin, omit
			headers,
			redirect: 'follow', // manual, *follow, error
			// no-referrer, *no-referrer-when-downgrade,
			// origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			referrerPolicy: 'no-referrer',
			// body data type must match "Content-Type" header
			body: JSON.stringify(body),
		});
	}

	/**
	 * @brief make a delete connection.
	 * @param url
	 * @param headers
	 * @param body
	 */
	public static httpDelete(url: string, headers, body: any): Promise<Response> {
		return fetch(url, {
			method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'same-origin', // include, *same-origin, omit
			headers,
			redirect: 'follow', // manual, *follow, error
			// no-referrer, *no-referrer-when-downgrade,
			// origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			referrerPolicy: 'no-referrer',
			// body data type must match "Content-Type" header
			body: JSON.stringify(body),
		});
	}
}