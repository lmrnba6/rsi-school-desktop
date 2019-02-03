import { TheDb } from './thedb';
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting Rooms in room table.
 *
 * @export
 * @class Room
 */
export class Room {
    public id = -1;
    public number = '';
    public capacity = '';

    public static getCount(filter: string): Promise<Room[]> {
        const sql = Settings.isDbLocal ? `SELECT count(*) as count FROM "room" WHERE number LIKE '%${filter}%' OR 
                                        capacity LIKE '%${filter}%'` :
            `SELECT count(*) as count FROM "room" WHERE number LIKE '%${filter}%' OR 
                                        CAST(capacity AS TEXT) LIKE '%${filter}%'`
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Room> {
        const sql = `SELECT * FROM "room" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Room().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Room. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Room[]> {
        const sql = `SELECT * FROM "room"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Room[] = [];
                for (const row of rows) {
                    const room = new Room().fromRow(row);
                    users.push(room);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Room[]> {
        const sql = Settings.isDbLocal ? `SELECT * FROM "room" WHERE number LIKE '%${filter}%' OR 
                            capacity LIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT * FROM "room" WHERE number LIKE '%${filter}%' OR 
                            CAST(capacity AS TEXT) LIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Room[] = [];
                for (const row of rows) {
                    const room = new Room().fromRow(row);
                    users.push(room);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "room" (number, capacity)
            VALUES('${this.number}', '${this.capacity}')`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Room to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "room"
               SET number = '${this.number}', capacity = '${this.capacity}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Room to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "room" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Room to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Room {
        this.id = row['id'];
        this.number = row['number'];
        this.capacity = row['capacity'];
        return this;
    }
}
