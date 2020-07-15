import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Cars in car table.
 *
 * @export
 * @class Car
 */
export class Car {
    public id = -1;
    public name = '';
    public make = '';
    public seat = 0;
    public comment = '';
    public plate = '';



    public static getCount(filter: string): Promise<Car[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "car" WHERE 
                            name ILIKE '%${filter}%' OR 
                            make ILIKE '%${filter}%' OR  
                            plate ILIKE '%${filter}%' OR                          
                            comment ILIKE '%${filter}%' `, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Car> {
        const sql = `SELECT * FROM "car" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Car().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Car. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Car[]> {
        const sql = `SELECT * FROM "car"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Car[] = [];
                for (const row of rows) {
                    const car = new Car().fromRow(row);
                    users.push(car);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Car[]> {
        const sql = `SELECT * FROM "car" WHERE 
                            name ILIKE '%${filter}%' OR 
                            make ILIKE '%${filter}%' OR  
                            plate ILIKE '%${filter}%' OR                          
                            comment ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Car[] = [];
                for (const row of rows) {
                    const car = new Car().fromRow(row);
                    users.push(car);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "car" (name, make, plate, seat, comment)
            VALUES('${this.name}', '${this.make}','${this.plate}', ${this.seat}, '${this.comment ? this.comment.replace(/\'/g, "''") : ''}')`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Car to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "car"
               SET name = '${this.name}', make = '${this.make}', plate = '${this.plate}', seat= ${this.seat}, comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Car to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "car" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Car to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Car {
        this.id = row['id'];
        this.name = row['name'];
        this.make = row['make'];
        this.seat = row['seat'];
        this.comment = row['comment'];
        this.plate = row['plate'];
        return this;
    }
}
