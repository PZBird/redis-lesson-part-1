import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { session } from './session';

@Injectable()
export class AppService {
  constructor(@InjectRedis() private readonly redis: Redis) {}
  /**
   * Generate 10_000 key-value in string data type
   */
  async generateStrings() {
    const start = Date.now();
    const limit = 10_000;

    for (let i = 0; i < limit; i++) {
      const value = {
        id: i,
        username: (Math.random() + 1).toString(36).substring(7),
        lastname: (Math.random() + 1).toString(36).substring(7),
        age: Math.floor(Math.random() * 91 + 10),
      };

      await this.redis.set(`key:${i}`, JSON.stringify(value));
    }

    const end = Date.now();

    return `Strings. ${limit} keys generated in ${end - start}ms`;
  }

  /**
   * Run after generateStrings. Count all values where age >= 18
   */
  async readStrings() {
    const start = Date.now();
    let count = 0;

    for (let i = 0; i < 10_000; i++) {
      const val = JSON.parse(await this.redis.get(`key:${i}`));

      if (val.age >= 18) {
        count++;
      }
    }

    const end = Date.now();

    return {
      count,
      time: end - start,
    };
  }

  /**
   * Generate 10_000 key-value in hashes data type
   */
  async generateHashes() {
    const start = Date.now();
    const limit = 10_000;

    for (let i = 0; i < limit; i++) {
      const value = {
        id: i,
        username: (Math.random() + 1).toString(36).substring(7),
        lastname: (Math.random() + 1).toString(36).substring(7),
        age: Math.floor(Math.random() * 91 + 10),
      };

      await this.redis.hset(`h:key:${i}`, value);
    }

    const end = Date.now();

    return `Hashes. ${limit} keys generated in ${end - start}ms`;
  }

  /**
   * Run after generateHashes. Count all values where age >= 18
   */
  async readHashes() {
    const start = Date.now();

    let count = 0;

    for (let i = 0; i < 10_000; i++) {
      const age = await this.redis.hget(`h:key:${i}`, 'age');

      if (Number(age ?? 0) >= 18) {
        count++;
      }
    }

    const end = Date.now();

    return {
      count,
      time: end - start,
    };
  }

  /**
   * Flush redis db
   */
  async flushDB() {
    await this.redis.flushdb();
  }

  /**
   * save src/session.ts as string
   */
  async setSessionAsString() {
    await this.redis.set(session.sessionId, JSON.stringify(session));
  }

  /**
   * read src/session.ts 1000 times from string and get val.hugeParentObject.features?.feature12
   */
  async readSessionAsStringThousandTimes() {
    const start = Date.now();
    let val: typeof session;

    for (let i = 0; i < 1000; i++) {
      val = JSON.parse(await this.redis.get(session.sessionId));
    }

    const end = Date.now();

    return {
      time: end - start,
      feature12: val.hugeParentObject.features?.feature12,
      siteId: val.hugeParentObject.siteId,
      userId: val.userId,
    };
  }

  /**
   * save src/session.ts as hash
   */
  async readSessionAsHashThousandTimes() {
    const start = Date.now();
    const key = 'h' + session.sessionId;
    let val;

    for (let i = 0; i < 1000; i++) {
      val = await this.redis.hmget(key, 'userId', 'siteId');
    }

    const rawfeature12 = await this.redis.hget(
      'h_parent:' + val[1] + ':features',
      'feature12',
    );

    const feature12 = JSON.parse(rawfeature12);

    const end = Date.now();

    return {
      time: end - start,
      feature12,
      siteId: val[1],
      userId: val[0],
    };
  }

  /**
   * read src/session.ts 1000 times from hash and get val.hugeParentObject.features?.feature12
   */
  async setSessionAsHash() {
    const { hugeParentObject: parent, ...otherSession } = session;
    await this.redis.hset('h' + session.sessionId, {
      ...otherSession,
      siteId: parent.siteId,
    });

    if (!(await this.redis.exists('h_parent:' + parent.siteId))) {
      const { settings, content, someRef, features, ...mainBody } = parent;

      await Promise.all([
        this.redis.hset('h_parent:' + parent.siteId, mainBody),
        this.redis.hset('h_parent:' + parent.siteId + ':settings', settings),
        this.redis.hset('h_parent:' + parent.siteId + ':content', content),
        this.redis.hset('h_parent:' + parent.siteId + ':someRef', someRef),
        this.redis.hset(
          'h_parent:' + parent.siteId + ':features',
          new Map(
            Object.entries(features).map(([key, value]) => [
              key,
              typeof value === 'object' ? JSON.stringify(value) : value,
            ]),
          ),
        ),
      ]);
    }
  }
}
