import { createForm } from '@tanstack/solid-form';
import { useNavigate } from '@solidjs/router';
import { For } from 'solid-js';
import { SignInSchema } from '@/features/auth/validations/auth';
import { authClient } from '@/core/utilities/auth-client';

const MIN_PASSWORD_LENGTH = 8;

type TProps = {
	onSwitchToSignUp: () => void;
};

export default function SignInForm(props: TProps) {
	const navigate = useNavigate();

	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: '',
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate('/dashboard');
						console.log('Sign in successful');
					},
					onError: (error) => {
						console.error(error.error.message);
					},
				}
			);
		},
		validators: {
			onSubmit: SignInSchema,
		},
	}));

	return (
		<div class="mx-auto mt-10 w-full max-w-md p-6">
			<h1 class="mb-6 text-center font-bold text-3xl">Welcome Back</h1>

			<form
				class="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
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
							{state().isSubmitting ? 'Submitting...' : 'Sign In'}
						</button>
					)}
				</form.Subscribe>
			</form>

			<div class="mt-4 text-center">
				<button
					class="text-indigo-600 text-sm hover:text-indigo-800 hover:underline"
					onClick={props.onSwitchToSignUp}
					type="button"
				>
					Need an account? Sign Up
				</button>
			</div>
		</div>
	);
}
