import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import './styles/index.css';
import { ColorModeProvider, ColorModeScript } from '@kobalte/core';
import { Suspense } from 'solid-js';
import AdminView from '@/views/admin-view';
import ConnectionView from '@/views/connection-view';
import DashboardView from '@/views/dashboard-view';
import IndexView from '@/views/index-view';
import LoginView from '@/views/login-view';
import RootView from '@/views/root-view';
import TodosView from '@/views/todos-view';
import ConnectionsRoute from '@/routes/connections';
import ThemeProvider from '@/components/theme-provider';

function App() {
	return (
		<Suspense>
			<ColorModeScript />
			<ColorModeProvider 
				initialColorMode="dark"
			>
				<ThemeProvider>
					<Router root={RootView}>
						<Route component={IndexView} path="/" />
						<Route component={LoginView} path="/login" />
						<Route component={DashboardView} path="/dashboard" />
						<Route component={TodosView} path="/todos" />
						<Route component={AdminView} path="/admin" />
						<Route component={ConnectionsRoute} path="/connections" />
					</Router>
				</ThemeProvider>
			</ColorModeProvider>
		</Suspense>
	);
}
const rootElement = document.getElementById('app');
if (rootElement) {
	render(() => <App />, rootElement);
}
