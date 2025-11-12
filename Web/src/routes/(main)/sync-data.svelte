<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { SyncResult } from "~/lib/sync-utils";
  import {
  	Clock,
  	Wifi,
  	Target,
  	TrendingUp,
  	TrendingDown,
  	Minus,
  	AlertTriangle,
  	CheckCircle,
  	Clock4,
  } from "lucide-svelte";

  let { syncResult }: { syncResult: SyncResult } = $props();

  // Format time values nicely
  function formatTime(ms: number): string
  {
  	if (Math.abs(ms) < 1000)
  	{
  		return `${ms.toFixed(1)}ms`;
  	}
  	return `${(ms / 1000).toFixed(2)}s`;
  }

  // Format server time as readable date
  function formatServerTime(serverTime: number): string
  {
  	return new Date(serverTime).toLocaleString();
  }

  // Get accuracy color and icon
  function getAccuracyInfo(accuracy: string)
  {
  	switch (accuracy)
  	{
  	case "high":
  		return { color: "text-green-600 dark:text-green-400", icon: CheckCircle, bg: "bg-green-50 dark:bg-green-900", border: "border-green-200 dark:border-green-800" };
  	case "medium":
  		return { color: "text-yellow-600 dark:text-yellow-400", icon: AlertTriangle, bg: "bg-yellow-50 dark:bg-yellow-900", border: "border-yellow-200 dark:border-yellow-800" };
  	case "low":
  		return { color: "text-red-600 dark:text-red-400", icon: AlertTriangle, bg: "bg-red-50 dark:bg-red-900", border: "border-red-200 dark:border-red-800" };
  	default:
  		return { color: "text-gray-600 dark:text-gray-400", icon: AlertTriangle, bg: "bg-gray-50 dark:bg-gray-900", border: "border-gray-200 dark:border-gray-800" };
  	}
  }

  // Get offset direction and color
  function getOffsetInfo(offset: number)
  {
  	if (Math.abs(offset) < 10)
  	{
  		return { icon: Minus, color: "text-green-600", text: "Synchronized" };
  	}
  	else if (offset > 0)
  	{
  		return { icon: TrendingUp, color: "text-blue-600", text: "Client ahead" };
  	}
  	else
  	{
  		return { icon: TrendingDown, color: "text-orange-600", text: "Client behind" };
  	}
  }

  let accuracyInfo = $derived(getAccuracyInfo(syncResult.accuracy));
  let offsetInfo = $derived(getOffsetInfo(syncResult.clockOffset));

  // Live server clock
  let currentServerTime = $state(new Date(syncResult.serverTime));

  // Update server time every second based on offset
  $effect(() =>
  {
  	const interval = setInterval(() =>
  	{
  		// Calculate current server time by adding elapsed time since sync
  		const now = Date.now();
  		const elapsed = now - (syncResult.serverTime - syncResult.clockOffset);
  		currentServerTime = new Date(syncResult.serverTime + elapsed);
  	}, 1000);

  	return () => clearInterval(interval);
  });

  // Format server time as HH:MM:SS
  function formatServerClock(time: Date): string
  {
  	return time.toLocaleTimeString([], {
  		hour12: false,
  		hour: "2-digit",
  		minute: "2-digit",
  		second: "2-digit",
  	});
  }
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <button>
      Synchronized
    </button>
  </Dialog.Trigger>
  <Dialog.Content class="max-w-2xl">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <Clock4 class="w-5 h-5" />
        Time Synchronization Details
      </Dialog.Title>
      <Dialog.Description>
        NTP-like synchronization with server time
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 mt-6">
      <!-- Accuracy Badge -->
      <Card.Root class="{accuracyInfo.bg} {accuracyInfo.border} border">
        <Card.Content>
          <div class="flex items-center gap-3">
            <accuracyInfo.icon class="w-5 h-5 {accuracyInfo.color}" />
            <div>
              <p class="font-semibold {accuracyInfo.color} capitalize">
                {syncResult.accuracy} Accuracy
              </p>
              <p class="text-sm text-muted-foreground">
                Synchronization quality based on round-trip time and stability
              </p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Main Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Round Trip Time -->
        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2 text-base">
              <Wifi class="w-4 h-4" />
              Round Trip Time
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="text-2xl font-mono font-bold">
              {formatTime(syncResult.roundTripTime)}
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              Network latency (one-way)
            </p>
          </Card.Content>
        </Card.Root>

        <!-- Clock Offset -->
        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2 text-base">
              <offsetInfo.icon class="w-4 h-4 {offsetInfo.color}" />
              Clock Offset
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="text-2xl font-mono font-bold {offsetInfo.color}">
              {syncResult.clockOffset > 0 ? "+" : ""}{formatTime(syncResult.clockOffset)}
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              {offsetInfo.text}
            </p>
          </Card.Content>
        </Card.Root>
      </div>

      <!-- Server Time -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2 text-base">
            <Clock class="w-4 h-4" />
            Synchronized Server Time
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="text-lg font-mono font-semibold">
            {formatServerTime(syncResult.serverTime)}
          </div>
          <p class="text-sm text-muted-foreground mt-1">
            Current server time adjusted for network delay
          </p>
        </Card.Content>
      </Card.Root>

      <!-- Live Server Clock -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2 text-base">
            <Clock4 class="w-4 h-4" />
            Live Server Clock
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="text-3xl font-mono font-bold text-center">
            {formatServerClock(currentServerTime)}
          </div>
          <p class="text-sm text-muted-foreground mt-1">
            Real-time server time with offset correction
          </p>
        </Card.Content>
      </Card.Root>

    </div>
  </Dialog.Content>
</Dialog.Root>
