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
    public charge = '';
    public month = '';
    public username = '';
    public intern_id: number | Intern;
    public error = 0;

    public static getCount(filter: string): Promise<Payment[]> {
        const sql = Settings.isDbLocalFile ? `SELECT count(*) as count FROM "payment" WHERE amount LIKE '%${filter}%' OR 
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
        const sql = `SELECT p.*, s.name as session_name FROM "payment" p
                            LEFT JOIN "charge" AS c ON p.charge = c.id 
                            LEFT JOIN "session" AS s ON c.session = s.id 
                            ORDER BY date DESC`;
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
        const sql = `SELECT p.*, s.name as session_name FROM "payment" p
                            LEFT JOIN "charge" AS c ON p.charge = c.id 
                            LEFT JOIN "session" AS s ON c.session = s.id 
        WHERE intern_id = ${intern} ORDER BY p.date DESC`;
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
        const sql = Settings.isDbLocalFile ? `SELECT p.id, p.amount, p.date, p.comment, p.intern_id, i.name as intern 
                            FROM "payment" AS p 
                            INNER JOIN "intern" AS i ON p.intern_id = i.id 
                            WHERE p.amount LIKE '%${filter}%' OR 
                            p.date LIKE '%${filter}%' OR i.name LIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.intern_id, i.name as intern, p.username,s.name as session_name, p.error,p.rest, i.sold 
                            FROM "payment" AS p 
                            INNER JOIN "intern" AS i ON p.intern_id = i.id
                            LEFT JOIN "charge" AS c ON p.charge = c.id 
                            LEFT JOIN "session" AS s ON c.session = s.id 
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
        const sql = `SELECT p.id, p.amount, p.date, p.comment, p.intern_id, i.name as intern, p.username,p.error, p.rest,i.sold, s.name as session_name 
                            FROM "payment" AS p 
                            INNER JOIN "intern" AS i ON p.intern_id = i.id 
                            LEFT JOIN "charge" AS c ON p.charge = c.id 
                            LEFT JOIN "session" AS s ON c.session = s.id 
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

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "payment" (amount,rest, username, date, comment, charge, month, intern_id)
            VALUES(${this.amount}, ${this.rest}, '${this.username}', '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',${this.charge},'${this.month.replace(/\'/g, "''")}', ${this.intern_id})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "payment" (id, amount,rest, username, date, comment, charge, month, intern_id)
            VALUES(${this.id},${this.amount}, ${this.rest}, '${this.username}', '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',${this.charge},'${this.month.replace(/\'/g, "''")}', ${this.intern_id})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "payment"
               SET amount = ${this.amount}, error = ${this.error}, date = '${this.date}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', charge = ${this.charge}
               , month = '${this.month ? this.month.replace(/\'/g, "''") : ''}', intern_id = '${this.intern_id}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "payment" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static getPaymentDueBySessionToDate(intern: number,session: number,seance_fees: number): Promise<number> {
        const sql = `
            (select count(a.*)*${seance_fees} attendances from attendance a where a.session_id = ${session} and a.intern_id = ${intern} and to_timestamp(a.date::bigint / 1000)::date >=
            to_timestamp((select e.date from enrollment e join intern i on e.intern_id = i.id where e.session_id = ${session} and i.id = ${intern})::bigint / 1000)::date)`;

        const values = {
        };

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return row['attendances'] || 0;
                } else {
                    throw new Error('Expected to find 1 Charge. Found 0.');
                }
            });
    }

    public static getPaymentDoneBySessionToDate(intern: number,session: number): Promise<number> {
        const sql = `
                select sum(p.amount) payments from payment p join charge c on p.charge = c.id where p.intern_id = ${intern} and c.session = ${session}
                and to_timestamp(p.date::bigint / 1000)::date >= to_timestamp((select e.date from enrollment e join intern i on e.intern_id = i.id
                where e.session_id = ${session} and i.id = ${intern})::bigint / 1000)::date`;

        const values = {
        };

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return row['payments'] || 0;
                } else {
                    throw new Error('Expected to find 1 Charge. Found 0.');
                }
            });
    }

    public static getChargeDoneBySessionToDate(intern: number,session: number): Promise<number> {
        const sql = `
                select sum(c.amount) charges from charge c where c.intern = ${intern} and c.session = ${session}
                and to_timestamp(c.date::bigint / 1000)::date >= to_timestamp((select e.date from enrollment e join intern i on e.intern_id = i.id
                where c.rest != 0 and e.session_id = ${session} and i.id = ${intern})::bigint / 1000)::date`;

        const values = {
        };

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return row['charges'] || 0;
                } else {
                    throw new Error('Expected to find 1 Charge. Found 0.');
                }
            });
    }

    public fromRow(row: object): Payment {
        this.id = row['id'];
        this.amount = row['amount'];
        this.rest = row['rest'];
        this.username = row['username'];
        this.error = row['error'];
        this.date = row['date'];
        this.comment = row['comment'];
        this.month = row['month'];
        this.charge = row['charge'];
        this.intern_id = row['intern_id'];
        this['intern'] = row['intern'];
        this['sold'] = row['sold']
        this['session_name'] = row['session_name'];
        return this;
    }

}
