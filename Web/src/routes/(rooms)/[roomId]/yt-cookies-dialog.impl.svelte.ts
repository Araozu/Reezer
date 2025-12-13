export const ytCookiesOpenState = $state({open: false});

export function openYtCookiesDialog()
{
	ytCookiesOpenState.open = true;
}
