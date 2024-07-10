import { GalachainConnectClient, TokenClient } from '@gala-chain/connect';
import { GalaTransferToken } from '@jordangala/galachain-ui';

// --
// Config

const gatewayUri = 'http://localhost:3002/api/asset/token-contract';

const tokenClassKey = {
  collection: 'LastExpedition',
  category: 'Unit',
  type: 'LEMinerals',
  additionalKey: 'none',
};

// const tokenClassKey = {
//   collection: 'GALA',
//   category: 'Unit',
//   type: 'none',
//   additionalKey: 'none',
// };

// --
// TODO
type TODO = any;

const TODO_UnneededTransferTokenRequestParams = {
  validate: undefined as TODO,
  validateOrReject: undefined as TODO,
  serialize: undefined as TODO,
  sign: undefined as TODO,
  signed: undefined as TODO,
  isSignatureValid: undefined as TODO,
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
  const connectClient = new GalachainConnectClient(gatewayUri);

  await connectClient.connectToMetaMask();
  // const address = connectClient.address;
  const address = 'client|6617fdcffbe793ab3db0594d';

  const tokenClient = new TokenClient(connectClient);

  console.log('👉 Using address', address);

  const submit = async (element: Element, method: string, payload: Object) => {
    element.setAttribute('loading', 'true');

    try {
      const response = await (tokenClient as TODO)[method](payload);
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

    const payload = event.detail[0];
    const response = await submit(galaTransferToken, 'TransferToken', {
      ...payload,
      uniqueKey: 'my-unique-key',
    });

    alert(JSON.stringify(response));
  });

  transferTokenElement.addEventListener('error', async (event: any) => {
    const payload = event.detail[0];

    alert(JSON.stringify(payload));
  });

  const balancesResponse = await tokenClient.FetchBalances({
    owner: address,
    ...tokenClassKey,
    ...TODO_UnneededTransferTokenRequestParams,
  });

  const balance = balancesResponse.Data[0];

  console.log('👉 Using balance', balance);

  transferTokenElement.tokenBalance = {
    balance,
    token: tokenClassKey,
  };
});
