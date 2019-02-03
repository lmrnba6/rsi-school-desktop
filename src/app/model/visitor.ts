import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Visitors in visitor table.
 *
 * @export
 * @class Visitor
 */
export class Visitor {
    public id = -1;
    public name = '';
    public comment = '';
    public phone = '';



    public static getCount(filter: string): Promise<Visitor[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "visitor" WHERE name LIKE '%${filter}%' OR 
                                        phone LIKE '%${filter}%' OR comment LIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Visitor> {
        const sql = `SELECT * FROM "visitor" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Visitor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Visitor. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Visitor[]> {
        const sql = `SELECT * FROM "visitor"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Visitor[] = [];
                for (const row of rows) {
                    const visitor = new Visitor().fromRow(row);
                    users.push(visitor);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Visitor[]> {
        const sql = `SELECT * FROM "visitor" WHERE name LIKE '%${filter}%' OR 
                            phone LIKE '%${filter}%' OR                          
                            comment LIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Visitor[] = [];
                for (const row of rows) {
                    const visitor = new Visitor().fromRow(row);
                    users.push(visitor);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "visitor" (name, phone, comment)
            VALUES('${this.name}', '${this.phone}', '${this.comment}')`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Visitor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "visitor"
               SET name = '${this.name}', phone = '${this.phone}', comment = ${this.comment}   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Visitor to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "visitor" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Visitor to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Visitor {
        this.id = row['id'];
        this.name = row['name'];
        this.phone = row['phone'];
        this.comment = row['comment'];
        return this;
    }
}
