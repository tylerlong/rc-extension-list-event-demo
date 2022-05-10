import RingCentral from '@rc-ex/core';
import PubNubExtension from '@rc-ex/pubnub';
import waitFor from 'wait-for-async';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

const main = async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME!,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD!,
  });
  const pubnubExtension = new PubNubExtension();
  await rc.installExtension(pubnubExtension);
  await pubnubExtension.subscribe(
    ['/restapi/v1.0/account/~/extension'],
    event => {
      console.log(JSON.stringify(event, null, 2));
    }
  );
  for (let i = 0; i < 3; i++) {
    await waitFor({interval: 10000});
    await rc
      .restapi()
      .account()
      .extension()
      .put({
        contact: {
          firstName: `Test ${i}`,
        },
      });
    await waitFor({interval: 10000});
  }
  await rc.revoke();
};

main();
