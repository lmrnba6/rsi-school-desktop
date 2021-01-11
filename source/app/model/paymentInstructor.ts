import { TheDb } from './thedb';
import {Instructor} from "./instructor";
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting payment_instructors in payment_instructor table.
 *
 * @export
 * @class Payment_instructor
 */
export class Payment_instructor {
    public id = -1;
    public amount: number;
    public date: Date| number;
    public comment = '';
    public instructor_id: number | Instructor;

    public static getCount(filter: string): Promise<Payment_instructor[]> {
        const sql = Settings.isDbLocalFile ? `SELECT count(*) as count FROM "payment_instructor" WHERE amount LIKE '%${filter}%' OR 
                                        date LIKE '%${filter}%'` :
            `SELECT count(*) as count FROM "payment_instructor" AS p INNER JOIN "instructor" AS i ON p.instructor_id = i.id WHERE 
                            p.date ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%'`;
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static getCountByInstructor(instructor: number): Promise<Payment_instructor[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "payment_instructor" AS p INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            WHERE i.id = ${instructor}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Payment_instructor> {
        const sql = `SELECT * FROM "payment_instructor" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Payment_instructor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Payment_instructor. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Payment_instructor[]> {
        const sql = `SELECT * FROM "payment_instructor" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payment_instructors: Payment_instructor[] = [];
                for (const row of rows) {
                    const payment_instructor = new Payment_instructor().fromRow(row);
                    payment_instructors.push(payment_instructor);
                }
                return payment_instructors;
            });
    }

    public static getAllByInstructor(instructor: number): Promise<Payment_instructor[]> {
        const sql = `SELECT * FROM "payment_instructor" WHERE instructor_id = ${instructor} ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payment_instructors: Payment_instructor[] = [];
                for (const row of rows) {
                    const payment_instructor = new Payment_instructor().fromRow(row);
                    payment_instructors.push(payment_instructor);
                }
                return payment_instructors;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Payment_instructor[]> {
        const sql = Settings.isDbLocalFile ? `SELECT p.id, p.amount, p.date, p.comment, p.instructor_id FROM "payment_instructor" AS p INNER JOIN "instructor" AS i ON p.instructor_id = i.id WHERE p.amount LIKE '%${filter}%' OR 
                            p.date LIKE '%${filter}%' OR i.name LIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.instructor_id FROM "payment_instructor" AS p INNER JOIN "instructor" AS i ON p.instructor_id = i.id WHERE 
                            p.date ILIKE '%${filter}%' OR i.name ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payment_instructors: Payment_instructor[] = [];
                for (const row of rows) {
                    const payment_instructor = new Payment_instructor().fromRow(row);
                    payment_instructors.push(payment_instructor);
                }
                return payment_instructors;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, instructor: number): Promise<Payment_instructor[]> {
        const sql = `SELECT p.id, p.amount, p.date, p.comment, p.instructor_id FROM "payment_instructor" AS p INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            WHERE i.id = ${instructor}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payment_instructors: Payment_instructor[] = [];
                for (const row of rows) {
                    const payment_instructor = new Payment_instructor().fromRow(row);
                    payment_instructors.push(payment_instructor);
                }
                return payment_instructors;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "payment_instructor" (amount, date, comment, instructor_id)
            VALUES(${this.amount}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', ${this.instructor_id})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment_instructor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "payment_instructor" (id,amount, date, comment, instructor_id)
            VALUES(${this.id}, ${this.amount}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', ${this.instructor_id})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment_instructor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "payment_instructor"
               SET amount = ${this.amount}, date = '${this.date}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', instructor_id = '${this.instructor_id}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment_instructor to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "payment_instructor" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment_instructor to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Payment_instructor {
        this.id = row['id'];
        this.amount = row['amount'];
        this.date = row['date'];
        this.comment = row['comment'];
        this.instructor_id = row['instructor_id'];
        return this;
    }

}
