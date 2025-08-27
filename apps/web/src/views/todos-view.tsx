import { Loader2, Trash2 } from 'lucide-solid';
import { createSignal, For, Show, createResource } from 'solid-js';
import { client } from '@/utils/orpc';



export default function TodosView() {
	const [newTodoText, setNewTodoText] = createSignal('');
	const [isCreating, setIsCreating] = createSignal(false);
	const [isToggling, setIsToggling] = createSignal<number | null>(null);
	const [isDeleting, setIsDeleting] = createSignal<number | null>(null);

	const [todos, { refetch }] = createResource(() => client.todo.getAll());

	async function handleAddTodo(e: Event) {
		e.preventDefault();
		const text = newTodoText().trim();
		if (!text) return;

		setIsCreating(true);
		try {
			await client.todo.create({ text });
			setNewTodoText('');
			await refetch();
		} catch (error) {
			console.error('Failed to create todo:', error);
		} finally {
			setIsCreating(false);
		}
	}

	async function handleToggleTodo(id: number, completed: boolean) {
		setIsToggling(id);
		try {
			await client.todo.toggle({ id, completed: !completed });
			await refetch();
		} catch (error) {
			console.error('Failed to toggle todo:', error);
		} finally {
			setIsToggling(null);
		}
	}

	async function handleDeleteTodo(id: number) {
		setIsDeleting(id);
		try {
			await client.todo.delete({ id });
			await refetch();
		} catch (error) {
			console.error('Failed to delete todo:', error);
		} finally {
			setIsDeleting(null);
		}
	}

	return (
		<div class="mx-auto w-full max-w-md py-10">
			<div class="rounded-lg border p-6 shadow-sm">
				<div class="mb-4">
					<h2 class="font-semibold text-xl">Todo List</h2>
					<p class="text-sm">Manage your tasks efficiently</p>
				</div>
				<div>
					<form
						class="mb-6 flex items-center space-x-2"
						onSubmit={handleAddTodo}
					>
						<input
							class="w-full rounded-md border p-2 text-sm"
							disabled={isCreating()}
							onInput={(e) =>
								setNewTodoText(e.currentTarget.value)
							}
							placeholder="Add a new task..."
							type="text"
							value={newTodoText()}
						/>
						<button
							class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
							disabled={
								isCreating() ||
								!newTodoText().trim()
							}
							type="submit"
						>
							<Show
								fallback="Add"
								when={isCreating()}
							>
								<Loader2 class="h-4 w-4 animate-spin" />
							</Show>
						</button>
					</form>

					<Show when={todos.loading}>
						<div class="flex justify-center py-4">
							<Loader2 class="h-6 w-6 animate-spin" />
						</div>
					</Show>

					<Show when={!todos.loading && todos()?.length === 0}>
						<p class="py-4 text-center">
							No todos yet. Add one above!
						</p>
					</Show>

					<Show when={!todos.loading && todos()}>
						<ul class="space-y-2">
							<For each={todos()}>
								{(todo) => (
									<li class="flex items-center justify-between rounded-md border p-2">
										<div class="flex items-center space-x-2">
											<input
												checked={todo.completed}
												class="h-4 w-4"
												disabled={isToggling() === todo.id}
												id={`todo-${todo.id}`}
												onChange={() =>
													handleToggleTodo(
														todo.id,
														todo.completed
													)
												}
												type="checkbox"
											/>
											<label
												class={
													todo.completed
														? 'line-through'
														: ''
												}
												for={`todo-${todo.id}`}
											>
												{todo.text}
											</label>
										</div>
										<button
											aria-label="Delete todo"
											class="ml-2 rounded-md p-1 disabled:opacity-50"
											disabled={isDeleting() === todo.id}
											onClick={() =>
												handleDeleteTodo(todo.id)
											}
											type="button"
										>
											<Show
												when={isDeleting() === todo.id}
												fallback={<Trash2 class="h-4 w-4" />}
											>
												<Loader2 class="h-4 w-4 animate-spin" />
											</Show>
										</button>
									</li>
								)}
							</For>
						</ul>
					</Show>
				</div>
			</div>
		</div>
	);
}
