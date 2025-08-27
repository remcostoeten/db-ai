import { createSignal, createResource } from 'solid-js';
import ConnectionGrid from '@/features/connections/components/connection-grid';
import { ConnectionModal } from '@/features/connections/components/connection-modal';
import type { TConnection } from '@/types/connection';
import { client } from '@/utils/orpc';

export default function ConnectionView() {
	const [connections, { refetch }] = createResource(async () => {
		const result = await client.connection.getAll();
		return result as TConnection[];
	});
	const [open, setOpen] = createSignal(false);
	const [editing, setEditing] = createSignal<TConnection | null>(null);
	
	async function handleDelete(id: string) {
		try {
			await client.connection.delete({ id });
			await refetch();
		} catch (error) {
			console.error('Failed to delete connection:', error);
		}
	}
	
	async function handleSave(data: Omit<TConnection, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) {
		try {
			console.log('handleSave received data:', JSON.stringify(data, null, 2));
			if (editing()) {
				console.log('Updating connection:', editing()!.id);
				await client.connection.update({ id: editing()!.id, ...data });
			} else {
				console.log('Creating new connection');
				await client.connection.create(data);
			}
			await refetch();
			setOpen(false);
			setEditing(null);
		} catch (error) {
			console.error('Failed to save connection:', error);
			console.error('Error details:', error);
		}
	}

	return (
		<div class="p-4">
			<button
				class="rounded bg-blue-600 px-3 py-2 text-white"
				onClick={() => {
					setEditing(null);
					setOpen(true);
				}}
			>
				New Connection
			</button>

			<ConnectionGrid
				list={() => connections() || []}
				onEdit={(c) => {
					setEditing(c);
					setOpen(true);
				}}
				onDelete={handleDelete}
			/>

			{open() && (
				<ConnectionModal
					connection={editing() || { 
						type: 'postgres', 
						name: '', 
						url: '',
						authToken: '',
						description: '',
						color: ''
					}}
					onSave={handleSave}
					onClose={() => {
						setOpen(false);
						setEditing(null);
					}}
				/>
			)}
		</div>
	);
}
