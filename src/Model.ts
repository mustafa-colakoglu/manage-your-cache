import Cacher from './Cacher';

type IText = {
	type: 'string';
	isIdentity?: boolean;
};
type INumber = {
	type: 'number';
	isIdentity?: boolean;
};
type IDate = {
	type: 'date';
	isIdentity?: boolean;
};
type IField = INumber | IText | IDate;
type IFields = {
	[key: string]: IField;
};
export type IdType = string | number;
type Creator = (data: any) => Promise<any>;
type Getter = (id: IdType) => Promise<any>;
type Updater = (id: IdType, data: any) => Promise<any>;
type Deleter = (id: IdType) => Promise<any>;
class Model {
	name: string;
	fields: IFields = {};
	cacher?: Cacher;
	paginated: boolean = false;
	creator: Creator = async (data: any): Promise<any> => {
		return null;
	};
	getter: Getter = async (id: IdType) => {
		return null;
	};
	updater: Updater = async (id: IdType, data: any) => {
		return null;
	};
	deleter: Deleter = async (id: IdType) => {
		return null;
	};
	constructor(
		name: string,
		fields: IFields,
		methods: {
			create: Creator;
			get: Getter;
			update: Updater;
			delete: Deleter;
		}
	) {
		this.name = name;
		this.fields = fields;
		this.creator = methods.create;
		this.getter = methods.get;
		this.updater = methods.update;
		this.deleter = methods.delete;
	}
	setCacher = (cacher: Cacher) => {
		this.cacher = cacher;
	};
	setPaginated = (paginated: boolean) => {
		this.paginated = paginated;
	};
	getIdsAndIdentifiers = (): {
		ids: string[];
		identifierKey: string;
	} => {
		const ids: string[] = [this.name];
		let identifierKey: string = '';
		type KeyType = keyof typeof this.fields;
		const keys: KeyType[] = Object.keys(this.fields);
		for (const key of keys) {
			if (this.fields[key].isIdentity) {
				ids.push(key as string);
				identifierKey = key as string;
			}
		}
		return { ids, identifierKey };
	};
	create = async (data: any) => {
		const createdData: any = await this.creator(data);
		const realId = this.getRealId(undefined, createdData);
		createdData.fromCache = true;
		this.cacher?.create(realId, JSON.stringify(createdData));
		return createdData;
	};
	get = async (id: IdType) => {
		const realId = this.getRealId(id);
		const getFromCache = await this.cacher?.get(realId);
		if (!getFromCache) {
			const dataActual = await this.getter(id);
			if (!dataActual) return null;
			dataActual.fromCache = true;
			this.cacher?.create(realId, JSON.stringify(dataActual));
			return dataActual;
		}
		const parsedValue = JSON.parse(getFromCache);
		return parsedValue;
	};
	update = async (id: IdType, updateData: any) => {
		const updated = await this.updater(id, updateData);
		const realId = this.getRealId(id);
		updated.fromCache = true;
		this.cacher?.update(realId, JSON.stringify(updated));
		return updated;
	};
	delete = async (id: IdType): Promise<IdType> => {
		const get = await this.get(id);
		if (get) {
			const realId = this.getRealId(id);
			await this.deleter(id);
			await this.cacher?.delete(realId);
		}
		return id;
	};
	getRealId = (id: IdType | undefined, data: any = {}) => {
		const { ids, identifierKey } = this.getIdsAndIdentifiers();
		return `${ids.join('-')}-${id !== undefined ? id : data[identifierKey]}`;
	};
	getPaginated = (page: number, offset: number) => {};
}
export default Model;
