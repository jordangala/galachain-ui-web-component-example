import * as GalaChainAccess from '@jordangala/galachain-access';
import { GalaTransferToken } from '@jordangala/galachain-ui';

const chainBaseUri = 'http://localhost:3002/api';

const tokenClassKey = {
  collection: 'GALA',
  category: 'Unit',
  type: 'none',
  additionalKey: 'none',
};

// Force esbuild to bundle GalaTransferToken web component
new GalaTransferToken();

// --
// Helper function to wait for an element to be loaded

const waitUntil = (selector: string, fn: (element: Element) => void) => {
  const element = document.querySelector(selector);

  if (element) {
    fn(element);
  } else {
    setTimeout(() => waitUntil(selector, fn), 100);
  }
};

// --
// Wait for transfer-token web component to be loaded, then initialize the client,
// and attach event listeners to the transfer-token web component

waitUntil('#transfer-token', async (transferTokenElement: typeof GalaTransferToken) => {
  const chainMethods = GalaChainAccess.getChainMethods({
    chainBaseUri,
    signRequestBodyFn: GalaChainAccess.getSignRequestBodyWithPersonalSignPrefixFn(),
  });

  const ethereumWalletAddress = await GalaChainAccess.getEthereumWalletAddress();

  if (!ethereumWalletAddress) {
    return;
  }

  const owner = GalaChainAccess.getGalaChainAddress(ethereumWalletAddress);
  if (!owner) {
    return;
  }

  const submit = async (element: Element, fn: () => Promise<any>) => {
    element.setAttribute('loading', 'true');

    try {
      const response = await fn();
      if (response.ErrorCode) {
        throw new Error(response.Message);
      }
      return response.Data;
    } catch (exception) {
      if (typeof exception !== 'object') {
        alert(exception);
        throw new Error(`${exception}`);
      }

      if (!(exception instanceof Error)) {
        alert(JSON.stringify(exception));
        throw new Error(JSON.stringify(exception));
      }

      alert(exception.message);
      throw new Error(exception.message);
    } finally {
      element.removeAttribute('loading');
    }
  };

  if (!transferTokenElement) {
    throw new Error('Transfer Token Element not found');
  }

  transferTokenElement.addEventListener('submit', async (event: any) => {
    const galaTransferToken = document.getElementById('transfer-token') as typeof GalaTransferToken;

    // const payload = event.detail[0];

    console.log('event.detail', event.detail);

    const response = await submit(galaTransferToken, async () => {
      const requestBody = event.detail[0];

      if (!GalaChainAccess.isGalaChainClientAddress(requestBody.to)) {
        alert('Invalid to address');
      }

      return chainMethods.transferToken(requestBody);
    });

    alert(JSON.stringify(response));
  });

  transferTokenElement.addEventListener('error', async (event: any) => {
    const payload = event.detail[0];

    alert(JSON.stringify(payload));
  });

  const balancesResponse = await chainMethods.fetchBalances({
    owner,
    collection: 'GALA',
  });

  if ('exception' in balancesResponse) {
    return;
  }

  const balance = balancesResponse.response.body.Data[0];

  console.log('👉 Using balance', balance);

  transferTokenElement.tokenBalance = {
    balance,
    token: tokenClassKey,
  };
});
