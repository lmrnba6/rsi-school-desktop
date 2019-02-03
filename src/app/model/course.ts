import { TheDb } from './thedb';
import {Training} from "./training";

/**
 * class for selecting, inserting, updating and deleting Courses in course table.
 *
 * @export
 * @class Course
 */
export class Course {
    public id = -1;
    public name = '';
    public time = '';
    public training_id: number | Training;

    public static getCount(filter: string): Promise<Course[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM course WHERE name LIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Course> {
        const sql = `SELECT c.id, c.name as cname, c.time, c.training_id FROM course AS c WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Course().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Course. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Course[]> {
        const sql = `SELECT c.id, c.name as cname, c.time, c.training_id FROM course AS c`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Course[] = [];
                for (const row of rows) {
                    const course = new Course().fromRow(row);
                    users.push(course);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Course[]> {
        const sql = `SELECT  c.id, c.name as cname, c.time, c.training_id, t.name  FROM course AS c INNER JOIN training AS t ON c.training_id = t.id WHERE c.name LIKE '%${filter}%' OR t.name LIKE '%${filter}%'                          
                            ORDER BY c.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Course[] = [];
                for (const row of rows) {
                    const course = new Course().fromRow(row);
                    users.push(course);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO course (name, time, training_id)
            VALUES('${this.name}', '${this.time}', '${this.training_id}')`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Course to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE course
               SET name = '${this.name}', time = '${this.time}', training_id = '${this.training_id}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Course to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM course WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Course to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Course {
        this.id = row['id'];
        this.name = row['cname'];
        this.training_id = row['training_id'];
        this.time = row['time'];
        return this;
    }
}
