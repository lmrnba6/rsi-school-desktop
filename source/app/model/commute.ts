import { TheDb } from './thedb';
import {Intern} from "./intern";
import {Transport} from "./transport";

/**
 * class for selecting, inserting, updating and deleting Commutes in commute table.
 *
 * @export
 * @class Commute
 */
export class Commute {
    public id = -1;
    public address = '';
    public comment = '';
    public intern: number | Intern;
    public transport: number | Transport;


    public static getCount(filter: string, intern: number): Promise<Commute[]> {
        return TheDb.selectAll(`SELECT count(*) as count
                    FROM "commute" as x 
                            INNER JOIN intern as i ON i.id = x.intern
                            INNER JOIN transport as t ON t.id = x.transport 
                            INNER JOIN car as c ON c.id = t.car 
                            WHERE
                            (x.address ILIKE '%${filter}%' OR                 
                            x.comment ILIKE '%${filter}%') AND i.id = ${intern}
                            `, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Commute> {
        const sql = `SELECT x.*, t.time, t.day,t.direction FROM "commute" as x
                        INNER JOIN transport as t ON t.id = x.transport 
                        INNER JOIN car as c ON t.car = c.id
                        WHERE x.id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Commute().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Commute. Found 0.');
                }
            });
    }

    public static exist(intern: number, transport: number): Promise<Commute> {
        const sql = `SELECT * FROM "commute" as c
                        INNER JOIN transport as t ON c.transport = t.id
                        INNER JOIN intern as i ON c.intern = i.id  
                        WHERE t.id = ${transport} and i.id = ${intern}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Commute().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Commute. Found 0.');
                }
            });
    }


    public static getAllByIntern(id: number): Promise<Commute[]> {
        const sql = `SELECT t.* FROM "commute" as c 
                        INNER JOIN intern as i ON i.id = c.intern
                        INNER JOIN transport as t ON t.id = c.transport
                        WHERE i.id = ${id}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Commute[] = [];
                for (const row of rows) {
                    const commute = new Commute().fromRow(row);
                    users.push(commute);
                }
                return users;
            });
    }



    public static getAll(): Promise<Commute[]> {
        const sql = `SELECT * FROM "commute"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Commute[] = [];
                for (const row of rows) {
                    const commute = new Commute().fromRow(row);
                    users.push(commute);
                }
                return users;
            });
    }

    public static getAllPagedInternsByTransport(filter: string, transport: number): Promise<Commute[]> {
        const sql = `SELECT x.*, i.name, i.phone
                    FROM "commute" as x
                            INNER JOIN intern as i ON i.id = x.intern
                            INNER JOIN transport as t ON t.id = x.transport
                            INNER JOIN car as c ON c.id = t.car
                            WHERE
                            (i.name ILIKE '%${filter}%' OR                 
                            i.phone ILIKE '%${filter}%' OR 
                            x.address ILIKE '%${filter}%') AND
                            t.id = ${transport}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Commute[] = [];
                for (const row of rows) {
                    const commute = new Commute().fromRow(row);
                    users.push(commute);
                }
                return users;
            });
    }

    public static getAllPagedByDayAndCar(pageIndex: number, pageSize: number, sort: string, order: string, day: string, car: number, direction: string): Promise<Commute[]> {
        const carWhere = car ? `AND t.car = ${car}` : '';
        const directionWhere = direction ? `AND t.direction = '${direction}'` : '';
        const sql = `SELECT t.id, t.time,t.day, t.direction, c.name as car_name, c.make as car_make,c.seat, count(i.id) as interns
                    FROM "commute" as x 
                            INNER JOIN intern as i ON i.id = x.intern
                            INNER JOIN transport as t ON t.id = x.transport 
                            INNER JOIN car as c ON c.id = t.car 
                            WHERE
                            t.day = '${day}'
                            ${carWhere}
                            ${directionWhere}
                            group by t.id,t.time, t.direction, c.name, c.make, c.seat 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Commute[] = [];
                for (const row of rows) {
                    const commute = new Commute().fromRow(row);
                    users.push(commute);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, intern: number): Promise<Commute[]> {
        const sql = `SELECT x.*, t.time, t.day, t.direction, c.name as car_name, c.make as car_make
                    FROM "commute" as x 
                            INNER JOIN intern as i ON i.id = x.intern
                            INNER JOIN transport as t ON t.id = x.transport 
                            INNER JOIN car as c ON c.id = t.car 
                            WHERE
                            (x.address ILIKE '%${filter}%' OR                 
                            x.comment ILIKE '%${filter}%') AND i.id = ${intern}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Commute[] = [];
                for (const row of rows) {
                    const commute = new Commute().fromRow(row);
                    users.push(commute);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "commute" (intern, address, transport, comment)
            VALUES(${this.intern}, '${this.address}',${this.transport}, '${this.comment ? this.comment.replace(/\'/g, "''") : ''}')`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Commute to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "commute"
               SET intern = '${this.intern}', address = '${this.address}', transport = ${this.transport}, comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Commute to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "commute" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Commute to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Commute {
        this.id = row['id'];
        this['time'] = row['time'];
        this['day'] = row['day'];
        this['direction'] = row['direction'];
        this.comment = row['comment'];
        this['car_name'] = row['car_name'];
        this['car_make'] = row['car_make'];
        this.intern = row['intern'];
        this['interns'] = row['interns'];
        this['seat'] = row['seat'];
        this.transport = row['transport'];
        this.address = row['address'];
        this['name'] = row['name'];
        this['phone'] = row['phone'];
        return this;
    }
}
