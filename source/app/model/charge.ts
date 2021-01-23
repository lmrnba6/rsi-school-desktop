import { TheDb } from './thedb';
import {Intern} from "./intern";
import {Settings} from "./settings";
import {Session} from "./session";

/**
 * class for selecting, inserting, updating and deleting charges in charge table.
 *
 * @export
 * @class Charge
 */
export class Charge {
    public id = -1;
    public amount: number;
    public rest: number;
    public date: Date| number;
    public comment = '';
    public session: number | Session;
    public intern: number | Intern;

    public static getCount(filter: string): Promise<Charge[]> {
        const sql = Settings.isDbLocalFile ? `SELECT count(*) as count FROM "charge" WHERE amount LIKE '%${filter}%' OR 
                                        date LIKE '%${filter}%'` :
            `SELECT count(*) as count FROM "charge" AS p 
                            INNER JOIN "intern" AS i ON p.intern = i.id 
                            WHERE  i.name ILIKE '%${filter}%' `;
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static getSold(intern: number): Promise<number> {
        const sql = `select sum(rest) sold from charge 
                            WHERE  intern = ${intern} `;
        return TheDb.selectAll(sql, {})
            .then((sold: any) => sold);
    }

    public static getCountByIntern(intern: number): Promise<Charge[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "charge" AS p INNER JOIN "intern" AS i ON p.intern = i.id
                            LEFT JOIN "session" AS s ON p.session = s.id  
                            WHERE i.id = ${intern}`, {})
            .then((count: any) => count);
    }

    public static getCountByInstructor(instructor: number): Promise<Charge[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "charge_instructor" AS p 
                                        INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                                        LEFT JOIN "session" AS s ON p.session = s.id 
                            WHERE i.id = ${instructor}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Charge> {
        const sql = `SELECT * FROM "charge" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Charge().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Charge. Found 0.');
                }
            });
    }

    public static getBySession(id: number, int: number): Promise<Charge> {
        const sql = `SELECT c.*, s.name as session_name  FROM "charge" as c 
        INNER JOIN "session" as s ON s.id = c.session WHERE c.session = ${id} and c.intern = ${int}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Charge().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Charge. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Charge[]> {
        const sql = `SELECT * FROM "charge" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: Charge[] = [];
                for (const row of rows) {
                    const charge = new Charge().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public static getAllByIntern(intern: number): Promise<Charge[]> {
        const sql = `SELECT c.*, s.name as session_name  FROM "charge" as c 
        LEFT JOIN "session" as s ON s.id = c.session
        WHERE intern = ${intern} and c.rest > 0 ORDER BY date ASC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: Charge[] = [];
                for (const row of rows) {
                    const charge = new Charge().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Charge[]> {
        const sql = Settings.isDbLocalFile ? `SELECT p.id, p.amount, p.date, p.comment, p.intern, i.name as intern 
                            FROM "charge" AS p 
                            INNER JOIN "intern" AS i ON p.intern = i.id 
                            WHERE p.amount LIKE '%${filter}%' OR 
                            p.date LIKE '%${filter}%' OR i.name LIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.intern, i.name as intern,s.name as session
                            FROM "charge" AS p 
                            INNER JOIN "intern" AS i ON p.intern = i.id
                            LEFT JOIN "session" AS s ON p.session = s.id 
                            WHERE  
                            i.name ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: Charge[] = [];
                for (const row of rows) {
                    const charge = new Charge().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public static getAllPagedByIntern(pageIndex: number, pageSize: number, sort: string, order: string, intern: number): Promise<Charge[]> {
        const sql = `SELECT p.id, p.amount, p.date, p.comment, p.intern, i.name as intern, p.rest, s.name as session 
                            FROM "charge" AS p 
                            INNER JOIN "intern" AS i ON p.intern = i.id
                            LEFT JOIN "session" AS s ON p.session = s.id  
                            WHERE i.id = ${intern}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: Charge[] = [];
                for (const row of rows) {
                    const charge = new Charge().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, intern: number): Promise<Charge[]> {
        const sql = `SELECT p.id, p.amount, p.date, p.comment, p.intern FROM "charge_instructor" AS p 
                                                INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            WHERE i.id = ${intern}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const charges: Charge[] = [];
                for (const row of rows) {
                    const charge = new Charge().fromRow(row);
                    charges.push(charge);
                }
                return charges;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "charge" (amount,rest, date, comment, session, intern)
            VALUES(${this.amount}, ${this.rest}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',${this.session}, ${this.intern})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Charge to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "charge" (id,amount,rest, date, comment, session, intern)
            VALUES(${this.id},${this.amount}, ${this.rest}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',${this.session}, ${this.intern})`;

        const values = {
        };

        return TheDb.insert(sql, values,cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Charge to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public static updateRest(amount: number, id: number): Promise<void> {
        const sql = `
            UPDATE "charge"
               SET rest = ${amount}
             WHERE id = ${id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Charge to be updated. Was ${result.changes}`);
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "charge"
               SET amount = ${this.amount}, date = '${this.date}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', session = ${this.session}
               , intern = '${this.intern}', rest = ${this.rest}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Charge to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "charge" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Charge to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Charge {
        this.id = row['id'];
        this.amount = row['amount'];
        this.rest = row['rest'];
        this.date = row['date'];
        this.comment = row['comment'];
        this.session = row['session'];
        this['session_name'] = row['session_name'];
        this.intern = row['intern'];
        this['sold'] = row['sold'];
        return this;
    }
}
