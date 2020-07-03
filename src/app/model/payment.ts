import { TheDb } from './thedb';
import {Intern} from "./intern";
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting payments in payment table.
 *
 * @export
 * @class Payment
 */
export class Payment {
    public id = -1;
    public amount: number;
    public rest: number;
    public date: Date| number;
    public comment = '';
    public training = '';
    public month = '';
    public username = '';
    public intern_id: number | Intern;

    public static getCount(filter: string): Promise<Payment[]> {
        const sql = Settings.isDbLocal ? `SELECT count(*) as count FROM "payment" WHERE amount LIKE '%${filter}%' OR 
                                        date LIKE '%${filter}%'` :
            `SELECT count(*) as count FROM "payment" AS p 
                            INNER JOIN "intern" AS i ON p.intern_id = i.id 
                            WHERE  i.name ILIKE '%${filter}%' `;
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static getCountByIntern(intern: number): Promise<Payment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "payment" AS p INNER JOIN "intern" AS i ON p.intern_id = i.id 
                            WHERE i.id = ${intern}`, {})
            .then((count: any) => count);
    }

    public static getCountByInstructor(instructor: number): Promise<Payment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "payment_instructor" AS p 
                                        INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            WHERE i.id = ${instructor}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Payment> {
        const sql = `SELECT * FROM "payment" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Payment().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Payment. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Payment[]> {
        const sql = `SELECT * FROM "payment" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment[] = [];
                for (const row of rows) {
                    const payment = new Payment().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public static getAllByIntern(intern: number): Promise<Payment[]> {
        const sql = `SELECT * FROM "payment" WHERE intern_id = ${intern} ORDER BY date ASC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment[] = [];
                for (const row of rows) {
                    const payment = new Payment().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Payment[]> {
        const sql = Settings.isDbLocal ? `SELECT p.id, p.amount, p.date, p.comment, p.intern_id, i.name as intern 
                            FROM "payment" AS p 
                            INNER JOIN "intern" AS i ON p.intern_id = i.id 
                            WHERE p.amount LIKE '%${filter}%' OR 
                            p.date LIKE '%${filter}%' OR i.name LIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.intern_id, i.name as intern, p.username,p.training 
                            FROM "payment" AS p 
                            INNER JOIN "intern" AS i ON p.intern_id = i.id 
                            WHERE  
                            i.name ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment[] = [];
                for (const row of rows) {
                    const payment = new Payment().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public static getAllPagedByIntern(pageIndex: number, pageSize: number, sort: string, order: string, intern: number): Promise<Payment[]> {
        const sql = `SELECT p.id, p.amount, p.date, p.comment, p.intern_id, i.name as intern, p.username, p.rest, p.training 
                            FROM "payment" AS p 
                            INNER JOIN "intern" AS i ON p.intern_id = i.id 
                            WHERE i.id = ${intern}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment[] = [];
                for (const row of rows) {
                    const payment = new Payment().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, intern: number): Promise<Payment[]> {
        const sql = `SELECT p.id, p.amount, p.date, p.comment, p.intern_id FROM "payment_instructor" AS p 
                                                INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            WHERE i.id = ${intern}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment[] = [];
                for (const row of rows) {
                    const payment = new Payment().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "payment" (amount,rest, username, date, comment, training, month, intern_id)
            VALUES(${this.amount}, ${this.rest}, '${this.username}', '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}','${this.training}','${this.month.replace(/\'/g, "''")}', ${this.intern_id})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "payment"
               SET amount = ${this.amount}, date = '${this.date}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', training = '${this.training}'
               , month = '${this.month ? this.month.replace(/\'/g, "''") : ''}', intern_id = '${this.intern_id}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "payment" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Payment {
        this.id = row['id'];
        this.amount = row['amount'];
        this.rest = row['rest'];
        this.username = row['username'];
        this.date = row['date'];
        this.comment = row['comment'];
        this.month = row['month'];
        this.training = row['training'];
        this.intern_id = row['intern_id'];
        this['intern'] = row['intern'];
        return this;
    }

}
