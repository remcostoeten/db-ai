import { createFileRoute } from "@tanstack/solid-router";
import { Loader2, Trash2, Plus } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";
import { useAuthGuard } from "@/lib/route-guards";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from "@/lib/orpc-hooks";

export const Route = createFileRoute("/todos")({
	component: TodosRoute,
});

function TodosRoute() {
	const navigate = Route.useNavigate();
	const session = useAuthGuard(navigate);
	const [newTodoText, setNewTodoText] = createSignal("");

	// Use standardized hooks
	const todos = useTodos();
	const createTodo = useCreateTodo();
	const toggleTodo = useToggleTodo();
	const deleteTodo = useDeleteTodo();

	const handleAddTodo = (e: Event) => {
		e.preventDefault();
		if (newTodoText().trim()) {
			createTodo().createTodo({ text: newTodoText() });
			setNewTodoText(""); // Clear form on success
		}
	};

	const handleToggleTodo = (id: number, completed: boolean) => {
		toggleTodo().toggleTodo({ id, completed: !completed });
	};

	const handleDeleteTodo = (id: number) => {
		deleteTodo().deleteTodo({ id });
	};

	// Show loading state while checking auth
	if (session().isPending) {
		return (
			<div class="flex justify-center items-center min-h-[400px]">
				<Loader2 class="w-8 h-8 animate-spin text-blue-600" />
			</div>
		);
	}

	return (
		<ComponentErrorBoundary name="Todos">
			<div class="mx-auto w-full max-w-md py-10">
			<div class="rounded-lg border p-6 shadow-sm">
				<div class="mb-4">
					<h2 class="text-xl font-semibold">Todo List</h2>
					<p class="text-sm">Manage your tasks efficiently</p>
				</div>
				<div>
					<form
						onSubmit={handleAddTodo}
						class="mb-6 flex items-center space-x-2"
					>
						<input
							type="text"
							value={newTodoText()}
							onInput={(e) => setNewTodoText(e.currentTarget.value)}
							placeholder="Add a new task..."
							disabled={createTodo().isLoading}
							class="w-full rounded-md border p-2 text-sm"
						/>
						<button
							type="submit"
							disabled={createTodo().isLoading || !newTodoText().trim()}
							class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
						>
							<Show when={createTodo().isLoading} fallback="Add">
								<Loader2 class="h-4 w-4 animate-spin" />
							</Show>
						</button>
					</form>

					<Show when={todos().isLoading}>
						<div class="flex justify-center py-4">
							<Loader2 class="h-6 w-6 animate-spin" />
						</div>
					</Show>

					<Show when={todos().isEmpty}>
						<p class="py-4 text-center">No todos yet. Add one above!</p>
					</Show>

					<Show when={!todos().isLoading && !todos().isEmpty}>
						<ul class="space-y-2">
							<For each={todos().todos}>
								{(todo) => (
									<li class="flex items-center justify-between rounded-md border p-2">
										<div class="flex items-center space-x-2">
											<input
												type="checkbox"
												checked={todo.completed}
												onChange={() =>
													handleToggleTodo(todo.id, todo.completed)
												}
												id={`todo-${todo.id}`}
												class="h-4 w-4"
											/>
											<label
												for={`todo-${todo.id}`}
												class={todo.completed ? "line-through" : ""}
											>
												{todo.text}
											</label>
										</div>
										<button
											type="button"
											onClick={() => handleDeleteTodo(todo.id)}
											disabled={deleteTodo().isLoading}
											aria-label="Delete todo"
											class="ml-2 rounded-md p-1 disabled:opacity-50"
										>
											<Trash2 class="h-4 w-4" />
										</button>
									</li>
								)}
							</For>
						</ul>
					</Show>
				</div>
			</div>
		</div>
		</ComponentErrorBoundary>
	);
}
