import { TheDb } from './thedb';
import {Intern} from "./intern";
import {Session} from "./session";
import {Weekday} from "./weekday";
import {Settings} from "./settings";


/**
 * class for selecting, inserting, updating and deleting Attendances in attendance table.
 *
 * @export
 * @class Attendance
 */
export class Attendance {
    public id = -1;
    public date: Date | number;
    public present: number | boolean = 2;
    public intern_id: Intern | number;
    public session_id: Session | number;
    public weekday_id: Weekday | number;


    public static getCount(filter: string): Promise<Attendance[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "attendance" WHERE  
                                        date LIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static getCountByWeekday(weekday: number): Promise<Attendance[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "attendance" AS a INNER JOIN weekday AS w ON a.weekday_id = w.id
                                                   INNER JOIN session AS s ON a.session_id = s.id
                                                   INNER JOIN intern AS i ON a.intern_id = i.id
                                          
                                                   WHERE a.weekday_id = ${weekday}
                                                   GROUP by a.date`, {})
            .then((count: any) => count);
    }

    public static getCountByInstructor(instructor: number): Promise<Attendance[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "attendance" AS a INNER JOIN weekday AS w ON a.weekday_id = w.id
                                                   INNER JOIN session AS s ON a.session_id = s.id
                                                   INNER JOIN intern AS i ON a.intern_id = i.id
                                          
                                                   WHERE s.instructor_id = ${instructor}
                                                   GROUP by a.date`, {})
            .then((count: any) => count);
    }

