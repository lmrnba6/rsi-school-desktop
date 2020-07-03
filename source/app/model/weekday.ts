import { TheDb } from './thedb';
import {Session} from "./session";
import {Room} from "./room";

/**
 * class for selecting, inserting, updating and deleting weekdays in weekday table.
 *
 * @export
 * @class Weekday
 */
export class Weekday {
    public id = -1;
    public name: string;
    public time: string;
    public session_id: number | Session;
    public room_id: number | Room;

    public static getCount(filter: string): Promise<Weekday[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id
                            INNER JOIN "training" AS t ON s.training_id = t.id
                            INNER JOIN "instructor" AS i ON s.instructor_id = i.id
                            WHERE (w.name ILIKE '%${filter}%' OR 
                            w.time ILIKE '%${filter}%' OR
                            r.number ILIKE '%${filter}%' OR 
                            s.name ILIKE '%${filter}%')   AND s.closed = false`, {})
            .then((count: any) => count);
    }

    public static getCountByRoom(room: number): Promise<Weekday[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id                         
                            WHERE r.id = ${room} AND s.closed = false`, {})
            .then((count: any) => count);
    }

    public static getCountBySession(session: number): Promise<Weekday[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id                         
                            WHERE s.id = ${session}`, {})
            .then((count: any) => count);
    }

    public static getCountByInstructor(instructor: number): Promise<Weekday[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id                         
                            WHERE s.instructor_id = ${instructor} AND s.closed = false`, {})
            .then((count: any) => count);
    }

    public static getCountByIntern(intern: number): Promise<Weekday[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id
                            INNER JOIN "training" AS t ON s.training_id = t.id
                            INNER JOIN "instructor" AS i ON s.instructor_id = i.id  
                            INNER JOIN "enrollment" AS e ON e.session_id = s.id    
                            INNER JOIN "intern" AS int ON e.intern_id = int.id                               
                            WHERE int.id = ${intern} AND s.closed = false`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Weekday> {
        const sql = `SELECT * FROM "weekday" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Weekday().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Weekday. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Weekday[]> {
        const sql = `SELECT * FROM "weekday" ORDER BY name DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const weekdays: Weekday[] = [];
                for (const row of rows) {
                    const weekday = new Weekday().fromRow(row);
                    weekdays.push(weekday);
                }
                return weekdays;
            });
    }

    public static getAllBySessionAndName(session_id: number, name: string): Promise<Weekday[]> {
        const sql = `SELECT *, w.id as weekday_id FROM "weekday" as w
                             INNER JOIN "session" AS s ON w.session_id = s.id
                                WHERE session_id = ${session_id} 
                                                AND w.name = '${name}' AND s.closed = false ORDER BY w.name DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const weekdays: Weekday[] = [];
                for (const row of rows) {
                    const weekday = new Weekday().fromRow(row);
                    weekdays.push(weekday);
                }
                return weekdays;
            });
    }

    public static getAllByRoomAndName(room: number, name: string): Promise<Weekday[]> {
        const sql = `SELECT * FROM "weekday" as w 
                                INNER JOIN "session" AS s ON w.session_id = s.id 
                                WHERE w.room_id = ${room}
                                             AND w.name = '${name}'
                                             AND s.closed = false
                                                ORDER BY w.name DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const weekdays: Weekday[] = [];
                for (const row of rows) {
                    const weekday = new Weekday().fromRow(row);
                    weekdays.push(weekday);
                }
                return weekdays;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Weekday[]> {
        const sql = `SELECT w.id, w.name, w.time, w.session_id, w.room_id , s.name as session, r.number as room, t.name as training, i.name as instructor 
                            FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id
                            INNER JOIN "training" AS t ON s.training_id = t.id
                            INNER JOIN "instructor" AS i ON s.instructor_id = i.id
                            WHERE (w.name ILIKE '%${filter}%' OR 
                            w.time ILIKE '%${filter}%' OR
                            r.number ILIKE '%${filter}%' OR 
                            s.name ILIKE '%${filter}%')   AND s.closed = false
                            ORDER BY w.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const weekdays: Weekday[] = [];
                for (const row of rows) {
                    const weekday = new Weekday().fromRow(row);
                    weekdays.push(weekday);
                }
                return weekdays;
            });
    }

    public static getAllPagedBySession(pageIndex: number, pageSize: number, sort: string, order: string, session: number): Promise<Weekday[]> {
        const sql = `SELECT w.id, w.name, w.time, w.session_id, w.room_id, s.name as session, r.number as room, t.name as training, i.name as instructor
                            FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id
                            INNER JOIN "training" AS t ON s.training_id = t.id
                            INNER JOIN "instructor" AS i ON s.instructor_id = i.id                         
                            WHERE s.id = ${session}  
                            ORDER BY w.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const weekdays: Weekday[] = [];
                for (const row of rows) {
                    const weekday = new Weekday().fromRow(row);
                    weekdays.push(weekday);
                }
                return weekdays;
            });
    }

    public static getAllPagedByRoom(pageIndex: number, pageSize: number, sort: string, order: string, room: number): Promise<Weekday[]> {
        const sql = `SELECT w.id, w.name, w.time, w.session_id, w.room_id, s.name as session, r.number as room, t.name as training, i.name as instructor 
                            FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id   
                            INNER JOIN "training" AS t ON s.training_id = t.id
                            INNER JOIN "instructor" AS i ON s.instructor_id = i.id                       
                            WHERE r.id = ${room}  AND s.closed = false
                            ORDER BY w.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const weekdays: Weekday[] = [];
                for (const row of rows) {
                    const weekday = new Weekday().fromRow(row);
                    weekdays.push(weekday);
                }
                return weekdays;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, instructor: number): Promise<Weekday[]> {
        const sql = `SELECT w.id, w.name, w.time, w.session_id, w.room_id, s.name as session, r.number as room, t.name as training, i.name as instructor
                            FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id
                            INNER JOIN "training" AS t ON s.training_id = t.id
                            INNER JOIN "instructor" AS i ON s.instructor_id = i.id                           
                            WHERE s.instructor_id = ${instructor} AND s.closed = false
                            ORDER BY w.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const weekdays: Weekday[] = [];
                for (const row of rows) {
                    const weekday = new Weekday().fromRow(row);
                    weekdays.push(weekday);
                }
                return weekdays;
            });
    }

    public static getAllPagedByIntern(pageIndex: number, pageSize: number, sort: string, order: string, intern: number): Promise<Weekday[]> {
        const sql = `SELECT w.id, w.name, w.time, w.session_id, w.room_id, s.name as session, r.number as room, t.name as training, int.name as intern, i.name as instructor
                            FROM "weekday" AS w 
                            INNER JOIN "session" AS s ON w.session_id = s.id
                            INNER JOIN "room" AS r ON w.room_id = r.id
                            INNER JOIN "training" AS t ON s.training_id = t.id
                            INNER JOIN "instructor" AS i ON s.instructor_id = i.id  
                            INNER JOIN "enrollment" AS e ON e.session_id = s.id    
                            INNER JOIN "intern" AS int ON e.intern_id = int.id                      
                            WHERE int.id = ${intern} AND s.closed = false
                            ORDER BY w.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const weekdays: Weekday[] = [];
                for (const row of rows) {
                    const weekday = new Weekday().fromRow(row);
                    weekdays.push(weekday);
                }
                return weekdays;
            });
    }


    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "weekday" (name, time, session_id, room_id)
            VALUES('${this.name}', '${this.time}', ${this.session_id}, ${this.room_id})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Weekday to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "weekday"
               SET name = '${this.name}', time = '${this.time}', session_id = ${this.session_id}, room_id = ${this.room_id}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Weekday to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "weekday" WHERE id = ${id}`;

        const values = {};

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Weekday to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Weekday {
        this.id = row['id'];
        this.name = row['name'];
        this.time = row['time'];
        this['weekday_id'] = row['weekday_id'];
        this.session_id = row['session_id'];
        this.room_id = row['room_id'];
        this['session'] = row['session'];
        this['room'] = row['room'];
        this['instructor'] = row['instructor'];
        this['training'] = row['training'];
        return this;
    }

}
