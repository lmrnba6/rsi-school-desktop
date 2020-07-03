import { TheDb } from './thedb';
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting registers in register table.
 *
 * @export
 * @class Register
 */
export class Register {
    public id = -1;
    public amount: number;
    public date: Date| number;
    public comment = '';
    public training = '';
    public intern = '';
    public sold = 0;
    public responsible = ''
    public rest = 0;
    public username = '';


    public static getCount(filter: string): Promise<Register[]> {
        const sql = Settings.isDbLocal ? `SELECT count(*) as count FROM "register" WHERE amount LIKE '%${filter}%' OR 
                                        date LIKE '%${filter}%'` :
            `SELECT count(*) as count FROM "register" AS p 
                            WHERE                         
                            p.comment ILIKE '%${filter}%'`;
        return TheDb.selectAll(sql, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Register> {
        const sql = `SELECT * FROM "register" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Register().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Register. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Register[]> {
        const sql = `SELECT * FROM "register" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const registers: Register[] = [];
                for (const row of rows) {
                    const register = new Register().fromRow(row);
                    registers.push(register);
                }
                return registers;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, start: number, end: number): Promise<Register[]> {
        const sql = Settings.isDbLocal ? `SELECT p.id, p.amount, p.date, p.comment,p.responsible, p.intern, p.training, p.sold, p.rest 
                            FROM "register" AS p 
                            WHERE 
                            p.comment LIKE '%${filter}%' and p.date between '${start}' and '${end}'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.intern, p.training, p.sold, p.rest, p.username, p.responsible 
                            FROM "register" AS p 
                            WHERE                            
                            (p.comment ILIKE '%${filter}%' or p.intern ILIKE '%${filter}%' or p.training ILIKE '%${filter}%') 
                            and p.date between '${start}' and '${end}'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const registers: Register[] = [];
                for (const row of rows) {
                    const register = new Register().fromRow(row);
                    registers.push(register);
                }
                return registers;
            });
    }

    public static getAllPagedRecipes(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, start: number, end: number): Promise<Register[]> {
        const sql = Settings.isDbLocal ? `SELECT p.id, p.amount, p.date, p.comment,p.responsible, p.intern, p.training, p.sold, p.rest 
                            FROM "register" AS p 
                            WHERE 
                            p.comment LIKE '%${filter}%' and p.date between '${start}' and '${end}' and p.amount > 0
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.intern, p.training, p.sold, p.rest, p.username, p.responsible 
                            FROM "register" AS p 
                            WHERE                            
                            (p.comment ILIKE '%${filter}%' or p.intern ILIKE '%${filter}%' or p.training ILIKE '%${filter}%') 
                            and p.date between '${start}' and '${end}' and p.amount > 0
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const registers: Register[] = [];
                for (const row of rows) {
                    const register = new Register().fromRow(row);
                    registers.push(register);
                }
                return registers;
            });
    }

    public static getAllPagedExpenses(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, start: number, end: number): Promise<Register[]> {
        const sql = Settings.isDbLocal ? `SELECT p.id, p.amount, p.date, p.comment,p.responsible, p.intern, p.training, p.sold, p.rest 
                            FROM "register" AS p 
                            WHERE 
                            p.comment LIKE '%${filter}%' and p.date between '${start}' and '${end}' and p.amount < 0
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}` :
            `SELECT p.id, p.amount, p.date, p.comment, p.intern, p.training, p.sold, p.rest, p.username, p.responsible 
                            FROM "register" AS p 
                            WHERE                            
                            (p.comment ILIKE '%${filter}%' or p.intern ILIKE '%${filter}%' or p.training ILIKE '%${filter}%') 
                            and p.date between '${start}' and '${end}'  and p.amount < 0
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const registers: Register[] = [];
                for (const row of rows) {
                    const register = new Register().fromRow(row);
                    registers.push(register);
                }
                return registers;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "register" (amount, date, responsible, comment, intern, training, sold, rest, username)
            VALUES(${this.amount}, '${this.date}','${this.responsible}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', 
            '${this.intern}', '${this.training}', ${this.sold}, ${this.rest}, '${this.username}')`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Register to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "register"
               SET amount = ${this.amount}, date = '${this.date}',responsible = '${this.responsible}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', 
               intern = '${this.intern}', training = '${this.training}', sold = ${this.sold}, rest = ${this.rest}, username = '${this.username}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Register to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "register" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Register to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Register {
        this.id = row['id'];
        this.amount = row['amount'];
        this.date = row['date'];
        this.comment = row['comment'];
        this.intern = row['intern'];
        this.responsible = row['responsible'];
        this.training = row['training'];
        this.sold = row['sold'];
        this.rest = row['rest'];
        this.username = row['username'];
        return this;
    }

}
