import { createRoute, createFileRoute } from "@tanstack/solid-router";
import { createSignal, onMount, onCleanup } from "solid-js";
import { Video, VideoOff, Wifi, WifiOff, Maximize2 } from "lucide-solid";

export const Route = createRoute("/view/$roomId")({
	getParentRoute: () => import("./index").then(r => r.Route),
	path: "/view/$roomId",
	component: ViewerPage,
});

function ViewerPage() {
	const { roomId } = Route.useParams();
	const [isConnected, setIsConnected] = createSignal(false);
	const [isStreamActive, setIsStreamActive] = createSignal(false);
	const [socket, setSocket] = createSignal<WebSocket | null>(null);
	const [isFullscreen, setIsFullscreen] = createSignal(false);
	
	let videoRef: HTMLVideoElement;
	let peerConnection: RTCPeerConnection | null = null;

	const initializeViewer = () => {
		const socketInstance = new WebSocket("ws://localhost:3000/ws");
		setSocket(socketInstance);

		socketInstance.onopen = () => {
			setIsConnected(true);
			socketInstance.send(JSON.stringify({
				type: "join-viewer",
				roomId: roomId
			}))
		}

		socketInstance.onclose = () => {
			setIsConnected(false);
			setIsStreamActive(false);
		}

		socketInstance.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			
			switch (message.type) {
				case "answer":
					if (peerConnection) {
						await peerConnection.setRemoteDescription(message.data);
					}
					break
					
				case "ice-candidate":
					if (peerConnection) {
						await peerConnection.addIceCandidate(message.data);
					}
					break
					
				case "streamer-joined":
					// Initialize WebRTC as viewer
					peerConnection = new RTCPeerConnection({
						iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
					})

					peerConnection.ontrack = (event) => {
						if (videoRef && event.streams[0]) {
							videoRef.srcObject = event.streams[0];
							setIsStreamActive(true);
						}
					}

					peerConnection.onicecandidate = (event) => {
						if (event.candidate) {
							socketInstance.send(JSON.stringify({
								type: "ice-candidate",
								roomId: roomId,
								data: event.candidate
							}))
						}
					}

					peerConnection.onconnectionstatechange = () => {
						if (peerConnection?.connectionState === "disconnected" || 
						    peerConnection?.connectionState === "failed") {
							setIsStreamActive(false);
						}
					}

					// Create offer
					const offer = await peerConnection.createOffer();
					await peerConnection.setLocalDescription(offer);
					socketInstance.send(JSON.stringify({
						type: "offer",
						roomId: roomId,
						data: offer
					}))
					break
					
				case "streamer-left":
					setIsStreamActive(false);
					if (peerConnection) {
						peerConnection.close();
						peerConnection = null;
					}
					if (videoRef) {
						videoRef.srcObject = null;
					}
					break
			}
		}

		return socketInstance;
	}

	const toggleFullscreen = async () => {
		if (!document.fullscreenElement) {
			await videoRef?.requestFullscreen?.();
			setIsFullscreen(true);
		} else {
			await document.exitFullscreen();
			setIsFullscreen(false);
		}
	}

	onMount(() => {
		initializeViewer();
		
		// Listen for fullscreen changes
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		}
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		
		onCleanup(() => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		})
	})

	onCleanup(() => {
		if (peerConnection) {
			peerConnection.close();
		}
		socket()?.close();
	})

	return (
		<div class="min-h-screen bg-gray-900">
			{/* Header - only show when not fullscreen */}
			<div 
				class="bg-gray-800 text-white p-4 transition-transform duration-300"
				classList={{
					"-translate-y-full": isFullscreen(),
				}}
			>
				<div class="flex items-center justify-between max-w-4xl mx-auto">
					<div>
						<h1 class="text-xl font-bold">Stream Viewer</h1>
						<p class="text-gray-300 text-sm">Room: {roomId}</p>
					</div>
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-2">
							{isConnected() ? (
								<>
									<Wifi size={20} class="text-green-400" />
									<span class="text-green-400 text-sm">Connected</span>
								</>
							) : (
								<>
									<WifiOff size={20} class="text-red-400" />
									<span class="text-red-400 text-sm">Disconnected</span>
								</>
							)}
						</div>
						{isStreamActive() && (
							<button
								onClick={toggleFullscreen}
								class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
								title="Toggle fullscreen"
							>
								<Maximize2 size={20} />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Video Container */}
			<div class="relative w-full" style="height: calc(100vh - 72px);">
				<video
					ref={videoRef!}
					autoplay
					class="w-full h-full object-contain bg-black"
					classList={{
						"opacity-0": !isStreamActive(),
						"h-screen": isFullscreen(),
					}}
					style={{
						height: isFullscreen() ? "100vh" : "calc(100vh - 72px)",
					}}
				/>
				
				{/* Loading/Status Overlay */}
				{!isStreamActive() && (
					<div class="absolute inset-0 flex items-center justify-center bg-black">
						<div class="text-center text-white">
							{!isConnected() ? (
								<>
									<WifiOff size={64} class="mx-auto mb-4 text-red-400" />
									<h2 class="text-2xl font-bold mb-2">Connecting...</h2>
									<p class="text-gray-400">Establishing connection to the stream</p>
								</>
							) : (
								<>
									<VideoOff size={64} class="mx-auto mb-4 text-gray-400" />
									<h2 class="text-2xl font-bold mb-2">Waiting for Stream</h2>
									<p class="text-gray-400">The streamer hasn't started broadcasting yet</p>
									<div class="mt-4">
										<div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full">
											<div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
											<span class="text-sm">Ready to receive</span>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				)}

				{/* Live Indicator */}
				{isStreamActive() && (
					<div class="absolute top-4 left-4 z-10">
						<div class="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
							<div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
							LIVE
						</div>
					</div>
				)}

				{/* Fullscreen controls */}
				{isFullscreen() && isStreamActive() && (
					<div class="absolute bottom-4 right-4 z-10">
						<button
							onClick={toggleFullscreen}
							class="p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-all"
						>
							<Maximize2 size={24} />
						</button>
					</div>
				)}
			</div>

			{/* Mobile optimizations */}
			<style>{`
				@media (max-width: 768px) {
					.video-container {
						height: 100vh
					}
					video {
						object-fit: cover
					}
				}
				
				/* Hide scrollbars in fullscreen */
				video:fullscreen {
					object-fit: contain;
				}
				
				/* Prevent zoom on iOS */
				input, textarea, select {
					font-size: 16px;
				}
			`}</style>
		</div>
	)
}