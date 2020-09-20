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
    public date: Date| number;
    public phone = '';



    public static getCount(filter: string): Promise<Visitor[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "visitor" WHERE name ILIKE '%${filter}%' OR 
                            phone ILIKE '%${filter}%' OR                          
                            comment ILIKE '%${filter}%' `, {})
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
        const sql = `SELECT * FROM "visitor" WHERE name ILIKE '%${filter}%' OR 
                            phone ILIKE '%${filter}%' OR                          
                            comment ILIKE '%${filter}%' 
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

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "visitor" (name, phone, comment, date)
            VALUES('${this.name}', '${this.phone}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', '${this.date}') RETURNING *`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Visitor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "visitor" (id,name, phone, comment, date)
            VALUES(${this.id},'${this.name}', '${this.phone}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', '${this.date}') RETURNING *`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Visitor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "visitor"
               SET name = '${this.name}', date = '${this.date}', phone = '${this.phone}', comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'   
             WHERE id = ${this.id} RETURNING *`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Visitor to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "visitor" WHERE id = ${id} RETURNING *`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
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
        this.date = row['date'];
        return this;
    }
}
