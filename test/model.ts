import { createClient } from 'redis';
import RedisCacher from '../src/Cachers/RedisCacher';
import Model, { IdType } from '../src/Model';
const mockData: any = {
	tables: {},
};
const mockDatabase = {
	initializeTable: (tableName: string) => {
		if (!mockData.tables[tableName])
			mockData.tables[tableName] = {
				idCounter: 0,
				rows: [],
			};
	},
	create: (tableName: string, value: any) => {
		mockDatabase.initializeTable(tableName);
		const newData = {
			...value,
			id: mockData.tables[tableName].idCounter + 1,
		};
		mockData.tables[tableName].rows.push(newData);

		mockData.tables[tableName].idCounter =
			mockData.tables[tableName].idCounter + 1;
		return newData;
	},
	get: (tableName: string, id: number) => {
		mockDatabase.initializeTable(tableName);
		return mockData.tables[tableName]?.rows?.find((item: any) => item.id === id);
	},
	update: (tableName: string, id: number, updates: any) => {
		mockDatabase.initializeTable(tableName);
		if (mockData.tables[tableName].rows)
			mockData.tables[tableName].rows = mockData.tables[tableName]?.rows?.map(
				(item: any) => (item.id === id ? { ...item, ...updates, id } : item)
			);
		return mockDatabase.get(tableName, id);
	},
	delete: (tableName: string, id: number) => {
		mockDatabase.initializeTable(tableName);
		mockData.tables[tableName].rows = mockData.tables[tableName].rows.filter(
			(item: any) => item.id !== id
		);
	},
};
export const modelTest = () =>
	test('model-test', (done) => {
		const redisClient = createClient();
		const redisCacher: RedisCacher = new RedisCacher(redisClient);
		const testModel = new Model(
			'test-model',
			{
				id: {
					type: 'number',
					isIdentity: true,
				},
				name: {
					type: 'string',
				},
			},
			{
				create: async (data) => {
					return mockDatabase.create('test-table', data);
				},
				update: async (id: IdType, data: any) => {
					const id1: number = id as number;
					return mockDatabase.update('test-table', id1, data);
				},
				get: (id: IdType) => {
					const id1: number = id as number;
					return mockDatabase.get('test-table', id1);
				},
				delete: async (id: IdType) => {
					const id1: number = id as number;
					return mockDatabase.delete('test-table', id1);
				},
			}
		);
		testModel.setCacher(redisCacher);
		redisClient
			.connect()
			.then(() => testModel.create({ name: 'mustafa' }))
			.then((created) => {
				expect(created).toMatchObject({ id: 1, name: 'mustafa', fromCache: true });
				return created;
			})
			.then((created) => testModel.get(created.id))
			.then((dataFromCache) => {
				expect(dataFromCache).toMatchObject({
					id: 1,
					name: 'mustafa',
					fromCache: true,
				});
				return dataFromCache;
			})
			.then((data) => testModel.update(data.id, { name: 'mustafa2' }))
			.then((dataFromUpdated) => {
				expect(dataFromUpdated).toMatchObject({
					id: 1,
					name: 'mustafa2',
					fromCache: true,
				});
				return dataFromUpdated;
			})
			.then((dataFromUpdated) => testModel.get(dataFromUpdated.id))
			.then((dataFromCache) => {
				expect(dataFromCache).toMatchObject({
					id: 1,
					name: 'mustafa2',
					fromCache: true,
				});
				return dataFromCache;
			})
			.then((dataFromCache) => testModel.delete(dataFromCache.id))
			.then((id: IdType) => testModel.get(id))
			.then((deleted) => expect(deleted).toBeNull())
			.then(() => redisClient.quit())
			.finally(() => done());
	});