    public static getCountByIntern(intern: number): Promise<Attendance[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "attendance" AS a INNER JOIN weekday AS w ON a.weekday_id = w.id
                                                   INNER JOIN session AS s ON a.session_id = s.id
                                                   INNER JOIN intern AS i ON a.intern_id = i.id
                                                
                                                   WHERE i.id = ${intern}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Attendance> {
        const sql = `SELECT * FROM "attendance" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Attendance().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Attendance. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Attendance[]> {
        const sql = `SELECT * FROM "attendance" ORDER BY date DESC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attendance[] = [];
                for (const row of rows) {
                    const attendance = new Attendance().fromRow(row);
                    users.push(attendance);
                }
                return users;
            });
    }

    public static getCountByMonth(session: number, start: number, end: number): Promise<Attendance> {
        const whereDate = Settings.isDbLocal ? `a.date between ${start} and ${end}` : `a.date between '${start}' and '${end}'`;
        const sql = `SELECT count(a.id) as count FROM "attendance" as a 
                                    inner join "session" as s on a.session_id = s.id
                                    where s.id = ${session}  and
                                    ${whereDate} and
                                    a.present != 2`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Attendance().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Attendance. Found 0.');
                }
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Attendance[]> {
        const sql = `SELECT a.id, a.date, a.present, a.weekday_id, a.session_id, a.intern_id, w.time, r.number ,s.name as session, t.name as training, ins.name as instructor, i.name as intern 
                                                    FROM "attendance" AS a INNER JOIN "weekday" AS w ON a.weekday_id = w.id
                                                   INNER JOIN "session" AS s ON a.session_id = s.id
                                                   INNER JOIN "intern" AS i ON a.intern_id = i.id
                                                   INNER JOIN "room" AS r ON w.room_id = r.id
                                                     INNER JOIN "training" AS t ON s.training_id = t.id
                                                    INNER JOIN "instructor" AS ins ON s.instructor_id = ins.id
                                                   WHERE a.date LIKE '%${filter}%' OR 
                            w.name LIKE '%${filter}%' OR
                            s.name LIKE '%${filter}%' OR
                            i.name LIKE '%${filter}%'
                           
                            ORDER BY a.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attendance[] = [];
                for (const row of rows) {
                    const attendance = new Attendance().fromRow(row);
                    users.push(attendance);
                }
                return users;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, instructor: number): Promise<Attendance[]> {
        const groupBy = Settings.isDbLocal ? 'a.date' : 'a.id, a.date, w.time, r.number, s.name, t.name, ins.name, i.name';
        const sql = `SELECT a.id, a.date, a.present, a.weekday_id, a.session_id, a.intern_id, w.time, r.number,s.name as session, t.name as training, ins.name as instructor, i.name as intern 
                                                    FROM "attendance" AS a INNER JOIN weekday AS w ON a.weekday_id = w.id
                                                   INNER JOIN session AS s ON a.session_id = s.id
                                                   INNER JOIN intern AS i ON a.intern_id = i.id
                                                     INNER JOIN room AS r ON w.room_id = r.id
                                                       INNER JOIN training AS t ON s.training_id = t.id
                                                    INNER JOIN instructor AS ins ON s.instructor_id = ins.id
                                                   WHERE s.instructor_id = ${instructor}
                                                   GROUP by ${groupBy}
                            ORDER BY a.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {};
        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attendance[] = [];
                for (const row of rows) {
                    const attendance = new Attendance().fromRow(row);
                    users.push(attendance);
                }
                return users;
            });
    }

    public static getAllPagedByWeekday(pageIndex: number, pageSize: number, sort: string, order: string, weekday: number): Promise<Attendance[]> {
        const groupBy = Settings.isDbLocal ? 'a.date' : 'a.id, a.date, w.time, r.number, s.name, t.name, ins.name, i.name';
        const sql = `SELECT a.id, a.date, a.present, a.weekday_id, a.session_id, a.intern_id, w.time, r.number, s.name as session, t.name as training, ins.name as instructor, i.name as intern 
                                                    FROM "attendance" AS a INNER JOIN weekday AS w ON a.weekday_id = w.id
                                                   INNER JOIN session AS s ON a.session_id = s.id
                                                   INNER JOIN intern AS i ON a.intern_id = i.id
                                                    INNER JOIN room AS r ON w.room_id = r.id
                                                    INNER JOIN training AS t ON s.training_id = t.id
                                                    INNER JOIN instructor AS ins ON s.instructor_id = ins.id
                                                   WHERE a.weekday_id = ${weekday}
                                                   GROUP by ${groupBy}
                            ORDER BY a.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {};
        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attendance[] = [];
                for (const row of rows) {
                    const attendance = new Attendance().fromRow(row);
                    users.push(attendance);
                }
                return users;
            });
    }

    public static getAllPagedByIntern(pageIndex: number, pageSize: number, sort: string, order: string, intern: number): Promise<Attendance[]> {
        const sql = `SELECT a.id, a.date, a.present, a.weekday_id, a.session_id, a.intern_id , w.time, r.number, s.name as session, t.name as training, ins.name as instructor, i.name as intern 
                                                    FROM "attendance" AS a INNER JOIN weekday AS w ON a.weekday_id = w.id
                                                   INNER JOIN session AS s ON a.session_id = s.id
                                                   INNER JOIN intern AS i ON a.intern_id = i.id
                                                     INNER JOIN room AS r ON w.room_id = r.id
                                                       INNER JOIN training AS t ON s.training_id = t.id
                                                    INNER JOIN instructor AS ins ON s.instructor_id = ins.id
                                                   WHERE i.id = ${intern}
                            ORDER BY a.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {};
        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attendance[] = [];
                for (const row of rows) {
                    const attendance = new Attendance().fromRow(row);
                    users.push(attendance);
                }
                return users;
            });
    }

    public static getAlldByIntern(id: number): Promise<Attendance[]> {
        const sql = `SELECT a.* FROM "attendance" AS a INNER JOIN weekday AS w ON a.weekday_id = w.id                                            
                                                   INNER JOIN intern AS i ON a.intern_id = i.id
                                                   WHERE i.id = ${id}`

        const values = {};
        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attendance[] = [];
                for (const row of rows) {
                    const attendance = new Attendance().fromRow(row);
                    users.push(attendance);
                }
                return users;
            });
    }

    public static getAllBySession(id: number): Promise<Attendance[]> {
        const sql = `SELECT a.date  FROM "attendance" AS a INNER JOIN session AS s ON a.session_id = s.id 
                                                   INNER JOIN weekday AS w ON a.weekday_id = w.id                                            
                                                   INNER JOIN intern AS i ON a.intern_id = i.id
                                                   WHERE s.id = ${id}
                                                   GROUP BY a.date`

        const values = {};
        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Attendance[] = [];
                for (const row of rows) {
                    const attendance = new Attendance().fromRow(row);
                    users.push(attendance);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "attendance" (date, present, intern_id, session_id, weekday_id)
            VALUES('${this.date}',${this.present}, ${this.intern_id}, ${this.session_id}, ${this.weekday_id})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Attendance to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "attendance"
               SET date = '${this.date}', present = ${this.present}, intern_id = ${this.intern_id} ,session_id = ${this.session_id}, weekday_id = ${this.weekday_id}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Attendance to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "attendance" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Attendance to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Attendance {
        this.id = row['id'];
        this.date = row['date'];
        this.present = row['present'];
        this.intern_id = row['intern_id'];
        this.session_id = row['session_id'];
        this.weekday_id = row['weekday_id'];
        this['count'] =  row['count'];
        this['time'] =  row['time'];
        this['number'] = row['number'];
        this['session'] = row['session'];
        this['training'] = row['training'];
        this['instructor'] = row['instructor'];
        this['intern'] = row['intern'];
        return this;
    }
}
