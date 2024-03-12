import { startQueue } from './utils/tools';
import { PRICE_SCALE } from '@fastgpt/global/support/wallet/bill/constants';
import { initPg } from '@fastgpt/service/common/pg';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { connectMongo } from '@fastgpt/service/common/mongo/init';
import { hashStr } from '@fastgpt/global/common/string/tools';
import { createDefaultTeam } from '@fastgpt/service/support/user/team/controller';
import { exit } from 'process';

/**
 * connect MongoDB and init data
 */
export function connectToDatabase(): Promise<void> {
  return connectMongo({
    beforeHook: () => {},
    afterHook: () => {
      initPg();
      // start queue
      startQueue();
      return initRootUser();
    }
  });
}

async function initRootUser() {
  try {
    const rootUser = await MongoUser.findOne({
      username: 'root'
    });
    const psw = process.env.DEFAULT_ROOT_PSW || '123456';

    let rootId = rootUser?._id || '';

    // init root user
    if (rootUser) {
      await MongoUser.findOneAndUpdate(
        { username: 'root' },
        {
          password: hashStr(psw)
        }
      );
    } else {
      const { _id } = await MongoUser.create({
        username: 'root',
        password: hashStr(psw)
      });
      rootId = _id;
    }
    // init root team
    await createDefaultTeam({ userId: rootId, maxSize: 1, balance: 9999 * PRICE_SCALE });

    console.log(`root user init:`, {
      username: 'root',
      password: psw
    });
  } catch (error) {
    console.log('init root user error', error);
    exit(1);
  }
}
