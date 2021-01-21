import { TheDb } from './thedb';
import {Instructor} from "./instructor";
import {Settings} from "./settings";
import {Session} from "./session";

/**
 * class for selecting, inserting, updating and deleting charges in charge table.
 *
 * @export
 * @class ChargeInstructor
 */
export class ChargeInstructor {
    public id = -1;
    public amount: number;
    public rest: number;
    public date: Date| number;
    public comment = '';
    public session: number | Session;
    public instructor: number | Instructor;

    public static getCount(filter: string): Promise<ChargeInstructor[]> {
        const sql = Settings.isDbLocalFile ? `SELECT count(*) as count FROM "charge_instructor" WHERE amount LIKE '%${filter}%' OR 
                                        date LIKE '%${filter}%'` :
            `SELECT count(*) as count FROM "charge_instructor" AS p 
                            INNER JOIN "instructor" AS i ON p.instructor = i.id 
                            WHERE  i.name ILIKE '%${filter}%' `;
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static getSold(instructor: number): Promise<number> {
        const sql = `select sum(rest) sold from charge_instructor 
                            WHERE  instructor = ${instructor} `;
        return TheDb.selectAll(sql, {})
            .then((sold: any) => sold);
    }

    public static getCountByInstructor(instructor: number): Promise<ChargeInstructor[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "charge_instructor" AS p INNER JOIN "instructor" AS i ON p.instructor = i.id 
                            WHERE i.id = ${instructor}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<ChargeInstructor> {
        const sql = `SELECT * FROM "charge_instructor" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new ChargeInstructor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 ChargeInstructor. Found 0.');
                }
            });
    }

    public static getBySession(id: number, int: number): Promise<ChargeInstructor> {
        const sql = `SELECT c.*, s.name as session_name  FROM "charge_instructor" as c 
        INNER JOIN "session" as s ON s.id = c.session WHERE c.session = ${id} and c.instructor = ${int}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new ChargeInstructor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 ChargeInstructor. Found 0.');
                }
            });
    }


    public static getAll(): Promise<ChargeInstructor[]> {
        const sql = `SELECT * FROM "charge_instructor" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: ChargeInstructor[] = [];
                for (const row of rows) {
                    const charge = new ChargeInstructor().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public static getAllByInstructor(instructor: number): Promise<ChargeInstructor[]> {
        const sql = `SELECT c.*, s.name as session_name  FROM "charge_instructor" as c 
        INNER JOIN "session" as s ON s.id = c.session
        WHERE instructor = ${instructor} and c.rest > 0 ORDER BY date ASC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: ChargeInstructor[] = [];
                for (const row of rows) {
                    const charge = new ChargeInstructor().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<ChargeInstructor[]> {
        const sql = Settings.isDbLocalFile ? `SELECT p.id, p.amount, p.date, p.comment, p.instructor, i.name as instructor 
                            FROM "charge_instructor" AS p 
                            INNER JOIN "instructor" AS i ON p.instructor = i.id 
                            WHERE p.amount LIKE '%${filter}%' OR 
                            p.date LIKE '%${filter}%' OR i.name LIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.instructor, i.name as instructor, ,s.name as session, 
                            FROM "charge_instructor" AS p 
                            INNER JOIN "instructor" AS i ON p.instructor = i.id
                            INNER JOIN "session" AS s ON p.session = s.id 
                            WHERE  
                            i.name ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: ChargeInstructor[] = [];
                for (const row of rows) {
                    const charge = new ChargeInstructor().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, instructor: number): Promise<ChargeInstructor[]> {
        const sql = `SELECT p.id, p.amount, p.date, p.comment, p.instructor, i.name as instructor, p.rest, s.name as session 
                            FROM "charge_instructor" AS p 
                            INNER JOIN "instructor" AS i ON p.instructor = i.id
                            INNER JOIN "session" AS s ON p.session = s.id  
                            WHERE i.id = ${instructor}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: ChargeInstructor[] = [];
                for (const row of rows) {
                    const charge = new ChargeInstructor().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "charge_instructor" (amount,rest, date, comment, session, instructor)
            VALUES(${this.amount}, ${this.rest}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}','${this.session}', ${this.instructor})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 ChargeInstructor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "charge_instructor" (id,amount,rest, date, comment, session, instructor)
            VALUES(${this.id},${this.amount}, ${this.rest}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}','${this.session}', ${this.instructor})`;

        const values = {
        };

        return TheDb.insert(sql, values,cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 ChargeInstructor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public static updateRest(amount: number, id: number): Promise<void> {
        const sql = `
            UPDATE "charge_instructor"
               SET rest = ${amount}
             WHERE id = ${id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 ChargeInstructor to be updated. Was ${result.changes}`);
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "charge_instructor"
               SET amount = ${this.amount}, date = '${this.date}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', session = '${this.session}'
               , instructor = '${this.instructor}', rest = ${this.rest}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 ChargeInstructor to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "charge_instructor" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 ChargeInstructor to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): ChargeInstructor {
        this.id = row['id'];
        this.amount = row['amount'];
        this.rest = row['rest'];
        this.date = row['date'];
        this.comment = row['comment'];
        this.session = row['session'];
        this['session_name'] = row['session_name'];
        this.instructor = row['instructor'];
        this['sold'] = row['sold'];
        return this;
    }
}
