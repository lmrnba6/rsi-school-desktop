import { TheDb } from './thedb';
import {Instructor} from "./instructor";
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting payments in payment table.
 *
 * @export
 * @class Payment_instructor
 */
export class Payment_instructor {
    public id = -1;
    public amount: number;
    public rest: number;
    public date: Date| number;
    public comment = '';
    public charge = '';
    public month = '';
    public username = '';
    public instructor_id: number | Instructor;
    public error = 0;

    public static getCount(filter: string): Promise<Payment_instructor[]> {
        const sql = Settings.isDbLocalFile ? `SELECT count(*) as count FROM payment_instructor WHERE amount LIKE '%${filter}%' OR 
                                        date LIKE '%${filter}%'` :
            `SELECT count(*) as count FROM payment_instructor AS p 
                            INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            WHERE  i.name ILIKE '%${filter}%' `;
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static getCountByInstructor(instructor: number): Promise<Payment_instructor[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM payment_instructor AS p INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            WHERE i.id = ${instructor}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Payment_instructor> {
        const sql = `SELECT * FROM payment_instructor WHERE id = ${id}`;
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
        const sql = `SELECT p.*, s.name as session_name FROM payment_instructor p
                            LEFT JOIN "charge" AS c ON p.charge = c.id 
                            LEFT JOIN "session" AS s ON c.session = s.id 
                            ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment_instructor[] = [];
                for (const row of rows) {
                    const payment = new Payment_instructor().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public static getAllByInstructor(instructor: number): Promise<Payment_instructor[]> {
        const sql = `SELECT p.*, s.name as session_name FROM payment_instructor p
                            LEFT JOIN "charge_instructor" AS c ON p.charge = c.id 
                            LEFT JOIN "session" AS s ON c.session = s.id 
        WHERE p.instructor_id = ${instructor} ORDER BY p.date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment_instructor[] = [];
                for (const row of rows) {
                    const payment = new Payment_instructor().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Payment_instructor[]> {
        const sql = Settings.isDbLocalFile ? `SELECT p.id, p.amount, p.date, p.comment, p.instructor_id, i.name as instructor 
                            FROM payment_instructor AS p 
                            INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            WHERE p.amount LIKE '%${filter}%' OR 
                            p.date LIKE '%${filter}%' OR i.name LIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.instructor_id, i.name as instructor, p.username,s.name as session_name, p.error,p.rest, i.sold 
                            FROM payment_instructor AS p 
                            INNER JOIN "instructor" AS i ON p.instructor_id = i.id
                            LEFT JOIN "charge_instructor" AS c ON p.charge = c.id 
                            LEFT JOIN "session" AS s ON c.session = s.id 
                            WHERE  
                            i.name ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment_instructor[] = [];
                for (const row of rows) {
                    const payment = new Payment_instructor().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, instructor: number): Promise<Payment_instructor[]> {
        const sql = `SELECT p.id, p.amount, p.date, p.comment, p.instructor_id, i.name as instructor, p.username,p.error, p.rest,i.sold, s.name as session_name 
                            FROM payment_instructor AS p 
                            INNER JOIN "instructor" AS i ON p.instructor_id = i.id 
                            LEFT JOIN "charge" AS c ON p.charge = c.id 
                            LEFT JOIN "session" AS s ON c.session = s.id 
                            WHERE i.id = ${instructor}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const payments: Payment_instructor[] = [];
                for (const row of rows) {
                    const payment = new Payment_instructor().fromRow(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO payment_instructor (amount,rest, username, date, comment, charge, month, instructor_id)
            VALUES(${this.amount}, ${this.rest}, '${this.username}', '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',${this.charge},'${this.month.replace(/\'/g, "''")}', ${this.instructor_id})`;

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
            INSERT INTO payment_instructor (id, amount,rest, username, date, comment, charge, month, instructor_id)
            VALUES(${this.id},${this.amount}, ${this.rest}, '${this.username}', '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',${this.charge},'${this.month.replace(/\'/g, "''")}', ${this.instructor_id})`;

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
            UPDATE payment_instructor
               SET amount = ${this.amount}, error = ${this.error}, date = '${this.date}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', charge = ${this.charge}
               , month = '${this.month ? this.month.replace(/\'/g, "''") : ''}', instructor_id = '${this.instructor_id}'
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
            DELETE FROM payment_instructor WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment_instructor to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static getPaymentInstructorDueBySessionToDate(instructor: number,session: number,seance_fees: number): Promise<number> {
        const sql = `
            select count(a.*)*${seance_fees} attendances from attendance a join session s on a.session_id = s.id
            where a.session_id = ${session} and s.instructor_id = ${instructor}`;

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

    public static getPaymentInstructorDoneBySessionToDate(instructor: number,session: number): Promise<number> {
        const sql = `
                select sum(p.amount) payments from payment_instructor p join charge_instructor c on p.charge = c.id 
                where p.instructor_id = ${instructor} and c.session = ${session}
                `;

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

    public static getChargeDoneBySessionToDate(instructor: number,session: number): Promise<number> {
        const sql = `
                select sum(c.amount) charges from charge_instructor c where c.instructor = ${instructor} and c.session = ${session}`;

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

    public fromRow(row: object): Payment_instructor {
        this.id = row['id'];
        this.amount = row['amount'];
        this.rest = row['rest'];
        this.username = row['username'];
        this.error = row['error'];
        this.date = row['date'];
        this.comment = row['comment'];
        this.month = row['month'];
        this.charge = row['charge'];
        this.instructor_id = row['instructor_id'];
        this['instructor'] = row['instructor'];
        this['sold'] = row['sold']
        this['session_name'] = row['session_name'];
        return this;
    }

}
