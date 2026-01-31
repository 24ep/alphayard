import { query } from '../config/database';

export interface CircleType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export class CircleTypeModel {
  static async findAll(): Promise<CircleType[]> {
    const result = await query(
      'SELECT * FROM circle_types ORDER BY sort_order ASC'
    );
    return result.rows;
  }

  static async findById(id: string): Promise<CircleType | null> {
    const result = await query(
      'SELECT * FROM circle_types WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByCode(code: string): Promise<CircleType | null> {
    const result = await query(
      'SELECT * FROM circle_types WHERE code = $1',
      [code]
    );
    return result.rows[0] || null;
  }

  static async create(data: Partial<CircleType>): Promise<CircleType> {
    const result = await query(
      `INSERT INTO circle_types (name, code, description, icon, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.code, data.description, data.icon, data.sort_order || 0]
    );
    return result.rows[0];
  }

  static async update(id: string, data: Partial<CircleType>): Promise<CircleType | null> {
    const result = await query(
      `UPDATE circle_types 
       SET name = COALESCE($2, name),
           code = COALESCE($3, code),
           description = COALESCE($4, description),
           icon = COALESCE($5, icon),
           sort_order = COALESCE($6, sort_order),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.name, data.code, data.description, data.icon, data.sort_order]
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM circle_types WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
