<script lang="ts">
	// Lava background effect
</script>

<div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
	<div
		class="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-primary/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob"
	></div>
	<div
		class="absolute top-[-10%] right-[20%] w-[35vw] h-[35vw] bg-chart-1/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-2000"
	></div>
	<div
		class="absolute bottom-[-20%] left-[30%] w-[45vw] h-[45vw] bg-chart-2/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-4000"
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
