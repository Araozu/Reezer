<script lang="ts">
	// Lava background effect
</script>

<div class="inset-0 bg-background pointer-events-none fixed -z-10 overflow-hidden">
	<div
		class="bg-primary/40 animate-blob absolute top-[-10%] left-[20%] h-[40vw] w-[40vw] rounded-full opacity-70 mix-blend-multiply blur-[80px] filter dark:mix-blend-screen"
	></div>
	<div
		class="bg-chart-1/40 animate-blob animation-delay-2000 absolute top-[-10%] right-[20%] h-[35vw] w-[35vw] rounded-full opacity-70 mix-blend-multiply blur-[80px] filter dark:mix-blend-screen"
	></div>
	<div
		class="bg-chart-2/40 animate-blob animation-delay-4000 absolute bottom-[-20%] left-[30%] h-[45vw] w-[45vw] rounded-full opacity-70 mix-blend-multiply blur-[80px] filter dark:mix-blend-screen"
	></div>
</div>

<style>
	@keyframes blob {
		0% {
			transform: translate(0px, 0px) scale(1);
		}
		33% {
			transform: translate(30px, -50px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
		100% {
			transform: translate(0px, 0px) scale(1);
		}
	}
	.animate-blob {
		animation: blob 10s infinite;
	}
	.animation-delay-2000 {
		animation-delay: 2s;
	}
	.animation-delay-4000 {
		animation-delay: 4s;
	}
</style>
