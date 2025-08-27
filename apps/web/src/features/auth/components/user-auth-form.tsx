import { createForm } from '@tanstack/solid-form';
import { useNavigate } from '@tanstack/solid-router';
import { createSignal, For } from 'solid-js';
import { SignInSchema, SignUpSchema } from '@/features/auth/validations/auth';
import { authClient } from '@/lib/auth-client';
import { Button } from "@/shared/components/ui/button";
import { Grid } from "@/shared/components/ui/grid";
import { IconBrandGithub, IconLoader } from "@/shared/components/icons";
import { TextField, TextFieldInput, TextFieldLabel } from "@/shared/components/ui/text-field";

type TProps = {
  mode?: 'signin' | 'signup';
};

export function UserAuthForm(props: TProps) {
  const [isLoading, setIsLoading] = createSignal(false);
  const isSignUp = () => props.mode === 'signup';
  const navigate = useNavigate();

  const form = createForm(() => ({
    defaultValues: isSignUp() 
      ? { name: '', email: '', password: '' }
      : { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        if (isSignUp()) {
          await authClient.signUp.email(
            {
              email: value.email,
              password: value.password,
              name: value.name || '',
            },
            {
              onSuccess: () => {
                navigate({ to: '/dashboard' });
              },
              onError: (error) => {
                console.error(error.error.message);
              },
            }
          );
        } else {
          await authClient.signIn.email(
            {
              email: value.email,
              password: value.password,
            },
            {
              onSuccess: () => {
                navigate({ to: '/dashboard' });
              },
              onError: (error) => {
                console.error(error.error.message);
              },
            }
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: isSignUp() ? SignUpSchema : SignInSchema,
    },
  }));

  return (
    <div class="grid gap-6">
      <form
        class="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Grid class="gap-4">
          {isSignUp() && (
            <form.Field name="name">
              {(field) => (
                <TextField class="gap-1">
                  <TextFieldLabel class="sr-only">Name</TextFieldLabel>
                  <TextFieldInput
                    id={field().name}
                    name={field().name}
                    onBlur={field().handleBlur}
                    onInput={(e) => field().handleChange(e.currentTarget.value)}
                    value={field().state.value}
                    type="text"
                    placeholder="John Doe"
                  />
                  <For each={field().state.meta.errors}>
                    {(error) => (
                      <p class="text-red-600 text-sm">
                        {String(error)}
                      </p>
                    )}
                  </For>
                </TextField>
              )}
            </form.Field>
          )}
          
          <form.Field name="email">
            {(field) => (
              <TextField class="gap-1">
                <TextFieldLabel class="sr-only">Email</TextFieldLabel>
                <TextFieldInput
                  id={field().name}
                  name={field().name}
                  onBlur={field().handleBlur}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  value={field().state.value}
                  type="email"
                  placeholder="me@email.com"
                />
                <For each={field().state.meta.errors}>
                  {(error) => (
                    <p class="text-red-600 text-sm">
                      {error?.message}
                    </p>
                  )}
                </For>
              </TextField>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <TextField class="gap-1">
                <TextFieldLabel class="sr-only">Password</TextFieldLabel>
                <TextFieldInput
                  id={field().name}
                  name={field().name}
                  onBlur={field().handleBlur}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  value={field().state.value}
                  type="password"
                  placeholder="Password"
                />
                <For each={field().state.meta.errors}>
                  {(error) => (
                    <p class="text-red-600 text-sm">
                      {error?.message}
                    </p>
                  )}
                </For>
              </TextField>
            )}
          </form.Field>

          <form.Subscribe>
            {(state) => (
              <Button type="submit" disabled={!state().canSubmit || state().isSubmitting || isLoading()}>
                {(state().isSubmitting || isLoading()) && <IconLoader class="mr-2 size-4 animate-spin" />}
                                  {isSignUp() ? 'Create Account' : 'Sign In'}
              </Button>
            )}
          </form.Subscribe>
        </Grid>
      </form>
      
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <Button variant="outline" type="button" disabled={isLoading()}>
        {isLoading() ? (
          <IconLoader class="mr-2 size-4 animate-spin" />
        ) : (
          <IconBrandGithub class="mr-2 size-4" />
        )}
        Github
      </Button>
    </div>
  )
}