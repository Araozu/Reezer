<script lang="ts">
    import { cn } from "~/lib/utils";

    interface Props {
        albumId: string;
        albumName: string;
        class?: string;
        skipFadeIn?: boolean;
    }

    let { albumId, albumName, class: className, skipFadeIn = false }: Props = $props();

    let imageSrc = $state(`/api/Albums/${albumId}/cover`);
    let errored = $state(false);
    let loaded = $state(skipFadeIn);
    let imgClasses = $derived(`rounded-xl w-full aspect-square object-cover transition-opacity ${errored ? "opacity-75" : ""} ${loaded ? "opacity-100" : "opacity-0"}`);

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
    class={cn(imgClasses, className)}
    src={imageSrc}
    alt={`Cover for ${albumName}`}
    onerror={handleError}
    onload={handleLoad}
/>

