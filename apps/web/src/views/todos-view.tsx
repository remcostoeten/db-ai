import { Loader2, Trash2 } from 'lucide-solid';
import { createSignal, For, Show } from 'solid-js';
import { useOrpcQuery, queries } from '@/hooks/use-orpc-query';
import { useOrpcMutation, mutations } from '@/hooks/use-orpc-mutation';
import { handleApiError } from '@/utils/error-handling';

export default function TodosView() {
	const [newTodoText, setNewTodoText] = createSignal('');
	const [isToggling, setIsToggling] = createSignal<number | null>(null);
	const [isDeleting, setIsDeleting] = createSignal<number | null>(null);

	const [todos, { refetch }] = useOrpcQuery(
		queries.todos.getAll,
		{
			onError: (error) => handleApiError(error, 'Load Todos')
		}
	);

	const createMutation = useOrpcMutation(mutations.todos.create, {
		onSuccess: () => {
			setNewTodoText('');
			refetch();
		},
		onError: (error) => handleApiError(error, 'Create Todo')
	});

	const toggleMutation = useOrpcMutation(mutations.todos.toggle, {
		onSuccess: () => {
			setIsToggling(null);
			refetch();
		},
		onError: (error) => {
			setIsToggling(null);
			handleApiError(error, 'Toggle Todo');
		}
	});

	const deleteMutation = useOrpcMutation(mutations.todos.delete, {
		onSuccess: () => {
			setIsDeleting(null);
			refetch();
		},
		onError: (error) => {
			setIsDeleting(null);
			handleApiError(error, 'Delete Todo');
		}
	});

	async function handleAddTodo(e: Event) {
		e.preventDefault();
		const text = newTodoText().trim();
		if (!text) return;

		await createMutation.mutate({ text });
	}

	async function handleToggleTodo(id: number, completed: boolean) {
		setIsToggling(id);
		await toggleMutation.mutate({ id, completed: !completed });
	}

	async function handleDeleteTodo(id: number) {
		setIsDeleting(id);
		await deleteMutation.mutate({ id });
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
							disabled={createMutation.isLoading()}
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
								createMutation.isLoading() ||
								!newTodoText().trim()
							}
							type="submit"
						>
							<Show
								fallback="Add"
								when={createMutation.isLoading()}
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
