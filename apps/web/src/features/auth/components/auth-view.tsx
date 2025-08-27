import { createSignal } from 'solid-js';
import { cn } from "@/shared/utilities"
import { IconCommand } from "@/shared/components/icons"
import { buttonVariants } from "@/shared/components/ui/button"
import { UserAuthForm } from './user-auth-form';

type TProps = {
  defaultMode?: 'signin' | 'signup';
};

export function Authentication(props: TProps) {
  const [isSignUp, setIsSignUp] = createSignal(props.defaultMode === 'signup');
  return (
    <>
      <div class="md:hidden">
        <img
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          class="block dark:hidden"
        />
        <img
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          class="hidden dark:block"
        />
      </div>
      <div class="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <button
          class={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
          onClick={() => setIsSignUp(!isSignUp())}
        >
          {isSignUp() ? 'Sign In' : 'Sign Up'}
        </button>
        <div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div class="absolute inset-0 bg-zinc-900" />
          <div class="relative z-20 flex items-center text-lg font-medium">
            <IconCommand class="mr-2 size-6" />
            DB Studio
          </div>
          <div class="relative z-20 mt-auto">
            <blockquote class="space-y-2">
              <p class="text-lg">
                &ldquo;This library has saved me countless hours of work and helped me deliver
                stunning designs to my clients faster than ever before.&rdquo;
              </p>
              <footer class="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        <div class="lg:p-8">
          <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col space-y-2 text-center">
              <h1 class="text-2xl font-semibold tracking-tight">
                {isSignUp() ? 'Create an account' : 'Welcome back'}
              </h1>
              <p class="text-sm text-muted-foreground">
                {isSignUp() 
                  ? 'Enter your email below to create your account'
                  : 'Enter your email and password to sign in'
                }
              </p>
            </div>
            <UserAuthForm mode={isSignUp() ? 'signup' : 'signin'} />
            <p class="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <a href="/terms" class="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" class="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}