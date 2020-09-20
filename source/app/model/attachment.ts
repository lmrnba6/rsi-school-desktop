import { TheDb } from './thedb';
import {Inbox} from "./inbox";

/**
 * class for selecting, inserting, updating and deleting Attachments in attachment table.
 *
 * @export
 * @class Attachment
 */
export class Attachment {
    public id = -1;
    public name = '';
    public file = '';
    public type = '';
    public inbox_id: number | Inbox;

    public static getCount(filter: string): Promise<Attachment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "attchment" WHERE name LIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Attachment> {
        const sql = `SELECT * FROM "attchment" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Attachment().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Attachment. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Attachment[]> {
        const sql = `SELECT * FROM "attchment"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attachment[] = [];
                for (const row of rows) {
                    const attachment = new Attachment().fromRow(row);
                    users.push(attachment);
                }
                return users;
            });
    }

    public static getByInbox(id: number): Promise<Attachment[]> {
        const sql = `SELECT * FROM "attchment" where inbox_id = ${id}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attachment[] = [];
                for (const row of rows) {
                    const attachment = new Attachment().fromRow(row);
                    users.push(attachment);
                }
                return users;
            });
    }


    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Attachment[]> {
        const sql = `SELECT * FROM "attchment" WHERE name LIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attachment[] = [];
                for (const row of rows) {
                    const attachment = new Attachment().fromRow(row);
                    users.push(attachment);
                }
                return users;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "attachment" (name, file, type, inbox_id)
            VALUES('${this.name}', '${this.file}', '${this.type}', ${this.inbox_id})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Attachment to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "attachment" (id,name, file, type, inbox_id)
            VALUES(${this.id},'${this.name}', '${this.file}', '${this.type}', ${this.inbox_id})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Attachment to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "attchment"
               SET name = '${this.name}', file = '${this.file}', type = '${this.type}', inbox_id = ${this.inbox_id}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Attachment to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "attchment" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Attachment to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Attachment {
        this.id = row['id'];
        this.name = row['name'];
        this.file = row['file'];
        this.type = row['type'];
        this.inbox_id = row['inbox_id'];
        return this;
    }
}
