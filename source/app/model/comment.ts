import { TheDb } from './thedb';
import {User} from "./user";

/**
 * class for selecting, inserting, updating and deleting Comments in comment table.
 *
 * @export
 * @class Comment
 */
export class Comment {
    public id = -1;
    public comment = '';
    public date: Date| number;
    public employee: number | User;



    public static getCount(filter: string): Promise<Comment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "comment" WHERE   
                            comment ILIKE '%${filter}%' `, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Comment> {
        const sql = `SELECT * FROM "comment" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Comment().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Comment. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Comment[]> {
        const sql = `SELECT * FROM "comment"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Comment[] = [];
                for (const row of rows) {
                    const comment = new Comment().fromRow(row);
                    users.push(comment);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, employee: number): Promise<Comment[]> {
        const sql = `SELECT c.*, u.username FROM "comment" c
                            INNER JOIN "user" u ON u.id = c.employee
                            WHERE   c.comment ILIKE '%${filter}%' 
                            AND u.username = ${employee}::TEXT
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Comment[] = [];
                for (const row of rows) {
                    const comment = new Comment().fromRow(row);
                    users.push(comment);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "comment" (comment, date, employee)
            VALUES('${this.comment ? this.comment.replace(/\'/g, "''") : ''}', '${this.date}', ${this.employee})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Comment to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "comment" SET
               comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Comment to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "comment" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Comment to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Comment {
        this.id = row['id'];
        this['username'] = row['username'];
        this.employee = row['employee'];
        this.comment = row['comment'];
        this.date = row['date'];
        return this;
    }
}
