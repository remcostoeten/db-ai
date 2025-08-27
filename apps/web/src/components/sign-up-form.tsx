import { useNavigate } from '@solidjs/router';
import { createForm } from '@tanstack/solid-form';
import { For } from 'solid-js';
import { SignUpSchema } from '@/features/auth/validations/auth';
import { authClient } from '@/core/utilities/auth-client';

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const navigate = useNavigate();

	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: '',
			name: '',
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate('/dashboard');
						console.log('Sign up successful');
					},
					onError: (error) => {
						console.error(error.error.message);
					},
				}
			);
		},
		validators: {
			onSubmit: SignUpSchema,
		},
	}));

	return (
		<div class="mx-auto mt-10 w-full max-w-md p-6">
			<h1 class="mb-6 text-center font-bold text-3xl">Create Account</h1>

			<form
				class="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div>
					<form.Field name="name">
						{(field) => (
							<div class="space-y-2">
								<label for={field().name}>Name</label>
								<input
									class="w-full rounded border p-2"
									id={field().name}
									name={field().name}
									onBlur={field().handleBlur}
									onInput={(e) =>
										field().handleChange(
											e.currentTarget.value
										)
									}
									value={field().state.value}
								/>
								<For each={field().state.meta.errors}>
									{(error) => (
										<p class="text-red-600 text-sm">
											{error?.message}
										</p>
									)}
								</For>
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="email">
						{(field) => (
							<div class="space-y-2">
								<label for={field().name}>Email</label>
								<input
									class="w-full rounded border p-2"
									id={field().name}
									name={field().name}
									onBlur={field().handleBlur}
									onInput={(e) =>
										field().handleChange(
											e.currentTarget.value
										)
									}
									type="email"
									value={field().state.value}
								/>
								<For each={field().state.meta.errors}>
									{(error) => (
										<p class="text-red-600 text-sm">
											{error?.message}
										</p>
									)}
								</For>
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<div class="space-y-2">
								<label for={field().name}>Password</label>
								<input
									class="w-full rounded border p-2"
									id={field().name}
									name={field().name}
									onBlur={field().handleBlur}
									onInput={(e) =>
										field().handleChange(
											e.currentTarget.value
										)
									}
									type="password"
									value={field().state.value}
								/>
								<For each={field().state.meta.errors}>
									{(error) => (
										<p class="text-red-600 text-sm">
											{error?.message}
										</p>
									)}
								</For>
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<button
							class="w-full rounded bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50"
							disabled={
								!state().canSubmit || state().isSubmitting
							}
							type="submit"
						>
							{state().isSubmitting ? 'Submitting...' : 'Sign Up'}
						</button>
					)}
				</form.Subscribe>
			</form>

			<div class="mt-4 text-center">
				<button
					class="text-indigo-600 text-sm hover:text-indigo-800 hover:underline"
					onClick={onSwitchToSignIn}
					type="button"
				>
					Already have an account? Sign In
				</button>
			</div>
		</div>
	);
}
