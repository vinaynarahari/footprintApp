import { pool } from '../config/database';

export interface User {
    id: number;
    email: string;
    password: string;
    full_name: string;
    created_at: Date;
    updated_at: Date;
}

export const UserModel = { 
    //create new user
    async create(email: string, passwordHash: string, fullName: string): Promise<User> {
        const query = `
            INSERT INTO users (email, password, full_name)
            VALUES ($1, $2, $3)
            RETURNING id, email, full_name, created_at, updated_at;
        `;
        const values = [email, passwordHash, fullName];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    //find user by email
    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT id, email, password, full_name, created_at, updated_at FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    },

    //find user by id
    async findByID(id: number): Promise<User | null> {
        const query = 'SELECT id, email, password, full_name, created_at, updated_at FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }
}; 