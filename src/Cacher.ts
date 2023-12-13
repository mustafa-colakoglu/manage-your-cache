class Cacher {
	create = async (id: string, data: string): Promise<boolean> => {
		return true;
	};
	get = async (id: string): Promise<string | null> => {
		return '';
	};
	update = async (id: string, data: string): Promise<boolean> => {
		return true;
	};
	delete = async (id: string): Promise<boolean> => {
		return true;
	};
}
export default Cacher;
