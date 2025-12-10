export const ytOpenState = $state({open: false});

export function openYtQueue()
{
	ytOpenState.open = true;
}
