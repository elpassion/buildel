import { MockedRequest } from 'msw';

// NOTE (hub33k): copied from msw source code
interface UnhandledRequestPrint {
  warning(): void;
  error(): void;
}

const IS_BROWSER = typeof window !== 'undefined';

export const setupMocks = async () => {
  if (IS_BROWSER) {
    const { browser } = await require('./browser');
    await browser.start({
      onUnhandledRequest: (
        request: MockedRequest,
        print: UnhandledRequestPrint,
      ) => {
        if (
          request.url.pathname.startsWith('/_next') ||
          request.url.pathname.startsWith('/favicon.ico')
        ) {
          return;
        }

        print.warning();
      },
    });
    // console.log('Mocks server started');
  } else {
    const { server } = await import('./server');
    server.listen({ onUnhandledRequest: 'bypass' });
    // console.log('Mocks server listening');
  }
};

setupMocks().then(() => {
  // console.log('Mocks initialized');
});

export default setupMocks;
