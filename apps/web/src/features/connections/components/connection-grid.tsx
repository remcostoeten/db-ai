import { For } from 'solid-js';
import type { TConnection } from '@/types/connection';

type TProps = {
	list: () => TConnection[];
	onEdit: (c: TConnection) => void;
	onDelete: (id: string) => void;
};

export default function ConnectionGrid(props: TProps) {
	function handleDelete(c: TConnection) {
		props.onDelete(c.id);
	}

	return (
		<div class="mt-4 grid grid-cols-3 gap-4">
			<For each={props.list()}>
				{(c) => (
					<div class="flex flex-col justify-between rounded-lg border p-4">
						<div>
							<div class="font-semibold">{c.name}</div>
							<div class="text-gray-600 text-sm">{c.url}</div>
							<div class="text-gray-500 text-xs">{c.type}</div>
						</div>
						<div class="mt-3 flex justify-end gap-2">
							<button
								class="rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600"
								onClick={() => props.onEdit(c)}
							>
								Edit
							</button>
							<button
								class="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
								onClick={() => handleDelete(c)}
							>
								Delete
							</button>
						</div>
					</div>
				)}
			</For>
		</div>
	);
}
