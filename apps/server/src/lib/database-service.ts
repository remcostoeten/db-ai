import pkg from "pg";
const { Client } = pkg;
import mysql from "mysql2/promise";
import sqlite3 from "sqlite3";
import { MongoClient } from "mongodb";
import type { Connection } from "../db/schema/connections";

export interface DatabaseInfo {
	name: string;
	type: "database" | "schema" | "catalog";
}

export interface TableInfo {
	name: string;
	schema: string;
	type: "table" | "view" | "materialized_view";
	rowCount?: number;
	size?: string;
	comment?: string;
}

export interface ColumnInfo {
	name: string;
	type: string;
	isNullable: boolean;
	defaultValue?: string;
	isPrimaryKey: boolean;
	isForeignKey: boolean;
	referencedTable?: string;
	referencedColumn?: string;
	comment?: string;
	ordinalPosition: number;
}

export class DatabaseService {
	/**
	 * Test database connection
	 */
	static async testConnection(connection: Partial<Connection>): Promise<boolean> {
		try {
			switch (connection.type) {
				case "postgres":
					return await this.testPostgresConnection(connection);
				case "mysql":
					return await this.testMySQLConnection(connection);
				case "sqlite":
					return await this.testSQLiteConnection(connection);
				case "mongodb":
					return await this.testMongoConnection(connection);
				default:
					throw new Error(`Unsupported database type: ${connection.type}`);
			}
		} catch (error) {
			console.error("Connection test failed:", error);
			return false;
		}
	}

	/**
	 * Get databases/schemas from connection
	 */
	static async getDatabases(connection: Connection): Promise<DatabaseInfo[]> {
		switch (connection.type) {
			case "postgres":
				return await this.getPostgresDatabases(connection);
			case "mysql":
				return await this.getMySQLDatabases(connection);
			case "sqlite":
				return await this.getSQLiteDatabases(connection);
			case "mongodb":
				return await this.getMongoDatabases(connection);
			default:
				throw new Error(`Unsupported database type: ${connection.type}`);
		}
	}

	/**
	 * Get tables from database
	 */
	static async getTables(connection: Connection, databaseName?: string): Promise<TableInfo[]> {
		switch (connection.type) {
			case "postgres":
				return await this.getPostgresTables(connection, databaseName);
			case "mysql":
				return await this.getMySQLTables(connection, databaseName);
			case "sqlite":
				return await this.getSQLiteTables(connection);
			case "mongodb":
				return await this.getMongoCollections(connection, databaseName);
			default:
				throw new Error(`Unsupported database type: ${connection.type}`);
		}
	}

	/**
	 * Get columns from table
	 */
	static async getColumns(connection: Connection, tableName: string, schemaName?: string): Promise<ColumnInfo[]> {
		switch (connection.type) {
			case "postgres":
				return await this.getPostgresColumns(connection, tableName, schemaName);
			case "mysql":
				return await this.getMySQLColumns(connection, tableName);
			case "sqlite":
				return await this.getSQLiteColumns(connection, tableName);
			case "mongodb":
				return await this.getMongoFields(connection, tableName);
			default:
				throw new Error(`Unsupported database type: ${connection.type}`);
		}
	}

	// PostgreSQL implementations
	private static async testPostgresConnection(connection: Partial<Connection>): Promise<boolean> {
		const client = new Client({
			connectionString: connection.connectionString || this.buildConnectionString(connection, "postgres"),
		});
		
		try {
			await client.connect();
			await client.query("SELECT 1");
			return true;
		} finally {
			await client.end();
		}
	}

	private static async getPostgresDatabases(connection: Connection): Promise<DatabaseInfo[]> {
		const client = new Client({
			connectionString: connection.connectionString || this.buildConnectionString(connection, "postgres"),
		});

		try {
			await client.connect();
			const result = await client.query(`
				SELECT datname as name, 'database' as type 
				FROM pg_database 
				WHERE datistemplate = false 
				ORDER BY datname
			`);
			return result.rows;
		} finally {
			await client.end();
		}
	}

	private static async getPostgresTables(connection: Connection, databaseName?: string): Promise<TableInfo[]> {
		const client = new Client({
			connectionString: connection.connectionString || this.buildConnectionString(connection, "postgres"),
		});

		try {
			await client.connect();
			const result = await client.query(`
				SELECT 
					t.table_name as name,
					t.table_schema as schema,
					CASE 
						WHEN t.table_type = 'BASE TABLE' THEN 'table'
						WHEN t.table_type = 'VIEW' THEN 'view'
						ELSE 'table'
					END as type,
					pg_stat_user_tables.n_tup_ins + pg_stat_user_tables.n_tup_upd + pg_stat_user_tables.n_tup_del as row_count,
					pg_size_pretty(pg_total_relation_size(c.oid)) as size,
					obj_description(c.oid) as comment
				FROM information_schema.tables t
				LEFT JOIN pg_class c ON c.relname = t.table_name
				LEFT JOIN pg_stat_user_tables ON pg_stat_user_tables.relname = t.table_name
				WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
				ORDER BY t.table_schema, t.table_name
			`);
			return result.rows;
		} finally {
			await client.end();
		}
	}

