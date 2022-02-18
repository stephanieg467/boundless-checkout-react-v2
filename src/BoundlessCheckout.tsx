import React, {Component, createRef, ReactNode, useEffect} from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import {disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks} from 'body-scroll-lock';
import '../styles/styles.scss';
import CheckoutApp from './App';
import {Provider} from 'react-redux';
import {store} from './redux/store';
import {setBasicProps, hideCheckout, showCheckout, TOnThankYouPage} from './redux/reducers/app';
import {BoundlessClient} from 'boundless-api-client';
import {BrowserRouter, useLocation, useNavigate} from 'react-router-dom';
import {useAppSelector} from './hooks/redux';

import 'nprogress/nprogress.css';

// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';

export default class BoundlessCheckout extends Component<IBoundlessCheckoutProps, {}> {
	private el: HTMLDivElement;
	private rootElRef: React.RefObject<HTMLDivElement>;

	constructor(props: IBoundlessCheckoutProps) {
		super(props);
		this.el = document.createElement('div');
		this.rootElRef = createRef();
	}

	componentDidMount() {
		document.body.appendChild(this.el);

		const {onHide, onThankYouPage, cartId, basename, api, logo} = this.props;
		store.dispatch(setBasicProps({
			onHide,
			onThankYouPage,
			cartId,
			basename,
			api,
			logo
		}));
		this.syncShowProp();
	}

	syncShowProp() {
		if (this.props.show) {
			store.dispatch(showCheckout());
		} else {
			store.dispatch(hideCheckout());
		}
	}

	componentDidUpdate(prevProps: Readonly<IBoundlessCheckoutProps>) {
		if (prevProps.show !== this.props.show) {
			this.syncShowProp();

			if (this.rootElRef.current) {
				if (this.props.show) {
					disableBodyScroll(this.rootElRef.current);
				} else {
					enableBodyScroll(this.rootElRef.current);
				}
			}
		}
	}

	componentWillUnmount() {
		clearAllBodyScrollLocks();
		document.body.removeChild(this.el);
	}

	render() {
		const {show, basename} = this.props;

		return ReactDOM.createPortal(
			<div className={clsx('bdl-checkout', {'bdl-checkout_show': show})}
					 ref={this.rootElRef}
			>
				<React.StrictMode>
					<Provider store={store}>
						<BrowserRouter basename={basename}>
							<WrappedApp />
						</BrowserRouter>
					</Provider>
				</React.StrictMode>
			</div>,
			this.el
		);
	}
}

interface IBoundlessCheckoutProps {
	cartId?: string,
	show: boolean,
	onHide: () => void,
	onThankYouPage: TOnThankYouPage,
	api: BoundlessClient,
	basename?: string,
	logo?: string|ReactNode
}

const WrappedApp = () => {
	// const location = useLocation();
	// const navigate = useNavigate();
	const show = useAppSelector((state) => state.app.show);

	useEffect(() => {
		/*
		Это не работает - если я нахожусь на /payment и делаю refresh, то перекинет на info (или current step),
		что неверно. Возможно, нужно на закрытии делать navigateTo(/checkout) (или этот кусок вынести в sample).
		Те явно когда пользователь кликнул close - тогда меняем url.

		if (!show) {
			if (location.pathname !== '/') {
				navigate('/', {replace: true});
			}
		}*/
	}, [show]);//eslint-disable-line

	return show ? <CheckoutApp /> : null;
};