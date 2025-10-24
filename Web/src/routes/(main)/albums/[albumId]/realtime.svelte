<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as SignalR from "@microsoft/signalr";

    let serverTime = $state<string>("");
    let clientTime = $state<string>("");
    let timeDiff = $state<number>(0);
    let isConnected = $state<boolean>(false);

    let rtt = $state<number>(0);
    let serverOffset = $state<number>(0);
    let syncedServerTime = $state<string>("");
    let isSyncing = $state<boolean>(false);
    let syncSampleCount = $state<number>(0);
    let minRtt = $state<number>(Infinity);
    let maxRtt = $state<number>(0);
    let avgRtt = $state<number>(0);

    const connection = new SignalR.HubConnectionBuilder()
    	.withUrl(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/hub`)
    	.withAutomaticReconnect()
    	.build();

    connection.on("serverTimeUpdate", (serverTimeStr: string) =>
    {
    	const serverDate = new Date(serverTimeStr);
    	const clientDate = new Date();

    	serverTime = serverDate.toLocaleTimeString();
    	clientTime = clientDate.toLocaleTimeString();
    	timeDiff = clientDate.getTime() - serverDate.getTime();
    });

    connection.onclose(() =>
    {
    	isConnected = false;
    });

    connection.onreconnected(() =>
    {
    	isConnected = true;
    });

    connection.start()
    	.then(() =>
    	{
    		isConnected = true;
    		console.log("SignalR connected");
    	})
    	.catch(console.error);

    function requestServerTime()
    {
    	connection.send("requestServerTime");
    }

    async function performTimeSync()
    {
    	isSyncing = true;
    	const samples = 10;
    	const results: { rtt: number; offset: number }[] = [];

    	for (let i = 0; i < samples; i++)
    	{
    		const t0 = Date.now();
    		const clientTicks = t0 * 10000 + 621355968000000000;

    		try
    		{
    			const serverTicksStr = await connection.invoke<string>("syncTime", clientTicks);
    			const t3 = Date.now();

    			const serverTicks = BigInt(serverTicksStr);
    			const t1 = Number((serverTicks - 621355968000000000n) / 10000n);

    			const roundTripTime = t3 - t0;
    			const estimatedServerTime = t1 + (roundTripTime / 2);
    			const offset = estimatedServerTime - t3;

    			results.push({ rtt: roundTripTime, offset });

    			syncSampleCount = i + 1;

    			await new Promise((resolve) => setTimeout(resolve, 100));
    		}
    		catch (err)
    		{
    			console.error("Sync error:", err);
    		}
    	}

    	if (results.length > 0)
    	{
    		results.sort((a, b) => a.rtt - b.rtt);
    		const bestSamples = results.slice(0, Math.ceil(results.length / 2));

    		const totalRtt = results.reduce((sum, r) => sum + r.rtt, 0);
    		avgRtt = Math.round(totalRtt / results.length);
    		minRtt = Math.round(results[0].rtt);
    		maxRtt = Math.round(results[results.length - 1].rtt);

    		const avgOffset = bestSamples.reduce((sum, r) => sum + r.offset, 0) / bestSamples.length;
    		serverOffset = Math.round(avgOffset);
    		rtt = Math.round(bestSamples[0].rtt);
    	}

    	isSyncing = false;
    	syncSampleCount = 0;
    }

    setInterval(() =>
    {
    	if (!serverTime) return;
    	const now = new Date();
    	clientTime = now.toLocaleTimeString();

    	if (serverOffset !== 0)
    	{
    		const syncedTime = new Date(now.getTime() + serverOffset);
    		syncedServerTime = `${syncedTime.toLocaleTimeString()}.${syncedTime.getMilliseconds().toString()
    			.padStart(3, "0")}`;
    	}
    }, 10);
</script>

<div class="space-y-4 p-4 border rounded-lg">
	<h3 class="text-lg font-semibold">Server Time Sync Demo</h3>

	<div class="flex items-center gap-2">
		<div class="h-2 w-2 rounded-full {isConnected ? "bg-green-500" : "bg-red-500"}"></div>
		<span class="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<div class="text-sm text-muted-foreground">Server Time (UTC - Broadcast)</div>
			<div class="text-2xl font-mono">{serverTime || "--:--:--"}</div>
		</div>
		<div>
			<div class="text-sm text-muted-foreground">Client Time (Local)</div>
			<div class="text-2xl font-mono">{clientTime || "--:--:--"}</div>
		</div>
	</div>

	<div class="border-t pt-4 space-y-3">
		<h4 class="font-semibold">Time Synchronization (NTP-style)</h4>

		<div class="grid grid-cols-3 gap-4">
			<div>
				<div class="text-sm text-muted-foreground">Round Trip Time</div>
				<div class="text-xl font-mono">{rtt}ms</div>
			</div>
			<div>
				<div class="text-sm text-muted-foreground">Server Offset</div>
				<div class="text-xl font-mono">{serverOffset > 0 ? "+" : ""}{serverOffset}ms</div>
			</div>
			<div>
				<div class="text-sm text-muted-foreground">Synced Server Time</div>
				<div class="text-xl font-mono">{syncedServerTime || "--:--:--"}</div>
			</div>
		</div>

		{#if minRtt !== Infinity}
			<div class="grid grid-cols-3 gap-4 text-sm">
				<div>
					<div class="text-muted-foreground">Min RTT</div>
					<div class="font-mono">{minRtt}ms</div>
				</div>
				<div>
					<div class="text-muted-foreground">Avg RTT</div>
					<div class="font-mono">{avgRtt}ms</div>
				</div>
				<div>
					<div class="text-muted-foreground">Max RTT</div>
					<div class="font-mono">{maxRtt}ms</div>
				</div>
			</div>
		{/if}

		<div class="flex gap-2">
			<Button onclick={performTimeSync} variant="default" disabled={isSyncing}>
				{isSyncing ? `Syncing... (${syncSampleCount}/10)` : "Sync with Server"}
			</Button>
			<Button onclick={requestServerTime} variant="secondary">
				Request Broadcast Time
			</Button>
		</div>
	</div>

	<div class="text-xs text-muted-foreground border-t pt-2">
		<strong>How it works:</strong> Takes 10 round-trip measurements, uses the fastest half to calculate offset.
		RTT = time for request + response. Offset = estimated server time - client time.
	</div>
</div>
