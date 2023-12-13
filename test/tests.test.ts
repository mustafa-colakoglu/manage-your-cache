import { describe } from '@jest/globals';
import { redisCacherTest } from './redis.cacher';
import { modelTest } from './model';

describe('run-all-test-by-order', () => {
	redisCacherTest();
	modelTest();
});
