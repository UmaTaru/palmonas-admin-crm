import { pool } from "../database/pool";

class ConfigService {
  private configMap: Map<string, string> = new Map();

  async load() {
    const { rows } = await pool.query(
      "SELECT name, value FROM app_config WHERE status = 'active'"
    );

    rows.forEach((row) => {
      this.configMap.set(row.name, row.value);
    });

    console.log("✅ Config loaded into memory");
  }

  get(key: string): string | undefined {
    return this.configMap.get(key);
  }
}

export const configService = new ConfigService();
