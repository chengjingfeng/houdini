// License: LGPL-3.0-or-later

import * as React from 'react';
import SignInPage from './SignInPage';

import { Hoster, HosterContext } from '../../hooks/useHoster';
import { Fallback } from './SignInPage';
import { SWRConfig } from 'swr';
import { rest } from 'msw';

import { postSignInRoute } from '../../api/users';
import { getCurrentRoute } from '../../api/api/users';
import { UserSignsInOnFirstAttempt } from '../../hooks/mocks/useCurrentUserAuth';
import { NotLoggedInStatus } from '../../hooks/useCurrentUser';
import { UserPresignedIn } from '../../api/api/mocks/users';

export default {
	title: 'users/SignInPage',
	argTypes: {
		hasHoster: {
			type: { name: 'boolean' },
			defaultValue: false,
			description: "Set whether the hoster is set",
		},
		hoster: {
			type: { name: 'string' },
			defaultValue: "Houdini Hoster LLC",
		},
	},
};

function SWRWrapper(props: React.PropsWithChildren<unknown>) {
	return <SWRConfig value={
		{
			dedupingInterval: 0, // we need to make SWR not dedupe
			revalidateOnMount: true,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			focusThrottleInterval: 0,
			provider: () => new Map(),
		}
	}>
		{props.children}
	</SWRConfig>;
}

interface TemplateArgs {
	hasHoster?: boolean;
	hoster: string;
}

const Template = (args: TemplateArgs) => {

	let hosterReturnValue: Hoster | null = null;
	if (args.hasHoster) {
		hosterReturnValue = { legal_name: args.hoster, casual_name: args.hoster, main_admin_email: 'none@none.none', support_email: 'none@none.none', terms_and_privacy: {} };
	}
	else {
		hosterReturnValue = null;
	}
	return <OuterWrapper key={Math.random()}><SWRWrapper>
		<HosterContext.Provider value={hosterReturnValue}>
			<SignInPage redirectUrl={'reload'} />
		</HosterContext.Provider>
	</SWRWrapper></OuterWrapper>;
};

function OuterWrapper(props: React.PropsWithChildren<Record<string, unknown>>) {
	sessionStorage.clear();
	return <> {props.children}</>;
}

const ErrorBoundaryTemplate = () => {
	return <Fallback />;
};


export const SignInFailed500 = Template.bind({});


SignInFailed500.story = {
	parameters: {
		msw: [
			rest.get(getCurrentRoute.url(), (_req, res, ctx) => {
				return res(
					ctx.status(NotLoggedInStatus)
				);
			}),
			rest.post(postSignInRoute.url(), (_req, res, ctx) => {
				return res(
					ctx.delay(5000),
					ctx.json({ error: "Some error" }),
					ctx.status(500)
				);
			}),
		],
	},
};



export const SignInSucceeded = Template.bind({});


SignInSucceeded.story = {
	parameters: {
		msw: [
			...UserSignsInOnFirstAttempt,
		],
	},
};

export const ShowErrorBoundary = ErrorBoundaryTemplate.bind({});

export const SignedInToStart = Template.bind({});
SignedInToStart.args = {
};

SignedInToStart.story = {
	parameters: {
		msw: [
			...UserPresignedIn,
		],
	},
};



