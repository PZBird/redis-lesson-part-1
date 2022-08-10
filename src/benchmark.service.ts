import * as Benchmark from 'benchmark';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class BenchMarkService {
  USE_OPTIMIZATION = true;

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Compare set hashes and set strings benchmarks
   */
  async testForSet() {
    const suite = new Benchmark.Suite();
    return new Promise((resolve) => {
      suite
        .add('setHashes', {
          defer: true,
          fn: async (deferred) => {
            await this.generateHashes();
            deferred.resolve();
          },
        })
        .add('setStrings', {
          defer: true,
          fn: async (deferred) => {
            await this.generateStrings();
            deferred.resolve();
          },
        })
        .on('cycle', function (event) {
          console.log(String(event.target));
        })
        .on('complete', function () {
          console.log('Fastest is ' + this.filter('fastest').map('name'));
          resolve(this);
        })
        .run({ async: true });
    });
  }

  /**
   * Compare get hashes and get strings benchmarks
   */
  async testForRead() {
    const suite = new Benchmark.Suite();

    return new Promise((resolve) => {
      suite
        .add('readHashes', {
          defer: true,
          fn: async (deferred) => {
            await this.readHashes();
            deferred.resolve();
          },
        })
        .add('readStrings', {
          defer: true,
          fn: async (deferred) => {
            await this.readStrings();
            deferred.resolve();
          },
        })
        .on('cycle', function (event) {
          console.log(String(event.target));
        })
        .on('complete', function () {
          console.log('Fastest is ' + this.filter('fastest').map('name'));
          resolve(this);
        })
        .run({ async: true });
    });
  }

  async generateStrings() {
    const start = Date.now();
    const limit = 1000;

    const value = {
      id: Math.floor(Math.random() * 100_000),
      username: (Math.random() + 1).toString(36).substring(7),
      lastname: (Math.random() + 1).toString(36).substring(7),
      age: Math.floor(Math.random() * 91 + 10),
    };

    await this.redis.set(`key:${value.id}`, JSON.stringify(value));

    const end = Date.now();

    return `Strings. ${limit} keys generated in ${end - start}ms`;
  }

  async readStrings() {
    const start = Date.now();
    let count = 0;

    for (let i = 0; i < 1000; i++) {
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

  async generateHashes() {
    const start = Date.now();
    const limit = 1000;

    const value = {
      id: Math.floor(Math.random() * 100_000),
      username: (Math.random() + 1).toString(36).substring(7),
      lastname: (Math.random() + 1).toString(36).substring(7),
      age: Math.floor(Math.random() * 91 + 10),
    };

    const promises = [];
    for (const [objectKey, val] of Object.entries(value)) {
      promises.push(
        this.redis.hset(`h:key:${value.id}`, objectKey, JSON.stringify(val)),
      );
    }

    await Promise.all(promises);

    const end = Date.now();

    return `Hashes. ${limit} keys generated in ${end - start}ms`;
  }

  async readHashes() {
    const start = Date.now();

    let count = 0;

    for (let i = 0; i < 1000; i++) {
      const age = await this.redis.hget(`h:key:${i}`, 'age');

      if (Number(age) >= 18) {
        count++;
      }
    }

    const end = Date.now();

    return {
      count,
      time: end - start,
    };
  }

  private hashGetKeyField(key) {
    const s: string[] = key.split(':');

    if (s?.length > 1) {
      return {
        key: s.shift(),
        field: s.join(':'),
      };
    }

    return { key: s.join(':'), field: s.join(':') };
  }

  private hashSet(key, value) {
    const kf = this.hashGetKeyField(key);
    return this.redis.hset(kf.key, kf.field, value);
  }

  async testOptimization(id) {
    const key = `object:${id}`;

    if (this.USE_OPTIMIZATION) {
      return this.hashSet(key, 'val');
    }

    return this.redis.set(key, 'val');
  }

  public async runOptimizationTest() {
    for (let i = 0; i < 100_000; i++) {
      await this.testOptimization(i);
    }
  }
}
