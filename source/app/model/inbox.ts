import { TheDb } from './thedb';
import {User} from "./user";
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting payments in inbox table.
 *
 * @export
 * @class Inbox
 */
export class Inbox {
    public id = -1;
    public date: Date| number;
    public subject: string;
    public from: number | User;
    public to: number | User;
    public content = '';
    public deleted = 0;
    public read = 0;


    public static getCount(filter: string, to: number,  deleted: boolean, sent: boolean): Promise<Inbox[]> {
        const fromCol = Settings.isDbLocal ? `'from'` : `from`;
        const toCol = Settings.isDbLocal ? `'to'` : `to`;
        let where = `(${(deleted || sent) ? 'u1.id' : 'u2.id'}  = ${to}`;
        where += !sent ? ` AND i.deleted = ${deleted ? 1 : 0})` : ')';
        return TheDb.selectAll(`SELECT count(*) as count 
                                FROM "inbox" AS i 
                            INNER JOIN "user" AS u1 ON i.${fromCol} = u1.id
                            INNER JOIN "user" AS u2 ON i.${toCol} = u2.id  
                            WHERE ${where} AND
                            (i.subject ILIKE '%${filter}%' OR 
                            u1.name ILIKE '%${filter}%') `, {})
            .then((count: any) => count);
    }

    public static getCountUnread(to: number): Promise<Inbox[]> {
        const fromCol = Settings.isDbLocal ? `'from'` : `from`;
        const toCol = Settings.isDbLocal ? `'to'` : `to`;
        return TheDb.selectAll(`SELECT count(*) as count 
                                FROM "inbox" AS i 
                            INNER JOIN "user" AS u1 ON i.${fromCol} = u1.id
                            INNER JOIN "user" AS u2 ON i.${toCol} = u2.id  
                            WHERE u2.id = ${to} AND i.deleted = 0 AND i.read = 0`, {})
            .then((count: any) => count);
    }


    public static get(id: number): Promise<Inbox> {
        const fromCol = Settings.isDbLocal ? `'from'` : `from`;
        const toCol = Settings.isDbLocal ? `'to'` : `to`;
        const sql = `SELECT i.id, i.subject, i.date, i.content, i.${fromCol}, i.${toCol}, i.deleted, i.read, u1.name as from_user, u2.name as to_user
                                                ,(select count(*) from attachment as a where a.inbox_id = i.id) as attachments 
                            FROM "inbox" AS i 
                            INNER JOIN "user" AS u1 ON i.${fromCol} = u1.id
                            INNER JOIN "user" AS u2 ON i.${toCol} = u2.id  
                            WHERE i.id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Inbox().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Inbox. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Inbox[]> {
        const sql = `SELECT * FROM "inbox" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Inbox[] = [];
                for (const row of rows) {
                    const inbox = new Inbox().fromRow(row);
                    payments.push(inbox);
                }
                return payments;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, to: number, deleted: boolean, sent: boolean): Promise<Inbox[]> {
        const fromCol = Settings.isDbLocal ? `'from'` : `from`;
        const toCol = Settings.isDbLocal ? `'to'` : `to`;
        let where = `(${(deleted || sent) ? 'u1.id' : 'u2.id'}  = ${to}`;
        where += !sent ? ` AND i.deleted = ${deleted ? 1 : 0})` : ')';
        const sql = `SELECT i.id, i.subject, i.date, i.content, i.${fromCol}, i.${toCol}, i.deleted, i.read, u1.name as from_user, u2.name as to_user
                                                ,(select count(*) from attachment as a where a.inbox_id = i.id) as attachments 
                            FROM "inbox" AS i 
                            INNER JOIN "user" AS u1 ON i.${fromCol} = u1.id
                            INNER JOIN "user" AS u2 ON i.${toCol} = u2.id  
                            WHERE ${where} AND
                            (i.subject ILIKE '%${filter}%' OR 
                            u2.name ILIKE '%${filter}%' OR
                            u1.name ILIKE '%${filter}%') 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Inbox[] = [];
                for (const row of rows) {
                    const inbox = new Inbox().fromRow(row);
                    payments.push(inbox);
                }
                return payments;
            });
    }

    
    public insert(): Promise<void> {
        const fromCol = Settings.isDbLocal ? `'from'` : `"from"`;
        const toCol = Settings.isDbLocal ? `'to'` : `"to"`;
        const sql = `
            INSERT INTO "inbox" (subject, date, content, ${fromCol}, ${toCol}, deleted, read)
            VALUES('${this.subject ? this.subject.replace(/\'/g, "''") : ''}', ${this.date}, '${this.content.replace(/\'/g, "''")}',${this.from}, ${this.to}, ${this.deleted}, ${this.read}) ${Settings.isDbLocalServer ? 'RETURNING id' : ''}`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Inbox to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const fromCol = Settings.isDbLocal ? `'from'` : `"from"`;
        const toCol = Settings.isDbLocal ? `'to'` : `"to"`;
        const sql = `
            UPDATE "inbox"
               SET subject = '${this.subject ? this.subject.replace(/\'/g, "''") : ''}', date = ${this.date}, content = '${this.content.replace(/\'/g, "''")}', ${fromCol} = ${this.from},
               ${toCol} = ${this.to}, "deleted" = ${this.deleted}, "read" = ${this.read}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Inbox to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "inbox" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Inbox to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Inbox {
        this.id = row['id'];
        this.subject = row['subject'];
        this.date = row['date'];
        this.content = row['content'];
        this.to = row['to'];
        this.from = row['from'];
        this.deleted = row['deleted'];
        this.read = row['read'];
        this['from_user'] = row['from_user'];
        this['to_user'] = row['to_user'];
        this['attachments'] = row['attachments'];
        return this;
    }

}
