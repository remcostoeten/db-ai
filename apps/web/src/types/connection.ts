export type TConnection = {
	id: string;
	user_id: string | null;
	name: string;
	url: string;
	authToken: string;
	description: string;
	color: string;
	type: string;
	createdAt: Date;
	updatedAt: Date;
};

export type TNewConnection = Omit<TConnection, 'id' | 'createdAt' | 'updatedAt'>;

export type TConnectionType = 'postgres' | 'libsql';
