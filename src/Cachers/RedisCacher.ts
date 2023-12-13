import { createClient } from 'redis';
import Cacher from '../Cacher';
const exampleClient = createClient();
export type RedisClientType = typeof exampleClient;
class RedisCacher extends Cacher {
	redisClient?: RedisClientType;
	constructor(redisClient: RedisClientType, useArray: boolean = false) {
		super();
		this.redisClient = redisClient;
	}
	create = async (id: string, data: string): Promise<boolean> => {
		if (!this.redisClient) throw new Error('Redis client not setted');
		const create = await this.redisClient.set(id, data);
		if (create) return true;
		return false;
	};
	get = async (id: string): Promise<string | null> => {
		if (!this.redisClient) throw new Error('Redis client not setted');
		const get = await this.redisClient.get(id);
		return get;
	};
	update = async (id: string, data: string): Promise<boolean> => {
		return this.create(id, data);
	};
	delete = async (id: string): Promise<boolean> => {
		if (!this.redisClient) throw new Error('Redis client not setted');
		const del = await this.redisClient.del(id);
		return del ? true : false;
	};
}
export default RedisCacher;
