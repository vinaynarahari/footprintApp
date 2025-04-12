import pool from '../config/database';

export interface BusinessClassification {
  id: number;
  business_name: string;
  industry: string;
  created_at: Date;
  updated_at: Date;
}

export const BusinessModel = {
  async create(businessName: string, industry: string): Promise<BusinessClassification> {
    const query = `
      INSERT INTO business_classifications (business_name, industry)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [businessName, industry];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByBusinessName(businessName: string): Promise<BusinessClassification | null> {
    const query = 'SELECT * FROM business_classifications WHERE business_name = $1';
    const result = await pool.query(query, [businessName]);
    return result.rows[0] || null;
  },

  async getAll(): Promise<BusinessClassification[]> {
    const query = 'SELECT * FROM business_classifications ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
}; 