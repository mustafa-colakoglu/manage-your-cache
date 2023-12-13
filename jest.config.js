module.exports = {
	roots: ['./'],
	testMatch: ['**/?(*.)+(spec|test).+(ts)'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
};
