import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, Match, Switch, Show } from "solid-js";
import { useGuestGuard } from "@/lib/route-guards";
import { Loader2 } from "lucide-solid";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const session = useGuestGuard(navigate);
	const [showSignIn, setShowSignIn] = createSignal(false);

	// Show loading while checking auth
	if (session().isPending) {
		return (
			<div class="flex justify-center items-center min-h-[400px]">
				<Loader2 class="w-8 h-8 animate-spin text-blue-600" />
			</div>
		);
	}

	return (
		<Switch>
			<Match when={showSignIn()}>
				<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
			</Match>
			<Match when={!showSignIn()}>
				<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
			</Match>
		</Switch>
	);
}
