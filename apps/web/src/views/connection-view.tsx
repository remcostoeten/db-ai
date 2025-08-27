import { createSignal } from 'solid-js';
import ConnectionGrid from '@/features/connections/components/connection-grid';
import { ConnectionModal } from '@/features/connections/components/connection-modal';
import type { TConnection } from '@/types/connection';
import { useOrpcQuery } from '@/hooks/use-orpc-query';
import { useOrpcMutation, mutations } from '@/hooks/use-orpc-mutation';
import { queries } from '@/hooks/use-orpc-query';
import { handleApiError } from '@/utils/error-handling';

export default function ConnectionView() {
	const [connections, { refetch }] = useOrpcQuery(
		queries.connections.getAll,
		{
			onError: (error) => handleApiError(error, 'Load Connections')
		}
	);
	
	const [open, setOpen] = createSignal(false);
	const [editing, setEditing] = createSignal<TConnection | null>(null);
	
	const deleteMutation = useOrpcMutation(mutations.connections.delete, {
		onSuccess: () => refetch(),
		onError: (error) => handleApiError(error, 'Delete Connection')
	});
	
	const createMutation = useOrpcMutation(mutations.connections.create, {
		onSuccess: () => {
			refetch();
			setOpen(false);
			setEditing(null);
		},
		onError: (error) => handleApiError(error, 'Create Connection')
	});
	
	const updateMutation = useOrpcMutation(mutations.connections.update, {
		onSuccess: () => {
			refetch();
			setOpen(false);
			setEditing(null);
		},
		onError: (error) => handleApiError(error, 'Update Connection')
	});
	
	async function handleDelete(id: string) {
		await deleteMutation.mutate({ id });
	}
	
	async function handleSave(data: Omit<TConnection, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) {
		if (editing()) {
			await updateMutation.mutate({ id: editing()!.id, ...data });
		} else {
			await createMutation.mutate(data);
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
