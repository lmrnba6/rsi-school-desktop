import { TheDb } from './thedb';
import {Car} from "./car";

/**
 * class for selecting, inserting, updating and deleting Transports in transport table.
 *
 * @export
 * @class Transport
 */
export class Transport {
    public id = -1;
    public time = '';
    public day = '';
    public direction = '';
    public comment = '';
    public car: number | Car;



    public static getCount(filter: string): Promise<Transport[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "transport" WHERE 
                            time ILIKE '%${filter}%' OR 
                            day ILIKE '%${filter}%' OR  
                            direction ILIKE '%${filter}%' OR                          
                            comment ILIKE '%${filter}%' `, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Transport> {
        const sql = `SELECT * FROM "transport" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Transport().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Transport. Found 0.');
                }
            });
    }

    public static exist(time: string, day: string, car: number): Promise<Transport> {
        const sql = `SELECT * FROM "transport" as t
                        INNER JOIN car as c ON c.id = t.car 
                        WHERE t.time = '${time}' and t.day = '${day}' and c.id = ${car}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Transport().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Transport. Found 0.');
                }
            });
    }

    public static getAllByCarAndDay(id: number, day: string): Promise<Transport[]> {
        const sql = `SELECT t.* FROM "transport" as t 
                        INNER JOIN car as c ON c.id = t.car
                        WHERE c.id = ${id} and t.day = '${day}'`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Transport[] = [];
                for (const row of rows) {
                    const transport = new Transport().fromRow(row);
                    users.push(transport);
                }
                return users;
            });
    }

    public static getAllNoException(): Promise<Transport[]> {
        const sql = `SELECT * FROM "transport"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Transport[] = [];
                for (const row of rows) {
                    const transport = new Transport().fromRow(row);
                    users.push(transport);
                }
                return users;
            });
    }

    public static getAll(): Promise<Transport[]> {
        const sql = `SELECT t.*, c.name as car_name, c.make as car_make, (c.seat - count(i.id)) as available
                            FROM "commute" as x
                            RIGHT JOIN transport as t ON t.id = x.transport 
                            LEFT JOIN intern as i ON i.id = x.intern
                            INNER JOIN car as c ON c.id = t.car
                            group by t.id, c.name,c.make, c.seat`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Transport[] = [];
                for (const row of rows) {
                    const transport = new Transport().fromRow(row);
                    users.push(transport);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Transport[]> {
        const sql = `SELECT t.*, c.name as car_name, c.make as car_make FROM "transport" as t 
                            INNER JOIN car as c ON c.id = t.car WHERE
                            t.time ILIKE '%${filter}%' OR 
                            t.day ILIKE '%${filter}%' OR  
                            t.direction ILIKE '%${filter}%' OR                          
                            t.comment ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Transport[] = [];
                for (const row of rows) {
                    const transport = new Transport().fromRow(row);
                    users.push(transport);
                }
                return users;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "transport" (time, day, direction, car, comment)
            VALUES('${this.time}', '${this.day}','${this.direction}', ${this.car}, '${this.comment ? this.comment.replace(/\'/g, "''") : ''}')`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transport to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "transport" (id,time, day, direction, car, comment)
            VALUES(${this.id},'${this.time}', '${this.day}','${this.direction}', ${this.car}, '${this.comment ? this.comment.replace(/\'/g, "''") : ''}')`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transport to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "transport"
               SET time = '${this.time}', day = '${this.day}', direction = '${this.direction}', car= ${this.car}, comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transport to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "transport" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transport to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Transport {
        this.id = row['id'];
        this.time = row['time'];
        this.day = row['day'];
        this.direction = row['direction'];
        this.comment = row['comment'];
        this.car = row['car'];
        this['car_name'] = row['car_name'];
        this['car_make'] = row['car_make'];
        this['available'] = row['available'];
        return this;
    }
}
