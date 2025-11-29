<script lang="ts">
    let {albumId, albumName}: {albumId: string, albumName: string} = $props();

    let imageSrc = $state(`/api/Albums/${albumId}/cover`);
    let errored = $state(false);
    let loaded = $state(false);

    function handleError()
    {
    	imageSrc = "/vinyl.jpg";
    	errored = true;
    }

    function handleLoad()
    {
    	loaded = true;
    }
</script>

<img
    class={[
    	"rounded-xl w-full aspect-square object-cover transition-opacity",
    	errored ? "opacity-75" : "",
    	loaded ? "opacity-100" : "opacity-0",
    ]}
    src={imageSrc}
    alt={`Cover for ${albumName}`}
    onerror={handleError}
    onload={handleLoad}
/>