	private static async getPostgresColumns(connection: Connection, tableName: string, schemaName = "public"): Promise<ColumnInfo[]> {
		const client = new Client({
			connectionString: connection.connectionString || this.buildConnectionString(connection, "postgres"),
		});

		try {
			await client.connect();
			const result = await client.query(`
				SELECT 
					c.column_name as name,
					c.data_type as type,
					c.is_nullable = 'YES' as is_nullable,
					c.column_default as default_value,
					CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
					CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
					fk.foreign_table_name as referenced_table,
					fk.foreign_column_name as referenced_column,
					pgd.description as comment,
					c.ordinal_position
				FROM information_schema.columns c
				LEFT JOIN (
					SELECT ku.table_name, ku.column_name
					FROM information_schema.table_constraints tc
					JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
					WHERE tc.constraint_type = 'PRIMARY KEY'
				) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
				LEFT JOIN (
					SELECT 
						ku.table_name, ku.column_name,
						ccu.table_name AS foreign_table_name,
						ccu.column_name AS foreign_column_name
					FROM information_schema.table_constraints AS tc
					JOIN information_schema.key_column_usage AS ku ON tc.constraint_name = ku.constraint_name
					JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
					WHERE tc.constraint_type = 'FOREIGN KEY'
				) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
				LEFT JOIN pg_catalog.pg_statio_all_tables as st ON c.table_name = st.relname
				LEFT JOIN pg_catalog.pg_description pgd ON pgd.objoid = st.relid AND pgd.objsubid = c.ordinal_position
				WHERE c.table_name = $1 AND c.table_schema = $2
				ORDER BY c.ordinal_position
			`, [tableName, schemaName]);
			return result.rows;
		} finally {
			await client.end();
		}
	}

	// MySQL implementations (simplified for now)
	private static async testMySQLConnection(connection: Partial<Connection>): Promise<boolean> {
		const conn = await mysql.createConnection({
			host: connection.host,
			port: parseInt(connection.port || "3306"),
			user: connection.username,
			password: connection.password,
			database: connection.database,
		});
		
		try {
			await conn.execute("SELECT 1");
			return true;
		} finally {
			await conn.end();
		}
	}

	private static async getMySQLDatabases(connection: Connection): Promise<DatabaseInfo[]> {
		// Implementation for MySQL databases
		return [];
	}

	private static async getMySQLTables(connection: Connection, databaseName?: string): Promise<TableInfo[]> {
		// Implementation for MySQL tables
		return [];
	}

	private static async getMySQLColumns(connection: Connection, tableName: string): Promise<ColumnInfo[]> {
		// Implementation for MySQL columns
		return [];
	}

	// SQLite implementations (simplified for now)
	private static async testSQLiteConnection(connection: Partial<Connection>): Promise<boolean> {
		return new Promise((resolve) => {
			const db = new sqlite3.Database(connection.connectionString || "", (err) => {
				if (err) {
					resolve(false);
				} else {
					db.close();
					resolve(true);
				}
			});
		});
	}

	private static async getSQLiteDatabases(connection: Connection): Promise<DatabaseInfo[]> {
		// SQLite has only one database per file
		return [{ name: "main", type: "database" }];
	}

	private static async getSQLiteTables(connection: Connection): Promise<TableInfo[]> {
		// Implementation for SQLite tables
		return [];
	}

	private static async getSQLiteColumns(connection: Connection, tableName: string): Promise<ColumnInfo[]> {
		// Implementation for SQLite columns
		return [];
	}

	// MongoDB implementations (simplified for now)
	private static async testMongoConnection(connection: Partial<Connection>): Promise<boolean> {
		const client = new MongoClient(connection.connectionString || "");
		try {
			await client.connect();
			await client.db("admin").command({ ping: 1 });
			return true;
		} finally {
			await client.close();
		}
	}

	private static async getMongoDatabases(connection: Connection): Promise<DatabaseInfo[]> {
		// Implementation for MongoDB databases
		return [];
	}

	private static async getMongoCollections(connection: Connection, databaseName?: string): Promise<TableInfo[]> {
		// Implementation for MongoDB collections
		return [];
	}

	private static async getMongoFields(connection: Connection, collectionName: string): Promise<ColumnInfo[]> {
		// Implementation for MongoDB fields
		return [];
	}

	private static buildConnectionString(connection: Partial<Connection>, type: string): string {
		switch (type) {
			case "postgres":
				return `postgresql://${connection.username}:${connection.password}@${connection.host}:${connection.port || 5432}/${connection.database}`;
			case "mysql":
				return `mysql://${connection.username}:${connection.password}@${connection.host}:${connection.port || 3306}/${connection.database}`;
			default:
				throw new Error(`Cannot build connection string for type: ${type}`);
		}
	}
}