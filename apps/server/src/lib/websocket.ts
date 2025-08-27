interface Room {
	streamer?: WebSocket;
	viewers: Set<WebSocket>;
}

interface WebSocketMessage {
	type: 'join-room' | 'join-viewer' | 'offer' | 'answer' | 'ice-candidate' | 'leave-room';
	roomId?: string;
	data?: any;
}

export class WebRTCSignalingServer {
	private rooms: Map<string, Room> = new Map();

	handleWebSocket(webSocket: WebSocket) {
		webSocket.addEventListener('message', (event) => {
			try {
				const message: WebSocketMessage = JSON.parse(event.data);
				this.handleMessage(webSocket, message);
			} catch (error) {
				console.error('Invalid WebSocket message:', error);
			}
		});

		webSocket.addEventListener('close', () => {
			this.handleDisconnect(webSocket);
		});
	}

	private handleMessage(ws: WebSocket, message: WebSocketMessage) {
		const { type, roomId, data } = message;

		if (!roomId && type !== 'leave-room') {
			return;
		}

		switch (type) {
			case 'join-room':
				this.handleStreamerJoin(ws, roomId!);
				break;
			
			case 'join-viewer':
				this.handleViewerJoin(ws, roomId!);
				break;
			
			case 'offer':
				this.handleOffer(ws, roomId!, data);
				break;
			
			case 'answer':
				this.handleAnswer(ws, roomId!, data);
				break;
			
			case 'ice-candidate':
				this.handleIceCandidate(ws, roomId!, data);
				break;
			
			case 'leave-room':
				this.handleLeave(ws, roomId);
				break;
		}
	}

	private handleStreamerJoin(ws: WebSocket, roomId: string) {
		if (!this.rooms.has(roomId)) {
			this.rooms.set(roomId, { viewers: new Set() });
		}

		const room = this.rooms.get(roomId)!;
		
		// If there's already a streamer, reject
		if (room.streamer) {
			ws.send(JSON.stringify({ type: 'error', message: 'Room already has a streamer' }));
			return;
		}

		room.streamer = ws;
		
		// Notify all viewers that streamer has joined
		room.viewers.forEach(viewer => {
			viewer.send(JSON.stringify({ type: 'streamer-joined' }));
		});
	}

	private handleViewerJoin(ws: WebSocket, roomId: string) {
		if (!this.rooms.has(roomId)) {
			this.rooms.set(roomId, { viewers: new Set() });
		}

		const room = this.rooms.get(roomId)!;
		room.viewers.add(ws);

		// If streamer is already present, notify viewer
		if (room.streamer) {
			ws.send(JSON.stringify({ type: 'streamer-joined' }));
		}
	}

	private handleOffer(ws: WebSocket, roomId: string, offer: RTCSessionDescriptionInit) {
		const room = this.rooms.get(roomId);
		if (!room || !room.streamer) return;

		// Forward offer from viewer to streamer
		room.streamer.send(JSON.stringify({ 
			type: 'offer', 
			data: offer,
			viewerId: this.getConnectionId(ws)
		}));
	}

	private handleAnswer(ws: WebSocket, roomId: string, answer: RTCSessionDescriptionInit) {
		const room = this.rooms.get(roomId);
		if (!room) return;

		// Forward answer from streamer to all viewers
		room.viewers.forEach(viewer => {
			viewer.send(JSON.stringify({ type: 'answer', data: answer }));
		});
	}

	private handleIceCandidate(ws: WebSocket, roomId: string, candidate: RTCIceCandidateInit) {
		const room = this.rooms.get(roomId);
		if (!room) return;

		// Forward ICE candidate
		if (ws === room.streamer) {
			// From streamer to all viewers
			room.viewers.forEach(viewer => {
				viewer.send(JSON.stringify({ type: 'ice-candidate', data: candidate }));
			});
		} else {
			// From viewer to streamer
			if (room.streamer) {
				room.streamer.send(JSON.stringify({ type: 'ice-candidate', data: candidate }));
			}
		}
	}

	private handleLeave(ws: WebSocket, roomId?: string) {
		if (roomId) {
			const room = this.rooms.get(roomId);
			if (!room) return;

			if (ws === room.streamer) {
				// Streamer left, notify all viewers
				room.viewers.forEach(viewer => {
					viewer.send(JSON.stringify({ type: 'streamer-left' }));
				});
				room.streamer = undefined;
			} else {
				// Viewer left
				room.viewers.delete(ws);
			}

			// Clean up empty rooms
			if (!room.streamer && room.viewers.size === 0) {
				this.rooms.delete(roomId);
			}
		}
	}

	private handleDisconnect(ws: WebSocket) {
		// Find and remove the websocket from any room
		for (const [roomId, room] of this.rooms.entries()) {
			if (ws === room.streamer) {
				// Streamer disconnected
				room.viewers.forEach(viewer => {
					viewer.send(JSON.stringify({ type: 'streamer-left' }));
				});
				room.streamer = undefined;
			} else {
				room.viewers.delete(ws);
			}

			// Clean up empty rooms
			if (!room.streamer && room.viewers.size === 0) {
				this.rooms.delete(roomId);
			}
		}
	}

	private getConnectionId(ws: WebSocket): string {
		// Generate a unique ID for this connection
		return Math.random().toString(36).substr(2, 9);
	}
}