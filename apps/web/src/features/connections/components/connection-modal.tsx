import { Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { TConnection } from '@/types/connection';

type TProps = {
	connection: Partial<TConnection> & Pick<TConnection, 'type' | 'name' | 'url'>;
	onSave: (connection: Omit<TConnection, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => void;
	onClose: () => void;
};

export function ConnectionModal(props: TProps) {
	const [form, setForm] = createStore({
		type: props.connection.type || 'postgres',
		name: props.connection.name || '',
		description: props.connection.description || '',
		color: props.connection.color || '',
		url: props.connection.url || '',
		authToken: props.connection.authToken || '',
	});

	function handleSubmit() {
		// Basic validation
		if (!form.name.trim()) {
			alert('Name is required');
			return;
		}
		if (!form.url.trim()) {
			alert('URL is required');
			return;
		}

		// Ensure URL has proper protocol
		let url = form.url.trim();
		if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('postgresql://') && !url.startsWith('libsql://')) {
			if (form.type === 'postgres') {
				url = 'postgresql://' + url;
			} else if (form.type === 'libsql') {
				url = 'libsql://' + url;
			} else {
				url = 'https://' + url;
			}
		}

		const connectionData = {
			type: form.type,
			name: form.name.trim(),
			description: form.description.trim() || '',
			color: form.color.trim() || '#3b82f6',
			url: url,
			authToken: form.authToken.trim() || '',
		};
		
		console.log('Sending connection data:', JSON.stringify(connectionData, null, 2));
		props.onSave(connectionData);
		props.onClose();
	}

	return (
		<div class="fixed inset-0 flex items-center justify-center bg-black/50">
			<div class="w-96 rounded bg-white p-6 shadow">
				<h2>{props.connection.id ? 'Edit' : 'Add'} Connection</h2>

				<select
					onChange={(e) => setForm('type', e.target.value)}
					value={form.type}
				>
					<option value="postgres">Postgres</option>
					<option value="libsql">LibSQL</option>
				</select>

				<input
					onChange={(e) => setForm('name', e.target.value)}
					placeholder="Name"
					value={form.name}
				/>

				<input
					onChange={(e) => setForm('url', e.target.value)}
					placeholder="Database URL"
					value={form.url}
				/>

				<input
					onChange={(e) => setForm('description', e.target.value)}
					placeholder="Description (optional)"
					value={form.description}
				/>

				<input
					type="color"
					onChange={(e) => setForm('color', e.target.value)}
					value={form.color || '#3b82f6'}
				/>

				<Show when={form.type === 'libsql'}>
					<input
						onChange={(e) => setForm('authToken', e.target.value)}
						placeholder="Auth Token"
						value={form.authToken}
					/>
				</Show>

				<button onClick={handleSubmit} type="button">
					Save
				</button>
				<button onClick={props.onClose} type="button">
					Cancel
				</button>
			</div>
		</div>
	);
}
