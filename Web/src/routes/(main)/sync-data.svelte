<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import type { SyncResult } from "~/lib/sync-utils";

  let { syncResult }: { syncResult: SyncResult } = $props();
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <button>Syncronized</button>
  </Dialog.Trigger>
  <Dialog.Content class="text-xl">
    <Dialog.Header>
      <Dialog.Title>Sync stats</Dialog.Title>
      <Dialog.Description>
        <p>Round trip time: {syncResult.roundTripTime}</p>
        <p>Clock offset: {syncResult.clockOffset}</p>
        <p>serverTime: {syncResult.serverTime}</p>
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
