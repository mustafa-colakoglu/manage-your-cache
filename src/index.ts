import Model from './Model';

class ManageYourCache {
	models: Model[] = [];
	addModel(model: Model) {
		this.models.push(model);
	}
	addModels(models: Model[]) {
		this.models = [...this.models, ...models];
	}
}
export default ManageYourCache;
