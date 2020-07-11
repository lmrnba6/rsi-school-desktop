import { TheDb } from './thedb';
import {Instructor} from "./instructor";
import {Training} from "./training";
import {Settings} from "./settings";

/**
 * class for selecting, inserting, updating and deleting Sessions in session table.
 *
 * @export
 * @class Session
 */
export class Session {
    public id = -1;
    public name = '';
    public start: Date | number;
    public end: Date | number ;
    public limit: number ;
    public instructor_id: number | Instructor;
    public training_id: number | Training;
    public closed: boolean = false;


    public static getCount(filter: string): Promise<Session[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "session" AS s 
                                                INNER JOIN "instructor" AS i ON s.instructor_id = i.id
                                                INNER JOIN "training" as t ON s.training_id = t.id
                                                WHERE s.name ILIKE '%${filter}%' OR
                                                                            
                            i.name ILIKE '%${filter}%' OR                         
                            t.name ILIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static getCountByInstructor(instructor: number): Promise<Session[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "session" AS s INNER JOIN "instructor" AS i ON s.instructor_id = i.id
                                                INNER JOIN "training" as t ON s.training_id = t.id
                                                WHERE i.id = ${instructor}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Session> {
        const sql = `SELECT * FROM "session" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Session().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Session. Found 0.');
                }
            });
    }

    public static nameExist(name: string) {
        const sql = `SELECT * FROM "session" WHERE name = '${name}'`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    throw new Error('duplicated name');
                } else {
                    return null;
                }
            });
    }

    public static getAll(): Promise<Session[]> {
        const sql = `SELECT s.*, t.name as training, i.name as instructor, t.type as type
                        FROM "session" as s 
                        inner join "training" as t on s.training_id = t.id
                        inner join "instructor" as i on s.instructor_id = i.id `;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const session = new Session().fromRow(row);
                    users.push(session);
                }
                return users;
            });
    }

    public static getAllGroupByInstructor(date1: number, date2: number): Promise<Session[]> {
        const sql = `SELECT t.name, count(t.id) as instructors FROM "session" as s 
				inner join "training" as t on s.training_id = t.id
                inner join "instructor" as i on s.instructor_id = i.id 
                where s.start between '${date1}' and '${date2}'
                group by t.name;`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const session = new Session().fromRow(row);
                    users.push(session);
                }
                return users;
            });
    }

    public static getAllSessionsByInstructor(id: number): Promise<Session[]> {
        const sql = `SELECT s.id FROM "session" as s 
				inner join "training" as t on s.training_id = t.id
                inner join "instructor" as i on s.instructor_id = i.id 
                where i.id = ${id}`
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const session = new Session().fromRow(row);
                    users.push(session);
                }
                return users;
            });
    }


    public static getAllOpenSessions(): Promise<Session[]> {
        const sql = Settings.isDbLocal ? `SELECT s.*, ins.name as instructor, t.name as training, count(i.id) as interns FROM "session" as s 
				left join "enrollment" as e On e.session_id = s.id 
				left join "training" as t on s.training_id = t.id
                left join "intern" as i on e.intern_id = i.id
                left join "instructor" as ins on s.instructor_id = ins.id
                group by s.name
                having s.\`limit\`> interns` :
            `SELECT s.*, ins.name as instructor, t.name as training, count(i.id) as interns FROM "session" as s 
				left join "enrollment" as e On e.session_id = s.id 
				left join "training" as t on s.training_id = t.id
                left join "intern" as i on e.intern_id = i.id
                left join "instructor" as ins on s.instructor_id = ins.id
                group by s.id, instructor, training
                having s."limit"> count(i.id)`
        ;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const session = new Session().fromRow(row);
                    users.push(session);
                }
                return users;
            });
    }


    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Session[]> {
        const sql =
            `with x as (SELECT s.id, count(e.id) as interns
                                                FROM "session" AS s 
            left JOIN enrollment as e on e.session_id = s.id
                                                INNER JOIN "instructor" AS i ON s.instructor_id = i.id
                                                INNER JOIN "training" as t ON s.training_id = t.id
                                                group by  s.id)

                                                (SELECT s.id, s.name, s.start, s.closed, s."end", s."limit", s.instructor_id, s.training_id, x.interns,
                                                i.name as instructor, t.name as training,  
                                                STRING_AGG(w.name || ' ' || w.time || ' ' || s.name || ' ' || r.number, '---') as weekdays
                                                                                FROM "session" AS s 
                                                join x on x.id = s.id
                                                LEFT JOIN weekday as w on w.session_id = s.id
                                                LEFT JOIN "instructor" AS i ON s.instructor_id = i.id
                                                LEFT JOIN "training" as t ON s.training_id = t.id
                                                LEFT JOIN "room" as r ON w.room_id = r.id

                                                WHERE s.name ILIKE '%${filter}%' OR                                                                        
                                                i.name ILIKE '%${filter}%' OR                         
                                                t.name ILIKE '%${filter}%'
                                                
                            group by s.id, s.name, s.start, s.closed, s."end", s."limit", s.instructor_id, s.training_id, i.name, t.name, x.interns
                            ORDER BY s.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex})`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const session = new Session().fromRow(row);
                    users.push(session);
                }
                return users;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, instructor: number): Promise<Session[]> {
        const sql =
            `with x as (SELECT s.id, count(e.id) as interns
                                                FROM "session" AS s 
            left JOIN enrollment as e on e.session_id = s.id
                                                INNER JOIN "instructor" AS i ON s.instructor_id = i.id
                                                INNER JOIN "training" as t ON s.training_id = t.id
                                                group by  s.id)

                                                (SELECT s.id, s.name, s.start, s.closed, s."end", s."limit", s.instructor_id, s.training_id, x.interns,
                                                i.name as instructor, t.name as training,  
                                                STRING_AGG(w.name || ' ' || w.time || ' ' || s.name || ' ' || r.number, '---') as weekdays
                                                                                FROM "session" AS s 
                                                join x on x.id = s.id
                                                LEFT JOIN weekday as w on w.session_id = s.id
                                                LEFT JOIN "instructor" AS i ON s.instructor_id = i.id
                                                LEFT JOIN "training" as t ON s.training_id = t.id
                                                LEFT JOIN "room" as r ON w.room_id = r.id
                                                WHERE i.id = ${instructor}
                                                
                            group by s.id, s.name, s.start, s.closed, s."end", s."limit", s.instructor_id, s.training_id, i.name, t.name, x.interns
                            ORDER BY s.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex})`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const session = new Session().fromRow(row);
                    users.push(session);
                }
                return users;
            });
    }

    public static getAllSessionByRoom(room: number): Promise<Session[]> {
        const sql = `SELECT distinct s.*, t.name as training, ins.name as instructor  FROM "session" AS s 
                                                    INNER JOIN "enrollment" AS e ON e.session_id = s.id
                                                    INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                    INNER JOIN "training" AS t ON training_id = t.id
                                                    INNER JOIN "instructor" AS ins ON instructor_id = ins.id
                                                    INNER JOIN "weekday" AS w ON s.id = w.session_id
                                                  
                                                   WHERE w.room_id = ${room}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const enrollment = new Session().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public static getAllSessionByWeekday(weekday: number): Promise<Session[]> {
        const sql = `SELECT distinct s.*, t.name as training, t.type, ins.name as instructor  FROM "session" AS s 
                                                    INNER JOIN "enrollment" AS e ON e.session_id = s.id
                                                    INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                    INNER JOIN "training" AS t ON training_id = t.id
                                                    INNER JOIN "instructor" AS ins ON instructor_id = ins.id
                                                    INNER JOIN "weekday" AS w ON s.id = w.session_id
                                                  
                                                   WHERE w.id = ${weekday}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const enrollment = new Session().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public static getAllSessionByIntern(intern: number): Promise<Session[]> {
        const sql = `SELECT s.*, t.name as training, t.training_fees, t.books_fees,t.enrollment_fees, ins.name as instructor  FROM "session" AS s 
                                                    INNER JOIN "enrollment" AS e ON e.session_id = s.id
                                                    INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                    INNER JOIN "training" AS t ON training_id = t.id
                                                    INNER JOIN "instructor" AS ins ON instructor_id = ins.id
                                                  
                                                   WHERE i.id = ${intern}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Session[] = [];
                for (const row of rows) {
                    const enrollment = new Session().fromRow(row);
                    users.push(enrollment);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = Settings.isDbLocal ? `
            INSERT INTO "session" (name, start, end,\`limit\`, instructor_id, training_id, closed)
            VALUES('${this.name}', ${this.start}, ${this.end}, ${this.limit}, ${this.instructor_id}, ${this.training_id}, ${this.closed})` :
            `
            INSERT INTO "session" (name, start, "end", "limit", instructor_id, training_id, closed)
            VALUES('${this.name}', ${this.start}, ${this.end}, ${this.limit}, ${this.instructor_id}, ${this.training_id}, ${this.closed})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Session to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = Settings.isDbLocal ? `
            UPDATE "session"
               SET name = '${this.name}', start = ${this.start}, end = ${this.end}, \`limit\` = ${this.limit}, instructor_id = '${this.instructor_id}',
               training_id = '${this.training_id}', closed = ${this.closed}
             WHERE id = ${this.id}` :
            `
            UPDATE "session"
               SET name = '${this.name}', start = ${this.start}, "end" = ${this.end}, "limit" = ${this.limit}, instructor_id = '${this.instructor_id}',
               training_id = '${this.training_id}', closed = ${this.closed}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Session to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "session" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Session to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Session {
        this.id = row['id'];
        this.name = row['name'];
        this.start = row['start'];
        this.end = row['end'];
        this.limit = row['limit'];
        this.instructor_id = row['instructor_id'];
        this.training_id = row['training_id'];
        this['interns'] = row['interns'];
        this['enrollments'] = row['enrollments'];
        this['instructors'] = row['instructors'];
        this['instructor'] = row['instructor'];
        this['training'] = row['training'];
        this['type'] = row['type'];
        this.closed = row['closed'];
        this['weekdays'] = row['weekdays'];
        this['training_fees'] = row['training_fees'];
        this['books_fees'] = row['books_fees'];
        this['enrollment_fees'] = row['enrollment_fees'];
        return this;
    }
}
