import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Trainings in training table.
 *
 * @export
 * @class Training
 */
export class Training {
    public id = -1;
    public name = '';
    public time = '';
    public type = '';
    public training_fees = 0;
    public books_fees = 0;
    public enrollment_fees = 0;

    public static getCount(filter: string): Promise<Training[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "training" WHERE name ILIKE '%${filter}%' OR 
                                        time ILIKE '%${filter}%' OR type ILIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Training> {
        const sql = `SELECT * FROM "training" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Training().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Training. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Training[]> {
        const sql = `SELECT * FROM "training" ORDER BY name`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Training[] = [];
                for (const row of rows) {
                    const training = new Training().fromRow(row);
                    users.push(training);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Training[]> {
        const sql = `SELECT * FROM "training" WHERE name ILIKE '%${filter}%' OR 
                            time ILIKE '%${filter}%' OR
                            type ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Training[] = [];
                for (const row of rows) {
                    const training = new Training().fromRow(row);
                    users.push(training);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "training" (name, time, type, training_fees, books_fees, enrollment_fees)
            VALUES('${this.name}', '${this.time}', '${this.type}', ${this.training_fees}, ${this.books_fees}, ${this.enrollment_fees})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Training to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "training"
               SET name = '${this.name}', time = '${this.time}', type = '${this.type}', 
               training_fees = ${this.training_fees}, books_fees = ${this.books_fees}, enrollment_fees = ${this.enrollment_fees}
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Training to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "training" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Training to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Training {
        this.id = row['id'];
        this.name = row['name'];
        this.time = row['time'];
        this.type = row['type'];
        this.training_fees = row['training_fees'];
        this.books_fees = row['books_fees'];
        this.enrollment_fees = row['enrollment_fees'];
        return this;
    }
}
