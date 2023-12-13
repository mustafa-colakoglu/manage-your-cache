import { createClient } from 'redis';
import { expect } from '@jest/globals';
import RedisCacher from '../src/Cachers/RedisCacher';

export const redisCacherTest = () =>
	test('redis-cacher-test', (done) => {
		const redisClient = createClient();
		let redisCacher: RedisCacher;
		const id = 'some id';
		const data = 'test-data';
		const update = 'test-data-2';
		redisClient
			.connect()
			.then(() => {
				redisCacher = new RedisCacher(redisClient);
				return redisCacher.create(id, data);
			})
			.then((set) => expect(set).toBe(true))
			.then(() => redisCacher.get(id))
			.then((get) => expect(get).toBe(data))
			.then(() => redisCacher.update(id, update))
			.then(() => redisCacher.get(id))
			.then((get) => expect(get).toBe(update))
			.then(() => redisCacher.delete(id))
			.then(() => redisCacher.get(id))
			.then((get) => expect(get).toBe(null))
			.catch((err) => expect(err).toBe(undefined))
			.then(() => redisClient.quit())
			.finally(() => done());
	});
