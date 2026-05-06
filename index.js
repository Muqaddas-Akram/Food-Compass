import { registerRootComponent } from 'expo';

import App from './App';

if (__DEV__) {
	const SUPPRESSED_MESSAGES = [
		'props.pointerEvents is deprecated. Use style.pointerEvents',
		'Cannot record touch end without a touch start.',
		'SES Removing unpermitted intrinsics',
		'Running application "main" with appParams',
	];

	const shouldSuppress = (args) => {
		const message = args
			.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
			.join(' ');

		return SUPPRESSED_MESSAGES.some((text) => message.includes(text));
	};

	const originalWarn = console.warn;
	const originalError = console.error;

	console.warn = (...args) => {
		if (shouldSuppress(args)) return;
		originalWarn(...args);
	};

	console.error = (...args) => {
		if (shouldSuppress(args)) return;
		originalError(...args);
	};
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
