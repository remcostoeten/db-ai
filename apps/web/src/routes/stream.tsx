import { createRoute, createFileRoute } from "@tanstack/solid-router";
import { createSignal, onMount, onCleanup } from "solid-js";
import { Video, VideoOff, Share2, Copy, CheckCircle } from "lucide-solid";

export const Route = createRoute("/stream")({
	getParentRoute: () => import("./index").then(r => r.Route),
	path: "/stream",
	component: StreamPage,
});

function StreamPage() {
	const [isStreaming, setIsStreaming] = createSignal(false);
	const [stream, setStream] = createSignal<MediaStream | null>(null);
	const [socket, setSocket] = createSignal<WebSocket | null>(null);
	const [roomId, setRoomId] = createSignal<string>("");
	const [viewerUrl, setViewerUrl] = createSignal<string>("");
	const [copied, setCopied] = createSignal(false);
	
	let videoRef: HTMLVideoElement;
	let peerConnection: RTCPeerConnection | null = null;

	const generateRoomId = () => {
		return Math.random().toString(36).substr(2, 9);
	}

	const initializeSocket = () => {
		const socketInstance = new WebSocket("ws://localhost:3000/ws");
		setSocket(socketInstance);

		socketInstance.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			
			switch (message.type) {
				case "offer":
					if (!peerConnection) return;
					
					await peerConnection.setRemoteDescription(message.data);
					const answer = await peerConnection.createAnswer();
					await peerConnection.setLocalDescription(answer);
					socketInstance.send(JSON.stringify({
						type: "answer",
						roomId: roomId(),
						data: answer
					}))
					break
					
				case "ice-candidate":
					if (peerConnection) {
						await peerConnection.addIceCandidate(message.data);
					}
					break
			}
		}

		return socketInstance;
	}

	const startStreaming = async () => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: { width: 1280, height: 720 },
				audio: true,
			})

			setStream(mediaStream);
			if (videoRef) {
				videoRef.srcObject = mediaStream;
			}

			const id = generateRoomId();
			setRoomId(id);
			setViewerUrl(`${window.location.origin}/view/${id}`);

			// Initialize WebRTC
			peerConnection = new RTCPeerConnection({
				iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
			})

			mediaStream.getTracks().forEach(track => {
				peerConnection?.addTrack(track, mediaStream);
			})

			const socketInstance = socket() || initializeSocket();
			
			peerConnection.onicecandidate = (event) => {
				if (event.candidate) {
					socketInstance.send(JSON.stringify({
						type: "ice-candidate",
						roomId: id,
						data: event.candidate
					}))
				}
			}

			// Wait for socket to be open before joining
			if (socketInstance.readyState === WebSocket.OPEN) {
				socketInstance.send(JSON.stringify({
					type: "join-room",
					roomId: id
				}))
			} else {
				socketInstance.onopen = () => {
					socketInstance.send(JSON.stringify({
						type: "join-room",
						roomId: id
					}))
				}
			}
			setIsStreaming(true);

		} catch (error) {
			console.error("Error starting stream:", error);
			alert("Failed to access camera. Please make sure you have granted camera permissions.");
		}
	}

	const stopStreaming = () => {
		if (stream()) {
			stream()?.getTracks().forEach(track => track.stop());
			setStream(null);
		}

		if (peerConnection) {
			peerConnection.close();
			peerConnection = null;
		}

		if (videoRef) {
			videoRef.srcObject = null;
		}

		socket()?.send(JSON.stringify({
			type: "leave-room",
			roomId: roomId()
		}))
		setIsStreaming(false);
		setRoomId("");
		setViewerUrl("");
	}

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(viewerUrl());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	}

	onMount(() => {
		initializeSocket();
	})

	onCleanup(() => {
		stopStreaming();
		socket()?.close();
	})

	return (
		<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div class="max-w-4xl mx-auto">
				<div class="bg-white rounded-2xl shadow-xl overflow-hidden">
					{/* Header */}
					<div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
						<h1 class="text-3xl font-bold mb-2">Webcam Streaming</h1>
						<p class="text-blue-100">Stream your webcam and view it on any device</p>
					</div>

					{/* Video Container */}
					<div class="p-6">
						<div class="relative bg-gray-900 rounded-xl overflow-hidden mb-6" style="aspect-ratio: 16/9;">
							<video
								ref={videoRef!}
								autoplay
								muted
								class="w-full h-full object-cover"
								classList={{
									"opacity-0": !isStreaming(),
								}}
							/>
							{!isStreaming() && (
								<div class="absolute inset-0 flex items-center justify-center">
									<div class="text-center text-gray-400">
										<Video size={64} class="mx-auto mb-4 opacity-50" />
										<p class="text-xl">Click "Start Streaming" to begin</p>
									</div>
								</div>
							)}
							{isStreaming() && (
								<div class="absolute top-4 left-4">
									<div class="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
										<div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
										LIVE
									</div>
								</div>
							)}
						</div>

						{/* Controls */}
						<div class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
							<button
								onClick={isStreaming() ? stopStreaming : startStreaming}
								class="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105"
								classList={{
									"bg-green-500 hover:bg-green-600 text-white": !isStreaming(),
									"bg-red-500 hover:bg-red-600 text-white": isStreaming(),
								}}
							>
								{isStreaming() ? (
									<>
										<VideoOff size={24} />
										Stop Streaming
									</>
								) : (
									<>
										<Video size={24} />
										Start Streaming
									</>
								)}
							</button>
						</div>

						{/* Sharing Section */}
						{isStreaming() && (
							<div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
								<div class="flex items-center gap-3 mb-4">
									<Share2 size={24} class="text-green-600" />
									<h3 class="text-lg font-semibold text-green-800">Share Your Stream</h3>
								</div>
								<p class="text-green-700 mb-4">
									Share this URL with others to let them view your stream on any device:
								</p>
								<div class="flex flex-col sm:flex-row gap-3">
									<input
										type="text"
										value={viewerUrl()}
										readonly
										class="flex-1 px-4 py-3 border border-green-300 rounded-lg bg-white font-mono text-sm"
									/>
									<button
										onClick={copyToClipboard}
										class="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
									>
										{copied() ? (
											<>
												<CheckCircle size={20} />
												Copied!
											</>
										) : (
											<>
												<Copy size={20} />
												Copy
											</>
										)}
									</button>
								</div>
								<p class="text-green-600 text-sm mt-3">
									Room ID: <span class="font-mono font-bold">{roomId()}</span>
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Instructions */}
				<div class="mt-8 bg-white rounded-xl shadow-lg p-6">
					<h3 class="text-xl font-semibold mb-4 text-gray-800">How to use:</h3>
					<div class="grid md:grid-cols-3 gap-6">
						<div class="text-center">
							<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<Video size={24} class="text-blue-600" />
							</div>
							<h4 class="font-semibold mb-2">1. Start Streaming</h4>
							<p class="text-gray-600 text-sm">Click "Start Streaming" and allow camera access</p>
						</div>
						<div class="text-center">
							<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<Share2 size={24} class="text-green-600" />
							</div>
							<h4 class="font-semibold mb-2">2. Share the Link</h4>
							<p class="text-gray-600 text-sm">Copy and share the viewer URL with others</p>
						</div>
						<div class="text-center">
							<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<Video size={24} class="text-purple-600" />
							</div>
							<h4 class="font-semibold mb-2">3. View on Mobile</h4>
							<p class="text-gray-600 text-sm">Others can watch your stream on any device</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}